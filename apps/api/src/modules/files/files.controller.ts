import { Controller, Post, Param, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const IMAGE_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const imageOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_: any, file: Express.Multer.File, cb: any) => {
    IMAGE_MIME.includes(file.mimetype)
      ? cb(null, true)
      : cb(new BadRequestException('Image uniquement (JPG, PNG, WebP)'), false);
  },
};

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private filesService: FilesService) {}

  /** Cover image produit */
  @Post('product/:productId/cover')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', imageOptions))
  uploadCover(@Param('productId') productId: string, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new BadRequestException('Fichier requis');
    return this.filesService.uploadProductCover(productId, file, req.user.store.id);
  }

  /** Logo ou bannière boutique */
  @Post('store/:type')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', imageOptions))
  uploadStoreImage(@Param('type') type: 'logo' | 'banner', @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new BadRequestException('Fichier requis');
    if (!['logo', 'banner'].includes(type)) throw new BadRequestException('Type invalide');
    return this.filesService.uploadStoreImage(req.user.store.id, file, type);
  }

  /** Avatar utilisateur */
  @Post('avatar')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', imageOptions))
  uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new BadRequestException('Fichier requis');
    return this.filesService.uploadAvatar(req.user.id, file);
  }
}
