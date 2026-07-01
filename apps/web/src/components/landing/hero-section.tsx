'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, TrendingUp, Users, ShoppingBag } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50/60 via-white to-white pointer-events-none" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-brand-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="space-y-8">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 px-4 py-2 rounded-full text-sm font-semibold">
            <Star size={14} className="fill-brand-500 text-brand-500" />
            La #1 plateforme de vente digitale en Afrique
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl lg:text-6xl font-black leading-[1.1] text-gray-900">
            Transformez vos{' '}
            <span className="text-brand-500 relative">
              connaissances
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 10C50 4 100 2 150 4C200 6 250 8 298 2" stroke="#00A86B" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </span>{' '}
            en revenus.
          </h1>

          <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
            Créez votre boutique, publiez vos produits digitaux et encaissez vos revenus en quelques minutes. 
            Sans commissions excessives. Sans complexité.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" className="btn-primary text-base px-8 py-4 rounded-2xl group">
              Créer ma boutique gratuite
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/marketplace" className="btn-secondary text-base px-8 py-4 rounded-2xl">
              <Play size={16} className="fill-gray-700" />
              Voir la marketplace
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-6 pt-2">
            <div className="flex -space-x-3">
              {['🇸🇳', '🇨🇮', '🇨🇲', '🇬🇭', '🇳🇬'].map((flag, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-brand-100 border-2 border-white flex items-center justify-center text-sm">
                  {flag}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (<svg key={i} width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5l1.4 2.9 3.2.5-2.3 2.2.5 3.2-2.8-1.5-2.8 1.5.5-3.2L2.9 4.9l3.2-.5z" fill="#FBBF24" stroke="#FBBF24" strokeWidth=".5" strokeLinejoin="round"/></svg>))}
              </div>
              <p className="text-sm text-gray-500">+2 500 créateurs actifs</p>
            </div>
          </div>
        </motion.div>

        {/* Right - Dashboard mockup */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          className="hidden lg:block relative">
          <div className="relative bg-white rounded-3xl shadow-elevated border border-border overflow-hidden">
            {/* Browser bar */}
            <div className="bg-gray-50 border-b border-border px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white border border-border rounded-lg px-3 py-1 text-xs text-gray-400 mx-4">
                app.yourid.com/dashboard
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="p-6 bg-background">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-500">Bonjour, Kofi</p>
                  <h3 className="font-bold text-gray-900">Tableau de bord</h3>
                </div>
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">YI</div>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Revenus', value: '850K', unit: 'FCFA', icon: TrendingUp, color: 'text-brand-500 bg-brand-50' },
                  { label: 'Ventes', value: '127', unit: 'ce mois', icon: ShoppingBag, color: 'text-blue-500 bg-blue-50' },
                  { label: 'Clients', value: '89', unit: 'total', icon: Users, color: 'text-purple-500 bg-purple-50' },
                ].map((kpi, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                    className="bg-white rounded-xl p-3 border border-border">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${kpi.color}`}>
                      <kpi.icon size={14} />
                    </div>
                    <p className="text-lg font-black text-gray-900">{kpi.value}</p>
                    <p className="text-[10px] text-gray-500">{kpi.unit}</p>
                  </motion.div>
                ))}
              </div>

              {/* Chart bar (decorative) */}
              <div className="bg-white rounded-xl p-4 border border-border">
                <p className="text-xs font-semibold text-gray-700 mb-3">Revenus — 7 derniers jours</p>
                <div className="flex items-end gap-1.5 h-16">
                  {[30, 55, 45, 70, 60, 85, 95].map((h, i) => (
                    <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.6 + i * 0.05 }}
                      className="flex-1 bg-brand-500 rounded-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {['L','M','M','J','V','S','D'].map((d, i) => (
                    <span key={i} className="text-[9px] text-gray-400 flex-1 text-center">{d}</span>
                  ))}
                </div>
              </div>

              {/* Recent sale notification */}
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                className="mt-3 bg-brand-50 border border-brand-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10 5 12l.5-3.5L3 6l3.5-.5z" fill="white" stroke="white" strokeWidth=".5" strokeLinejoin="round"/></svg></div>
                <div>
                  <p className="text-xs font-semibold text-brand-700">Nouvelle vente !</p>
                  <p className="text-[10px] text-brand-600">Guide E-Commerce — 15 000 FCFA</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Floating badges */}
          <motion.div animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="absolute -top-4 -right-4 bg-white border border-border rounded-2xl shadow-elevated px-4 py-3 flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="10" fill="#00A86B" opacity=".15" stroke="#00A86B" strokeWidth="1.5"/><path d="M11 7v8M8.5 9.5A2.5 2.5 0 0 1 11 8a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 0 0 5" stroke="#00A86B" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <div>
              <p className="text-xs text-gray-500">Commission</p>
              <p className="text-sm font-black text-brand-600">Seulement 15%</p>
            </div>
          </motion.div>

          <motion.div animate={{ y: [5, -5, 5] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            className="absolute -bottom-4 -left-4 bg-white border border-border rounded-2xl shadow-elevated px-4 py-3 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M11 2L5 11h6l-2 7 8-9h-6l2-7z" fill="#F59E0B" opacity=".2" stroke="#F59E0B" strokeWidth="1.4" strokeLinejoin="round"/></svg>
            <div>
              <p className="text-xs text-gray-500">Mise en ligne</p>
              <p className="text-sm font-black text-gray-900">En 5 minutes</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
