import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { FeaturedListingsService } from './featured-listings.service';
import { FeaturedListing } from './featured-listing.entity';

@Controller('listings/featured')
export class FeaturedListingsController {
  constructor(private featuredService: FeaturedListingsService) {}

  @Get()
  async getFeaturedListings(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<FeaturedListing[]> {
    return this.featuredService.getFeaturedListings(limit);
  }
}

@Controller('listings')
export class FeaturedListingsAdminController {
  constructor(private featuredService: FeaturedListingsService) {}

  @Post(':id/feature/free')
  @UseGuards(JwtGuard)
  async featureListingFree(
    @Request() req,
    @Param('id', ParseIntPipe) listingId: number,
  ): Promise<FeaturedListing> {
    return this.featuredService.featureListingFree(listingId, req.user.id);
  }

  @Post(':id/feature/premium')
  @UseGuards(JwtGuard)
  async featureListingPremium(
    @Request() req,
    @Param('id', ParseIntPipe) listingId: number,
    @Body() body: { paymentId: string },
  ): Promise<FeaturedListing> {
    return this.featuredService.featureListingPremium(
      listingId,
      req.user.id,
      body.paymentId,
    );
  }

  @Delete(':id/featured')
  @UseGuards(JwtGuard)
  async unfeatureListing(
    @Request() req,
    @Param('id', ParseIntPipe) listingId: number,
  ): Promise<{ success: boolean }> {
    await this.featuredService.unfeatureListing(listingId, req.user.id);
    return { success: true };
  }

  @Get(':id/featured/status')
  async getFeaturedStatus(
    @Param('id', ParseIntPipe) listingId: number,
  ): Promise<any> {
    return this.featuredService.getListingFeaturedStatus(listingId);
  }
}

@Controller('admin/featured-listings')
export class FeaturedListingsManagementController {
  constructor(private featuredService: FeaturedListingsService) {}

  @Get()
  @UseGuards(JwtGuard)
  async getAdminFeaturedListings(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('offset', new ParseIntPipe({ optional: true })) offset: number = 0,
  ): Promise<any> {
    return this.featuredService.getAdminFeaturedListings(limit, offset);
  }

  @Post(':id/renew')
  @UseGuards(JwtGuard)
  async renewFeaturedPremium(
    @Request() req,
    @Param('id', ParseIntPipe) listingId: number,
    @Body() body: { paymentId: string },
  ): Promise<FeaturedListing> {
    return this.featuredService.renewFeaturedPremium(
      listingId,
      req.user.id,
      body.paymentId,
    );
  }
}
