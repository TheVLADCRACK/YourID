import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get reviews for a product (public)' })
  findByProduct(@Param('productId') productId: string, @Query() query: any) {
    return this.reviewsService.findByProduct(productId, query);
  }

  @Post('product/:productId')
  @ApiOperation({ summary: 'Add a review (verified buyers only)' })
  create(@Param('productId') productId: string, @Body() dto: any) {
    return this.reviewsService.create(productId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review (store owner)' })
  delete(@Req() req: any, @Param('id') id: string) {
    return this.reviewsService.delete(id, req.user.store.id);
  }
}
