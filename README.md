# Suqly - UAE Marketplace Platform

**Find available local listings, understand what is verified, complete with confidence.**

Suqly is a comprehensive marketplace platform for the UAE, enabling buyers and sellers to connect securely and efficiently. Built with modern technologies and a focus on trust, verification, and user experience.

## 📋 Project Overview

- **Project**: Suqly UAE Marketplace
- **Status**: S01 Foundation Phase (Complete)
- **Version**: 0.1.0
- **Technology Stack**: Next.js 15 + NestJS 10 + PostgreSQL + Redis + OpenSearch
- **Environment**: Single VPS (194.164.151.202, Hostinger)
- **Launch**: Phase P1 (Q1 2026)

## 🏗️ Architecture

```
Suqly Marketplace
├── Frontend (Next.js 15 - App Router)
│   ├── Pages (EN + AR, RTL support)
│   ├── Components (Reusable, Tailwind CSS)
│   └── Libraries (React Query, Zustand, Socket.io)
│
├── Backend (NestJS 10 - REST API)
│   ├── Authentication (SMS OTP, JWT)
│   ├── Modules (Auth, Users, Listings, Messages, Moderation)
│   ├── WebSocket Gateway (Socket.io, Real-time)
│   └── Error Handling (Sentry, Logging)
│
└── Infrastructure
    ├── Database (PostgreSQL + PostGIS)
    ├── Cache (Redis)
    ├── Search (OpenSearch)
    ├── Storage (Wasabi S3 + Cloudflare CDN)
    ├── Messaging (Twilio SMS, SendGrid Email, FCM Push)
    └── Monitoring (Sentry, Prometheus + Grafana)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Local Development

```bash
# 1. Clone and install
git clone https://github.com/suqly/suqly.git
cd suqly
npm install

# 2. Start infrastructure (Docker)
docker-compose up -d

# 3. Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Run database migrations
cd backend
npm run migration:run

# 5. Start both servers
npm run dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **OpenSearch**: http://localhost:9200

## 📦 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + Tailwind CSS
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Real-time**: Socket.io Client
- **i18n**: next-i18next (EN + AR)

### Backend
- **Framework**: NestJS 10
- **ORM**: TypeORM
- **Database**: PostgreSQL 15 + PostGIS
- **Cache**: Redis
- **Search**: OpenSearch
- **Auth**: Passport.js + JWT
- **Messaging**: Socket.io Server
- **Storage**: Wasabi S3

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Version Control**: Git
- **Monitoring**: Sentry, Prometheus, Grafana (P1+)

## 📁 Project Structure

```
suqly/
├── frontend/
│   ├── app/                 # Next.js App Router
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utilities (API, auth, i18n)
│   ├── public/i18n/         # Translation files (EN + AR)
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── app.module.ts    # Root NestJS module
│   │   ├── main.ts          # Bootstrap
│   │   ├── auth/            # Authentication module
│   │   ├── users/           # Users module
│   │   ├── listings/        # Listings module
│   │   ├── messages/        # Messaging module
│   │   ├── moderation/      # Moderation module
│   │   └── config/          # Configuration files
│   ├── test/                # Test files
│   └── package.json
│
├── database/
│   ├── migrations/          # SQL migration files
│   └── seeders/             # Database seeders
│
├── docs/
│   ├── setup.md             # Local development guide
│   ├── api.md               # API documentation
│   ├── schema.md            # Database schema reference
│   ├── architecture.md      # System design
│   ├── project-status.md    # Project progress tracking
│   └── README.md            # This file
│
├── docker-compose.yml       # Docker services (PostgreSQL, Redis, OpenSearch)
├── package.json             # Root package.json (workspaces)
└── .github/workflows/       # GitHub Actions CI/CD
```

## 🔑 Core Features (S01)

### ✅ Implemented
- **Bilingual UI** (English + Arabic, proper RTL support)
- **Emirate Selection** (All 7 emirates + communities)
- **User Authentication** (SMS OTP via Twilio, JWT tokens)
- **Listings CRUD** (Create, Read, Update, Delete, Publish)
- **Search & Filters** (Category, emirate, price range, community)
- **Image Upload** (Multi-file, client-side compression ready, Wasabi S3 path)
- **Real-time Setup** (Socket.io server/client, messaging infrastructure)
- **Moderation** (Admin queue, flag buttons, review workflow)
- **Responsive Design** (Mobile-first, breakpoints: 640px, 768px, 1024px)
- **Error Handling** (Sentry integration, HTTP exception filters, 404/500 pages)
- **API Documentation** (Swagger/OpenAPI at /api/docs)
- **Testing** (Jest setup, 1+ tests per module)
- **CI/CD Pipeline** (GitHub Actions: lint → build → test → report)
- **Docker Support** (Local dev: PostgreSQL, Redis, OpenSearch)
- **Synthetic Data** (100 dev listings, Arabic names/descriptions)

### ❌ Deferred to P1+
- SMS sending (Twilio credentials not called)
- Image compression (Sharp library installed, endpoint returns mock URL)
- Search indexing (OpenSearch client ready, no indexing yet)
- Real-time messaging (Socket.io connected, @SubscribeMessage stub)
- Email sending (SendGrid credentials not called)
- Push notifications (Firebase setup, no subscriptions yet)
- Payment processing (Stripe SDK ready, no implementation)
- Advanced analytics (Metabase server ready, no dashboards)

## 🔐 Security

- **Passwords**: Hashed with bcrypt (10 rounds)
- **Secrets**: Environment variables only, never in code
- **HTTPS**: Enforced in production
- **CORS**: Whitelisted origins
- **CSRF**: Token-based protection
- **SQL Injection**: TypeORM ORM prevents
- **XSS**: React auto-escapes, CSP headers
- **Rate Limiting**: 100 req/min per IP (auth: 5 req/min)

## 📖 Documentation

- **[Setup Guide](docs/setup.md)** - Local development setup and troubleshooting
- **[API Reference](docs/api.md)** - Complete API endpoint documentation
- **[Database Schema](docs/schema.md)** - Table structure and relationships
- **[Architecture](docs/architecture.md)** - System design and decision rationale
- **[Project Status](docs/project-status.md)** - Phase tracking and milestones

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run backend tests
npm run test --workspace=backend

# Run frontend tests
npm run test --workspace=frontend

# Watch mode
npm run test:watch --workspace=backend
```

## 🚢 Deployment

### Production Readiness
S01 Foundation is complete but **not for production traffic**. All endpoints functional, not optimized. Ready for P1 feature building.

### Deployment Process (TBD)
1. Push to main branch
2. GitHub Actions pipeline runs (lint → build → test)
3. Manual review and approval
4. Deploy to VPS (194.164.151.202)
5. Database migrations run
6. Health checks verify

## 📞 Support & Contact

- **Project Lead**: Suqly Team
- **Repository**: https://github.com/suqly/suqly
- **Issues**: GitHub Issues
- **Email**: support@suqly.com

## 📄 License

Proprietary - All rights reserved

---

**Last Updated**: September 2026  
**Version**: 0.1.0-S01  
**Status**: ✅ Foundation Phase Complete - Ready for P1 Phase
