#!/bin/bash
# Quick start script for MetaBuilder deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   MetaBuilder Deployment Quick Start  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Ask user which environment
echo "Which environment do you want to start?"
echo "1) Development (with hot-reload and debugging tools)"
echo "2) Production (optimized for production use)"
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        ENV="development"
        COMPOSE_FILE="docker-compose.development.yml"
        ENV_FILE=".env.development"
        ENV_EXAMPLE=".env.development.example"
        ;;
    2)
        ENV="production"
        COMPOSE_FILE="docker-compose.production.yml"
        ENV_FILE=".env"
        ENV_EXAMPLE=".env.production.example"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}Starting MetaBuilder in ${ENV} mode...${NC}"
echo ""

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Environment file not found. Creating from example...${NC}"
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        echo -e "${GREEN}✓ Created $ENV_FILE from $ENV_EXAMPLE${NC}"
        
        if [ "$ENV" == "production" ]; then
            echo ""
            echo -e "${YELLOW}⚠️  IMPORTANT: Please edit $ENV_FILE and update:${NC}"
            echo "  - POSTGRES_PASSWORD"
            echo "  - REDIS_PASSWORD"
            echo "  - JWT_SECRET"
            echo "  - SESSION_SECRET"
            echo "  - SSL certificates in config/nginx/ssl/"
            echo ""
            read -p "Press Enter after updating the environment file..."
        fi
    else
        echo -e "${RED}Error: Example environment file not found${NC}"
        exit 1
    fi
fi

# Create SSL directory for production
if [ "$ENV" == "production" ]; then
    mkdir -p config/nginx/ssl
    if [ ! -f "config/nginx/ssl/cert.pem" ] || [ ! -f "config/nginx/ssl/key.pem" ]; then
        echo -e "${YELLOW}SSL certificates not found. Generating self-signed certificate...${NC}"
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout config/nginx/ssl/key.pem \
            -out config/nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" 2>/dev/null
        echo -e "${GREEN}✓ Generated self-signed SSL certificate${NC}"
        echo -e "${YELLOW}⚠️  For production, replace with a real certificate${NC}"
        echo ""
    fi
fi

# Pull latest images
echo -e "${YELLOW}Pulling Docker images...${NC}"
docker-compose -f "$COMPOSE_FILE" pull || true
echo ""

# Build images
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose -f "$COMPOSE_FILE" build
echo ""

# Start services
echo -e "${YELLOW}Starting services...${NC}"
if [ "$ENV" == "development" ]; then
    # Development: run in foreground with logs
    echo -e "${GREEN}✓ Starting development environment${NC}"
    echo ""
    echo "Services will start with logs visible."
    echo "Press Ctrl+C to stop all services."
    echo ""
    echo "Available services:"
    echo "  - App: http://localhost:5173"
    echo "  - DBAL API: http://localhost:8081"
    echo "  - Adminer (DB UI): http://localhost:8082"
    echo "  - Redis Commander: http://localhost:8083"
    echo "  - Mailhog (Email): http://localhost:8025"
    echo ""
    sleep 3
    docker-compose -f "$COMPOSE_FILE" up
else
    # Production: run in background
    docker-compose -f "$COMPOSE_FILE" up -d
    echo ""
    echo -e "${GREEN}✓ Production environment started successfully!${NC}"
    echo ""
    echo "Services are running in the background."
    echo ""
    echo "Available services:"
    echo "  - App: https://localhost (or your domain)"
    echo "  - DBAL API: https://localhost/api/dbal/"
    echo ""
    echo "Useful commands:"
    echo "  - View logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo "  - Check status: docker-compose -f $COMPOSE_FILE ps"
    echo "  - Stop services: docker-compose -f $COMPOSE_FILE down"
    echo ""
    
    # Wait for services to be healthy
    echo "Waiting for services to be healthy..."
    sleep 10
    docker-compose -f "$COMPOSE_FILE" ps
fi
