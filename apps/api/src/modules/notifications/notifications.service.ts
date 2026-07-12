import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { mapNotification } from '../../database/mappers';

@Injectable()
export class NotificationsService {
  constructor(private db: DatabaseService) {}

  async create(userId: string, data: { type: string; title: string; message: string; data?: any }) {
    const id = this.db.id();
    this.db.run(
      `INSERT INTO notifications (id, userId, type, title, message, data, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, data.type, data.title, data.message, this.db.toJson(data.data), this.db.now()],
    );
    return mapNotification(this.db.get('SELECT * FROM notifications WHERE id = ?', [id]));
  }

  async findAll(userId: string) {
    const rows = this.db.all('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 50', [userId]);
    return rows.map(mapNotification);
  }

  async markRead(id: string, userId: string) {
    this.db.run('UPDATE notifications SET isRead = 1, readAt = ? WHERE id = ? AND userId = ?', [this.db.now(), id, userId]);
    return { success: true };
  }

  async markAllRead(userId: string) {
    this.db.run('UPDATE notifications SET isRead = 1, readAt = ? WHERE userId = ? AND isRead = 0', [this.db.now(), userId]);
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const count = this.db.get<{ c: number }>('SELECT COUNT(*) as c FROM notifications WHERE userId = ? AND isRead = 0', [userId])!.c;
    return { count };
  }
}
