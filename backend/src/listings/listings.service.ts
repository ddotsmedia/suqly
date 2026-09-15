import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from './listing.entity';
import { ListingImage } from './listing-image.entity';
import { UsersService } from '../users/users.service';
import * as crypto from 'crypto';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    @InjectRepository(ListingImage)
    private imagesRepository: Repository<ListingImage>,
    private usersService: UsersService,
  ) {}

  async create(
    userId: number,
    createData: any,
  ): Promise<Listing> {
    const user = await this.usersService.findById(userId);

    // Generate slug
    const listingData = this.listingsRepository.create({
      ...createData,
      userId,
      status: 'draft',
      slug: this.generateSlug(createData.title),
    }) as unknown as Listing;

    const saved = await this.listingsRepository.save(listingData);
    const savedListing = saved as unknown as Listing;
    return this.findById(savedListing.id);
  }

  async findAll(filters: any, page = 1, limit = 20): Promise<any> {
    let query = this.listingsRepository.createQueryBuilder('listing')
      .leftJoinAndSelect('listing.user', 'user')
      .leftJoinAndSelect('listing.images', 'images')
      .where('listing.status = :status', { status: 'active' });

    if (filters.category) {
      query = query.andWhere('listing.category = :category', {
        category: filters.category,
      });
    }

    if (filters.emirate) {
      query = query.andWhere('listing.emirate = :emirate', {
        emirate: filters.emirate,
      });
    }

    if (filters.community) {
      query = query.andWhere('listing.community = :community', {
        community: filters.community,
      });
    }

    if (filters.priceMin || filters.priceMax) {
      if (filters.priceMin) {
        query = query.andWhere('listing.price >= :priceMin', {
          priceMin: filters.priceMin,
        });
      }
      if (filters.priceMax) {
        query = query.andWhere('listing.price <= :priceMax', {
          priceMax: filters.priceMax,
        });
      }
    }

    const total = await query.getCount();
    const listings = await query
      .orderBy('listing.publishedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      data: listings,
    };
  }

  async findById(id: number): Promise<Listing> {
    const listing = await this.listingsRepository.findOne({
      where: { id },
      relations: ['user', 'images'],
    });

    if (!listing) {
      throw new NotFoundException(`Listing ${id} not found`);
    }

    return listing;
  }

  async findBySlug(slug: string): Promise<Listing> {
    const listing = await this.listingsRepository.findOne({
      where: { slug },
      relations: ['user', 'images'],
    });

    if (!listing) {
      throw new NotFoundException(`Listing not found`);
    }

    return listing;
  }

  async update(
    id: number,
    userId: number,
    updateData: any,
  ): Promise<Listing> {
    const listing = await this.findById(id);

    if (listing.userId !== userId) {
      throw new ForbiddenException('Cannot edit other user\'s listing');
    }

    // Regenerate slug if title changed
    if (updateData.title && updateData.title !== listing.title) {
      updateData.slug = this.generateSlug(updateData.title);
    }

    await this.listingsRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: number, userId: number): Promise<void> {
    const listing = await this.findById(id);

    if (listing.userId !== userId) {
      throw new ForbiddenException('Cannot delete other user\'s listing');
    }

    await this.listingsRepository.delete(id);
  }

  async publish(id: number, userId: number): Promise<Listing> {
    const listing = await this.findById(id);

    if (listing.userId !== userId) {
      throw new ForbiddenException('Cannot publish other user\'s listing');
    }

    if (!listing.title || !listing.category || !listing.emirate) {
      throw new Error('Listing must have title, category, and emirate');
    }

    listing.status = 'active';
    listing.publishedAt = new Date();
    listing.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

    return this.listingsRepository.save(listing);
  }

  async addImage(
    listingId: number,
    imageUrl: string,
    thumbnailUrl: string,
  ): Promise<ListingImage> {
    const listing = await this.findById(listingId);

    const image = this.imagesRepository.create({
      listingId,
      fullUrl: imageUrl,
      thumbnailUrl,
    });

    return this.imagesRepository.save(image);
  }

  private generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const suffix = crypto.randomBytes(2).toString('hex');
    return `${baseSlug}-${suffix}`;
  }
}
