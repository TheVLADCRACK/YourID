import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { DatabaseService } from '../../database/database.service';

/**
 * FilesService — stockage local sur le serveur.
 * Remplace Cloudflare R2. Les images (cover, logo, bannière, avatar)
 * sont stockées dans /uploads/ sur le VPS Hostinger.
 * Le contenu produit (vidéos, PDFs) est fourni via liens externes.
 */
@Injectable()
export class FilesService {
  private uploadDir: string;
  private publicUrl: string;

  constructor(private config: ConfigService, private db: DatabaseService) {
    this.uploadDir = this.config.get('UPLOAD_DIR', path.join(process.cwd(), 'uploads'));
    this.publicUrl = this.config.get('API_URL', 'http://localhost:4000');
    // Créer les dossiers si absents
    ['products', 'stores', 'avatars'].forEach(sub => {
      const dir = path.join(this.uploadDir, sub);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
  }

  /** Sauvegarde une image localement et retourne son URL publique */
  private saveImage(file: Express.Multer.File, subfolder: string): string {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const name = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    const dest = path.join(this.uploadDir, subfolder, name);
    fs.writeFileSync(dest, file.buffer);
    return `${this.publicUrl}/uploads/${subfolder}/${name}`;
  }

  /** Image de couverture produit */
  async uploadProductCover(productId: string, file: Express.Multer.File, storeId: string) {
    const product = this.db.get('SELECT id, storeId FROM products WHERE id = ?', [productId]);
    if (!product || product.storeId !== storeId) throw new NotFoundException('Produit introuvable');

    // Supprimer ancienne image locale si nécessaire
    this.deleteOldLocalFile(this.db.get('SELECT coverImage FROM products WHERE id = ?', [productId])?.coverImage);

    const url = this.saveImage(file, 'products');
    this.db.run('UPDATE products SET coverImage = ?, updatedAt = ? WHERE id = ?', [url, this.db.now(), productId]);
    return { url };
  }

  /** Logo ou bannière boutique */
  async uploadStoreImage(storeId: string, file: Express.Multer.File, type: 'logo' | 'banner') {
    const store = this.db.get(`SELECT ${type} FROM stores WHERE id = ?`, [storeId]);
    if (!store) throw new NotFoundException('Boutique introuvable');

    this.deleteOldLocalFile(store[type]);

    const url = this.saveImage(file, 'stores');
    this.db.run(`UPDATE stores SET ${type} = ?, updatedAt = ? WHERE id = ?`, [url, this.db.now(), storeId]);
    return { url };
  }

  /** Avatar utilisateur */
  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = this.db.get('SELECT avatar FROM users WHERE id = ?', [userId]);
    if (!user) throw new NotFoundException();

    this.deleteOldLocalFile(user.avatar);

    const url = this.saveImage(file, 'avatars');
    this.db.run('UPDATE users SET avatar = ?, updatedAt = ? WHERE id = ?', [url, this.db.now(), userId]);
    return { url };
  }

  /** Supprime un fichier local si c'est bien un fichier local (pas une URL externe) */
  private deleteOldLocalFile(url?: string) {
    if (!url || !url.includes('/uploads/')) return;
    try {
      const rel = url.split('/uploads/')[1];
      const fullPath = path.join(this.uploadDir, rel);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    } catch {}
  }

  /**
   * Détecte le type d'un lien externe (YouTube, Vimeo, Google Drive, etc.)
   */
  detectContentType(url: string): string {
    if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
    if (/vimeo\.com/.test(url)) return 'vimeo';
    if (/drive\.google\.com/.test(url)) return 'gdrive';
    if (/dropbox\.com/.test(url)) return 'dropbox';
    if (/icloud\.com/.test(url)) return 'icloud';
    return 'url';
  }

  /**
   * Resolve a download token to a URL and file name.
   * Token may be a product id or a base64-encoded URL.
   */
  async getSignedDownloadUrl(token: string): Promise<{ url: string; fileName?: string }> {
    // base64-encoded URL (simple client-side token)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      if (decoded.startsWith('http')) return { url: decoded, fileName: undefined };
    } catch {}

    // Lookup product by id
    try {
      const row = this.db.get('SELECT contentUrl, title FROM products WHERE id = ?', [token]);
      if (row && row.contentUrl) return { url: row.contentUrl, fileName: row.title };
    } catch {}

    throw new NotFoundException('Fichier introuvable');
  }
}
