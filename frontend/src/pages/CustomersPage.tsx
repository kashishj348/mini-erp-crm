import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

interface Customer { id: string; name: string; mobile: string; email: string; businessName: string; customerType: string; status: string; createdAt: string; }

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [page] = useState(1);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', businessName: '', customerType: 'RETAIL', status: 'LEAD', address: '' });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: async () => {
      const response = await api.get('/api/customers', { params: { page, limit: 10, search } });
      return response.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof form) => api.post('/api/customers', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setForm({ name: '', mobile: '', email: '', businessName: '', customerType: 'RETAIL', status: 'LEAD', address: '' });
    }
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Customers</h2>
            <p className="text-sm text-slate-500">Manage leads and active accounts</p>
          </div>
          <input className="rounded-lg border px-3 py-2 md:w-72" placeholder="Search customers" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}>
          <input className="rounded-lg border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="rounded-lg border px-3 py-2" placeholder="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
          <input className="rounded-lg border px-3 py-2" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="rounded-lg border px-3 py-2" placeholder="Business" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required />
          <select className="rounded-lg border px-3 py-2" value={form.customerType} onChange={(e) => setForm({ ...form, customerType: e.target.value })}>
            <option value="RETAIL">RETAIL</option><option value="WHOLESALE">WHOLESALE</option><option value="DISTRIBUTOR">DISTRIBUTOR</option>
          </select>
          <select className="rounded-lg border px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="LEAD">LEAD</option><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option>
          </select>
          <textarea className="rounded-lg border px-3 py-2 md:col-span-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          {createMutation.isError ? <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{createMutation.error instanceof Error ? createMutation.error.message : 'Unable to create customer.'}</div> : null}
          <button className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white md:col-span-2" type="submit" disabled={createMutation.isPending}>Add customer</button>
        </form>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        {isLoading ? <p>Loading...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="px-3 py-2">Name</th><th className="px-3 py-2">Business</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items || []).map((customer: Customer) => (
                  <tr key={customer.id} className="border-b">
                    <td className="px-3 py-2">{customer.name}<div className="text-xs text-slate-500">{customer.mobile}</div></td>
                    <td className="px-3 py-2">{customer.businessName}</td>
                    <td className="px-3 py-2">{customer.customerType}</td>
                    <td className="px-3 py-2">{customer.status}</td>
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
