'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallet, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { PAYMENT_METHODS } from '@/types/constants';

export default function WithdrawalsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const currency = user?.store?.currency || 'XOF';
  const balance = user?.store?.balance || 0;

  const { data, isLoading } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: () => api.get('/withdrawals').then(r => r.data),
  });

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: { amount: '', method: 'wave', phone: '', name: '' },
  });

  const createWithdrawal = useMutation({
    mutationFn: (d: any) => api.post('/withdrawals', {
      amount: Number(d.amount), method: d.method,
      accountInfo: { phone: d.phone, name: d.name },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['withdrawals'] });
      toast.success('Demande de retrait soumise !');
      setShowForm(false); reset();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Retraits</h1>
          <p className="text-gray-500 mt-1">Gérez vos demandes de retrait</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary"><Plus size={16}/> Nouveau retrait</button>
      </div>

      {/* Balance card */}
      <div className="card bg-gradient-to-r from-brand-500 to-brand-600 text-white border-0">
        <p className="text-brand-100 text-sm font-medium">Solde disponible</p>
        <p className="text-4xl font-black mt-1">{formatPrice(Number(balance), currency)}</p>
        <p className="text-brand-200 text-xs mt-1">Montant minimum de retrait: 1 000 {currency}</p>
      </div>

      {/* Request form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h2 className="font-bold text-gray-900 mb-4">Nouvelle demande de retrait</h2>
          <form onSubmit={handleSubmit(d => createWithdrawal.mutate(d))} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Montant ({currency})</label>
                <input {...register('amount', { required: true })} type="number" min="1000" max={Number(balance)} placeholder="5000" className="input"/>
                {watch('amount') && <p className="text-xs text-gray-400 mt-1">Vous recevrez: {formatPrice(Number(watch('amount')), currency)}</p>}
              </div>
              <div>
                <label className="label">Méthode de paiement</label>
                <select {...register('method')} className="input">
                  {PAYMENT_METHODS.filter(m => m.id !== 'card').map(m => (
                    <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Numéro de téléphone</label>
                <input {...register('phone', { required: true })} placeholder="+221 77 000 00 00" className="input"/>
              </div>
              <div>
                <label className="label">Nom du compte</label>
                <input {...register('name', { required: true })} placeholder="Kofi Mensah" className="input"/>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
              <button type="submit" disabled={createWithdrawal.isPending} className="btn-primary">
                {createWithdrawal.isPending ? <><Loader2 size={14} className="animate-spin"/> Envoi...</> : 'Soumettre la demande'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* History */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border"><h2 className="font-bold text-gray-900">Historique</h2></div>
        {isLoading ? <div className="p-8 text-center text-gray-400">Chargement...</div> :
        data?.data?.length === 0 ? (
          <div className="text-center py-12"><Wallet size={36} className="mx-auto text-gray-200 mb-3"/>
            <p className="text-gray-500 text-sm">Aucun retrait effectué</p></div>
        ) : (
          <div className="divide-y divide-border">
            {data?.data?.map((w: any) => (
              <div key={w.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${getStatusColor(w.status)}`}>
                  {w.status === 'PAID' ? '✅' : w.status === 'APPROVED' ? '🔄' : w.status === 'REJECTED' ? '❌' : '⏳'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{formatPrice(Number(w.amount), currency)}</p>
                  <p className="text-xs text-gray-400">{PAYMENT_METHODS.find(m => m.id === w.method)?.name || w.method} · {formatDate(w.createdAt, 'short')}</p>
                </div>
                <span className={`badge ${getStatusColor(w.status)}`}>{getStatusLabel(w.status)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
