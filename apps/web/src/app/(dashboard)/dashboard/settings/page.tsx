'use client';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Store, Globe, ImageIcon, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { CURRENCIES, COUNTRIES } from '@/types/constants';
import { getInitials } from '@/lib/utils';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();

  // Boutique form
  const { register: regStore, handleSubmit: hsStore, reset: resetStore, formState: { isSubmitting: si1 } } = useForm();
  // Profile form
  const { register: regProfile, handleSubmit: hsProfile, reset: resetProfile, formState: { isSubmitting: si2 } } = useForm();

  // Image previews
  const [logoPreview, setLogoPreview] = useState<string | null>(user?.store?.logo ?? null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(user?.store?.banner ?? null);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.store) {
      resetStore({
        name: user.store.name,
        currency: user.store.currency,
        description: (user.store as any).description || '',
        website: (user.store as any).website || '',
        twitter: (user.store as any).twitter || '',
        instagram: (user.store as any).instagram || '',
        tiktok: (user.store as any).tiktok || '',
      });
      setLogoPreview((user.store as any).logo || null);
      setBannerPreview((user.store as any).banner || null);
    }
    if (user) {
      resetProfile({ firstName: user.firstName, lastName: user.lastName, bio: (user as any).bio || '' });
    }
  }, [user]);

  const updateStore = useMutation({
    mutationFn: (d: any) => api.put('/stores/me', d).then(r => r.data),
    onSuccess: () => toast.success('Boutique mise à jour'),
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const updateProfile = useMutation({
    mutationFn: (d: any) => api.put('/users/me', d).then(r => r.data),
    onSuccess: (d) => { updateUser(d); toast.success('Profil mis à jour'); },
  });

  // MODIFICATION 6: upload logo or banner
  const uploadImage = async (file: File, type: 'logo' | 'banner' | 'favicon') => {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post(`/files/store/${type}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url as string;
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
    const toastId = toast.loading('Upload du logo...');
    try {
      const url = await uploadImage(file, 'logo');
      setLogoPreview(url);
      toast.success('Logo mis à jour !', { id: toastId });
    } catch {
      setLogoPreview(user?.store?.logo ?? null);
      toast.error('Échec de l\'upload', { id: toastId });
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setBannerPreview(preview);
    const toastId = toast.loading('Upload de la bannière...');
    try {
      const url = await uploadImage(file, 'banner');
      setBannerPreview(url);
      toast.success('Bannière mise à jour !', { id: toastId });
    } catch {
      setBannerPreview(user?.store?.banner ?? null);
      toast.error('Échec de l\'upload', { id: toastId });
    }
  };


  const avatarRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string|null>(user?.avatar ?? null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const toastId = toast.loading('Upload de la photo...');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/files/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAvatarPreview(data.url);
      toast.success('Photo mise à jour !', { id: toastId });
    } catch {
      setAvatarPreview(user?.avatar ?? null);
      toast.error('Échec de l\'upload', { id: toastId });
    }
  };

  const Section = ({ icon: Icon, title, children }: any) => (
    <div className="card">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
          <Icon size={18} />
        </div>
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="page-title">Paramètres</h1></div>

      {/* MODIFICATION 6: Visual identity section */}
      <Section icon={ImageIcon} title="Identité visuelle">
        {/* Banner */}
        <div className="mb-5">
          <label className="label">Bannière de la boutique</label>
          <div className="relative h-32 rounded-2xl overflow-hidden border-2 border-dashed border-border group cursor-pointer"
            onClick={() => bannerRef.current?.click()}>
            {bannerPreview ? (
              <>
                <img src={bannerPreview} alt="Bannière" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white text-sm font-semibold">
                    <Upload size={16} /> Changer la bannière
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 group-hover:text-brand-500 transition-colors bg-gray-50">
                <BannerIllustration />
                <span className="text-xs font-medium">Cliquer pour ajouter une bannière</span>
                <span className="text-xs text-gray-300">JPG, PNG, WebP — recommandé 1200×300px</span>
              </div>
            )}
          </div>
          <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
        </div>

        {/* Logo */}
        <div>
          <label className="label">Logo de la boutique</label>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-border group cursor-pointer flex-shrink-0"
              onClick={() => logoRef.current?.click()}>
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload size={14} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-brand-50 flex flex-col items-center justify-center gap-1 text-brand-300 group-hover:text-brand-500 transition-colors">
                  <LogoIllustration initials={getInitials(user?.store?.name || 'YI')} />
                </div>
              )}
            </div>
            <div>
              <button type="button" onClick={() => logoRef.current?.click()}
                className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
                <Upload size={14} /> {logoPreview ? 'Changer le logo' : 'Ajouter un logo'}
              </button>
              <p className="text-xs text-gray-400 mt-1.5">PNG, JPG — recommandé 200×200px</p>
              {logoPreview && (
                <button type="button" onClick={() => setLogoPreview(null)}
                  className="text-xs text-red-400 hover:text-red-600 mt-1 flex items-center gap-1">
                  <X size={10} /> Supprimer
                </button>
              )}
            </div>
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        </div>
      </Section>

      {/* Store info */}
      <Section icon={Store} title="Ma boutique">
        <form onSubmit={hsStore(d => updateStore.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Nom de la boutique</label>
            <input {...regStore('name')} className="input" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...regStore('description')} rows={3} placeholder="Décrivez votre boutique en quelques mots..." className="input resize-none" />
          </div>
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

          {/* Social links */}
          <div>
            <label className="label">Réseaux sociaux</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'website', label: 'Site web', placeholder: 'https://monsite.com' },
                { key: 'twitter', label: 'Twitter / X', placeholder: '@username' },
                { key: 'instagram', label: 'Instagram', placeholder: '@username' },
                { key: 'tiktok', label: 'TikTok', placeholder: '@username' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                  <input {...regStore(f.key)} placeholder={f.placeholder} className="input text-sm py-2" />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={updateStore.isPending} className="btn-primary">
            {updateStore.isPending
              ? <><Loader2 size={14} className="animate-spin" /> Sauvegarde...</>
              : 'Sauvegarder la boutique'}
          </button>
        </form>
      </Section>

      {/* Profile */}
      <Section icon={Globe} title="Mon profil">
        <form onSubmit={hsProfile(d => updateProfile.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Photo de profil</label>
            <div className="flex items-center gap-4">
              <div onClick={() => avatarRef.current?.click()} className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-dashed border-border cursor-pointer hover:border-brand-400 transition-colors group">
                {avatarPreview
                  ? <><img src={avatarPreview} className="w-full h-full object-cover" alt=""/><div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 9V3M7 3L4.5 5.5M7 3l2.5 2.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/><line x1="2" y1="12" x2="12" y2="12" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg></div></>
                  : <div className="w-full h-full bg-brand-100 flex items-center justify-center text-brand-600 font-black text-xl">{getInitials(`${user?.firstName} ${user?.lastName}`)}</div>}
              </div>
              <div>
                <button type="button" onClick={() => avatarRef.current?.click()} className="btn-secondary text-sm py-2 px-4">Changer la photo</button>
                <p className="text-xs text-gray-400 mt-1.5">JPG, PNG — max 5 Mo</p>
              </div>
            </div>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Prénom</label><input {...regProfile('firstName')} className="input" /></div>
            <div><label className="label">Nom</label><input {...regProfile('lastName')} className="input" /></div>
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea {...regProfile('bio')} rows={3} placeholder="Décrivez-vous en quelques mots..." className="input resize-none" />
          </div>
          <button type="submit" disabled={updateProfile.isPending} className="btn-primary">
            {updateProfile.isPending
              ? <><Loader2 size={14} className="animate-spin" /> Sauvegarde...</>
              : 'Sauvegarder le profil'}
          </button>
        </form>
      </Section>

      {/* Store URL info */}
      <div className="card bg-gray-50 border-gray-100">
        <p className="text-sm text-gray-600 mb-1">URL publique de votre boutique :</p>
        <code className="text-brand-600 font-mono font-semibold text-sm">yourid.com/@{user?.username}</code>
        <p className="text-xs text-gray-400 mt-2">Domaine personnalisé disponible sur le plan Pro.</p>
      </div>
    </div>
  );
}

// ─── Inline SVG illustrations ────────────────────────────────────────────────

function BannerIllustration() {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
      <rect x="1" y="1" width="46" height="30" rx="4" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx="12" cy="12" r="4" fill="#E5E7EB" />
      <path d="M1 22l10-8 8 6 7-5 14 10" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoIllustration({ initials }: { initials: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-500 font-black text-xl rounded-2xl">
      {initials}
    </div>
  );
}
