import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModerationQueue } from './moderation-queue.entity';
import { Listing } from '../listings/listing.entity';

const BANNED_KEYWORDS = ['casino', 'gambling', 'illegal', 'counterfeit', 'scam'];
const SUSPICIOUS_PATTERNS = ['contact me outside', 'whatsapp only', 'no inspection'];

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(ModerationQueue)
    private moderationRepository: Repository<ModerationQueue>,
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
  ) {}

  async flagListing(
    listingId: number,
    reason: string,
    flaggedByUserId?: number,
  ): Promise<ModerationQueue> {
    const listing = await this.listingsRepository.findOne({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const flag = this.moderationRepository.create({
      listingId,
      reason,
      flaggedByUserId,
      status: 'pending',
    });

    return this.moderationRepository.save(flag);
  }

  async getQueue(status = 'pending', page = 1, limit = 20): Promise<any> {
    const [flags, total] = await this.moderationRepository.findAndCount({
      where: { status },
      relations: ['listing', 'listing.user'],
      order: { flaggedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: flags,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async approveFlag(
    flagId: number,
    reviewerId: number,
  ): Promise<ModerationQueue> {
    const flag = await this.moderationRepository.findOne({
      where: { id: flagId },
    });

    if (!flag) {
      throw new NotFoundException('Flag not found');
    }

    flag.status = 'approved';
    flag.reviewerId = reviewerId;
    flag.reviewedAt = new Date();

    // Automatically publish the listing if it was marked for approval
    const listing = await this.listingsRepository.findOne({
      where: { id: flag.listingId },
    });
    if (listing && listing.status === 'pending_review') {
      listing.status = 'active';
      await this.listingsRepository.save(listing);
    }

    return this.moderationRepository.save(flag);
  }

  async rejectFlag(
    flagId: number,
    reviewerId: number,
    reason: string,
  ): Promise<ModerationQueue> {
    const flag = await this.moderationRepository.findOne({
      where: { id: flagId },
    });

    if (!flag) {
      throw new NotFoundException('Flag not found');
    }

    flag.status = 'rejected';
    flag.reviewerId = reviewerId;
    flag.rejectionReason = reason;
    flag.reviewedAt = new Date();

    // Move listing to on_hold or expired based on reason
    const listing = await this.listingsRepository.findOne({
      where: { id: flag.listingId },
    });
    if (listing && listing.status === 'pending_review') {
      listing.status = 'on_hold';
      await this.listingsRepository.save(listing);
    }

    return this.moderationRepository.save(flag);
  }

  async getListingFlags(listingId: number): Promise<ModerationQueue[]> {
    return this.moderationRepository.find({
      where: { listingId },
      order: { flaggedAt: 'DESC' },
    });
  }

  async getStats(): Promise<any> {
    const pending = await this.moderationRepository.count({
      where: { status: 'pending' },
    });
    const approved = await this.moderationRepository.count({
      where: { status: 'approved' },
    });
    const rejected = await this.moderationRepository.count({
      where: { status: 'rejected' },
    });

    return {
      pending,
      approved,
      rejected,
      total: pending + approved + rejected,
    };
  }

  async checkListingForAutoFlag(listing: Listing): Promise<string | null> {
    const text = `${listing.title} ${listing.description}`.toLowerCase();

    for (const keyword of BANNED_KEYWORDS) {
      if (text.includes(keyword)) {
        return `Contains banned keyword: ${keyword}`;
      }
    }

    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (text.includes(pattern)) {
        return `Suspicious pattern detected: ${pattern}`;
      }
    }

    if (listing.price && listing.price < 10) {
      return 'Suspiciously low price';
    }

    return null;
  }

  async autoFlagListing(listing: Listing): Promise<void> {
    const reason = await this.checkListingForAutoFlag(listing);
    if (reason) {
      await this.flagListing(listing.id, reason);
    }
  }
}
