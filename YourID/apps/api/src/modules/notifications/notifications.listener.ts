import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsListener {
  constructor(private notificationsService: NotificationsService, private prisma: PrismaService) {}

  @OnEvent('order.completed')
  async handleOrderCompleted({ order }: any) {
    const store = await this.prisma.store.findUnique({ where: { id: order.storeId } });
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
