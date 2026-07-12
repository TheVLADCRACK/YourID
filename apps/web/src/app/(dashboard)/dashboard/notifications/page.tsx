'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { EmptyNotifications } from '@/components/ui/illustrations';
import {
  IconNewSale, IconCheck, IconReject, IconWithdraw, IconBell, IconReview, IconStar
} from '@/components/ui/svg-icons';

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  NEW_SALE:             <IconNewSale size={18}/>,
  PURCHASE_COMPLETE:    <IconCheck size={18} color="#22C55E"/>,
  WITHDRAWAL_REQUEST:   <IconWithdraw size={18}/>,
  WITHDRAWAL_APPROVED:  <IconCheck size={18} color="#22C55E"/>,
  WITHDRAWAL_REJECTED:  <IconReject size={18}/>,
  NEW_REVIEW:           <IconStar size={18} filled color="#F59E0B"/>,
  PRODUCT_APPROVED:     <IconCheck size={18} color="#00A86B"/>,
  ACCOUNT_VERIFIED:     <IconCheck size={18} color="#00A86B"/>,
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
          {unreadCount > 0 && (
            <p className="text-brand-600 text-sm font-medium mt-1">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAllRead.mutate()}
            className="btn-secondary text-sm py-2 flex items-center gap-2">
            <Check size={14}/> Tout marquer lu
          </button>
        )}
      </div>

      <div className="space-y-2">
        {isLoading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl"/>)
        ) : notifs?.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 gap-5">
            <EmptyNotifications/>
            <div className="text-center">
              <p className="text-gray-700 font-semibold">Tout est calme ici</p>
              <p className="text-gray-400 text-sm mt-1">Vos notifications apparaîtront ici</p>
            </div>
          </div>
        ) : (
          notifs?.map((n: any) => (
            <motion.div key={n.id}
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => !n.isRead && markRead.mutate(n.id)}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer
                ${n.isRead
                  ? 'bg-white border-border hover:bg-gray-50'
                  : 'bg-brand-50/70 border-brand-100 hover:bg-brand-50'}`}>

              {/* Icon circle */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${n.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                {NOTIFICATION_ICONS[n.type] || <IconBell size={18}/>}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                  {n.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1.5">{formatDate(n.createdAt, 'relative')}</p>
              </div>

              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2"/>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
