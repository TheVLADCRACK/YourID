'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-border' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">YI</span>
          </div>
          <span className="font-black text-xl text-gray-900">Your <span className="text-brand-500">ID</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/marketplace" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">Marketplace</Link>
          <Link href="/#features" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">Fonctionnalités</Link>
          <Link href="/#pricing" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">Tarifs</Link>
          <Link href="/#faq" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">FAQ</Link>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard" className="btn-primary">Tableau de bord</Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-brand-600 transition-colors">Connexion</Link>
              <Link href="/register" className="btn-primary">Créer ma boutique</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-b border-border px-6 py-4 flex flex-col gap-4">
            <Link href="/marketplace" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-gray-700">Marketplace</Link>
            <Link href="/#features" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-gray-700">Fonctionnalités</Link>
            <Link href="/#pricing" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-gray-700">Tarifs</Link>
            <div className="flex gap-3 pt-2 border-t border-border">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-center">Connexion</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 text-center">Créer ma boutique</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
