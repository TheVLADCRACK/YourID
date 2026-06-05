'use client';
import { motion } from 'framer-motion';
import { BarChart2, Zap, Shield, Globe, Smartphone, Bot, Users, Download, TrendingUp } from 'lucide-react';

const features = [
  { icon: BarChart2, title: 'Analytics avancés', desc: 'Suivez vos revenus, conversions et sources de trafic en temps réel.', color: 'text-blue-500 bg-blue-50' },
  { icon: Zap, title: 'Boutique instantanée', desc: 'Votre boutique en ligne disponible en quelques minutes.', color: 'text-yellow-500 bg-yellow-50' },
  { icon: Shield, title: 'Paiements sécurisés', desc: 'MTN MoMo, Orange Money, Wave, cartes bancaires. Sécurisé et fiable.', color: 'text-brand-500 bg-brand-50' },
  { icon: Globe, title: 'Marketplace globale', desc: 'Vos produits exposés à des milliers d\'acheteurs potentiels.', color: 'text-purple-500 bg-purple-50' },
  { icon: Smartphone, title: 'Mobile first', desc: 'Interface optimisée pour mobile. Achetez et vendez partout.', color: 'text-pink-500 bg-pink-50' },
  { icon: Bot, title: 'IA intégrée', desc: 'Générez vos descriptions produits et pages de vente avec l\'IA.', color: 'text-indigo-500 bg-indigo-50' },
  { icon: Users, title: 'Gestion clients', desc: 'CRM intégré pour gérer vos clients et leur historique d\'achat.', color: 'text-orange-500 bg-orange-50' },
  { icon: Download, title: 'Livraison auto', desc: 'Vos fichiers sont livrés automatiquement après chaque paiement.', color: 'text-teal-500 bg-teal-50' },
  { icon: TrendingUp, title: '95% pour vous', desc: 'Nous ne prélevons que 15%. Le reste vous appartient.', color: 'text-green-500 bg-green-50' },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="badge bg-brand-50 text-brand-600 mb-4">Fonctionnalités</span>
          <h2 className="text-4xl font-black text-gray-900">Tout ce dont vous avez besoin</h2>
          <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">Une plateforme complète pensée pour les créateurs africains et internationaux.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="card hover:shadow-soft transition-all group hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color} group-hover:scale-110 transition-transform`}>
                <f.icon size={22} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
