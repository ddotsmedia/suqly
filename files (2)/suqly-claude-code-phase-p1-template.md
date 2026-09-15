# Suqly P1 Phase — Master Claude Code Prompt (TEMPLATE)
**Build Mode**: 100% Automated | No Questions | Minimal Tokens | S01 Foundation + P1 Features

---

## USAGE INSTRUCTIONS

**BEFORE RUNNING:**
1. Verify S01 is complete (check docs/project-status.md)
2. Review S01 output (git log, website loads, tests pass)
3. Replace placeholders in this template:
   - `[GIT_S01_COMMIT_HASH]` → last S01 commit hash (e.g., a1b2c3d4)
   - `[SUQLY_DOMAIN]` → suqly.com (or custom)
   - `[DEPLOYMENT_VPS]` → 194.164.151.202 (or custom)

**THEN:**
- Copy "## SEND THIS TO CLAUDE CODE" section
- Paste to Claude Code
- Click Run

---

## SEND THIS TO CLAUDE CODE (Copy Everything Below)

```
OUTPUT: Working Suqly P1 goods marketplace (S01 + P1 features).
NO QUESTIONS. Build continuously from [GIT_S01_COMMIT_HASH] commit (checkout before starting).
Assume all decisions are final. AI outputs treated as production-ready drafts.

CONTEXT: S01 Foundation complete (verified at commit [GIT_S01_COMMIT_HASH]).
  - Website loads at http://localhost:3000
  - API at http://localhost:3001
  - PostgreSQL with 8 tables, 100 synthetic listings
  - Tests passing (25/25)
  - CI/CD green

NOW BUILDING: P1 Phase (Goods MVP, Real Messaging, Real Image Compression, SMS Integration)

## PHASE P1: GOODS MVP + MESSAGING (Week 1–4 of P1, Days 8–11 total)

GOALS:
  ✅ Real image compression (Sharp WebP, dual thumbnails)
  ✅ Real Wasabi S3 upload (listings have real image URLs)
  ✅ Real-time messaging (Socket.io @SubscribeMessage, WebSocket events)
  ✅ SMS OTP actually sent (Twilio integration, real users can login)
  ✅ Email notifications (SendGrid for transactional emails)
  ✅ Push notifications (Firebase Cloud Messaging)
  ✅ Seller reconfirmation workflow (7-day cycle, auto-expire, badge)
  ✅ Evidence badges (verified seller, photos confirmed, defects disclosed)
  ✅ Seller dashboard analytics (views, contacts, conversion funnel)
  ✅ Moderation queue automation (auto-flag spam, AI defect detection stub)
  ✅ Rate limiting enforcement (actual 429 responses)
  ✅ Real-time notifications (Socket.io buyer + seller alerts)

NO ERRORS. NO WARNINGS. Production-ready P1.

## BREAKING CHANGES FROM S01 → P1

None. P1 is purely additive (no schema breaking changes, no route rewrites).
All S01 tests still pass. All S01 endpoints still work.

## NEW DATABASE TABLES + COLUMNS

TypeORM migrations (database/migrations/004-p1-schema.sql):

```sql
-- Add columns to users (seller metrics)
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  total_listings INT DEFAULT 0,
  active_listings INT DEFAULT 0,
  response_time_hours DECIMAL(5,2),
  completion_rate DECIMAL(3,1),
  avg_rating DECIMAL(2,1);

-- Add columns to listings (reconfirmation + metadata)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS
  reconfirm_due_at TIMESTAMP,
  reconfirm_sent_at TIMESTAMP,
  reconfirm_confirmed_at TIMESTAMP,
  seller_confirmed BOOLEAN DEFAULT FALSE,
  defect_disclosed BOOLEAN DEFAULT FALSE,
  asking_price_original DECIMAL(12,2),
  price_reduced_count INT DEFAULT 0;

-- New table: Reconfirmation log
CREATE TABLE IF NOT EXISTS reconfirmation_log (
  id BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sent_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  status VARCHAR(50), -- 'pending', 'confirmed', 'expired'
  INDEX idx_listing_id (listing_id)
);

-- New table: Message read receipts
ALTER TABLE messages ADD COLUMN IF NOT EXISTS
  deleted_at TIMESTAMP,
  edited_at TIMESTAMP,
  last_edit_content TEXT;

-- New table: Seller analytics
CREATE TABLE IF NOT EXISTS seller_analytics (
  id BIGSERIAL PRIMARY KEY,
  seller_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  
  views_total INT DEFAULT 0,
  views_unique INT DEFAULT 0,
  messages_received INT DEFAULT 0,
  offers_received INT DEFAULT 0,
  listings_sold INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_seller_id_date (seller_id, date)
);

-- New table: Push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_token VARCHAR(255) UNIQUE NOT NULL,
  
  device_type VARCHAR(50), -- 'web', 'ios', 'android'
  device_name VARCHAR(255),
  
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_id (user_id)
);

COMMIT;
```

## NEW API ENDPOINTS (P1 Only)

### Images
```
POST /api/v1/listings/:id/images
  Input: multipart/form-data, file: File[]
  Output: { success: true, images: [{ id, thumbnailUrl, fullUrl }] }
  Auth: JWT (owner of listing)
  Do: Compress with Sharp (resize 400px + 1200px), upload to Wasabi, return CDN URLs

DELETE /api/v1/images/:id
  Output: { success: true }
  Auth: JWT (owner of listing)
  Do: Delete from Wasabi + PostgreSQL

GET /api/v1/listings/:id/images
  Output: { images: [{ id, thumbnailUrl, fullUrl }] }
  Auth: None (public)
  Do: Return listing images with CDN URLs
```

### Messages (Real-time)
```
WebSocket /socket.io

@SubscribeMessage('message:send')
  Payload: { listingId, recipientId, content }
  Output: { success: true, message: { id, content, createdAt } }
  Auth: JWT token in query
  Do: Store in PostgreSQL, broadcast to recipient via Socket.io, send push notification

@SubscribeMessage('message:read')
  Payload: { messageId }
  Output: { success: true }
  Do: Mark message as read, update read_at timestamp, emit 'message:read' event to sender

GET /api/v1/messages/conversations
  Output: { conversations: [{ listingId, userId, lastMessage, unreadCount }] }
  Auth: JWT
  Do: Return list of active conversations (unique listing + user pairs)

GET /api/v1/messages/:conversationId
  Output: { messages: [{ id, sender, content, createdAt, isRead }], limit 50 }
  Auth: JWT
  Pagination: ?offset=0&limit=50
  Do: Return paginated messages for listing + user
```

### Seller Analytics
```
GET /api/v1/sellers/:id/dashboard
  Output: { seller: { name, rating, listings }, analytics: { views, messages, offers, soldCount } }
  Auth: None (public)
  Do: Return seller profile + stats

GET /api/v1/sellers/:id/analytics?period=7days
  Output: { period, dates: [{ date, views, messages, offers }] }
  Auth: JWT (owner only)
  Params: period = '7days', '30days', '90days'
  Do: Return time-series analytics for dashboard
```

### Reconfirmation (Seller Action)
```
POST /api/v1/listings/:id/confirm
  Input: { confirmed: true }
  Output: { success: true, nextConfirmAt: "2024-10-15T..." }
  Auth: JWT (owner of listing)
  Do: Set seller_confirmed = true, reconfirm_confirmed_at = NOW(), next reconfirm = NOW() + 7 days

GET /api/v1/listings/:id/reconfirm-status
  Output: { status: 'confirmed', daysUntilExpire: 6, badge: 'Confirmed today' }
  Auth: None (public)
  Do: Calculate reconfirmation status (show on listing card)
```

### Moderation
```
GET /api/v1/admin/moderation/queue
  Output: { queue: [{ id, listingId, reason, flaggedAt, status }], total: 42 }
  Auth: JWT (staff role only)
  Pagination: ?page=1&limit=20
  Do: Return flagged listings awaiting review

PUT /api/v1/admin/moderation/:id/approve
  Output: { success: true }
  Auth: JWT (staff role only)
  Do: Set moderation.status = 'approved', listing.status = 'active'

PUT /api/v1/admin/moderation/:id/reject
  Input: { reason: "Prohibited item" }
  Output: { success: true }
  Auth: JWT (staff role only)
  Do: Set moderation.status = 'rejected', listing.status = 'rejected', send email to user
```

## BACKEND CHANGES (S01 → P1)

### 1. Image Upload Service (Real)
File: backend/src/listings/image-upload.service.ts

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

@Injectable()
export class ImageUploadService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.WASABI_REGION || 'ap-singapore',
      credentials: {
        accessKeyId: process.env.WASABI_ACCESS_KEY,
        secretAccessKey: process.env.WASABI_SECRET_KEY,
      },
      endpoint: process.env.WASABI_ENDPOINT,
    });
  }

  async uploadListingImages(files: Express.Multer.File[], listingId: number) {
    const uploadedImages = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        throw new BadRequestException('File exceeds 10MB limit');
      }

      // Compress thumbnail (400×400, WebP quality 70)
      const thumbnail = await sharp(file.buffer)
        .rotate() // Auto-orient EXIF
        .resize(400, 400, { fit: 'cover' })
        .webp({ quality: 70 })
        .toBuffer();

      // Compress full image (1200×1200, WebP quality 80)
      const full = await sharp(file.buffer)
        .rotate()
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const filename = `${Date.now()}-${listingId}-${Math.random().toString(36).substring(7)}`;

      // Upload to Wasabi
      await this.s3Client.send(new PutObjectCommand({
        Bucket: process.env.WASABI_BUCKET,
        Key: `listings/${filename}-thumb.webp`,
        Body: thumbnail,
        ContentType: 'image/webp',
        Metadata: {
          'Cache-Control': 'public, max-age=31536000',
          listing_id: listingId.toString(),
        },
      }));

      await this.s3Client.send(new PutObjectCommand({
        Bucket: process.env.WASABI_BUCKET,
        Key: `listings/${filename}-full.webp`,
        Body: full,
        ContentType: 'image/webp',
        Metadata: { 'Cache-Control': 'public, max-age=31536000' },
      }));

      uploadedImages.push({
        thumbnailUrl: `https://images.suqly.com/listings/${filename}-thumb.webp`,
        fullUrl: `https://images.suqly.com/listings/${filename}-full.webp`,
        sizeBytes: full.length,
      });
    }

    return uploadedImages;
  }

  async deleteImage(imageUrl: string) {
    const filename = imageUrl.split('/').pop().replace('.webp', '');
    
    await this.s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.WASABI_BUCKET,
      Key: `listings/${filename}.webp`,
    }));
  }
}
```

### 2. Messages Gateway (Real-time WebSocket)
File: backend/src/messages/messages.gateway.ts

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  namespace: 'socket.io',
  cors: { origin: process.env.FRONTEND_URL },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    const userId = this.extractUserIdFromToken(client.handshake.query.token);
    if (!userId) {
      client.disconnect();
      return;
    }
    client.data.userId = userId;
    console.log(`User ${userId} connected`);
  }

  handleDisconnect(client: Socket) {
    console.log(`User ${client.data.userId} disconnected`);
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { listingId: number; recipientId: number; content: string },
  ) {
    const senderId = client.data.userId;

    // Save message to DB
    const message = await this.messagesService.create({
      listingId: data.listingId,
      senderId,
      recipientId: data.recipientId,
      content: data.content,
    });

    // Broadcast to recipient (if online)
    this.server.to(`user:${data.recipientId}`).emit('message:new', {
      id: message.id,
      sender: { id: senderId },
      content: message.content,
      createdAt: message.createdAt,
    });

    // Send push notification to recipient
    await this.messagesService.sendPushNotification(
      data.recipientId,
      `New message from seller`,
      message.content,
    );

    return { success: true, messageId: message.id };
  }

  @SubscribeMessage('message:read')
  async handleReadMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: number },
  ) {
    await this.messagesService.markAsRead(data.messageId);
    
    // Notify sender (if online)
    this.server.emit('message:read', { messageId: data.messageId });

    return { success: true };
  }

  private extractUserIdFromToken(token: string): number | null {
    // Decode JWT, return user ID or null
    // (implementation: use jwt.verify from @nestjs/jwt)
    return null; // Stub
  }
}
```

### 3. Reconfirmation Service
File: backend/src/listings/reconfirmation.service.ts

```typescript
import { Injectable, Cron, CronExpression } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from './listings.entity';

@Injectable()
export class ReconfirmationService {
  constructor(
    @InjectRepository(Listing) private listingsRepository: Repository<Listing>,
  ) {}

  // Run daily at 2 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async processReconfirmations() {
    // 1. Find listings where reconfirm_due_at <= NOW() and NOT confirmed yet
    const overdueListings = await this.listingsRepository.find({
      where: {
        status: 'active',
        sellerConfirmed: false,
        reconfirmDueAt: LessThanOrEqual(new Date()),
      },
    });

    for (const listing of overdueListings) {
      // 2. Set status to 'expired'
      listing.status = 'expired';
      await this.listingsRepository.save(listing);

      // 3. Send email to seller: "Your listing expired, repost to continue"
      // (Email implementation)
    }

    // 4. Find listings due for reconfirmation soon (next 1 day)
    const dueSoon = await this.listingsRepository.find({
      where: {
        status: 'active',
        sellerConfirmed: true,
        reconfirmDueAt: Between(new Date(), addDays(new Date(), 1)),
      },
    });

    for (const listing of dueSoon) {
      // 5. Send SMS + email: "Confirm your listing is still available"
      // (SMS implementation)
    }
  }

  async confirmListing(listingId: number) {
    const listing = await this.listingsRepository.findOne(listingId);
    
    listing.sellerConfirmed = true;
    listing.reconfirmConfirmedAt = new Date();
    listing.reconfirmDueAt = addDays(new Date(), 7);
    listing.status = 'active';
    
    await this.listingsRepository.save(listing);
    
    return { nextConfirmAt: listing.reconfirmDueAt };
  }
}
```

### 4. Seller Analytics Service
File: backend/src/sellers/seller-analytics.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SellerAnalyticsService {
  constructor(
    @InjectRepository(SellerAnalytics)
    private analyticsRepository: Repository<SellerAnalytics>,
  ) {}

  async getDashboard(sellerId: number) {
    // Aggregate views, messages, offers, conversions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analytics = await this.analyticsRepository.findOne({
      where: { sellerId, date: today },
    });

    return {
      viewsTotal: analytics?.viewsTotal || 0,
      messagesReceived: analytics?.messagesReceived || 0,
      offersReceived: analytics?.offersReceived || 0,
      soldCount: analytics?.listingsSold || 0,
    };
  }

  async recordView(sellerId: number, listingId: number) {
    // Increment daily view counter
    // (Batch these updates to avoid DB hammering)
  }

  async recordMessage(sellerId: number) {
    // Increment daily message counter
  }
}
```

### 5. Moderation Service Automation
File: backend/src/moderation/moderation.service.ts (add to existing)

```typescript
async autoFlagListings() {
  // Run daily: check for common spam patterns
  const listings = await this.listingsRepository.find({
    where: { status: 'pending_review' },
  });

  for (const listing of listings) {
    const flags = [];

    // 1. Phone number in title (common spam tactic)
    if (/\d{7,}/g.test(listing.title)) {
      flags.push('phone_in_title');
    }

    // 2. External links in description
    if (/(https?|www)/i.test(listing.description)) {
      flags.push('external_link');
    }

    // 3. Suspicious keywords
    if (/prescription|viagra|crypto|mlm/i.test(listing.description)) {
      flags.push('prohibited_keyword');
    }

    if (flags.length > 0) {
      const moderationEntry = this.moderationRepository.create({
        listingId: listing.id,
        reason: flags.join(','),
        status: 'pending',
      });
      await this.moderationRepository.save(moderationEntry);
    }
  }
}
```

## FRONTEND CHANGES (S01 → P1)

### 1. Image Upload Component (Real Compression)
File: frontend/components/listings/ImageUpload.tsx

```typescript
'use client';

import { useState, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import Image from 'next/image';

export function ImageUpload({ listingId }: { listingId: number }) {
  const { setValue } = useFormContext();
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragAndDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const addFiles = async (files: File[]) => {
    setUploading(true);

    for (const file of files) {
      // Show preview immediately (user feedback)
      const preview = URL.createObjectURL(file);
      setImages((prev) => [...prev, { file, preview }]);

      // Upload to backend
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/v1/listings/${listingId}/images`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (response.ok) {
        const { images: uploaded } = await response.json();
        // Store image URLs in form state
        setValue('images', uploaded);
      }
    }

    setUploading(false);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDragAndDrop}
      className="border-2 border-dashed p-8 rounded-lg text-center"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => addFiles(Array.from(e.target.files || []))}
        className="hidden"
      />
      <button type="button" onClick={() => fileInputRef.current?.click()}>
        {uploading ? 'Uploading...' : 'Drop images or click to upload'}
      </button>

      {/* Preview grid */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {images.map((img) => (
          <Image
            key={img.preview}
            src={img.preview}
            alt="Preview"
            width={100}
            height={100}
            className="object-cover"
          />
        ))}
      </div>
    </div>
  );
}
```

### 2. Real-time Messages Component
File: frontend/components/messages/ChatThread.tsx

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';

export function ChatThread({ listingId, recipientId }: Props) {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      query: { token: getToken() },
      reconnection: true,
    });

    newSocket.on('message:new', (message) => {
      setMessages((prev) => [...prev, message]);
      // Play notification sound
      new Audio('/notification.mp3').play();
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !socket) return;

    socket.emit('message:send', {
      listingId,
      recipientId,
      content: input,
    });

    setInput('');
  };

  return (
    <div>
      <div className="messages space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.senderId === userId ? 'self' : 'other'}>
            {msg.content}
          </div>
        ))}
      </div>

      <div className="input-group mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
```

### 3. Seller Dashboard (Real Analytics)
File: frontend/app/[lang]/account/page.tsx

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function SellerDashboard() {
  const { data: dashboard } = useQuery({
    queryKey: ['seller', 'dashboard'],
    queryFn: () => fetch('/api/v1/sellers/me/dashboard').then((r) => r.json()),
  });

  const { data: analytics } = useQuery({
    queryKey: ['seller', 'analytics', '7days'],
    queryFn: () =>
      fetch('/api/v1/sellers/me/analytics?period=7days').then((r) => r.json()),
  });

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="card">
        <div className="label">Views</div>
        <div className="value">{dashboard?.viewsTotal}</div>
      </div>

      <div className="card">
        <div className="label">Messages</div>
        <div className="value">{dashboard?.messagesReceived}</div>
      </div>

      <div className="card">
        <div className="label">Offers</div>
        <div className="value">{dashboard?.offersReceived}</div>
      </div>

      <div className="card">
        <div className="label">Sold</div>
        <div className="value">{dashboard?.soldCount}</div>
      </div>

      {/* Time-series chart */}
      <div className="col-span-4">
        <LineChart data={analytics?.dates || []}>
          <CartesianGrid />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="views" stroke="#8884d8" />
          <Line type="monotone" dataKey="messages" stroke="#82ca9d" />
        </LineChart>
      </div>
    </div>
  );
}
```

### 4. Reconfirmation Badge
File: frontend/components/listings/ListingCard.tsx (add to existing)

```typescript
{/* Show reconfirmation badge */}
{listing.sellerConfirmed && (
  <div className="badge bg-green-100 text-green-800">
    ✓ Confirmed today
  </div>
)}

{listing.daysUntilConfirm <= 2 && (
  <div className="badge bg-yellow-100 text-yellow-800">
    ⚠️ Expires in {listing.daysUntilConfirm} days
  </div>
)}
```

## NEW DEPENDENCIES (Add to package.json)

### Backend
```
firebase-admin@^12.0.0      # Push notifications
nodemailer@^6.9.0           # Email templates (transactional)
@sendgrid/mail@^7.7.0       # SendGrid API
twilio@^3.94.0              # SMS OTP (upgrade from S01 stub)
bull@^4.11.0                # Background jobs (already in S01, enhance here)
date-fns@^2.30.0            # Date calculations (reconfirm schedule)
```

### Frontend
```
recharts@^2.10.0            # Charts for analytics dashboard (already in S01)
```

## ENVIRONMENT VARIABLES (Add to .env)

```
# Twilio (SMS OTP actually sending)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# SendGrid (Transactional emails)
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=support@suqly.com

# Firebase (Push notifications)
FIREBASE_PROJECT_ID=suqly-prod
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# Wasabi (S3, already in S01 but verify credentials)
WASABI_ACCESS_KEY=...
WASABI_SECRET_KEY=...
WASABI_BUCKET=suqly-images
WASABI_ENDPOINT=https://s3.ap-singapore.wasabisys.com
WASABI_REGION=ap-singapore

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## TESTING (P1 Phase)

New test files:
  - backend/src/image-upload.service.spec.ts (test compression, Wasabi mock)
  - backend/src/messages.gateway.spec.ts (test Socket.io events)
  - backend/src/reconfirmation.service.spec.ts (test expiry logic)
  - frontend/components/messages/ChatThread.spec.tsx (test message send/receive)
  - frontend/components/listings/ImageUpload.spec.tsx (test file drag-drop)

All S01 tests still pass (backward compatible).

Total P1 tests: 15 new + 25 S01 = 40 tests
Coverage target: >75%

## VERIFICATION CHECKLIST (P1)

### Images
  ☐ Upload 5 photos to listing (verify compress to <500KB each)
  ☐ View listing detail (verify images load from images.suqly.com CDN)
  ☐ Mobile: Thumbnails load first, full images lazy-load
  ☐ Storage: Wasabi bucket shows <100GB for 50K listings × 4 images

### Messaging (Real-time)
  ☐ Open listing with 2 browsers (buyer + seller)
  ☐ Buyer sends message → seller sees in real-time (<100ms)
  ☐ Seller replies → buyer gets Socket.io event + push notification
  ☐ Message stored in PostgreSQL (verify: SELECT * FROM messages)
  ☐ Unread count shows (verify: message:read event updates count)

### SMS (Twilio)
  ☐ POST /auth/login { phone: "+971501234567" }
  ☐ Check SMS on phone (should receive 6-digit OTP)
  ☐ Enter OTP: POST /auth/verify-otp { phone, code }
  ☐ Response: { token, user } (JWT valid, can auth subsequent requests)

### Seller Reconfirmation
  ☐ Listing created by seller
  ☐ After 7 days: check reconfirm_due_at in DB
  ☐ POST /listings/:id/confirm (seller confirms)
  ☐ Verify: reconfirm_confirmed_at updated, next 7 days scheduled
  ☐ UI shows "Confirmed today" badge
  ☐ After 14 days (if not confirmed): status → 'expired'

### Analytics Dashboard
  ☐ POST /listings (create test listing)
  ☐ View listing (simulate traffic in logs)
  ☐ GET /sellers/me/dashboard → { viewsTotal, messagesReceived, etc. }
  ☐ GET /sellers/me/analytics?period=7days → time-series data
  ☐ Frontend dashboard shows charts (Recharts)

### Moderation
  ☐ Create listing with phone in title (e.g., "iPhone 13 - Call 0501234567")
  ☐ Auto-flag detects: reason = 'phone_in_title'
  ☐ Listing in moderation queue
  ☐ Admin reviews: PUT /admin/moderation/:id/approve (listing active) or reject
  ☐ User receives email: approval or rejection notice

### Tests
  ☐ npm run test → 40/40 passed
  ☐ Coverage: >75%
  ☐ All S01 tests still pass (no regression)

### CI/CD
  ☐ Git push → GitHub Actions runs
  ☐ All checks pass (lint, build, test, migrations)
  ☐ Ready for deployment

## PERFORMANCE TARGETS (P1)

  - Homepage load: <2s (P50), <5s (P95)
  - Image gallery: <1s (lazy-load thumbnails first)
  - Message send: <200ms (real-time latency)
  - Search: <1s (no full indexing yet, filter only)
  - Lighthouse mobile: >90 performance, >95 accessibility

## KNOWN LIMITATIONS (By Design, P1)

  ❌ No AI photo-to-listing draft (P2)
  ❌ No smart search (P2, using Claude API)
  ❌ No video upload (P2, Cloudinary)
  ❌ No map view (P2, Mapbox)
  ❌ No OpenSearch indexing (still empty, filter on SQL)
  ❌ No AI defect detection (P3, Vision API)
  ❌ No escrow/payments (P3, Stripe Connect)
  ❌ No reviews/ratings (P3, table exists but endpoints not built)
  ❌ No shipping integrations (P3, SMSA Express)

## EXECUTION PLAN (P1 Phase)

STEP 1: Setup (10 min)
  ☐ Checkout S01 commit: git checkout [GIT_S01_COMMIT_HASH]
  ☐ Create branch: git checkout -b p1-phase
  ☐ Create migration: database/migrations/004-p1-schema.sql (paste above)
  ☐ Run migrate: npm run typeorm:migrate

STEP 2: Backend Services (45 min)
  ☐ Image upload service (real Sharp compression + Wasabi upload)
  ☐ Messages gateway (WebSocket @SubscribeMessage handlers)
  ☐ Reconfirmation service (cron job, expire logic)
  ☐ Seller analytics service (views, messages, offers tracking)
  ☐ Moderation automation (auto-flag spam patterns)

STEP 3: Backend Endpoints (30 min)
  ☐ Image endpoints (POST/DELETE /api/v1/listings/:id/images)
  ☐ Message endpoints (GET /messages/conversations, GET /messages/:id)
  ☐ Seller endpoints (GET /sellers/:id/dashboard, /analytics)
  ☐ Reconfirm endpoint (POST /listings/:id/confirm)
  ☐ Admin endpoints (GET /admin/moderation/queue, PUT approve/reject)

STEP 4: Frontend Components (30 min)
  ☐ ImageUpload (drag-drop, preview, compression feedback)
  ☐ ChatThread (real-time Socket.io, message history)
  ☐ SellerDashboard (analytics charts, stats)
  ☐ ReconfirmationBadge (status indicator)
  ☐ ModerationQueue (admin staff UI)

STEP 5: Integration & Testing (30 min)
  ☐ Update form flows to use new image upload
  ☐ Update message inbox to use WebSocket
  ☐ Update account dashboard with real analytics
  ☐ Write 15 new tests (image, messages, reconfirm, analytics)
  ☐ Run full test suite: npm run test (40/40 passing)

STEP 6: Documentation (15 min)
  ☐ Update docs/api.md (new endpoints)
  ☐ Update docs/project-status.md (P1 complete, blockers, next)
  ☐ Create docs/messaging.md (WebSocket guide)
  ☐ Create docs/reconfirmation.md (seller workflow)

STEP 7: Verification (20 min)
  ☐ Test all checklist items (Images, Messaging, SMS, Reconfirm, Analytics, Moderation)
  ☐ Load test: 100 concurrent messages via Socket.io
  ☐ Mobile test: responsive images, message thread on mobile
  ☐ Lighthouse: >90 performance

STEP 8: Deployment (10 min)
  ☐ Merge to main: git merge p1-phase
  ☐ Git push: GitHub Actions runs CI/CD
  ☐ If green: ready for production deployment
  ☐ Update docs/project-status.md: P1 ✅ COMPLETED

## GIT WORKFLOW (P1)

Commits (one per feature):
  ☐ "feat(images): Real Sharp compression + Wasabi upload"
  ☐ "feat(messages): WebSocket real-time messaging"
  ☐ "feat(reconfirm): 7-day seller confirmation cycle"
  ☐ "feat(analytics): Seller dashboard with charts"
  ☐ "feat(moderation): Auto-flag spam patterns"
  ☐ "test(p1): Add 15 new tests, >75% coverage"
  ☐ "docs(p1): Update API, schema, workflows"
  ☐ "P1: Phase complete, verified, ready for P2"

Total commits: 8–12

## PROJECT STATUS UPDATE (P1 Complete)

File: docs/project-status.md

```
## P1 PHASE: GOODS MVP + MESSAGING (COMPLETED ✅)

**Date**: [TODAY + 4 days from S01 start]
**Duration**: 4 days (accelerated with Claude Code)

### Deliverables
- ✅ Real image compression (Sharp WebP, 93% space savings)
- ✅ Wasabi S3 upload (CDN URLs, Cloudflare caching)
- ✅ Real-time messaging (Socket.io, <200ms latency)
- ✅ SMS OTP actually sent (Twilio integration)
- ✅ Email notifications (SendGrid transactional)
- ✅ Push notifications (Firebase Cloud Messaging)
- ✅ Seller reconfirmation (7-day cycle, auto-expire, badge)
- ✅ Evidence badges (verified, photos confirmed)
- ✅ Seller analytics (views, messages, offers, sales)
- ✅ Moderation automation (spam detection, auto-flag)
- ✅ Real-time notifications (Socket.io events)

### Test Results
- Unit tests: 40/40 passed ✅
- Coverage: 78%
- Load test: 100 concurrent WebSocket connections ✅
- Mobile responsiveness: Verified on iPhone + Android

### Known Issues (None blocking)
- None

### Next Task: P2 PHASE
Entry point: Send `prompts/03-phase-p2.txt` to Claude Code
- [ ] Property category (off-plan, DLD badges)
- [ ] Motors category (specs, service history)
- [ ] Jobs category (CV builder, ATS)
- [ ] Services category (provider portfolios)
- [ ] Video upload + processing (Cloudinary)
- [ ] Map view (Mapbox + PostGIS queries)
- [ ] AI photo-to-listing draft (Claude Vision)
- [ ] Smart search (Claude structured output)
- [ ] Comparable pricing insights
- [ ] Advanced analytics (Metabase dashboards)

### How to Preview
1. docker-compose up
2. cd backend && npm run start:dev
3. cd frontend && npm run dev
4. http://localhost:3000
5. Send test message: Open 2 browsers, send message real-time
6. Upload image: Verify compression + CDN URL
7. View dashboard: Check analytics charts

### Blockers
None. P1 is complete and verified.
```

---

## EXECUTION RULES (P1)

DO NOT ASK QUESTIONS. All decisions final:
  - Image compression: Sharp WebP, 70–80 quality (final)
  - Storage: Wasabi (final)
  - Messaging: Socket.io WebSocket (final)
  - SMS: Twilio (final)
  - Email: SendGrid (final)
  - Reconfirm: 7-day cycle (final)

IF BLOCKED: Check git log + docs/ for context. If still blocked, skip with "// TODO in P2" + log to project-status.md.

BACKWARD COMPATIBILITY: All S01 features must still work. P1 is purely additive (no schema breaking changes, no route rewrites).

TOKEN EFFICIENCY:
  - Reuse S01 patterns (don't duplicate code)
  - Reference backend/src/listings/listings.service.ts as pattern (use same style)
  - Batch database updates (don't increment per request)
  - No debug logging (strip before commit)

READY. Build P1 foundation (Real images, real messaging, real SMS).
Output: Working goods marketplace (localhost:3000), 50+ listings with images, real-time messaging between buyer/seller, SMS logins, seller dashboard analytics, tests passing, CI/CD green, project-status.md marked P1 complete.
```

---

## HOW TO USE THIS TEMPLATE

1. After S01 completes (verified, tests pass)
2. Find S01 commit hash: `git log --oneline | head -1`
3. Copy-paste this P1 template
4. Replace: `[GIT_S01_COMMIT_HASH]` with actual commit hash
5. Replace: `[SUQLY_DOMAIN]` and `[DEPLOYMENT_VPS]` if custom
6. Send to Claude Code
7. Wait 4 days for P1 to complete

---

## Subsequent Phases (P2, P3, P4)

Same format as P1. Create new prompts by:
1. Copy this template
2. Change "PHASE P1" → "PHASE P2"
3. Update GOALS: (new features for P2)
4. Update DATABASE: (new tables)
5. Update ENDPOINTS: (new routes)
6. Update BACKEND CHANGES: (new services)
7. Update FRONTEND CHANGES: (new components)
8. Update VERIFICATION CHECKLIST: (P2-specific tests)
9. Update PROJECT STATUS: (P2 completion tracking)

Pattern repeats: S01 → P1 → P2 → P3 → P4 (5 phases total, 20–30 days end-to-end)

---

**This template ensures consistency across all phases. No reinventing structure, same automation approach, same zero-questions execution.**

**Cost**: P1 build ≈ $200–300 Claude API tokens (much cheaper than dev time)

**Timeline**: 4 days for P1 (vs 2 weeks with manual dev)

**Quality**: Production-ready, tested, documented, CI/CD passing

Go build. 🚀
