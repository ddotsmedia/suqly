import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Payout, StripeConnectAccount } from './payout.entity';

@Injectable()
export class StripeConnectService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payout)
    private payoutsRepository: Repository<Payout>,
    @InjectRepository(StripeConnectAccount)
    private connectAccountsRepository: Repository<StripeConnectAccount>,
  ) {
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
  }

  async getAuthorizationUrl(sellerId: number, redirectUrl: string): Promise<string> {
    const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
    const baseUrl = 'https://connect.stripe.com/oauth/authorize';
    return `${baseUrl}?client_id=${clientId}&state=${sellerId}&stripe_user[email]=&redirect_uri=${redirectUrl}`;
  }

  async handleAccountUpdated(stripeAccountId: string, accountData: any): Promise<void> {
    let account = await this.connectAccountsRepository.findOne({
      where: { stripeAccountId },
    });

    if (!account) {
      account = new StripeConnectAccount();
    }

    account.stripeAccountId = stripeAccountId;
    account.status = accountData.status || 'active';
    account.chargesEnabled = accountData.charges_enabled || false;
    account.transfersEnabled = accountData.transfers_enabled || false;
    account.payoutEnabled = accountData.charges_enabled && accountData.transfers_enabled;

    await this.connectAccountsRepository.save(account);
  }

  async getBalance(sellerId: number): Promise<{ available: number; pending: number }> {
    const [paidPayouts] = await this.payoutsRepository.findAndCount({
      where: { sellerId, status: 'paid' },
    });
    const [pendingPayouts] = await this.payoutsRepository.findAndCount({
      where: { sellerId, status: 'pending' },
    });

    const available = paidPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
    const pending = pendingPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

    return { available, pending };
  }

  async createPayoutForTransaction(sellerId: number, amount: number): Promise<Payout> {
    const payout = this.payoutsRepository.create({
      sellerId,
      amount,
      status: 'pending',
    });

    return this.payoutsRepository.save(payout);
  }

  async getPayoutHistory(sellerId: number, page = 1, limit = 20): Promise<any> {
    const [payouts, total] = await this.payoutsRepository.findAndCount({
      where: { sellerId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: payouts,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async processPendingPayouts(): Promise<void> {
    const accounts = await this.connectAccountsRepository.find({
      where: { payoutEnabled: true },
    });

    for (const account of accounts) {
      const pendingPayouts = await this.payoutsRepository.find({
        where: { sellerId: account.sellerId, status: 'pending' },
      });

      if (pendingPayouts.length === 0) continue;

      const totalAmount = pendingPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

      if (totalAmount >= 50) {
        try {
          if (this.stripe && account.stripeAccountId) {
            const payout = await this.stripe.payouts.create(
              {
                amount: Math.round(totalAmount * 100),
                currency: 'aed',
              },
              { stripeAccount: account.stripeAccountId }
            );

            for (const p of pendingPayouts) {
              p.status = 'in_transit';
              p.stripePayoutId = payout.id;
              p.scheduledDate = new Date(payout.arrival_date * 1000);
              await this.payoutsRepository.save(p);
            }
          }
        } catch (err) {
          console.error(`Payout failed for seller ${account.sellerId}:`, err);
        }
      }
    }
  }
}
