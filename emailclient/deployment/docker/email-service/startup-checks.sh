#!/bin/bash

# Phase 8 Email Service - Startup Verification Script
# Validates all dependencies are available before starting the service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Phase 8 Email Service Startup Checks ===${NC}\n"

# Check environment variables
echo -e "${YELLOW}Checking required environment variables...${NC}"
REQUIRED_VARS=(
    "DATABASE_URL"
    "REDIS_URL"
    "JWT_SECRET"
    "ENCRYPTION_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}✗ Missing required variable: $var${NC}"
        exit 1
    else
        echo -e "${GREEN}✓ $var is set${NC}"
    fi
done

# Check PostgreSQL connectivity
echo -e "\n${YELLOW}Checking PostgreSQL connectivity...${NC}"
if python -c "import psycopg2; conn = psycopg2.connect(os.environ['DATABASE_URL'])" 2>/dev/null; then
    echo -e "${GREEN}✓ PostgreSQL database is reachable${NC}"
else
    echo -e "${RED}✗ Cannot connect to PostgreSQL${NC}"
    echo "   DATABASE_URL: $DATABASE_URL"
    exit 1
fi

# Check Redis connectivity
echo -e "\n${YELLOW}Checking Redis connectivity...${NC}"
if python -c "import redis; r = redis.from_url(os.environ['REDIS_URL']); r.ping()" 2>/dev/null; then
    echo -e "${GREEN}✓ Redis is reachable${NC}"
else
    echo -e "${RED}✗ Cannot connect to Redis${NC}"
    echo "   REDIS_URL: $REDIS_URL"
    exit 1
fi

# Check Flask application import
echo -e "\n${YELLOW}Checking Flask application...${NC}"
if python -c "from app import app; print(f'Flask app: {app.name}')" 2>/dev/null; then
    echo -e "${GREEN}✓ Flask application imports successfully${NC}"
else
    echo -e "${RED}✗ Flask application failed to import${NC}"
    exit 1
fi

# Check Celery configuration
echo -e "\n${YELLOW}Checking Celery configuration...${NC}"
if python -c "from tasks import celery; print(f'Celery broker: {celery.conf.broker_url}')" 2>/dev/null; then
    echo -e "${GREEN}✓ Celery is configured correctly${NC}"
else
    echo -e "${YELLOW}⚠ Celery may not be configured (optional)${NC}"
fi

# Check required Python packages
echo -e "\n${YELLOW}Checking Python dependencies...${NC}"
REQUIRED_PACKAGES=(
    "flask"
    "sqlalchemy"
    "celery"
    "redis"
    "imapclient"
    "cryptography"
)

for package in "${REQUIRED_PACKAGES[@]}"; do
    if python -c "import ${package//-/_}" 2>/dev/null; then
        echo -e "${GREEN}✓ $package is installed${NC}"
    else
        echo -e "${RED}✗ $package is not installed${NC}"
        exit 1
    fi
done

# Check file permissions
echo -e "\n${YELLOW}Checking file permissions...${NC}"
if [ -w /app/logs ]; then
    echo -e "${GREEN}✓ Logs directory is writable${NC}"
else
    echo -e "${RED}✗ Cannot write to logs directory${NC}"
    exit 1
fi

if [ -w /app/data ]; then
    echo -e "${GREEN}✓ Data directory is writable${NC}"
else
    echo -e "${RED}✗ Cannot write to data directory${NC}"
    exit 1
fi

# All checks passed
echo -e "\n${GREEN}=== All startup checks passed ===${NC}"
echo -e "${GREEN}Service is ready to start${NC}\n"

exit 0
