import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useOrders(params?: { search?: string; status?: string; page?: number }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => api.get('/orders', { params: { limit: 20, ...params } }).then(r => r.data),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data),
    enabled: !!id,
  });
}
