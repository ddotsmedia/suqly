import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';
import { Transaction } from '../payments/transaction.entity';
import { ModerationQueue } from '../moderation/moderation-queue.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(ModerationQueue)
    private moderationRepository: Repository<ModerationQueue>,
  ) {}

  async getStats(): Promise<any> {
    const [totalUsers, totalListings, totalTransactions, flaggedCount] = await Promise.all([
      this.usersRepository.count(),
      this.listingsRepository.count(),
      this.transactionsRepository.count(),
      this.moderationRepository.count({ where: { status: 'pending' } }),
    ]);

    const transactions = await this.transactionsRepository.find({
      where: { status: 'completed' },
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const avgListingPrice = await this.listingsRepository
      .createQueryBuilder('l')
      .select('AVG(l.price)', 'avg')
      .getRawOne();

    return {
      totalUsers,
      totalListings,
      totalTransactions,
      totalRevenue,
      flaggedListings: flaggedCount,
      avgListingPrice: parseFloat(avgListingPrice?.avg || 0),
    };
  }

  async getFlaggedListings(page = 1, limit = 20): Promise<any> {
    const [flags, total] = await this.moderationRepository.findAndCount({
      where: { status: 'pending' },
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

  async getTransactionStats(): Promise<any> {
    const completed = await this.transactionsRepository.find({
      where: { status: 'completed' },
    });

    const byDay = completed.reduce((acc, t) => {
      const day = t.createdAt.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue: completed.reduce((sum, t) => sum + Number(t.amount), 0),
      byDay,
      transactionCount: completed.length,
    };
  }
}
