import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { mapProduct, mapOrder } from '../../database/mappers';
import * as dayjs from 'dayjs';

@Injectable()
export class AnalyticsService {
  constructor(private db: DatabaseService) {}

  async getDashboardStats(storeId: string) {
    const store = this.db.get('SELECT totalRevenue, totalSales, balance FROM stores WHERE id = ?', [storeId]);
    const thirtyDaysAgo = dayjs().subtract(30, 'day').toISOString();
    const sixtyDaysAgo = dayjs().subtract(60, 'day').toISOString();

    const current = this.db.get<{ sum: number; cnt: number }>(
      `SELECT COALESCE(SUM(total),0) as sum, COUNT(*) as cnt FROM orders WHERE storeId = ? AND status = 'COMPLETED' AND createdAt >= ?`,
      [storeId, thirtyDaysAgo],
    )!;
    const previous = this.db.get<{ sum: number; cnt: number }>(
      `SELECT COALESCE(SUM(total),0) as sum, COUNT(*) as cnt FROM orders WHERE storeId = ? AND status = 'COMPLETED' AND createdAt >= ? AND createdAt < ?`,
      [storeId, sixtyDaysAgo, thirtyDaysAgo],
    )!;
    const totalCustomers = this.db.get<{ c: number }>('SELECT COUNT(*) as c FROM customers WHERE storeId = ?', [storeId])!.c;
    const recentCount = this.db.get<{ c: number }>('SELECT COUNT(*) as c FROM orders WHERE storeId = ? AND createdAt >= ?', [storeId, thirtyDaysAgo])!.c;

    const cur = Number(current.sum ?? 0);
    const prev = Number(previous.sum ?? 0);
    const revenueGrowth = prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100);

    const curSales = current.cnt;
    const prevSales = previous.cnt;
    const salesGrowth = prevSales === 0 ? (curSales > 0 ? 100 : 0) : Math.round(((curSales - prevSales) / prevSales) * 100);
    const conversionRate = recentCount > 0 ? Math.round((curSales / recentCount) * 100) : 0;

    return {
      totalRevenue: Number(store?.totalRevenue ?? 0),
      totalSales: store?.totalSales ?? 0,
      totalCustomers,
      balance: Number(store?.balance ?? 0),
      revenueThisMonth: cur,
      salesThisMonth: curSales,
      revenueGrowth,
      salesGrowth,
      conversionRate,
    };
  }

  async getRevenueChart(storeId: string, period: '7d' | '30d' | '90d' = '30d') {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = dayjs().subtract(days, 'day').startOf('day').toISOString();

    const dateMap: Record<string, { revenue: number; sales: number }> = {};
    for (let i = 0; i < days; i++) {
      const date = dayjs().subtract(days - 1 - i, 'day').format('YYYY-MM-DD');
      dateMap[date] = { revenue: 0, sales: 0 };
    }

    const rows = this.db.all<{ total: number; createdAt: string }>(
      `SELECT total, createdAt FROM orders WHERE storeId = ? AND status = 'COMPLETED' AND createdAt >= ?`,
      [storeId, startDate],
    );
    for (const o of rows) {
      const date = dayjs(o.createdAt).format('YYYY-MM-DD');
      if (dateMap[date]) { dateMap[date].revenue += Number(o.total); dateMap[date].sales += 1; }
    }

    return Object.entries(dateMap).map(([date, data]) => ({ date, ...data }));
  }

  async getTopProducts(storeId: string, limit = 5) {
    const rows = this.db.all(
      `SELECT id, title, coverImage, price, totalSales, totalRevenue, rating, currency FROM products WHERE storeId = ? ORDER BY totalSales DESC LIMIT ?`,
      [storeId, limit],
    );
    return rows.map(mapProduct);
  }

  async getRecentOrders(storeId: string, limit = 10) {
    const rows = this.db.all('SELECT * FROM orders WHERE storeId = ? ORDER BY createdAt DESC LIMIT ?', [storeId, limit]);
    return rows.map((r) => {
      const order = mapOrder(r);
      const item = this.db.get('SELECT title FROM order_items WHERE orderId = ? LIMIT 1', [order.id]);
      const customer = order.customerId ? this.db.get('SELECT firstName, lastName, email FROM customers WHERE id = ?', [order.customerId]) : null;
      return { ...order, items: item ? [{ product: { title: item.title } }] : [], customer };
    });
  }

  async trackEvent(data: {
    storeId?: string; productId?: string; event: string; properties?: Record<string, unknown>;
    ipAddress?: string; userAgent?: string; country?: string; referrer?: string;
  }) {
    this.db.run(
      `INSERT INTO analytics_events (id, storeId, productId, event, properties, ipAddress, userAgent, country, referrer, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [this.db.id(), data.storeId ?? null, data.productId ?? null, data.event, this.db.toJson(data.properties), data.ipAddress ?? null, data.userAgent ?? null, data.country ?? null, data.referrer ?? null, this.db.now()],
    );
    return { success: true };
  }

  async getGlobalStats() {
    const totalUsers = this.db.get<{ c: number }>('SELECT COUNT(*) as c FROM users')!.c;
    const totalStores = this.db.get<{ c: number }>('SELECT COUNT(*) as c FROM stores')!.c;
    const totalOrders = this.db.get<{ c: number }>(`SELECT COUNT(*) as c FROM orders WHERE status = 'COMPLETED'`)!.c;
    const revenueSum = this.db.get<{ sum: number }>('SELECT COALESCE(SUM(totalRevenue),0) as sum FROM stores')!.sum;
    return { totalUsers, totalStores, totalOrders, totalRevenue: Number(revenueSum ?? 0) };
  }
}
