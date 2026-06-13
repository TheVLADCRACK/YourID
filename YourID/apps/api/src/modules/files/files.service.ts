import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class FilesService {
  private s3: S3Client;
  private bucket: string;

  constructor(private config: ConfigService, private prisma: PrismaService) {
    this.bucket = this.config.get('CLOUDFLARE_R2_BUCKET', 'yourid-files');
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${this.config.get('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.config.get('CLOUDFLARE_R2_ACCESS_KEY', ''),
        secretAccessKey: this.config.get('CLOUDFLARE_R2_SECRET_KEY', ''),
      },
    });
  }

  async uploadProductFile(productId: string, file: Express.Multer.File, name: string) {
    const ext = path.extname(file.originalname);
    const fileKey = `products/${productId}/${uuidv4()}${ext}`;

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    }));

    const productFile = await this.prisma.productFile.create({
      data: {
        productId,
        name: name || file.originalname,
        fileName: file.originalname,
        fileKey,
        fileUrl: fileKey,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });

    return productFile;
  }

  async uploadStoreLogo(storeId: string, file: Express.Multer.File, type: 'logo' | 'banner' | 'favicon') {
    const ext = path.extname(file.originalname);
    const fileKey = `stores/${storeId}/${type}${ext}`;

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    const url = `${this.config.get('CLOUDFLARE_R2_PUBLIC_URL')}/${fileKey}`;

    await this.prisma.store.update({
      where: { id: storeId },
      data: { [type]: url },
    });

    return { url };
  }

  async getSignedDownloadUrl(token: string) {
    const log = await this.prisma.downloadLog.findUnique({
      where: { token },
      include: { productFile: true },
    });

    if (!log) throw new NotFoundException('Lien de téléchargement invalide');
    if (log.isUsed) throw new NotFoundException('Ce lien a déjà été utilisé');
    if (log.expiresAt && log.expiresAt < new Date()) throw new NotFoundException('Ce lien a expiré');

    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: log.productFile.fileKey }),
      { expiresIn: 300 }, // 5 minutes
    );

    // Mark as used
    await this.prisma.downloadLog.update({ where: { id: log.id }, data: { isUsed: true } });

    return { url, fileName: log.productFile.fileName };
  }

  async deleteProductFile(fileId: string, storeId: string) {
    const file = await this.prisma.productFile.findFirst({
      where: { id: fileId, product: { storeId } },
    });
    if (!file) throw new NotFoundException();

    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: file.fileKey }));
    await this.prisma.productFile.delete({ where: { id: fileId } });

    return { message: 'Fichier supprimé' };
  }
}
