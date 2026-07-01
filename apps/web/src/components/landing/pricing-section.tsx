'use client';
import { IconCheck } from '@/components/ui/svg-icons';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';

const plans = [
  { name: 'Gratuit', price: 0, currency: 'FCFA/mois', commission: '15%', features: ['Boutique personnalisée', 'Produits illimités', 'Marketplace intégrée', 'Paiements mobile money', 'Analytics de base', '1 Go de stockage'], cta: 'Commencer gratuitement', featured: false },
  { name: 'Pro', price: 9900, currency: 'FCFA/mois', commission: '10%', features: ['Tout du plan Gratuit', 'Commission réduite à 10%', 'Domaine personnalisé', 'Analytics avancés', 'IA génération contenu', '10 Go de stockage', 'Support prioritaire'], cta: 'Essayer 14 jours gratuit', featured: true },
  { name: 'Business', price: 24900, currency: 'FCFA/mois', commission: '5%', features: ['Tout du plan Pro', 'Commission à 5%', 'Équipe multi-membres', 'API publique', 'Webhooks avancés', '100 Go de stockage', 'Manager dédié'], cta: 'Contacter les ventes', featured: false },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="badge bg-brand-50 text-brand-600 mb-4">Tarification</span>
          <h2 className="text-4xl font-black text-gray-900">Simple et transparent</h2>
          <p className="text-gray-500 mt-3 text-lg">Commencez gratuitement. Évoluez quand vous êtes prêt.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`rounded-3xl border-2 p-8 relative ${plan.featured ? 'border-brand-500 shadow-elevated bg-white' : 'border-border bg-white hover:shadow-soft transition-shadow'}`}>
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">Le plus populaire</div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-4xl font-black text-gray-900">{plan.price === 0 ? 'Gratuit' : plan.price.toLocaleString()}</span>
                  {plan.price > 0 && <span className="text-gray-500 text-sm">{plan.currency}</span>}
                </div>
                <p className="text-brand-600 text-sm font-semibold mt-1">Commission {plan.commission} par vente</p>
              </div>

              <Link href="/register"
                className={`block w-full text-center py-3 rounded-xl font-semibold text-sm mb-6 transition-all ${plan.featured ? 'bg-brand-500 text-white hover:bg-brand-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {plan.cta}
              </Link>

              <ul className="space-y-3">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-gray-600">
                    <Check size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
