'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setEmail(data.email);
      setSent(true);
    } catch {
      // Always show success to prevent email enumeration
      setEmail(data.email);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">YI</span>
            </div>
            <span className="font-black text-2xl text-gray-900">Your <span className="text-brand-500">ID</span></span>
          </Link>
        </div>

        <div className="card">
          {!sent ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Mot de passe oublié ?</h1>
              <p className="text-gray-500 text-sm mb-6">Entrez votre email et nous vous enverrons un lien de réinitialisation.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Adresse email</label>
                  <input
                    {...register('email', { required: 'Email requis', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' } })}
                    type="email" placeholder="vous@exemple.com" className="input"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin"/> Envoi...</> : 'Envoyer le lien'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-brand-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-900 mb-2">Email envoyé !</h2>
              <p className="text-gray-500 text-sm mb-4">
                Si l'adresse <strong>{email}</strong> est associée à un compte, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <p className="text-xs text-gray-400">Vérifiez aussi vos spams.</p>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-border text-center">
            <Link href="/login" className="text-sm text-brand-600 hover:underline flex items-center justify-center gap-1">
              <ArrowLeft size={14} /> Retour à la connexion
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
