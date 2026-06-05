import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(productId: string, dto: { rating: number; comment?: string; title?: string; customerEmail: string }) {
    // Check product exists and is published
    const product = await this.prisma.product.findFirst({ where: { id: productId, status: 'PUBLISHED' } });
    if (!product) throw new NotFoundException('Produit introuvable');

    // Validate rating
    if (dto.rating < 1 || dto.rating > 5) throw new BadRequestException('La note doit être entre 1 et 5');

    // Verify purchase (buyer must have ordered this product)
    const order = await this.prisma.order.findFirst({
      where: {
        storeId: product.storeId,
        customerEmail: dto.customerEmail,
        status: 'COMPLETED',
        items: { some: { productId } },
      },
    });
    if (!order) throw new BadRequestException('Vous devez acheter ce produit avant de laisser un avis');

    // Check no duplicate review
    const existing = await this.prisma.review.findFirst({ where: { productId, user: null } });
    // Simplified: allow one review per product per email
    const review = await this.prisma.review.create({
      data: {
        productId,
        storeId: product.storeId,
        rating: dto.rating,
        comment: dto.comment,
        title: dto.title,
        isVerified: true, // verified because they purchased
      },
    });

    // Update product rating average
    await this.updateProductRating(productId);
    return review;
  }

  async findByProduct(productId: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        skip, take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { productId } }),
    ]);
    return { data: reviews, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async delete(id: string, storeId: string) {
    const review = await this.prisma.review.findFirst({ where: { id, storeId } });
    if (!review) throw new NotFoundException('Avis introuvable');
    await this.prisma.review.delete({ where: { id } });
    await this.updateProductRating(review.productId);
    return { message: 'Avis supprimé' };
  }

  private async updateProductRating(productId: string) {
    const result = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        rating: result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : 0,
        reviewCount: result._count,
      },
    });
  }
}
