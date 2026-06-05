'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Wallet,
  BarChart2, Settings, LogOut, Bell, Bot, Menu, ChevronRight, Store
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn, getInitials, formatPrice } from '@/lib/utils';

const sidebarLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard/products', icon: Package, label: 'Produits' },
  { href: '/dashboard/orders', icon: ShoppingCart, label: 'Commandes' },
  { href: '/dashboard/customers', icon: Users, label: 'Clients' },
  { href: '/dashboard/withdrawals', icon: Wallet, label: 'Retraits' },
  { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/dashboard/ai', icon: Bot, label: 'IA Assistant' },
  { href: '/dashboard/settings', icon: Settings, label: 'Paramètres' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  // BUG-020 FIX: track hydration to prevent auth flash
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [hydrated, isAuthenticated, router, pathname]);

  // BUG-020 FIX: show spinner until hydrated
  if (!hydrated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-white font-black text-sm">YI</span>
        </div>
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    </div>
  );

  if (!isAuthenticated || !user) return null;

  // BUG-008 FIX: safe access to user.store with optional chaining
  const storeName = user.store?.name ?? '';
  const storeBalance = user.store?.balance ?? 0;
  const storeCurrency = user.store?.currency ?? 'XOF';
  const storeSlug = user.store?.slug ?? '';

  const SidebarContent = () => (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-border h-full flex flex-col">
      <div className="px-6 py-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">YI</span>
          </div>
          <span className="font-black text-lg text-gray-900">Your <span className="text-brand-500">ID</span></span>
        </Link>
      </div>

      {/* BUG-008 FIX: only show store card if store exists */}
      {user.store && (
        <div className="px-4 py-3 border-b border-border">
          <Link href={`/@${storeSlug}`} target="_blank" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 group">
            <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 font-bold text-sm flex-shrink-0">
              {getInitials(storeName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{storeName}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                Voir la boutique <ChevronRight size={10}/>
              </p>
            </div>
          </Link>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {sidebarLinks.map((link) => {
          const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
          return (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className={cn('sidebar-item', active && 'active')}>
              <link.icon size={18}/>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {getInitials(`${user.firstName} ${user.lastName}`)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button onClick={logout} title="Déconnexion"
            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors flex-shrink-0">
            <LogOut size={15}/>
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0">
        <SidebarContent/>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)}/>
          <div className="relative w-64 h-full shadow-2xl"><SidebarContent/></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="sticky top-0 z-30 bg-white border-b border-border px-4 lg:px-6 h-14 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20}/>
          </button>
          <div className="flex-1"/>
          <div className="flex items-center gap-2">
            {/* BUG-008 FIX: conditional rendering of balance */}
            {user.store && (
              <div className="hidden sm:flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                <Wallet size={14}/>
                {formatPrice(Number(storeBalance), storeCurrency)}
              </div>
            )}
            <Link href="/dashboard/notifications" className="relative p-2 rounded-xl hover:bg-gray-100">
              <Bell size={18} className="text-gray-600"/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"/>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
