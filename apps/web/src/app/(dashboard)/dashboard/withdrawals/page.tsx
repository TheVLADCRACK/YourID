'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { EmptyWithdrawals } from '@/components/ui/illustrations';
import { StatusIcon, PaymentMethodIcon } from '@/components/ui/svg-icons';
import { PAYMENT_METHODS } from '@/types/constants';

export default function WithdrawalsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const currency = user?.store?.currency || 'XOF';
  const balance = Number(user?.store?.balance || 0);

  const { data, isLoading } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: () => api.get('/withdrawals').then(r => r.data),
  });

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: { amount: '', method: 'wave', phone: '', name: '' },
  });

  const createWithdrawal = useMutation({
    mutationFn: (d: any) => api.post('/withdrawals', {
      amount: Number(d.amount), method: d.method,
      accountInfo: { phone: d.phone, name: d.name },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['withdrawals'] });
      toast.success('Demande de retrait envoyée !');
      setShowForm(false); reset();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur'),
  });

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === watch('method'));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Retraits</h1>
          <p className="text-gray-500 mt-1">Gérez vos demandes de retrait</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={16}/> Nouveau retrait
        </button>
      </div>

      {/* Balance card */}
      <div className="card overflow-hidden relative border-0">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-700"/>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}/>
        <div className="relative text-white">
          <p className="text-brand-100 text-sm font-medium mb-1">Solde disponible</p>
          <p className="text-4xl font-black">{formatPrice(balance, currency)}</p>
          <p className="text-brand-200 text-xs mt-2">Montant minimum variable selon la devise</p>
        </div>
      </div>

      {/* Request form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h2 className="font-bold text-gray-900 mb-5 text-base">Nouvelle demande</h2>
          <form onSubmit={handleSubmit(d => createWithdrawal.mutate(d))} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Montant ({currency})</label>
                <input {...register('amount', { required: true })}
                  type="number" min="500" max={balance} placeholder="5000" className="input"/>
                {watch('amount') && (
                  <p className="text-xs text-gray-400 mt-1">
                    Vous recevrez: <span className="font-semibold text-brand-600">{formatPrice(Number(watch('amount')), currency)}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="label">Méthode</label>
                <select {...register('method')} className="input">
                  {PAYMENT_METHODS.filter(m => m.id !== 'card').map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
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
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-secondary">
                Annuler
              </button>
              <button type="submit" disabled={createWithdrawal.isPending} className="btn-primary">
                {createWithdrawal.isPending
                  ? <><Loader2 size={14} className="animate-spin"/> Envoi...</>
                  : 'Soumettre la demande'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* History */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border font-bold text-gray-900">Historique</div>

        {isLoading ? (
          <div className="space-y-px">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 skeleton"/>)}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <EmptyWithdrawals/>
            <div className="text-center">
              <p className="text-gray-600 font-semibold text-sm">Aucun retrait effectué</p>
              <p className="text-gray-400 text-xs mt-1">Votre historique apparaîtra ici</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data?.data?.map((w: any) => {
              const method = PAYMENT_METHODS.find(m => m.id === w.method);
              return (
                <div key={w.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <PaymentMethodIcon id={w.method} size={36}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{formatPrice(Number(w.amount), currency)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {method?.name || w.method} · {w.accountInfo?.phone} · {formatDate(w.createdAt, 'short')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusIcon status={w.status} size={16}/>
                    <span className={`badge ${getStatusColor(w.status)} text-xs`}>{getStatusLabel(w.status)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
