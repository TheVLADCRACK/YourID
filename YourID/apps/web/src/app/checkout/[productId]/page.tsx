'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Loader2, Check, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { PAYMENT_METHODS } from '@/types/constants';

export default function CheckoutPage({ params }: any) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState<'info'|'payment'|'success'>('info');
  const [orderId, setOrderId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('wave');
  const [paymentInstructions, setPaymentInstructions] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; name: string }>();

  useEffect(() => {
    // BUG-007 FIX: Use public endpoint (no JWT required)
    api.get(`/products/public/${params.productId}`)
      .then(r => setProduct(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.productId]);

  const createOrder = useMutation({
    mutationFn: (d: any) => api.post('/orders', {
      productId: params.productId,
      customerEmail: d.email,
      customerName: d.name,
      paymentMethod: selectedMethod,
    }).then(r => r.data),
    onSuccess: async (order) => {
      setOrderId(order.id);
      const payment = await api.post('/payments/initiate', { orderId: order.id, method: selectedMethod }).then(r => r.data);
      setPaymentInstructions(payment.instructions);
      setStep('payment');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur lors de la commande'),
  });

  const confirmPayment = useMutation({
    mutationFn: () => api.post(`/payments/simulate/${orderId}`).then(r => r.data),
    onSuccess: () => setStep('success'),
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur de confirmation'),
  });

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-brand-500"/>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</p>
        <Link href="/marketplace" className="btn-primary">Retour à la marketplace</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-6 h-14 flex items-center justify-between">
        <Link href={`/p/${product?.slug}`} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm">
          <ArrowLeft size={16}/> Retour
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">YI</span>
          </div>
          <span className="font-black text-gray-900">Your ID</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Shield size={12} className="text-brand-500"/> Sécurisé
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {step === 'info' && (
              <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h1 className="text-xl font-bold text-gray-900">Vos informations</h1>
                <form onSubmit={handleSubmit(d => createOrder.mutate(d))} className="space-y-4">
                  <div>
                    <label className="label">Nom complet</label>
                    <input {...register('name', { required: 'Nom requis' })} placeholder="Kofi Mensah" className="input text-base py-3.5"/>
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">Email <span className="text-gray-400 font-normal">(pour recevoir votre achat)</span></label>
                    <input {...register('email', { required: 'Email requis', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' } })} type="email" placeholder="kofi@exemple.com" className="input text-base py-3.5"/>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="label">Méthode de paiement</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map(m => (
                        <button key={m.id} type="button" onClick={() => setSelectedMethod(m.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${selectedMethod === m.id ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-brand-200'}`}>
                          <span className="text-xl">{m.emoji}</span>
                          <span className="text-sm font-medium text-gray-900">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={createOrder.isPending} className="btn-primary w-full text-base py-4">
                    {createOrder.isPending ? <><Loader2 size={18} className="animate-spin"/> Traitement...</> : <>Continuer <ChevronRight size={18}/></>}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h1 className="text-xl font-bold text-gray-900">Paiement</h1>
                <div className="card bg-blue-50 border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
                  <p className="text-blue-800 text-sm">{paymentInstructions}</p>
                </div>
                <div className="card border-yellow-200 bg-yellow-50 text-yellow-800 text-sm">
                  ⚠️ Mode démonstration — le paiement est simulé.
                </div>
                <button onClick={() => confirmPayment.mutate()} disabled={confirmPayment.isPending} className="btn-primary w-full text-base py-4">
                  {confirmPayment.isPending ? <><Loader2 size={18} className="animate-spin"/> Confirmation...</> : '✅ Simuler le paiement (Demo)'}
                </button>
                <button onClick={() => setStep('info')} className="btn-secondary w-full">Retour</button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check size={32} className="text-green-600"/>
                </div>
                <h1 className="text-2xl font-black text-gray-900">Paiement réussi ! 🎉</h1>
                <p className="text-gray-500">Un email avec votre lien de téléchargement a été envoyé.</p>
                <div className="card bg-brand-50 border-brand-100 text-brand-700 text-sm">
                  📧 Vérifiez votre boîte mail (y compris les spams).
                </div>
                <Link href="/marketplace" className="btn-primary w-full text-center block">Découvrir d'autres produits</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-8 card">
            <h2 className="font-bold text-gray-900 mb-4">Récapitulatif</h2>
            <div className="flex gap-3 mb-4 pb-4 border-b border-border">
              <div className="w-14 h-14 bg-brand-50 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center">
                {product?.coverImage ? <img src={product.coverImage} className="w-full h-full object-cover" alt=""/> : <span className="text-2xl">📦</span>}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{product?.title}</p>
                <p className="text-xs text-gray-400">{product?.store?.name}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Prix</span><span>{formatPrice(Number(product?.price), product?.currency)}</span></div>
              <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t border-border">
                <span>Total</span><span>{formatPrice(Number(product?.price), product?.currency)}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border space-y-1.5 text-xs text-gray-500">
              <p>🔒 Paiement sécurisé</p>
              <p>⚡ Téléchargement instantané</p>
              <p>♾️ Accès à vie</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
