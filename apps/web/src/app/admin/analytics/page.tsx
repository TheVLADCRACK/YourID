'use client';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, ShoppingCart, Package } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const { data: stats } = useQuery({ queryKey: ['admin-global-stats'], queryFn: () => api.get('/analytics/global').then(r => r.data) });
  const { data: mktStats } = useQuery({ queryKey: ['marketplace-stats'], queryFn: () => api.get('/marketplace/stats').then(r => r.data) });

  const kpis = [
    { label: 'CA Total plateforme', value: formatPrice(mktStats?.totalRevenue || 0, 'XOF'), icon: TrendingUp, color: 'bg-brand-50 text-brand-600' },
    { label: 'Utilisateurs', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Commandes complétées', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'bg-purple-50 text-purple-600' },
    { label: 'Produits publiés', value: mktStats?.totalProducts || 0, icon: Package, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="page-title">Analytics Globales</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{k.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.color}`}><k.icon size={16}/></div>
            </div>
            <p className="text-2xl font-black text-gray-900 mt-2">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <p className="text-gray-500 text-sm text-center py-8">Graphiques détaillés disponibles après intégration d'un service analytics (ex: PostHog, Mixpanel).</p>
      </div>
    </div>
  );
}
