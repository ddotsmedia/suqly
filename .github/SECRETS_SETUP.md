# GitHub Actions Secrets Configuration

## Required Secrets for Deployment

Add these secrets to: **Settings → Secrets and variables → Actions**

### 1. VPS_HOST
- **Value:** `194.164.151.202`
- **Purpose:** VPS IP address for deployment
- **Type:** Plain text

### 2. VPS_USER
- **Value:** `root`
- **Purpose:** SSH username for VPS access
- **Type:** Plain text

### 3. VPS_PORT
- **Value:** `22` (default SSH port)
- **Purpose:** SSH port on VPS
- **Type:** Plain text

### 4. VPS_SSH_KEY
- **Value:** (your SSH private key contents)
- **Format:** Must start with `-----BEGIN OPENSSH PRIVATE KEY-----`
- **How to get:** Copy contents of your SSH private key file (e.g., `~/.ssh/id_rsa`)
- **Type:** Secret (sensitive)

### 5. GITHUB_TOKEN
- **Value:** Automatically provided by GitHub Actions
- **Purpose:** Authenticate to GitHub Container Registry (ghcr.io)
- **Type:** Automatic (no setup needed)

---

## Setting Up SSH Key

### Generate SSH Key (if you don't have one):
```bash
ssh-keygen -t ed25519 -f ~/.ssh/suqly_vps -C "suqly-deployment"
```

### Add to VPS:
```bash
ssh-copy-id -i ~/.ssh/suqly_vps root@194.164.151.202
```

### Get Private Key for GitHub Secret:
```bash
cat ~/.ssh/suqly_vps
```

Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`) and paste into GitHub Secret `VPS_SSH_KEY`.

---

## Testing SSH Locally

```bash
ssh -i ~/.ssh/suqly_vps -p 22 root@194.164.151.202 "docker ps | grep suqly"
```

Expected output: List of running Suqly containers

---

## Verification Checklist

- [ ] VPS_HOST is set to `194.164.151.202`
- [ ] VPS_USER is set to `root`
- [ ] VPS_PORT is set to `22`
- [ ] VPS_SSH_KEY contains full SSH private key (-----BEGIN...-----END)
- [ ] SSH key is authorized on VPS (`~/.ssh/authorized_keys`)
- [ ] Can SSH locally: `ssh -i key root@194.164.151.202`
- [ ] Docker is running on VPS: `docker ps`
- [ ] Docker-compose is installed: `docker-compose --version`
- [ ] `/opt/suqly` directory exists on VPS

---

## Troubleshooting

### "Permission denied (publickey)"
- SSH key not added to VPS `~/.ssh/authorized_keys`
- SSH key doesn't match VPS setup
- **Fix:** Run `ssh-copy-id -i ~/.ssh/suqly_vps root@194.164.151.202`

### "Host key verification failed"
- First SSH connection hasn't added host to `known_hosts`
- **Fix:** Manually SSH once: `ssh -i ~/.ssh/suqly_vps root@194.164.151.202`

### "docker: command not found"
- Docker not installed on VPS
- **Fix:** SSH to VPS and install Docker

### "docker-compose: command not found"
- docker-compose not installed
- **Fix:** Install: `apt-get update && apt-get install -y docker-compose-plugin`

### "Cannot connect to ghcr.io"
- Docker registry login failed
- Check GITHUB_TOKEN is valid
- **Fix:** Ensure GitHub Actions token has `packages:write` permission

---

## Updating Secrets

1. Go to: https://github.com/ddotsmedia/suqly/settings/secrets/actions
2. Click the secret name (e.g., `VPS_SSH_KEY`)
3. Click "Update secret"
4. Paste new value
5. Click "Update secret"

No need to re-trigger workflows after updating secrets — they use the latest value.
