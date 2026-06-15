import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getDashboard(@Req() req: any) {
    return this.analyticsService.getDashboardStats(req.user.store.id);
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getRevenue(@Req() req: any, @Query('period') period: '7d' | '30d' | '90d' = '30d') {
    return this.analyticsService.getRevenueChart(req.user.store.id, period);
  }

  @Get('top-products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getTopProducts(@Req() req: any) {
    return this.analyticsService.getTopProducts(req.user.store.id);
  }

  @Get('recent-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getRecentOrders(@Req() req: any) {
    return this.analyticsService.getRecentOrders(req.user.store.id);
  }

  @Post('event')
  @ApiOperation({ summary: 'Track analytics event' })
  trackEvent(@Body() body: any, @Req() req: any) {
    return this.analyticsService.trackEvent({
      ...body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Get('global')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Global platform stats (admin)' })
  getGlobal() {
    return this.analyticsService.getGlobalStats();
  }
}
