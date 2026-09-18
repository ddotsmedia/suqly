import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem, WishlistShare } from './wishlist.entity';
import { Listing } from './listing.entity';
import * as crypto from 'crypto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private wishlistItemRepository: Repository<WishlistItem>,
    @InjectRepository(WishlistShare)
    private wishlistShareRepository: Repository<WishlistShare>,
    @InjectRepository(Listing)
    private listingRepository: Repository<Listing>,
  ) {}

  async addToWishlist(userId: number, listingId: number): Promise<WishlistItem> {
    const existing = await this.wishlistItemRepository.findOne({
      where: { userId, listingId },
    });

    if (existing) {
      throw new ConflictException('Item already in wishlist');
    }

    const item = this.wishlistItemRepository.create({
      userId,
      listingId,
    });

    return this.wishlistItemRepository.save(item);
  }

  async removeFromWishlist(userId: number, listingId: number): Promise<boolean> {
    const result = await this.wishlistItemRepository.delete({
      userId,
      listingId,
    });
    return result.affected > 0;
  }

  async getWishlistItems(
    userId: number,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ items: any[]; total: number }> {
    const [items, total] = await this.wishlistItemRepository.findAndCount({
      where: { userId },
      relations: ['listing', 'listing.user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      items: items.map((item) => ({
        id: item.id,
        listingId: item.listingId,
        title: item.listing.title,
        price: item.listing.price,
        category: item.listing.category,
        emirate: item.listing.emirate,
        location: item.listing.publicLocation || item.listing.emirate,
        image: item.listing.images && item.listing.images[0] ? item.listing.images[0].fullUrl : null,
        addedAt: item.createdAt,
        seller: {
          id: item.listing.user.id,
          displayName: item.listing.user.displayName,
        },
      })),
      total,
    };
  }

  async isInWishlist(userId: number, listingId: number): Promise<boolean> {
    const item = await this.wishlistItemRepository.findOne({
      where: { userId, listingId },
    });
    return !!item;
  }

  async createShareLink(userId: number): Promise<WishlistShare> {
    const existing = await this.wishlistShareRepository.findOne({
      where: { userId },
    });

    if (existing) {
      return existing;
    }

    const shareToken = crypto.randomBytes(32).toString('hex');
    const share = this.wishlistShareRepository.create({
      userId,
      shareToken,
      isPublic: true,
    });

    return this.wishlistShareRepository.save(share);
  }

  async getPublicWishlist(shareToken: string): Promise<{
    user: { id: number; displayName: string };
    items: any[];
  }> {
    const share = await this.wishlistShareRepository.findOne({
      where: { shareToken },
      relations: ['user'],
    });

    if (!share || !share.isPublic) {
      throw new NotFoundException('Wishlist not found or private');
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      throw new NotFoundException('Wishlist share link expired');
    }

    const { items, total } = await this.getWishlistItems(share.userId, 100, 0);

    return {
      user: {
        id: share.user.id,
        displayName: share.user.displayName,
      },
      items,
    };
  }

  async deleteShareLink(userId: number): Promise<boolean> {
    const result = await this.wishlistShareRepository.delete({ userId });
    return result.affected > 0;
  }

  async exportToCSV(userId: number): Promise<Buffer> {
    const { items } = await this.getWishlistItems(userId, 1000, 0);

    const headers = ['listingId', 'title', 'price', 'category', 'emirate', 'location', 'addedAt'];
    const rows = items.map((item) => [
      item.listingId,
      this.escapeCSV(item.title),
      item.price,
      item.category,
      item.emirate,
      this.escapeCSV(item.location || ''),
      new Date(item.addedAt).toISOString().split('T')[0],
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    return Buffer.from(csv);
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  async getShareLink(userId: number): Promise<WishlistShare | null> {
    return this.wishlistShareRepository.findOne({
      where: { userId },
    });
  }
}
