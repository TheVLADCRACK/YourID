'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Mail, ShoppingBag } from 'lucide-react';
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
        <p className="text-gray-500 mt-1">{data?.total || 0} client(s) au total</p>
      </div>

      <div className="card py-4">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client..." className="input pl-9 py-2 text-sm"/>
        </div>
      </div>

      {isLoading ? <div className="card text-center py-12 text-gray-400">Chargement...</div> :
      data?.data?.length === 0 ? (
        <div className="card text-center py-16">
          <Users size={40} className="mx-auto text-gray-200 mb-3"/>
          <p className="text-gray-500 font-medium">Aucun client</p>
          <p className="text-gray-400 text-sm mt-1">Vos clients apparaîtront ici après leurs achats</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {data?.data?.map((c: any) => (
            <div key={c.id} className="card py-4 flex items-center gap-4 hover:shadow-soft transition-shadow">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 font-bold flex items-center justify-center text-sm flex-shrink-0">
                {getInitials(`${c.firstName} ${c.lastName}`)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{c.firstName} {c.lastName}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><Mail size={10}/> {c.email}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-brand-600">{formatPrice(Number(c.totalSpent), currency)}</p>
                <p className="text-xs text-gray-400 flex items-center justify-end gap-1"><ShoppingBag size={10}/> {c.orderCount} achat(s)</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-400">Inscrit le</p>
                <p className="text-xs text-gray-600">{formatDate(c.createdAt, 'short')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
