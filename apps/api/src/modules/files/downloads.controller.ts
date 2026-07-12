import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FilesService } from '../files/files.service';
import { Response } from 'express';

@ApiTags('Downloads')
@Controller('download')
export class DownloadsController {
  constructor(private filesService: FilesService) {}

  @Get(':token')
  async download(@Param('token') token: string, @Res() res: Response) {
    const { url, fileName } = await this.filesService.getSignedDownloadUrl(token);
    res.redirect(url);
  }
}
