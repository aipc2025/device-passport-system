#!/bin/bash

# Device Passport System - Rollback Script
# Usage: ./scripts/rollback.sh [environment]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"

echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║   WARNING: Rolling back deployment                        ║${NC}"
echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

read -p "Are you sure you want to rollback? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "Rollback cancelled."
  exit 0
fi

echo -e "${YELLOW}Starting rollback...${NC}"

# Stop current containers
docker-compose -f "$COMPOSE_FILE" down

# Restore backup images
echo -e "${YELLOW}Restoring backup images...${NC}"
docker tag device-passport-api:backup device-passport-api:latest
docker tag device-passport-web:backup device-passport-web:latest

# Start previous version
docker-compose -f "$COMPOSE_FILE" --env-file ".env.${ENVIRONMENT}" up -d

# Health check
echo -e "${YELLOW}Checking health...${NC}"
sleep 10

if curl -f http://localhost:3000/api/v1/health; then
  echo -e "${GREEN}✓ Rollback completed successfully!${NC}"
else
  echo -e "${RED}✗ Health check failed after rollback!${NC}"
  exit 1
fi
