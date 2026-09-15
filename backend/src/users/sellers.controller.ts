import { Controller, Get, Put, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/jwt.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from '../listings/listing.entity';

@ApiTags('Sellers')
@Controller('sellers')
export class SellersController {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
  ) {}

  @Get(':sellerId')
  @ApiOperation({ summary: 'Get seller profile' })
  async getSellerProfile(@Param('sellerId') sellerId: string) {
    const user = await this.usersService.findById(parseInt(sellerId));
    const listings = await this.listingsRepository.find({
      where: { userId: parseInt(sellerId), status: 'active' },
    });

    return {
      success: true,
      data: {
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        sellerBio: user.sellerBio,
        sellerScore: user.sellerScore,
        responseRate: user.responseRate,
        avgResponseTime: user.avgResponseTimeMinutes,
        premiumTier: user.premiumTier,
        profileVerified: user.profileVerified,
        listingsCount: listings.length,
        joinedAt: user.createdAt,
      },
      timestamp: new Date(),
    };
  }

  @Put('profile')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update seller profile' })
  async updateProfile(
    @Body() body: { displayName?: string; sellerBio?: string; avatarUrl?: string },
    @Request() req: any,
  ) {
    const updated = await this.usersService.updateUser(req.user.id, body);
    return {
      success: true,
      data: {
        id: updated.id,
        displayName: updated.displayName,
        sellerBio: updated.sellerBio,
        avatarUrl: updated.avatarUrl,
      },
      timestamp: new Date(),
    };
  }

  @Get(':sellerId/listings')
  @ApiOperation({ summary: 'Get seller listings' })
  async getSellerListings(
    @Param('sellerId') sellerId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '12',
  ) {
    const [listings, total] = await this.listingsRepository.findAndCount({
      where: { userId: parseInt(sellerId), status: 'active' },
      relations: ['images'],
      order: { publishedAt: 'DESC' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    return {
      success: true,
      data: listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      timestamp: new Date(),
    };
  }
}
