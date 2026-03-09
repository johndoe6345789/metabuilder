# Phase 8: Email Client Deployment Guide

Complete deployment guide for the Email Client implementation with Redis cache and Celery broker.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Development Deployment](#development-deployment)
3. [Production Deployment](#production-deployment)
4. [Container Management](#container-management)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)
7. [Environment Configuration](#environment-configuration)

---

## Quick Start

### Development Environment (Local)

```bash
# Clone repository
git clone <repository-url>
cd emailclient

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Check health
docker-compose exec redis redis-cli ping
docker-compose exec email-service curl http://localhost:5000/health
```

### Production Environment

```bash
# Set environment variables
export REDIS_PASSWORD_PROD=$(openssl rand -base64 32)
export POSTGRES_USER_PROD=emailclient_prod
export POSTGRES_PASSWORD_PROD=$(openssl rand -base64 32)
export POSTGRES_DB_PROD=emailclient_prod

# Start with production config
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Monitor services
docker-compose logs -f
```

---

## Development Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM (minimum)
- 10GB disk space

### Setup Steps

#### 1. Build Images

```bash
# Build Redis image
docker-compose build redis

# Build Email Service image
docker-compose build email-service

# Build all images
docker-compose build
```

#### 2. Start Services

```bash
# Start in background
docker-compose up -d

# Or start in foreground (for debugging)
docker-compose up

# Check logs
docker-compose logs -f redis
docker-compose logs -f email-service
```

#### 3. Verify Deployment

```bash
# Check service health
docker-compose ps

# Test Redis connectivity
docker-compose exec redis redis-cli ping
docker-compose exec redis redis-cli INFO server | head -10

# Test Email Service
docker-compose exec email-service curl http://localhost:5000/health

# Test IMAP
docker-compose exec dovecot dovecot -F

# Test SMTP
docker-compose exec postfix telnet localhost 25
```

#### 4. Initialize Databases

```bash
# Create PostgreSQL schema (if using Flask-SQLAlchemy)
docker-compose exec email-service flask db upgrade

# Or manually create tables
docker-compose exec postgres psql -U emailclient -d emailclient -f schema.sql

# Verify schema
docker-compose exec postgres psql -U emailclient -d emailclient -c "\dt"
```

#### 5. Create Test Accounts

```bash
# Add test user to Dovecot
docker-compose exec dovecot adduser testuser

# Verify user
docker-compose exec dovecot doveadm user testuser

# Test IMAP login
docker-compose exec redis redis-cli -a redis_development_password

# Send test email via SMTP
docker-compose exec email-service python -c "
from services.email_service.smtp import SMTPClient
client = SMTPClient('postfix', 25)
client.send('test@example.com', 'user@example.com', 'Test Subject', 'Test Body')
"
```

### Development Configuration

Environment variables in `docker-compose.dev.yml`:

```yaml
REDIS_PASSWORD: redis_development_password
FLASK_ENV: development
FLASK_DEBUG: '1'
LOG_LEVEL: DEBUG
CELERY_TASK_ALWAYS_EAGER: 'false'
```

### Useful Development Commands

```bash
# Tail Redis logs
docker-compose logs -f redis

# Tail Email Service logs
docker-compose logs -f email-service

# Get Redis memory stats
docker-compose exec redis redis-cli INFO memory

# Get Celery queue status
docker-compose exec email-service celery -A celery_app inspect active

# Restart specific service
docker-compose restart email-service

# Remove all containers and volumes (DESTRUCTIVE)
docker-compose down -v

# Access Redis CLI
docker-compose exec redis redis-cli -a redis_development_password
```

---

## Production Deployment

### Prerequisites

- Docker 20.10+ with Swarm or Kubernetes
- Managed PostgreSQL (AWS RDS, Cloud SQL) OR self-hosted on separate VM
- Redis cluster OR managed Redis (AWS ElastiCache, Cloud Memorystore)
- External volumes for data persistence (/mnt/data/*)
- SSL/TLS certificates for SMTP/IMAP
- Domain names and DNS records
- Monitoring stack (Prometheus, Grafana)
- Backup infrastructure

### Pre-Deployment Checklist

- [ ] Generate strong passwords for all services
- [ ] Set up persistent storage volumes
- [ ] Configure SSL/TLS certificates
- [ ] Set up DNS records
- [ ] Create backup policy
- [ ] Set up monitoring and alerting
- [ ] Test failover procedures
- [ ] Document all passwords in secure vault

### Setup Steps

#### 1. Prepare Environment

```bash
# Create .env file for production
cat > .env.production << 'EOF'
# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)
REDIS_MAXMEMORY=1gb
REDIS_MAXMEMORY_POLICY=volatile-lru

# PostgreSQL
POSTGRES_USER_PROD=emailclient_prod
POSTGRES_PASSWORD_PROD=$(openssl rand -base64 32)
POSTGRES_DB_PROD=emailclient_prod

# Flask
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY=$(openssl rand -base64 32)

# Email Service
IMAP_SYNC_INTERVAL=300
SMTP_TIMEOUT=30
EOF

# Load environment
source .env.production
```

#### 2. Set Up Storage

```bash
# Create persistent volume directories
sudo mkdir -p /mnt/data/{redis,postgres,dovecot}
sudo chown 999:999 /mnt/data/redis
sudo chown 999:999 /mnt/data/postgres
sudo chown 1000:1000 /mnt/data/dovecot

# Set permissions
sudo chmod 700 /mnt/data/redis
sudo chmod 700 /mnt/data/postgres
sudo chmod 700 /mnt/data/dovecot
```

#### 3. Start Production Services

```bash
# Build images
docker-compose build

# Start with production configuration
docker-compose -f docker-compose.yml \
               -f docker-compose.prod.yml \
               up -d

# Verify deployment
docker-compose ps
docker-compose logs --tail=50
```

#### 4. Initialize Production Data

```bash
# Create PostgreSQL schema
docker-compose exec postgres psql \
  -U $POSTGRES_USER_PROD \
  -d $POSTGRES_DB_PROD \
  -f /docker-entrypoint-initdb.d/schema.sql

# Verify Redis connection
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping

# Check Celery broker
docker-compose exec email-service celery -A celery_app inspect ping
```

#### 5. Enable Backups

```bash
# Create backup directory
mkdir -p /mnt/backups/{redis,postgres}

# Schedule Redis backup (crontab)
0 2 * * * /path/to/deployment/docker/redis/backup.sh backup

# Schedule PostgreSQL backup
0 3 * * * docker-compose exec -T postgres pg_dump \
  -U $POSTGRES_USER_PROD $POSTGRES_DB_PROD | \
  gzip > /mnt/backups/postgres/backup_$(date +\%Y\%m\%d).sql.gz
```

### Production Configuration

Key settings in `docker-compose.prod.yml`:

```yaml
# Resource limits
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2gb
    reservations:
      cpus: '1'
      memory: 1gb

# Restart policy
restart: always

# Logging
logging:
  options:
    max-size: "100m"
    max-file: "10"
```

---

## Container Management

### Building

```bash
# Build specific image
docker-compose build redis

# Build all images
docker-compose build

# Build with no cache
docker-compose build --no-cache

# Build specific service with tags
docker build -t emailclient-redis:1.0.0 deployment/docker/redis/
```

### Starting/Stopping

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d redis

# Stop all services
docker-compose down

# Stop with volume removal (DESTRUCTIVE)
docker-compose down -v

# Restart services
docker-compose restart
docker-compose restart redis
```

### Logs

```bash
# View logs for all services
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs -f redis
docker-compose logs -f email-service

# View last N lines
docker-compose logs -n 100

# View logs with timestamps
docker-compose logs -f --timestamps

# Filter logs by pattern
docker-compose logs redis | grep ERROR
```

### Executing Commands

```bash
# Execute command in container
docker-compose exec redis redis-cli ping

# Execute as specific user
docker-compose exec -u root redis apk add vim

# Interactive shell
docker-compose exec redis /bin/sh

# Run one-off command
docker-compose run --rm redis redis-cli --version
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Redis health
deployment/docker/redis/monitor.sh health

# Continuous monitoring
deployment/docker/redis/monitor.sh monitor

# Email Service health
curl http://localhost:8500/health
```

### Backup & Recovery

#### Redis Backups

```bash
# Manual backup
deployment/docker/redis/backup.sh backup

# Restore from backup
deployment/docker/redis/backup.sh restore /path/to/backup.rdb

# List backups
deployment/docker/redis/backup.sh list

# Analyze database
deployment/docker/redis/backup.sh analyze
```

---

## Troubleshooting

### Redis Issues

#### Container Won't Start

```bash
# Check logs
docker-compose logs redis

# Verify configuration
docker build -t test-redis deployment/docker/redis/
docker run --rm test-redis redis-cli --help
```

#### High Memory Usage

```bash
# Check memory stats
docker-compose exec redis redis-cli INFO memory

# Identify large keys
docker-compose exec redis redis-cli --bigkeys

# Clear unused data
docker-compose exec redis redis-cli FLUSHALL  # CAUTION
```

#### Slow Performance

```bash
# Check slow log
deployment/docker/redis/monitor.sh slowlog

# Check command stats
deployment/docker/redis/monitor.sh stats

# Monitor CPU usage
docker stats emailclient-redis
```

---

**Last Updated**: 2026-01-24
**Status**: Phase 8 Complete - Redis Container & Celery Broker Integration
