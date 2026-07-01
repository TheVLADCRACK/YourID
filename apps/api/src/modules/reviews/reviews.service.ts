import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { mapReview } from '../../database/mappers';

@Injectable()
export class ReviewsService {
  constructor(private db: DatabaseService) {}

  async create(productId: string, dto: { rating: number; comment?: string; title?: string; customerEmail: string }) {
    const product = this.db.get(`SELECT * FROM products WHERE id = ? AND status = 'PUBLISHED'`, [productId]);
    if (!product) throw new NotFoundException('Produit introuvable');
    if (dto.rating < 1 || dto.rating > 5) throw new BadRequestException('La note doit être entre 1 et 5');

    const order = this.db.get(
      `SELECT o.* FROM orders o INNER JOIN order_items oi ON oi.orderId = o.id
       WHERE o.storeId = ? AND o.customerEmail = ? AND o.status = 'COMPLETED' AND oi.productId = ? LIMIT 1`,
      [product.storeId, dto.customerEmail, productId],
    );
    if (!order) throw new BadRequestException('Vous devez acheter ce produit avant de laisser un avis');

    const id = this.db.id();
    this.db.run(
      `INSERT INTO reviews (id, storeId, productId, rating, comment, title, isVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [id, product.storeId, productId, dto.rating, dto.comment ?? null, dto.title ?? null, this.db.now(), this.db.now()],
    );

    this.updateProductRating(productId);
    return mapReview(this.db.get('SELECT * FROM reviews WHERE id = ?', [id]));
  }

  async findByProduct(productId: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query;
    const offset = (Number(page) - 1) * Number(limit);
    const total = this.db.get<{ c: number }>('SELECT COUNT(*) as c FROM reviews WHERE productId = ?', [productId])!.c;
    const rows = this.db.all('SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?', [productId, Number(limit), offset]);
    return { data: rows.map(mapReview), total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async delete(id: string, storeId: string) {
    const review = this.db.get('SELECT * FROM reviews WHERE id = ? AND storeId = ?', [id, storeId]);
    if (!review) throw new NotFoundException('Avis introuvable');
    this.db.run('DELETE FROM reviews WHERE id = ?', [id]);
    this.updateProductRating(review.productId);
    return { message: 'Avis supprimé' };
  }

  private updateProductRating(productId: string) {
    const result = this.db.get<{ avg: number; cnt: number }>(
      'SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE productId = ?', [productId],
    )!;
    const rating = result.avg ? Math.round(result.avg * 10) / 10 : 0;
    this.db.run('UPDATE products SET rating = ?, reviewCount = ? WHERE id = ?', [rating, result.cnt, productId]);
  }
}
