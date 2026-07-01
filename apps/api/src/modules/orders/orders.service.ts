import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseService } from '../../database/database.service';
import { mapOrder, mapOrderItem, mapCustomer } from '../../database/mappers';
import { CreateOrderDto } from './dto/create-order.dto';

const PLATFORM_FEE = Number(process.env.PLATFORM_FEE_PERCENT || 15);

@Injectable()
export class OrdersService {
  constructor(private db: DatabaseService, private eventEmitter: EventEmitter2) {}

  async create(dto: CreateOrderDto) {
    const product = this.db.get(`SELECT * FROM products WHERE id = ? AND status = 'PUBLISHED'`, [dto.productId]);
    if (!product) throw new NotFoundException('Produit introuvable ou indisponible');

    const subtotal = Number(product.price);
    const platformFee = Math.round((subtotal * PLATFORM_FEE) / 100);
    const sellerRevenue = subtotal - platformFee;
    const orderId = this.db.id();
    const orderNumber = `YID-${Date.now()}-${Math.random().toString(36).substr(2,5).toUpperCase()}`;
    const now = this.db.now();

    this.db.transaction(() => {
      // Upsert customer
      let customer = this.db.get('SELECT id FROM customers WHERE storeId = ? AND email = ?', [product.storeId, dto.customerEmail]);
      if (!customer) {
        const cid = this.db.id();
        this.db.run(
          `INSERT INTO customers (id,storeId,email,firstName,lastName,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?)`,
          [cid, product.storeId, dto.customerEmail,
           dto.customerName.split(' ')[0] || dto.customerName,
           dto.customerName.split(' ').slice(1).join(' ') || '', now, now]
        );
        customer = { id: cid };
      }

      this.db.run(
        `INSERT INTO orders (id,storeId,customerId,orderNumber,status,subtotal,platformFee,sellerRevenue,total,currency,customerEmail,customerName,paymentMethod,createdAt,updatedAt)
         VALUES (?,?,?,'${orderNumber}','PENDING',?,?,?,?,?,?,?,?,?,?)`,
        [orderId, product.storeId, customer.id, subtotal, platformFee, sellerRevenue,
         subtotal, product.currency, dto.customerEmail, dto.customerName, dto.paymentMethod, now, now]
      );

      this.db.run(
        `INSERT INTO order_items (id,orderId,productId,title,price,quantity) VALUES (?,?,?,?,?,1)`,
        [this.db.id(), orderId, product.id, product.title, product.price]
      );

      this.db.run(
        `INSERT INTO transactions (id,orderId,amount,currency,status,provider,createdAt) VALUES (?,?,?,?,'PENDING',?,?)`,
        [this.db.id(), orderId, subtotal, product.currency, dto.paymentMethod, now]
      );
    });

    return this.attachRelations(this.db.get('SELECT * FROM orders WHERE id = ?', [orderId]));
  }

  async complete(orderId: string, paymentRef?: string) {
    const order = this.db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) throw new NotFoundException('Commande introuvable');
    if (order.status === 'COMPLETED') throw new BadRequestException('Commande déjà complétée');
    if (order.status === 'REFUNDED') throw new BadRequestException('Commande remboursée');

    const now = this.db.now();
    this.db.transaction(() => {
      this.db.run(`UPDATE orders SET status='COMPLETED', completedAt=?, paymentRef=?, updatedAt=? WHERE id=?`,
        [now, paymentRef ?? null, now, orderId]);
      this.db.run(`UPDATE transactions SET status='COMPLETED', processedAt=?, providerRef=? WHERE orderId=?`,
        [now, paymentRef ?? null, orderId]);
      // BUG-031: crédit sellerRevenue (85%), jamais total
      this.db.run(`UPDATE stores SET balance=balance+?, totalRevenue=totalRevenue+?, totalSales=totalSales+1, updatedAt=? WHERE id=?`,
        [order.sellerRevenue, order.sellerRevenue, now, order.storeId]);
      const items = this.db.all('SELECT * FROM order_items WHERE orderId = ?', [orderId]);
      for (const item of items) {
        this.db.run(`UPDATE products SET totalSales=totalSales+1, totalRevenue=totalRevenue+? WHERE id=?`,
          [item.price, item.productId]);
      }
      if (order.customerId) {
        this.db.run(`UPDATE customers SET totalSpent=totalSpent+?, orderCount=orderCount+1, updatedAt=? WHERE id=?`,
          [order.total, now, order.customerId]);
      }
    });

    this.eventEmitter.emit('order.completed', { orderId });
    return this.attachRelations(this.db.get('SELECT * FROM orders WHERE id = ?', [orderId]));
  }

  async findAll(storeId: string, query: any) {
    const { page=1, limit=20, status, search } = query;
    const offset = (Number(page)-1)*Number(limit);
    const conditions = ['storeId = ?'];
    const params: any[] = [storeId];
    if (status) { conditions.push('status = ?'); params.push(status); }
    if (search) {
      conditions.push('(customerEmail LIKE ? OR customerName LIKE ? OR orderNumber LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const where = conditions.join(' AND ');
    const total = this.db.get<{c:number}>(`SELECT COUNT(*) as c FROM orders WHERE ${where}`, params)!.c;
    const rows = this.db.all(`SELECT * FROM orders WHERE ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
    return { data: rows.map(r => this.attachRelations(r)), total, page: Number(page), totalPages: Math.ceil(total/Number(limit)) };
  }

  async findOne(id: string, storeId: string) {
    const row = this.db.get('SELECT * FROM orders WHERE id = ? AND storeId = ?', [id, storeId]);
    if (!row) throw new NotFoundException('Commande introuvable');
    return this.attachRelations(row, true);
  }

  private attachRelations(row: any, withDetail = false) {
    if (!row) return row;
    const order: any = mapOrder(row);
    const items = this.db.all('SELECT * FROM order_items WHERE orderId = ?', [order.id]).map(mapOrderItem);
    order.items = items.map((item: any) => {
      const product = this.db.get('SELECT title, coverImage, contentUrl, contentType, contentNote FROM products WHERE id = ?', [item.productId]);
      return { ...item, product };
    });
    if (order.customerId) {
      const c = this.db.get('SELECT * FROM customers WHERE id = ?', [order.customerId]);
      order.customer = c ? mapCustomer(c) : null;
    }
    if (withDetail) {
      order.transaction = this.db.get('SELECT * FROM transactions WHERE orderId = ?', [order.id]) ?? null;
    }
    return order;
  }
}
