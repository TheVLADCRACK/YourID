import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const { page = 1, limit = 24, search, category, minPrice, maxPrice, sortBy = 'popular' } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.ProductWhereInput = {
      status: 'PUBLISHED',
      isMarketplace: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category: { slug: category } }),
      ...(minPrice && { price: { gte: Number(minPrice) } }),
      ...(maxPrice && { price: { lte: Number(maxPrice) } }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sortBy === 'popular' ? { totalSales: 'desc' }
      : sortBy === 'newest' ? { createdAt: 'desc' }
      : sortBy === 'price_asc' ? { price: 'asc' }
      : sortBy === 'price_desc' ? { price: 'desc' }
      : { rating: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          store: { select: { name: true, slug: true, logo: true, isVerified: true } },
          category: { select: { name: true, slug: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data: products, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }

  async getFeatured() {
    return this.prisma.product.findMany({
      where: { status: 'PUBLISHED', isMarketplace: true, isFeatured: true },
      take: 8,
      include: {
        store: { select: { name: true, slug: true, logo: true, isVerified: true } },
        category: { select: { name: true } },
      },
    });
  }

  async getPopular() {
    return this.prisma.product.findMany({
      where: { status: 'PUBLISHED', isMarketplace: true },
      orderBy: { totalSales: 'desc' },
      take: 12,
      include: {
        store: { select: { name: true, slug: true, logo: true } },
        category: { select: { name: true } },
      },
    });
  }

  async getByCategory(categorySlug: string, limit = 12) {
    return this.prisma.product.findMany({
      where: { status: 'PUBLISHED', isMarketplace: true, category: { slug: categorySlug } },
      orderBy: { totalSales: 'desc' },
      take: limit,
      include: {
        store: { select: { name: true, slug: true, logo: true } },
      },
    });
  }

  async getStats() {
    const [totalProducts, totalSellers, totalRevenue] = await Promise.all([
      this.prisma.product.count({ where: { status: 'PUBLISHED', isMarketplace: true } }),
      this.prisma.store.count({ where: { products: { some: { status: 'PUBLISHED' } } } }),
      this.prisma.store.aggregate({ _sum: { totalRevenue: true } }),
    ]);

    return {
      totalProducts,
      totalSellers,
      totalRevenue: Number(totalRevenue._sum.totalRevenue || 0),
    };
  }
}
