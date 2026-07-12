'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import api from '@/lib/api';

type Form = { password: string; confirm: string };

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [showPwd, setShowPwd] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Form>();

  const onSubmit = async (data: Form) => {
    if (!token) { toast.error('Lien invalide ou expiré'); return; }
    if (data.password !== data.confirm) { toast.error('Les mots de passe ne correspondent pas'); return; }
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Lien invalide ou expiré');
    }
  };

  if (!token) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        <p className="text-red-500 font-semibold mb-4">Lien de réinitialisation invalide.</p>
        <Link href="/forgot-password" className="btn-primary">Demander un nouveau lien</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">YI</span>
            </div>
            <span className="font-black text-2xl">Your <span className="text-brand-500">ID</span></span>
          </Link>
        </div>

        <div className="card">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-brand-500 mx-auto mb-4"/>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Mot de passe réinitialisé !</h2>
              <p className="text-gray-500 text-sm">Redirection en cours...</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Nouveau mot de passe</h1>
              <p className="text-gray-500 text-sm mb-6">Choisissez un mot de passe sécurisé pour votre compte.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      {...register('password', {
                        required: 'Requis',
                        minLength: { value: 8, message: 'Min. 8 caractères' },
                        pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '1 maj, 1 min, 1 chiffre requis' },
                      })}
                      type={showPwd ? 'text' : 'password'} placeholder="Min. 8 caractères" className="input pr-10"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="label">Confirmer le mot de passe</label>
                  <input {...register('confirm', { required: 'Requis' })} type="password" placeholder="Répétez le mot de passe" className="input"/>
                  {watch('password') && watch('confirm') && watch('password') !== watch('confirm') && (
                    <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin"/> Enregistrement...</> : 'Réinitialiser le mot de passe'}
                </button>
              </form>
            </>
          )}
          <div className="mt-4 pt-4 border-t border-border text-center">
            <Link href="/login" className="text-sm text-brand-600 hover:underline">Retour à la connexion</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
