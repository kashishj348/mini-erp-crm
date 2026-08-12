import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface Product { id: string; name: string; sku: string; category: string; unitPrice: number; currentStock: number; location: string; }

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', sku: '', category: '', unitPrice: '0', currentStock: '0', minStockAlert: '5', location: '' });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      const response = await api.get('/api/products', { params: { page: 1, limit: 20, search } });
      return response.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof form) => api.post('/api/products', { ...payload, unitPrice: Number(payload.unitPrice), currentStock: Number(payload.currentStock), minStockAlert: Number(payload.minStockAlert) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setForm({ name: '', sku: '', category: '', unitPrice: '0', currentStock: '0', minStockAlert: '5', location: '' });
    }
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Products</h2>
            <p className="text-sm text-slate-500">Track pricing, stock, and stock movements</p>
          </div>
          <input className="rounded-lg border px-3 py-2 md:w-72" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}>
          <input className="rounded-lg border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="rounded-lg border px-3 py-2" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
          <input className="rounded-lg border px-3 py-2" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <input className="rounded-lg border px-3 py-2" placeholder="Unit price" type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} required />
          <input className="rounded-lg border px-3 py-2" placeholder="Current stock" type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} required />
          <input className="rounded-lg border px-3 py-2" placeholder="Min stock alert" type="number" value={form.minStockAlert} onChange={(e) => setForm({ ...form, minStockAlert: e.target.value })} required />
          <input className="rounded-lg border px-3 py-2 md:col-span-2" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          {createMutation.isError ? <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{createMutation.error instanceof Error ? createMutation.error.message : 'Unable to create product.'}</div> : null}
          <button className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white md:col-span-2" type="submit" disabled={createMutation.isPending}>Add product</button>
        </form>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        {isLoading ? <p>Loading...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="border-b text-left text-slate-500"><th className="px-3 py-2">Name</th><th className="px-3 py-2">SKU</th><th className="px-3 py-2">Stock</th><th className="px-3 py-2">Price</th></tr></thead>
              <tbody>
                {(data?.items || []).map((product: Product) => (
                  <tr key={product.id} className="border-b">
                    <td className="px-3 py-2">{product.name}<div className="text-xs text-slate-500">{product.category}</div></td>
                    <td className="px-3 py-2">{product.sku}</td>
                    <td className="px-3 py-2">{product.currentStock}</td>
                    <td className="px-3 py-2">${product.unitPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
