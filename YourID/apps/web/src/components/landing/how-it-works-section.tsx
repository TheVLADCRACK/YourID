'use client';
import { motion } from 'framer-motion';
import { Store, Share2, CreditCard } from 'lucide-react';

const steps = [
  { icon: Store, number: '01', title: 'Créez votre boutique', desc: 'Inscrivez-vous et configurez votre boutique en 5 minutes. Choisissez votre nom, couleurs et logo.', color: 'bg-brand-50 text-brand-600' },
  { icon: Share2, number: '02', title: 'Publiez vos produits', desc: 'Uploadez vos ebooks, formations, templates ou services. Notre IA vous aide à rédiger vos descriptions.', color: 'bg-purple-50 text-purple-600' },
  { icon: CreditCard, number: '03', title: 'Encaissez vos revenus', desc: 'Recevez vos paiements via MTN MoMo, Orange Money, Wave, carte bancaire et plus encore.', color: 'bg-blue-50 text-blue-600' },
];

export function HowItWorksSection() {
  return (
    <section id="how" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="badge bg-brand-50 text-brand-600 mb-4">Comment ça marche</span>
          <h2 className="text-4xl font-black text-gray-900">3 étapes pour vendre</h2>
          <p className="text-gray-500 mt-3 text-lg">De zéro à votre première vente en moins de 30 minutes.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-px bg-gradient-to-r from-brand-200 to-brand-200" />

          {steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="relative bg-white rounded-2xl border border-border p-8 text-center hover:shadow-soft transition-shadow group">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${step.color} group-hover:scale-110 transition-transform`}>
                <step.icon size={28} />
              </div>
              <div className="absolute top-6 right-6 text-5xl font-black text-gray-100">{step.number}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-500 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
