'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingCart, Users, Wallet, ArrowUpRight, ArrowDownRight, Package, Eye } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import api from '@/lib/api';
import Link from 'next/link';

function StatCard({ title, value, sub, icon: Icon, trend, color }: any) {
  const isPositive = trend >= 0;
  return (
    <motion.div whileHover={{ y: -2 }} className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
        <span className="text-xs text-gray-400">{sub}</span>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data),
  });
  const { data: chartData } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: () => api.get('/analytics/revenue?period=30d').then(r => r.data),
  });
  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => api.get('/analytics/recent-orders').then(r => r.data),
  });
  const { data: topProducts } = useQuery({
    queryKey: ['top-products'],
    queryFn: () => api.get('/analytics/top-products').then(r => r.data),
  });

  const currency = user?.store?.currency || 'XOF';

  const kpis = [
    { title: 'Revenus totaux', value: formatPrice(stats?.totalRevenue || 0, currency), sub: 'depuis le début', icon: TrendingUp, trend: stats?.revenueGrowth, color: 'bg-brand-50 text-brand-600' },
    { title: 'Ventes (30j)', value: stats?.salesThisMonth || 0, sub: 'ce mois-ci', icon: ShoppingCart, trend: stats?.salesGrowth, color: 'bg-blue-50 text-blue-600' },
    { title: 'Clients', value: stats?.totalCustomers || 0, sub: 'total', icon: Users, trend: undefined, color: 'bg-purple-50 text-purple-600' },
    { title: 'Solde disponible', value: formatPrice(stats?.balance || 0, currency), sub: 'à retirer', icon: Wallet, trend: undefined, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Bonjour, {user?.firstName}</h1>
        <p className="text-gray-500 mt-1">Voici un aperçu de votre activité.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard {...kpi} />
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title text-base">Revenus — 30 derniers jours</h2>
            <Link href="/dashboard/analytics" className="text-sm text-brand-600 hover:underline font-medium">Voir tout</Link>
          </div>
          <div className="h-56">
            {chartData?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00A86B" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#00A86B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => new Date(v).toLocaleDateString('fr', { day: '2-digit', month: '2-digit' })} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => [formatPrice(v, currency), 'Revenus']} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#00A86B" strokeWidth={2.5} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                <div className="text-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-2 opacity-30"><path d="M4 24l8-8 5 5 11-11" stroke="#00A86B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 10h6v6" stroke="#00A86B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <p>Pas encore de données</p>
                  <Link href="/dashboard/products" className="text-brand-500 text-sm mt-1 block hover:underline">Créer un produit →</Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top products */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title text-base">Top produits</h2>
            <Link href="/dashboard/products" className="text-sm text-brand-600 hover:underline font-medium">Voir tout</Link>
          </div>
          <div className="space-y-3">
            {topProducts?.length ? topProducts.slice(0, 5).map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-lg font-black text-gray-200">0{i + 1}</span>
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                  {p.coverImage ? <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" /> : <Package size={20} className="m-auto mt-2.5 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-500">{p.totalSales} ventes</p>
                </div>
                <p className="text-sm font-bold text-brand-600">{formatPrice(p.totalRevenue, currency)}</p>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400">
                <Package size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun produit</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title text-base">Commandes récentes</h2>
          <Link href="/dashboard/orders" className="text-sm text-brand-600 hover:underline font-medium">Voir tout</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Commande', 'Client', 'Produit', 'Montant', 'Statut', 'Date'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders?.length ? recentOrders.slice(0, 8).map((o: any) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 text-sm font-mono text-gray-600">{o.orderNumber}</td>
                  <td className="py-3 pr-4 text-sm text-gray-900">{o.customer?.firstName} {o.customer?.lastName}</td>
                  <td className="py-3 pr-4 text-sm text-gray-600 truncate max-w-[150px]">{o.items?.[0]?.product?.title || '—'}</td>
                  <td className="py-3 pr-4 text-sm font-semibold text-gray-900">{formatPrice(Number(o.total), o.currency)}</td>
                  <td className="py-3 pr-4"><span className={`badge ${getStatusColor(o.status)}`}>{getStatusLabel(o.status)}</span></td>
                  <td className="py-3 text-sm text-gray-500">{formatDate(o.createdAt, 'relative')}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Aucune commande pour l'instant</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
