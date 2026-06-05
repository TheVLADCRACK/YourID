import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api from '@/lib/api';

interface User {
  id: string; email: string; firstName: string; lastName: string;
  username: string; role: string; avatar?: string;
  store?: { id: string; name: string; slug: string; balance: number; currency: string };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        Cookies.set('access_token', data.accessToken, { expires: 1/96, secure: true, sameSite: 'lax' });
        Cookies.set('refresh_token', data.refreshToken, { expires: 7, secure: true, sameSite: 'lax' });
        set({ user: data.user, isAuthenticated: true });
      },

      register: async (formData) => {
        const { data } = await api.post('/auth/register', formData);
        Cookies.set('access_token', data.accessToken, { expires: 1/96, secure: true, sameSite: 'lax' });
        Cookies.set('refresh_token', data.refreshToken, { expires: 7, secure: true, sameSite: 'lax' });
        set({ user: data.user, isAuthenticated: true });
      },

      logout: async () => {
        const rt = Cookies.get('refresh_token');
        try { if (rt) await api.post('/auth/logout', { refreshToken: rt }); } catch {}
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        set({ user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') window.location.href = '/login';
      },

      updateUser: (data) => set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),
    }),
    { name: 'yourid-auth', partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) },
  ),
);
