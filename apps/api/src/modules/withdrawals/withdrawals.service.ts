import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from '../../database/database.service';
import { mapWithdrawal, mapStore } from '../../database/mappers';

const MIN_WITHDRAWAL: Record<string, number> = {
  XOF: 1000, XAF: 1000, GHS: 5, NGN: 500, KES: 50, EUR: 10, USD: 10,
};

@Injectable()
export class WithdrawalsService {
  constructor(private db: DatabaseService, private eventEmitter: EventEmitter2) {}

  async create(storeId: string, dto: { amount: number; method: string; accountInfo: Record<string, string>; notes?: string }) {
    const store = this.db.get('SELECT * FROM stores WHERE id = ?', [storeId]);
    if (!store) throw new NotFoundException('Boutique introuvable');

    const minAmount = MIN_WITHDRAWAL[store.currency] ?? 1000;
    if (dto.amount < minAmount) {
      throw new BadRequestException(`Montant minimum de retrait: ${minAmount} ${store.currency}`);
    }

    const withdrawalId = this.db.id();
    const now = this.db.now();

    // BUG-009 fix preserved: atomic check+decrement to prevent race condition.
    // SQLite transactions are serialized by the better-sqlite3 driver (single connection,
    // synchronous), so this is inherently race-free — even stronger than the Postgres version.
    this.db.transaction(() => {
      const result = this.db.run('UPDATE stores SET balance = balance - ?, updatedAt = ? WHERE id = ? AND balance >= ?', [
        dto.amount, now, storeId, dto.amount,
      ]);
      if (result.changes === 0) throw new BadRequestException('Solde insuffisant');

      this.db.run(
        `INSERT INTO withdrawals (id, storeId, amount, currency, status, method, accountInfo, notes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)`,
        [withdrawalId, storeId, dto.amount, store.currency, dto.method, this.db.toJson(dto.accountInfo), dto.notes ?? null, now, now],
      );
    });

    const withdrawal = mapWithdrawal(this.db.get('SELECT * FROM withdrawals WHERE id = ?', [withdrawalId]));
    this.eventEmitter.emit('withdrawal.created', { withdrawal, store: mapStore(store) });
    return withdrawal;
  }

  async findAll(storeId: string, query: any) {
    const { page = 1, limit = 20, status } = query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions = ['storeId = ?'];
    const params: any[] = [storeId];
    if (status) { conditions.push('status = ?'); params.push(status); }
    const where = conditions.join(' AND ');

    const total = this.db.get<{ c: number }>(`SELECT COUNT(*) as c FROM withdrawals WHERE ${where}`, params)!.c;
    const rows = this.db.all(`SELECT * FROM withdrawals WHERE ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
    return { data: rows.map(mapWithdrawal), total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }

  async approve(id: string) {
    const w = this.db.get('SELECT * FROM withdrawals WHERE id = ?', [id]);
    if (!w) throw new NotFoundException('Retrait introuvable');
    if (w.status !== 'PENDING') throw new BadRequestException(`Impossible d'approuver un retrait avec le statut: ${w.status}`);
    this.db.run(`UPDATE withdrawals SET status = 'APPROVED', updatedAt = ? WHERE id = ?`, [this.db.now(), id]);
    return mapWithdrawal(this.db.get('SELECT * FROM withdrawals WHERE id = ?', [id]));
  }

  async markPaid(id: string) {
    const w = this.db.get('SELECT * FROM withdrawals WHERE id = ?', [id]);
    if (!w) throw new NotFoundException();
    if (w.status !== 'APPROVED') throw new BadRequestException("Le retrait doit être approuvé avant d'être marqué payé");
    const now = this.db.now();
    this.db.run(`UPDATE withdrawals SET status = 'PAID', processedAt = ?, updatedAt = ? WHERE id = ?`, [now, now, id]);
    return mapWithdrawal(this.db.get('SELECT * FROM withdrawals WHERE id = ?', [id]));
  }

  async reject(id: string, adminNote: string) {
    const w = this.db.get('SELECT * FROM withdrawals WHERE id = ?', [id]);
    if (!w) throw new NotFoundException();
    if (w.status === 'PAID') throw new BadRequestException('Impossible de rejeter un retrait déjà payé');

    const now = this.db.now();
    this.db.transaction(() => {
      this.db.run(`UPDATE withdrawals SET status = 'REJECTED', adminNote = ?, processedAt = ?, updatedAt = ? WHERE id = ?`, [adminNote, now, now, id]);
      if (['PENDING', 'APPROVED'].includes(w.status)) {
        this.db.run('UPDATE stores SET balance = balance + ?, updatedAt = ? WHERE id = ?', [w.amount, now, w.storeId]);
      }
    });
    return { message: 'Retrait rejeté et solde restitué' };
  }

  async findAllAdmin(query: any) {
    const { page = 1, limit = 20, status } = query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions: string[] = [];
    const params: any[] = [];
    if (status) { conditions.push('w.status = ?'); params.push(status); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const total = this.db.get<{ c: number }>(`SELECT COUNT(*) as c FROM withdrawals w ${where}`, params)!.c;
    const rows = this.db.all(
      `SELECT w.* FROM withdrawals w ${where} ORDER BY w.createdAt DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset],
    );

    const data = rows.map((r) => {
      const w = mapWithdrawal(r);
      const store = this.db.get('SELECT id, name FROM stores WHERE id = ?', [w.storeId]);
      const user = store ? this.db.get('SELECT firstName, lastName, email FROM users WHERE id = (SELECT userId FROM stores WHERE id = ?)', [store.id]) : null;
      return { ...w, store: store ? { ...store, user } : null };
    });

    return { data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }
}
