'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { EmptyOrders } from '@/components/ui/illustrations';
import { StatusIcon } from '@/components/ui/svg-icons';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const currency = user?.store?.currency || 'XOF';

  const { data, isLoading } = useQuery({
    queryKey: ['orders', search, status],
    queryFn: () => api.get('/orders', { params: { search, status, limit: 50 } }).then(r => r.data),
  });

  const statuses = ['COMPLETED','PENDING','FAILED','REFUNDED'];

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
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par client, numéro..." className="input pl-9 py-2 text-sm"/>
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="input w-44 py-2 text-sm">
            <option value="">Tous les statuts</option>
            {statuses.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="space-y-px">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton"/>)}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <EmptyOrders className="opacity-80"/>
            <div className="text-center">
              <p className="text-gray-700 font-semibold">Aucune commande</p>
              <p className="text-gray-400 text-sm mt-1">Vos premières ventes apparaîtront ici</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  {['N° Commande','Client','Produit','Montant','Commission','Votre part','Statut','Date'].map(h =>
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((o: any) => (
                  <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b border-border/50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{o.customerName}</p>
                      <p className="text-xs text-gray-400">{o.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[140px] truncate">
                      {o.items?.[0]?.title || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatPrice(Number(o.total), currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-400">
                      -{formatPrice(Number(o.platformFee), currency)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-brand-600">
                      {formatPrice(Number(o.sellerRevenue), currency)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusIcon status={o.status} size={16}/>
                        <span className={`badge ${getStatusColor(o.status)} text-xs`}>{getStatusLabel(o.status)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(o.createdAt, 'short')}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
