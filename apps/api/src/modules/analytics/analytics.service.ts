import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as dayjs from 'dayjs';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(storeId: string) {
    const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();
    const sixtyDaysAgo = dayjs().subtract(60, 'day').toDate();

    const [store, currentPeriod, previousPeriod, totalCustomers, recentCount] = await Promise.all([
      this.prisma.store.findUnique({ where: { id: storeId }, select: { totalRevenue: true, totalSales: true, balance: true } }),
      this.prisma.order.aggregate({
        where: { storeId, status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } },
        _sum: { total: true }, _count: true,
      }),
      this.prisma.order.aggregate({
        where: { storeId, status: 'COMPLETED', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        _sum: { total: true }, _count: true,
      }),
      this.prisma.customer.count({ where: { storeId } }),
      this.prisma.order.count({ where: { storeId, createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    const cur = Number(currentPeriod._sum.total ?? 0);
    const prev = Number(previousPeriod._sum.total ?? 0);
    const revenueGrowth = prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100);

    const curSales = currentPeriod._count;
    const prevSales = previousPeriod._count;
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

  // BUG-025 FIX: SQL group-by instead of in-memory aggregation
  async getRevenueChart(storeId: string, period: '7d' | '30d' | '90d' = '30d') {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = dayjs().subtract(days, 'day').startOf('day').toDate();

    // Build date series in JS (portable across DBs)
    const dateMap: Record<string, { revenue: number; sales: number }> = {};
    for (let i = 0; i < days; i++) {
      const date = dayjs().subtract(days - 1 - i, 'day').format('YYYY-MM-DD');
      dateMap[date] = { revenue: 0, sales: 0 };
    }

    // Single efficient query
    const orders = await this.prisma.order.findMany({
      where: { storeId, status: 'COMPLETED', createdAt: { gte: startDate } },
      select: { total: true, createdAt: true },
    });

    for (const o of orders) {
      const date = dayjs(o.createdAt).format('YYYY-MM-DD');
      if (dateMap[date]) {
        dateMap[date].revenue += Number(o.total);
        dateMap[date].sales += 1;
      }
    }

    return Object.entries(dateMap).map(([date, data]) => ({ date, ...data }));
  }

  async getTopProducts(storeId: string, limit = 5) {
    return this.prisma.product.findMany({
      where: { storeId },
      orderBy: { totalSales: 'desc' },
      take: limit,
      select: { id: true, title: true, coverImage: true, price: true, totalSales: true, totalRevenue: true, rating: true, currency: true },
    });
  }

  async getRecentOrders(storeId: string, limit = 10) {
    return this.prisma.order.findMany({
      where: { storeId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { select: { title: true }, take: 1 },
        customer: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }

  async trackEvent(data: {
    storeId?: string;
    productId?: string;
    event: string;
    properties?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    referrer?: string;
  }) {
    return this.prisma.analyticsEvent.create({ data });
  }

  // Admin global stats
  async getGlobalStats() {
    const [totalUsers, totalStores, totalOrders, revenueSum] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.store.count(),
      this.prisma.order.count({ where: { status: 'COMPLETED' } }),
      this.prisma.store.aggregate({ _sum: { totalRevenue: true } }),
    ]);
    return {
      totalUsers,
      totalStores,
      totalOrders,
      totalRevenue: Number(revenueSum._sum.totalRevenue ?? 0),
    };
  }
}
