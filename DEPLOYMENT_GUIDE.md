# Suqly Production Deployment Guide

## Overview
This guide covers deploying Suqly to a production VPS using Docker, GitHub Actions CI/CD, and Nginx reverse proxy.

## Pre-deployment Checklist

### 1. GitHub Setup
- [ ] Fork/clone repository: https://github.com/ddotsmedia/suqly
- [ ] Create GitHub secrets in repository settings:
  - `VPS_HOST`: 194.164.151.202
  - `VPS_USER`: deploy
  - `VPS_PORT`: 22
  - `VPS_SSH_KEY`: Private SSH key (paste full key)

### 2. VPS Preparation
- [ ] Ubuntu 20.04+ LTS server
- [ ] SSH access configured
- [ ] Docker & Docker Compose installed
- [ ] Nginx installed
- [ ] Certbot installed for SSL

### 3. Domain & DNS
- [ ] Domain registered: suqly.com
- [ ] DNS records pointing to VPS:
  ```
  suqly.com        A  194.164.151.202
  api.suqly.com    A  194.164.151.202
  www.suqly.com    A  194.164.151.202
  ```

## VPS Setup Steps

### Step 1: SSH into VPS
```bash
ssh -i ~/.ssh/vps_key deploy@194.164.151.202
```

### Step 2: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker deploy

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx

# Install Fail2ban
sudo apt install -y fail2ban
```

### Step 3: Setup Application Directory
```bash
mkdir -p /home/deploy/suqly
cd /home/deploy/suqly

# Clone repository
git clone https://github.com/ddotsmedia/suqly.git .
```

### Step 4: Configure Environment
```bash
# Copy environment template
cp .env.production.example .env.production

# Edit with actual values
nano .env.production

# Set permissions
chmod 600 .env.production
sudo chown deploy:deploy .env.production
```

### Step 5: Setup SSL Certificate
```bash
sudo certbot certonly --standalone -d suqly.com -d api.suqly.com -d www.suqly.com

# Copy certificates for Docker
sudo mkdir -p /home/deploy/suqly/ssl
sudo cp /etc/letsencrypt/live/suqly.com/fullchain.pem /home/deploy/suqly/ssl/
sudo cp /etc/letsencrypt/live/suqly.com/privkey.pem /home/deploy/suqly/ssl/
sudo chown -R deploy:deploy /home/deploy/suqly/ssl
```

### Step 6: Create Nginx Configuration
Create `/home/deploy/suqly/nginx.conf`:
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;

    # Upstream
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:3001;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name suqly.com www.suqly.com api.suqly.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS - Frontend
    server {
        listen 443 ssl http2;
        server_name suqly.com www.suqly.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            limit_req zone=general burst=20;
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;
        }
    }

    # HTTPS - API
    server {
        listen 443 ssl http2;
        server_name api.suqly.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            limit_req zone=api burst=200;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;

            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

### Step 7: Start Services
```bash
cd /home/deploy/suqly

# Pull images
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Step 8: Setup SSL Auto-renewal
```bash
# Create renewal timer
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

## GitHub Actions Deployment

The `.github/workflows/deploy.yml` workflow will:
1. Build Docker images on push to main
2. Push to GitHub Container Registry
3. SSH into VPS and pull latest images
4. Restart services with `docker-compose up -d`
5. Run health checks
6. Notify on success/failure

### GitHub Secrets Required
```
VPS_HOST=194.164.151.202
VPS_USER=deploy
VPS_PORT=22
VPS_SSH_KEY=<paste-full-private-key>
```

## Monitoring & Maintenance

### Health Checks
```bash
# Backend
curl https://api.suqly.com/health

# Frontend
curl https://suqly.com/

# Database
docker-compose -f docker-compose.prod.yml exec postgres pg_isready
```

### Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs

# Specific service
docker-compose -f docker-compose.prod.yml logs backend

# Real-time
docker-compose -f docker-compose.prod.yml logs -f
```

### Backups
```bash
# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres suqly_prod > backup.sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres suqly_prod < backup.sql
```

## Troubleshooting

### Services won't start
```bash
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml up -d backend
```

### Database connection errors
```bash
# Check database is running
docker-compose -f docker-compose.prod.yml ps postgres

# Check logs
docker-compose -f docker-compose.prod.yml logs postgres

# Verify credentials in .env.production
```

### SSL certificate issues
```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew

# Fix permissions
sudo chown deploy:deploy /home/deploy/suqly/ssl
chmod 644 /home/deploy/suqly/ssl/*
```

## Performance Optimization

### Database
- Enable connection pooling in PostgreSQL
- Regular VACUUM and ANALYZE
- Index optimization via TypeORM

### Caching
- Redis for session storage
- CloudFlare CDN for static assets

### Monitoring
- Set up Sentry for error tracking
- Configure CloudWatch for logs
- Datadog/NewRelic for APM

## Security Hardening

### Firewall
```bash
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Fail2ban
```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo fail2ban-client set sshd bantime 3600 maxretry 5
```

### Updates
```bash
# Enable unattended upgrades
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Support

- **GitHub Issues**: https://github.com/ddotsmedia/suqly/issues
- **Documentation**: See README.md
- **Monitoring**: Check Sentry dashboard
