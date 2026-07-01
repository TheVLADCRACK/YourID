'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Users, ShoppingBag, TrendingUp, Wallet, Package } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice, getStatusColor, getStatusLabel, formatDate } from '@/lib/utils';

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  useEffect(() => { if (user && user.role !== 'ADMIN') router.push('/dashboard'); }, [user]);

  const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: () => api.get('/users/admin/all?limit=10').then(r => r.data) });
  const { data: withdrawals } = useQuery({ queryKey: ['admin-withdrawals'], queryFn: () => api.get('/withdrawals/admin/all?limit=10').then(r => r.data) });
  const { data: stats } = useQuery({ queryKey: ['marketplace-stats'], queryFn: () => api.get('/marketplace/stats').then(r => r.data) });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Administration</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Vendeurs', value: stats?.totalSellers || 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Produits', value: stats?.totalProducts || 0, icon: Package, color: 'bg-purple-50 text-purple-600' },
          { label: 'CA Total', value: formatPrice(stats?.totalRevenue || 0, 'XOF'), icon: TrendingUp, color: 'bg-brand-50 text-brand-600' },
          { label: 'Retraits en attente', value: withdrawals?.data?.filter((w: any) => w.status === 'PENDING').length || 0, icon: Wallet, color: 'bg-yellow-50 text-yellow-600' },
        ].map((k, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{k.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.color}`}><k.icon size={16}/></div>
            </div>
            <p className="text-2xl font-black text-gray-900 mt-2">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Derniers vendeurs</h2>
          <div className="space-y-2">
            {users?.data?.slice(0, 8).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">{u.firstName?.[0]}</div>
                <div className="flex-1"><p className="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                <span className={`badge ${getStatusColor(u.status)}`}>{getStatusLabel(u.status)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Retraits à traiter</h2>
          <div className="space-y-2">
            {withdrawals?.data?.filter((w: any) => w.status === 'PENDING').slice(0, 8).map((w: any) => (
              <div key={w.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <div className="flex-1"><p className="text-sm font-medium text-gray-900">{w.store?.name}</p><p className="text-xs text-gray-400">{formatDate(w.createdAt, 'short')}</p></div>
                <p className="text-sm font-bold text-brand-600">{formatPrice(Number(w.amount), w.currency)}</p>
                <span className={`badge ${getStatusColor(w.status)}`}>{getStatusLabel(w.status)}</span>
              </div>
            ))}
            {!withdrawals?.data?.filter((w: any) => w.status === 'PENDING').length && <p className="text-gray-400 text-sm text-center py-4">Aucun retrait en attente</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
