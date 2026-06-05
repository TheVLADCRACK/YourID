import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(storeId: string, dto: CreateProductDto) {
    const slug = await this.generateSlug(dto.title);

    return this.prisma.product.create({
      data: {
        storeId,
        slug,
        title: dto.title,
        description: dto.description,
        shortDesc: dto.shortDesc,
        price: dto.price,
        comparePrice: dto.comparePrice,
        currency: dto.currency || 'XOF',
        type: dto.type || 'EBOOK',
        status: dto.status || 'DRAFT',
        categoryId: dto.categoryId,
        coverImage: dto.coverImage,
        isMarketplace: dto.isMarketplace ?? true,
        downloadLimit: dto.downloadLimit,
      },
      include: {
        category: true,
        files: true,
      },
    });
  }

  async findAll(storeId: string, query: any) {
    const { page = 1, limit = 20, search, status, type } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      storeId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(type && { type }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          _count: { select: { orderItems: true, reviews: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, storeId?: string) {
    const where: Prisma.ProductWhereUniqueInput = { id };
    const product = await this.prisma.product.findUnique({
      where,
      include: {
        store: { select: { id: true, name: true, slug: true, logo: true } },
        category: true,
        tags: { include: { tag: true } },
        files: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) throw new NotFoundException('Produit introuvable');
    if (storeId && product.storeId !== storeId) {
      throw new ForbiddenException('Accès refusé');
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            avatar: false,
            isVerified: true,
          },
        },
        category: true,
        files: { select: { id: true, name: true, fileSize: true, mimeType: true } },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product || product.status !== 'PUBLISHED') {
      throw new NotFoundException('Produit introuvable');
    }

    // Increment view count
    await this.prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    return product;
  }

  async update(id: string, storeId: string, dto: UpdateProductDto) {
    const product = await this.findOne(id, storeId);

    return this.prisma.product.update({
      where: { id: product.id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
      include: { category: true, files: true },
    });
  }

  async remove(id: string, storeId: string) {
    const product = await this.findOne(id, storeId);
    return this.prisma.product.delete({ where: { id: product.id } });
  }

  async publish(id: string, storeId: string) {
    return this.update(id, storeId, { status: 'PUBLISHED' } as any);
  }

  async unpublish(id: string, storeId: string) {
    return this.update(id, storeId, { status: 'DRAFT' } as any);
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  private async generateSlug(title: string): Promise<string> {
    const base = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slug = base;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.product.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${base}-${counter++}`;
    }

    return slug;
  }
}

  async findPublicById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, status: 'PUBLISHED' },
      include: {
        store: { select: { id: true, name: true, slug: true, logo: true, isVerified: true } },
        category: true,
        files: { select: { id: true, name: true, fileSize: true, mimeType: true } },
      },
    });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }
