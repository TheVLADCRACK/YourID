import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  // BUG-024 FIX: paginate products in public store
  async findByUsername(username: string, productPage = 1, productLimit = 12) {
    const skip = (Number(productPage) - 1) * Number(productLimit);

    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        store: {
          include: {
            products: {
              where: { status: 'PUBLISHED' },
              orderBy: { createdAt: 'desc' },
              skip,
              take: Number(productLimit),
              include: { category: { select: { name: true, slug: true } } },
            },
            _count: { select: { products: { where: { status: 'PUBLISHED' } } } },
          },
        },
      },
    });

    if (!user?.store) throw new NotFoundException('Boutique introuvable');

    return {
      ...user.store,
      user: { firstName: user.firstName, lastName: user.lastName, username: user.username, bio: user.bio, avatar: user.avatar },
      productsTotal: user.store._count.products,
      productPage: Number(productPage),
    };
  }

  async findBySlug(slug: string) {
    const store = await this.prisma.store.findUnique({
      where: { slug },
      include: {
        user: { select: { firstName: true, lastName: true, username: true, avatar: true, bio: true } },
        products: {
          where: { status: 'PUBLISHED' },
          orderBy: { createdAt: 'desc' },
          take: 12,
          include: { category: { select: { name: true } } },
        },
      },
    });
    if (!store) throw new NotFoundException('Boutique introuvable');
    return store;
  }

  async update(storeId: string, dto: any) {
    const allowed = ['name', 'description', 'logo', 'banner', 'favicon', 'primaryColor',
      'currency', 'country', 'website', 'twitter', 'instagram', 'youtube', 'tiktok', 'facebook'];
    const data: any = {};
    for (const key of allowed) {
      if (dto[key] !== undefined) data[key] = dto[key];
    }
    return this.prisma.store.update({ where: { id: storeId }, data });
  }

  async getCustomers(storeId: string, query: any) {
    const { page = 1, limit = 20, search } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {
      storeId,
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      this.prisma.customer.count({ where }),
    ]);
    return { data: customers, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }
}
