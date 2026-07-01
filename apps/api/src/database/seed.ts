/**
 * SQLite Seed — Your ID
 * Run: npm run db:seed (from apps/api directory)
 *
 * Creates:
 *   - 5 categories
 *   - Admin user   admin@yourid.com / Admin@2025!
 *   - Demo seller  demo@yourid.com  / Demo@2025!
 *   - Demo store + 3 published products
 */
import * as path from 'path';
import * as fs from 'fs';
import * as argon2 from 'argon2';
import BetterSqlite3 from 'better-sqlite3';
import * as crypto from 'crypto';

const id = () => `${Date.now().toString(36)}${crypto.randomBytes(8).toString('hex')}`;
const now = () => new Date().toISOString();

async function main() {
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), '..', '..', 'data', 'yourid.db');
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new BetterSqlite3(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Run migrations
  const schemaPath = path.join(__dirname, 'schema.sql');
  db.exec(fs.readFileSync(schemaPath, 'utf-8'));
  console.log('✅ Schema applied');

  // ─── Categories ────────────────────────────────────────────────────────
  const categories = [
    { id: id(), name: 'Ebooks', slug: 'ebooks', icon: 'BookOpen', sortOrder: 1 },
    { id: id(), name: 'Formations', slug: 'formations', icon: 'GraduationCap', sortOrder: 2 },
    { id: id(), name: 'Templates', slug: 'templates', icon: 'Layout', sortOrder: 3 },
    { id: id(), name: 'Audio', slug: 'audio', icon: 'Music', sortOrder: 4 },
    { id: id(), name: 'Logiciels', slug: 'logiciels', icon: 'Code', sortOrder: 5 },
  ];
  const insertCat = db.prepare(
    `INSERT OR IGNORE INTO categories (id, name, slug, icon, sortOrder, createdAt) VALUES (?, ?, ?, ?, ?, ?)`
  );
  for (const c of categories) insertCat.run(c.id, c.name, c.slug, c.icon, c.sortOrder, now());
  console.log(`✅ ${categories.length} categories`);

  // ─── Admin ─────────────────────────────────────────────────────────────
  const adminId = id();
  const adminPassword = await argon2.hash('Admin@2025!', { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 });
  db.prepare(`INSERT OR IGNORE INTO users (id, email, password, firstName, lastName, username, role, status, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 'ADMIN', 'ACTIVE', 1, ?, ?)`)
    .run(adminId, 'admin@yourid.com', adminPassword, 'Admin', 'YourID', 'admin', now(), now());
  console.log('✅ Admin: admin@yourid.com / Admin@2025!');

  // ─── Demo seller ───────────────────────────────────────────────────────
  const sellerId = id();
  const storeId = id();
  const sellerPassword = await argon2.hash('Demo@2025!', { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 });

  db.prepare(`INSERT OR IGNORE INTO users (id, email, password, firstName, lastName, username, role, status, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 'SELLER', 'ACTIVE', 1, ?, ?)`)
    .run(sellerId, 'demo@yourid.com', sellerPassword, 'Kofi', 'Mensah', 'kofimensah', now(), now());

  db.prepare(`INSERT OR IGNORE INTO stores (id, userId, name, slug, description, currency, country, totalRevenue, totalSales, balance, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(storeId, sellerId, 'Digital Africa', 'digitalafrica', 'Ressources digitales pour entrepreneurs africains', 'XOF', 'SN', 850000, 127, 125000, now(), now());

  const catEbook = db.prepare('SELECT id FROM categories WHERE slug = ?').get('ebooks') as any;
  const catFormation = db.prepare('SELECT id FROM categories WHERE slug = ?').get('formations') as any;
  const catTemplate = db.prepare('SELECT id FROM categories WHERE slug = ?').get('templates') as any;

  const products = [
    { id: id(), categoryId: catEbook?.id, type: 'EBOOK', title: 'Guide Ultime du E-Commerce en Afrique', slug: 'guide-ecommerce-afrique', description: 'Tout ce dont vous avez besoin pour lancer et développer votre boutique en ligne en Afrique. Méthodes éprouvées, études de cas réels, stratégies adaptées au marché africain.', price: 15000, totalSales: 45, rating: 4.8, reviewCount: 23 },
    { id: id(), categoryId: catFormation?.id, type: 'COURSE', title: 'Formation Complète Marketing Digital', slug: 'formation-marketing-digital', description: 'Maîtrisez les stratégies de marketing digital pour développer votre audience et multiplier vos revenus. Plus de 8 heures de contenu vidéo.', price: 35000, totalSales: 32, rating: 4.9, reviewCount: 18 },
    { id: id(), categoryId: catTemplate?.id, type: 'TEMPLATE', title: 'Pack Templates Business Plan', slug: 'templates-business-plan', description: 'Collection de 20 templates professionnels pour votre business plan. Compatibles Word, Excel et Google Docs. Livrés en français.', price: 8000, totalSales: 50, rating: 4.7, reviewCount: 31 },
  ];

  const insertProd = db.prepare(
    `INSERT OR IGNORE INTO products (id, storeId, categoryId, type, status, title, slug, description, price, currency, isMarketplace, totalSales, totalRevenue, rating, reviewCount, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 'PUBLISHED', ?, ?, ?, ?, 'XOF', 1, ?, ?, ?, ?, ?, ?)`
  );
  for (const p of products) {
    insertProd.run(p.id, storeId, p.categoryId ?? null, p.type, p.title, p.slug, p.description, p.price, p.totalSales, p.price * p.totalSales, p.rating, p.reviewCount, now(), now());
  }
  console.log('✅ Demo seller + 3 products: demo@yourid.com / Demo@2025!');

  db.close();
  console.log('\n🎉 Seed completed successfully!');
  console.log('\n  Admin:  admin@yourid.com  / Admin@2025!');
  console.log('  Seller: demo@yourid.com   / Demo@2025!\n');
}

main().catch(e => { console.error(e); process.exit(1); });
