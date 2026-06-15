import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderDto } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';

const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT || 15);

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, private eventEmitter: EventEmitter2) {}

  async create(dto: CreateOrderDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, status: 'PUBLISHED' },
      include: { store: true },
    });
    if (!product) throw new NotFoundException('Produit introuvable ou indisponible');

    const subtotal = Number(product.price);
    const platformFee = Math.round((subtotal * PLATFORM_FEE_PERCENT) / 100);
    const sellerRevenue = subtotal - platformFee;

    // BUG-011 FIX: customer creation inside transaction
    const orderNumber = `YID-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const order = await this.prisma.$transaction(async (tx) => {
      // Upsert customer inside transaction
      let customer = await tx.customer.findUnique({
        where: { storeId_email: { storeId: product.storeId, email: dto.customerEmail } },
      });
      if (!customer) {
        customer = await tx.customer.create({
          data: {
            storeId: product.storeId,
            email: dto.customerEmail,
            firstName: dto.customerName.split(' ')[0] || dto.customerName,
            lastName: dto.customerName.split(' ').slice(1).join(' ') || '',
          },
        });
      }

      const newOrder = await tx.order.create({
        data: {
          storeId: product.storeId,
          customerId: customer.id,
          orderNumber,
          status: 'PENDING',
          subtotal,
          platformFee,
          sellerRevenue,
          total: subtotal,
          currency: product.currency,
          customerEmail: dto.customerEmail,
          customerName: dto.customerName,
          paymentMethod: dto.paymentMethod,
          items: {
            create: [{ productId: product.id, title: product.title, price: product.price, quantity: 1 }],
          },
        },
        include: { items: true, customer: true },
      });

      await tx.transaction.create({
        data: {
          orderId: newOrder.id,
          amount: subtotal,
          currency: product.currency,
          status: 'PENDING',
          provider: dto.paymentMethod,
        },
      });

      return newOrder;
    });

    return order;
  }

  async complete(orderId: string, paymentRef?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: { include: { files: true } } } }, store: true },
    });
    if (!order) throw new NotFoundException('Commande introuvable');

    // BUG-012 FIX: guard double completion
    if (order.status === 'COMPLETED') {
      throw new BadRequestException('Cette commande a déjà été complétée');
    }
    if (order.status === 'REFUNDED') {
      throw new BadRequestException('Impossible de compléter une commande remboursée');
    }

    const completedOrder = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED', completedAt: new Date(), paymentRef },
      });

      await tx.transaction.updateMany({
        where: { orderId },
        data: { status: 'COMPLETED', processedAt: new Date(), providerRef: paymentRef },
      });

      // BUG-031 FIX: totalRevenue = sellerRevenue (85%), NOT total (100%)
      await tx.store.update({
        where: { id: order.storeId },
        data: {
          balance: { increment: order.sellerRevenue },
          totalRevenue: { increment: Number(order.sellerRevenue) }, // ← FIXED: was order.total
          totalSales: { increment: 1 },
        },
      });

      // BUG-026 FIX: use updateMany instead of loop
      const productIds = order.items.map(i => i.productId);
      await tx.product.updateMany({
        where: { id: { in: productIds } },
        data: { totalSales: { increment: 1 } },
      });
      // Update revenue per product individually (different prices)
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { totalRevenue: { increment: Number(item.price) } },
        });
      }

      if (order.customerId) {
        await tx.customer.update({
          where: { id: order.customerId },
          data: { totalSpent: { increment: Number(order.total) }, orderCount: { increment: 1 } },
        });
      }

      // Generate download tokens
      const downloadData: Prisma.DownloadLogCreateManyInput[] = [];
      for (const item of order.items) {
        for (const file of item.product.files) {
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 48);
          downloadData.push({
            productId: item.productId,
            productFileId: file.id,
            orderId,
            token: uuidv4(),
            expiresAt,
            isUsed: false,
          });
        }
      }
      if (downloadData.length > 0) {
        await tx.downloadLog.createMany({ data: downloadData });
      }

      return updated;
    });

    this.eventEmitter.emit('order.completed', { orderId });
    return completedOrder;
  }

  async findAll(storeId: string, query: any) {
    const { page = 1, limit = 20, status, search } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.OrderWhereInput = {
      storeId,
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { customerEmail: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } },
          { orderNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: { select: { title: true, coverImage: true } } } },
          customer: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data: orders, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }

  async findOne(id: string, storeId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, storeId },
      include: { items: { include: { product: true } }, customer: true, transaction: true },
    });
    if (!order) throw new NotFoundException('Commande introuvable');
    return order;
  }

  async getDownloadLinks(orderId: string) {
    return this.prisma.downloadLog.findMany({
      where: { orderId, isUsed: false, expiresAt: { gt: new Date() } },
      include: { productFile: { select: { id: true, name: true, fileName: true, mimeType: true, fileSize: true } } },
    });
  }
}
