/**
 * Row mappers — convert raw SQLite rows (0/1 booleans, JSON-as-TEXT) into
 * clean JS objects with the same shape the frontend already expects
 * (this preserves 100% API response compatibility after the Prisma → SQLite migration).
 */

const bool = (v: any): boolean => !!v;
const json = <T = any>(v: any): T | null => {
  if (v === null || v === undefined) return null;
  try { return JSON.parse(v); } catch { return null; }
};

export function mapUser(row: any) {
  if (!row) return row;
  const { password, twoFactorSecret, ...safe } = row;
  return {
    ...safe,
    emailVerified: bool(row.emailVerified),
    twoFactorEnabled: bool(row.twoFactorEnabled),
  };
}

/** Includes password — only for internal auth checks, never returned to client. */
export function mapUserWithSecrets(row: any) {
  if (!row) return row;
  return {
    ...row,
    emailVerified: bool(row.emailVerified),
    twoFactorEnabled: bool(row.twoFactorEnabled),
  };
}

export function mapStore(row: any) {
  if (!row) return row;
  return {
    ...row,
    isVerified: bool(row.isVerified),
    totalRevenue: Number(row.totalRevenue),
    totalSales: Number(row.totalSales),
    balance: Number(row.balance),
  };
}

export function mapCategory(row: any) {
  return row;
}

export function mapProduct(row: any) {
  if (!row) return row;
  return {
    ...row,
    isFeatured: bool(row.isFeatured),
    isMarketplace: bool(row.isMarketplace),
    price: Number(row.price),
    comparePrice: row.comparePrice != null ? Number(row.comparePrice) : null,
    totalSales: Number(row.totalSales),
    totalRevenue: Number(row.totalRevenue),
    rating: Number(row.rating),
    reviewCount: Number(row.reviewCount),
    viewCount: Number(row.viewCount),
    contentUrl: row.contentUrl ?? null,
    contentType: row.contentType ?? null,
    contentNote: row.contentNote ?? null,
  };
}

export function mapCustomer(row: any) {
  if (!row) return row;
  return { ...row, totalSpent: Number(row.totalSpent), orderCount: Number(row.orderCount) };
}

export function mapOrder(row: any) {
  if (!row) return row;
  return {
    ...row,
    subtotal: Number(row.subtotal),
    platformFee: Number(row.platformFee),
    sellerRevenue: Number(row.sellerRevenue),
    total: Number(row.total),
    metadata: json(row.metadata),
  };
}

export function mapOrderItem(row: any) {
  if (!row) return row;
  return { ...row, price: Number(row.price), quantity: Number(row.quantity) };
}

export function mapTransaction(row: any) {
  if (!row) return row;
  return { ...row, amount: Number(row.amount), providerData: json(row.providerData) };
}

export function mapWithdrawal(row: any) {
  if (!row) return row;
  return { ...row, amount: Number(row.amount), accountInfo: json(row.accountInfo) ?? {} };
}

export function mapReview(row: any) {
  if (!row) return row;
  return { ...row, isVerified: bool(row.isVerified), rating: Number(row.rating) };
}

export function mapNotification(row: any) {
  if (!row) return row;
  return { ...row, isRead: bool(row.isRead), data: json(row.data) };
}

export function mapAIContent(row: any) {
  if (!row) return row;
  return { ...row, tokens: row.tokens !== null ? Number(row.tokens) : null };
}

export function mapAnalyticsEvent(row: any) {
  if (!row) return row;
  return { ...row, properties: json(row.properties) };
}
