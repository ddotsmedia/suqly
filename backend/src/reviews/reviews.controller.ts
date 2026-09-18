import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  async create(@Request() req, @Body() dto: { listingId: number; rating: number; comment: string }) {
    const reviewerId = req.user?.id || 1;
    const review = await this.reviewsService.create(reviewerId, dto.listingId, dto.rating, dto.comment);
    return { success: true, data: review };
  }

  @Get('listings/:listingId')
  async getByListing(@Param('listingId') listingId: number, @Query('page') page = 1) {
    const result = await this.reviewsService.findByListingId(listingId, page, 5);
    return { success: true, data: result.reviews, total: result.total };
  }

  @Get('sellers/:sellerId')
  async getBySeller(@Param('sellerId') sellerId: number, @Query('page') page = 1) {
    const result = await this.reviewsService.findBySellerId(sellerId, page, 10);
    return { success: true, data: result.reviews, total: result.total, avgRating: result.avgRating };
  }

  @Get('sellers/:sellerId/stats')
  async getSellerStats(@Param('sellerId') sellerId: number) {
    const stats = await this.reviewsService.getSellerStats(sellerId);
    return { success: true, data: stats };
  }
}
