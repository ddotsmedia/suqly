# Suqly Quick Start — Deployment & Testing

**Status**: Production Ready ✅  
**Repository**: https://github.com/ddotsmedia/suqly  
**VPS**: 194.164.151.202  

---

## 🚀 Automated Deployment (Recommended)

GitHub Actions automatically deploys every push to `main`:

```bash
# 1. Make changes locally
cd C:\web\Suqly

# 2. Commit and push
git add .
git commit -m "your message"
git push origin main

# 3. Watch deployment
# https://github.com/ddotsmedia/suqly/actions
```

**That's it!** GitHub Actions handles:
- Building Docker images
- Pushing to GHCR
- Deploying to VPS
- Running migrations
- Health checks

---

## 🔧 Manual Deployment (If Needed)

### Prerequisite: SSH Key Setup
```bash
# 1. Ensure you have SSH key to VPS
# ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa

# 2. Test SSH
ssh deploy@194.164.151.202 "echo OK"
# Should output: OK
```

### Run Deployment Script
```bash
# 1. Make the script executable
chmod +x deploy.sh

# 2. Run deployment
./deploy.sh

# 3. Monitor output (should show all ✓)
```

### What the Script Does
- ✅ Pulls latest code from GitHub
- ✅ Verifies ports 3021, 3022 are free
- ✅ Pulls Docker images
- ✅ Stops old containers
- ✅ Starts new containers
- ✅ Tests frontend & backend
- ✅ Shows container status and logs

### If Script Fails
See "Troubleshooting" section below

---

## ✅ Verification Steps

### 1. Test Frontend (Port 3021)
```bash
# Should return HTML
curl http://194.164.151.202:3021
```

### 2. Test Backend (Port 3022)
```bash
# Should return {"status":"healthy",...}
curl http://194.164.151.202:3022/health
```

### 3. Check Running Containers
```bash
ssh deploy@194.164.151.202 docker ps | grep suqly

# Expected: 5 containers (postgres, redis, opensearch, backend, frontend)
```

### 4. View Logs
```bash
ssh deploy@194.164.151.202
cd /opt/suqly
docker-compose logs -f suqly-backend
```

### 5. Admin Panel
```bash
# After DNS update:
https://suqly.com/admin/settings
```

---

## 🌐 DNS Configuration

Update your domain registrar with these records:

```dns
suqly.com              A  194.164.151.202
api.suqly.com          A  194.164.151.202
www.suqly.com          A  194.164.151.202
```

Wait 5-30 minutes for DNS propagation, then:

```bash
# Should resolve to VPS IP
nslookup suqly.com
ping suqly.com

# Should work
https://suqly.com
https://api.suqly.com/health
```

---

## 📋 Troubleshooting

### Containers Won't Start

```bash
ssh deploy@194.164.151.202
cd /opt/suqly

# Check logs
docker-compose logs

# Common issues:
# 1. Missing .env.production
#    Fix: cp .env.production.example .env.production
#         nano .env.production (fill in secrets)
#
# 2. Ports in use
#    Fix: docker-compose down
#         docker ps (find conflicting containers)
#         docker kill <container-id>
#
# 3. Insufficient disk space
#    Fix: df -h (check disk usage)
#         docker system prune -a (clean up)
```

### Frontend Loads but API Fails

```bash
# Check backend is running
curl http://194.164.151.202:3022/health

# Check network
ssh deploy@194.164.151.202 docker network ls

# Restart backend
docker-compose restart suqly-backend

# Check frontend env var
docker-compose exec suqly-frontend env | grep NEXT_PUBLIC_API_URL
```

### Database Migrations Fail

```bash
# Check database is running
docker-compose exec postgres pg_isready

# Run migrations manually
docker-compose exec suqly-backend npm run typeorm migration:run

# Check migration status
docker-compose exec postgres psql -U postgres -d suqly_db -c "SELECT * FROM migrations;"
```

### Still Stuck?

1. Check GitHub Actions logs: https://github.com/ddotsmedia/suqly/actions
2. Check VPS logs: `docker-compose logs --tail=50`
3. Check disk space: `df -h`
4. Check memory: `free -h`
5. Check ports: `netstat -tulpn | grep -E '(3021|3022)'`

---

## 📊 Service Ports

| Service | Port | Access | Status |
|---------|------|--------|--------|
| Frontend | 3021 | http://194.164.151.202:3021 | App UI |
| Backend | 3022 | http://194.164.151.202:3022 | API |
| PostgreSQL | 5439 | Internal only | Database |
| Redis | 6384 | Internal only | Cache |
| OpenSearch | 9201 | Internal only | Search |

---

## 🔐 Environment Variables

Critical variables in `.env.production`:

```env
# Database
DB_PASSWORD=<strong-password>
JWT_SECRET=<32+-char-random-string>

# AI APIs
ANTHROPIC_API_KEY=sk-ant-...

# Live Commerce
AGORA_APP_ID=xxxxxxxx
AGORA_APP_CERTIFICATE=xxxxxxxx

# SMS/Email
TWILIO_ACCOUNT_SID=...
SENDGRID_API_KEY=...

# Stripe (optional for free tier)
STRIPE_SECRET_KEY=sk_test_...
```

**⚠️ NEVER commit `.env.production` to git!**

---

## 📈 Monitoring

### Health Check Endpoint
```bash
curl -s http://194.164.151.202:3022/health | jq .

# Response:
# {
#   "status": "healthy",
#   "timestamp": "2026-09-16T12:00:00Z",
#   "uptime": 3600,
#   "services": {
#     "database": "connected",
#     "redis": "connected",
#     "opensearch": "connected"
#   }
# }
```

### Container Health
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"

# All should show "Up X minutes"
```

### Disk Usage
```bash
df -h /

# Should be > 50% free
```

---

## 🔄 Rollback

If deployment breaks, rollback to previous version:

```bash
# 1. SSH to VPS
ssh deploy@194.164.151.202

# 2. Stop services
docker-compose -f /opt/suqly/docker-compose.prod.yml down

# 3. Revert code (or rerun previous GitHub Actions workflow)
cd /opt/suqly
git revert HEAD
# OR
git checkout <previous-commit-sha>

# 4. Restart
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Support Resources

| Issue | Reference |
|-------|-----------|
| Deployment guide | `DEPLOYMENT_GUIDE.md` |
| Operations | `MAINTENANCE.md` |
| Verification | `DEPLOYMENT_VERIFICATION.md` |
| Feature flags | `FEATURE_FLAGS_USAGE.md` |
| Code conventions | `CLAUDE.md` |
| Advanced features | `ADVANCED_FEATURES.md` |
| Competitor analysis | `COMPETITOR_ANALYSIS.md` |

---

## ✅ Final Checklist Before Going Live

- [ ] GitHub Actions deployed successfully
- [ ] All 5 containers running (`docker ps`)
- [ ] Frontend responds (port 3021)
- [ ] Backend healthy (port 3022/health)
- [ ] Database connected
- [ ] Redis working
- [ ] OpenSearch indexed
- [ ] DNS records updated
- [ ] HTTPS working (Let's Encrypt)
- [ ] Monitoring alerts configured
- [ ] Backups scheduled
- [ ] Team trained on operations

---

## 🎯 What's Next

1. **User Acquisition** — Start marketing
2. **Feature Toggles** — Test feature flags in admin
3. **Monitoring** — Watch error tracking (Sentry)
4. **Feedback** — Gather user feedback
5. **Payments** — Enable Stripe when ready (toggle in admin)

---

**Last Updated**: September 16, 2026  
**Status**: Production Ready ✅
