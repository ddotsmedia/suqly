# Suqly — Claude Code Conventions

## Project Overview
**Suqly**: UAE marketplace. Next.js 15 frontend + NestJS 10 backend. Bilingual EN/AR.  
**Current Phase**: P1 (Real Features) — Image compression, real messaging, SMS/Email, seller stats, moderation.  
**S01 Commit**: `930b761` — Foundation: 32 endpoints, Docker setup, TypeScript strict.

## Backend Architecture
- **Framework**: NestJS 10 (controllers, services, modules)
- **Database**: PostgreSQL 15 via TypeORM, schema at `database/migrations/001-initial-schema.sql`
- **Real-time**: Socket.io gateway at `src/messages/messages.gateway.ts`
- **Auth**: JWT + Passport.js, OTP-based login via SMS
- **Config**: Environment-based, `src/config/database.config.ts`
- **Port**: 3001 (local dev) | 3000 (frontend)
- **External**: Redis (6379), OpenSearch (9200) via Docker Compose

## Frontend Architecture
- **Framework**: Next.js 15 (App Router), React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **State**: Client-side React hooks, server-side mutations
- **Bilingual**: EN (LTR) / AR (RTL) via `i18n` module
- **Port**: 3000 (local dev)

## Code Patterns — Follow Existing Codebase

### Backend: Controllers & Services
```typescript
// controller: thin, validation only
@Post('listings')
@UseGuards(JwtAuthGuard)
async create(@Body() dto: CreateListingDto, @Request() req) {
  return this.listingsService.create(req.user.id, dto);
}

// service: business logic
@Injectable()
export class ListingsService {
  constructor(@InjectRepository(Listing) private repo: Repository<Listing>) {}
  async create(userId: number, data: any) {
    const listing = this.repo.create({...data, userId, status: 'draft'});
    return this.repo.save(listing);
  }
}
```

### TypeORM Entities
- Use decorators: `@Entity`, `@Column`, `@CreateDateColumn`, `@OneToMany`, `@Index`
- Named indexes (TypeORM 0.3+): `@Index('idx_name', ['column'])`
- No array initializations on relations: ❌ `items: Item[] = []`, ✅ `items: Item[]`
- No `synchronize: true` on production (schema via migrations only)

### Database Migrations
- SQL files in `database/migrations/`, run at startup
- Use standard PostgreSQL types (no PostGIS in S01–P1 for simplicity)
- Name indexes explicitly for clarity

### Config & Environment
- Load from `.env`, fall back to sensible defaults
- Use `@nestjs/config` + `ConfigModule.forRoot()`
- Secrets in `.env`, never committed
- Pattern: `process.env.KEY || 'default'`

### Socket.io Gateway
- File: `src/messages/messages.gateway.ts`
- Use `@WebSocketServer()` decorator to access server instance
- Handlers for "join", "message", "typing" events
- Message persistence in database (P1 feature)

### API Documentation
- Swagger at `/api/docs` via `@nestjs/swagger`
- Decorators: `@ApiTags`, `@ApiOperation`, `@ApiResponse`
- Automatic from DTOs (class-validator)

## P1 Phase Implementation

### Feature: Image Compression (Sharp)
**File**: `src/listings/image-compression.service.ts`  
**Task**: Compress listing images on upload to Wasabi S3.  
- Install: `npm install sharp`
- Compress to thumbnails (300px) + full (1200px)
- Return URLs to Wasabi

### Feature: Real Messaging (Socket.io + DB)
**File**: `src/messages/messages.service.ts` (extend), `messages.gateway.ts`  
**Task**: Persist Socket.io messages to PostgreSQL.  
- On "message" event, save to `messages` table
- Load history from DB on room join
- Mark as read via `/messages/:userId` endpoint

### Feature: SMS (Twilio)
**File**: `src/auth/sms.service.ts`  
**Task**: Send OTP via Twilio API.  
- Install: `npm install twilio`
- Replace in-memory OTP store with Twilio SMS calls
- Environment: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE`

### Feature: Email (SendGrid)
**File**: `src/notifications/email.service.ts`  
**Task**: Send transactional emails.  
- Install: `npm install @sendgrid/mail`
- Templates: welcome, listing published, message received, moderation alert
- Environment: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`

### Feature: Seller Stats
**File**: `src/users/seller-stats.service.ts`  
**Task**: Compute seller metrics on listing interactions.  
- Query: count listings, reviews, response time
- Endpoint: `GET /users/:id/stats` (already exists, extend service)
- Metrics: seller_score, response_rate, total_listings, avg_response_time

### Feature: Moderation
**File**: `src/moderation/moderation.service.ts` (extend)  
**Task**: Auto-flag and review listings by rules.  
- Rules: keywords (banned words), image quality (AI), duplicate listings
- Endpoint: `POST /moderation/flag/:listingId` (already exists)
- Queue: Moderation review workflow

## Development Workflow

### Before Each Session
```bash
cd C:\web\Suqly
docker-compose up -d  # Start services
cd backend && npm run start:dev  # Watch mode
cd ../frontend && npm run dev  # Next.js dev
```

### Before Commit
```bash
npm run build  # Compile TS
npm run lint  # ESLint (if configured)
# Test locally
git status && git add -A && git commit -m "Feature: ..."
```

### Model Split
- **Haiku** (default): Controllers, services, entity updates, migrations
- **Sonnet** (complex logic): Auth flows, aggregations, moderation rules, integrations

## API Endpoints (Current)

### Auth
- `POST /auth/login` — OTP request
- `POST /auth/verify-otp` — JWT token
- `POST /auth/logout` — Revoke session

### Listings
- `GET /listings` — Browse with filters
- `POST /listings` — Create (owner only)
- `GET /listings/:id` — Detail
- `PUT /listings/:id` — Edit (owner only)
- `DELETE /listings/:id` — Delete (owner only)
- `POST /listings/:id/publish` — Publish to active
- `POST /listings/:id/images` — Upload images

### Users
- `GET /users/:id` — Profile
- `GET /users/:id/stats` — Seller metrics
- `PUT /users/:id` — Edit profile

### Messages
- `GET /messages/conversations` — List active chats
- `GET /messages/listing/:listingId` — Thread by listing
- `GET /messages/:userId` — Thread with user

### Moderation
- `GET /moderation/queue` — Pending reviews
- `POST /moderation/flag/:listingId` — Flag for review
- `POST /moderation/approve/:flagId` — Approve listing
- `POST /moderation/reject/:flagId` — Reject + notify

### Health
- `GET /health` — Status check
- `GET /info` — API version
- `GET /api/docs` — Swagger UI

## Git & Commits

**S01 Foundation**: `930b761`  
**Branch**: master  
**Commits**: One per feature or group of related fixes.  
**Format**: `Feature: X` or `Fix: X` or `Refactor: X`  
**Body**: What changed and why, not what the code does.

## Secrets & Config
- `.env` — Never committed, local only
- `.env.example` — Template for developers (no secrets)
- Production: Use CI/CD secrets or deployed `.env`

## Useful Commands
```bash
# TypeScript
npm run build  # Compile
npm run start  # Run production build
npm run start:dev  # Watch + NestJS dev

# Database
npm run typeorm migration:generate -- -n MigrationName  # Create
npm run typeorm migration:run  # Apply

# Docker
docker-compose up -d  # Start services
docker-compose logs postgres  # View logs
docker-compose down  # Stop services

# Git
git log --oneline | head  # Recent commits
git diff HEAD~1  # Changes since last commit
```

## Links & Resources
- Swagger UI: http://localhost:3001/api/docs
- Frontend: http://localhost:3000
- Database: localhost:5432 (postgres / password)
- Redis: localhost:6379
- OpenSearch: http://localhost:9200

---

**Last Updated**: 2026-09-15 | **Phase**: P1 (Real Features)
