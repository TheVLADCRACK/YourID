'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Store, Globe, Palette } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { CURRENCIES, COUNTRIES } from '@/types/constants';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();

  const { register: regStore, handleSubmit: hsStore, reset: resetStore, formState: { isSubmitting: si1 } } = useForm();
  const { register: regProfile, handleSubmit: hsProfile, reset: resetProfile, formState: { isSubmitting: si2 } } = useForm();

  useEffect(() => {
    if (user?.store) resetStore({ name: user.store.name, currency: user.store.currency, description: '' });
    if (user) resetProfile({ firstName: user.firstName, lastName: user.lastName, bio: user.bio || '' });
  }, [user]);

  const updateStore = useMutation({
    mutationFn: (d: any) => api.put('/stores/me', d),
    onSuccess: () => toast.success('Boutique mise à jour'),
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });
  const updateProfile = useMutation({
    mutationFn: (d: any) => api.put('/users/me', d).then(r => r.data),
    onSuccess: (d) => { updateUser(d); toast.success('Profil mis à jour'); },
  });

  const Section = ({ icon: Icon, title, children }: any) => (
    <div className="card">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><Icon size={18}/></div>
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="page-title">Paramètres</h1></div>

      <Section icon={Store} title="Ma boutique">
        <form onSubmit={hsStore(d => updateStore.mutate(d))} className="space-y-4">
          <div><label className="label">Nom de la boutique</label><input {...regStore('name')} className="input"/></div>
          <div><label className="label">Description</label><textarea {...regStore('description')} rows={3} className="input resize-none"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Devise</label>
              <select {...regStore('currency')} className="input">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} – {c.symbol}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Pays</label>
              <select {...regStore('country')} className="input">
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['website','twitter','instagram','tiktok'].map(f => (
              <div key={f}><label className="label capitalize">{f}</label><input {...regStore(f)} placeholder={`https://${f}.com/...`} className="input text-sm"/></div>
            ))}
          </div>
          <button type="submit" disabled={updateStore.isPending} className="btn-primary">
            {updateStore.isPending ? <><Loader2 size={14} className="animate-spin"/> Sauvegarde...</> : 'Sauvegarder la boutique'}
          </button>
        </form>
      </Section>

      <Section icon={Globe} title="Mon profil">
        <form onSubmit={hsProfile(d => updateProfile.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Prénom</label><input {...regProfile('firstName')} className="input"/></div>
            <div><label className="label">Nom</label><input {...regProfile('lastName')} className="input"/></div>
          </div>
          <div><label className="label">Bio</label><textarea {...regProfile('bio')} rows={3} placeholder="Décrivez-vous en quelques mots..." className="input resize-none"/></div>
          <button type="submit" disabled={updateProfile.isPending} className="btn-primary">
            {updateProfile.isPending ? <><Loader2 size={14} className="animate-spin"/> Sauvegarde...</> : 'Sauvegarder le profil'}
          </button>
        </form>
      </Section>

      <Section icon={Palette} title="Apparence">
        <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
          <p>URL de votre boutique publique:</p>
          <code className="text-brand-600 font-mono font-semibold">yourid.com/@{user?.username}</code>
          <p className="mt-3">Domaine personnalisé disponible sur le plan Pro.</p>
        </div>
      </Section>
    </div>
  );
}
