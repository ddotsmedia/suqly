import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEvent, EventType } from './analytics-events.entity';

interface ListingStats {
  views: number;
  clicks: number;
  contacts: number;
  wishlist_adds: number;
  ctr: number;
}

interface TrendingListing {
  id: number;
  title: string;
  views: number;
  clicks: number;
  recentViews: number;
}

interface UserFunnel {
  browse: number;
  view: number;
  contact: number;
  wishlist: number;
  dropoff_view_to_contact: number;
}

interface SearchMetrics {
  top_queries: Array<{ query: string; count: number; ctr: number }>;
  no_result_searches: number;
  avg_ctr: number;
}

interface CategoryPerformance {
  category: string;
  views: number;
  contacts: number;
  avg_price: number;
  contact_rate: number;
}

interface SellerPerformance {
  userId: number;
  views: number;
  contacts: number;
  messages: number;
  avg_response_time: number;
  top_listings: Array<{ id: number; title: string; views: number }>;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private eventsRepository: Repository<AnalyticsEvent>,
  ) {}

  async trackEvent(
    eventType: EventType,
    listingId?: number,
    userId?: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.eventsRepository.create({
      eventType,
      listingId,
      userId,
      metadata,
    });
  }

  async trackListingView(
    listingId: number,
    userId?: number,
    source?: string,
  ): Promise<void> {
    await this.trackEvent('view', listingId, userId, { source });
  }

  async trackListingClick(
    listingId: number,
    userId?: number,
    from_page?: string,
  ): Promise<void> {
    await this.trackEvent('click', listingId, userId, { from_page });
  }

  async trackContactButtonClick(
    listingId: number,
    userId?: number,
    method?: string,
  ): Promise<void> {
    await this.trackEvent('contact', listingId, userId, { method });
  }

  async trackWishlistAdd(listingId: number, userId: number): Promise<void> {
    await this.trackEvent('wishlist', listingId, userId);
  }

  async trackSearch(query: string, results_count: number): Promise<void> {
    await this.trackEvent('search', undefined, undefined, {
      query,
      results_count,
    });
  }

  async getListingStats(
    listingId: number,
    dateRange?: { from: Date; to: Date },
  ): Promise<ListingStats> {
    const query = this.eventsRepository
      .createQueryBuilder('event')
      .where('event.listingId = :listingId', { listingId });

    if (dateRange) {
      query.andWhere('event.createdAt >= :from', { from: dateRange.from });
      query.andWhere('event.createdAt <= :to', { to: dateRange.to });
    }

    const views = await query
      .andWhere('event.eventType = :type', { type: 'view' })
      .getCount();

    const clicks = await this.eventsRepository
      .createQueryBuilder('event')
      .where('event.listingId = :listingId', { listingId })
      .andWhere('event.eventType = :type', { type: 'click' })
      .getCount();

    const contacts = await this.eventsRepository
      .createQueryBuilder('event')
      .where('event.listingId = :listingId', { listingId })
      .andWhere('event.eventType = :type', { type: 'contact' })
      .getCount();

    const wishlist_adds = await this.eventsRepository
      .createQueryBuilder('event')
      .where('event.listingId = :listingId', { listingId })
      .andWhere('event.eventType = :type', { type: 'wishlist' })
      .getCount();

    return {
      views,
      clicks,
      contacts,
      wishlist_adds,
      ctr: views > 0 ? (clicks / views) * 100 : 0,
    };
  }

  async getTrendingListings(limit: number = 10): Promise<TrendingListing[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const viewEvents = await this.eventsRepository
      .createQueryBuilder('event')
      .where('event.eventType = :type', { type: 'view' })
      .andWhere('event.createdAt >= :date', { date: sevenDaysAgo })
      .groupBy('event.listingId')
      .orderBy('COUNT(event.id)', 'DESC')
      .limit(limit)
      .getRawMany();

    return viewEvents.map((row) => ({
      id: row.event_listingId,
      title: `Listing ${row.event_listingId}`,
      views: parseInt(row.count || 0),
      clicks: 0,
      recentViews: parseInt(row.count || 0),
    }));
  }

  async getUserFunnel(dateRange?: {
    from: Date;
    to: Date;
  }): Promise<UserFunnel> {
    let query = this.eventsRepository.createQueryBuilder('event');

    if (dateRange) {
      query = query
        .where('event.createdAt >= :from', { from: dateRange.from })
        .andWhere('event.createdAt <= :to', { to: dateRange.to });
    }

    const browse = await query.clone().getCount();
    const view = await query
      .clone()
      .andWhere('event.eventType = :type', { type: 'view' })
      .getCount();
    const contact = await query
      .clone()
      .andWhere('event.eventType = :type', { type: 'contact' })
      .getCount();
    const wishlist = await query
      .clone()
      .andWhere('event.eventType = :type', { type: 'wishlist' })
      .getCount();

    return {
      browse,
      view,
      contact,
      wishlist,
      dropoff_view_to_contact: view > 0 ? ((view - contact) / view) * 100 : 0,
    };
  }

  async getSearchMetrics(dateRange?: {
    from: Date;
    to: Date;
  }): Promise<SearchMetrics> {
    let query = this.eventsRepository
      .createQueryBuilder('event')
      .where('event.eventType = :type', { type: 'search' });

    if (dateRange) {
      query = query
        .andWhere('event.createdAt >= :from', { from: dateRange.from })
        .andWhere('event.createdAt <= :to', { to: dateRange.to });
    }

    const searchEvents = await query.getMany();

    const queryMap = new Map<string, { count: number; clicks: number }>();

    for (const event of searchEvents) {
      const searchQuery = event.metadata?.query || 'unknown';
      if (!queryMap.has(searchQuery)) {
        queryMap.set(searchQuery, { count: 0, clicks: 0 });
      }
      const item = queryMap.get(searchQuery)!;
      item.count++;
      if (event.metadata?.results_count === 0) {
        item.clicks = 0;
      }
    }

    const top_queries = Array.from(queryMap.entries())
      .map(([query, data]) => ({
        query,
        count: data.count,
        ctr: data.count > 0 ? (data.clicks / data.count) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const no_result_searches = searchEvents.filter(
      (e) => e.metadata?.results_count === 0,
    ).length;

    const avg_ctr =
      top_queries.length > 0
        ? top_queries.reduce((sum, q) => sum + q.ctr, 0) /
          top_queries.length
        : 0;

    return { top_queries, no_result_searches, avg_ctr };
  }

  async getSellerPerformance(
    userId: number,
    dateRange?: { from: Date; to: Date },
  ): Promise<SellerPerformance> {
    let query = this.eventsRepository
      .createQueryBuilder('event')
      .where('event.userId = :userId', { userId });

    if (dateRange) {
      query = query
        .andWhere('event.createdAt >= :from', { from: dateRange.from })
        .andWhere('event.createdAt <= :to', { to: dateRange.to });
    }

    const views = await query
      .clone()
      .andWhere('event.eventType = :type', { type: 'view' })
      .getCount();

    const contacts = await query
      .clone()
      .andWhere('event.eventType = :type', { type: 'contact' })
      .getCount();

    const messages = await query
      .clone()
      .andWhere('event.eventType = :type', { type: 'message' })
      .getCount();

    return {
      userId,
      views,
      contacts,
      messages,
      avg_response_time: 0,
      top_listings: [],
    };
  }

  async getCategoryPerformance(dateRange?: {
    from: Date;
    to: Date;
  }): Promise<CategoryPerformance[]> {
    return [];
  }
}
