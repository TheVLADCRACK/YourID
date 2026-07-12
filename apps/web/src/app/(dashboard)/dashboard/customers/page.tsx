'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { EmptyCustomers } from '@/components/ui/illustrations';
import { IconEmail, IconMoney } from '@/components/ui/svg-icons';
import api from '@/lib/api';
import { formatPrice, formatDate, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

export default function CustomersPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const currency = user?.store?.currency || 'XOF';

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => api.get('/stores/me/customers', { params: { search, limit: 50 } }).then(r => r.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Clients</h1>
        <p className="text-gray-500 mt-1">{data?.total || 0} client(s)</p>
      </div>

      <div className="card py-4">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un client..." className="input pl-9 py-2 text-sm"/>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-20 skeleton"/>)}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 gap-4">
          <EmptyCustomers className="opacity-80"/>
          <div className="text-center">
            <p className="text-gray-700 font-semibold">Aucun client</p>
            <p className="text-gray-400 text-sm mt-1">Vos clients apparaîtront ici après leurs achats</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {data?.data?.map((c: any) => (
            <div key={c.id} className="card py-4 flex items-center gap-4 hover:shadow-soft transition-all">
              <div className="w-11 h-11 rounded-full bg-brand-100 text-brand-600 font-bold flex items-center justify-center text-sm flex-shrink-0">
                {getInitials(`${c.firstName} ${c.lastName}`)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{c.firstName} {c.lastName}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <IconEmail size={11} color="#9CA3AF"/> {c.email}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-brand-600 flex items-center gap-1 justify-end">
                  <IconMoney size={14}/> {formatPrice(Number(c.totalSpent), currency)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {c.orderCount} achat{c.orderCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right hidden sm:block flex-shrink-0">
                <p className="text-xs text-gray-400">Inscrit</p>
                <p className="text-xs text-gray-600">{formatDate(c.createdAt, 'short')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
