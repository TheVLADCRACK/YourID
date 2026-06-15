import {
  Controller, Post, Delete, Param, UseGuards, Req,
  UseInterceptors, UploadedFile, Body, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const PRODUCT_FILE_MIME = [
  'application/pdf',
  'application/zip', 'application/x-zip-compressed', 'application/x-zip',
  'audio/mpeg', 'audio/mp3',
  'video/mp4',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'text/plain',
  'application/octet-stream', // generic binary - accepted for software
];

const IMAGE_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// BUG-005 FIX: File filter with MIME validation
const productFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (PRODUCT_FILE_MIME.includes(file.mimetype)) return cb(null, true);
  cb(new BadRequestException(`Type de fichier non autorisé: ${file.mimetype}. Types acceptés: PDF, ZIP, MP3, MP4, DOCX, PPTX, TXT`), false);
};

const imageFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (IMAGE_MIME.includes(file.mimetype)) return cb(null, true);
  cb(new BadRequestException(`Seules les images sont acceptées (JPG, PNG, WebP, GIF)`), false);
};

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('product/:productId')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
    fileFilter: productFileFilter,
  }))
  uploadProductFile(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    return this.filesService.uploadProductFile(productId, file, name);
  }

  @Post('store/:type')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: imageFileFilter,
  }))
  uploadStoreLogo(
    @Req() req: any,
    @Param('type') type: 'logo' | 'banner' | 'favicon',
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    if (!['logo', 'banner', 'favicon'].includes(type)) {
      throw new BadRequestException('Type invalide: logo, banner ou favicon');
    }
    return this.filesService.uploadStoreLogo(req.user.store.id, file, type);
  }

  @Delete(':fileId')
  deleteFile(@Req() req: any, @Param('fileId') fileId: string) {
    return this.filesService.deleteProductFile(fileId, req.user.store.id);
  }
}
