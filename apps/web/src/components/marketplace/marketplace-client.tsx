'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { PRODUCT_TYPES } from '@/types/constants';
import { EmptyStateIllustration } from '@/components/ui/illustrations';
import { IconStar } from '@/components/ui/svg-icons';

// ─── Product type icon (inline SVG, no emoji) ─────────────────────────────────
function ProductTypeIcon({ type, size = 20 }: { type: string; size?: number }) {
  const cfg: Record<string, { color: string; path: React.ReactNode }> = {
    EBOOK: {
      color: '#00A86B',
      path: <><rect x="3" y="2" width="14" height="18" rx="2" stroke="#00A86B" strokeWidth="1.4" fill="#00A86B" fillOpacity=".1"/>
               <line x1="6" y1="7" x2="14" y2="7" stroke="#00A86B" strokeWidth="1.2" strokeLinecap="round"/>
               <line x1="6" y1="10" x2="14" y2="10" stroke="#00A86B" strokeWidth="1.2" strokeLinecap="round"/>
               <line x1="6" y1="13" x2="10" y2="13" stroke="#00A86B" strokeWidth="1.2" strokeLinecap="round"/></>
    },
    COURSE: {
      color: '#6366F1',
      path: <><circle cx="10" cy="10" r="8" stroke="#6366F1" strokeWidth="1.4" fill="#6366F1" fillOpacity=".08"/>
               <polygon points="8,7 8,13 14,10" fill="#6366F1"/></>
    },
    AUDIO: {
      color: '#F59E0B',
      path: <><rect x="7" y="2" width="6" height="12" rx="3" stroke="#F59E0B" strokeWidth="1.4" fill="#F59E0B" fillOpacity=".1"/>
               <path d="M4 11c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
               <line x1="10" y1="17" x2="10" y2="20" stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round"/></>
    },
    TEMPLATE: {
      color: '#EC4899',
      path: <><rect x="2" y="2" width="16" height="16" rx="3" stroke="#EC4899" strokeWidth="1.4" fill="#EC4899" fillOpacity=".08"/>
               <rect x="2" y="2" width="16" height="6" rx="3" fill="#EC4899" fillOpacity=".2"/>
               <line x1="5" y1="12" x2="15" y2="12" stroke="#EC4899" strokeWidth="1.2" strokeLinecap="round"/>
               <line x1="5" y1="15" x2="11" y2="15" stroke="#EC4899" strokeWidth="1.2" strokeLinecap="round"/></>
    },
    SOFTWARE: {
      color: '#3B82F6',
      path: <><rect x="1" y="4" width="18" height="14" rx="2" stroke="#3B82F6" strokeWidth="1.4" fill="#3B82F6" fillOpacity=".08"/>
               <polyline points="5,10 8,13 5,16" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
               <line x1="10" y1="16" x2="16" y2="16" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round"/></>
    },
    SERVICE: {
      color: '#10B981',
      path: <><circle cx="10" cy="7" r="4" stroke="#10B981" strokeWidth="1.4" fill="#10B981" fillOpacity=".1"/>
               <path d="M3 19c0-4 3.1-7 7-7s7 3 7 7" stroke="#10B981" strokeWidth="1.4" strokeLinecap="round" fill="none"/></>
    },
    OTHER: {
      color: '#8B5CF6',
      path: <><rect x="3" y="3" width="14" height="14" rx="3" stroke="#8B5CF6" strokeWidth="1.4" fill="#8B5CF6" fillOpacity=".08"/>
               <line x1="10" y1="7" x2="10" y2="13" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round"/>
               <line x1="7" y1="10" x2="13" y2="10" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round"/></>
    },
  };
  const c = cfg[type] || cfg.OTHER;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">{c.path}</svg>
  );
}

// ─── Verified badge ───────────────────────────────────────────────────────────
function VerifiedBadge() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="6" fill="#00A86B" opacity=".15"/>
      <path d="M4 6.5l2 2 3.5-3.5" stroke="#00A86B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ p }: { p: any }) {
  const username = p.store?.username || p.store?.slug || 'store';
  return (
    <motion.div whileHover={{ y: -3 }}
      className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-soft transition-all group">
      <Link href={`/@${username}/products/${p.slug}`}>
        <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
          {p.coverImage ? (
            <img src={p.coverImage} alt={p.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                <ProductTypeIcon type={p.type} size={32}/>
              </div>
            </div>
          )}
          {p.category && (
            <div className="absolute top-2.5 left-2.5">
              <span className="badge bg-white/90 text-gray-600 text-[10px] border border-border/50 shadow-sm">
                {p.category.name}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-bold text-brand-700">
                {p.store?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">{p.store?.name}</p>
            {p.store?.isVerified && <VerifiedBadge/>}
          </div>

          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-3">
            {p.title}
          </h3>

          <div className="flex items-center justify-between">
            <p className="text-base font-black text-brand-600">
              {formatPrice(Number(p.price), p.currency)}
            </p>
            <div className="flex items-center gap-2.5 text-xs text-gray-400">
              {p.rating > 0 && (
                <span className="flex items-center gap-0.5">
                  <IconStar size={11} filled color="#F59E0B"/>
                  {Number(p.rating).toFixed(1)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <rect x="1" y="2" width="8" height="7" rx="1" stroke="#9CA3AF" strokeWidth="1"/>
                  <line x1="3" y1="2" x2="3" y2="1" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round"/>
                  <line x1="7" y1="2" x2="7" y2="1" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round"/>
                </svg>
                {p.totalSales}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────
export function MarketplaceClient() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [category, setCategory] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['marketplace', search, sortBy, category],
    queryFn: () => api.get('/marketplace', { params: { search, sortBy, category, limit: 24 } }).then(r => r.data),
  });
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/products/categories').then(r => r.data),
  });
  const { data: stats } = useQuery({
    queryKey: ['marketplace-stats'],
    queryFn: () => api.get('/marketplace/stats').then(r => r.data),
  });

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 p-5 bg-gradient-to-r from-brand-50 to-brand-100/50 rounded-2xl border border-brand-100">
          {[
            { label: 'Produits', value: stats.totalProducts?.toLocaleString('fr') },
            { label: 'Vendeurs', value: stats.totalSellers?.toLocaleString('fr') },
            { label: 'CA généré', value: formatPrice(stats.totalRevenue, 'XOF') },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="font-black text-brand-700 text-xl">{s.value}</p>
              <p className="text-brand-600 text-xs font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher des produits..." className="input pl-9 py-2.5 text-sm"/>
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="input w-44 py-2.5 text-sm">
          <option value="">Toutes catégories</option>
          {categories?.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input w-44 py-2.5 text-sm">
          <option value="popular">Plus populaires</option>
          <option value="newest">Plus récents</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="rating">Mieux notés</option>
        </select>
      </div>

      {/* Category pills */}
      {categories?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCategory('')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
              ${!category ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Tout
          </button>
          {categories.map((c: any) => (
            <button key={c.id} onClick={() => setCategory(c.slug)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                ${category === c.slug ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500">{products?.total || 0} produit(s)</p>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton aspect-[3/4] rounded-2xl"/>)}
        </div>
      ) : products?.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <EmptyStateIllustration/>
          <div className="text-center">
            <p className="text-gray-700 font-semibold">Aucun produit trouvé</p>
            <p className="text-gray-400 text-sm mt-1">Essayez d'autres mots-clés ou catégories</p>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products?.data?.map((p: any) => <ProductCard key={p.id} p={p}/>)}
        </div>
      )}
    </div>
  );
}
