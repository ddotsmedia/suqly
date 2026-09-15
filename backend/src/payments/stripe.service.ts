import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Transaction } from './transaction.entity';
import { Listing } from '../listings/listing.entity';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
  ) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (apiKey) {
      this.stripe = new Stripe(apiKey);
    }
  }

  async createCheckoutSession(
    buyerId: number,
    listingId: number,
    amount: number,
    returnUrl: string,
  ): Promise<{ clientSecret: string; sessionId: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    const listing = await this.listingsRepository.findOne({
      where: { id: listingId },
      relations: ['user'],
    });

    if (!listing) {
      throw new BadRequestException('Listing not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: listing.title,
              description: listing.description?.substring(0, 100),
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: returnUrl,
      cancel_url: returnUrl,
    });

    const transaction = this.transactionsRepository.create({
      buyerId,
      sellerId: listing.userId,
      listingId,
      amount,
      status: 'pending',
      stripeSessionId: session.id,
    });

    await this.transactionsRepository.save(transaction);

    return {
      clientSecret: session.client_secret,
      sessionId: session.id,
    };
  }

  async confirmPayment(sessionId: string): Promise<Transaction> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const transaction = await this.transactionsRepository.findOne({
        where: { stripeSessionId: sessionId },
      });

      if (transaction) {
        transaction.status = 'completed';
        transaction.stripePaymentIntentId = session.payment_intent as string;
        await this.transactionsRepository.save(transaction);
      }

      return transaction;
    }

    throw new BadRequestException('Payment not completed');
  }

  async getTransactions(userId: number, type: 'bought' | 'sold', page = 1, limit = 20): Promise<any> {
    const query = type === 'bought'
      ? this.transactionsRepository.find({
          where: { buyerId: userId },
          relations: ['listing', 'seller'],
          order: { createdAt: 'DESC' },
          skip: (page - 1) * limit,
          take: limit,
        })
      : this.transactionsRepository.find({
          where: { sellerId: userId },
          relations: ['listing', 'buyer'],
          order: { createdAt: 'DESC' },
          skip: (page - 1) * limit,
          take: limit,
        });

    const [transactions, total] = await Promise.all([
      query,
      this.transactionsRepository.count(
        type === 'bought' ? { where: { buyerId: userId } } : { where: { sellerId: userId } }
      ),
    ]);

    return {
      data: transactions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }
}
