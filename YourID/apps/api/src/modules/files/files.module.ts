import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { DownloadsController } from './downloads.controller';

@Module({
  controllers: [FilesController, DownloadsController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
