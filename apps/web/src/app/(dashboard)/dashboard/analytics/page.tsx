'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingCart, Users, Package } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<'7d'|'30d'|'90d'>('30d');
  const currency = user?.store?.currency || 'XOF';

  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: () => api.get('/analytics/dashboard').then(r => r.data) });
  const { data: chart } = useQuery({ queryKey: ['revenue-chart', period], queryFn: () => api.get(`/analytics/revenue?period=${period}`).then(r => r.data) });
  const { data: topProducts } = useQuery({ queryKey: ['top-products'], queryFn: () => api.get('/analytics/top-products?limit=10').then(r => r.data) });

  const kpis = [
    { label: 'Revenu total', value: formatPrice(stats?.totalRevenue || 0, currency), icon: TrendingUp, color: 'bg-brand-50 text-brand-600', sub: `+${stats?.revenueGrowth || 0}% vs mois dernier` },
    { label: 'Ventes (30j)', value: stats?.salesThisMonth || 0, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600', sub: `+${stats?.salesGrowth || 0}% vs mois dernier` },
    { label: 'Clients total', value: stats?.totalCustomers || 0, icon: Users, color: 'bg-purple-50 text-purple-600', sub: 'clients uniques' },
    { label: 'Taux conversion', value: `${stats?.conversionRate || 0}%`, icon: Package, color: 'bg-orange-50 text-orange-600', sub: 'visiteurs → acheteurs' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="text-gray-500 mt-1">Suivez vos performances en temps réel</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{k.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.color}`}><k.icon size={16}/></div>
            </div>
            <p className="text-2xl font-black text-gray-900 mt-2">{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">Revenus</h2>
          <div className="flex gap-1">
            {(['7d','30d','90d'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${period === p ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{p}</button>
            ))}
          </div>
        </div>
        <div className="h-64">
          {chart?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A86B" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#00A86B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => new Date(v).toLocaleDateString('fr', { day:'2-digit', month:'2-digit' })}/>
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`}/>
                <Tooltip formatter={(v: any) => [formatPrice(v, currency), 'Revenus']} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }}/>
                <Area type="monotone" dataKey="revenue" stroke="#00A86B" strokeWidth={2.5} fill="url(#grad)"/>
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="h-full flex items-center justify-center text-gray-400 text-sm">Pas encore de données</div>}
        </div>
      </div>

      {/* Top products */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Produits les plus vendus</h2>
        <div className="space-y-3">
          {topProducts?.length ? topProducts.map((p: any, i: number) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="text-xl font-black text-gray-200 w-6 text-right">{i + 1}</span>
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                {p.coverImage ? <img src={p.coverImage} className="w-full h-full object-cover" alt=""/> : <Package size={18} className="m-auto mt-2.5 text-gray-300"/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-32">
                    <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${Math.min((p.totalSales / (topProducts[0]?.totalSales || 1)) * 100, 100)}%` }}/>
                  </div>
                  <span className="text-xs text-gray-500">{p.totalSales} ventes</span>
                </div>
              </div>
              <p className="text-sm font-bold text-brand-600">{formatPrice(p.totalRevenue, currency)}</p>
            </div>
          )) : <p className="text-gray-400 text-sm text-center py-8">Aucun produit vendu</p>}
        </div>
      </div>
    </div>
  );
}
