import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeaturedListing, FeaturedPriceTier } from './featured-listing.entity';
import { Listing } from './listing.entity';

@Injectable()
export class FeaturedListingsService {
  constructor(
    @InjectRepository(FeaturedListing)
    private featuredRepository: Repository<FeaturedListing>,
    @InjectRepository(Listing)
    private listingRepository: Repository<Listing>,
  ) {}

  async featureListingFree(listingId: number, userId: number): Promise<FeaturedListing> {
    const listing = await this.listingRepository.findOne({
      where: { id: listingId, userId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const existing = await this.featuredRepository.findOne({
      where: { listingId, isActive: true },
    });

    if (existing) {
      throw new ConflictException('Listing is already featured');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const featured = this.featuredRepository.create({
      listingId,
      featuredAt: now,
      expiresAt,
      priceTier: 'free',
      isActive: true,
    });

    return this.featuredRepository.save(featured);
  }

  async featureListingPremium(
    listingId: number,
    userId: number,
    paymentId: string,
  ): Promise<FeaturedListing> {
    const listing = await this.listingRepository.findOne({
      where: { id: listingId, userId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const existing = await this.featuredRepository.findOne({
      where: { listingId, isActive: true },
    });

    if (existing) {
      throw new ConflictException('Listing is already featured');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const featured = this.featuredRepository.create({
      listingId,
      featuredAt: now,
      expiresAt,
      priceTier: 'premium',
      pricePaid: 50,
      priceCurrency: 'AED',
      lastPaymentDate: now,
      paymentId,
      isActive: true,
    });

    return this.featuredRepository.save(featured);
  }

  async unfeatureListing(listingId: number, userId: number): Promise<boolean> {
    const featured = await this.featuredRepository.findOne({
      where: { listingId },
      relations: ['listing'],
    });

    if (!featured || featured.listing.userId !== userId) {
      throw new NotFoundException('Featured listing not found');
    }

    featured.isActive = false;
    await this.featuredRepository.save(featured);
    return true;
  }

  async getFeaturedListings(limit: number = 10): Promise<FeaturedListing[]> {
    const now = new Date();
    return this.featuredRepository.find({
      where: {
        isActive: true,
      },
      relations: ['listing'],
      order: { featuredAt: 'DESC' },
      take: limit,
    }).then((listings) =>
      listings.filter((f) => f.expiresAt > now),
    );
  }

  async checkAndExpireListings(): Promise<void> {
    const now = new Date();
    const expiredListings = await this.featuredRepository.find({
      where: { isActive: true },
    });

    const toDeactivate = expiredListings.filter((f) => f.expiresAt < now);
    for (const featured of toDeactivate) {
      featured.isActive = false;
      await this.featuredRepository.save(featured);
    }
  }

  async renewFeaturedPremium(
    listingId: number,
    userId: number,
    paymentId: string,
  ): Promise<FeaturedListing> {
    const featured = await this.featuredRepository.findOne({
      where: { listingId },
      relations: ['listing'],
    });

    if (!featured || featured.listing.userId !== userId) {
      throw new NotFoundException('Featured listing not found');
    }

    const now = new Date();
    featured.expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    featured.lastPaymentDate = now;
    featured.paymentId = paymentId;
    featured.isActive = true;

    return this.featuredRepository.save(featured);
  }

  async getListingFeaturedStatus(listingId: number): Promise<{
    isFeatured: boolean;
    tier: FeaturedPriceTier | null;
    daysRemaining: number | null;
    pricePerDay: number | null;
  }> {
    const featured = await this.featuredRepository.findOne({
      where: { listingId, isActive: true },
    });

    if (!featured) {
      return { isFeatured: false, tier: null, daysRemaining: null, pricePerDay: null };
    }

    const now = new Date();
    if (featured.expiresAt < now) {
      featured.isActive = false;
      await this.featuredRepository.save(featured);
      return { isFeatured: false, tier: null, daysRemaining: null, pricePerDay: null };
    }

    const daysRemaining = Math.ceil(
      (featured.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    const pricePerDay = featured.priceTier === 'premium' ? 50 / 7 : 0;

    return {
      isFeatured: true,
      tier: featured.priceTier,
      daysRemaining,
      pricePerDay,
    };
  }

  async getAdminFeaturedListings(
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ items: FeaturedListing[]; total: number }> {
    const [items, total] = await this.featuredRepository.findAndCount({
      relations: ['listing'],
      order: { featuredAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { items, total };
  }
}
