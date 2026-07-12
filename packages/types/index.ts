// packages/types/index.ts
// Your ID - Shared TypeScript Types

// ============================================
// AUTH TYPES
// ============================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  username: string;
  iat?: number;
  exp?: number;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  storeName: string;
  storeSlug: string;
  currency: string;
  country: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// ============================================
// USER TYPES
// ============================================

export enum UserRole {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  BUYER = 'BUYER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  store?: Store;
}

// ============================================
// STORE TYPES
// ============================================

export interface Store {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  favicon?: string;
  primaryColor: string;
  currency: string;
  country: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  facebook?: string;
  customDomain?: string;
  isVerified: boolean;
  totalRevenue: number;
  totalSales: number;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// PRODUCT TYPES
// ============================================

export enum ProductType {
  EBOOK = 'EBOOK',
  COURSE = 'COURSE',
  AUDIO = 'AUDIO',
  TEMPLATE = 'TEMPLATE',
  SOFTWARE = 'SOFTWARE',
  SERVICE = 'SERVICE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  OTHER = 'OTHER',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  PRIVATE = 'PRIVATE',
  ARCHIVED = 'ARCHIVED',
}

export interface Product {
  id: string;
  storeId: string;
  categoryId?: string;
  type: ProductType;
  status: ProductStatus;
  title: string;
  slug: string;
  description?: string;
  shortDesc?: string;
  coverImage?: string;
  price: number;
  comparePrice?: number;
  currency: string;
  isFeatured: boolean;
  isMarketplace: boolean;
  downloadLimit?: number;
  totalSales: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  store?: Store;
  category?: Category;
  contentUrl?: string;
  contentType?: string;
  contentNote?: string;
}

export interface ProductFile {
  id: string;
  productId: string;
  name: string;
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
}

// ============================================
// ORDER TYPES
// ============================================

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
}

export interface Order {
  id: string;
  storeId: string;
  customerId?: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  platformFee: number;
  sellerRevenue: number;
  total: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  paymentMethod?: string;
  paymentRef?: string;
  completedAt?: Date;
  createdAt: Date;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

// ============================================
// WITHDRAWAL TYPES
// ============================================

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
}

export interface Withdrawal {
  id: string;
  storeId: string;
  amount: number;
  currency: string;
  status: WithdrawalStatus;
  method: string;
  accountInfo: Record<string, string>;
  notes?: string;
  adminNote?: string;
  processedAt?: Date;
  createdAt: Date;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  totalCustomers: number;
  conversionRate: number;
  revenueGrowth: number;
  salesGrowth: number;
  balance: number;
}

export interface RevenueChart {
  date: string;
  revenue: number;
  sales: number;
}

export interface TopProduct {
  id: string;
  title: string;
  coverImage?: string;
  totalSales: number;
  totalRevenue: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// CHECKOUT TYPES
// ============================================

export interface CheckoutData {
  productId: string;
  customerEmail: string;
  customerName: string;
  paymentMethod: string;
  couponCode?: string;
}

export interface CheckoutSession {
  sessionId: string;
  product: Product;
  store: Store;
  subtotal: number;
  platformFee: number;
  total: number;
  currency: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export enum NotificationType {
  NEW_SALE = 'NEW_SALE',
  PURCHASE_COMPLETE = 'PURCHASE_COMPLETE',
  WITHDRAWAL_REQUEST = 'WITHDRAWAL_REQUEST',
  WITHDRAWAL_APPROVED = 'WITHDRAWAL_APPROVED',
  WITHDRAWAL_REJECTED = 'WITHDRAWAL_REJECTED',
  NEW_REVIEW = 'NEW_REVIEW',
  PRODUCT_APPROVED = 'PRODUCT_APPROVED',
  ACCOUNT_VERIFIED = 'ACCOUNT_VERIFIED',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

// ============================================
// PAYMENT METHODS
// ============================================

export const PAYMENT_METHODS = [
  { id: 'mtn_momo', name: 'MTN Mobile Money', icon: '📱', color: '#FFB800' },
  { id: 'orange_money', name: 'Orange Money', icon: '🟠', color: '#FF6600' },
  { id: 'wave', name: 'Wave', icon: '🌊', color: '#1ba1e2' },
  { id: 'airtel_money', name: 'Airtel Money', icon: '📡', color: '#FF0000' },
  { id: 'moov', name: 'Moov Money', icon: '💳', color: '#00A0E3' },
  { id: 'card', name: 'Carte Bancaire', icon: '💳', color: '#6366F1' },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]['id'];

// ============================================
// CURRENCIES
// ============================================

export const CURRENCIES = [
  { code: 'XOF', name: 'Franc CFA (UEMOA)', symbol: 'FCFA', countries: ['SN', 'CI', 'ML', 'BF', 'BJ', 'NE', 'TG', 'GW'] },
  { code: 'XAF', name: 'Franc CFA (CEMAC)', symbol: 'FCFA', countries: ['CM', 'GA', 'CG', 'TD', 'CF', 'GQ'] },
  { code: 'GHS', name: 'Cedi Ghanéen', symbol: 'GH₵', countries: ['GH'] },
  { code: 'NGN', name: 'Naira Nigérian', symbol: '₦', countries: ['NG'] },
  { code: 'KES', name: 'Shilling Kényan', symbol: 'KSh', countries: ['KE'] },
  { code: 'EUR', name: 'Euro', symbol: '€', countries: [] },
  { code: 'USD', name: 'Dollar Américain', symbol: '$', countries: [] },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

// ============================================
// COUNTRIES
// ============================================

export const COUNTRIES = [
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
] as const;
