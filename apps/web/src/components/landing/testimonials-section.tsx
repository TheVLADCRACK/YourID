'use client';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Aminata Diallo', role: 'Coach Business · Dakar, Sénégal', text: 'Your ID a complètement changé ma façon de vendre. En 2 semaines, j\'ai déjà généré 350 000 FCFA avec mes formations. L\'interface est simple et les paiements arrivent direct.', emoji: '🇸🇳', revenue: '350k FCFA' },
  { name: 'Kwame Asante', role: 'Designer · Accra, Ghana', text: 'I sold my design templates and made GH₵2,800 in the first month. The marketplace feature brings buyers to me automatically. Absolutely love it!', emoji: '🇬🇭', revenue: 'GH₵2,800' },
  { name: 'Chidi Okafor', role: 'Développeur · Lagos, Nigeria', text: 'Les meilleures commissions du marché pour l\'Afrique. J\'ai testé Gumroad et c\'est incomparable pour nous. Support en français, paiements mobiles — parfait.', emoji: '🇳🇬', revenue: '₦180k' },
  { name: 'Fatou Camara', role: 'Auteure · Abidjan, Côte d\'Ivoire', text: 'Mon ebook s\'est vendu 89 fois en un mois grâce à la marketplace. Je n\'aurais jamais eu cette visibilité seule. Merci Your ID !', emoji: '🇨🇮', revenue: '267k FCFA' },
  { name: 'Serge Mbeki', role: 'Consultant · Douala, Cameroun', text: 'La fonction IA pour les descriptions produits est incroyable. Ça me fait gagner des heures. Et le dashboard est très clair pour suivre mes ventes.', emoji: '🇨🇲', revenue: '420k FCFA' },
  { name: 'Layla Benali', role: 'Formatrice · Casablanca, Maroc', text: 'J\'hésitais à m\'y mettre mais en 1 heure ma boutique était en ligne. Les paiements par carte fonctionnent très bien. Je recommande à 100%.', emoji: '🇲🇦', revenue: '15,000 MAD' },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="badge bg-brand-50 text-brand-600 mb-4">Témoignages</span>
          <h2 className="text-4xl font-black text-gray-900">Ils ont transformé leur savoir en revenus</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="card hover:shadow-soft transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(s => <Star key={s} size={14} className="fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-xl">{t.emoji}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
                <div className="bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1 rounded-full">{t.revenue}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
