// Re-export all types
export * from './constants';

// Generic API types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Product types
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'PRIVATE' | 'ARCHIVED';
export type ProductType = 'EBOOK' | 'COURSE' | 'AUDIO' | 'TEMPLATE' | 'SOFTWARE' | 'SERVICE' | 'SUBSCRIPTION' | 'OTHER';

export interface Product {
  id: string;
  storeId: string;
  title: string;
  slug: string;
  description?: string;
  shortDesc?: string;
  coverImage?: string;
  price: number;
  comparePrice?: number;
  currency: string;
  type: ProductType;
  status: ProductStatus;
  totalSales: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  viewCount: number;
  isMarketplace: boolean;
  createdAt: string;
  updatedAt: string;
  store?: Store;
  category?: Category;
  contentUrl?: string;
  contentType?: string;
  contentNote?: string;
}



export interface Store {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  currency: string;
  country: string;
  balance: number;
  totalRevenue: number;
  totalSales: number;
  isVerified: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

// Order types
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  platformFee: number;
  sellerRevenue: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  paymentMethod?: string;
  createdAt: string;
  completedAt?: string;
  items: OrderItem[];
  customer?: Customer;
}

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  totalSpent: number;
  orderCount: number;
}

// Withdrawal types
export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
export interface Withdrawal {
  id: string;
  amount: number;
  currency: string;
  status: WithdrawalStatus;
  method: string;
  accountInfo: Record<string, string>;
  notes?: string;
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
}

// User types
export type UserRole = 'ADMIN' | 'SELLER' | 'BUYER';
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  store?: Store;
}
