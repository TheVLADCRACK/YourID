'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Package, Search, Filter, MoreVertical, Eye, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { formatPrice, getStatusColor, getStatusLabel, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { CreateProductModal } from '@/components/dashboard/create-product-modal';
import Link from 'next/link';

export default function ProductsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => api.get('/products', { params: { search, limit: 50 } }).then(r => r.data),
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, status }: any) => api.patch(`/products/${id}/${status === 'PUBLISHED' ? 'unpublish' : 'publish'}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Statut mis à jour'); },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Produit supprimé'); },
  });

  const currency = user?.store?.currency || 'XOF';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Produits</h1>
          <p className="text-gray-500 mt-1">{data?.total || 0} produit(s) au total</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={18} /> Nouveau produit
        </button>
      </div>

      {/* Filters */}
      <div className="card py-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="input pl-9" />
          </div>
        </div>
      </div>

      {/* Products table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="space-y-px">
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-none" />)}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="font-semibold text-gray-700 mb-1">Aucun produit</h3>
            <p className="text-gray-400 text-sm mb-6">Créez votre premier produit digital.</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <Plus size={16} /> Créer un produit
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  {['Produit', 'Prix', 'Ventes', 'Note', 'Statut', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((p: any) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border/50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {p.coverImage ? <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" /> : <Package size={18} className="m-auto mt-2.5 text-gray-400" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{p.title}</p>
                          <p className="text-xs text-gray-400">{p.category?.name || p.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{formatPrice(Number(p.price), currency)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{p.totalSales}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{p.rating > 0 ? `⭐ ${Number(p.rating).toFixed(1)}` : '—'}</td>
                    <td className="px-5 py-4"><span className={`badge ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span></td>
                    <td className="px-5 py-4 text-xs text-gray-400">{formatDate(p.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/p/${p.slug}`} target="_blank" className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"><Eye size={15} /></Link>
                        <button onClick={() => togglePublish.mutate({ id: p.id, status: p.status })} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-brand-600 transition-colors" title={p.status === 'PUBLISHED' ? 'Dépublier' : 'Publier'}>
                          {p.status === 'PUBLISHED' ? <ToggleRight size={15} className="text-brand-500" /> : <ToggleLeft size={15} />}
                        </button>
                        <button onClick={() => { if (confirm('Supprimer ce produit ?')) deleteProduct.mutate(p.id); }} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <CreateProductModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
