'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Package, Wallet, BarChart2, LogOut, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin', icon: LayoutDashboard, label: 'Vue générale' },
  { href: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { href: '/admin/products', icon: Package, label: 'Produits' },
  { href: '/admin/withdrawals', icon: Wallet, label: 'Retraits' },
  { href: '/admin/analytics', icon: BarChart2, label: 'Statistiques' },
  { href: '/admin/logs', icon: FileText, label: 'Logs' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.push('/dashboard');
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 bg-gray-900 text-white flex flex-col sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center"><span className="font-black text-xs">YI</span></div>
            <div><p className="font-bold text-sm">Your ID</p><p className="text-gray-400 text-[10px]">Administration</p></div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(l => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'bg-brand-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}>
                <l.icon size={16} /> {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-gray-800">
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 text-sm w-full rounded-xl hover:bg-gray-800 transition-colors">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
