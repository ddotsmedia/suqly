# Suqly Maintenance Runbook

## Daily Operations

### Health Checks
```bash
# SSH into VPS
ssh deploy@194.164.151.202

# Check all services
cd /home/deploy/suqly
docker-compose -f docker-compose.prod.yml ps

# API health
curl https://api.suqly.com/health

# Frontend health
curl https://suqly.com/
```

### Monitor Logs
```bash
# Real-time logs
docker-compose -f docker-compose.prod.yml logs -f

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail 100

# Specific service (backend)
docker-compose -f docker-compose.prod.yml logs backend
```

### Database Monitoring
```bash
# Connect to database
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d suqly_prod

# Check connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Vacuum and analyze
VACUUM ANALYZE;
```

## Weekly Maintenance

### Database Backup
```bash
#!/bin/bash
BACKUP_DIR="/home/deploy/suqly/backups"
mkdir -p $BACKUP_DIR

docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres suqly_prod | gzip > \
  $BACKUP_DIR/suqly_$(date +%Y%m%d_%H%M%S).sql.gz

# Keep last 4 weeks
find $BACKUP_DIR -type f -mtime +28 -delete

echo "Backup completed: $(ls -lh $BACKUP_DIR | tail -1)"
```

### Certificate Renewal Check
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

### Disk Space Check
```bash
df -h
docker system df
```

### Update Docker Images
```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Monthly Maintenance

### Database Optimization
```bash
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d suqly_prod << EOF
VACUUM FULL ANALYZE;
REINDEX DATABASE suqly_prod;
EOF
```

### Security Updates
```bash
sudo apt update && sudo apt upgrade -y
sudo systemctl restart docker
sudo systemctl restart nginx
```

### Log Rotation
```bash
# Review logs
sudo du -sh /var/log/nginx/*
sudo du -sh /var/lib/docker/containers/*/*-json.log

# Compress old logs
find /var/log/nginx -type f -mtime +30 -exec gzip {} \;
```

### Performance Review
- Check Sentry for errors
- Review API response times
- Check Redis memory usage
- Verify database query performance

## Emergency Procedures

### Service Down - Backend
```bash
cd /home/deploy/suqly

# Check status
docker-compose -f docker-compose.prod.yml logs backend | tail -50

# Restart
docker-compose -f docker-compose.prod.yml restart backend

# Verify
curl https://api.suqly.com/health
```

### Service Down - Frontend
```bash
docker-compose -f docker-compose.prod.yml restart frontend
curl https://suqly.com/
```

### Database Connection Issues
```bash
# Check database
docker-compose -f docker-compose.prod.yml ps postgres

# View logs
docker-compose -f docker-compose.prod.yml logs postgres

# Check connections
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Force disconnect stuck connections
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';"
```

### Out of Disk Space
```bash
# Free Docker resources
docker system prune -a --volumes

# Check what's taking space
du -sh /var/lib/docker/*
du -sh /home/deploy/suqly/postgres_data

# Cleanup old backups if needed
rm -f /home/deploy/suqly/backups/*backup*.sql.gz
```

### SSL Certificate Expired
```bash
# Renew immediately
sudo certbot renew --force-renewal

# Copy to Docker volume
sudo cp /etc/letsencrypt/live/suqly.com/fullchain.pem /home/deploy/suqly/ssl/
sudo cp /etc/letsencrypt/live/suqly.com/privkey.pem /home/deploy/suqly/ssl/
sudo chown deploy:deploy /home/deploy/suqly/ssl/*

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Memory Issues
```bash
# Check memory usage
free -h
docker stats

# Stop non-critical services
docker-compose -f docker-compose.prod.yml stop opensearch

# Restart backend/frontend
docker-compose -f docker-compose.prod.yml restart backend frontend
```

## Deployment Process

### Deploy New Code
1. **Merge to main**
   - Create PR, get approval
   - Merge to main

2. **Automatic Deployment**
   - GitHub Actions triggered
   - Docker images built and pushed
   - VPS pulls latest images
   - Services restart automatically
   - Health checks run

3. **Manual Verification**
   ```bash
   # Check services are running
   docker-compose -f docker-compose.prod.yml ps
   
   # Check logs for errors
   docker-compose -f docker-compose.prod.yml logs backend
   
   # Test endpoints
   curl https://api.suqly.com/health
   curl https://suqly.com/
   ```

### Rollback
```bash
# View image history
docker images ghcr.io/ddotsmedia/suqly/backend

# Use previous image
docker-compose -f docker-compose.prod.yml down
# Edit docker-compose.prod.yml to use previous image tag
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring Setup

### Sentry Integration
- Error tracking automatically enabled via SENTRY_DSN
- Exceptions and performance issues tracked
- Alerts configured for critical errors

### CloudWatch/Datadog
- Consider adding application performance monitoring
- Track API response times, database queries
- Set up alerts for anomalies

### Uptime Monitoring
```bash
# Simple cron job for health checks
0 * * * * curl -f https://api.suqly.com/health || curl -X POST https://alerts.example.com/down
```

## Documentation

- **Architecture**: See `DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: See `DEPLOYMENT_GUIDE.md` Troubleshooting section
- **API Docs**: http://localhost:3001/api/docs (or https://api.suqly.com/api/docs)
- **Project Status**: See `PROJECT_STATUS.md`

## Contact & Support

- **GitHub Issues**: Report bugs at https://github.com/ddotsmedia/suqly/issues
- **Sentry**: Error tracking dashboard
- **VPS Admin**: SSH as deploy user

## Quick Reference

| Task | Command |
|------|---------|
| Start all services | `docker-compose -f docker-compose.prod.yml up -d` |
| Stop all services | `docker-compose -f docker-compose.prod.yml down` |
| View logs | `docker-compose -f docker-compose.prod.yml logs -f` |
| Restart backend | `docker-compose -f docker-compose.prod.yml restart backend` |
| Database backup | `docker-compose -f docker-compose.prod.yml exec postgres pg_dump ...` |
| Check health | `curl https://api.suqly.com/health` |
| SSH to VPS | `ssh deploy@194.164.151.202` |
