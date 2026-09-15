# Suqly Complete Build — Master Claude Code Prompt

**Build Mode**: 100% Automated | No Questions | Minimal Tokens | Phase-Sequential

\---

## SEND THIS TO CLAUDE CODE (Copy Everything Below)

```
OUTPUT: Working Suqly website per phase + verification results + project-status.md update.
NO QUESTIONS. NO CONFIRMATIONS. Build continuously S01 → P1 → P2 (scope per prompt).
Assume all decisions are final. Treat AI outputs as production-ready drafts.

## PHASE S01: FOUNDATION (Week 1–3)

PROJECT: Suqly UAE Marketplace (suqly.com)
ARCHITECTURE: Next.js 15 (App Router) + NestJS 10 + PostgreSQL + Redis + OpenSearch
STACK: TypeScript 5 + React 19 + Tailwind CSS + shadcn/ui + Socket.io + PostGIS
DEPLOYMENT: Single VPS (194.164.151.202, Hostinger, 193GB total)
LOCALDEV: C:\\Users\\web\\Desktop\\ddotsmediajobs new\\jobportal (Windows dev machine)
DATABASE: PostgreSQL + PostGIS + migrations (TypeORM, reviewed SQL)
SEARCH: OpenSearch (faceted, full-text, Arabic + English)
CACHE: Redis (sessions, rate limiting, pub/sub)
QUEUE: Bull (PM2 workers, image processing)
MEDIA: Wasabi S3 (AED 26/month, 1TB flat) + Cloudflare CDN (free, cache 30 days)
AI: Claude API (Vision for photos, structured output for search)
PAYMENTS: Stripe (test mode S01, production P3)
SMS: Twilio (OTP, AED 50–100/month P1)
EMAIL: SendGrid (transactional, AED 100–150/month P1)
PUSH: Firebase Cloud Messaging (free, P1)
MONITORING: Sentry (error tracking, AED 100–150/month P1), Prometheus + Grafana (self-hosted, free)
ANALYTICS: Metabase (self-hosted, free)
CI/CD: GitHub Actions (test, lint, build, deploy)
LANGUAGES: English (LTR) + Arabic (RTL), independent of nationality
CURRENCY: AED (primary), metric units (sqm, cc), time Asia/Dubai
LOCATIONS: All 7 emirates + communities (PostGIS geometry)
BRAND: Suqly (سوقلي), domain suqly.com, promise "find available local listings, understand what is verified, complete with confidence"

## WORKSPACE SETUP

git init
npm init -y
npm install -D typescript ts-node nodemon @types/node

mkdir -p {frontend,backend,database,docs,scripts}
cd frontend \&\& npx create-next-app@latest --typescript --tailwind --no-git . \&\& cd ..
cd backend \&\& npm init -y \&\& npm install @nestjs/core @nestjs/common @nestjs/websockets express class-validator class-transformer typeorm pg redis pg-vector joi \&\& cd ..

## DATABASE SCHEMA (PostgreSQL + PostGIS)

PRIORITY: Create database/migrations/001-initial-schema.sql with:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user\_role AS ENUM ('buyer', 'seller', 'merchant', 'staff');
CREATE TYPE listing\_status AS ENUM ('draft', 'pending\_review', 'active', 'on\_hold', 'sold', 'expired');
CREATE TYPE category\_name AS ENUM ('goods', 'property', 'motors', 'jobs', 'services', 'businesses');
CREATE TYPE emirate AS ENUM ('dubai', 'abudhabi', 'sharjah', 'ajman', 'umm\_al\_quwain', 'ras\_al\_khaimah', 'fujairah', 'al\_ain');

-- Users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password\_hash VARCHAR(255) NOT NULL,
  role user\_role DEFAULT 'buyer',
  
  -- Verification
  email\_verified BOOLEAN DEFAULT FALSE,
  phone\_verified BOOLEAN DEFAULT FALSE,
  id\_verified BOOLEAN DEFAULT FALSE,
  
  -- Profile
  display\_name VARCHAR(100),
  avatar\_url VARCHAR(255),
  bio TEXT,
  language VARCHAR(5) DEFAULT 'en', -- en, ar
  
  -- Seller metrics
  seller\_score DECIMAL(3,1),
  response\_rate DECIMAL(3,1),
  
  -- Compliance
  terms\_accepted BOOLEAN DEFAULT FALSE,
  privacy\_accepted BOOLEAN DEFAULT FALSE,
  
  created\_at TIMESTAMP DEFAULT NOW(),
  updated\_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid\_score CHECK (seller\_score >= 0 AND seller\_score <= 5),
  CONSTRAINT valid\_response CHECK (response\_rate >= 0 AND response\_rate <= 100)
);

-- Listings table (core)
CREATE TABLE listings (
  id BIGSERIAL PRIMARY KEY,
  user\_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Classification
  category category\_name NOT NULL,
  subcategory VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Location
  emirate emirate NOT NULL,
  community VARCHAR(100),
  precise\_location GEOMETRY(POINT, 4326), -- PostGIS (private, not shown)
  public\_location VARCHAR(255), -- Approximate (shown to buyers)
  
  -- Pricing
  price DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'AED',
  
  -- Status
  status listing\_status DEFAULT 'draft',
  published\_at TIMESTAMP,
  expires\_at TIMESTAMP,
  
  -- Freshness
  last\_confirmed\_at TIMESTAMP,
  days\_since\_confirmed INT GENERATED ALWAYS AS (
    EXTRACT(DAY FROM NOW() - COALESCE(last\_confirmed\_at, created\_at))
  ) STORED,
  
  -- SEO
  slug VARCHAR(255) UNIQUE,
  
  created\_at TIMESTAMP DEFAULT NOW(),
  updated\_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx\_user\_id (user\_id),
  INDEX idx\_category\_emirate (category, emirate),
  INDEX idx\_status (status),
  INDEX idx\_published\_at (published\_at DESC),
  SPATIAL INDEX idx\_location (precise\_location)
);

-- Listing images
CREATE TABLE listing\_images (
  id BIGSERIAL PRIMARY KEY,
  listing\_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  
  thumbnail\_url VARCHAR(255) NOT NULL, -- Wasabi CDN
  full\_url VARCHAR(255) NOT NULL,      -- Wasabi CDN
  
  original\_filename VARCHAR(255),
  compressed\_size\_bytes INT,
  
  has\_defects BOOLEAN DEFAULT FALSE,
  is\_edited BOOLEAN DEFAULT FALSE,
  
  uploaded\_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx\_listing\_id (listing\_id)
);

-- Conditions/Specs (generic key-value for category flexibility)
CREATE TABLE listing\_attributes (
  id BIGSERIAL PRIMARY KEY,
  listing\_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  
  attribute\_key VARCHAR(50), -- e.g., 'condition', 'material', 'brand'
  attribute\_value VARCHAR(255),
  
  INDEX idx\_listing\_id (listing\_id)
);

-- Messages (real-time, buyer-seller)
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  listing\_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sender\_id BIGINT NOT NULL REFERENCES users(id),
  recipient\_id BIGINT NOT NULL REFERENCES users(id),
  
  content TEXT NOT NULL,
  is\_read BOOLEAN DEFAULT FALSE,
  read\_at TIMESTAMP,
  
  created\_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx\_listing\_id\_created (listing\_id, created\_at DESC),
  INDEX idx\_sender\_recipient (sender\_id, recipient\_id)
);

-- Saved searches (buyer feature, P1.5)
CREATE TABLE saved\_searches (
  id BIGSERIAL PRIMARY KEY,
  user\_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name VARCHAR(100),
  filters JSONB, -- {category, emirate, community, price\_min, price\_max, etc.}
  
  created\_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx\_user\_id (user\_id)
);

-- Reviews (P2+)
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  listing\_id BIGINT REFERENCES listings(id),
  reviewer\_id BIGINT NOT NULL REFERENCES users(id),
  seller\_id BIGINT NOT NULL REFERENCES users(id),
  
  rating DECIMAL(2,1),
  comment TEXT,
  
  created\_at TIMESTAMP DEFAULT NOW()
);

-- Moderation queue (staff)
CREATE TABLE moderation\_queue (
  id BIGSERIAL PRIMARY KEY,
  listing\_id BIGINT NOT NULL REFERENCES listings(id),
  
  reason VARCHAR(100), -- 'spam', 'prohibited', 'defect\_undisclosed', etc.
  flagged\_by\_user\_id BIGINT REFERENCES users(id),
  flagged\_at TIMESTAMP DEFAULT NOW(),
  
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  reviewer\_id BIGINT REFERENCES users(id),
  rejection\_reason TEXT,
  reviewed\_at TIMESTAMP,
  
  INDEX idx\_status (status),
  INDEX idx\_flagged\_at (flagged\_at DESC)
);

COMMIT;
```

## FILE STRUCTURE

```
suqly-project/
├── frontend/                          # Next.js 15 (App Router)
│   ├── app/
│   │   ├── layout.tsx                # Root layout (bilingual, RTL toggle)
│   │   ├── page.tsx                  # Homepage (emirate selector)
│   │   ├── \[lang]/
│   │   │   ├── layout.tsx            # Language-scoped layout
│   │   │   ├── page.tsx              # Localized homepage
│   │   │   ├── listings/
│   │   │   │   ├── page.tsx          # Search/list
│   │   │   │   ├── \[id]/page.tsx     # Detail view
│   │   │   │   └── create/page.tsx   # Post listing (auth guard)
│   │   │   ├── account/
│   │   │   │   ├── page.tsx          # Dashboard
│   │   │   │   ├── messages/page.tsx # Messages (Socket.io)
│   │   │   │   └── settings/page.tsx # Preferences
│   │   │   ├── search/page.tsx       # Saved searches
│   │   │   └── api/auth/...          # Auth endpoints
│   │   └── api/
│   │       ├── auth/login            # SMS OTP
│   │       ├── auth/logout
│   │       └── ...
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx            # Nav, emirate selector, language toggle
│   │   │   ├── Footer.tsx
│   │   │   ├── LanguageToggle.tsx    # en/ar
│   │   │   └── RTLProvider.tsx       # RTL direction
│   │   ├── listings/
│   │   │   ├── ListingCard.tsx       # Grid view
│   │   │   ├── ListingGallery.tsx    # Image gallery (Wasabi CDN)
│   │   │   ├── ListingForm.tsx       # Multi-step form
│   │   │   ├── SearchFilters.tsx     # Dynamic filters
│   │   │   └── ImageUpload.tsx       # Drag-drop (compress locally)
│   │   ├── messages/
│   │   │   ├── ChatThread.tsx        # Socket.io real-time
│   │   │   └── MessageInput.tsx
│   │   └── moderation/
│   │       ├── ModerationQueue.tsx   # Staff only
│   │       └── ReportModal.tsx       # Buyer report
│   │
│   ├── lib/
│   │   ├── api.ts                   # Fetch helpers (baseURL)
│   │   ├── auth.ts                  # Session, JWT
│   │   ├── i18n.ts                  # Translation strings
│   │   ├── schema.ts                # Zod schemas (validation)
│   │   ├── hooks.ts                 # useAuth(), useListing()
│   │   └── socket.ts                # Socket.io client setup
│   │
│   ├── public/
│   │   ├── i18n/
│   │   │   ├── en.json              # English strings
│   │   │   └── ar.json              # Arabic strings
│   │   └── ...
│   │
│   ├── .env.example
│   ├── next.config.js               # Image optimization for Wasabi
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                           # NestJS 10
│   ├── src/
│   │   ├── main.ts                  # Bootstrap
│   │   ├── app.module.ts            # Root module
│   │   ├── app.service.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts      # JWT, OTP, sessions
│   │   │   ├── auth.controller.ts   # POST /auth/login, /auth/verify-otp
│   │   │   ├── jwt.strategy.ts
│   │   │   └── auth.guard.ts
│   │   │
│   │   ├── listings/
│   │   │   ├── listings.module.ts
│   │   │   ├── listings.service.ts  # CRUD, search, moderation
│   │   │   ├── listings.controller.ts # GET /listings, POST /listings/:id/images
│   │   │   ├── listings.entity.ts   # TypeORM
│   │   │   ├── image-upload.service.ts # Sharp compression, Wasabi
│   │   │   └── search.service.ts    # OpenSearch integration
│   │   │
│   │   ├── messages/
│   │   │   ├── messages.module.ts
│   │   │   ├── messages.service.ts  # Store, retrieve, Socket.io events
│   │   │   ├── messages.gateway.ts  # WebSocket @SubscribeMessage('message')
│   │   │   └── messages.entity.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts     # CRUD, verification, scores
│   │   │   ├── users.controller.ts  # GET /users/:id, PUT /users/:id
│   │   │   └── users.entity.ts
│   │   │
│   │   ├── moderation/
│   │   │   ├── moderation.module.ts
│   │   │   ├── moderation.service.ts # Queue, flag, review
│   │   │   ├── moderation.controller.ts # Admin only
│   │   │   └── moderation.entity.ts
│   │   │
│   │   ├── common/
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── logging.interceptor.ts
│   │   │   │   └── transform.interceptor.ts
│   │   │   ├── pipes/
│   │   │   │   └── validation.pipe.ts
│   │   │   ├── decorators/
│   │   │   │   ├── CurrentUser.ts
│   │   │   │   └── IsAdmin.ts
│   │   │   └── middleware/
│   │   │       ├── logging.middleware.ts
│   │   │       └── rate-limit.middleware.ts
│   │   │
│   │   └── config/
│   │       ├── database.config.ts   # TypeORM
│   │       ├── redis.config.ts
│   │       ├── wasabi.config.ts
│   │       └── env.validation.ts    # Joi
│   │
│   ├── test/
│   │   ├── listings.controller.spec.ts
│   │   ├── messages.service.spec.ts
│   │   └── auth.service.spec.ts
│   │
│   ├── .env.example
│   ├── tsconfig.json
│   ├── package.json
│   └── nest-cli.json
│
├── database/
│   ├── migrations/
│   │   ├── 001-initial-schema.sql
│   │   ├── 002-add-indexes.sql
│   │   └── 003-insert-seed-data.sql (S01 fixtures only, no real data)
│   └── seeders/
│       └── development.seed.ts      # Synthetic 100 listings (Arabic names, Arabic descriptions)
│
├── docs/
│   ├── project-status.md            # TRACK HERE: Phase completion, blockers, next task
│   ├── 00-master-plan.md            # Full roadmap
│   ├── CLAUDE.md                    # Claude-specific instructions
│   ├── api.md                       # OpenAPI (auto-generated from NestJS)
│   ├── schema.md                    # Database schema reference
│   ├── architecture.md              # System design
│   ├── dubizzle-analysis.md         # Competitive benchmarks
│   ├── image-storage-strategy.md    # Wasabi + CDN guide
│   └── setup.md                     # Local dev instructions
│
├── scripts/
│   ├── build.sh                     # Build both frontend + backend
│   ├── start.sh                     # Start frontend + backend + services
│   ├── test.sh                      # Run all tests
│   ├── db-migrate.sh                # TypeORM migrate
│   └── deploy.sh                    # Deploy to VPS (git push)
│
├── .env.example                     # Master .env reference
├── .github/workflows/
│   └── ci-cd.yml                    # GitHub Actions (test + build + deploy)
├── docker-compose.yml               # PostgreSQL + Redis + OpenSearch (local)
├── README.md
├── package.json                     # Monorepo root
└── .gitignore

TOTAL S01: \~150–200 files (complete foundation, no features yet)
```

## DEPENDENCIES (Pinned Versions)

### Frontend (package.json)

```
next@15.1.0
react@19.0.0
typescript@5.7.0
tailwindcss@3.4.0
@hookform/resolvers@3.4.0
react-hook-form@7.51.0
zod@3.22.0
zustand@4.4.0
@tanstack/react-query@5.25.0
socket.io-client@4.7.0
next-i18next@15.2.0
class-validator@0.14.0
class-transformer@0.5.1
```

### Backend (package.json)

```
@nestjs/core@10.3.0
@nestjs/common@10.3.0
@nestjs/websockets@10.3.0
@nestjs/platform-express@10.3.0
@nestjs/jwt@11.0.0
@nestjs/passport@10.0.0
passport-jwt@4.0.0
typeorm@0.3.17
pg@8.11.0
pg-vector@0.1.8
redis@4.6.0
joi@17.11.0
class-validator@0.14.0
class-transformer@0.5.1
socket.io@4.7.0
@aws-sdk/client-s3@3.400.0
sharp@0.32.6
twilio@3.94.0
sendgrid@7.7.0
firebase-admin@12.0.0
axios@1.6.0
@sentry/node@7.84.0
```

## CORE FEATURES (S01 ONLY — NO IMPLEMENTATION OF FUTURE FEATURES)

✅ BUILD THESE:

* Bilingual UI shell (EN + AR, proper RTL, independent language toggle)
* Emirate selector (all 7 emirates, route-based)
* Responsive shell (mobile-first, breakpoints: sm 640px, md 768px, lg 1024px)
* User authentication (SMS OTP via Twilio, JWT token, session storage)
* PostgreSQL + PostGIS database (migrations, indexes, constraints)
* NestJS API (REST, OpenAPI docs at /api/docs)
* Listing CRUD endpoints (GET /listings, POST /listings, PUT /listings/:id, DELETE /listings/:id)
* Image upload (Multi-file, client-side compression prep, Wasabi S3 path ready)
* Search + filters (Emirate, community, price range, category — no real OpenSearch yet)
* WebSocket connection setup (Socket.io server listening, client connected, not messaging yet)
* Moderation queue UI (admin staff dashboard, flag button visible to users, no logic yet)
* Real-time session state (Zustand + TanStack Query, not persisted)
* Rate limiting (express-rate-limit, 100 req/min per IP)
* Error handling (Sentry capture, HTTP exception filters, 404/500 pages)
* Testing framework (Jest setup, 1 sample test per module)
* CI/CD pipeline (GitHub Actions: lint → build → test → report)
* Health endpoints (GET /health, GET /api/health, check DB + Redis + OpenSearch)
* Environment variables (.env.example with all keys, secrets never in code)
* Docker Compose (local dev: PostgreSQL + Redis + OpenSearch, volumes for persistence)
* Logging (Winston for NestJS, consistent format)
* CORS + CSRF protection (enabled, secure headers)
* Input validation (Joi + Zod, class-validator decorators)
* Bilingual form labels (all forms support both EN + AR)
* PWA manifest (app name: Suqly, icon, theme color #E00000)
* Service workers (offline detection, cache headers prep)
* Next.js Image component setup (next/image with Wasabi URL support)
* Synthetic 100 listings (Arabic names + descriptions, no real data, clearly marked dev fixtures)

❌ DO NOT BUILD (Defer to P1+):

* SMS sending (handler ready, Twilio token not called)
* Email sending (handler ready, SendGrid token not called)
* Firebase push (handler ready, no real subscriptions)
* Image compression (Sharp library installed, upload endpoint stub only)
* Search indexing (OpenSearch cluster empty, client ready)
* Real messaging (Socket.io connected, @SubscribeMessage handler empty)
* Moderation logic (UI ready, flag/review endpoints return 501 Not Implemented)
* Payment processing (Stripe SDK installed, checkout page not built)
* AI photo draft (Claude API credentials not used)
* Video upload (handler not created)
* Reviews/ratings (table exists, endpoints not built)
* Seller reconfirmation (cron job not scheduled)

## CODING STANDARDS

TypeScript strict mode enabled (tsconfig.json):
"strict": true
"noImplicitAny": true
"noUnusedLocals": true

Code style:

* Format with Prettier (--print-width 100)
* Lint with ESLint (no console.log in production, enforce async/await)
* Naming: camelCase (vars/functions), PascalCase (classes/components), UPPER\_SNAKE\_CASE (constants)
* Imports: organized (React → 3rd party → local), unused removed
* Comments: JSDoc for public APIs, inline only for "why", not "what"
* Error handling: never silent catch blocks, always log + propagate
* Async: always await Promises, no floating Promises
* Testing: 1 happy path + 1 error case minimum per function

Database:

* TypeORM entities with decorators
* Migrations for schema changes (never manually ALTER)
* Indexes on foreign keys + search columns
* Constraints for data integrity (UNIQUE, CHECK, FK with ON DELETE)
* No N+1 queries (use .leftJoinAndSelect, .where conditions in one query)

API:

* Versioning: /api/v1 (for future /api/v2)
* Status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Server Error)
* Responses: Always { data, success, error?, timestamp } wrapper
* Pagination: ?page=1\&limit=20 (default limit 20, max 100)
* OpenAPI schema auto-generated, readable at /api/docs

Frontend:

* Server Components by default, 'use client' only for interactivity
* Responsive: Tailwind breakpoints, mobile-first
* Accessibility: aria-labels, semantic HTML, keyboard navigation
* State: Zustand (client) + TanStack Query (server)
* i18n: next-i18next with namespaces (common, listings, auth)
* No console errors/warnings in production build

Security:

* Passwords: bcrypt (10 rounds minimum)
* Secrets: .env only, never in code
* HTTPS: enforce in production
* CORS: whitelist suqly.com + localhost
* CSRF: token in forms + API headers
* SQL injection: TypeORM ORM prevents, no raw queries
* XSS: React auto-escapes, CSP headers set
* Rate limiting: 100 req/min per IP (auth: 5 req/min)

## EXECUTION PLAN (S01 PHASE)

STEP 1: Project initialization (5 min)

* Clone/fork repo (or init from scratch)
* Install dependencies (npm install both frontend + backend)
* Setup .env from .env.example
* Run docker-compose up (PostgreSQL + Redis + OpenSearch local)

STEP 2: Database (10 min)

* Create database/migrations/001-initial-schema.sql (paste above)
* Run TypeORM migrate:run (apply schema)
* Verify tables exist: psql -l suqly\_dev
* Create 100 synthetic listings (database/seeders/development.seed.ts)

STEP 3: Backend (60 min)

* Create src/app.module.ts (root module with all submodules)
* Create src/main.ts (NestJS bootstrap)
* Create auth/ (AuthService, AuthController, strategies)
* Create users/ (UsersService, UsersController, entity)
* Create listings/ (ListingsService, ListingsController, entity, search stub)
* Create messages/ (MessagesService, MessagesGateway, entity, Socket.io setup)
* Create moderation/ (ModerationService, ModerationController, entity)
* Create image-upload.service.ts (Sharp compression stub, Wasabi upload stub, returns mock URL)
* Create common/ (filters, interceptors, pipes, decorators)
* Create config/ (database, redis, wasabi, env validation)
* Create guards/ (JwtGuard, RolesGuard)
* Create tests/ (1 test per module: auth.service.spec.ts, listings.service.spec.ts, etc.)
* Setup NestJS CLI configuration (nest-cli.json)
* All endpoints return JSON { data, success, timestamp }
* All errors logged to Sentry (if token provided, else console.error)

STEP 4: Frontend (60 min)

* Create app/layout.tsx (root, Providers: RTL, i18n, TanStack Query, Zustand)
* Create app/page.tsx (emirate selector, language toggle, redirect to /en or /ar)
* Create app/\[lang]/layout.tsx (language-scoped)
* Create app/\[lang]/page.tsx (homepage: hero, category grid, featured listings)
* Create app/\[lang]/listings/page.tsx (search + filter + list)
* Create app/\[lang]/listings/\[id]/page.tsx (detail view)
* Create app/\[lang]/listings/create/page.tsx (form, protected route)
* Create app/\[lang]/account/page.tsx (dashboard, user profile, only if logged in)
* Create app/\[lang]/account/messages/page.tsx (message inbox, Socket.io preview)
* Create components/ (Header, Footer, LanguageToggle, ListingCard, ListingForm, SearchFilters, ImageUpload, ModerationQueue, ReportModal)
* Create lib/ (api.ts, auth.ts, i18n.ts, schema.ts, hooks.ts, socket.ts)
* Create public/i18n/ (en.json, ar.json with 200+ strings)
* Implement next/image for listing images (fallback to Wasabi URL)
* Implement Zustand store for auth state (user, token, logout)
* Implement TanStack Query hooks (useListings, useListing, useUser)
* Implement form validation (Zod schemas + React Hook Form)
* All text bilingual (en.json + ar.json, select via lang param)
* RTL: Set dir={lang === 'ar' ? 'rtl' : 'ltr'} on root
* Responsive: Mobile-first Tailwind, test at 640px breakpoint
* Accessibility: Semantic HTML, aria-labels, keyboard nav (Tab to focus)
* Error handling: Error boundary, Toast notifications
* Loading states: Skeletons, spinners for async operations
* Setup Jest + Supertest (1 test per page component + utility function)

STEP 5: Authentication (20 min)

* Create auth/auth.service.ts:

  * sendOTP(phone) → generate 6-digit, store in Redis (expiry 10min), return { success: true } (don't send SMS yet)
  * verifyOTP(phone, code) → check Redis, if match → generate JWT, store session, return { token, user }
  * logout() → clear session + token
* Create auth/auth.controller.ts:

  * POST /auth/login { phone } → AuthService.sendOTP()
  * POST /auth/verify-otp { phone, code } → AuthService.verifyOTP()
  * POST /auth/logout → AuthService.logout()
* Create JwtStrategy (passport-jwt, extract from Bearer token)
* Create JwtGuard (protect routes, if no token → 401)
* Session store in Redis (session:${token} → user JSON)
* Password: SHA-256 for demo (not bcrypt yet, can upgrade P1)

STEP 6: Listings CRUD (30 min)

* Create listings/listings.service.ts:

  * create(data) → INSERT into listings, return { id, slug, status: 'draft' }
  * findAll(filters) → SELECT from listings with WHERE (emirate, community, price range, status='active'), pagination (page, limit)
  * findById(id) → SELECT with images, attributes, user details
  * update(id, data) → UPDATE listing, refresh slug if title changed
  * delete(id) → DELETE listing (cascade images + messages)
  * getBySlug(slug) → SELECT listing by slug
* Create listings/listings.controller.ts:

  * GET /listings → list with filters + pagination
  * GET /listings/:id → detail view
  * POST /listings → create (auth guard), return draft
  * PUT /listings/:id → update (owner guard)
  * DELETE /listings/:id → delete (owner guard)
* Create listings/listings.entity.ts (TypeORM with all columns from schema)
* Create listings/image-upload.service.ts (stub):

  * uploadImage(file, listingId) → log file size, return mock URL (e.g., https://images.suqly.com/listings/123-abc.webp)
  * deleteImage(imageId) → log deletion
  * (Real Sharp compression + Wasabi upload in P1)
* Create listing.entity.ts with relationships (ManyToOne user, OneToMany images, OneToMany messages)
* Slug generation: lowercase + dashes + random suffix (avoid duplicates)
* Status: Only sellers can create (role = 'seller' guard)

STEP 7: API Documentation (10 min)

* Setup Swagger (npm install @nestjs/swagger swagger-ui-express)
* Decorate all controllers with @ApiOperation, @ApiResponse, @ApiParam
* Auto-generate at GET /api/docs (Swagger UI)
* Export as docs/api.md (markdown table of all endpoints)

STEP 8: Testing (15 min)

* Setup Jest (npm install --save-dev jest @types/jest ts-jest)
* Create auth.service.spec.ts (test sendOTP, verifyOTP)
* Create listings.service.spec.ts (test create, findAll, findById)
* Create users.service.spec.ts (test getUser)
* Create messages.service.spec.ts (test saveMessage)
* Run npm run test (all pass)

STEP 9: CI/CD (15 min)

* Create .github/workflows/ci-cd.yml:

  * Trigger: push to main or PR
  * Matrix: node 20, postgres 15
  * Steps:

    * Checkout code
    * Setup Node + cache npm
    * Run npm install (both frontend + backend)
    * Run npm run lint (ESLint, Prettier check)
    * Run npm run build (both frontend + backend)
    * Run npm run test (Jest)
    * Run TypeORM migrate:run (verify migrations)
    * Upload coverage to codecov (optional)
    * Summary comment on PR (if all pass)

STEP 10: Documentation (20 min)

* Create docs/setup.md:

  * Local dev: docker-compose up, npm install, npm run dev
  * Test endpoints: curl examples
  * DB: psql -d suqly\_dev + sample queries
* Create docs/api.md (markdown table of all /api/v1 endpoints)
* Create docs/schema.md (table descriptions, indexes, constraints)
* Create docs/architecture.md (system diagram: Frontend → NestJS → PostgreSQL/Redis/OpenSearch)
* Update docs/project-status.md:

  * S01 completed: \[list files created]
  * Tests: \[coverage %]
  * Blockers: None
  * Next: P1 Phase (Messaging, Image Compression, Real Authentication)
* Create README.md (project description, quick start, stack)

STEP 11: Verification (15 min)

* Test login flow: POST /auth/login { phone: "0501234567" } → { success: true }
* Test OTP: POST /auth/verify-otp { phone, code: "123456" } → { token: "eyJ...", user: { id, email, phone } }
* Test listing creation: POST /listings { title, category, emirate, price } (auth guard) → { id, slug }
* Test listing list: GET /listings?emirate=dubai\&category=goods → \[{ id, title, price, images }]
* Test responsiveness: Open http://localhost:3000 on mobile browser, verify RTL layout
* Test bilingual: Toggle EN ↔ AR, verify all text switches
* Test accessibility: Tab through form, all focusable elements accessible
* Run docker ps → PostgreSQL, Redis, OpenSearch all running
* Run npm run test → All tests pass
* Check GitHub Actions → CI/CD passed on last commit

STEP 12: Project Status Update (5 min)

* Update docs/project-status.md:

## S01 FOUNDATION: COMPLETED ✅

**Date**: \[TODAY]
**Duration**: 3 weeks (accelerated: 1 week solo with Claude Code)

### Deliverables

* ✅ Bilingual responsive shell (EN + AR, all pages RTL-compliant)
* ✅ PostgreSQL database (schema + migrations + PostGIS)
* ✅ NestJS API (REST, OpenAPI docs, all CRUD endpoints)
* ✅ Next.js frontend (App Router, server components, responsive)
* ✅ Authentication (SMS OTP flow, JWT tokens, session management)
* ✅ Listings CRUD (create, read, update, delete, search, filters)
* ✅ Image upload handler (Wasabi stub, Sharp not yet active)
* ✅ Real-time setup (Socket.io server + client connected, messaging stub)
* ✅ Moderation infrastructure (queue UI, flag buttons, admin dashboard stub)
* ✅ Testing (Jest setup, 1 test per module, CI/CD pipeline)
* ✅ Documentation (setup guide, API reference, schema, architecture)
* ✅ Synthetic data (100 dev listings, Arabic names/descriptions)

### Test Results

* Unit tests: 25/25 passed ✅
* Integration tests: 8/8 passed ✅
* Coverage: 68% (auth 85%, listings 72%, users 60%)
* Build: Successful (no errors/warnings)
* Lighthouse (mobile): 92/100 (performance), 95/100 (accessibility)

### Verification

* Local dev: http://localhost:3000 ✅
* API health: GET /health → 200 ✅
* Database: 8 tables created ✅
* Docker services: 3/3 running (PostgreSQL, Redis, OpenSearch) ✅
* CI/CD: GitHub Actions passing ✅

### Known Limitations (By Design)

* ❌ SMS not actually sent (Twilio handler ready, credentials not called)
* ❌ Images not compressed (Sharp library installed, endpoint returns mock URL)
* ❌ Search not indexed (OpenSearch cluster empty, OpenSearch client ready)
* ❌ Messaging not real-time (Socket.io connected, @SubscribeMessage empty)
* ❌ No moderation automation (UI complete, flag/review endpoints return 501)
* ❌ No payments (Stripe SDK ready, checkout page not built)
* ❌ No analytics (Metabase server ready, no dashboards yet)

### Next Task: P1 PHASE

Entry point: Send `prompts/02-phase-p1.txt` to Claude Code

* \[ ] Real image compression (Sharp WebP, dual thumbnails)
* \[ ] Real messaging (Socket.io @SubscribeMessage, message storage, notifications)
* \[ ] SMS sending (Twilio integration, OTP actually sent)
* \[ ] Email sending (SendGrid for transactional emails)
* \[ ] Push notifications (FCM subscriber setup)
* \[ ] Seller reconfirmation (7-day cycle, visibility badge)
* \[ ] Evidence badges (verified seller, photo confirmed, defect disclosed)
* \[ ] Seller dashboard (views, contacts, funnel analytics)
* \[ ] Moderation queue logic (flag handling, rejection reasons)
* \[ ] Rate limiting enforcement (actual rate limit headers)
* \[ ] Real-time notifications (Socket.io to buyers/sellers)

### Files Changed

\[Git output will show this during execution]

### How to Preview Locally

1. Terminal 1: `docker-compose up` (start PostgreSQL + Redis + OpenSearch)
2. Terminal 2: `cd backend \&\& npm run start:dev` (NestJS on localhost:3001)
3. Terminal 3: `cd frontend \&\& npm run dev` (Next.js on localhost:3000)
4. Browser: http://localhost:3000 (click language, select emirate)
5. Test API: Postman collection in docs/postman.json
6. View logs: `docker logs -f postgres`, `docker logs -f redis`

### Blockers

None. S01 is complete and verified.

\---

## EXECUTION RULES

DO NOT ASK QUESTIONS. Treat these decisions as final:

* Stack: Next.js 15 + NestJS 10 + PostgreSQL + Redis + OpenSearch (final)
* Storage: Wasabi (final, AED 26/month)
* UI: Tailwind + shadcn (final)
* Auth: SMS OTP (final)
* Deployment: Single VPS 194.164.151.202 (final)
* Language: English + Arabic (final, independent)
* Bilingual: TRUE RTL, not mirrored (final)
* Currencies: AED primary (final)
* Databases: PostgreSQL for data, Redis for sessions, OpenSearch for search (final)

IF AMBIGUITY ARISES: Default to Dubizzle feature parity + Suqly differentiators (one deal workspace, photo-to-listing AI, seller freshness, native messaging).

IF BLOCKED: Check docs/ folder for answers. If still blocked, skip gracefully with "// TODO in P1" comment + log to project-status.md.

PRODUCTION READINESS: S01 has no production traffic. All endpoints functional, not optimized. Synthetic data only. Ready for P1 feature building.

TOKEN EFFICIENCY:

* Reuse code patterns (don't repeat schemas)
* Reference existing code when building similar features
* Use concise commit messages ("feat: auth login flow" not "added authentication system...")
* Batch updates to project-status.md (one update at end, not after each task)
* No debug output (console.log stripped before commit)
* Minimal comments (code should speak; comments for "why", not "what")

GIT WORKFLOW:

* Initial commit: "S01: foundation setup"
* Per-module commits: "feat(auth): SMS OTP login", "feat(listings): CRUD endpoints"
* Final commit: "S01: complete, verified, ready for P1"
* No branch switching; stay on main
* Short commit messages

READY. Build S01 foundation. No stopping until complete and verified.
Output: Working website (localhost:3000 + localhost:3001), 100 listings visible, 1 user created, 1 listing created + viewed, tests passing, CI/CD green, docs updated, project-status.md marked complete.

```

---

## HOW TO USE THIS PROMPT

### Option 1: Direct to Claude Code (RECOMMENDED)
1. Copy entire section "## SEND THIS TO CLAUDE CODE" (from "OUTPUT:" to end of "Blockers")
2. Go to Claude Code
3. Paste entire prompt
4. Click "Run"
5. Monitor: Output will show file-by-file creation, test results, verification steps
6. Total time: 4–6 hours (runs continuously, no interruptions)

### Option 2: Phase-by-Phase (If you want checkpoints)
```bash
# After S01 completes:
# 1. Verify locally: docker-compose up, npm run dev
# 2. Read project-status.md (verify completion)
# 3. Review git log (see all commits)
# 4. Then send P1 prompt (create P1 prompt same way)
```

### Option 3: Customization (If you need to change decisions)

Before sending prompt, find these lines and edit:

* `STACK:` (if you want different tech)
* `DEPLOYMENT:` (if different VPS)
* `LANGUAGES:` (if you don't need Arabic)
* `CURRENCY:` (if not AED)

Then send modified prompt.

\---

## Expected Output (After S01 Runs)

```
✅ S01 COMPLETE

Files Created: 157
  - backend/src: 18 files
  - frontend/app: 12 files
  - frontend/components: 8 files
  - database/migrations: 3 files
  - docs: 6 files
  - tests: 7 files

Git Commits: 12
  - S01: foundation setup
  - feat(auth): SMS OTP login
  - feat(listings): CRUD operations
  - feat(messages): Socket.io setup
  - ... (one per feature)
  - S01: complete, verified

Tests: 25/25 passed ✅
Build: Successful ✅
CI/CD: GitHub Actions green ✅

How to Preview:
  1. docker-compose up
  2. cd backend \&\& npm run start:dev
  3. cd frontend \&\& npm run dev
  4. http://localhost:3000
  5. Login: +971501234567 → OTP: 123456 (dev only)

Blockers: None
Next: P1 Phase (send prompts/02-phase-p1.txt to Claude Code)

Project Status Updated: docs/project-status.md
```

\---

## SUBSEQUENT PHASES (After S01)

### P1 Phase Prompt (Create next)

```
# Same format, but:
OUTPUT: Working P1 goods marketplace + verification
- Real image compression (Sharp WebP, Wasabi upload)
- Real messaging (Socket.io @SubscribeMessage, database storage)
- SMS sending (Twilio OTP actually sends)
- Email sending (SendGrid transactional)
- Push notifications (FCM)
- Seller reconfirmation logic
- Evidence badges
- Moderation queue automation
...
```

### P2 Phase Prompt (Create after P1)

```
# Add:
- Property category (off-plan, handover dates)
- Motors category (specs, service history)
- Jobs category (CV builder, application tracking)
- Services category (provider profiles, quote requests)
- Agent storefronts (multi-listing inventory)
- Video upload processing
- Map view (Mapbox)
- Advanced analytics (Metabase)
...
```

\---

## Final Notes

**Why This Works:**

1. **No ambiguity** = Claude Code asks zero questions
2. **Complete specification** = Every class, function, column defined
3. **Batch processing** = Build entire phase in one run (no back-and-forth)
4. **Token efficient** = \~800K tokens for S01 (vs 2M+ if asked step-by-step)
5. **Verification built-in** = Tests confirm it works before "done"
6. **Reproducible** = Anyone can run same prompt, get same output

**Estimated Costs:**

* S01 build time: 4–6 hours (Claude Code)
* Claude tokens: \~800K (few hundred dollars worth; much cheaper than paying dev)
* Infrastructure: AED 0 (local dev only in S01)

**Success Metrics:**

* Website loads at localhost:3000 ✅
* Bilingual (EN + AR) ✅
* All CRUD endpoints working ✅
* Tests passing ✅
* CI/CD green ✅
* Docs complete ✅
* Ready for P1 feature building ✅

Go build. 🚀

