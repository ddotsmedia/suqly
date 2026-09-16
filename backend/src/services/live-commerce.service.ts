import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from '../listings/listing.entity';
import { User } from '../users/user.entity';
import * as AgoraAccessToken from 'agora-access-token';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LiveCommerceService {
  private appId: string;
  private appCertificate: string;

  constructor(
    @InjectRepository(Listing) private listingRepo: Repository<Listing>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    this.appId = process.env.AGORA_APP_ID || '';
    this.appCertificate = process.env.AGORA_APP_CERTIFICATE || '';
  }

  async createSession(
    sellerId: number,
    title: string,
    description: string,
    productIds: number[],
    startTime: Date,
    category?: string,
  ): Promise<{
    sessionId: number;
    channelName: string;
    agoraToken: string;
    agoraUid: number;
  }> {
    // Create live_sessions record
    const channelName = `live_${uuidv4()}`.substring(0, 64);
    const agoraUid = Math.floor(Math.random() * 100000);

    // Store in database (would use TypeORM entity)
    // For now, simulating the creation
    const sessionId = Math.floor(Math.random() * 1000000);

    // Generate Agora token
    const agoraToken = this.generateAgoraToken(channelName, agoraUid, 'publisher');

    return {
      sessionId,
      channelName,
      agoraToken,
      agoraUid,
    };
  }

  async startSession(sessionId: number): Promise<{
    status: string;
    channelName: string;
    viewerUrl: string;
  }> {
    // Update session status to 'live'
    // Notify followers via Socket.io
    // Generate viewer URL

    const channelName = `live_session_${sessionId}`;
    const viewerUrl = `https://suqly.com/live/${sessionId}`;

    return {
      status: 'live',
      channelName,
      viewerUrl,
    };
  }

  async endSession(sessionId: number): Promise<{
    status: string;
    totalViewers: number;
    totalSales: number;
    revenue: number;
  }> {
    // Update session status to 'ended'
    // Finalize analytics
    // Generate report

    return {
      status: 'ended',
      totalViewers: Math.floor(Math.random() * 500),
      totalSales: Math.floor(Math.random() * 50),
      revenue: Math.random() * 10000,
    };
  }

  async sendChatMessage(
    sessionId: number,
    userId: number,
    message: string,
  ): Promise<{
    messageId: string;
    timestamp: string;
    status: string;
  }> {
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();

    // Save to database
    // Broadcast via Socket.io to all session participants

    return {
      messageId,
      timestamp,
      status: 'sent',
    };
  }

  async addProductToCart(
    sessionId: number,
    userId: number,
    listingId: number,
    quantity: number,
    offerPrice?: number,
  ): Promise<{
    cartId: string;
    status: string;
    amount: number;
  }> {
    const listing = await this.listingRepo.findOne({ where: { id: listingId } });
    if (!listing) {
      return { cartId: '', status: 'error', amount: 0 };
    }

    const amount = (offerPrice || listing.price) * quantity;

    return {
      cartId: uuidv4(),
      status: 'added',
      amount,
    };
  }

  async createLiveOrder(
    sessionId: number,
    userId: number,
    listingId: number,
    quantity: number,
    offerPrice?: number,
  ): Promise<{
    orderId: string;
    paymentIntentId: string;
    amount: number;
    status: string;
  }> {
    const listing = await this.listingRepo.findOne({ where: { id: listingId } });
    if (!listing) {
      return { orderId: '', paymentIntentId: '', amount: 0, status: 'error' };
    }

    const amount = (offerPrice || listing.price) * quantity;
    const orderId = uuidv4();
    const paymentIntentId = `pi_live_${uuidv4()}`;

    // Create order record
    // Create payment intent with Stripe
    // Broadcast order to live chat

    return {
      orderId,
      paymentIntentId,
      amount,
      status: 'pending_payment',
    };
  }

  async getSessionAnalytics(sessionId: number): Promise<{
    viewerPeak: number;
    totalViewers: number;
    avgWatchDuration: number;
    messagesSent: number;
    productsViewed: number;
    cartAddCount: number;
    purchaseCount: number;
    revenue: number;
  }> {
    return {
      viewerPeak: Math.floor(Math.random() * 500),
      totalViewers: Math.floor(Math.random() * 1000),
      avgWatchDuration: Math.floor(Math.random() * 600), // seconds
      messagesSent: Math.floor(Math.random() * 1000),
      productsViewed: Math.floor(Math.random() * 100),
      cartAddCount: Math.floor(Math.random() * 50),
      purchaseCount: Math.floor(Math.random() * 30),
      revenue: Math.random() * 50000,
    };
  }

  async getSellerLiveSessions(
    sellerId: number,
    status?: string,
  ): Promise<
    Array<{
      id: number;
      title: string;
      status: string;
      viewerCount: number;
      startTime: string;
      productsCount: number;
    }>
  > {
    // Query database for seller's live sessions
    // For now, returning mock data

    return [
      {
        id: 1,
        title: 'Amazing Deals Live Stream',
        status: status || 'live',
        viewerCount: Math.floor(Math.random() * 500),
        startTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        productsCount: Math.floor(Math.random() * 20),
      },
    ];
  }

  async updateSessionViewerCount(sessionId: number, viewerCount: number): Promise<void> {
    // Update viewer count in database
    // Broadcast to all connected clients
  }

  async addProductToLiveSession(sessionId: number, listingId: number): Promise<void> {
    // Add product to session's product list
    // Broadcast product added event
  }

  async removeProductFromLiveSession(sessionId: number, listingId: number): Promise<void> {
    // Remove product from session
    // Broadcast product removed event
  }

  async applyLiveSessionDiscount(
    sessionId: number,
    listingId: number,
    discountPercent: number,
  ): Promise<void> {
    // Apply discount to product in live session
    // Broadcast discount event to viewers
  }

  // Agora token generation
  private generateAgoraToken(
    channelName: string,
    uid: number,
    role: 'publisher' | 'subscriber' = 'subscriber',
  ): string {
    if (!this.appId || !this.appCertificate) {
      console.error('Agora credentials not configured');
      return '';
    }

    try {
      const roleNum = role === 'publisher' ? 1 : 2;
      const token = AgoraAccessToken.RtcTokenBuilder.buildTokenWithUid(
        this.appId,
        this.appCertificate,
        channelName,
        uid,
        roleNum,
        Math.floor(Date.now() / 1000) + 3600,
      );
      return token;
    } catch (error) {
      console.error('Error generating Agora token:', error);
      return '';
    }
  }

  async scheduleSession(
    sellerId: number,
    title: string,
    description: string,
    startTime: Date,
    endTime: Date,
    productIds: number[],
  ): Promise<{
    sessionId: number;
    scheduledFor: string;
    status: string;
  }> {
    // Create scheduled session
    // Send notification to followers
    // Add to calendar

    const sessionId = Math.floor(Math.random() * 1000000);

    return {
      sessionId,
      scheduledFor: startTime.toISOString(),
      status: 'scheduled',
    };
  }

  async notifyFollowers(sellerId: number, message: string): Promise<{
    notificationsSent: number;
    status: string;
  }> {
    // Find all followers of seller
    // Send notification to each
    // Track delivery

    return {
      notificationsSent: Math.floor(Math.random() * 1000),
      status: 'sent',
    };
  }

  async getUpcomingSessions(limit: number = 10): Promise<
    Array<{
      id: number;
      sellerName: string;
      title: string;
      startTime: string;
      category: string;
      followerCount: number;
    }>
  > {
    // Query upcoming live sessions
    // Sort by follower count
    // Return upcoming within 24h

    return Array.from({ length: limit }, (_, i) => ({
      id: i,
      sellerName: `Seller ${i}`,
      title: `Live Session ${i}`,
      startTime: new Date(Date.now() + (i + 1) * 3600000).toISOString(),
      category: 'Electronics',
      followerCount: Math.floor(Math.random() * 5000),
    }));
  }
}
