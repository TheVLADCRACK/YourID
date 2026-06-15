import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private config: ConfigService,
  ) {}

  // PUBLIC — Create order (checkout flow, no auth needed)
  @Post()
  @ApiOperation({ summary: 'Create a new order (checkout)' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // SEMI-PUBLIC — Only callable via internal payment webhook or dev mode
  // BUG-001 FIX: Protected + environment check
  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete order after payment confirmation' })
  async complete(
    @Param('id') id: string,
    @Body() body: { paymentRef?: string; webhookSecret?: string },
  ) {
    const expectedSecret = this.config.get('WEBHOOK_SECRET');
    // In production, verify webhook secret from payment provider
    if (this.config.get('NODE_ENV') === 'production') {
      if (!body.webhookSecret || body.webhookSecret !== expectedSecret) {
        throw new ForbiddenException('Webhook secret invalide');
      }
    }
    return this.ordersService.complete(id, body.paymentRef);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Req() req: any, @Query() query: any) {
    return this.ordersService.findAll(req.user.store.id, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.ordersService.findOne(id, req.user.store.id);
  }

  @Get(':id/downloads')
  @ApiOperation({ summary: 'Get download links for a completed order' })
  getDownloads(@Param('id') id: string) {
    return this.ordersService.getDownloadLinks(id);
  }
}
