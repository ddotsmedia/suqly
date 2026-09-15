# Suqly: Docker + GitHub Actions CI/CD Setup Guide

## Overview
This setup implements full CI/CD automation for Suqly using:
- **GitHub Actions**: Automated testing, linting, building
- **Docker**: Containerized backend (NestJS) and frontend (Next.js)
- **ghcr.io**: GitHub Container Registry for image storage
- **VPS Deployment**: Automated deployment to your Hostinger VPS (194.164.151.202)

## Architecture

```
Push to GitHub (main/develop)
  ↓
GitHub Actions CI Pipeline
  ├─ Setup & Install Dependencies
  ├─ Lint (Backend + Frontend)
  ├─ Test (Backend + Frontend)
  └─ Build (Backend + Frontend)
  ↓
Security Audit
  ↓
Build Docker Images
  ├─ Backend (NestJS)
  └─ Frontend (Next.js)
  ↓
Push to ghcr.io
  ↓
SSH to VPS → Pull Images → docker-compose up
  ↓
Service Running on suqly.com
```

## Step 1: Create GitHub Secrets

Navigate to: **GitHub Repository → Settings → Secrets and Variables → Actions → New repository secret**

Add the following secrets:

### VPS Connection Secrets
- **VPS_HOST**: `194.164.151.202`
- **VPS_USER**: `root` (or your SSH user)
- **VPS_SSH_KEY**: (See "Generate SSH Deploy Key" section below)

### Database Secrets
- **DB_USER**: `postgres`
- **DB_PASSWORD**: `your-strong-password-here`
- **DB_NAME**: `suqly_prod`

### Application Secrets
- **JWT_SECRET**: `your-jwt-secret-key-min-32-chars`
- **API_URL**: `https://suqly.com/api`
- **FRONTEND_URL**: `https://suqly.com`

### Next.js Public Secrets
- **NEXT_PUBLIC_API_URL**: `https://suqly.com/api`
- **NEXT_PUBLIC_APP_URL**: `https://suqly.com`

## Step 2: Generate SSH Deploy Key

Run this on your local machine:

```bash
# Generate SSH key for deployment
ssh-keygen -t ed25519 -f /tmp/suqly_deploy -N ""

# Display the private key (copy this to VPS_SSH_KEY secret)
cat /tmp/suqly_deploy

# Add the public key to VPS
cat /tmp/suqly_deploy.pub | ssh root@194.164.151.202 'cat >> ~/.ssh/authorized_keys'
```

## Step 3: Prepare VPS

```bash
# SSH into your VPS
ssh root@194.164.151.202

# Create deployment directory
mkdir -p /opt/suqly
cd /opt/suqly

# Copy docker-compose.prod.yml to VPS
# (This will be deployed automatically by GitHub Actions)

# Ensure Docker and Docker Compose are installed
docker --version
docker-compose --version

# Logout from any existing Docker registries
docker logout

# Test permissions
docker ps
```

## Step 4: Update DNS

For suqly.com, point your DNS to the VPS IP: `194.164.151.202`

If using a subdomain, add an A record:
- Type: A
- Name: suqly (or subdomain)
- Value: 194.164.151.202
- TTL: 3600

## Step 5: Configure SSL/TLS (Nginx Reverse Proxy)

On the VPS, set up Nginx as a reverse proxy:

```bash
# SSH into VPS
ssh root@194.164.151.202

# Install Nginx
apt update && apt install -y nginx certbot python3-certbot-nginx

# Create Nginx config
cat > /etc/nginx/sites-available/suqly.com << 'NGINX_EOF'
server {
    listen 80;
    server_name suqly.com www.suqly.com;
    
    location / {
        proxy_pass http://localhost;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }
    
    location /api {
        proxy_pass http://localhost:3021;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }
}
NGINX_EOF

# Enable the site
ln -sf /etc/nginx/sites-available/suqly.com /etc/nginx/sites-enabled/

# Test Nginx config
nginx -t

# Enable Nginx
systemctl enable nginx
systemctl start nginx

# Set up SSL with Let's Encrypt
certbot --nginx -d suqly.com -d www.suqly.com
```

## Step 6: Deploy

### First-Time Deployment

```bash
# On your local machine, make a commit and push to main
git add .
git commit -m "chore: setup docker ci-cd pipeline"
git push origin main
```

The GitHub Actions workflow will automatically:
1. Run tests and linting
2. Build Docker images
3. Push to ghcr.io
4. Deploy to VPS via SSH

### Monitor Deployment

1. Go to **GitHub Repository → Actions**
2. Watch the workflow run
3. Check VPS services:

```bash
# SSH into VPS
ssh root@194.164.151.202

# Check running containers
docker ps

# View logs
docker-compose -f /opt/suqly/docker-compose.prod.yml logs -f

# Check service health
curl http://localhost:3000/health      # Frontend
curl http://localhost:3021/health      # Backend API
```

## Step 7: Post-Deployment Checks

```bash
# Test from local machine
curl https://suqly.com/              # Frontend
curl https://suqly.com/api/health    # Backend API

# Check container logs
ssh root@194.164.151.202 'docker-compose -f /opt/suqly/docker-compose.prod.yml logs --tail=100'

# Restart services if needed
ssh root@194.164.151.202 'docker-compose -f /opt/suqly/docker-compose.prod.yml restart'
```

## Files Created

- `Dockerfile.backend` - Multi-stage build for NestJS
- `Dockerfile.frontend` - Multi-stage build for Next.js  
- `docker-compose.prod.yml` - Production Docker Compose with all services
- `.github/workflows/ci-cd-docker.yml` - GitHub Actions CI/CD pipeline

## Key Features

✅ **Automated Testing**: Runs before each deployment  
✅ **Security Scanning**: npm audit integrated  
✅ **Multi-stage Builds**: Optimized Docker images  
✅ **Health Checks**: Built into containers  
✅ **Zero-downtime Deployment**: Uses docker-compose  
✅ **Environment Management**: .env file from GitHub Secrets  
✅ **Logging**: Full container logs accessible via SSH  

## Troubleshooting

### Deployment Failed
```bash
# Check GitHub Actions logs: GitHub → Actions → Failed workflow

# Check VPS SSH access
ssh -i /path/to/private/key root@194.164.151.202 'docker ps'

# Verify GitHub Secrets are set
# (Go to Settings → Secrets and verify all secrets exist)
```

### Services Not Starting
```bash
ssh root@194.164.151.202
docker-compose -f /opt/suqly/docker-compose.prod.yml logs backend
docker-compose -f /opt/suqly/docker-compose.prod.yml logs frontend
```

### Port Already in Use
```bash
# Find what's using the port
ssh root@194.164.151.202
netstat -tlnp | grep 3021
netstat -tlnp | grep 80
```

## Next Steps

1. ✅ Complete Steps 1-7 above
2. Push to main branch and monitor Actions workflow
3. Verify services running: `curl https://suqly.com`
4. Set up monitoring/alerts for production (optional)
5. Document deployment procedures for team

## Support

For issues or questions about this setup, refer to:
- GitHub Actions Docs: https://docs.github.com/en/actions
- Docker Docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
