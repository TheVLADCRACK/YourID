import { Controller, Post, Body, Param, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private config: ConfigService,
  ) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate payment for an order' })
  initiate(@Body() body: { orderId: string; method: string }) {
    return this.paymentsService.initiatePayment(body.orderId, body.method);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm payment with provider reference' })
  confirm(@Body() body: { orderId: string; paymentRef: string }) {
    return this.paymentsService.confirmPayment(body.orderId, body.paymentRef);
  }

  // BUG-002 FIX: Only available in non-production environments
  @Post('simulate/:orderId')
  @ApiOperation({ summary: 'Simulate payment (DEV/STAGING only)' })
  simulate(@Param('orderId') orderId: string) {
    if (this.config.get('NODE_ENV') === 'production') {
      throw new ForbiddenException('Simulation non disponible en production');
    }
    return this.paymentsService.simulateWebhook(orderId);
  }
}
