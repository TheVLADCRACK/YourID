import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { mapUser } from '../../database/mappers';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async updateProfile(userId: string, dto: any) {
    const fields = ['firstName', 'lastName', 'bio', 'avatar'].filter((k) => dto[k] !== undefined);
    if (fields.length > 0) {
      const setClause = fields.map((f) => `${f} = ?`).join(', ');
      this.db.run(`UPDATE users SET ${setClause}, updatedAt = ? WHERE id = ?`, [...fields.map((f) => dto[f]), this.db.now(), userId]);
    }
    return mapUser(this.db.get('SELECT * FROM users WHERE id = ?', [userId]));
  }

  async findAll(query: any) {
    const { page = 1, limit = 20, search, role } = query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions: string[] = [];
    const params: any[] = [];
    if (search) { conditions.push('(email LIKE ? OR firstName LIKE ? OR lastName LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (role) { conditions.push('role = ?'); params.push(role); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const total = this.db.get<{ c: number }>(`SELECT COUNT(*) as c FROM users ${where}`, params)!.c;
    const rows = this.db.all(`SELECT * FROM users ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
    const data = rows.map((r) => {
      const user = mapUser(r);
      const store = this.db.get('SELECT name, totalRevenue, totalSales FROM stores WHERE userId = ?', [user.id]);
      return { ...user, store };
    });
    return { data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }

  async suspend(userId: string) {
    this.db.run(`UPDATE users SET status = 'SUSPENDED', updatedAt = ? WHERE id = ?`, [this.db.now(), userId]);
    return mapUser(this.db.get('SELECT * FROM users WHERE id = ?', [userId]));
  }

  async activate(userId: string) {
    this.db.run(`UPDATE users SET status = 'ACTIVE', updatedAt = ? WHERE id = ?`, [this.db.now(), userId]);
    return mapUser(this.db.get('SELECT * FROM users WHERE id = ?', [userId]));
  }
}
