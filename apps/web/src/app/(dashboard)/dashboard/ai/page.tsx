'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Loader2, Copy, Check, FileText, Layout } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function AiPage() {
  const [tab, setTab] = useState<'description'|'salespage'>('description');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const { register: r1, handleSubmit: hs1 } = useForm({ defaultValues: { title: '', category: '', keywords: '' } });
  const { register: r2, handleSubmit: hs2 } = useForm({ defaultValues: { title: '', audience: '', promise: '' } });

  const { data: history } = useQuery({ queryKey: ['ai-history'], queryFn: () => api.get('/ai/history').then(r => r.data) });

  const genDesc = useMutation({
    mutationFn: (d: any) => api.post('/ai/generate-description', { ...d, keywords: d.keywords.split(',').map((k: string) => k.trim()) }).then(r => r.data),
    onSuccess: d => { setResult(d.description); toast.success('Description générée !'); },
    onError: () => toast.error('Erreur de génération — vérifiez votre clé OpenAI'),
  });

  const genPage = useMutation({
    mutationFn: (d: any) => api.post('/ai/generate-sales-page', d).then(r => r.data),
    onSuccess: d => { setResult(JSON.stringify(d.page, null, 2)); toast.success('Page de vente générée !'); },
    onError: () => toast.error('Erreur de génération'),
  });

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white"><Bot size={20}/></div>
        <div><h1 className="page-title">IA Assistant</h1><p className="text-gray-500 text-sm">Générez du contenu de vente optimisé</p></div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
            {[{id:'description',icon:FileText,label:'Description produit'},{id:'salespage',icon:Layout,label:'Page de vente'}].map(t => (
              <button key={t.id} onClick={() => { setTab(t.id as any); setResult(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                <t.icon size={15}/> {t.label}
              </button>
            ))}
          </div>

          <div className="card">
            {tab === 'description' ? (
              <form onSubmit={hs1(d => genDesc.mutate(d))} className="space-y-4">
                <div><label className="label">Titre du produit</label><input {...r1('title', { required: true })} placeholder="Guide E-Commerce Africain" className="input"/></div>
                <div><label className="label">Catégorie</label><input {...r1('category', { required: true })} placeholder="Ebook / Marketing" className="input"/></div>
                <div><label className="label">Mots-clés (séparés par des virgules)</label><input {...r1('keywords', { required: true })} placeholder="e-commerce, afrique, vente en ligne" className="input"/></div>
                <button type="submit" disabled={genDesc.isPending} className="btn-primary w-full">
                  {genDesc.isPending ? <><Loader2 size={16} className="animate-spin"/> Génération en cours...</> : <><Sparkles size={16}/> Générer la description</>}
                </button>
              </form>
            ) : (
              <form onSubmit={hs2(d => genPage.mutate(d))} className="space-y-4">
                <div><label className="label">Titre du produit</label><input {...r2('title', { required: true })} placeholder="Formation Marketing Digital" className="input"/></div>
                <div><label className="label">Audience cible</label><input {...r2('audience', { required: true })} placeholder="Entrepreneurs africains débutants en marketing" className="input"/></div>
                <div><label className="label">Promesse principale</label><input {...r2('promise', { required: true })} placeholder="Doubler vos ventes en 30 jours" className="input"/></div>
                <button type="submit" disabled={genPage.isPending} className="btn-primary w-full">
                  {genPage.isPending ? <><Loader2 size={16} className="animate-spin"/> Génération...</> : <><Sparkles size={16}/> Générer la page de vente</>}
                </button>
              </form>
            )}
          </div>

          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-900 text-sm">Résultat généré</p>
                <button onClick={copy} className="flex items-center gap-1.5 text-xs text-brand-600 hover:underline">
                  {copied ? <><Check size={12}/> Copié !</> : <><Copy size={12}/> Copier</>}
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">{result}</div>
            </motion.div>
          )}
        </div>

        {/* History */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 text-sm">Historique</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history?.length ? history.map((h: any) => (
                <button key={h.id} onClick={() => setResult(h.result)} className="w-full text-left p-3 bg-gray-50 hover:bg-brand-50 rounded-xl transition-colors">
                  <p className="text-xs font-semibold text-gray-700 capitalize">{h.type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{h.prompt.substring(0, 60)}...</p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(h.createdAt).toLocaleDateString('fr')}</p>
                </button>
              )) : <p className="text-gray-400 text-sm text-center py-6">Aucune génération</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
