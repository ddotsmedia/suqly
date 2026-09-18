import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FeaturedListingsService } from '../listings/featured-listings.service';

@Injectable()
export class FeaturedListingsExpiryProcessor {
  private readonly logger = new Logger(FeaturedListingsExpiryProcessor.name);

  constructor(private featuredListingsService: FeaturedListingsService) {}

  @Cron('0 3 * * *')
  async processExpiredFeaturedListings(): Promise<void> {
    try {
      this.logger.log('Starting featured listings expiry job');
      await this.featuredListingsService.checkAndExpireListings();
      this.logger.log('Completed featured listings expiry job');
    } catch (error) {
      this.logger.error(`Job error: ${error.message}`);
    }
  }
}
