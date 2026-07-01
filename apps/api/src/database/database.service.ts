import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import BetterSqlite3 from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * DatabaseService — lightweight SQLite data layer replacing PrismaService.
 *
 * Design goals (per infra simplification spec):
 *  - No Docker container required (file-based DB)
 *  - No ORM engine binary (better-sqlite3 is a thin native addon)
 *  - Synchronous I/O (SQLite + better-sqlite3) wrapped in async methods
 *    for drop-in compatibility with existing NestJS service code.
 *
 * Usage in services mirrors the previous `this.prisma.x.y()` style closely:
 *   this.db.get<User>('SELECT * FROM users WHERE id = ?', [id])
 *   this.db.all<Product>('SELECT * FROM products WHERE storeId = ?', [storeId])
 *   this.db.run('UPDATE stores SET balance = balance - ? WHERE id = ?', [amt, id])
 *   this.db.transaction(() => { ... })
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  public conn!: BetterSqlite3.Database;

  onModuleInit() {
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'yourid.db');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    this.conn = new BetterSqlite3(dbPath);
    this.conn.pragma('journal_mode = WAL');
    this.conn.pragma('foreign_keys = ON');

    this.runMigrations();
    this.logger.log(`📦 SQLite database ready at ${dbPath}`);
  }

  onModuleDestroy() {
    this.conn?.close();
  }

  private runMigrations() {
    // Resolves schema.sql both in ts-node dev (src/) and compiled dist/ (via nest-cli assets copy)
    const candidates = [
      path.join(__dirname, 'schema.sql'),
      path.join(process.cwd(), 'dist', 'database', 'schema.sql'),
      path.join(process.cwd(), 'src', 'database', 'schema.sql'),
    ];
    const schemaPath = candidates.find((p) => fs.existsSync(p));
    if (!schemaPath) throw new Error('schema.sql introuvable — vérifiez la config nest-cli assets');
    const sql = fs.readFileSync(schemaPath, 'utf-8');
    this.conn.exec(sql);
  }

  // ─── Generic helpers ────────────────────────────────────────────────────

  /** Generates a sortable, collision-resistant ID (replaces Prisma's cuid()). */
  id(): string {
    return `${Date.now().toString(36)}${crypto.randomBytes(8).toString('hex')}`;
  }

  now(): string {
    return new Date().toISOString();
  }

  get<T = any>(sql: string, params: any[] = []): T | undefined {
    return this.conn.prepare(sql).get(...params) as T | undefined;
  }

  all<T = any>(sql: string, params: any[] = []): T[] {
    return this.conn.prepare(sql).all(...params) as T[];
  }

  run(sql: string, params: any[] = []): BetterSqlite3.RunResult {
    return this.conn.prepare(sql).run(...params);
  }

  /** Runs `fn` inside a SQLite transaction. Throwing inside `fn` rolls back automatically. */
  transaction<T>(fn: () => T): T {
    return this.conn.transaction(fn)();
  }

  // ─── JSON helpers (SQLite has no native JSON column type) ──────────────

  toJson(value: unknown): string | null {
    if (value === undefined || value === null) return null;
    return JSON.stringify(value);
  }

  fromJson<T = any>(value: string | null | undefined): T | null {
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  // ─── Boolean helpers (SQLite stores booleans as 0/1) ────────────────────

  toBool(value: number | null | undefined): boolean {
    return !!value;
  }

  fromBool(value: boolean | undefined): number {
    return value ? 1 : 0;
  }
}
