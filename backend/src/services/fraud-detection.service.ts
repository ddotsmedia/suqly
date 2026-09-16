import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';
import axios from 'axios';

@Injectable()
export class FraudDetectionService {
  private BANNED_KEYWORDS = [
    'urgent sale',
    'no questions asked',
    'wont ship',
    'cash only',
    'no refunds',
    'risk buyers',
    'scammed',
  ];

  private PRICE_ANOMALY_THRESHOLD = 0.3; // 30% deviation

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Listing) private listingRepo: Repository<Listing>,
  ) {}

  async calculateSellerScore(userId: number): Promise<{
    score: number;
    riskLevel: string;
    factors: Record<string, any>;
  }> {
    const seller = await this.userRepo.findOne({ where: { id: userId } });
    if (!seller) return { score: 0, riskLevel: 'unknown', factors: {} };

    let score = 0;
    const factors: Record<string, any> = {};

    // Factor 1: Account age (newer = higher risk)
    const accountAgeDays = Math.floor(
      (Date.now() - new Date(seller.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (accountAgeDays < 7) {
      score += 25;
      factors.new_account = true;
    } else if (accountAgeDays < 30) {
      score += 15;
      factors.new_account = true;
    }

    // Factor 2: ID verification
    if (!seller.id_verified) {
      score += 20;
      factors.no_id_verification = true;
    }

    // Factor 3: Rapid listing creation (>5 per day)
    const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentListings = await this.listingRepo.count({
      where: {
        user_id: userId,
        created_at: MoreThan(lastDay),
      },
    });
    if (recentListings > 5) {
      score += 20;
      factors.rapid_listings = true;
    }

    // Factor 4: Price anomalies (very low prices)
    const avgListingPrice = await this.getAverageListingPrice(userId);
    if (avgListingPrice < 50) {
      score += 15;
      factors.suspiciously_low_prices = true;
    }

    // Factor 5: High refund/return rate (simulated - check order history)
    const refundRate = await this.getRefundRate(userId);
    if (refundRate > 0.2) {
      score += 20;
      factors.high_refund_rate = true;
    }

    // Factor 6: Negative reviews/ratings
    const avgRating = seller.seller_score || 0;
    if (avgRating < 2.0 && (seller as any).totalReviews > 5) {
      score += 25;
      factors.low_ratings = true;
    }

    // Factor 7: Multiple accounts from same device/IP (would need IP tracking)
    // Placeholder for future implementation
    factors.device_tracking = false;

    // Cap score at 100
    score = Math.min(score, 100);

    // Determine risk level
    let riskLevel = 'low';
    if (score >= 70) riskLevel = 'high';
    else if (score >= 50) riskLevel = 'medium';
    else if (score >= 30) riskLevel = 'low_medium';

    return { score, riskLevel, factors };
  }

  async checkListingRisk(listingId: number): Promise<{
    riskScore: number;
    riskLevel: string;
    flags: string[];
    shouldFlag: boolean;
  }> {
    const listing = await this.listingRepo.findOne({ where: { id: listingId } });
    if (!listing) return { riskScore: 0, riskLevel: 'unknown', flags: [], shouldFlag: false };

    let riskScore = 0;
    const flags: string[] = [];

    // Check for banned keywords
    const titleAndDesc = `${listing.title} ${listing.description}`.toLowerCase();
    for (const keyword of this.BANNED_KEYWORDS) {
      if (titleAndDesc.includes(keyword)) {
        riskScore += 20;
        flags.push(`contains_banned_keyword: ${keyword}`);
      }
    }

    // Check for suspiciously low price
    if (listing.price < 50) {
      riskScore += 15;
      flags.push('suspiciously_low_price');
    }

    // Check price anomaly vs category average
    const avgPriceInCategory = await this.getAveragePriceInCategory(listing.category);
    if (avgPriceInCategory && listing.price < avgPriceInCategory * (1 - this.PRICE_ANOMALY_THRESHOLD)) {
      riskScore += 10;
      flags.push('price_below_market_average');
    }

    // Check for missing images or description
    if (!listing.images || listing.images.length === 0) {
      riskScore += 10;
      flags.push('no_images');
    }
    if (!listing.description || listing.description.length < 20) {
      riskScore += 10;
      flags.push('minimal_description');
    }

    // Check seller fraud score
    const sellerScore = await this.calculateSellerScore(listing.user_id);
    if (sellerScore.riskLevel === 'high') {
      riskScore += 25;
      flags.push(`seller_high_risk_score: ${sellerScore.score}`);
    }

    // Check listing creation timing (if created multiple in short time)
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentByUser = await this.listingRepo.count({
      where: {
        user_id: listing.user_id,
        created_at: MoreThan(lastHour),
      },
    });
    if (recentByUser > 10) {
      riskScore += 15;
      flags.push('rapid_creation_burst');
    }

    riskScore = Math.min(riskScore, 100);

    let riskLevel = 'low';
    if (riskScore >= 70) riskLevel = 'high';
    else if (riskScore >= 50) riskLevel = 'medium';
    else if (riskScore >= 30) riskLevel = 'low_medium';

    const shouldFlag = riskLevel === 'high' || riskLevel === 'medium';

    return { riskScore, riskLevel, flags, shouldFlag };
  }

  async verifySellerIdentity(
    userId: number,
    docType: string,
    fileUrl: string,
  ): Promise<{
    status: string;
    confidence: number;
    verified: boolean;
  }> {
    // Simulate document verification (would use AWS Rekognition or similar in production)
    const confidence = Math.random() * 0.4 + 0.6; // 60-100% random
    const verified = confidence > 0.75;

    // Update seller verification status
    const seller = await this.userRepo.findOne({ where: { id: userId } });
    if (seller) {
      if (docType === 'emirates_id' || docType === 'passport') {
        seller.id_verified = verified;
        seller.id_verified_at = new Date();
      }
      await this.userRepo.save(seller);
    }

    return {
      status: verified ? 'approved' : 'needs_review',
      confidence,
      verified,
    };
  }

  async verifySellerBank(
    userId: number,
    iban: string,
    accountHolder: string,
  ): Promise<{
    status: string;
    valid: boolean;
    message: string;
  }> {
    // Basic IBAN validation
    const ibanRegex = /^AE\d{23}$/;
    const isValidIBAN = ibanRegex.test(iban);

    if (!isValidIBAN) {
      return {
        status: 'invalid',
        valid: false,
        message: 'Invalid IBAN format for UAE',
      };
    }

    // Check against SWIFT/BIC database (simplified)
    const bankCode = iban.substring(4, 8);
    const knownBanks = ['0260', '0050', '0065', '0070', '0075', '0080'];
    const isBankKnown = knownBanks.some((code) => bankCode.startsWith(code));

    if (!isBankKnown) {
      return {
        status: 'unverified_bank',
        valid: false,
        message: 'Bank not recognized in UAE banking system',
      };
    }

    // Update seller
    const seller = await this.userRepo.findOne({ where: { id: userId } });
    if (seller) {
      (seller as any).bank_verified = true;
      (seller as any).bank_account_iban = iban; // Store encrypted in production
      await this.userRepo.save(seller);
    }

    return {
      status: 'verified',
      valid: true,
      message: 'Bank account verified',
    };
  }

  async detectFraudPatterns(): Promise<{
    flaggedCount: number;
    suspendedCount: number;
    details: any[];
  }> {
    const details: any[] = [];
    let flaggedCount = 0;
    let suspendedCount = 0;

    // Get all listings from last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentListings = await this.listingRepo.find({
      where: { created_at: MoreThan(last24h) },
    });

    for (const listing of recentListings) {
      const riskAssessment = await this.checkListingRisk(listing.id);
      if (riskAssessment.shouldFlag) {
        flaggedCount++;
        details.push({
          listingId: listing.id,
          riskScore: riskAssessment.riskScore,
          flags: riskAssessment.flags,
          action: 'flagged_for_review',
        });

        // Auto-suspend if extremely high risk
        if (riskAssessment.riskLevel === 'high') {
          suspendedCount++;
          listing.status = 'suspended';
          await this.listingRepo.save(listing);
        }
      }
    }

    return { flaggedCount, suspendedCount, details };
  }

  // Helper methods
  private async getAverageListingPrice(userId: number): Promise<number> {
    const listings = await this.listingRepo.find({
      where: { user_id: userId },
    });
    if (listings.length === 0) return 0;
    const total = listings.reduce((sum, l) => sum + (l.price || 0), 0);
    return total / listings.length;
  }

  private async getRefundRate(userId: number): Promise<number> {
    // Placeholder: would query orders table
    // Returns percentage of orders with refunds
    return Math.random() * 0.1; // 0-10% for now
  }

  private async getAveragePriceInCategory(category: string): Promise<number> {
    const listings = await this.listingRepo.find({
      where: { category },
    });
    if (listings.length === 0) return 0;
    const total = listings.reduce((sum, l) => sum + (l.price || 0), 0);
    return total / listings.length;
  }
}
