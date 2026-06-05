'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Star, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { PRODUCT_TYPES } from '@/types/constants';

function ProductCard({ p }: { p: any }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-soft transition-all group">
      <Link href={`/p/${p.slug}`}>
        <div className="aspect-video bg-gradient-to-br from-brand-50 to-brand-100 relative overflow-hidden">
          {p.coverImage ? (
            <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl opacity-30">{PRODUCT_TYPES.find(t => t.value === p.type)?.icon || '📦'}</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="badge bg-white/90 text-gray-700 text-[10px] border border-border/50">{p.category?.name || p.type}</span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-brand-700">{p.store?.name?.[0]?.toUpperCase()}</span>
            </div>
            <p className="text-xs text-gray-500 truncate">{p.store?.name}</p>
            {p.store?.isVerified && <span className="text-[10px] text-brand-600">✓</span>}
          </div>
          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-3">{p.title}</h3>
          <div className="flex items-center justify-between">
            <p className="text-lg font-black text-brand-600">{formatPrice(Number(p.price), p.currency)}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {p.rating > 0 && <span className="flex items-center gap-0.5"><Star size={11} className="fill-yellow-400 text-yellow-400"/>{Number(p.rating).toFixed(1)}</span>}
              <span className="flex items-center gap-0.5"><ShoppingBag size={11}/>{p.totalSales}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function MarketplaceClient() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [category, setCategory] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['marketplace', search, sortBy, category],
    queryFn: () => api.get('/marketplace', { params: { search, sortBy, category, limit: 24 } }).then(r => r.data),
  });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => api.get('/products/categories').then(r => r.data) });
  const { data: stats } = useQuery({ queryKey: ['marketplace-stats'], queryFn: () => api.get('/marketplace/stats').then(r => r.data) });

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-brand-50 rounded-2xl">
          {[
            { label: 'Produits', value: stats.totalProducts?.toLocaleString() },
            { label: 'Vendeurs', value: stats.totalSellers?.toLocaleString() },
            { label: 'CA généré', value: formatPrice(stats.totalRevenue, 'XOF') },
          ].map((s, i) => (
            <div key={i} className="text-center"><p className="font-black text-brand-700 text-xl">{s.value}</p><p className="text-brand-600 text-xs">{s.label}</p></div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher des produits..." className="input pl-9 py-2.5 text-sm"/>
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
          <button onClick={() => setCategory('')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${!category ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Tout</button>
          {categories.map((c: any) => (
            <button key={c.id} onClick={() => setCategory(c.slug)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${category === c.slug ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c.icon && <span className="mr-1">{c.icon}</span>}{c.name}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <p className="text-sm text-gray-500">{products?.total || 0} produit(s) trouvé(s)</p>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton aspect-[3/4] rounded-2xl"/>)}
        </div>
      ) : products?.data?.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-30"/>
          <p className="font-medium text-gray-600">Aucun produit trouvé</p>
          <p className="text-sm mt-1">Essayez d'autres mots-clés</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products?.data?.map((p: any) => <ProductCard key={p.id} p={p}/>)}
        </div>
      )}
    </div>
  );
}
