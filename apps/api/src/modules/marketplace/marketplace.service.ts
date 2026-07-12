import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { mapProduct } from '../../database/mappers';

@Injectable()
export class MarketplaceService {
  constructor(private db: DatabaseService) {}

  private attachStoreCategory(rows: any[]) {
    return rows.map((r) => {
      const product = mapProduct(r);
      const store = this.db.get('SELECT name, slug, logo, isVerified FROM stores WHERE id = ?', [product.storeId]);
      const category = product.categoryId ? this.db.get('SELECT name, slug FROM categories WHERE id = ?', [product.categoryId]) : null;
      return { ...product, store: store ? { ...store, isVerified: !!store.isVerified } : null, category };
    });
  }

  async findAll(query: any) {
    const { page = 1, limit = 24, search, category, minPrice, maxPrice, sortBy = 'popular' } = query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [`p.status = 'PUBLISHED'`, 'p.isMarketplace = 1'];
    const params: any[] = [];
    if (search) { conditions.push('(p.title LIKE ? OR p.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (category) { conditions.push('p.categoryId = (SELECT id FROM categories WHERE slug = ?)'); params.push(category); }
    if (minPrice) { conditions.push('p.price >= ?'); params.push(Number(minPrice)); }
    if (maxPrice) { conditions.push('p.price <= ?'); params.push(Number(maxPrice)); }
    const where = conditions.join(' AND ');

    const orderBy = sortBy === 'newest' ? 'p.createdAt DESC'
      : sortBy === 'price_asc' ? 'p.price ASC'
      : sortBy === 'price_desc' ? 'p.price DESC'
      : sortBy === 'rating' ? 'p.rating DESC'
      : 'p.totalSales DESC';

    const total = this.db.get<{ c: number }>(`SELECT COUNT(*) as c FROM products p WHERE ${where}`, params)!.c;
    const rows = this.db.all(`SELECT p.* FROM products p WHERE ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);

    return { data: this.attachStoreCategory(rows), total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }

  async getFeatured() {
    const rows = this.db.all(`SELECT * FROM products WHERE status = 'PUBLISHED' AND isMarketplace = 1 AND isFeatured = 1 LIMIT 8`);
    return this.attachStoreCategory(rows);
  }

  async getPopular() {
    const rows = this.db.all(`SELECT * FROM products WHERE status = 'PUBLISHED' AND isMarketplace = 1 ORDER BY totalSales DESC LIMIT 12`);
    return this.attachStoreCategory(rows);
  }

  async getByCategory(categorySlug: string, limit = 12) {
    const rows = this.db.all(
      `SELECT * FROM products WHERE status = 'PUBLISHED' AND isMarketplace = 1 AND categoryId = (SELECT id FROM categories WHERE slug = ?) ORDER BY totalSales DESC LIMIT ?`,
      [categorySlug, limit],
    );
    return this.attachStoreCategory(rows);
  }

  async getStats() {
    const totalProducts = this.db.get<{ c: number }>(`SELECT COUNT(*) as c FROM products WHERE status = 'PUBLISHED' AND isMarketplace = 1`)!.c;
    const totalSellers = this.db.get<{ c: number }>(`SELECT COUNT(DISTINCT storeId) as c FROM products WHERE status = 'PUBLISHED'`)!.c;
    const totalRevenue = this.db.get<{ sum: number }>('SELECT COALESCE(SUM(totalRevenue),0) as sum FROM stores')!.sum;
    return { totalProducts, totalSellers, totalRevenue: Number(totalRevenue ?? 0) };
  }
}
