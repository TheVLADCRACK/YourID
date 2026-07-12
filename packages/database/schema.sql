-- Your ID — SQLite Schema v2
-- Liens externes pour le contenu (YouTube, Google Drive, Vimeo, Dropbox)
-- Images stockées localement sur le serveur (/uploads/)
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id               TEXT PRIMARY KEY,
  email            TEXT UNIQUE NOT NULL,
  password         TEXT,
  firstName        TEXT NOT NULL,
  lastName         TEXT NOT NULL,
  username         TEXT UNIQUE NOT NULL,
  avatar           TEXT,
  bio              TEXT,
  role             TEXT NOT NULL DEFAULT 'SELLER',
  status           TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
  emailVerified    INTEGER NOT NULL DEFAULT 0,
  createdAt        TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,
  userId        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refreshToken  TEXT UNIQUE NOT NULL,
  ipAddress     TEXT,
  userAgent     TEXT,
  expiresAt     TEXT NOT NULL,
  createdAt     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(userId, expiresAt);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id        TEXT PRIMARY KEY,
  userId    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token     TEXT UNIQUE NOT NULL,
  expiresAt TEXT NOT NULL,
  usedAt    TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stores (
  id           TEXT PRIMARY KEY,
  userId       TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  description  TEXT,
  logo         TEXT,
  banner       TEXT,
  primaryColor TEXT NOT NULL DEFAULT '#00A86B',
  currency     TEXT NOT NULL DEFAULT 'XOF',
  country      TEXT NOT NULL DEFAULT 'SN',
  website      TEXT,
  twitter      TEXT,
  instagram    TEXT,
  youtube      TEXT,
  tiktok       TEXT,
  facebook     TEXT,
  isVerified   INTEGER NOT NULL DEFAULT 0,
  totalRevenue REAL NOT NULL DEFAULT 0,
  totalSales   INTEGER NOT NULL DEFAULT 0,
  balance      REAL NOT NULL DEFAULT 0,
  createdAt    TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id        TEXT PRIMARY KEY,
  name      TEXT UNIQUE NOT NULL,
  slug      TEXT UNIQUE NOT NULL,
  icon      TEXT,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id           TEXT PRIMARY KEY,
  storeId      TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  categoryId   TEXT REFERENCES categories(id),
  type         TEXT NOT NULL DEFAULT 'EBOOK',
  status       TEXT NOT NULL DEFAULT 'DRAFT',
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  description  TEXT,
  shortDesc    TEXT,
  coverImage   TEXT,       -- URL image de couverture (upload local /uploads/)
  price        REAL NOT NULL,
  comparePrice REAL,
  currency     TEXT NOT NULL DEFAULT 'XOF',
  -- Contenu du produit : lien externe uniquement (YouTube, Vimeo, Google Drive, Dropbox)
  contentUrl   TEXT,       -- ex: https://youtu.be/xxx  ou  https://drive.google.com/...
  contentType  TEXT,       -- 'youtube' | 'vimeo' | 'gdrive' | 'dropbox' | 'icloud' | 'url'
  contentNote  TEXT,       -- instructions optionnelles pour l'acheteur
  isFeatured   INTEGER NOT NULL DEFAULT 0,
  isMarketplace INTEGER NOT NULL DEFAULT 1,
  totalSales   INTEGER NOT NULL DEFAULT 0,
  totalRevenue REAL NOT NULL DEFAULT 0,
  rating       REAL NOT NULL DEFAULT 0,
  reviewCount  INTEGER NOT NULL DEFAULT 0,
  viewCount    INTEGER NOT NULL DEFAULT 0,
  createdAt    TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_store_status ON products(storeId, status);
CREATE INDEX IF NOT EXISTS idx_products_marketplace ON products(status, isMarketplace);
CREATE INDEX IF NOT EXISTS idx_products_sales ON products(totalSales);

CREATE TABLE IF NOT EXISTS customers (
  id          TEXT PRIMARY KEY,
  storeId     TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  firstName   TEXT NOT NULL,
  lastName    TEXT NOT NULL,
  totalSpent  REAL NOT NULL DEFAULT 0,
  orderCount  INTEGER NOT NULL DEFAULT 0,
  createdAt   TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(storeId, email)
);

CREATE TABLE IF NOT EXISTS orders (
  id            TEXT PRIMARY KEY,
  storeId       TEXT NOT NULL REFERENCES stores(id),
  customerId    TEXT REFERENCES customers(id),
  orderNumber   TEXT UNIQUE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'PENDING',
  subtotal      REAL NOT NULL,
  platformFee   REAL NOT NULL,
  sellerRevenue REAL NOT NULL,
  total         REAL NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'XOF',
  customerEmail TEXT NOT NULL,
  customerName  TEXT NOT NULL,
  paymentMethod TEXT,
  paymentRef    TEXT,
  completedAt   TEXT,
  createdAt     TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(storeId, status, createdAt);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customerEmail);

CREATE TABLE IF NOT EXISTS order_items (
  id        TEXT PRIMARY KEY,
  orderId   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  productId TEXT NOT NULL REFERENCES products(id),
  title     TEXT NOT NULL,
  price     REAL NOT NULL,
  quantity  INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS transactions (
  id           TEXT PRIMARY KEY,
  orderId      TEXT UNIQUE NOT NULL REFERENCES orders(id),
  amount       REAL NOT NULL,
  currency     TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'PENDING',
  provider     TEXT NOT NULL,
  providerRef  TEXT,
  processedAt  TEXT,
  createdAt    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id          TEXT PRIMARY KEY,
  storeId     TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  amount      REAL NOT NULL,
  currency    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'PENDING',
  method      TEXT NOT NULL,
  accountInfo TEXT NOT NULL,
  notes       TEXT,
  adminNote   TEXT,
  processedAt TEXT,
  createdAt   TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_withdrawals_store ON withdrawals(storeId, status);

CREATE TABLE IF NOT EXISTS reviews (
  id         TEXT PRIMARY KEY,
  storeId    TEXT NOT NULL REFERENCES stores(id),
  productId  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL,
  title      TEXT,
  comment    TEXT,
  isVerified INTEGER NOT NULL DEFAULT 0,
  createdAt  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id        TEXT PRIMARY KEY,
  userId    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type      TEXT NOT NULL,
  title     TEXT NOT NULL,
  message   TEXT NOT NULL,
  data      TEXT,
  isRead    INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId, isRead);

CREATE TABLE IF NOT EXISTS email_logs (
  id          TEXT PRIMARY KEY,
  "to"        TEXT NOT NULL,
  subject     TEXT NOT NULL,
  template    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'sent',
  error       TEXT,
  createdAt   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_contents (
  id        TEXT PRIMARY KEY,
  userId    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type      TEXT NOT NULL,
  prompt    TEXT NOT NULL,
  result    TEXT NOT NULL,
  model     TEXT NOT NULL,
  tokens    INTEGER,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id        TEXT PRIMARY KEY,
  storeId   TEXT,
  productId TEXT,
  event     TEXT NOT NULL,
  properties TEXT,
  ipAddress TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
