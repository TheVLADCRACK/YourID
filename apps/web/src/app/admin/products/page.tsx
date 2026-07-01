'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Package, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { EmptyStateIllustration } from '@/components/ui/illustrations';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: () => api.get('/marketplace', { params: { search, limit: 50 } }).then(r => r.data),
  });

  return (
    <div className="space-y-6">
      <h1 className="page-title">Produits Marketplace ({data?.total || 0})</h1>
      <div className="card py-4">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="input pl-9 py-2 text-sm"/>
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-border">
            <tr>{['Produit', 'Vendeur', 'Prix', 'Ventes', 'Note', 'Statut', 'Date'].map(h =>
              <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {p.coverImage ? <img src={p.coverImage} className="w-full h-full object-cover" alt=""/> : <Package size={18} className="m-auto mt-2.5 text-gray-400"/>}
                    </div>
                    <div><p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{p.title}</p><p className="text-xs text-gray-400">{p.type}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.store?.name}</td>
                <td className="px-4 py-3 text-sm font-semibold">{formatPrice(Number(p.price), p.currency)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.totalSales}</td>
                <td className="px-4 py-3 text-sm">{p.rating > 0 ? `★ ${Number(p.rating).toFixed(1)}` : '—'}</td>
                <td className="px-4 py-3"><span className={`badge ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span></td>
                <td className="px-4 py-3 text-xs text-gray-400">{formatDate(p.createdAt, 'short')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
