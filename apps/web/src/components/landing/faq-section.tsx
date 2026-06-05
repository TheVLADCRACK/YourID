'use client';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';

const faqs = [
  { q: 'Combien de temps faut-il pour créer ma boutique ?', a: 'Moins de 5 minutes ! Vous créez votre compte, choisissez le nom de votre boutique, uploadez votre premier produit et votre boutique est en ligne.' },
  { q: 'Quels moyens de paiement sont acceptés ?', a: 'MTN Mobile Money, Orange Money, Wave, Airtel Money, Moov Money et les cartes bancaires Visa/Mastercard. Nous ajoutons régulièrement de nouveaux modes de paiement.' },
  { q: 'Quel est le montant des commissions ?', a: 'Plan Gratuit: 15% par vente. Plan Pro: 10%. Plan Business: 5%. Il n\'y a aucun frais cachés ni d\'abonnement obligatoire pour commencer.' },
  { q: 'Comment reçois-je mon argent ?', a: 'Vous demandez un retrait directement depuis votre dashboard. Nous traitons les demandes sous 24-48h ouvrées via le moyen de paiement de votre choix.' },
  { q: 'Puis-je vendre des formations vidéo ?', a: 'Oui ! Vous pouvez vendre tout type de fichier numérique : PDF, ZIP, MP3, MP4, DOCX, PPTX, templates, logiciels et plus encore.' },
  { q: 'Mon argent est-il en sécurité ?', a: 'Absolument. Nous utilisons un chiffrement SSL/TLS, des systèmes anti-fraude et des vérifications KYC pour protéger vos revenus.' },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="badge bg-brand-50 text-brand-600 mb-4">FAQ</span>
          <h2 className="text-4xl font-black text-gray-900">Questions fréquentes</h2>
        </motion.div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="border border-border rounded-2xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                <ChevronDown size={18} className={`text-gray-500 flex-shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="py-24 bg-brand-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />
      <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-5xl font-black mb-6">Prêt à vendre vos premiers produits ?</h2>
          <p className="text-brand-100 text-xl mb-10 max-w-2xl mx-auto">Rejoignez plus de 2 500 créateurs qui génèrent leurs revenus avec Your ID. Gratuit pour commencer.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white text-brand-600 font-bold px-8 py-4 rounded-2xl text-base hover:bg-brand-50 transition-colors group">
              Créer ma boutique gratuite
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-2xl text-base hover:border-white/60 transition-colors">
              Explorer la marketplace
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
