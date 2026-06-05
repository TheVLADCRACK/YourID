import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuth() {
  const { user, isAuthenticated, login, logout, register, updateUser } = useAuthStore();
  const router = useRouter();

  const handleLogin = useCallback(async (email: string, password: string, redirect = '/dashboard') => {
    await login(email, password);
    router.push(redirect);
  }, [login, router]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const isAdmin = user?.role === 'ADMIN';
  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';

  return { user, isAuthenticated, isAdmin, isSeller, login: handleLogin, logout: handleLogout, register, updateUser };
}
