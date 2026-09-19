# Fixing SSH Key in GitHub Secrets

## Problem
GitHub Actions deploy is failing with SSH key format error (libcrypto error).

## Solution: Update GitHub Secrets with Properly Formatted Key

### Step 1: Get the SSH Private Key Content

The valid SSH private key is located at `~/.ssh/id_rsa`. The key format is correct:
- Starts with: `-----BEGIN OPENSSH PRIVATE KEY-----`
- Ends with: `-----END OPENSSH PRIVATE KEY-----`

### Step 2: Update GitHub Secrets

1. **Go to GitHub Repository Settings:**
   - URL: https://github.com/ddotsmedia/suqly/settings/secrets/actions

2. **Update the `VPS_SSH_KEY` Secret:**
   - Click on the `VPS_SSH_KEY` secret
   - Click "Update secret"
   - **IMPORTANT:** Paste the ENTIRE key including header and footer:

```
-----BEGIN OPENSSH PRIVATE KEY-----
[multiline key content here]
-----END OPENSSH PRIVATE KEY-----
```

3. **Ensure No Extra Formatting:**
   - Do NOT add any extra lines before or after
   - Do NOT add spaces or tabs
   - Preserve the exact line breaks from the original file

### Step 3: Verify SSH Key Locally

Before triggering the workflow, test SSH connectivity:

```bash
# Test SSH access to VPS
ssh -i ~/.ssh/id_rsa -p 22 root@194.164.151.202 "whoami"

# Expected output: root
```

If this fails:
- Check key permissions: `ls -l ~/.ssh/id_rsa` (should be `-rw-------`)
- Check key is authorized on VPS: `ssh -v -i ~/.ssh/id_rsa root@194.164.151.202`

### Step 4: Re-trigger Deployment

Once GitHub Secrets is updated:

**Option A: Manual Trigger**
1. Go to: https://github.com/ddotsmedia/suqly/actions
2. Click "Deploy Suqly to Production"
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow"

**Option B: Automatic Trigger**
```bash
cd ~/web/Suqly
git commit --allow-empty -m "trigger: deploy P2.7 with fixed SSH key"
git push origin main
```

### Step 5: Monitor the Deployment

Watch the GitHub Actions workflow:
- Go to: https://github.com/ddotsmedia/suqly/actions
- Click the running workflow
- Watch "Deploy to VPS" step for:
  - ✓ SSH key loading
  - ✓ Docker registry login
  - ✓ Image pulling
  - ✓ Containers starting
  - ✓ Health check passing

### Step 6: Verify P2.7 is Running

After deployment completes, verify:

```bash
# 1. Check running containers
docker ps | grep suqly

# 2. Test backend health
curl https://suqly.com/api/health

# 3. Test frontend
curl https://suqly.com/

# 4. Check container image versions
docker ps --format "table {{.Image}}\t{{.Names}}\t{{.RunningFor}}"
# Should show: ghcr.io/ddotsmedia/suqly-backend:latest
#             ghcr.io/ddotsmedia/suqly-frontend:latest
```

---

## Troubleshooting

### If SSH Still Fails

1. **Verify key hasn't been modified:**
   ```bash
   # Generate key hash
   ssh-keygen -l -f ~/.ssh/id_rsa
   
   # Output should be consistent across runs
   ```

2. **Check authorized_keys on VPS:**
   ```bash
   ssh root@194.164.151.202 "wc -l ~/.ssh/authorized_keys"
   
   # Should show at least 1 line (your public key)
   ```

3. **Manually add key to VPS if needed:**
   ```bash
   # Copy public key to VPS
   ssh-copy-id -i ~/.ssh/id_rsa root@194.164.151.202
   
   # Verify
   ssh -i ~/.ssh/id_rsa root@194.164.151.202 "echo 'SSH OK'"
   ```

4. **Check GitHub Actions secret format:**
   - Make sure there are NO extra spaces or characters
   - Make sure line breaks are preserved (not all on one line)
   - Make sure BEGIN/END markers are intact

### If Deploy Still Fails After SSH Works

Check the deploy step output in GitHub Actions:
- "Logging in to Docker registry" — Docker login issue
- "Pulling latest images" — Registry or image not found
- "Starting containers" — docker-compose or Docker daemon issue
- "Health check" — Backend not starting

---

## SSH Key Reference

**Current key location:** `~/.ssh/id_rsa`

**Key format:** OpenSSH Private Key (RSA)

**Public key:** `~/.ssh/id_rsa.pub` (what's on VPS in authorized_keys)

**Key fingerprint:**
```
ssh-keygen -l -f ~/.ssh/id_rsa
```

---

## Emergency Workaround: Manual Deployment

If GitHub Actions continues to fail, manually deploy to VPS:

```bash
# SSH to VPS
ssh root@194.164.151.202

# Navigate to suqly directory
cd /opt/suqly

# Login to Docker registry (use GitHub PAT)
docker login ghcr.io
# Username: <github-username>
# Password: <github-PAT-token>

# Pull latest images
docker pull ghcr.io/ddotsmedia/suqly-backend:latest
docker pull ghcr.io/ddotsmedia/suqly-frontend:latest

# Stop old containers
docker-compose -f docker-compose.prod.yml down

# Start P2.7 containers
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
sleep 10

# Verify health
curl http://localhost:3001/health
curl http://localhost:3000/

# Check logs if needed
docker-compose -f docker-compose.prod.yml logs backend
```

---

**Last Updated:** 2026-09-19
**Status:** Ready to deploy P2.7
