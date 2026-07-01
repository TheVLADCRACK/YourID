import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class NotificationsListener {
  constructor(private notificationsService: NotificationsService, private db: DatabaseService) {}

  @OnEvent('order.completed')
  async handleOrderCompleted({ orderId }: { orderId: string }) {
    const order = this.db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return;
    const store = this.db.get('SELECT * FROM stores WHERE id = ?', [order.storeId]);
    if (!store) return;
    await this.notificationsService.create(store.userId, {
      type: 'NEW_SALE',
      title: '🎉 Nouvelle vente !',
      message: `Vous avez reçu une nouvelle commande de ${order.customerName}.`,
      data: { orderId: order.id },
    });
  }

  @OnEvent('withdrawal.created')
  async handleWithdrawalCreated({ withdrawal, store }: any) {
    await this.notificationsService.create(store.userId, {
      type: 'WITHDRAWAL_REQUEST',
      title: 'Demande de retrait reçue',
      message: `Votre demande de retrait de ${withdrawal.amount} ${withdrawal.currency} est en cours de traitement.`,
      data: { withdrawalId: withdrawal.id },
    });
  }
}
