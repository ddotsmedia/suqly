import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  Response,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { JwtGuard } from '../auth/jwt.guard';
import { WishlistService } from './wishlist.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

@Controller('listings')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Post(':id/wishlist')
  @UseGuards(JwtGuard)
  async addToWishlist(
    @Request() req,
    @Param('id', ParseIntPipe) listingId: number,
  ): Promise<{ success: boolean }> {
    await this.wishlistService.addToWishlist(req.user.id, listingId);
    return { success: true };
  }

  @Delete(':id/wishlist')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async removeFromWishlist(
    @Request() req,
    @Param('id', ParseIntPipe) listingId: number,
  ): Promise<{ success: boolean }> {
    await this.wishlistService.removeFromWishlist(req.user.id, listingId);
    return { success: true };
  }
}

@Controller('wishlist')
export class WishlistListController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @UseGuards(JwtGuard)
  async getWishlist(
    @Request() req,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('offset', new ParseIntPipe({ optional: true })) offset: number = 0,
  ): Promise<any> {
    return this.wishlistService.getWishlistItems(req.user.id, limit, offset);
  }

  @Post('share/create')
  @UseGuards(JwtGuard)
  async createShareLink(@Request() req): Promise<{
    shareToken: string;
    shareUrl: string;
  }> {
    const share = await this.wishlistService.createShareLink(req.user.id);
    return {
      shareToken: share.shareToken,
      shareUrl: `${API_URL}/wishlist/${share.shareToken}`,
    };
  }

  @Get('share/:token')
  async getPublicWishlist(
    @Param('token') token: string,
  ): Promise<{ user: any; items: any[] }> {
    return this.wishlistService.getPublicWishlist(token);
  }

  @Delete('share/:token')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async deleteShareLink(@Request() req): Promise<{ success: boolean }> {
    await this.wishlistService.deleteShareLink(req.user.id);
    return { success: true };
  }

  @Get('export')
  @UseGuards(JwtGuard)
  async exportCSV(
    @Request() req,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    const csv = await this.wishlistService.exportToCSV(req.user.id);
    const date = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="wishlist-${date}.csv"`,
    );
    res.send(csv);
  }
}

@Controller('wishlist')
export class WishlistCheckController {
  constructor(private wishlistService: WishlistService) {}

  @Get('check/:listingId')
  @UseGuards(JwtGuard)
  async checkIsInWishlist(
    @Request() req,
    @Param('listingId', ParseIntPipe) listingId: number,
  ): Promise<{ isInWishlist: boolean }> {
    const isInWishlist = await this.wishlistService.isInWishlist(
      req.user.id,
      listingId,
    );
    return { isInWishlist };
  }
}
