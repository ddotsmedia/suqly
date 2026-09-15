# Suqly System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Client Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser (Chrome, Safari, Firefox)                           │
│  ├─ HTML/CSS/JavaScript (Next.js 15)                             │
│  └─ WebSocket Connection (Socket.io)                             │
└──────────────────┬──────────────────────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Cloudflare CDN (Production) / Local (Dev)                       │
│  ├─ CORS, CSRF Protection                                        │
│  ├─ Rate Limiting                                                │
│  └─ SSL/TLS Termination                                          │
└──────────────────┬──────────────────────────────────────────────┘
                   │ HTTP/WebSocket
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Application Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  NestJS 10 Backend (Node.js)                                     │
│  ├─ Controllers (REST endpoints)                                  │
│  │  ├─ /auth (OTP, JWT)                                           │
│  │  ├─ /users (profiles)                                          │
│  │  ├─ /listings (CRUD)                                           │
│  │  ├─ /messages (REST + WebSocket gateway)                       │
│  │  └─ /moderation (admin)                                        │
│  │                                                                │
│  ├─ Services (Business Logic)                                     │
│  │  ├─ AuthService                                                │
│  │  ├─ UsersService                                               │
│  │  ├─ ListingsService                                            │
│  │  ├─ MessagesService                                            │
│  │  └─ ModerationService                                          │
│  │                                                                │
│  ├─ Guards & Middleware                                           │
│  │  ├─ JwtGuard (route protection)                                │
│  │  ├─ RolesGuard (admin access)                                  │
│  │  ├─ RateLimitMiddleware                                        │
│  │  └─ ErrorHandling                                              │
│  │                                                                │
│  └─ WebSocket Gateway (Socket.io)                                │
│     ├─ Messaging infrastructure                                   │
│     ├─ Real-time presence                                         │
│     └─ Typing indicators                                          │
└──────────────┬───────────────────────────────────────────────────┘
               │
    ┌──────────┼──────────┬──────────┬──────────┐
    │          │          │          │          │
    ▼          ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐
│ Data   │ │ Cache  │ │ Search │ │ Message │ │Messaging │
│ Layer  │ │ Layer  │ │ Layer  │ │ Queue   │ │Services  │
├────────┤ ├────────┤ ├────────┤ ├─────────┤ ├──────────┤
│PostgreSQL│ │ Redis  │ │OpenSearch││ Bull  │ │  Twilio  │
│ + PostGIS │ │        │ │        │ │Queue  │ │SendGrid  │
│        │ │        │ │        │ │        │ │Firebase  │
└────────┘ └────────┘ └────────┘ └─────────┘ └──────────┘
```

---

## Component Architecture

### Frontend (Next.js 15)

```
app/
├── layout.tsx                  # Root layout (RTL, i18n providers)
├── page.tsx                    # Emirate selector & language
├── [lang]/                     # Language-scoped routing
│   ├── layout.tsx              # Language wrapper
│   ├── page.tsx                # Home page (browse listings)
│   ├── listings/
│   │   ├── page.tsx            # Listing list with filters
│   │   ├── [id]/page.tsx       # Listing detail view
│   │   └── create/page.tsx     # Create listing form
│   └── account/
│       ├── page.tsx            # Dashboard
│       ├── messages/page.tsx   # Message inbox
│       └── settings/page.tsx   # User settings
│
├── components/
│   ├── common/
│   │   ├── Header.tsx          # Navigation bar
│   │   ├── Footer.tsx          # Footer
│   │   ├── LanguageToggle.tsx  # EN/AR switcher
│   │   └── RTLProvider.tsx     # RTL context
│   ├── listings/
│   │   ├── ListingCard.tsx     # Grid item
│   │   ├── ListingDetail.tsx   # Full listing view
│   │   ├── SearchFilters.tsx   # Filter panel
│   │   ├── ListingForm.tsx     # Create/edit form
│   │   └── ImageGallery.tsx    # Image carousel
│   ├── messages/
│   │   ├── ChatThread.tsx      # Conversation view
│   │   └── MessageInput.tsx    # Message composer
│   └── moderation/
│       ├── FlagButton.tsx      # Report button
│       └── ModerationQueue.tsx # Admin panel
│
└── lib/
    ├── api.ts                  # HTTP client
    ├── auth.ts                 # Auth helpers
    ├── i18n.ts                 # Translations
    ├── hooks.ts                # Custom hooks
    └── socket.ts               # Socket.io setup
```

**Technology Stack:**
- Next.js 15 (App Router, SSR/SSG)
- React 19 (Server/Client Components)
- TypeScript 5 (Type safety)
- Tailwind CSS (Utility-first styling)
- React Hook Form + Zod (Form validation)
- TanStack Query (Server state)
- Zustand (Client state)
- Socket.io Client (Real-time)
- next-i18next (Bilingual support)

---

### Backend (NestJS 10)

```
src/
├── main.ts                    # Bootstrap & Swagger setup
├── app.module.ts              # Root module (all imports)
├── app.controller.ts          # Health/info endpoints
├── app.service.ts             # App-level services
│
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts     # POST /auth/login, /verify-otp
│   ├── auth.service.ts        # OTP, JWT, session management
│   ├── jwt.strategy.ts        # Passport JWT strategy
│   ├── jwt.guard.ts           # Route protection
│   └── auth.service.spec.ts   # Unit tests
│
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts    # GET/PUT /users/:id
│   ├── users.service.ts       # CRUD, profile, seller stats
│   ├── user.entity.ts         # TypeORM entity
│   └── users.service.spec.ts  # Unit tests
│
├── listings/
│   ├── listings.module.ts
│   ├── listings.controller.ts # /listings CRUD
│   ├── listings.service.ts    # Business logic, search
│   ├── listing.entity.ts      # Main entity
│   ├── listing-image.entity.ts # Image relationship
│   ├── image-upload.service.ts # Sharp/Wasabi stub
│   └── listings.service.spec.ts # Unit tests
│
├── messages/
│   ├── messages.module.ts
│   ├── messages.controller.ts # /messages REST
│   ├── messages.service.ts    # Save, retrieve, read
│   ├── messages.gateway.ts    # Socket.io events
│   ├── message.entity.ts      # TypeORM entity
│   └── messages.service.spec.ts # Unit tests
│
├── moderation/
│   ├── moderation.module.ts
│   ├── moderation.controller.ts # /moderation (admin)
│   ├── moderation.service.ts    # Flag workflow
│   └── moderation-queue.entity.ts
│
├── reviews/
│   ├── review.entity.ts       # (P1+ feature)
│
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   ├── decorators/
│   │   ├── CurrentUser.ts
│   │   └── IsAdmin.ts
│   └── middleware/
│       └── rate-limit.middleware.ts
│
└── config/
    ├── database.config.ts     # TypeORM PostgreSQL
    ├── redis.config.ts        # Redis client
    ├── env.validation.ts      # Joi schema
    └── wasabi.config.ts       # S3 credentials
```

**Technology Stack:**
- NestJS 10 (Opinionated Node.js framework)
- TypeORM 0.3 (ORM for PostgreSQL)
- Passport.js (Authentication)
- @nestjs/jwt (JWT handling)
- @nestjs/websockets + Socket.io (Real-time)
- Swagger/OpenAPI (Documentation)
- Jest (Testing)

---

## Data Flow

### Listing Creation Flow

```
User (Frontend)
    │ [POST /listings] {title, category, emirate, price}
    ▼
ListingsController
    │ [JwtGuard validates token]
    ▼
ListingsService.create()
    │ 1. Create listing entity (status: draft)
    │ 2. Generate slug (title + random suffix)
    │ 3. Save to PostgreSQL
    ▼
Database (PostgreSQL)
    │ INSERT INTO listings (...)
    ▼
Response
    │ {id, slug, status: "draft", ...}
    ▼
User (Frontend)
    │ [Redirect to create/edit page]
    ▼
    [User adds images, description]
    │
    ▼
[POST /listings/:id/publish]
    │
ListingsService.publish()
    │ 1. Validate listing is ready
    │ 2. Set status = "active"
    │ 3. Set publishedAt = NOW()
    │ 4. Set expiresAt = NOW() + 90 days
    │ 5. Save to PostgreSQL
    │
Database
    │ UPDATE listings SET status='active', ...
    │
Response
    │ {status: "active", publishedAt, expiresAt}
    │
User
    │ [Listing now visible in search]
```

### Search & Filter Flow

```
User (Frontend)
    │ GET /listings?emirate=dubai&category=goods&priceMin=100
    ▼
ListingsController.getListings()
    │ Parse query params
    ▼
ListingsService.findAll(filters)
    │ 1. Build TypeORM query
    │ 2. WHERE status = 'active'
    │ 3. AND emirate = 'dubai'
    │ 4. AND category = 'goods'
    │ 5. AND price >= 100
    │ 6. ORDER BY publishedAt DESC
    │ 7. LIMIT 20 OFFSET 0
    ▼
Database (PostgreSQL)
    │ [Uses indexes on emirate, category, status]
    │ SELECT * FROM listings WHERE ...
    │ ├─ ~2-5ms for indexed query
    │ └─ Returns 20 rows + total count
    ▼
Response
    │ {
    │   data: [Listing[], ...],
    │   pagination: {page, limit, total, pages}
    │ }
    ▼
User
    │ [Display in grid]
    │ [Sort by price, date, rating]
```

### Real-time Messaging Flow

```
Buyer (Frontend)
    │
    ├─ [Socket.io connect] → MessagesGateway.afterConnection()
    │  │
    │  ├─ [Socket emit: "join" {userId}] 
    │  │  │
    │  │  ▼
    │  │  Gateway.handleJoin()
    │  │  │ Store user:socket mapping in memory
    │  │  │ {"userId": "socket_id"}
    │  │
    ├─ [User types message]
    │  │
    │  ├─ [Socket emit: "typing" {recipientId, isTyping}]
    │  │  │
    │  │  ▼
    │  │  Gateway.handleTyping()
    │  │  │ if(recipientId is online) {
    │  │  │   send to recipient socket: "user_typing"
    │  │  │ }
    │  │
    ├─ [User sends message]
    │  │
    │  └─ [Socket emit: "message" {listingId, recipientId, content}]
    │     │
    │     ▼
    │     Gateway.handleMessage()
    │     │ 1. Validate sender authenticated
    │     │ 2. MessagesService.createMessage()
    │     │    │ 3. INSERT into messages table
    │     │    │ 4. Set created_at = NOW()
    │     │    ▼
    │     │ Database saves message
    │     │ 
    │     │ 5. Check if recipient online
    │     │    │
    │     │    ├─ If YES: emit to recipient socket
    │     │    │  │ "message" event with content
    │     │    │
    │     │    └─ If NO: notification scheduled
    │     │       (P1: Email/SMS notification)
    │     │
    │     │ 6. Emit back to sender: "message_sent"
    │
    │
Seller (Frontend)
    │ [Receives "message" event in real-time]
    │ [Display in inbox]
    │ [User can see "read at" timestamp]
```

---

## Data Storage & Persistence

### PostgreSQL (Primary Data Store)
```
suqly_dev
├── users (2000+ expected)
├── listings (50,000+ expected)
├── listing_images (500,000+ expected)
├── messages (5,000,000+ expected)
├── moderation_queue (10,000+)
├── saved_searches (100,000+)
└── reviews (100,000+ P1+)

Indexing Strategy:
├── Primary keys (auto)
├── Foreign keys (auto)
├── Search columns (emirate, category, status)
├── Composite (category, emirate)
├── Spatial (precise_location with PostGIS)
└── JSON (filters column in saved_searches)
```

### Redis (Session & Cache)
```
suqly_dev:redis
├── otp:+971501234567 → "123456" (10min TTL)
├── session:token_xyz → {user json} (24hr TTL)
├── rate_limit:ip_1.2.3.4 → count (1min TTL)
└── (P1+) cache:listing:123 → {listing json} (1hr TTL)
```

### OpenSearch (Full-Text Search - P1+)
```
suqly_listings
├── Index mapping: listings
│   ├── title (text + keyword)
│   ├── description (text, Arabic-aware)
│   ├── emirate (keyword)
│   ├── category (keyword)
│   └── price (numeric)
│
└── Ready for:
    ├── Full-text search: "iPhone 14 Pro"
    ├── Faceted filters
    ├── Arabic language support
    └── Boost relevance by freshness
```

### Wasabi S3 (Image Storage - P1+)
```
suqly-listings.s3.wasabisys.com/
├── listings/
│   ├── {id}/
│   │   ├── {id}-main.webp (full)
│   │   ├── {id}-thumb.webp (thumbnail)
│   │   └── {id}-2.webp (additional images)
│   │
│   └── ... (organized by listing ID)
│
Cache: Cloudflare CDN (30-day TTL)
Domain: images.suqly.com (CNAME → Wasabi)
```

---

## Security Architecture

```
┌─────────────────────────────────────────┐
│      HTTPS / TLS 1.2+                   │
│      (Cloudflare in prod)                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  CORS & CSRF Protection                 │
│  ├─ Whitelist origins                   │
│  ├─ CSRF tokens in forms                │
│  └─ SameSite cookies                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Rate Limiting                          │
│  ├─ 100 req/min per IP (global)         │
│  ├─ 5 req/min per IP (auth endpoints)   │
│  └─ Exponential backoff                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Authentication & Authorization         │
│  ├─ SMS OTP (Twilio) → 6-digit code     │
│  ├─ JWT tokens (7-day expiry)           │
│  ├─ Session in Redis (24-hour TTL)      │
│  ├─ JwtGuard on protected routes        │
│  └─ RolesGuard for admin endpoints      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Input Validation & Sanitization        │
│  ├─ Joi schema validation               │
│  ├─ Zod schema validation (frontend)    │
│  ├─ TypeORM parameterized queries       │
│  │  (SQL injection prevention)          │
│  └─ HTML escaping (React auto)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Data Protection                        │
│  ├─ Passwords: bcrypt (10 rounds)       │
│  ├─ Secrets: .env only (never in code)  │
│  ├─ Precise location: private (PostGIS) │
│  │  (Not transmitted to frontend)       │
│  ├─ Public location: approximate text   │
│  └─ API keys: not exposed               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Monitoring & Alerting                  │
│  ├─ Sentry (error tracking)             │
│  ├─ CloudWatch (logs)                   │
│  └─ Prometheus + Grafana (metrics)      │
└─────────────────────────────────────────┘
```

---

## Scalability Considerations

### Current Capacity (S01)
- **Concurrent Users**: ~1,000 (single server)
- **Daily Active Users**: ~100 (MVP phase)
- **Database Connections**: 200 pooled
- **Message Throughput**: ~100 msg/sec
- **Listing Turnover**: ~10 new/hour

### Scaling Strategy (P2+)

**Vertical Scaling:**
- Upgrade VPS: 4GB → 8GB → 16GB RAM
- Increase PostgreSQL connection pool
- Add caching layer (Redis cluster)

**Horizontal Scaling:**
- **Stateless API**: Deploy multiple NestJS instances
- **Load Balancer**: Nginx/Cloudflare
- **Database Replication**: Read replicas for analytics
- **Message Queue**: Bull/RabbitMQ for image processing
- **Search**: OpenSearch cluster (3+ nodes)

**CDN & Caching:**
- Cloudflare for static assets
- Redis for session & hot data
- ElastiCache (AWS) in production

---

## Deployment Architecture

### Development (Local)
```
Docker Compose
├─ PostgreSQL 15
├─ Redis 7
├─ OpenSearch 2.11
├─ NestJS 3001
└─ Next.js 3000
```

### Production (Planned - P1+)
```
VPS (194.164.151.202, Hostinger)
├─ Docker Compose (same as dev)
├─ Nginx (reverse proxy)
├─ PM2 (process manager for NestJS)
├─ GitHub Actions (CI/CD)
└─ Automated deployments (git push → deploy)
```

### Monitoring Stack
```
- Sentry (error tracking)
- Prometheus (metrics)
- Grafana (dashboards)
- CloudWatch (logs)
- Uptime monitoring (Checkly)
```

---

## Decision Rationale

### Technology Choices

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js 15 | SSR, App Router, excellent DX |
| Backend | NestJS 10 | Opinionated, TypeScript-first, scalable |
| Database | PostgreSQL | ACID compliance, PostGIS, mature |
| Cache | Redis | Fast, proven for sessions & pub/sub |
| Search | OpenSearch | Full-text, Arabic support, open-source |
| Storage | Wasabi S3 | Low-cost, AWS-compatible, Dubai region |
| Auth | SMS OTP | Frictionless for UAE market |
| Real-time | Socket.io | Mature WebSocket library |

### Architecture Patterns

| Pattern | Implementation | Reason |
|---------|-----------------|--------|
| MVC | Controllers → Services → Entities | Clean separation of concerns |
| Repository | TypeORM | Abstract database operations |
| JWT | Tokens + Redis session | Scalable, stateless auth |
| Middleware | Rate limiting, logging | Cross-cutting concerns |
| Dependency Injection | NestJS modules | Testability & modularity |
| Server Components | Next.js App Router | Better SEO, reduced JS bundle |

---

## Performance Targets

| Metric | Target | Current (S01) |
|--------|--------|--------|
| Page Load | < 2s | ~1.5s (dev) |
| API Response | < 200ms | ~50-100ms (avg) |
| Search Query | < 500ms | ~100-200ms (no index yet) |
| WebSocket Latency | < 100ms | ~50ms (same network) |
| Database Query | < 50ms | ~10-20ms (indexed) |
| Image Load | < 1s | ~800ms (CDN not used yet) |

---

**Last Updated**: September 15, 2026  
**Version**: 0.1.0  
**Author**: Suqly Engineering
