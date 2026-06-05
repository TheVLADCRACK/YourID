import { Controller, Get, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get('@:username') getByUsername(@Param('username') username: string) { return this.storesService.findByUsername(username); }
  @Get('slug/:slug') getBySlug(@Param('slug') slug: string) { return this.storesService.findBySlug(slug); }

  @Get('me/customers')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  getCustomers(@Req() req: any, @Query() query: any) { return this.storesService.getCustomers(req.user.store.id, query); }

  @Put('me')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  update(@Req() req: any, @Body() dto: any) { return this.storesService.update(req.user.store.id, dto); }
}
