'use client';
import { motion } from 'framer-motion';
import { formatNumber } from '@/lib/utils';

const stats = [
  { value: 2500, label: 'Vendeurs actifs', suffix: '+' },
  { value: 12000, label: 'Produits vendus', suffix: '+' },
  { value: 850, label: 'Millions FCFA générés', suffix: 'M+' },
  { value: 99, label: 'Disponibilité', suffix: '.9%' },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-brand-600">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="text-center text-white">
            <p className="text-4xl font-black mb-1">{s.value >= 1000 ? formatNumber(s.value) : s.value}{s.suffix}</p>
            <p className="text-brand-200 text-sm font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
