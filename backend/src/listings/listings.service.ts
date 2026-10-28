import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from './listing.entity';
import { ListingImage } from './listing-image.entity';
import { UsersService } from '../users/users.service';
import { ImageCompressionService } from './image-compression.service';
import { ModerationService } from '../moderation/moderation.service';
import * as crypto from 'crypto';
import { isValidSubcategory } from './subcategories';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    @InjectRepository(ListingImage)
    private imagesRepository: Repository<ListingImage>,
    private usersService: UsersService,
    private imageCompressionService: ImageCompressionService,
    private moderationService: ModerationService,
  ) {}

  async create(
    userId: number,
    createData: any,
  ): Promise<Listing> {
    const user = await this.usersService.findById(userId);

    if (createData.subcategory && !isValidSubcategory(createData.category, createData.subcategory)) {
      throw new BadRequestException(`Invalid subcategory for category ${createData.category}`);
    }

    // Generate slug
    const listingData = this.listingsRepository.create({
      ...createData,
      userId,
      status: 'draft',
      slug: this.generateSlug(createData.title),
    }) as unknown as Listing;

    const saved = await this.listingsRepository.save(listingData);
    const savedListing = saved as unknown as Listing;

    await this.moderationService.autoFlagListing(savedListing);

    return this.findById(savedListing.id);
  }

  async findByUser(userId: number): Promise<Listing[]> {
    return this.listingsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
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

    if (filters.subcategory) {
      query = query.andWhere('listing.subcategory = :subcategory', {
        subcategory: filters.subcategory,
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

    // Only seller-editable fields. Ownership, status, slug and dates are never taken from the request.
    const editable = ['title', 'description', 'category', 'subcategory', 'emirate', 'community', 'publicLocation', 'price', 'currency'];
    const changes: Record<string, any> = {};
    for (const key of editable) {
      if (updateData[key] !== undefined) changes[key] = updateData[key];
    }

    // Regenerate slug if title changed
    if (changes.title && changes.title !== listing.title) {
      changes.slug = this.generateSlug(changes.title);
    }

    if (Object.keys(changes).length === 0) {
      return listing;
    }

    // A subcategory must belong to the listing's category. If the category changes
    // without a new subcategory, drop the old one rather than keep a mismatched value.
    const effectiveCategory = changes.category ?? listing.category;
    if (changes.category !== undefined && changes.subcategory === undefined && listing.subcategory) {
      if (!isValidSubcategory(effectiveCategory, listing.subcategory)) changes.subcategory = null;
    }
    const effectiveSub = changes.subcategory !== undefined ? changes.subcategory : listing.subcategory;
    if (effectiveSub && !isValidSubcategory(effectiveCategory, effectiveSub)) {
      throw new BadRequestException(`Invalid subcategory for category ${effectiveCategory}`);
    }

    await this.listingsRepository.update(id, changes);
    const updated = await this.findById(id);
    await this.moderationService.autoFlagListing(updated);
    return updated;
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

    const saved = await this.listingsRepository.save(listing);

    // Auto-check for moderation issues
    await this.moderationService.autoFlagListing(saved);

    return saved;
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

  async addImageWithCompression(
    listingId: number,
    imageBase64: string,
  ): Promise<ListingImage> {
    const listing = await this.findById(listingId);

    const buffer = Buffer.from(imageBase64, 'base64');
    const { thumbnail, full } = await this.imageCompressionService.compressImage(buffer);

    const thumbB64 = thumbnail.toString('base64');
    const fullB64 = full.toString('base64');

    const image = this.imagesRepository.create({
      listingId,
      fullUrl: `data:image/jpeg;base64,${fullB64}`,
      thumbnailUrl: `data:image/jpeg;base64,${thumbB64}`,
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
