import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Withdrawals')
@Controller('withdrawals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WithdrawalsController {
  constructor(private withdrawalsService: WithdrawalsService) {}

  // Seller routes
  @Post()
  @ApiOperation({ summary: 'Request a withdrawal (seller)' })
  create(@Req() req: any, @Body() dto: any) {
    return this.withdrawalsService.create(req.user.store.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get own withdrawals (seller)' })
  findAll(@Req() req: any, @Query() query: any) {
    return this.withdrawalsService.findAll(req.user.store.id, query);
  }

  // BUG-003 FIX: Admin-only routes protected by RolesGuard
  @Get('admin/all')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all withdrawals (admin only)' })
  findAllAdmin(@Query() query: any) {
    return this.withdrawalsService.findAllAdmin(query);
  }

  @Patch(':id/approve')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Approve withdrawal (admin only)' })
  approve(@Param('id') id: string) {
    return this.withdrawalsService.approve(id);
  }

  @Patch(':id/paid')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Mark withdrawal as paid (admin only)' })
  markPaid(@Param('id') id: string) {
    return this.withdrawalsService.markPaid(id);
  }

  @Patch(':id/reject')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Reject withdrawal (admin only)' })
  reject(@Param('id') id: string, @Body('adminNote') note: string) {
    return this.withdrawalsService.reject(id, note);
  }
}
