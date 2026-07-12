
'use client';

function TrustIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    lock: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="6" width="10" height="7" rx="1.5" stroke="#00A86B" strokeWidth="1.2"/><path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#00A86B" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="9.5" r=".8" fill="#00A86B"/></svg>,
    flash: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8 2L4 8h4l-2 4 6-6H8z" fill="#F59E0B" opacity=".25" stroke="#F59E0B" strokeWidth="1.1" strokeLinejoin="round"/></svg>,
    inf: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 7c0 0-.8-2-2.5-2S1 6 1 7s.5 2 2.5 2 3.5-4 3.5-4 1 4 3.5 4S13 8 13 7s-.5-2-2.5-2S7 7 7 7z" stroke="#00A86B" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    phone: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3.5" y="1" width="7" height="12" rx="1.5" stroke="#00A86B" strokeWidth="1.2"/><circle cx="7" cy="11" r=".7" fill="#00A86B"/></svg>,
  };
  return <span className="flex-shrink-0">{icons[type]}</span>;
}

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

// MODIFICATION 8: richer payment simulation states
type PaymentStep = 'info' | 'payment' | 'processing' | 'success';

export default function CheckoutPage({ params }: any) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState<PaymentStep>('info');
  const [orderId, setOrderId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('wave');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [processingDots, setProcessingDots] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; name: string }>();

  // Animate processing dots
  useEffect(() => {
    if (step !== 'processing') return;
    const t = setInterval(() => setProcessingDots(d => (d + 1) % 4), 500);
    return () => clearInterval(t);
  }, [step]);

  useEffect(() => {
    // BUG-007 fix: use public endpoint (no JWT)
    api.get(`/products/public/${params.productId}`)
      .then(r => setProduct(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.productId]);

  const createOrder = useMutation({
    mutationFn: (d: any) =>
      api.post('/orders', {
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
    mutationFn: async () => {
      // MODIFICATION 8: show "processing" animation before calling API
      setStep('processing');
      // simulate realistic delay (1.5s–2.5s)
      await new Promise(r => setTimeout(r, 1800 + Math.random() * 700));
      return api.post(`/payments/simulate/${orderId}`).then(r => r.data);
    },
    onSuccess: () => setStep('success'),
    onError: (e: any) => {
      setStep('payment');
      toast.error(e.response?.data?.message || 'Erreur de confirmation');
    },
  });

  const methodInfo = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-white font-black text-sm">YI</span>
        </div>
        <Loader2 className="animate-spin text-brand-500" size={24} />
      </div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="card max-w-sm w-full text-center">
        <p className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</p>
        <Link href="/marketplace" className="btn-primary mt-4 inline-block">Retour au marketplace</Link>
      </div>
    </div>
  );

  const username = product?.store?.username || product?.store?.slug || 'store';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 h-14 flex items-center justify-between">
        {step !== 'processing' && step !== 'success' ? (
          <Link href={`/@${username}/products/${product?.slug}`} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm">
            <ArrowLeft size={16} /> Retour
          </Link>
        ) : <div />}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">YI</span>
          </div>
          <span className="font-black text-gray-900">Your ID</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Shield size={12} className="text-brand-500" /> Sécurisé
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 grid lg:grid-cols-5 gap-8">
        {/* Left */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">

            {/* STEP: info */}
            {step === 'info' && (
              <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h1 className="text-xl font-bold text-gray-900">Vos informations</h1>
                <form onSubmit={handleSubmit(d => createOrder.mutate(d))} className="space-y-4">
                  <div>
                    <label className="label">Nom complet</label>
                    <input {...register('name', { required: 'Nom requis' })} placeholder="Kofi Mensah" className="input text-base py-3.5" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">Email <span className="text-gray-400 font-normal">(pour recevoir votre achat)</span></label>
                    <input {...register('email', { required: 'Email requis', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' } })} type="email" placeholder="kofi@exemple.com" className="input text-base py-3.5" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  {/* MODIFICATION 8: payment methods with color indicators */}
                  <div>
                    <label className="label">Méthode de paiement</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map(m => (
                        <button key={m.id} type="button" onClick={() => setSelectedMethod(m.id)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${selectedMethod === m.id ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-brand-200'}`}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${m.color}20` }}>
                            <span className="text-base">{m.emoji}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 leading-tight">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={createOrder.isPending} className="btn-primary w-full text-base py-4">
                    {createOrder.isPending
                      ? <><Loader2 size={18} className="animate-spin" /> Traitement...</>
                      : <>Continuer vers le paiement <ChevronRight size={18} /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP: payment instructions */}
            {step === 'payment' && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h1 className="text-xl font-bold text-gray-900">Confirmer le paiement</h1>

                <div className="card border-0 bg-gradient-to-br from-brand-50 to-brand-100/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${methodInfo?.color}20` }}>
                      {methodInfo?.emoji}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{methodInfo?.name}</p>
                      <p className="text-brand-700 font-black text-lg">{formatPrice(Number(product?.price), product?.currency)}</p>
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-3">
                    <p className="text-sm text-gray-700 leading-relaxed">{paymentInstructions}</p>
                  </div>
                </div>

                <div className="card border-yellow-200 bg-yellow-50 text-yellow-800 text-sm">
                  ⚠️ Mode démonstration — le paiement est simulé. Aucun montant réel n'est débité.
                </div>

                <button onClick={() => confirmPayment.mutate()} disabled={confirmPayment.isPending} className="btn-primary w-full text-base py-4">
                  Confirmer le paiement (Demo)
                </button>
                <button onClick={() => setStep('info')} className="btn-secondary w-full">Retour</button>
              </motion.div>
            )}

            {/* STEP: processing animation (MODIFICATION 8) */}
            {step === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-16 text-center space-y-6">
                <div className="relative inline-flex items-center justify-center">
                  {/* Outer ring */}
                  <svg className="animate-spin" width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="36" stroke="#E5E7EB" strokeWidth="4" />
                    <path d="M40 4a36 36 0 0 1 36 36" stroke="#00A86B" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">{methodInfo?.emoji}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xl font-black text-gray-900">
                    Paiement en cours{'...'.substring(0, processingDots + 1)}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Connexion à {methodInfo?.name} en cours. Ne fermez pas cette page.
                  </p>
                </div>

                <div className="flex justify-center gap-2 pt-2">
                  {['Vérification', 'Validation', 'Confirmation'].map((label, i) => (
                    <motion.div key={label}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                      className="px-3 py-1 bg-brand-50 text-brand-600 text-xs rounded-full font-medium">
                      {label}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP: success */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-5">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check size={36} className="text-green-600" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Paiement réussi !</h1>
                  <p className="text-gray-500 mt-2">Votre achat est confirmé. Un email avec votre lien de téléchargement a été envoyé.</p>
                </div>
                <div className="card bg-brand-50 border-brand-100 text-brand-700 text-sm text-left">
                  <p className="font-semibold mb-1 flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="9" rx="1.5" stroke="#00A86B" strokeWidth="1.2"/><path d="M1 5l6 4 6-4" stroke="#00A86B" strokeWidth="1.2" strokeLinecap="round"/></svg>Vérifiez votre boîte mail</p>
                  <p>Le lien de téléchargement est valable 48h et à usage unique.</p>
                </div>
                <Link href="/marketplace" className="btn-primary w-full text-center block">Découvrir d'autres produits</Link>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right — order summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-8 card">
            <h2 className="font-bold text-gray-900 mb-4 text-sm">Récapitulatif</h2>
            <div className="flex gap-3 mb-4 pb-4 border-b border-border">
              <div className="w-14 h-14 bg-brand-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                {product?.coverImage
                  ? <img src={product.coverImage} className="w-full h-full object-cover" alt="" />
                  : <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="14" rx="2" stroke="#D1D5DB" strokeWidth="1.5"/><path d="M3 11h18" stroke="#D1D5DB" strokeWidth="1.5"/><line x1="9" y1="7" x2="9" y2="11" stroke="#D1D5DB" strokeWidth="1.5"/><line x1="15" y1="7" x2="15" y2="11" stroke="#D1D5DB" strokeWidth="1.5"/></svg>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{product?.title}</p>
                <p className="text-xs text-gray-400 mt-1">{product?.store?.name}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Prix</span><span>{formatPrice(Number(product?.price), product?.currency)}</span></div>
              <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t border-border">
                <span>Total</span><span>{formatPrice(Number(product?.price), product?.currency)}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border space-y-1.5 text-xs text-gray-400">
              <p className="flex items-center gap-1.5"><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1" y="5" width="9" height="6" rx="1" stroke="#00A86B" strokeWidth="1"/><path d="M3 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="#00A86B" strokeWidth="1" strokeLinecap="round"/></svg>Paiement sécurisé</p>
              <p className="flex items-center gap-1.5"><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M6.5 1.5L3 6h3.5L5 9.5l5-5H7z" fill="#F59E0B" opacity=".3" stroke="#F59E0B" strokeWidth=".9" strokeLinejoin="round"/></svg>Téléchargement instantané</p>
              <p className="flex items-center gap-1.5"><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M4 5.5c0 0-.6-1.5-2-1.5S1 5 1 5.5s.4 1.5 2 1.5 3-3 3-3 .8 3 2.5 3S10 6 10 5.5 9.6 4 8 4 5 5.5 5 5.5z" stroke="#00A86B" strokeWidth=".9" strokeLinecap="round"/></svg>Accès à vie</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
