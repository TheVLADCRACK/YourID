import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { mapProduct, mapCategory } from '../../database/mappers';

@Injectable()
export class ProductsService {
  constructor(private db: DatabaseService) {}

  async create(storeId: string, dto: any) {
    const slug = this.generateSlug(dto.title);
    const id = this.db.id();
    const now = this.db.now();
    const contentType = dto.contentUrl ? this.detectContentType(dto.contentUrl) : null;

    this.db.run(
      `INSERT INTO products
       (id, storeId, categoryId, type, status, title, slug, description, shortDesc,
        coverImage, price, comparePrice, currency, contentUrl, contentType, contentNote,
        isMarketplace, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, storeId, dto.categoryId ?? null, dto.type || 'EBOOK', dto.status || 'DRAFT',
       dto.title, slug, dto.description ?? null, dto.shortDesc ?? null,
       dto.coverImage ?? null, dto.price, dto.comparePrice ?? null,
       dto.currency || 'XOF', dto.contentUrl ?? null, contentType,
       dto.contentNote ?? null, this.db.fromBool(dto.isMarketplace ?? true), now, now],
    );
    return this.findById(id);
  }

  async findAll(storeId: string, query: any) {
    const { page = 1, limit = 20, search, status } = query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions = ['storeId = ?'];
    const params: any[] = [storeId];
    if (search) { conditions.push('(title LIKE ? OR description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (status) { conditions.push('status = ?'); params.push(status); }
    const where = conditions.join(' AND ');
    const total = this.db.get<{c:number}>(`SELECT COUNT(*) as c FROM products WHERE ${where}`, params)!.c;
    const rows = this.db.all(`SELECT * FROM products WHERE ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
    return { data: rows.map(r => this.attachCategory(r)), total, page: Number(page), totalPages: Math.ceil(total/Number(limit)) };
  }

  async findOne(id: string, storeId?: string) {
    const row = this.db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!row) throw new NotFoundException('Produit introuvable');
    if (storeId && row.storeId !== storeId) throw new ForbiddenException();
    return this.attachCategory(row, true);
  }

  async findPublicById(id: string) {
    const row = this.db.get(`SELECT * FROM products WHERE id = ? AND status = 'PUBLISHED'`, [id]);
    if (!row) throw new NotFoundException('Produit introuvable');
    this.db.run('UPDATE products SET viewCount = viewCount + 1 WHERE id = ?', [id]);
    return this.attachCategory(row, true);
  }

  async findBySlug(slug: string) {
    const row = this.db.get(`SELECT * FROM products WHERE slug = ? AND status = 'PUBLISHED'`, [slug]);
    if (!row) throw new NotFoundException('Produit introuvable');
    this.db.run('UPDATE products SET viewCount = viewCount + 1 WHERE id = ?', [row.id]);
    return this.attachCategory(row, true);
  }

  async update(id: string, storeId: string, dto: any) {
    await this.findOne(id, storeId);
    const allowed = ['title','description','shortDesc','coverImage','price','comparePrice',
      'currency','contentUrl','contentNote','isMarketplace','status','categoryId','type'];
    const fields = allowed.filter(k => dto[k] !== undefined);
    if (!fields.length) return this.findOne(id, storeId);

    // Auto-detect contentType if contentUrl changes
    if (dto.contentUrl !== undefined) {
      fields.push('contentType');
      dto.contentType = dto.contentUrl ? this.detectContentType(dto.contentUrl) : null;
    }

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => f === 'isMarketplace' ? this.db.fromBool(dto[f]) : dto[f]);
    this.db.run(`UPDATE products SET ${setClause}, updatedAt = ? WHERE id = ?`, [...values, this.db.now(), id]);
    return this.findById(id);
  }

  async remove(id: string, storeId: string) {
    await this.findOne(id, storeId);
    // Supprimer l'image de couverture locale si elle existe
    const product = this.db.get('SELECT coverImage FROM products WHERE id = ?', [id]);
    if (product?.coverImage?.includes('/uploads/')) {
      const fs = require('fs'), path = require('path');
      const uploadsDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
      const rel = product.coverImage.split('/uploads/')[1];
      const full = path.join(uploadsDir, rel);
      if (fs.existsSync(full)) try { fs.unlinkSync(full); } catch {}
    }
    this.db.run('DELETE FROM products WHERE id = ?', [id]);
    return { message: 'Produit supprimé' };
  }

  async publish(id: string, storeId: string) { return this.update(id, storeId, { status: 'PUBLISHED' }); }
  async unpublish(id: string, storeId: string) { return this.update(id, storeId, { status: 'DRAFT' }); }

  async getCategories() {
    return this.db.all('SELECT * FROM categories ORDER BY sortOrder ASC').map(mapCategory);
  }

  private findById(id: string) {
    return this.attachCategory(this.db.get('SELECT * FROM products WHERE id = ?', [id]));
  }

  private attachCategory(row: any, withStore = false) {
    if (!row) return null;
    const p: any = mapProduct(row);
    p.category = p.categoryId ? this.db.get('SELECT * FROM categories WHERE id = ?', [p.categoryId]) : null;
    if (withStore) {
      const store = this.db.get('SELECT id, name, slug, logo, isVerified FROM stores WHERE id = ?', [p.storeId]);
      const owner = store ? this.db.get('SELECT username FROM users WHERE id = (SELECT userId FROM stores WHERE id = ?)', [store.id]) : null;
      p.store = store ? { ...store, isVerified: !!store.isVerified, username: owner?.username } : null;
    }
    return p;
  }

  private detectContentType(url: string): string {
    if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
    if (/vimeo\.com/.test(url)) return 'vimeo';
    if (/drive\.google\.com/.test(url)) return 'gdrive';
    if (/dropbox\.com/.test(url)) return 'dropbox';
    if (/icloud\.com/.test(url)) return 'icloud';
    return 'url';
  }

  private generateSlug(title: string): string {
    const base = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim();
    let slug = base, counter = 1;
    while (this.db.get('SELECT id FROM products WHERE slug = ?', [slug])) slug = `${base}-${counter++}`;
    return slug;
  }
}
