'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function AdminWithdrawalsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-withdrawals'], queryFn: () => api.get('/withdrawals/admin/all?limit=50').then(r => r.data) });
  const approve = useMutation({ mutationFn: (id: string) => api.patch(`/withdrawals/${id}/approve`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-withdrawals'] }); toast.success('Approuvé'); } });
  const markPaid = useMutation({ mutationFn: (id: string) => api.patch(`/withdrawals/${id}/paid`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-withdrawals'] }); toast.success('Marqué payé'); } });
  const reject = useMutation({ mutationFn: ({ id, note }: any) => api.patch(`/withdrawals/${id}/reject`, { adminNote: note }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-withdrawals'] }); toast.success('Rejeté'); } });

  return (
    <div className="space-y-6">
      <h1 className="page-title">Retraits ({data?.total || 0})</h1>
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-border">
            <tr>{['Vendeur','Montant','Méthode','Compte','Statut','Date','Actions'].map(h =>
              <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((w: any) => (
              <tr key={w.id} className="border-b border-border/50 hover:bg-gray-50">
                <td className="px-4 py-3"><p className="text-sm font-medium">{w.store?.name}</p><p className="text-xs text-gray-400">{w.store?.user?.email}</p></td>
                <td className="px-4 py-3 text-sm font-bold text-brand-600">{formatPrice(Number(w.amount), w.currency)}</td>
                <td className="px-4 py-3 text-sm text-gray-600 capitalize">{w.method.replace('_', ' ')}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{w.accountInfo?.phone}<br/>{w.accountInfo?.name}</td>
                <td className="px-4 py-3"><span className={`badge ${getStatusColor(w.status)}`}>{getStatusLabel(w.status)}</span></td>
                <td className="px-4 py-3 text-xs text-gray-400">{formatDate(w.createdAt, 'short')}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {w.status === 'PENDING' && (
                      <button onClick={() => approve.mutate(w.id)} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-xs flex items-center gap-1"><Check size={12}/> Approuver</button>
                    )}
                    {w.status === 'APPROVED' && (
                      <button onClick={() => markPaid.mutate(w.id)} className="p-1.5 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 text-xs">Payé</button>
                    )}
                    {['PENDING','APPROVED'].includes(w.status) && (
                      <button onClick={() => { const note = prompt('Note de rejet:'); if(note) reject.mutate({ id: w.id, note }); }} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 text-xs flex items-center gap-1"><X size={12}/> Rejeter</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
