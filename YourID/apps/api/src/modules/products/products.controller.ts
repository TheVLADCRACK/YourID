import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // PUBLIC routes (no auth)
  @Get('categories')
  @ApiOperation({ summary: 'Get all categories (public)' })
  getCategories() { return this.productsService.getCategories(); }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug (public)' })
  findBySlug(@Param('slug') slug: string) { return this.productsService.findBySlug(slug); }

  // BUG-007 FIX: Public endpoint for checkout (no auth required)
  @Get('public/:id')
  @ApiOperation({ summary: 'Get published product by ID (public, for checkout)' })
  findPublic(@Param('id') id: string) { return this.productsService.findPublicById(id); }

  // PROTECTED routes (seller only)
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Req() req: any, @Query() query: any) {
    return this.productsService.findAll(req.user.store.id, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.productsService.findOne(id, req.user.store.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Req() req: any, @Body() dto: CreateProductDto) {
    return this.productsService.create(req.user.store.id, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, req.user.store.id, dto);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  publish(@Req() req: any, @Param('id') id: string) {
    return this.productsService.publish(id, req.user.store.id);
  }

  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  unpublish(@Req() req: any, @Param('id') id: string) {
    return this.productsService.unpublish(id, req.user.store.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() req: any, @Param('id') id: string) {
    return this.productsService.remove(id, req.user.store.id);
  }
}
