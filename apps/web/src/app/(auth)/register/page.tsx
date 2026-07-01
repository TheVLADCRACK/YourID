'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, Check, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { CURRENCIES, COUNTRIES } from '@/types/constants';
import { slugify } from '@/lib/utils';

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  username: z.string().min(3).regex(/^[a-z0-9_]+$/, 'Minuscules, chiffres et _ uniquement'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '1 majuscule, 1 minuscule, 1 chiffre'),
  storeName: z.string().min(2),
  storeSlug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  currency: z.string().default('XOF'),
  country: z.string().default('SN'),
});
type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: authRegister } = useAuthStore();
  const [step, setStep] = useState(1);
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'XOF', country: 'SN' },
  });

  const onSubmit = async (data: Form) => {
    try {
      await authRegister(data);
      toast.success('Bienvenue sur Your ID !');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erreur lors de la création du compte');
      setStep(1);
    }
  };

  const steps = ['Compte', 'Boutique'];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center"><span className="text-white font-black">YI</span></div>
            <span className="font-black text-2xl text-gray-900">Your <span className="text-brand-500">ID</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Créer ma boutique</h1>
          <p className="text-gray-500 mt-1">Gratuit — Prêt en 5 minutes</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${i + 1 === step ? 'bg-brand-500 text-white' : i + 1 < step ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
                {i + 1 < step ? <Check size={10}/> : i + 1}  {s}
              </div>
              {i < steps.length - 1 && <ChevronRight size={14} className="text-gray-300"/>}
            </div>
          ))}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Prénom</label>
                      <input {...register('firstName')} placeholder="Kofi" className="input"/>
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="label">Nom</label>
                      <input {...register('lastName')} placeholder="Mensah" className="input"/>
                    </div>
                  </div>
                  <div>
                    <label className="label">Nom d'utilisateur</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                      <input {...register('username')} placeholder="kofimensah" className="input pl-7"/>
                    </div>
                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input {...register('email')} type="email" placeholder="kofi@exemple.com" className="input"/>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="label">Mot de passe</label>
                    <div className="relative">
                      <input {...register('password')} type={showPwd ? 'text' : 'password'} placeholder="Min. 8 chars, 1 maj, 1 chiffre" className="input pr-10"/>
                      <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                  <button type="button" onClick={() => setStep(2)} className="btn-primary w-full">
                    Suivant <ChevronRight size={16}/>
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <label className="label">Nom de la boutique</label>
                    <input {...register('storeName')} placeholder="Digital Africa" className="input"
                      onChange={e => { register('storeName').onChange(e); setValue('storeSlug', slugify(e.target.value)); }}/>
                    {errors.storeName && <p className="text-red-500 text-xs mt-1">{errors.storeName.message}</p>}
                  </div>
                  <div>
                    <label className="label">URL de la boutique</label>
                    <div className="flex items-center border border-border rounded-xl overflow-hidden">
                      <span className="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-r border-border">yourid.com/@</span>
                      <input {...register('storeSlug')} className="flex-1 px-3 py-3 outline-none text-sm"/>
                    </div>
                    {errors.storeSlug && <p className="text-red-500 text-xs mt-1">{errors.storeSlug.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Pays</label>
                      <select {...register('country')} className="input">
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Devise</label>
                      <select {...register('currency')} className="input">
                        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} – {c.symbol}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Retour</button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                      {isSubmitting ? <><Loader2 size={16} className="animate-spin"/> Création...</> : 'Créer ma boutique →'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4 pt-4 border-t border-border">
            Déjà un compte ?{' '}<Link href="/login" className="text-brand-600 font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
