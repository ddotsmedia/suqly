import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionTier, SellerSubscription, SavedSearch } from './subscription.entity';
import { JwtGuard } from '../auth/jwt.guard';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    @InjectRepository(SubscriptionTier)
    private tiersRepository: Repository<SubscriptionTier>,
    @InjectRepository(SellerSubscription)
    private subscriptionsRepository: Repository<SellerSubscription>,
    @InjectRepository(SavedSearch)
    private savedSearchesRepository: Repository<SavedSearch>,
  ) {}

  @Get('tiers')
  @ApiOperation({ summary: 'Get all subscription tiers' })
  async getTiers() {
    const tiers = await this.tiersRepository.find();
    return {
      success: true,
      data: tiers,
      timestamp: new Date(),
    };
  }

  @Get('current')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current subscription' })
  async getCurrentSubscription(@Request() req: any) {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { sellerId: req.user.id },
      relations: ['tier'],
    });

    return {
      success: true,
      data: subscription || { tier: { tierName: 'free' } },
      timestamp: new Date(),
    };
  }

  @Post('upgrade')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upgrade subscription tier' })
  async upgradeTier(@Body() body: { tier_name: string }, @Request() req: any) {
    const tier = await this.tiersRepository.findOne({
      where: { tierName: body.tier_name },
    });

    if (!tier) {
      return { success: false, error: 'Tier not found', timestamp: new Date() };
    }

    let subscription = await this.subscriptionsRepository.findOne({
      where: { sellerId: req.user.id },
    });

    if (!subscription) {
      subscription = this.subscriptionsRepository.create({
        sellerId: req.user.id,
        tierId: tier.id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    } else {
      subscription.tierId = tier.id;
    }

    await this.subscriptionsRepository.save(subscription);

    return {
      success: true,
      data: subscription,
      timestamp: new Date(),
    };
  }

  @Post('cancel')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription' })
  async cancelSubscription(@Request() req: any) {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { sellerId: req.user.id },
    });

    if (subscription) {
      subscription.cancelAtPeriodEnd = true;
      await this.subscriptionsRepository.save(subscription);
    }

    return {
      success: true,
      timestamp: new Date(),
    };
  }

  @Post('search/save')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save a search' })
  async saveSearch(@Body() body: { query: string; filters?: any }, @Request() req: any) {
    const search = this.savedSearchesRepository.create({
      userId: req.user.id,
      query: body.query,
      filters: body.filters || {},
    });

    await this.savedSearchesRepository.save(search);

    return {
      success: true,
      data: search,
      timestamp: new Date(),
    };
  }

  @Get('search/saved')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get saved searches' })
  async getSavedSearches(@Request() req: any) {
    const searches = await this.savedSearchesRepository.find({
      where: { userId: req.user.id },
      order: { lastUsedAt: 'DESC' },
    });

    return {
      success: true,
      data: searches,
      timestamp: new Date(),
    };
  }
}
