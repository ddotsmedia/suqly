import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from '../listings/listing.entity';

@Injectable()
export class PricePredictionService {
  constructor(
    @InjectRepository(Listing) private listingRepo: Repository<Listing>,
  ) {}

  async suggestPrice(listingId: number): Promise<{
    suggestedPrice: number;
    marketAverage: number;
    marketMin: number;
    marketMax: number;
    confidence: number;
    factors: Record<string, any>;
  }> {
    const listing = await this.listingRepo.findOne({ where: { id: listingId } });
    if (!listing) {
      return {
        suggestedPrice: 0,
        marketAverage: 0,
        marketMin: 0,
        marketMax: 0,
        confidence: 0,
        factors: {},
      };
    }

    // Get similar listings (same category, similar price range, active)
    const similarListings = await this.listingRepo
      .createQueryBuilder('listing')
      .where('listing.category = :category', { category: listing.category })
      .andWhere('listing.status = :status', { status: 'active' })
      .andWhere('listing.id != :id', { id: listingId })
      .orderBy('listing.createdAt', 'DESC')
      .limit(50)
      .getMany();

    if (similarListings.length === 0) {
      return {
        suggestedPrice: listing.price,
        marketAverage: listing.price,
        marketMin: listing.price,
        marketMax: listing.price,
        confidence: 0.1,
        factors: { no_similar_listings: true },
      };
    }

    // Calculate market statistics
    const prices = similarListings.map((l) => l.price).filter((p) => p > 0);
    const marketMin = Math.min(...prices);
    const marketMax = Math.max(...prices);
    const marketAverage = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Weighted average (recent listings weighted more heavily)
    const now = Date.now();
    let totalWeight = 0;
    let weightedSum = 0;

    for (const sim of similarListings) {
      const ageMs = now - new Date(sim.createdAt).getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      // Weight: newer listings get higher weight (decay with time)
      const weight = Math.exp(-ageDays / 7); // 7-day decay
      weightedSum += sim.price * weight;
      totalWeight += weight;
    }

    const weightedAverage = totalWeight > 0 ? weightedSum / totalWeight : marketAverage;

    // Factor in listing condition and seller reputation
    let priceAdjustment = 1.0;
    const factors: Record<string, any> = {};

    // Note: condition and seller_score not currently in Listing entity
    // These can be added in future iterations

    // Duration on platform (if too long, maybe lower price)
    const listingAgeDays =
      (Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (listingAgeDays > 30) {
      priceAdjustment *= 0.95;
      factors.long_listing_duration = true;
    }

    // Demand signal: check if similar items are selling
    const recentlySoldCount = similarListings.filter((l) => {
      const ageDays =
        (Date.now() - new Date(l.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      return ageDays < 7; // Sold/updated in last 7 days
    }).length;

    if (recentlySoldCount > similarListings.length * 0.5) {
      factors.high_demand = true;
    } else if (recentlySoldCount < similarListings.length * 0.1) {
      factors.low_demand = true;
    }

    // Calculate suggested price
    let suggestedPrice = weightedAverage * priceAdjustment;

    // Ensure it's within market range with some buffer
    suggestedPrice = Math.max(suggestedPrice, marketMin * 0.9);
    suggestedPrice = Math.min(suggestedPrice, marketMax * 1.1);

    // Round to nearest 10 AED
    suggestedPrice = Math.round(suggestedPrice / 10) * 10;

    // Confidence based on number of comparables
    let confidence = Math.min(similarListings.length / 50, 1.0) * 0.8 + 0.2;

    return {
      suggestedPrice: Math.round(suggestedPrice),
      marketAverage: Math.round(marketAverage),
      marketMin: Math.round(marketMin),
      marketMax: Math.round(marketMax),
      confidence,
      factors,
    };
  }

  async getPriceTrend(
    category: string,
    emirate?: string,
  ): Promise<{
    trend: string;
    priceChange: number;
    data: Array<{ date: string; avgPrice: number; volume: number }>;
  }> {
    // Get listings from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const query = this.listingRepo
      .createQueryBuilder('listing')
      .where('listing.category = :category', { category })
      .andWhere('listing.createdAt >= :date', { date: thirtyDaysAgo });

    if (emirate) {
      query.andWhere('listing.emirate = :emirate', { emirate });
    }

    const listings = await query.orderBy('listing.createdAt', 'ASC').getMany();

    // Group by date and calculate daily averages
    const dailyData: Record<
      string,
      {
        prices: number[];
        count: number;
      }
    > = {};

    for (const listing of listings) {
      const dateStr = new Date(listing.createdAt).toISOString().split('T')[0];
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { prices: [], count: 0 };
      }
      dailyData[dateStr].prices.push(listing.price);
      dailyData[dateStr].count++;
    }

    // Calculate trend line
    const data = Object.entries(dailyData)
      .map(([date, { prices }]) => ({
        date,
        avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
        volume: prices.length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (data.length < 2) {
      return {
        trend: 'insufficient_data',
        priceChange: 0,
        data,
      };
    }

    // Calculate trend
    const firstPrice = data[0].avgPrice;
    const lastPrice = data[data.length - 1].avgPrice;
    const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

    let trend = 'stable';
    if (priceChange > 5) trend = 'increasing';
    else if (priceChange < -5) trend = 'decreasing';

    return {
      trend,
      priceChange: Math.round(priceChange * 100) / 100,
      data,
    };
  }

  async getMarketStats(
    category: string,
    emirate?: string,
  ): Promise<{
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    medianPrice: number;
    standardDeviation: number;
    listingCount: number;
    activeListing: number;
    soldIn30Days: number;
  }> {
    const query = this.listingRepo
      .createQueryBuilder('listing')
      .where('listing.category = :category', { category });

    if (emirate) {
      query.andWhere('listing.emirate = :emirate', { emirate });
    }

    const listings = await query.getMany();

    if (listings.length === 0) {
      return {
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        medianPrice: 0,
        standardDeviation: 0,
        listingCount: 0,
        activeListing: 0,
        soldIn30Days: 0,
      };
    }

    const prices = listings.map((l) => l.price).filter((p) => p > 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Calculate median
    const sorted = prices.sort((a, b) => a - b);
    const medianPrice = sorted[Math.floor(sorted.length / 2)];

    // Calculate standard deviation
    const squaredDiffs = prices.map((p) => Math.pow(p - avgPrice, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / prices.length;
    const standardDeviation = Math.sqrt(variance);

    // Count active listings
    const activeListing = listings.filter((l) => l.status === 'active').length;

    // Count sold in last 30 days (simulated by updated_at)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const soldIn30Days = listings.filter(
      (l) => new Date(l.updatedAt) > thirtyDaysAgo && l.status === 'sold',
    ).length;

    return {
      avgPrice: Math.round(avgPrice),
      minPrice,
      maxPrice,
      medianPrice,
      standardDeviation: Math.round(standardDeviation),
      listingCount: listings.length,
      activeListing,
      soldIn30Days,
    };
  }
}
