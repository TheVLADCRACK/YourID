import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Resend } from 'resend';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private from: string;

  constructor(private config: ConfigService, private prisma: PrismaService) {
    this.resend = new Resend(this.config.get('RESEND_API_KEY'));
    this.from = this.config.get('EMAIL_FROM', 'Your ID <noreply@yourid.com>');
  }

  async send(to: string, subject: string, html: string, template: string) {
    try {
      const { data, error } = await this.resend.emails.send({ from: this.from, to, subject, html });
      await this.prisma.emailLog.create({
        data: { to, subject, template, status: error ? 'failed' : 'sent', providerRef: data?.id, error: error?.message },
      });
      if (error) this.logger.error(`Email failed to ${to}: ${error.message}`);
      return data;
    } catch (err: any) {
      this.logger.error(`Email error: ${err.message}`);
      try {
        await this.prisma.emailLog.create({ data: { to, subject, template, status: 'failed', error: err.message } });
      } catch {}
    }
  }

  private layout(content: string) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:Arial,sans-serif;background:#F8FAFC;margin:0;padding:0}
      .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden}
      .header{background:#00A86B;padding:32px;text-align:center}
      .header h1{color:#fff;font-size:24px;font-weight:900;margin:0}
      .body{padding:32px}
      .btn{display:inline-block;background:#00A86B;color:#fff;font-weight:700;padding:14px 28px;border-radius:50px;text-decoration:none;margin:20px 0}
      .footer{background:#F8FAFC;border-top:1px solid #E5E7EB;padding:20px;text-align:center;font-size:12px;color:#9CA3AF}
      .amount{font-size:32px;font-weight:900;color:#00A86B;text-align:center;margin:16px 0}
      .card{background:#F8FAFC;border-radius:12px;padding:20px;margin:16px 0}
    </style></head><body>
    <div class="wrap">
      <div class="header"><h1>Your ID</h1></div>
      <div class="body">${content}</div>
      <div class="footer">© 2025 Your ID · La plateforme qui transforme vos connaissances en revenus</div>
    </div></body></html>`;
  }

  async sendWelcome(to: string, firstName: string, storeSlug: string) {
    const html = this.layout(`
      <h2>Bienvenue sur Your ID, ${firstName} ! 🎉</h2>
      <p>Votre boutique <strong>${storeSlug}</strong> est prête. Commencez à vendre vos produits digitaux dès maintenant.</p>
      <div class="card"><p><strong>Prochaines étapes :</strong></p>
      <p>1. 📦 Créez votre premier produit</p>
      <p>2. 🎨 Personnalisez votre boutique</p>
      <p>3. 🚀 Partagez votre lien</p></div>
      <a href="${this.config.get('APP_URL')}/dashboard" class="btn">Accéder à mon tableau de bord</a>
    `);
    return this.send(to, 'Bienvenue sur Your ID ! 🎉', html, 'welcome');
  }

  async sendPurchaseConfirmation(to: string, data: { customerName: string; productTitle: string; amount: string; currency: string; downloadToken?: string }) {
    const downloadSection = data.downloadToken
      ? `<a href="${this.config.get('API_URL', 'http://localhost:4000')}/api/v1/download/${data.downloadToken}" class="btn">📥 Télécharger mon produit</a>
         <p style="font-size:12px;color:#9CA3AF">Ce lien est valable 48h et à usage unique.</p>`
      : '<p>Connectez-vous à votre compte pour accéder à votre achat.</p>';

    const html = this.layout(`
      <h2>Votre achat est confirmé ! ✅</h2>
      <p>Bonjour <strong>${data.customerName}</strong>,</p>
      <p>Merci pour votre achat. Votre paiement a bien été reçu.</p>
      <div class="card">
        <p><strong>Produit :</strong> ${data.productTitle}</p>
        <p><strong>Montant :</strong> ${data.amount} ${data.currency}</p>
      </div>
      ${downloadSection}
    `);
    return this.send(to, `✅ Votre achat : ${data.productTitle}`, html, 'purchase');
  }

  async sendNewSaleAlert(to: string, data: { sellerName: string; productTitle: string; amount: string; currency: string; buyerEmail: string }) {
    const html = this.layout(`
      <h2>Nouvelle vente ! 🎉</h2>
      <p>Félicitations <strong>${data.sellerName}</strong> !</p>
      <div class="amount">${data.amount} ${data.currency}</div>
      <div class="card">
        <p><strong>Produit :</strong> ${data.productTitle}</p>
        <p><strong>Acheteur :</strong> ${data.buyerEmail}</p>
      </div>
      <a href="${this.config.get('APP_URL')}/dashboard/orders" class="btn">Voir mes commandes</a>
    `);
    return this.send(to, `💰 Nouvelle vente — ${data.productTitle}`, html, 'new_sale');
  }

  async sendWithdrawalStatus(to: string, data: { name: string; amount: string; currency: string; status: 'approved'|'paid'|'rejected'; adminNote?: string }) {
    const cfg = {
      approved: { emoji: '✅', title: 'Retrait approuvé', msg: 'Votre demande sera traitée prochainement.' },
      paid: { emoji: '💸', title: 'Retrait effectué', msg: 'Vos fonds sont en cours de transfert.' },
      rejected: { emoji: '❌', title: 'Retrait refusé', msg: 'Votre demande a été refusée.' },
    }[data.status];

    const html = this.layout(`
      <h2>${cfg.emoji} ${cfg.title}</h2>
      <p>Bonjour <strong>${data.name}</strong>, ${cfg.msg}</p>
      <div class="amount">${data.amount} ${data.currency}</div>
      ${data.adminNote ? `<div class="card"><p><strong>Note :</strong> ${data.adminNote}</p></div>` : ''}
      <a href="${this.config.get('APP_URL')}/dashboard/withdrawals" class="btn">Voir mes retraits</a>
    `);
    return this.send(to, `${cfg.emoji} ${cfg.title} — ${data.amount} ${data.currency}`, html, `withdrawal_${data.status}`);
  }

  async sendPasswordReset(to: string, firstName: string, resetToken: string) {
    const url = `${this.config.get('APP_URL')}/reset-password?token=${resetToken}`;
    const html = this.layout(`
      <h2>Réinitialisation de mot de passe</h2>
      <p>Bonjour <strong>${firstName}</strong>, cliquez ci-dessous pour réinitialiser votre mot de passe :</p>
      <a href="${url}" class="btn">Réinitialiser mon mot de passe</a>
      <p style="font-size:12px;color:#9CA3AF">Ce lien expire dans 1 heure.</p>
    `);
    return this.send(to, 'Réinitialisation de votre mot de passe', html, 'password_reset');
  }

  // ─── Event Listeners ─────────────────────────────────────────────────────

  @OnEvent('user.registered')
  async onUserRegistered({ user }: any) {
    try {
      const store = await this.prisma.store.findUnique({ where: { userId: user.id } });
      if (store) await this.sendWelcome(user.email, user.firstName, store.slug);
    } catch (err: any) {
      this.logger.error(`Welcome email failed: ${err.message}`);
    }
  }

  // BUG-010 FIX: Reload full order from DB (event only carries orderId)
  @OnEvent('order.completed')
  async onOrderCompleted({ orderId }: { orderId: string }) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          store: { include: { user: { select: { email: true, firstName: true } } } },
        },
      });
      if (!order) return;

      const downloads = await this.prisma.downloadLog.findMany({
        where: { orderId, isUsed: false },
        take: 1,
      });

      await this.sendPurchaseConfirmation(order.customerEmail, {
        customerName: order.customerName,
        productTitle: order.items[0]?.title || 'Produit',
        amount: Number(order.total).toLocaleString('fr-FR'),
        currency: order.currency,
        downloadToken: downloads[0]?.token,
      });

      if (order.store?.user) {
        await this.sendNewSaleAlert(order.store.user.email, {
          sellerName: order.store.user.firstName,
          productTitle: order.items[0]?.title || 'Produit',
          amount: Number(order.total).toLocaleString('fr-FR'),
          currency: order.currency,
          buyerEmail: order.customerEmail,
        });
      }
    } catch (err: any) {
      this.logger.error(`Order email failed for ${orderId}: ${err.message}`);
    }
  }

  @OnEvent('user.passwordReset')
  async onPasswordReset({ user, resetToken }: any) {
    try {
      await this.sendPasswordReset(user.email, user.firstName, resetToken);
    } catch (err: any) {
      this.logger.error(`Password reset email failed: ${err.message}`);
    }
  }
}
