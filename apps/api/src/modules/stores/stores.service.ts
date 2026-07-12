import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { mapStore, mapProduct, mapCategory, mapCustomer } from '../../database/mappers';

@Injectable()
export class StoresService {
  constructor(private db: DatabaseService) {}

  async findByUsername(username: string, productPage = 1, productLimit = 12) {
    const user = this.db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) throw new NotFoundException('Boutique introuvable');
    const storeRow = this.db.get('SELECT * FROM stores WHERE userId = ?', [user.id]);
    if (!storeRow) throw new NotFoundException('Boutique introuvable');

    const offset = (Number(productPage) - 1) * Number(productLimit);
    const productsTotal = this.db.get<{ c: number }>(
      `SELECT COUNT(*) as c FROM products WHERE storeId = ? AND status = 'PUBLISHED'`, [storeRow.id],
    )!.c;
    const productRows = this.db.all(
      `SELECT * FROM products WHERE storeId = ? AND status = 'PUBLISHED' ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [storeRow.id, Number(productLimit), offset],
    );
    const products = productRows.map((p) => {
      const product = mapProduct(p);
      const category = product.categoryId ? this.db.get('SELECT name, slug FROM categories WHERE id = ?', [product.categoryId]) : null;
      return { ...product, category };
    });

    return {
      ...mapStore(storeRow),
      user: { firstName: user.firstName, lastName: user.lastName, username: user.username, bio: user.bio, avatar: user.avatar },
      products,
      productsTotal,
      productPage: Number(productPage),
    };
  }

  async findBySlug(slug: string) {
    const storeRow = this.db.get('SELECT * FROM stores WHERE slug = ?', [slug]);
    if (!storeRow) throw new NotFoundException('Boutique introuvable');
    const user = this.db.get('SELECT firstName, lastName, username, avatar, bio FROM users WHERE id = ?', [storeRow.userId]);
    const productRows = this.db.all(
      `SELECT * FROM products WHERE storeId = ? AND status = 'PUBLISHED' ORDER BY createdAt DESC LIMIT 12`, [storeRow.id],
    );
    const products = productRows.map((p) => {
      const product = mapProduct(p);
      const category = product.categoryId ? this.db.get('SELECT name FROM categories WHERE id = ?', [product.categoryId]) : null;
      return { ...product, category };
    });

    return { ...mapStore(storeRow), user, products };
  }

  async update(storeId: string, dto: any) {
    const allowed = ['name', 'description', 'logo', 'banner', 'favicon', 'primaryColor',
      'currency', 'country', 'website', 'twitter', 'instagram', 'youtube', 'tiktok', 'facebook'];
    const fields = allowed.filter((k) => dto[k] !== undefined);
    if (fields.length === 0) return mapStore(this.db.get('SELECT * FROM stores WHERE id = ?', [storeId]));

    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => dto[f]);
    this.db.run(`UPDATE stores SET ${setClause}, updatedAt = ? WHERE id = ?`, [...values, this.db.now(), storeId]);
    return mapStore(this.db.get('SELECT * FROM stores WHERE id = ?', [storeId]));
  }

  async getCustomers(storeId: string, query: any) {
    const { page = 1, limit = 20, search } = query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions = ['storeId = ?'];
    const params: any[] = [storeId];
    if (search) {
      conditions.push('(email LIKE ? OR firstName LIKE ? OR lastName LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const where = conditions.join(' AND ');
    const total = this.db.get<{ c: number }>(`SELECT COUNT(*) as c FROM customers WHERE ${where}`, params)!.c;
    const rows = this.db.all(`SELECT * FROM customers WHERE ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
    return { data: rows.map(mapCustomer), total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }
}
