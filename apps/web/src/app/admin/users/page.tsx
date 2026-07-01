'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { formatDate, getStatusColor, getStatusLabel, getInitials } from '@/lib/utils';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => api.get('/users/admin/all', { params: { search, limit: 50 } }).then(r => r.data),
  });
  const suspend = useMutation({ mutationFn: (id: string) => api.patch(`/users/admin/${id}/suspend`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Compte suspendu'); } });
  const activate = useMutation({ mutationFn: (id: string) => api.patch(`/users/admin/${id}/activate`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Compte activé'); } });

  return (
    <div className="space-y-6">
      <h1 className="page-title">Utilisateurs ({data?.total || 0})</h1>
      <div className="card py-4">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input pl-9 py-2 text-sm" />
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-border">
            <tr>{['Utilisateur', 'Boutique', 'Rôle', 'Statut', 'Inscrit', 'Actions'].map(h =>
              <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((u: any) => (
              <tr key={u.id} className="border-b border-border/50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">{getInitials(`${u.firstName} ${u.lastName}`)}</div>
                    <div><p className="text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.store?.name || '—'}</td>
                <td className="px-4 py-3"><span className="badge bg-gray-100 text-gray-600 text-xs">{u.role}</span></td>
                <td className="px-4 py-3"><span className={`badge ${getStatusColor(u.status)}`}>{getStatusLabel(u.status)}</span></td>
                <td className="px-4 py-3 text-xs text-gray-400">{formatDate(u.createdAt, 'short')}</td>
                <td className="px-4 py-3">
                  {u.status === 'SUSPENDED'
                    ? <button onClick={() => activate.mutate(u.id)} className="flex items-center gap-1 text-xs text-green-600 hover:underline"><UserCheck size={12}/> Activer</button>
                    : <button onClick={() => { if(confirm('Suspendre ?')) suspend.mutate(u.id); }} className="flex items-center gap-1 text-xs text-red-500 hover:underline"><UserX size={12}/> Suspendre</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
