'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Upload, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const schema = z.object({
  title: z.string().min(3, 'Le titre doit avoir au moins 3 caractères'),
  description: z.string().min(20, 'La description doit avoir au moins 20 caractères'),
  price: z.number().min(100, 'Prix minimum: 100'),
  type: z.string(),
  categoryId: z.string().optional(),
  isMarketplace: z.boolean().default(true),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

type FormData = z.infer<typeof schema>;

const productTypes = [
  { value: 'EBOOK', label: '📘 Ebook / PDF', desc: 'Livres numériques, guides, rapports' },
  { value: 'COURSE', label: '🎓 Formation', desc: 'Cours vidéo, programmes complets' },
  { value: 'AUDIO', label: '🎵 Audio', desc: 'Podcasts, musiques, formations audio' },
  { value: 'TEMPLATE', label: '🎨 Template', desc: 'Modèles, maquettes, designs' },
  { value: 'SOFTWARE', label: '💻 Logiciel', desc: 'Applications, outils, scripts' },
  { value: 'SERVICE', label: '🤝 Service', desc: 'Consulting, coaching, services' },
  { value: 'OTHER', label: '📦 Autre', desc: 'Tout autre produit numérique' },
];

export function CreateProductModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => api.get('/products/categories').then(r => r.data) });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EBOOK', status: 'DRAFT', isMarketplace: true },
  });

  const createProduct = useMutation({
    mutationFn: async (data: FormData) => {
      const product = await api.post('/products', data).then(r => r.data);
      if (file && product.id) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('name', file.name);
        await api.post(`/files/product/${product.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      return product;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Produit créé avec succès !'); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur lors de la création'),
  });

  const selectedType = watch('type');
  const steps = ['Type', 'Infos', 'Prix & Fichier', 'Publication'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border">
          <h2 className="text-xl font-bold text-gray-900">Nouveau produit</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        {/* Steps indicator */}
        <div className="px-8 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all ${i + 1 === step ? 'bg-brand-500 text-white' : i + 1 < step ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
                  {i + 1 < step ? <Check size={10} /> : <span>{i + 1}</span>}
                  {s}
                </div>
                {i < steps.length - 1 && <ChevronRight size={14} className="text-gray-300" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="font-semibold text-gray-900 mb-4">Quel type de produit vendez-vous ?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {productTypes.map(t => (
                    <button key={t.value} type="button" onClick={() => setValue('type', t.value)}
                      className={`text-left p-4 rounded-2xl border-2 transition-all hover:border-brand-300 ${selectedType === t.value ? 'border-brand-500 bg-brand-50' : 'border-border'}`}>
                      <p className="font-semibold text-sm text-gray-900">{t.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="label">Titre du produit *</label>
                  <input {...register('title')} placeholder="Ex: Guide ultime du e-commerce africain" className="input" />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="label">Description *</label>
                  <textarea {...register('description')} rows={5} placeholder="Décrivez votre produit, ses bénéfices, ce que le client va obtenir..." className="input resize-none" />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
                <div>
                  <label className="label">Catégorie</label>
                  <select {...register('categoryId')} className="input">
                    <option value="">Sélectionner une catégorie</option>
                    {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <label className="label">Prix (en {user?.store?.currency || 'FCFA'}) *</label>
                  <div className="relative">
                    <input {...register('price', { valueAsNumber: true })} type="number" placeholder="5000" className="input pr-16" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">{user?.store?.currency}</span>
                  </div>
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                  <p className="text-xs text-gray-400 mt-1">Commission plateforme 15% — vous recevrez {watch('price') ? Math.round(watch('price') * 0.85).toLocaleString() : '—'} {user?.store?.currency}</p>
                </div>

                <div>
                  <label className="label">Fichier produit</label>
                  <label className="flex flex-col items-center gap-3 border-2 border-dashed border-border rounded-2xl p-8 cursor-pointer hover:border-brand-300 hover:bg-brand-50/30 transition-all">
                    <Upload size={32} className="text-gray-300" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">{file ? file.name : 'Glisser-déposer ou cliquer pour uploader'}</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, ZIP, MP3, MP4, DOCX, PPTX — Max 500 Mo</p>
                    </div>
                    <input type="file" className="hidden" accept=".pdf,.zip,.mp3,.mp4,.docx,.pptx,.txt,.doc,.rar" onChange={e => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Publier sur la marketplace</p>
                    <p className="text-xs text-gray-500">Votre produit sera visible par tous les acheteurs</p>
                  </div>
                  <button type="button" onClick={() => setValue('isMarketplace', !watch('isMarketplace'))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${watch('isMarketplace') ? 'bg-brand-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${watch('isMarketplace') ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="font-semibold text-gray-900">Statut de publication</h3>
                {[
                  { value: 'DRAFT', label: '📝 Brouillon', desc: 'Sauvegarder sans publier. Vous pourrez le publier plus tard.' },
                  { value: 'PUBLISHED', label: '🚀 Publier maintenant', desc: 'Votre produit sera immédiatement disponible à l\'achat.' },
                ].map(s => (
                  <button key={s.value} type="button" onClick={() => setValue('status', s.value as any)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${watch('status') === s.value ? 'border-brand-500 bg-brand-50' : 'border-border hover:border-brand-200'}`}>
                    <p className="font-semibold text-gray-900">{s.label}</p>
                    <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border flex items-center justify-between">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="btn-secondary">
            {step === 1 ? 'Annuler' : <><ChevronLeft size={16} /> Retour</>}
          </button>
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} className="btn-primary">
              Suivant <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit(d => createProduct.mutate(d))} disabled={createProduct.isPending} className="btn-primary">
              {createProduct.isPending ? <><Loader2 size={16} className="animate-spin" /> Création...</> : <><Check size={16} /> Créer le produit</>}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
