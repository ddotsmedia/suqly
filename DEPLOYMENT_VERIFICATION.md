# Suqly Deployment Verification Checklist

**Date**: September 16, 2026  
**VPS**: 194.164.151.202  
**Frontend Port**: 3021  
**Backend Port**: 3022

---

## ✅ GitHub Actions Status

Monitor deployment at: https://github.com/ddotsmedia/suqly/actions

### Workflow Steps (Auto-Executed)
- [ ] Checkout code
- [ ] Set up Docker Buildx
- [ ] Log in to GHCR
- [ ] Build & push backend image
- [ ] Build & push frontend image
- [ ] SSH to VPS
- [ ] Pull latest images
- [ ] Run migrations
- [ ] Restart containers
- [ ] Health checks pass

---

## ✅ Post-Deployment Verification

### 1. Container Status
```bash
ssh deploy@194.164.151.202
docker ps

# Expected output:
# suqly-backend      ghcr.io/.../backend    Up 2 minutes
# suqly-frontend     ghcr.io/.../frontend   Up 2 minutes
# suqly-postgres     postgres:15            Up 2 minutes
# suqly-redis        redis:7                Up 2 minutes
# suqly-opensearch   opensearch:2.11        Up 2 minutes
```

### 2. Port Verification
```bash
netstat -tulpn | grep -E '(3021|3022|5432|6379|9200)'

# Expected:
# tcp 0 0 0.0.0.0:3021        LISTEN    # Frontend
# tcp 0 0 0.0.0.0:3022        LISTEN    # Backend
# tcp 0 0 0.0.0.0:5432        LISTEN    # PostgreSQL
# tcp 0 0 0.0.0.0:6379        LISTEN    # Redis
# tcp 0 0 0.0.0.0:9200        LISTEN    # OpenSearch
```

### 3. Frontend Health
```bash
curl http://localhost:3021

# Expected: HTML page loads
# Or check via browser: http://194.164.151.202:3021
```

### 4. Backend Health
```bash
curl http://localhost:3022/health

# Expected: {"status":"healthy","timestamp":"...","uptime":"..."}
```

### 5. Database Connection
```bash
docker-compose exec postgres psql -U postgres -c "SELECT 1"

# Expected: output "1"
```

### 6. Redis Connection
```bash
docker-compose exec redis redis-cli ping

# Expected: "PONG"
```

### 7. Container Logs
```bash
# Backend logs
docker-compose logs backend | tail -20

# Frontend logs
docker-compose logs frontend | tail -20

# Look for errors or warnings
```

---

## ✅ Feature Verification

### Frontend Features
- [ ] Homepage loads at http://localhost:3021
- [ ] Navigation works
- [ ] Search bar functional
- [ ] Categories display
- [ ] Listings visible

### Backend API
- [ ] Health endpoint: `/health`
- [ ] Listings endpoint: `/api/listings`
- [ ] Auth endpoint: `/auth/login`
- [ ] Admin endpoint: `/admin/settings/feature-flags`

### Database
- [ ] Tables created by migrations
- [ ] Feature flags table populated
- [ ] Sample data (optional)

### Advanced Features
- [ ] Visual search endpoint: `/api/search/visual`
- [ ] Live commerce endpoint: `/api/live-sessions`
- [ ] Price suggestions endpoint: `/api/prices/suggest`
- [ ] Fraud detection endpoint: `/api/fraud/check-listing`

---

## ✅ Nginx/Domain Setup

### DNS Records
```
A record: suqly.com          → 194.164.151.202
A record: api.suqly.com      → 194.164.151.202
A record: www.suqly.com      → 194.164.151.202
```

### SSL Certificates
```bash
sudo certbot certificates

# Expected: 3 certificates for suqly.com, api.suqly.com, www.suqly.com
```

### Nginx Config
```bash
sudo nginx -t

# Expected: "syntax is ok"
```

---

## ✅ Production Readiness

### Security
- [ ] HTTPS enabled (Let's Encrypt)
- [ ] .env.production not in git
- [ ] Secrets not exposed in logs
- [ ] Rate limiting configured
- [ ] CORS properly set

### Performance
- [ ] All containers healthy
- [ ] No OOM (out of memory) errors
- [ ] CPU usage < 80%
- [ ] Disk usage < 80%
- [ ] Response times < 500ms

### Monitoring
- [ ] Sentry configured
- [ ] Error alerts working
- [ ] Logs rotating properly
- [ ] Health checks passing

### Backups
- [ ] Database backups scheduled
- [ ] SSL certs backed up
- [ ] Rollback procedure documented

---

## ✅ User-Facing Checks

### Frontend (https://suqly.com)
- [ ] Page loads < 2 seconds
- [ ] Responsive on mobile
- [ ] All links functional
- [ ] Images loading
- [ ] Forms submitting

### Admin (https://suqly.com/admin/settings)
- [ ] Feature flags panel loads
- [ ] Toggles working
- [ ] Changes persisting
- [ ] No console errors

### Live Features
- [ ] Visual search: https://suqly.com/search/visual
- [ ] Live sessions: https://suqly.com/live
- [ ] Seller verification: https://suqly.com/seller/verification

---

## 🔧 Troubleshooting

### Containers Not Starting
```bash
docker-compose logs

# Check for:
# - Port already in use
# - Missing environment variables
# - Database connection errors
# - Image pull failures
```

### Database Migration Fails
```bash
docker-compose exec backend npm run typeorm migration:run

# If error, check:
# - DB_PASSWORD correct
# - PostgreSQL container running
# - Network connectivity
```

### Slow Performance
```bash
docker stats

# Check:
# - Memory usage
# - CPU usage
# - Swap usage
```

### Port Conflicts
```bash
# Find what's using a port
lsof -i :3021
lsof -i :3022

# Kill if needed
kill -9 <PID>

# Or use different ports in docker-compose
```

---

## ✅ Final Verification

Run this checklist before marking deployment complete:

1. **GitHub Actions**: Workflow completed successfully ✅
2. **Containers**: All 5 containers running ✅
3. **Ports**: All services on correct ports ✅
4. **Frontend**: Page loads at https://suqly.com ✅
5. **API**: Health endpoint returns 200 ✅
6. **Database**: Migrations applied ✅
7. **SSL**: Certificates valid ✅
8. **Monitoring**: Sentry receiving errors ✅
9. **Backups**: Database backups scheduled ✅
10. **Documentation**: README updated ✅

---

## 📞 Support

If deployment fails:
1. Check GitHub Actions logs
2. SSH to VPS and review docker-compose logs
3. Verify all environment variables in .env.production
4. Check disk space and memory
5. Review CLAUDE.md deployment section

---

**Status**: Ready for deployment verification  
**Last Updated**: September 16, 2026
