# Suqly Local Development Setup Guide

## Prerequisites

Before starting, ensure you have:
- **Node.js** 20+ (https://nodejs.org)
- **Docker** & **Docker Compose** (https://www.docker.com/products/docker-desktop)
- **Git** (https://git-scm.com)
- **PostgreSQL Client** (optional, for direct database access)

## Installation Steps

### 1. Clone Repository
```bash
git clone https://github.com/suqly/suqly.git
cd suqly
```

### 2. Install Dependencies
```bash
npm install
```

This installs dependencies for all workspaces (frontend, backend).

### 3. Start Docker Services
```bash
docker-compose up -d
```

This starts:
- PostgreSQL 15 (port 5432)
- Redis 7 (port 6379)
- OpenSearch 2.11 (port 9200)

**Verify services are running:**
```bash
docker-compose ps
# All services should show "Up"
```

### 4. Setup Environment Variables

**Backend (.env):**
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=suqly_dev
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=suqly-super-secret-key-dev-only
PORT=3001
NODE_ENV=development
```

**Frontend (.env.local):**
```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 5. Run Database Migrations

**Option A: Using TypeORM CLI**
```bash
cd backend
npm run migration:run
cd ..
```

**Option B: Direct SQL**
```bash
psql -h localhost -U postgres -d suqly_dev -f database/migrations/001-initial-schema.sql
```

### 6. Seed Development Data (Optional)

```bash
cd backend
npm run seed
cd ..
```

This creates 100 synthetic listings for testing.

### 7. Start Development Servers

**Terminal 1 - Backend (NestJS)**
```bash
cd backend
npm run start:dev
```

Expected output:
```
🚀 Suqly API running on http://localhost:3001
📚 Swagger docs at http://localhost:3001/api/docs
```

**Terminal 2 - Frontend (Next.js)**
```bash
cd frontend
npm run dev
```

Expected output:
```
  ▲ Next.js [version]
  - Local: http://localhost:3000
```

### 8. Verify Everything Works

**Frontend**: Open http://localhost:3000 in your browser
- Should see Suqly homepage with emirate selector
- Language toggle (EN ↔ AR) should work
- Selecting emirate should show listings

**Backend API**: Visit http://localhost:3001/api/docs
- Swagger UI should load
- All endpoints listed

**Health Check**:
```bash
curl http://localhost:3001/health
# Response: { "success": true, "data": { "status": "healthy", ... } }
```

---

## Development Workflow

### Testing

**Run all tests:**
```bash
npm run test
```

**Run backend tests only:**
```bash
npm run test --workspace=backend
```

**Watch mode:**
```bash
npm run test:watch --workspace=backend
```

### Linting

**Check code style:**
```bash
npm run lint
```

**Auto-fix issues:**
```bash
npm run lint --workspace=backend -- --fix
```

### Building for Production

**Build all:**
```bash
npm run build
```

**Check output:**
```bash
ls backend/dist        # Should contain compiled .js
ls frontend/.next      # Should contain Next.js build
```

---

## Database Management

### Connect to PostgreSQL

```bash
psql -h localhost -U postgres -d suqly_dev
```

**Common queries:**

```sql
-- List all tables
\dt

-- Show users
SELECT id, email, phone, role FROM users;

-- Count listings
SELECT COUNT(*) FROM listings;

-- View current migrations
SELECT * FROM typeorm_metadata;
```

### Reset Database

```bash
# Stop services
docker-compose down

# Remove volume
docker volume rm suqly_postgres_data

# Start services again
docker-compose up -d

# Re-run migrations
cd backend && npm run migration:run
```

### View Logs

```bash
# PostgreSQL logs
docker logs -f suqly-postgres-1

# Redis logs
docker logs -f suqly-redis-1

# OpenSearch logs
docker logs -f suqly-opensearch-1
```

---

## Troubleshooting

### Port Already in Use

If port 3000, 3001, 5432, 6379, or 9200 is already in use:

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env or npm scripts
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker logs suqly-postgres-1

# Verify credentials in .env
grep DB_ backend/.env
```

### Dependencies Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Socket.io Connection Issues

```bash
# Check backend is running
curl http://localhost:3001/health

# Check logs
# Terminal where backend is running should show connection logs
```

### Memory Issues with Docker

If Docker runs out of memory:

```bash
# Increase Docker Desktop memory limit to 4GB+
# Settings → Resources → Memory

# Or run lighter services
docker-compose up -d postgres redis
# Skip OpenSearch if not needed
```

---

## IDE Setup

### VS Code

**Recommended Extensions:**
```
- ESLint
- Prettier - Code formatter
- Thunder Client (API testing)
- REST Client (curl/http requests)
- Docker
- PostgreSQL
- TypeScript Vue Plugin
```

**.vscode/settings.json:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.exclude": {
    "node_modules": true,
    "dist": true,
    ".next": true
  }
}
```

### WebStorm / IntelliJ

- Enable TypeScript support
- Configure ESLint in Preferences → Languages & Frameworks
- Enable prettier in Preferences → Tools → Prettier

---

## API Testing

### Using Thunder Client (VS Code)
1. Install "Thunder Client" extension
2. New request
3. Set method to POST
4. URL: http://localhost:3001/auth/login
5. Body (JSON):
```json
{ "phone": "+971501234567" }
```

### Using Postman
1. Download Postman
2. Import collection: (TBD - will be generated)
3. Set variable {{base_url}} = http://localhost:3001

### Using curl
```bash
# Test OTP flow
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+971501234567"}'

# Response:
# { "success": true, "data": { "success": true, "message": "OTP sent..." } }
```

---

## Hot Reload

### Frontend (Next.js)
- Changes to `app/`, `components/`, `lib/` auto-reload
- No need to restart

### Backend (NestJS)
- Changes to `src/` auto-compile with `npm run start:dev`
- May need to refresh API docs page

---

## Performance Monitoring

### Local Metrics

**Check backend uptime:**
```bash
curl http://localhost:3001/info
```

**Monitoring available in P1:**
- Sentry error tracking
- Prometheus metrics
- Grafana dashboards

---

## Common Development Tasks

### Add a new API endpoint

1. **Create controller method:**
```typescript
// src/listings/listings.controller.ts
@Get('featured')
async getFeaturedListings() {
  return this.listingsService.getFeatured();
}
```

2. **Add service method:**
```typescript
// src/listings/listings.service.ts
async getFeatured(): Promise<Listing[]> {
  return this.listingsRepository.find({
    where: { status: 'active' },
    order: { publishedAt: 'DESC' },
    take: 10,
  });
}
```

3. **Test immediately** (hot reload handles it)

### Add a new frontend page

1. **Create file:**
```bash
touch app/[lang]/new-page/page.tsx
```

2. **Add content:**
```typescript
export default function NewPage({ params }: { params: { lang: string } }) {
  return <div>New Page Content</div>;
}
```

3. **Access at:** http://localhost:3000/en/new-page

### Add database migration

1. **Create SQL file:**
```bash
touch database/migrations/002-add-new-table.sql
```

2. **Write SQL:**
```sql
CREATE TABLE new_table (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. **Run:**
```bash
cd backend && npm run migration:run
```

---

## Next Steps

1. **Read the docs:**
   - docs/api.md - API endpoint reference
   - docs/schema.md - Database schema
   - docs/architecture.md - System design

2. **Explore the code:**
   - backend/src - NestJS modules
   - frontend/app - Next.js pages

3. **Make changes:**
   - Create a feature branch
   - Commit your changes
   - Test thoroughly

4. **Run tests before pushing:**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

---

## Support

For issues or questions:
- Check troubleshooting section above
- Review docs/ folder
- Check GitHub Issues
- Email: support@suqly.com

---

**Last Updated**: September 15, 2026  
**Version**: 0.1.0
