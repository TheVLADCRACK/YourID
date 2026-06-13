import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = 'XOF'): string {
  const currencyFormats: Record<string, { locale: string; opts: Intl.NumberFormatOptions }> = {
    XOF: { locale: 'fr-SN', opts: { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 } },
    XAF: { locale: 'fr-CM', opts: { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 } },
    EUR: { locale: 'fr-FR', opts: { style: 'currency', currency: 'EUR' } },
    USD: { locale: 'en-US', opts: { style: 'currency', currency: 'USD' } },
    GHS: { locale: 'en-GH', opts: { style: 'currency', currency: 'GHS' } },
    NGN: { locale: 'en-NG', opts: { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 } },
  };
  const fmt = currencyFormats[currency] || currencyFormats.XOF;
  try {
    return new Intl.NumberFormat(fmt.locale, fmt.opts).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

export function formatDate(date: string | Date, format = 'short'): string {
  const d = new Date(date);
  if (format === 'short') return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  if (format === 'long') return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  if (format === 'relative') {
    const now = Date.now();
    const diff = now - d.getTime();
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`;
    if (diff < 604800000) return `Il y a ${Math.floor(diff / 86400000)} j`;
    return formatDate(date, 'short');
  }
  return d.toLocaleDateString('fr-FR');
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    COMPLETED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    FAILED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-gray-100 text-gray-700',
    PUBLISHED: 'bg-green-100 text-green-700',
    DRAFT: 'bg-gray-100 text-gray-600',
    PRIVATE: 'bg-blue-100 text-blue-700',
    APPROVED: 'bg-green-100 text-green-700',
    PAID: 'bg-brand-100 text-brand-700',
    REJECTED: 'bg-red-100 text-red-700',
    ACTIVE: 'bg-green-100 text-green-700',
    SUSPENDED: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    COMPLETED: 'Complétée', PENDING: 'En attente', FAILED: 'Échouée',
    REFUNDED: 'Remboursée', PUBLISHED: 'Publié', DRAFT: 'Brouillon',
    PRIVATE: 'Privé', APPROVED: 'Approuvé', PAID: 'Payé',
    REJECTED: 'Rejeté', ACTIVE: 'Actif', SUSPENDED: 'Suspendu',
  };
  return labels[status] || status;
}

export const PLATFORM_FEE = 15;
export function calcPlatformFee(amount: number) { return Math.round(amount * PLATFORM_FEE / 100); }
export function calcSellerRevenue(amount: number) { return amount - calcPlatformFee(amount); }
