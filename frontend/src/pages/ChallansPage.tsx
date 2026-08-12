import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface Customer { id: string; name: string; businessName: string; }
interface Product { id: string; name: string; sku: string; currentStock: number; unitPrice: number; }
interface ChallanItem { productId: string; quantity: number; }

export default function ChallansPage() {
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<ChallanItem[]>([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const queryClient = useQueryClient();

  const { data: customersData } = useQuery({ queryKey: ['customers-list'], queryFn: async () => (await api.get('/api/customers', { params: { page: 1, limit: 50 } })).data.data.items });
  const { data: productsData } = useQuery({ queryKey: ['products-list'], queryFn: async () => (await api.get('/api/products', { params: { page: 1, limit: 50 } })).data.data.items });
  const { data: challansData } = useQuery({ queryKey: ['challans'], queryFn: async () => (await api.get('/api/challans', { params: { page: 1, limit: 20 } })).data.data });

  const createMutation = useMutation({
    mutationFn: async () => api.post('/api/challans', { customerId, items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challans'] });
      setCustomerId('');
      setItems([]);
    }
  });

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/api/challans/${id}/confirm`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['challans'] })
  });

  const createErrorMessage = createMutation.isError
    ? (createMutation.error as any)?.response?.data?.message || 'Unable to create challan.'
    : '';

  const confirmErrorMessage = confirmMutation.isError
    ? (confirmMutation.error as any)?.response?.data?.message || 'Unable to confirm challan.'
    : '';

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold">Create challan</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select className="rounded-lg border px-3 py-2" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Select customer</option>
            {(customersData || []).map((customer: Customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
          </select>
          <select className="rounded-lg border px-3 py-2" value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Select product</option>
            {(productsData || []).map((product: Product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
          <input className="rounded-lg border px-3 py-2" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <button className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white" onClick={() => { if (productId) { setItems([...items, { productId, quantity: Number(quantity) }]); setProductId(''); setQuantity('1'); } }}>Add item</button>
        </div>
        <div className="mt-4 rounded-lg border p-3 text-sm">
          <p className="font-medium">Draft items</p>
          {items.length === 0 ? <p className="text-slate-500">No items added yet.</p> : <ul className="mt-2 space-y-1">{items.map((item, index) => <li key={`${item.productId}-${index}`}>Item {index + 1}: {item.productId} x {item.quantity}</li>)}</ul>}
        </div>
        {createErrorMessage ? <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{createErrorMessage}</div> : null}
        <button className="mt-4 rounded-lg bg-slate-900 px-4 py-2 font-medium text-white" onClick={() => createMutation.mutate()} disabled={!customerId || items.length === 0 || createMutation.isPending}>Create draft challan</button>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold">Challans</h2>
        {confirmErrorMessage ? <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{confirmErrorMessage}</div> : null}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="border-b text-left text-slate-500"><th className="px-3 py-2">Challan</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Qty</th><th className="px-3 py-2">Action</th></tr></thead>
            <tbody>
              {(challansData?.items || []).map((challan: any) => (
                <tr key={challan.id} className="border-b">
                  <td className="px-3 py-2">{challan.challanNumber}</td>
                  <td className="px-3 py-2">{challan.status}</td>
                  <td className="px-3 py-2">{challan.totalQuantity}</td>
                  <td className="px-3 py-2"><button className="rounded-lg border px-3 py-1" onClick={() => confirmMutation.mutate(challan.id)} disabled={challan.status !== 'DRAFT' || confirmMutation.isPending}>Confirm</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
