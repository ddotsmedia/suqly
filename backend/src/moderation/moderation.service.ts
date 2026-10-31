import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModerationQueue } from './moderation-queue.entity';
import { Listing } from '../listings/listing.entity';
import { Notification } from '../notifications/notification.entity';

const BANNED_KEYWORDS = ['casino', 'gambling', 'illegal', 'counterfeit', 'scam'];
const SUSPICIOUS_PATTERNS = ['contact me outside', 'whatsapp only', 'no inspection'];

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(ModerationQueue)
    private moderationRepository: Repository<ModerationQueue>,
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  private async notify(userId: number | null | undefined, title: string, body: string): Promise<void> {
    if (!userId) return;
    await this.notificationRepository.save(
      this.notificationRepository.create({ userId, title, body, topic: 'moderation' }),
    );
  }

  async appealFlag(flagId: number, userId: number, reason: string): Promise<ModerationQueue> {
    const flag = await this.moderationRepository.findOne({ where: { id: flagId } });
    if (!flag) {
      throw new NotFoundException('Flag not found');
    }
    const listing = await this.listingsRepository.findOne({ where: { id: flag.listingId } });
    if (!listing || listing.userId !== userId) {
      throw new ForbiddenException('Only the listing owner can appeal');
    }
    if (flag.status !== 'rejected') {
      throw new BadRequestException('Only rejected flags can be appealed');
    }
    if (flag.appealStatus === 'pending') {
      throw new BadRequestException('An appeal is already pending');
    }

    flag.appealStatus = 'pending';
    flag.appealReason = reason;
    flag.appealAt = new Date();
    flag.appealDecisionNote = null;
    flag.appealDecidedAt = null;
    const saved = await this.moderationRepository.save(flag);

    await this.notify(
      userId,
      'Appeal received',
      `Your appeal for listing #${listing.id} has been received and will be reviewed.`,
    );
    return saved;
  }

  async getAppeals(status = 'pending'): Promise<ModerationQueue[]> {
    return this.moderationRepository.find({
      where: { appealStatus: status },
      relations: ['listing'],
      order: { appealAt: 'ASC' },
    });
  }

  async resolveAppeal(
    flagId: number,
    reviewerId: number,
    decision: 'upheld' | 'overturned',
    note: string,
  ): Promise<ModerationQueue> {
    const flag = await this.moderationRepository.findOne({ where: { id: flagId } });
    if (!flag) {
      throw new NotFoundException('Flag not found');
    }
    if (flag.appealStatus !== 'pending') {
      throw new BadRequestException('No pending appeal for this flag');
    }

    const listing = await this.listingsRepository.findOne({ where: { id: flag.listingId } });
    if (decision === 'overturned' && listing && listing.status === 'on_hold') {
      listing.status = 'active';
      await this.listingsRepository.save(listing);
    }

    flag.appealStatus = decision;
    flag.appealDecisionNote = note;
    flag.appealDecidedAt = new Date();
    flag.reviewerId = reviewerId;
    const saved = await this.moderationRepository.save(flag);

    const outcome = decision === 'overturned' ? 'overturned, and the listing is live again' : 'upheld';
    await this.notify(
      listing?.userId,
      'Appeal decision',
      `Your appeal for listing #${flag.listingId} was ${outcome}. ${note}`,
    );
    return saved;
  }

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
    await this.notify(
      flag.flaggedByUserId,
      'Report reviewed',
      `Thanks for your report. The listing #${flag.listingId} was reviewed and kept live.`,
    );

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
    await this.notify(
      flag.flaggedByUserId,
      'Report reviewed',
      `Thanks for your report. The listing #${flag.listingId} was put on hold. You can appeal from your listing.`,
    );

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

  async getOwnerListingFlags(
    listingId: number,
    viewerId: number,
    isStaff: boolean,
  ): Promise<ModerationQueue[]> {
    if (!isStaff) {
      const listing = await this.listingsRepository.findOne({ where: { id: listingId } });
      if (!listing || listing.userId !== viewerId) {
        throw new ForbiddenException('Only the listing owner or staff can view these flags');
      }
    }
    return this.getListingFlags(listingId);
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
