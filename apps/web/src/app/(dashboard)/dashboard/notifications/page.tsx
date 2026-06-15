'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

const ICONS: Record<string, string> = {
  NEW_SALE: '🎉', PURCHASE_COMPLETE: '✅', WITHDRAWAL_REQUEST: '💸',
  WITHDRAWAL_APPROVED: '✅', WITHDRAWAL_REJECTED: '❌',
  NEW_REVIEW: '⭐', PRODUCT_APPROVED: '🚀', ACCOUNT_VERIFIED: '✓',
};

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data: notifs, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifs?.filter((n: any) => !n.isRead).length || 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-gray-500 mt-1">{unreadCount} non lue(s)</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAllRead.mutate()} className="btn-secondary text-sm py-2 flex items-center gap-2">
            <CheckCheck size={15} /> Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="space-y-2">
        {isLoading ? (
          [...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)
        ) : notifs?.length === 0 ? (
          <div className="card text-center py-16">
            <Bell size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">Aucune notification</p>
          </div>
        ) : (
          notifs?.map((n: any) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => !n.isRead && markRead.mutate(n.id)}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer
                ${n.isRead ? 'bg-white border-border' : 'bg-brand-50 border-brand-100 hover:bg-brand-50/80'}`}>
              <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-xl flex-shrink-0">
                {ICONS[n.type] || '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{formatDate(n.createdAt, 'relative')}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
