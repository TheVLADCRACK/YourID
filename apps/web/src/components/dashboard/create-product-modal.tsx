'use client';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Loader2, Sparkles, PenLine, Link, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const TYPES = [
  { value: 'EBOOK',    color:'#00A86B', label:'Ebook / PDF',  desc:'Guides, livres numériques' },
  { value: 'COURSE',   color:'#6366F1', label:'Formation',    desc:'Cours vidéo, programmes' },
  { value: 'AUDIO',    color:'#F59E0B', label:'Audio',        desc:'Podcasts, musiques' },
  { value: 'TEMPLATE', color:'#EC4899', label:'Template',     desc:'Modèles, maquettes' },
  { value: 'SOFTWARE', color:'#3B82F6', label:'Logiciel',     desc:'Applications, outils' },
  { value: 'SERVICE',  color:'#10B981', label:'Service',      desc:'Consulting, coaching' },
  { value: 'OTHER',    color:'#8B5CF6', label:'Autre',        desc:'Tout contenu numérique' },
];

const CONTENT_PLACEHOLDERS: Record<string, string> = {
  youtube: 'https://youtu.be/xxxxx ou https://youtube.com/watch?v=xxxxx',
  vimeo:   'https://vimeo.com/xxxxx',
  gdrive:  'https://drive.google.com/file/d/xxxxx/view',
  dropbox: 'https://www.dropbox.com/s/xxxxx/fichier.pdf',
  icloud:  'https://www.icloud.com/iclouddrive/xxxxx',
};

function TypeIcon({ color, type }: { color: string; type: string }) {
  const paths: Record<string, React.ReactNode> = {
    EBOOK:    <><rect x="4" y="2" width="12" height="16" rx="2" fill={`${color}20`} stroke={color} strokeWidth="1.4"/><line x1="7" y1="7" x2="13" y2="7" stroke={color} strokeWidth="1.2" strokeLinecap="round"/><line x1="7" y1="10" x2="13" y2="10" stroke={color} strokeWidth="1.2" strokeLinecap="round"/><line x1="7" y1="13" x2="10" y2="13" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></>,
    COURSE:   <><circle cx="10" cy="10" r="8" fill={`${color}15`} stroke={color} strokeWidth="1.4"/><polygon points="8,7 8,13 14,10" fill={color}/></>,
    AUDIO:    <><rect x="7" y="2" width="6" height="11" rx="3" fill={`${color}20`} stroke={color} strokeWidth="1.4"/><path d="M4 10c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/><line x1="10" y1="16" x2="10" y2="19" stroke={color} strokeWidth="1.4" strokeLinecap="round"/></>,
    TEMPLATE: <><rect x="2" y="2" width="16" height="16" rx="3" fill={`${color}15`} stroke={color} strokeWidth="1.4"/><rect x="2" y="2" width="16" height="7" rx="3" fill={`${color}25`}/><line x1="5" y1="13" x2="15" y2="13" stroke={color} strokeWidth="1.2" strokeLinecap="round"/><line x1="5" y1="16" x2="11" y2="16" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></>,
    SOFTWARE: <><rect x="1" y="4" width="18" height="13" rx="2" fill={`${color}15`} stroke={color} strokeWidth="1.4"/><polyline points="5,10 8,13 5,16" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/><line x1="10" y1="16" x2="16" y2="16" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></>,
    SERVICE:  <><circle cx="10" cy="7" r="4" fill={`${color}20`} stroke={color} strokeWidth="1.4"/><path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/></>,
    OTHER:    <><rect x="3" y="3" width="14" height="14" rx="3" fill={`${color}15`} stroke={color} strokeWidth="1.4"/><line x1="10" y1="7" x2="10" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><line x1="7" y1="10" x2="13" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></>,
  };
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none">{paths[type] || paths.OTHER}</svg>;
}

function detectPlatform(url: string) {
  if (!url) return null;
  if (/youtube\.com|youtu\.be/.test(url)) return { id:'youtube', label:'YouTube', color:'#FF0000' };
  if (/vimeo\.com/.test(url)) return { id:'vimeo', label:'Vimeo', color:'#1AB7EA' };
  if (/drive\.google\.com/.test(url)) return { id:'gdrive', label:'Google Drive', color:'#0F9D58' };
  if (/dropbox\.com/.test(url)) return { id:'dropbox', label:'Dropbox', color:'#0061FE' };
  if (/icloud\.com/.test(url)) return { id:'icloud', label:'iCloud Drive', color:'#3395FF' };
  return { id:'url', label:'Lien externe', color:'#6B7280' };
}

export function CreateProductModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [descMode, setDescMode] = useState<'manual'|'ai'|null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiKeywords, setAiKeywords] = useState('');
  const [coverPreview, setCoverPreview] = useState<string|null>(null);
  const [coverFile, setCoverFile] = useState<File|null>(null);
  const [contentUrl, setContentUrl] = useState('');
  const coverRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/products/categories').then(r => r.data),
  });

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm({
    defaultValues: { type:'EBOOK', status:'DRAFT', isMarketplace:true, title:'', description:'', price:0, categoryId:'', contentNote: '' },
  });

  const platform = detectPlatform(contentUrl);

  const createProduct = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        categoryId: data.categoryId || null,
        contentUrl: (contentUrl || '').trim() || null,
        contentNote: data.contentNote?.trim() || null,
        coverImage: null,
      };

      // 1. Create product
      const product = await api.post('/products', payload).then(r => r.data);
      // 2. Upload cover image if provided
      if (coverFile && product.id) {
        const fd = new FormData();
        fd.append('file', coverFile);
        await api.post(`/files/product/${product.id}/cover`, fd).catch(() => null);
      }
      return product;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Produit créé !'); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur'),
  });

  const generateAI = async () => {
    const title = getValues('title');
    if (!title || title.length < 3) { toast.error('Renseignez d\'abord le titre'); return; }
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/generate-description', {
        title, category: categories?.find((c: any) => c.id === getValues('categoryId'))?.name || getValues('type'),
        keywords: aiKeywords.split(',').map((k: string) => k.trim()).filter(Boolean),
      });
      setValue('description', data.description);
      toast.success(`Description générée`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erreur IA');
    } finally { setAiLoading(false); }
  };

  const STEPS = ['Type', 'Couverture', 'Contenu', 'Prix', 'Publication'];
  const type = watch('type');
  const selectedType = TYPES.find(t => t.value === type) || TYPES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity:0, scale:.96 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.96 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border">
          <h2 className="text-lg font-bold text-gray-900">Nouveau produit</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18}/></button>
        </div>

        {/* Steps */}
        <div className="px-7 py-3 border-b border-border flex items-center gap-1.5 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all
                ${i+1===step ? 'bg-brand-500 text-white' : i+1<step ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-400'}`}>
                {i+1<step ? <Check size={10}/> : <span>{i+1}</span>}
                {s}
              </div>
              {i<STEPS.length-1 && <ChevronRight size={12} className="text-gray-300"/>}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          <AnimatePresence mode="wait">

            {/* STEP 1 — Type */}
            {step===1 && (
              <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <p className="text-sm text-gray-500 mb-4">Quel type de produit souhaitez-vous vendre ?</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => setValue('type', t.value)}
                      className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3
                        ${type===t.value ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-gray-300'}`}>
                      <div className="flex-shrink-0 mt-0.5"><TypeIcon color={t.color} type={t.value}/></div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{t.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Image de couverture + Infos */}
            {step===2 && (
              <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-5">
                {/* Cover image — obligatoire */}
                <div>
                  <label className="label flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-brand-500"/> Image de couverture <span className="text-red-400">*</span>
                  </label>
                  <div onClick={() => coverRef.current?.click()}
                    className={`relative cursor-pointer rounded-2xl border-2 border-dashed overflow-hidden transition-all
                      ${coverPreview ? 'border-brand-300 h-44' : 'border-border hover:border-brand-300 h-36'}`}>
                    {coverPreview ? (
                      <>
                        <img src={coverPreview} alt="Cover" className="w-full h-full object-cover"/>
                        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-sm font-semibold">Changer l'image</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                            <circle cx="11" cy="11" r="10" fill="#00A86B" opacity=".1" stroke="#00A86B" strokeWidth="1.5" strokeDasharray="4 2"/>
                            <path d="M11 15V7M11 7L7.5 10.5M11 7l3.5 3.5" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-600">Cliquer pour ajouter une image</p>
                        <p className="text-xs text-gray-400">JPG, PNG, WebP — recommandé 1280×720px</p>
                      </div>
                    )}
                  </div>
                  <input ref={coverRef} type="file" accept="image/*" className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setCoverFile(f);
                      setCoverPreview(URL.createObjectURL(f));
                    }}/>
                  {!coverPreview && <p className="text-xs text-red-400 mt-1">L'image de couverture est obligatoire</p>}
                </div>

                <div>
                  <label className="label">Titre du produit <span className="text-red-400">*</span></label>
                  <input {...register('title', {required:'Titre requis', minLength:{value:3,message:'Minimum 3 caractères'}})}
                    placeholder="Ex: Guide ultime du e-commerce africain" className="input"/>
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
                </div>

                <div>
                  <label className="label">Catégorie</label>
                  <select {...register('categoryId')} className="input">
                    <option value="">Sans catégorie</option>
                    {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Description — IA optionnelle */}
                <div>
                  <label className="label">Description <span className="text-red-400">*</span></label>
                  {!descMode && (
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <button type="button" onClick={() => setDescMode('manual')}
                        className="flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 border-border hover:border-brand-300 transition-all">
                        <PenLine size={20} className="text-gray-400"/>
                        <span className="text-sm font-semibold text-gray-700">Rédiger</span>
                        <span className="text-xs text-gray-400">Moi-même</span>
                      </button>
                      <button type="button" onClick={() => setDescMode('ai')}
                        className="flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 border-border hover:border-brand-300 transition-all">
                        <Sparkles size={20} className="text-gray-400"/>
                        <span className="text-sm font-semibold text-gray-700">Générer avec l'IA</span>
                        <span className="text-xs text-gray-400">Automatique</span>
                      </button>
                    </div>
                  )}
                  {descMode==='manual' && (
                    <div>
                      <textarea {...register('description',{required:'Description requise',minLength:{value:20,message:'Minimum 20 caractères'}})}
                        rows={5} placeholder="Décrivez votre produit, ses bénéfices..." className="input resize-none mt-1.5"/>
                      {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message as string}</p>}
                      <button type="button" onClick={() => setDescMode(null)} className="text-xs text-gray-400 hover:text-brand-600 mt-1">← Changer</button>
                    </div>
                  )}
                  {descMode==='ai' && (
                    <div className="mt-1.5 space-y-3">
                      <div className="bg-brand-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-brand-700 mb-2">Mots-clés (optionnel)</p>
                        <input value={aiKeywords} onChange={e => setAiKeywords(e.target.value)}
                          placeholder="ex: business, Afrique, débutant" className="input text-sm py-2"/>
                        <button type="button" onClick={generateAI} disabled={aiLoading} className="btn-primary mt-2 w-full text-sm py-2.5">
                          {aiLoading ? <><Loader2 size={14} className="animate-spin"/> Génération...</> : <><Sparkles size={14}/> Générer</>}
                        </button>
                      </div>
                      {watch('description') && (
                        <textarea {...register('description')} rows={5} className="input resize-none"/>
                      )}
                      <button type="button" onClick={() => { setDescMode(null); setValue('description',''); }}
                        className="text-xs text-gray-400 hover:text-brand-600">← Changer</button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Lien du contenu */}
            {step===3 && (
              <motion.div key="s3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-5">
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Link size={13} className="text-brand-500"/> Lien du contenu
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Collez le lien vers votre contenu. Après l'achat, l'acheteur recevra ce lien par email.
                  </p>

                  {/* Platform pills */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      {id:'youtube', label:'YouTube', color:'#FF0000'},
                      {id:'vimeo',   label:'Vimeo',   color:'#1AB7EA'},
                      {id:'gdrive',  label:'Google Drive', color:'#0F9D58'},
                      {id:'dropbox', label:'Dropbox', color:'#0061FE'},
                      {id:'icloud',  label:'iCloud', color:'#3395FF'},
                    ].map(p => (
                      <span key={p.id} className="text-xs font-medium px-2.5 py-1 rounded-full border"
                        style={{ borderColor:`${p.color}40`, color: p.color, backgroundColor:`${p.color}08` }}>
                        {p.label}
                      </span>
                    ))}
                  </div>

                  <input value={contentUrl} onChange={e => setContentUrl(e.target.value)}
                    placeholder="https://youtu.be/xxx  ou  https://drive.google.com/..."
                    className="input font-mono text-sm"/>

                  {platform && contentUrl && (
                    <div className="flex items-center gap-2 mt-2 p-2.5 rounded-lg"
                      style={{ backgroundColor:`${platform.color}10`, border:`1px solid ${platform.color}30` }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: platform.color }}/>
                      <p className="text-xs font-semibold" style={{ color: platform.color }}>
                        {platform.label} détecté
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2.5">
                    Assurez-vous que le lien est en mode "Partage public" ou "Tout le monde avec le lien".
                  </p>
                </div>

                {/* Optional note for buyer */}
                <div>
                  <label className="label">Instructions pour l'acheteur <span className="text-gray-400 font-normal">(optionnel)</span></label>
                  <textarea {...register('contentNote')} rows={3} className="input resize-none"
                    placeholder="Ex: Téléchargez le fichier depuis le lien ci-dessous. Mot de passe: yourid2025"/>
                </div>
              </motion.div>
            )}

            {/* STEP 4 — Prix */}
            {step===4 && (
              <motion.div key="s4" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-5">
                <div>
                  <label className="label">Prix ({user?.store?.currency || 'XOF'}) <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input {...register('price',{valueAsNumber:true,required:'Prix requis',min:{value:100,message:'Minimum 100'}})}
                      type="number" placeholder="5000" className="input pr-16"/>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      {user?.store?.currency}
                    </span>
                  </div>
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message as string}</p>}
                  {watch('price') > 0 && (
                    <div className="mt-2 p-3 bg-brand-50 rounded-xl">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Prix acheteur</span>
                        <span className="font-semibold">{Number(watch('price')).toLocaleString('fr')} {user?.store?.currency}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">Commission (15%)</span>
                        <span className="text-red-500">-{Math.round(watch('price')*0.15).toLocaleString('fr')} {user?.store?.currency}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold mt-1 pt-1 border-t border-brand-100">
                        <span className="text-gray-900">Vous recevez</span>
                        <span className="text-brand-600">{Math.round(watch('price')*0.85).toLocaleString('fr')} {user?.store?.currency}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Publier sur la marketplace</p>
                    <p className="text-xs text-gray-500 mt-0.5">Visible par tous les acheteurs</p>
                  </div>
                  <button type="button" onClick={() => setValue('isMarketplace', !watch('isMarketplace'))}
                    className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${watch('isMarketplace') ? 'bg-brand-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${watch('isMarketplace') ? 'right-0.5' : 'left-0.5'}`}/>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5 — Publication */}
            {step===5 && (
              <motion.div key="s5" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">Comment souhaitez-vous publier ce produit ?</p>
                {[
                  {value:'DRAFT',     label:'Brouillon',         desc:"Sauvegarder sans publier. Vous pourrez publier plus tard depuis votre tableau de bord."},
                  {value:'PUBLISHED', label:'Publier maintenant', desc:"Votre produit sera immédiatement visible et disponible à l'achat."},
                ].map(s => (
                  <button key={s.value} type="button" onClick={() => setValue('status', s.value as any)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-start gap-4
                      ${watch('status')===s.value ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-brand-200'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center
                      ${watch('status')===s.value ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`}>
                      {watch('status')===s.value && <div className="w-2 h-2 bg-white rounded-full"/>}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{s.label}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
                    </div>
                  </button>
                ))}

                {/* Récapitulatif */}
                <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                  <p className="font-semibold text-gray-700 mb-3">Récapitulatif</p>
                  <div className="flex items-center gap-2">
                    {coverPreview
                      ? <img src={coverPreview} className="w-10 h-7 object-cover rounded" alt=""/>
                      : <div className="w-10 h-7 bg-gray-200 rounded flex items-center justify-center"><ImageIcon size={12} className="text-gray-400"/></div>}
                    <span className="text-gray-900 font-medium">{watch('title') || '—'}</span>
                  </div>
                  {!coverPreview && <p className="text-xs text-red-400">Image de couverture manquante — retournez à l'étape 2</p>}
                  {contentUrl && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Link size={10}/> {platform?.label || 'Lien'} configuré
                    </p>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-border flex items-center justify-between">
          <button onClick={() => step>1 ? setStep(step-1) : onClose()} className="btn-secondary">
            {step===1 ? 'Annuler' : <><ChevronLeft size={16}/> Retour</>}
          </button>
          {step<5 ? (
            <button onClick={() => {
              if (step===2 && !coverPreview) { toast.error('Ajoutez une image de couverture'); return; }
              if (step===2 && !watch('title')) { toast.error('Ajoutez un titre'); return; }
              setStep(step+1);
            }} className="btn-primary">
              Suivant <ChevronRight size={16}/>
            </button>
          ) : (
            <button onClick={handleSubmit(d => createProduct.mutate(d))}
              disabled={createProduct.isPending || !coverPreview} className="btn-primary">
              {createProduct.isPending ? <><Loader2 size={16} className="animate-spin"/> Création...</> : <><Check size={16}/> Créer le produit</>}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
