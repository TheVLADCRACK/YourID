import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Resend } from 'resend';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private from: string;

  constructor(private config: ConfigService, private db: DatabaseService) {
    this.resend = new Resend(this.config.get('RESEND_API_KEY'));
    this.from = this.config.get('EMAIL_FROM', 'Your ID <noreply@yourid.com>');
  }

  private async send(to: string, subject: string, html: string, template: string) {
    try {
      const { data, error } = await this.resend.emails.send({ from: this.from, to, subject, html });
      this.db.run(
        `INSERT INTO email_logs (id,"to",subject,template,status,error,createdAt) VALUES (?,?,?,?,?,?,?)`,
        [this.db.id(), to, subject, template, error ? 'failed' : 'sent', error?.message ?? null, this.db.now()]
      );
      if (error) this.logger.error(`Email failed to ${to}: ${error.message}`);
    } catch (err: any) {
      this.logger.error(`Email error: ${err.message}`);
    }
  }

  private layout(content: string) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:Arial,sans-serif;background:#F8FAFC;margin:0;padding:0}
      .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden}
      .header{background:#00A86B;padding:28px 32px;text-align:center}
      .header h1{color:#fff;font-size:22px;font-weight:900;margin:0}
      .body{padding:32px}
      .btn{display:inline-block;background:#00A86B;color:#fff;font-weight:700;padding:13px 26px;border-radius:50px;text-decoration:none;margin:16px 0}
      .card{background:#F8FAFC;border-radius:12px;padding:18px;margin:14px 0}
      .amount{font-size:30px;font-weight:900;color:#00A86B;text-align:center;margin:14px 0}
      .footer{background:#F8FAFC;border-top:1px solid #E5E7EB;padding:18px;text-align:center;font-size:12px;color:#9CA3AF}
    </style></head><body>
    <div class="wrap"><div class="header"><h1>Your ID</h1></div>
    <div class="body">${content}</div>
    <div class="footer">© 2025 Your ID · La plateforme qui transforme vos connaissances en revenus</div>
    </div></body></html>`;
  }

  async sendWelcome(to: string, firstName: string, storeSlug: string) {
    const html = this.layout(`
      <h2>Bienvenue sur Your ID, ${firstName} !</h2>
      <p>Votre boutique <strong>${storeSlug}</strong> est prête. Commencez à vendre dès maintenant.</p>
      <div class="card">
        <p><strong>Prochaines étapes :</strong></p>
        <p>1. Créez votre premier produit</p>
        <p>2. Personnalisez votre boutique</p>
        <p>3. Partagez votre lien de boutique</p>
      </div>
      <a href="${this.config.get('APP_URL')}/dashboard" class="btn">Accéder à mon tableau de bord</a>
    `);
    return this.send(to, 'Bienvenue sur Your ID !', html, 'welcome');
  }

  /** Envoi du contenu après achat — lien YouTube/Drive/Dropbox/etc. */
  async sendPurchaseConfirmation(to: string, data: {
    customerName: string;
    productTitle: string;
    amount: string;
    currency: string;
    contentUrl?: string;
    contentNote?: string;
    contentType?: string;
  }) {
    const platformLabel: Record<string, string> = {
      youtube: 'Vidéo YouTube',
      vimeo: 'Vidéo Vimeo',
      gdrive: 'Google Drive',
      dropbox: 'Dropbox',
      icloud: 'iCloud Drive',
      url: 'Lien de téléchargement',
    };

    const contentSection = data.contentUrl
      ? `<div class="card">
          <p style="font-weight:700;margin-bottom:8px;">
            Accéder à votre ${platformLabel[data.contentType || 'url'] || 'contenu'} :
          </p>
          <a href="${data.contentUrl}" class="btn" style="font-size:14px;padding:10px 20px;">
            Accéder au contenu
          </a>
          ${data.contentNote ? `<p style="font-size:13px;color:#6B7280;margin-top:10px;">${data.contentNote}</p>` : ''}
        </div>`
      : '<p style="color:#6B7280;">Le vendeur vous contactera avec les instructions d\'accès.</p>';

    const html = this.layout(`
      <h2>Achat confirmé !</h2>
      <p>Bonjour <strong>${data.customerName}</strong>, merci pour votre achat.</p>
      <div class="card">
        <p><strong>Produit :</strong> ${data.productTitle}</p>
        <p><strong>Montant payé :</strong> ${data.amount} ${data.currency}</p>
      </div>
      ${contentSection}
      <p style="font-size:12px;color:#9CA3AF;margin-top:16px;">
        Conservez cet email — il contient votre lien d'accès.
      </p>
    `);
    return this.send(to, `Achat confirmé : ${data.productTitle}`, html, 'purchase');
  }

  async sendNewSaleAlert(to: string, data: { sellerName: string; productTitle: string; amount: string; currency: string; buyerEmail: string }) {
    const html = this.layout(`
      <h2>Nouvelle vente !</h2>
      <p>Félicitations <strong>${data.sellerName}</strong> !</p>
      <div class="amount">${data.amount} ${data.currency}</div>
      <div class="card">
        <p><strong>Produit :</strong> ${data.productTitle}</p>
        <p><strong>Acheteur :</strong> ${data.buyerEmail}</p>
      </div>
      <a href="${this.config.get('APP_URL')}/dashboard/orders" class="btn">Voir mes commandes</a>
    `);
    return this.send(to, `Nouvelle vente — ${data.productTitle}`, html, 'new_sale');
  }

  async sendWithdrawalStatus(to: string, data: { name: string; amount: string; currency: string; status: 'approved'|'paid'|'rejected'; adminNote?: string }) {
    const cfg = {
      approved: { title: 'Retrait approuvé',  msg: 'Votre demande sera traitée prochainement.' },
      paid:     { title: 'Retrait effectué',   msg: 'Vos fonds sont en cours de transfert.' },
      rejected: { title: 'Retrait refusé',     msg: 'Votre demande a été refusée.' },
    }[data.status];
    const html = this.layout(`
      <h2>${cfg.title}</h2>
      <p>Bonjour <strong>${data.name}</strong>, ${cfg.msg}</p>
      <div class="amount">${data.amount} ${data.currency}</div>
      ${data.adminNote ? `<div class="card"><p><strong>Note :</strong> ${data.adminNote}</p></div>` : ''}
      <a href="${this.config.get('APP_URL')}/dashboard/withdrawals" class="btn">Voir mes retraits</a>
    `);
    return this.send(to, `${cfg.title} — ${data.amount} ${data.currency}`, html, `withdrawal_${data.status}`);
  }

  async sendPasswordReset(to: string, firstName: string, resetToken: string) {
    const url = `${this.config.get('APP_URL')}/reset-password?token=${resetToken}`;
    const html = this.layout(`
      <h2>Réinitialisation du mot de passe</h2>
      <p>Bonjour <strong>${firstName}</strong>, cliquez sur le lien ci-dessous :</p>
      <a href="${url}" class="btn">Réinitialiser mon mot de passe</a>
      <p style="font-size:12px;color:#9CA3AF;">Ce lien expire dans 1 heure.</p>
    `);
    return this.send(to, 'Réinitialisation de votre mot de passe', html, 'password_reset');
  }

  // ─── Event listeners ────────────────────────────────────────────────────────

  @OnEvent('user.registered')
  async onRegistered({ user }: any) {
    try {
      const store = this.db.get('SELECT slug FROM stores WHERE userId = ?', [user.id]);
      if (store) await this.sendWelcome(user.email, user.firstName, store.slug);
    } catch (e: any) { this.logger.error(`Welcome email: ${e.message}`); }
  }

  @OnEvent('order.completed')
  async onOrderCompleted({ orderId }: { orderId: string }) {
    try {
      const order = this.db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
      if (!order) return;
      const item = this.db.get('SELECT * FROM order_items WHERE orderId = ? LIMIT 1', [orderId]);
      const product = item ? this.db.get('SELECT contentUrl, contentType, contentNote FROM products WHERE id = ?', [item.productId]) : null;
      const store = this.db.get('SELECT * FROM stores WHERE id = ?', [order.storeId]);
      const seller = store ? this.db.get('SELECT email, firstName FROM users WHERE id = ?', [store.userId]) : null;

      await this.sendPurchaseConfirmation(order.customerEmail, {
        customerName: order.customerName,
        productTitle: item?.title || 'Produit',
        amount: Number(order.total).toLocaleString('fr-FR'),
        currency: order.currency,
        contentUrl: product?.contentUrl,
        contentType: product?.contentType,
        contentNote: product?.contentNote,
      });

      if (seller) {
        await this.sendNewSaleAlert(seller.email, {
          sellerName: seller.firstName,
          productTitle: item?.title || 'Produit',
          amount: Number(order.total).toLocaleString('fr-FR'),
          currency: order.currency,
          buyerEmail: order.customerEmail,
        });
      }
    } catch (e: any) { this.logger.error(`Order email ${orderId}: ${e.message}`); }
  }

  @OnEvent('user.passwordReset')
  async onPasswordReset({ user, resetToken }: any) {
    try { await this.sendPasswordReset(user.email, user.firstName, resetToken); }
    catch (e: any) { this.logger.error(`Reset email: ${e.message}`); }
  }
}
