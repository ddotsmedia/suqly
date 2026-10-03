#!/bin/bash
# Deployment script for Suqly - runs on VPS

set -e

cd /opt/suqly

echo "Updating .env file with secrets..."

# Write .env using environment variables
{
  echo "DB_HOST=postgres"
  echo "DB_PORT=5432"
  echo "DB_USER=${DB_USER}"
  echo "DB_PASSWORD=${DB_PASSWORD}"
  echo "DB_NAME=${DB_NAME}"
  echo "DB_RUN_MIGRATIONS=true"
  echo "DB_LOGGING=false"
  echo "DB_SSL=false"
  echo "DB_SYNC=true"
  echo ""
  echo "REDIS_HOST=redis"
  echo "REDIS_PORT=6379"
  echo ""
  echo "JWT_SECRET=${JWT_SECRET}"
  echo ""
  echo "TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}"
  echo "TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}"
  echo "TWILIO_PHONE=${TWILIO_PHONE}"
  echo ""
  echo "SENDGRID_API_KEY=${SENDGRID_API_KEY}"
  echo "SENDGRID_FROM_EMAIL=${SENDGRID_FROM_EMAIL}"
  echo ""
  echo "STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}"
  echo "STRIPE_PUBLIC_KEY=${STRIPE_PUBLIC_KEY}"
  echo ""
  echo "FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}"
  echo "FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}"
  echo "FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}"
  echo ""
  echo "OPENSEARCH_PASSWORD=${OPENSEARCH_PASSWORD}"
  echo "OPENSEARCH_URL=http://opensearch:9200"
  echo ""
  echo "SENTRY_DSN=${SENTRY_DSN}"
  echo ""
  echo "NODE_ENV=production"
  echo "PORT=3001"
  echo ""
  echo "NEXT_PUBLIC_API_URL=https://suqly.com/api"
  echo "NEXT_PUBLIC_APP_NAME=Suqly"
  echo "NEXT_PUBLIC_ENABLE_ANALYTICS=true"
  echo "NEXT_PUBLIC_ENABLE_SENTRY=true"
  echo ""
  echo "DOMAIN=suqly.com"
  echo "API_DOMAIN=suqly.com"
  echo ""
  echo "ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}"
  echo ""
  echo "ML_MODEL_PATH=/opt/models/price-prediction.onnx"
} > .env

echo "Logging in to Docker registry..."
echo "${REGISTRY_TOKEN}" | docker login ghcr.io -u "${REGISTRY_USERNAME}" --password-stdin

echo "Pulling latest images..."
docker compose -f docker-compose.prod.yml pull

echo "Stopping old containers..."
docker compose -f docker-compose.prod.yml down

echo "Starting P2.7 containers..."
docker compose -f docker-compose.prod.yml up -d

echo "Waiting for services..."
sleep 15

echo "Checking backend health..."
curl -f http://localhost:3001/health || exit 1

echo "Deployment successful!"
