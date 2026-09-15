# Suqly Quick Start: Docker CI/CD Deployment

## Prerequisites Checklist
- [ ] Forked/pushed Suqly repository to GitHub
- [ ] Access to VPS (194.164.151.202) as root
- [ ] GitHub repository settings access
- [ ] DNS control for suqly.com

## 5-Minute Setup

### 1. Generate SSH Deploy Key
```bash
ssh-keygen -t ed25519 -f ~/.ssh/suqly_deploy -N ""
cat ~/.ssh/suqly_deploy          # Copy private key
cat ~/.ssh/suqly_deploy.pub      # Add to VPS ~/.ssh/authorized_keys
```

### 2. Add GitHub Secrets
Go to: **GitHub Repo → Settings → Secrets and Variables → Actions**

Required secrets (8 total):
```
VPS_HOST                  → 194.164.151.202
VPS_USER                  → root
VPS_SSH_KEY               → (private key from step 1)
DB_USER                   → postgres
DB_PASSWORD               → (strong password)
DB_NAME                   → suqly_prod
JWT_SECRET                → (min 32 random chars)
API_URL                   → https://suqly.com/api
FRONTEND_URL              → https://suqly.com
NEXT_PUBLIC_API_URL       → https://suqly.com/api
NEXT_PUBLIC_APP_URL       → https://suqly.com
```

### 3. Deploy
```bash
git add .
git commit -m "chore: add docker ci-cd"
git push origin main
```

→ GitHub Actions workflow starts automatically!

### 4. Monitor
- GitHub → Actions → Watch workflow run (5-10 minutes)
- Logs will show all steps: test → build → push → deploy

### 5. Verify
```bash
curl https://suqly.com              # Frontend
curl https://suqly.com/api/health   # Backend health
```

## Files You Need to Know

| File | Purpose |
|------|---------|
| `Dockerfile.backend` | Builds NestJS app container |
| `Dockerfile.frontend` | Builds Next.js app container |
| `docker-compose.prod.yml` | Production container orchestration |
| `.github/workflows/ci-cd-docker.yml` | GitHub Actions automation |
| `DOCKER_CI_CD_SETUP.md` | Full setup guide (detailed) |
| `deploy.sh` | Helper script for SSH operations |

## Common Commands

```bash
# Check service status
./deploy.sh status

# View logs
./deploy.sh logs
./deploy.sh logs-backend
./deploy.sh logs-frontend

# Restart services
./deploy.sh restart
./deploy.sh restart-backend

# Check health
./deploy.sh health

# Pull latest images
./deploy.sh pull
```

## Next Commits Trigger Automatic Deployment

Every push to `main` automatically:
1. Runs tests & linting
2. Builds Docker images
3. Pushes to ghcr.io
4. Deploys to VPS

No manual deployment needed! 🚀

## Troubleshooting

**Workflow failed?**
→ Check GitHub Actions logs for error details

**Services not running?**
→ `./deploy.sh logs` shows what went wrong

**Port already in use?**
→ Run `ssh root@194.164.151.202 'netstat -tlnp | grep 3021'`

**Need to manually restart?**
→ `./deploy.sh restart`

## Full Documentation
See `DOCKER_CI_CD_SETUP.md` for complete guide including SSL/TLS setup.
