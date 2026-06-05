import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

const MIN_WITHDRAWAL: Record<string, number> = {
  XOF: 1000, XAF: 1000, GHS: 5, NGN: 500, KES: 50, EUR: 10, USD: 10,
};

@Injectable()
export class WithdrawalsService {
  constructor(private prisma: PrismaService, private eventEmitter: EventEmitter2) {}

  async create(storeId: string, dto: { amount: number; method: string; accountInfo: Record<string, string>; notes?: string }) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Boutique introuvable');

    // BUG-022 FIX: minimum by currency
    const minAmount = MIN_WITHDRAWAL[store.currency] ?? 1000;
    if (dto.amount < minAmount) {
      throw new BadRequestException(`Montant minimum de retrait: ${minAmount} ${store.currency}`);
    }

    // BUG-009 FIX: atomic check+decrement to prevent race condition
    const withdrawal = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.store.updateMany({
        where: { id: storeId, balance: { gte: dto.amount } },
        data: { balance: { decrement: dto.amount } },
      });

      if (updated.count === 0) {
        throw new BadRequestException('Solde insuffisant');
      }

      return tx.withdrawal.create({
        data: {
          storeId,
          amount: dto.amount,
          currency: store.currency,
          method: dto.method,
          accountInfo: dto.accountInfo,
          notes: dto.notes,
          status: 'PENDING',
        },
      });
    });

    this.eventEmitter.emit('withdrawal.created', { withdrawal, store });
    return withdrawal;
  }

  async findAll(storeId: string, query: any) {
    const { page = 1, limit = 20, status } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { storeId, ...(status && { status }) };
    const [withdrawals, total] = await Promise.all([
      this.prisma.withdrawal.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      this.prisma.withdrawal.count({ where }),
    ]);
    return { data: withdrawals, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }

  async approve(id: string) {
    const w = await this.prisma.withdrawal.findUnique({ where: { id } });
    if (!w) throw new NotFoundException('Retrait introuvable');
    if (w.status !== 'PENDING') throw new BadRequestException(`Impossible d'approuver un retrait avec le statut: ${w.status}`);
    return this.prisma.withdrawal.update({ where: { id }, data: { status: 'APPROVED' } });
  }

  async markPaid(id: string) {
    const w = await this.prisma.withdrawal.findUnique({ where: { id } });
    if (!w) throw new NotFoundException();
    if (w.status !== 'APPROVED') throw new BadRequestException('Le retrait doit être approuvé avant d\'être marqué payé');
    return this.prisma.withdrawal.update({ where: { id }, data: { status: 'PAID', processedAt: new Date() } });
  }

  async reject(id: string, adminNote: string) {
    const w = await this.prisma.withdrawal.findUnique({ where: { id } });
    if (!w) throw new NotFoundException();
    if (w.status === 'PAID') throw new BadRequestException('Impossible de rejeter un retrait déjà payé');

    await this.prisma.$transaction(async (tx) => {
      await tx.withdrawal.update({ where: { id }, data: { status: 'REJECTED', adminNote, processedAt: new Date() } });
      // Only refund if balance was already deducted (status was PENDING or APPROVED)
      if (['PENDING', 'APPROVED'].includes(w.status)) {
        await tx.store.update({ where: { id: w.storeId }, data: { balance: { increment: Number(w.amount) } } });
      }
    });
    return { message: 'Retrait rejeté et solde restitué' };
  }

  async findAllAdmin(query: any) {
    const { page = 1, limit = 20, status } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { ...(status && { status }) };
    const [withdrawals, total] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where, skip, take: Number(limit), orderBy: { createdAt: 'desc' },
        include: { store: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
      }),
      this.prisma.withdrawal.count({ where }),
    ]);
    return { data: withdrawals, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }
}
