'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Eye } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const currency = user?.store?.currency || 'XOF';

  const { data, isLoading } = useQuery({
    queryKey: ['orders', search, status],
    queryFn: () => api.get('/orders', { params: { search, status, limit: 50 } }).then(r => r.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Commandes</h1>
        <p className="text-gray-500 mt-1">{data?.total || 0} commande(s)</p>
      </div>

      <div className="card py-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input pl-9 py-2 text-sm"/>
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="input w-40 py-2 text-sm">
            <option value="">Tous les statuts</option>
            {['COMPLETED','PENDING','FAILED','REFUNDED'].map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? <div className="p-8 text-center text-gray-400">Chargement...</div> :
        data?.data?.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart size={40} className="mx-auto text-gray-200 mb-3"/>
            <p className="text-gray-500 font-medium">Aucune commande</p>
            <p className="text-gray-400 text-sm mt-1">Vos commandes apparaîtront ici</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>{['N° Commande','Client','Produit','Montant','Commission','Votre part','Statut','Date'].map(h =>
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((o: any) => (
                  <tr key={o.id} className="border-b border-border/50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{o.customerName}</p>
                      <p className="text-xs text-gray-400">{o.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[140px] truncate">{o.items?.[0]?.title || '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatPrice(Number(o.total), currency)}</td>
                    <td className="px-4 py-3 text-sm text-red-500">-{formatPrice(Number(o.platformFee), currency)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-brand-600">{formatPrice(Number(o.sellerRevenue), currency)}</td>
                    <td className="px-4 py-3"><span className={`badge ${getStatusColor(o.status)}`}>{getStatusLabel(o.status)}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(o.createdAt, 'short')}</td>
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
