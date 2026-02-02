#!/bin/bash

# Device Passport System - Production Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Example: ./scripts/deploy.sh production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="device-passport-system"
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║   Device Passport System - Deployment Script             ║${NC}"
echo -e "${GREEN}║   Environment: ${ENVIRONMENT}${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running!${NC}"
  exit 1
fi

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
  echo -e "${RED}Error: $COMPOSE_FILE not found!${NC}"
  exit 1
fi

# Check if .env file exists
if [ ! -f ".env.${ENVIRONMENT}" ]; then
  echo -e "${YELLOW}Warning: .env.${ENVIRONMENT} not found!${NC}"
  echo -e "${YELLOW}Please create it from .env.${ENVIRONMENT}.example${NC}"
  exit 1
fi

# Backup current deployment
echo -e "${YELLOW}Creating backup of current deployment...${NC}"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Tag current images as backup
docker tag device-passport-api:latest device-passport-api:backup 2>/dev/null || true
docker tag device-passport-web:latest device-passport-web:backup 2>/dev/null || true

echo -e "${GREEN}✓ Backup created${NC}"
echo ""

# Pull latest code (if in git repo)
if [ -d ".git" ]; then
  echo -e "${YELLOW}Pulling latest code...${NC}"
  git pull origin main
  echo -e "${GREEN}✓ Code updated${NC}"
  echo ""
fi

# Build images
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose -f "$COMPOSE_FILE" --env-file ".env.${ENVIRONMENT}" build --no-cache
echo -e "${GREEN}✓ Images built successfully${NC}"
echo ""

# Stop old containers
echo -e "${YELLOW}Stopping old containers...${NC}"
docker-compose -f "$COMPOSE_FILE" --env-file ".env.${ENVIRONMENT}" down
echo -e "${GREEN}✓ Old containers stopped${NC}"
echo ""

# Start new containers
echo -e "${YELLOW}Starting new containers...${NC}"
docker-compose -f "$COMPOSE_FILE" --env-file ".env.${ENVIRONMENT}" up -d
echo -e "${GREEN}✓ New containers started${NC}"
echo ""

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 10

# Check if database is ready
MAX_ATTEMPTS=30
ATTEMPT=0

until docker-compose -f "$COMPOSE_FILE" exec -T db pg_isready -U passport_user || [ $ATTEMPT -eq $MAX_ATTEMPTS ]; do
  echo "Waiting for database... ($ATTEMPT/$MAX_ATTEMPTS)"
  sleep 2
  ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo -e "${RED}Error: Database failed to start!${NC}"
  echo -e "${YELLOW}Rolling back...${NC}"
  docker-compose -f "$COMPOSE_FILE" down
  docker tag device-passport-api:backup device-passport-api:latest
  docker tag device-passport-web:backup device-passport-web:latest
  docker-compose -f "$COMPOSE_FILE" --env-file ".env.${ENVIRONMENT}" up -d
  exit 1
fi

echo -e "${GREEN}✓ Database is ready${NC}"
echo ""

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose -f "$COMPOSE_FILE" exec -T api pnpm migration:run
echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

# Health check
echo -e "${YELLOW}Running health check...${NC}"
ATTEMPT=0
MAX_ATTEMPTS=30

until curl -f http://localhost:3000/api/v1/health || [ $ATTEMPT -eq $MAX_ATTEMPTS ]; do
  echo "Waiting for API to be healthy... ($ATTEMPT/$MAX_ATTEMPTS)"
  sleep 2
  ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo -e "${RED}Error: Health check failed!${NC}"
  echo -e "${YELLOW}Rolling back...${NC}"
  docker-compose -f "$COMPOSE_FILE" down
  docker tag device-passport-api:backup device-passport-api:latest
  docker tag device-passport-web:backup device-passport-web:latest
  docker-compose -f "$COMPOSE_FILE" --env-file ".env.${ENVIRONMENT}" up -d
  exit 1
fi

echo -e "${GREEN}✓ Health check passed${NC}"
echo ""

# Clean up old images
echo -e "${YELLOW}Cleaning up old images...${NC}"
docker image prune -af --filter "until=24h"
echo -e "${GREEN}✓ Cleanup completed${NC}"
echo ""

# Show running containers
echo -e "${YELLOW}Running containers:${NC}"
docker-compose -f "$COMPOSE_FILE" ps
echo ""

# Show logs
echo -e "${YELLOW}Recent logs:${NC}"
docker-compose -f "$COMPOSE_FILE" logs --tail=50
echo ""

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║   Deployment completed successfully! 🚀                   ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║   Frontend: http://localhost                              ║${NC}"
echo -e "${GREEN}║   API: http://localhost:3000/api/v1                       ║${NC}"
echo -e "${GREEN}║   Swagger: http://localhost:3000/api/docs                 ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
