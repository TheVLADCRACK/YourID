import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('generate-description')
  generateDescription(@Req() req: any, @Body() dto: any) { return this.aiService.generateProductDescription(req.user.id, dto); }

  @Post('generate-sales-page')
  generateSalesPage(@Req() req: any, @Body() dto: any) { return this.aiService.generateSalesPage(req.user.id, dto); }

  @Get('history')
  getHistory(@Req() req: any) { return this.aiService.getHistory(req.user.id); }
}
