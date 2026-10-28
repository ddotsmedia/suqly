import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Listing } from '../listings/listing.entity';
import { Review } from '../reviews/review.entity';
import { Message } from '../messages/message.entity';

@Injectable()
export class SellerStatsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async getSellerStats(userId: number): Promise<any> {
    const [listings, reviews, inboundMessages] = await Promise.all([
      this.listingsRepository.find({ where: { userId } }),
      this.reviewsRepository.find({ where: { sellerId: userId } }),
      this.messagesRepository.find({ where: { recipientId: userId } }),
    ]);

    const totalListings = listings.length;
    const activeListings = listings.filter((l) => l.status === 'active').length;
    const soldListings = listings.filter((l) => l.status === 'sold').length;

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

    let responseRate: number | null = null;
    if (inboundMessages.length >= 3) {
      let repliedCount = 0;
      for (const msg of inboundMessages) {
        const replyWithin24h = await this.messagesRepository.findOne({
          where: {
            senderId: userId,
            recipientId: msg.senderId,
            listingId: msg.listingId,
          },
        });
        if (replyWithin24h && replyWithin24h.createdAt.getTime() - msg.createdAt.getTime() <= 86400000) {
          repliedCount++;
        }
      }
      responseRate = parseFloat(((repliedCount / inboundMessages.length) * 100).toFixed(1));
    }

    return {
      totalListings,
      activeListings,
      soldListings,
      totalReviews: reviews.length,
      averageRating: parseFloat(avgRating.toFixed(1)),
      responseRate,
      sellerScore: responseRate !== null ? Math.min(5, parseFloat((avgRating * (responseRate / 100)).toFixed(1))) : null,
    };
  }
}
