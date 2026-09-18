import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from './listing.entity';
import { FeaturedListing } from './featured-listing.entity';

interface BatchEditUpdates {
  price?: number;
  category?: string;
  emirate?: string;
  community?: string;
  description?: string;
}

export interface BatchResult {
  updated_count: number;
  failed_count?: number;
  errors?: Array<{ listingId: number; error: string }>;
}

@Injectable()
export class BatchOperationsService {
  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    @InjectRepository(FeaturedListing)
    private featuredListingsRepository: Repository<FeaturedListing>,
  ) {}

  async batchEdit(
    listingIds: number[],
    updates: BatchEditUpdates,
    userId: number,
  ): Promise<BatchResult> {
    if (!listingIds || listingIds.length === 0) {
      throw new BadRequestException('No listings specified');
    }

    if (listingIds.length > 100) {
      throw new BadRequestException('Maximum 100 listings per batch');
    }

    if (!Object.keys(updates).length) {
      throw new BadRequestException('No updates specified');
    }

    const listings = await this.listingsRepository.find({
      where: { id: undefined as any },
    });

    let updated = 0;
    const errors: Array<{ listingId: number; error: string }> = [];

    for (const listingId of listingIds) {
      try {
        const listing = listings.find((l) => l.id === listingId);
        if (!listing) {
          errors.push({ listingId, error: 'Listing not found' });
          continue;
        }

        if (listing.userId !== userId) {
          errors.push({ listingId, error: 'Not authorized' });
          continue;
        }

        Object.assign(listing, updates);
        await this.listingsRepository.save(listing);
        updated++;
      } catch (error) {
        errors.push({
          listingId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      updated_count: updated,
      failed_count: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async batchFeature(
    listingIds: number[],
    tier: 'free' | 'premium',
    userId: number,
  ): Promise<BatchResult> {
    if (!listingIds || listingIds.length === 0) {
      throw new BadRequestException('No listings specified');
    }

    if (listingIds.length > 50) {
      throw new BadRequestException('Maximum 50 listings per batch for featuring');
    }

    const listings = await this.listingsRepository.find({
      where: { id: undefined as any },
    });

    let updated = 0;
    const errors: Array<{ listingId: number; error: string }> = [];

    for (const listingId of listingIds) {
      try {
        const listing = listings.find((l) => l.id === listingId);
        if (!listing) {
          errors.push({ listingId, error: 'Listing not found' });
          continue;
        }

        if (listing.userId !== userId) {
          errors.push({ listingId, error: 'Not authorized' });
          continue;
        }

        const existingFeature = await this.featuredListingsRepository.findOne({
          where: { listingId },
        });

        if (existingFeature) {
          existingFeature.priceTier = tier;
          existingFeature.expiresAt = new Date(Date.now() + (tier === 'premium' ? 7 : 3) * 24 * 60 * 60 * 1000);
          await this.featuredListingsRepository.save(existingFeature);
        } else {
          const featured = this.featuredListingsRepository.create({
            listingId,
            priceTier: tier,
            expiresAt: new Date(Date.now() + (tier === 'premium' ? 7 : 3) * 24 * 60 * 60 * 1000),
          });
          await this.featuredListingsRepository.save(featured);
        }

        updated++;
      } catch (error) {
        errors.push({
          listingId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      updated_count: updated,
      failed_count: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async batchDelete(
    listingIds: number[],
    userId: number,
  ): Promise<BatchResult> {
    if (!listingIds || listingIds.length === 0) {
      throw new BadRequestException('No listings specified');
    }

    if (listingIds.length > 100) {
      throw new BadRequestException('Maximum 100 listings per batch');
    }

    const listings = await this.listingsRepository.find({
      where: { id: undefined as any },
    });

    let deleted = 0;
    const errors: Array<{ listingId: number; error: string }> = [];

    for (const listingId of listingIds) {
      try {
        const listing = listings.find((l) => l.id === listingId);
        if (!listing) {
          errors.push({ listingId, error: 'Listing not found' });
          continue;
        }

        if (listing.userId !== userId) {
          errors.push({ listingId, error: 'Not authorized' });
          continue;
        }

        await this.listingsRepository.remove(listing);
        deleted++;
      } catch (error) {
        errors.push({
          listingId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      updated_count: deleted,
      failed_count: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async batchStatusChange(
    listingIds: number[],
    status: 'active' | 'sold' | 'inactive',
    userId: number,
  ): Promise<BatchResult> {
    if (!listingIds || listingIds.length === 0) {
      throw new BadRequestException('No listings specified');
    }

    const validStatuses = ['active', 'sold', 'inactive'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const listings = await this.listingsRepository.find({
      where: { id: undefined as any },
    });

    let updated = 0;
    const errors: Array<{ listingId: number; error: string }> = [];

    for (const listingId of listingIds) {
      try {
        const listing = listings.find((l) => l.id === listingId);
        if (!listing) {
          errors.push({ listingId, error: 'Listing not found' });
          continue;
        }

        if (listing.userId !== userId) {
          errors.push({ listingId, error: 'Not authorized' });
          continue;
        }

        listing.status = status;
        await this.listingsRepository.save(listing);
        updated++;
      } catch (error) {
        errors.push({
          listingId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      updated_count: updated,
      failed_count: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async batchRenew(listingIds: number[], userId: number): Promise<BatchResult> {
    if (!listingIds || listingIds.length === 0) {
      throw new BadRequestException('No listings specified');
    }

    if (listingIds.length > 50) {
      throw new BadRequestException('Maximum 50 listings to renew per batch');
    }

    const listings = await this.listingsRepository.find({
      where: { id: undefined as any },
    });

    let renewed = 0;
    const errors: Array<{ listingId: number; error: string }> = [];

    for (const listingId of listingIds) {
      try {
        const listing = listings.find((l) => l.id === listingId);
        if (!listing) {
          errors.push({ listingId, error: 'Listing not found' });
          continue;
        }

        if (listing.userId !== userId) {
          errors.push({ listingId, error: 'Not authorized' });
          continue;
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        listing.expiresAt = expiresAt;
        await this.listingsRepository.save(listing);
        renewed++;
      } catch (error) {
        errors.push({
          listingId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      updated_count: renewed,
      failed_count: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  validateBatchSize(count: number, maxSize: number = 100): void {
    if (count > maxSize) {
      throw new BadRequestException(
        `Maximum ${maxSize} listings per batch operation`,
      );
    }
  }
}
