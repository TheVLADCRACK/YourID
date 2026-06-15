import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';

export function useProducts(params?: { search?: string; status?: string; limit?: number }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => api.get('/products', { params: { limit: 50, ...params } }).then(r => r.data),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/products', data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Produit créé !'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur de création'),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.put(`/products/${id}`, data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Produit mis à jour'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur'),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Produit supprimé'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erreur'),
  });
}
