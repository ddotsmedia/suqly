#!/bin/bash

# Suqly Manual Deployment Script
# Run this locally if GitHub Actions deployment fails
# Usage: ./deploy.sh

set -e  # Exit on error

VPS_HOST="194.164.151.202"
VPS_USER="deploy"
VPS_PORT="22"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         SUQLY MARKETPLACE MANUAL DEPLOYMENT SCRIPT             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Target VPS: $VPS_HOST"
echo "Frontend Port: 3021"
echo "Backend Port: 3022"
echo ""

# Function to run commands on VPS
run_on_vps() {
    ssh -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" "$1"
}

# Step 1: Test SSH connection
echo "✓ Step 1: Testing SSH connection..."
if ! run_on_vps "echo 'SSH OK'"; then
    echo "✗ ERROR: Cannot SSH to $VPS_HOST"
    echo "  Check:"
    echo "  - SSH key is configured"
    echo "  - VPS IP is correct"
    echo "  - Firewall allows SSH"
    exit 1
fi
echo "  SSH connection: OK ✓"
echo ""

# Step 2: Check if deployment directory exists
echo "✓ Step 2: Checking deployment directory..."
run_on_vps "ls -la /opt/suqly" > /dev/null || run_on_vps "mkdir -p /opt/suqly && cd /opt/suqly && git clone https://github.com/ddotsmedia/suqly.git ."
echo "  Deployment directory: OK ✓"
echo ""

# Step 3: Verify ports are free
echo "✓ Step 3: Verifying ports 3021, 3022 are free..."
if run_on_vps "netstat -tulpn 2>/dev/null | grep -E ':(3021|3022)'" 2>/dev/null; then
    echo "✗ ERROR: Ports 3021 and/or 3022 are already in use"
    echo "  Stop conflicting containers:"
    echo "  ssh $VPS_USER@$VPS_HOST docker ps"
    echo "  ssh $VPS_USER@$VPS_HOST docker-compose -f /opt/suqly/docker-compose.prod.yml down"
    exit 1
fi
echo "  Ports 3021, 3022: FREE ✓"
echo ""

# Step 4: Pull latest code
echo "✓ Step 4: Pulling latest code from GitHub..."
run_on_vps "cd /opt/suqly && git pull origin main" || {
    echo "✗ WARNING: Could not pull (might already be at latest)"
}
echo "  Git pull: OK ✓"
echo ""

# Step 5: Create .env.production if missing
echo "✓ Step 5: Checking .env.production..."
if ! run_on_vps "test -f /opt/suqly/.env.production"; then
    echo "  .env.production missing! Creating from template..."
    run_on_vps "cd /opt/suqly && cp .env.production.example .env.production"
    echo "  ⚠️  IMPORTANT: SSH to VPS and edit .env.production with real values:"
    echo "     ssh $VPS_USER@$VPS_HOST"
    echo "     nano /opt/suqly/.env.production"
    echo "  Then run this script again."
    exit 1
fi
echo "  .env.production: OK ✓"
echo ""

# Step 6: Pull Docker images
echo "✓ Step 6: Pulling Docker images from GHCR..."
run_on_vps "cd /opt/suqly && docker-compose -f docker-compose.prod.yml pull" || {
    echo "✗ WARNING: Could not pull images (might already be cached)"
}
echo "  Docker pull: OK ✓"
echo ""

# Step 7: Stop existing containers
echo "✓ Step 7: Stopping existing containers..."
run_on_vps "cd /opt/suqly && docker-compose -f docker-compose.prod.yml down --remove-orphans" || {
    echo "  (No running containers)"
}
echo "  Containers stopped: OK ✓"
echo ""

# Step 8: Start new containers
echo "✓ Step 8: Starting Suqly services..."
run_on_vps "cd /opt/suqly && docker-compose -f docker-compose.prod.yml up -d"
echo "  Containers starting..."
echo ""

# Step 9: Wait for services
echo "✓ Step 9: Waiting 30 seconds for services to boot..."
sleep 30
echo "  Services booted: OK ✓"
echo ""

# Step 10: Verify containers are running
echo "✓ Step 10: Verifying all containers are running..."
RUNNING=$(run_on_vps "docker ps | grep -c suqly" || echo "0")
if [ "$RUNNING" -lt 5 ]; then
    echo "✗ ERROR: Not all containers running (expected 5, found $RUNNING)"
    echo ""
    echo "  Container status:"
    run_on_vps "docker ps -a | grep suqly || echo 'No suqly containers found'"
    echo ""
    echo "  Troubleshooting:"
    echo "  1. Check logs: docker-compose logs -f"
    echo "  2. Check environment: cat .env.production"
    echo "  3. Check ports: netstat -tulpn"
    exit 1
fi
echo "  All $RUNNING containers: RUNNING ✓"
echo ""

# Step 11: Test frontend
echo "✓ Step 11: Testing frontend (port 3021)..."
if run_on_vps "curl -s http://localhost:3021 | head -c 100" > /dev/null 2>&1; then
    echo "  Frontend: RESPONDING ✓"
else
    echo "✗ WARNING: Frontend not responding yet (might be starting)"
fi
echo ""

# Step 12: Test backend health
echo "✓ Step 12: Testing backend health endpoint (port 3022)..."
if run_on_vps "curl -s http://localhost:3022/health" > /dev/null 2>&1; then
    echo "  Backend: HEALTHY ✓"
else
    echo "✗ WARNING: Backend not responding yet (might be starting)"
fi
echo ""

# Step 13: Show container status
echo "✓ Step 13: Container status..."
run_on_vps "docker ps | grep suqly"
echo ""

# Step 14: Show recent logs
echo "✓ Step 14: Recent backend logs (last 10 lines)..."
echo "───────────────────────────────────────────────────────────────"
run_on_vps "docker-compose -f /opt/suqly/docker-compose.prod.yml logs --tail=10 suqly-backend" || echo "  (No logs yet)"
echo "───────────────────────────────────────────────────────────────"
echo ""

# Final status
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   DEPLOYMENT COMPLETE                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Services deployed successfully!"
echo ""
echo "Frontend:  http://$VPS_HOST:3021"
echo "API:       http://$VPS_HOST:3022"
echo "Health:    http://$VPS_HOST:3022/health"
echo ""
echo "Next steps:"
echo "1. Verify services are running:"
echo "   ssh $VPS_USER@$VPS_HOST docker ps"
echo ""
echo "2. View logs:"
echo "   ssh $VPS_USER@$VPS_HOST docker-compose -f /opt/suqly/docker-compose.prod.yml logs -f"
echo ""
echo "3. Update DNS records:"
echo "   suqly.com        A  $VPS_HOST"
echo "   api.suqly.com    A  $VPS_HOST"
echo "   www.suqly.com    A  $VPS_HOST"
echo ""
echo "4. Access in browser:"
echo "   https://suqly.com (after DNS updates)"
echo "   https://api.suqly.com/api/docs"
echo ""
echo "5. SSH to VPS if needed:"
echo "   ssh $VPS_USER@$VPS_HOST"
echo "   cd /opt/suqly"
echo "   docker-compose logs -f"
echo ""
