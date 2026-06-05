import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private marketplaceService: MarketplaceService) {}

  @Get() @ApiOperation({ summary: 'Browse marketplace' })
  findAll(@Query() query: any) { return this.marketplaceService.findAll(query); }

  @Get('featured') @ApiOperation({ summary: 'Get featured products' })
  getFeatured() { return this.marketplaceService.getFeatured(); }

  @Get('popular') @ApiOperation({ summary: 'Get popular products' })
  getPopular() { return this.marketplaceService.getPopular(); }

  @Get('stats') @ApiOperation({ summary: 'Get marketplace statistics' })
  getStats() { return this.marketplaceService.getStats(); }

  @Get('category/:slug')
  getByCategory(@Param('slug') slug: string) { return this.marketplaceService.getByCategory(slug); }
}
