import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { Listing } from '../listings/listing.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(Listing)
    private listingRepo: Repository<Listing>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(reviewerId: number, listingId: number, rating: number, comment: string): Promise<Review> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const listing = await this.listingRepo.findOne({ where: { id: listingId }, relations: ['user'] });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const sellerId = listing.userId;
    if (reviewerId === sellerId) {
      throw new BadRequestException('Cannot review own listing');
    }

    // Check if already reviewed
    const existing = await this.reviewRepo.findOne({
      where: { listingId, reviewerId },
    });
    if (existing) {
      throw new BadRequestException('Already reviewed this listing');
    }

    const review = this.reviewRepo.create({
      reviewerId,
      sellerId,
      listingId,
      rating: parseFloat(rating.toString()),
      comment: comment?.substring(0, 500),
    });

    const saved = await this.reviewRepo.save(review);

    // Update seller average rating
    await this.updateSellerRating(sellerId);

    return saved;
  }

  async findByListingId(listingId: number, page = 1, limit = 5): Promise<{ reviews: Review[], total: number }> {
    const [reviews, total] = await this.reviewRepo.findAndCount({
      where: { listingId },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { reviews, total };
  }

  async findBySellerId(sellerId: number, page = 1, limit = 10): Promise<{ reviews: Review[], total: number, avgRating: number }> {
    const [reviews, total] = await this.reviewRepo.findAndCount({
      where: { sellerId },
      relations: ['reviewer', 'listing'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const avgRating = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.sellerId = :sellerId', { sellerId })
      .getRawOne();

    return { reviews, total, avgRating: parseFloat(avgRating?.avg || 0) };
  }

  async getSellerStats(sellerId: number): Promise<{ avgRating: number, totalReviews: number }> {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('review.sellerId = :sellerId', { sellerId })
      .getRawOne();

    return {
      avgRating: parseFloat(result?.avg || 0),
      totalReviews: parseInt(result?.count || 0),
    };
  }

  private async updateSellerRating(sellerId: number): Promise<void> {
    const stats = await this.getSellerStats(sellerId);
    await this.userRepo.update(sellerId, {
      sellerScore: parseFloat(stats.avgRating.toFixed(1)),
    });
  }
}
