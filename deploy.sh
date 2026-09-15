#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="${VPS_HOST:-194.164.151.202}"
VPS_USER="${VPS_USER:-root}"
VPS_PROJECT_PATH="/opt/suqly"

echo -e "${YELLOW}Suqly Deployment Helper${NC}"
echo "================================"
echo "VPS: $VPS_USER@$VPS_HOST"
echo "Path: $VPS_PROJECT_PATH"
echo ""

# Parse command
case "$1" in
  status)
    echo -e "${YELLOW}Checking service status...${NC}"
    ssh $VPS_USER@$VPS_HOST "cd $VPS_PROJECT_PATH && docker-compose -f docker-compose.prod.yml ps"
    ;;
  logs)
    echo -e "${YELLOW}Showing recent logs...${NC}"
    ssh $VPS_USER@$VPS_HOST "cd $VPS_PROJECT_PATH && docker-compose -f docker-compose.prod.yml logs --tail=100"
    ;;
  logs-backend)
    echo -e "${YELLOW}Backend logs:${NC}"
    ssh $VPS_USER@$VPS_HOST "cd $VPS_PROJECT_PATH && docker-compose -f docker-compose.prod.yml logs --tail=50 backend"
    ;;
  logs-frontend)
    echo -e "${YELLOW}Frontend logs:${NC}"
    ssh $VPS_USER@$VPS_HOST "cd $VPS_PROJECT_PATH && docker-compose -f docker-compose.prod.yml logs --tail=50 frontend"
    ;;
  restart)
    echo -e "${YELLOW}Restarting services...${NC}"
    ssh $VPS_USER@$VPS_HOST "cd $VPS_PROJECT_PATH && docker-compose -f docker-compose.prod.yml restart"
    echo -e "${GREEN}✓ Services restarted${NC}"
    ;;
  restart-backend)
    echo -e "${YELLOW}Restarting backend...${NC}"
    ssh $VPS_USER@$VPS_HOST "cd $VPS_PROJECT_PATH && docker-compose -f docker-compose.prod.yml restart backend"
    echo -e "${GREEN}✓ Backend restarted${NC}"
    ;;
  restart-frontend)
    echo -e "${YELLOW}Restarting frontend...${NC}"
    ssh $VPS_USER@$VPS_HOST "cd $VPS_PROJECT_PATH && docker-compose -f docker-compose.prod.yml restart frontend"
    echo -e "${GREEN}✓ Frontend restarted${NC}"
    ;;
  health)
    echo -e "${YELLOW}Checking service health...${NC}"
    echo "Frontend: $(curl -s https://suqly.com/ -o /dev/null -w '%{http_code}')"
    echo "Backend: $(curl -s https://suqly.com/api/health -o /dev/null -w '%{http_code}')"
    ;;
  pull)
    echo -e "${YELLOW}Pulling latest images...${NC}"
    ssh $VPS_USER@$VPS_HOST << 'DEPLOY'
      cd /opt/suqly
      docker pull ghcr.io/*/suqly-backend:latest
      docker pull ghcr.io/*/suqly-frontend:latest
      docker-compose -f docker-compose.prod.yml up -d
DEPLOY
    echo -e "${GREEN}✓ Images pulled and services updated${NC}"
    ;;
  *)
    echo "Usage: $0 {status|logs|logs-backend|logs-frontend|restart|restart-backend|restart-frontend|health|pull}"
    echo ""
    echo "Commands:"
    echo "  status           - Show container status"
    echo "  logs             - Show recent logs"
    echo "  logs-backend     - Show backend logs"
    echo "  logs-frontend    - Show frontend logs"
    echo "  restart          - Restart all services"
    echo "  restart-backend  - Restart backend only"
    echo "  restart-frontend - Restart frontend only"
    echo "  health           - Check service health"
    echo "  pull             - Pull latest images and restart"
    exit 1
    ;;
esac
