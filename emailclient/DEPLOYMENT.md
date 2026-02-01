# Phase 8 Email Client - Deployment Guide

Complete guide for deploying the Email Client Phase 8 system in development, staging, and production environments.

## Quick Start

### Development (Local)

```bash
# 1. Clone repository
git clone <repo-url>
cd emailclient

# 2. Setup environment
make env-setup

# 3. Start services (all containers)
make dev

# 4. View logs
make logs

# 5. Test health
make health
```

**Access Points:**
- Email Service API: http://localhost:5000
- PostgreSQL: localhost:5433 (user: emailclient, password: emailclient)
- Redis: localhost:6379
- Postfix SMTP: localhost:25
- Dovecot IMAP: localhost:143

### Staging

```bash
# 1. Build production images
docker-compose -f docker-compose.yml build

# 2. Configure environment
cp deployment/docker/email-service/.env.example .env.staging
# Edit .env.staging with staging credentials

# 3. Start services
docker-compose --env-file .env.staging up -d

# 4. Run health checks
curl http://localhost:5000/health
```

### Production

See [Production Deployment](#production-deployment) section below.

## System Architecture

### Docker Compose Stack

```
┌──────────────────────────────────────────────────────────┐
│                   Docker Network                         │
│                  (emailclient-net)                       │
│                                                          │
│  ┌────────────┐  ┌──────────┐  ┌─────────┐             │
│  │   Email    │  │PostgreSQL│  │  Redis  │             │
│  │  Service   │──│ Database │  │  Cache  │             │
│  │  (Flask)   │  │          │  │         │             │
│  └────────────┘  └──────────┘  └─────────┘             │
│        ↑              ↑              ↑                   │
│        └──────────────┴──────────────┘                   │
│                      │                                   │
│  ┌────────────┐  ┌───────────┐  ┌──────────────┐       │
│  │  Postfix   │  │ Dovecot   │  │   Celery     │       │
│  │   SMTP     │  │  IMAP/    │  │   Workers &  │       │
│  │   Server   │  │   POP3    │  │   Beat       │       │
│  └────────────┘  └───────────┘  └──────────────┘       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Service Dependencies

```
email-service
  ├── depends_on: postgres (health check)
  ├── depends_on: redis (health check)
  ├── depends_on: postfix (health check)
  └── depends_on: dovecot (health check)

celery-worker
  ├── depends_on: redis (health check)
  └── depends_on: postgres (health check)

celery-beat
  ├── depends_on: redis (health check)
  └── depends_on: postgres (health check)

dovecot
  └── depends_on: postfix

postgres
  (no dependencies)

redis
  (no dependencies)
```

## Deployment Scenarios

### 1. Development Environment

**Setup:**
- Single host with all services
- Development Flask server (hot reload)
- SQLite or PostgreSQL (local)
- Redis in-memory cache
- Postfix relay localhost

**Configuration:**
```bash
# Use docker-compose.override.yml for development overrides
# Flask runs in development mode with debug enabled
FLASK_ENV=development
FLASK_DEBUG=1

# Email goes to Mailpit (development mail UI)
# No actual SMTP relay to production mail servers
```

**Commands:**
```bash
make dev          # Start all services
make logs         # View logs
make test         # Run tests
make db-reset     # Reset database
make shell-app    # Open shell in container
```

### 2. Staging Environment

**Setup:**
- Separate host(s) for staging
- Production gunicorn + workers
- PostgreSQL database
- Redis cache
- Postfix + Dovecot full stack

**Configuration:**
```bash
# Create staging environment file
cp deployment/docker/email-service/.env.example .env.staging

# Key differences from production:
FLASK_ENV=production              # Use production Flask
GUNICORN_WORKERS=4                # Normal worker count

# Use self-signed certificates for testing
# Database can be PostgreSQL backup from production

# Staging email goes to test domain
POSTFIX_DOMAIN=staging.emailclient.local
```

**Deployment:**
```bash
# Build images
docker-compose build

# Start services with staging config
docker-compose --env-file .env.staging up -d

# Verify health
curl http://localhost:5000/health

# Run smoke tests
make test
```

### 3. Production Deployment

See dedicated section below.

## Configuration Management

### Environment Files

**Development:**
```bash
.env (local development, not committed)
```

**Staging:**
```bash
.env.staging (committed but with placeholder values)
```

**Production:**
```bash
# Use Docker secrets or environment management service
# Never commit to repository
.env.production (local only, .gitignore)
```

### Secrets Management

**Local Development:**
```bash
# Store in .env (not committed)
JWT_SECRET=local-dev-key-only
ENCRYPTION_KEY=local-dev-key-only
```

**Production (Options):**

**Option 1: Docker Secrets (Swarm)**
```bash
# Create secret
docker secret create jwt_secret -

# Reference in compose
services:
  email-service:
    secrets:
      - jwt_secret
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret
```

**Option 2: Environment Service**
```bash
# Use HashiCorp Vault, AWS Secrets Manager, Azure Key Vault

# Fetch secret at startup
eval "$(curl -s https://vault.example.com/v1/auth/token/lookup-self)"
docker run ... -e JWT_SECRET=$(vault read -field=value secret/email-service/jwt)
```

**Option 3: Configuration Server**
```bash
# Use Spring Cloud Config, Consul, or similar

# Email service fetches config at startup
docker run ... -e CONFIG_SERVER=https://config.example.com
```

## Production Deployment

### Prerequisites

- Docker 20.10+ installed on all nodes
- Docker Compose 2.0+ for orchestration
- PostgreSQL 13+ (managed service recommended)
- Redis 6.0+ (managed service recommended)
- TLS certificates for SMTP/IMAP
- Domain name (e.g., emailclient.production.example.com)
- Load balancer (nginx, HAProxy, or cloud provider LB)

### Pre-Deployment Checklist

- [ ] Database backups configured and tested
- [ ] Secrets stored securely (Vault, AWS Secrets Manager, etc.)
- [ ] TLS certificates obtained and validated
- [ ] Monitoring/alerting configured (Datadog, New Relic, Prometheus)
- [ ] Log aggregation set up (ELK Stack, Splunk, CloudWatch)
- [ ] Rate limiting configured for expected traffic
- [ ] CORS origins configured to trusted domains only
- [ ] Database connection pooling optimized
- [ ] Security scan passed (container vulnerability scanning)
- [ ] Load testing completed and performance acceptable
- [ ] Disaster recovery plan documented and tested
- [ ] Runbooks created for common issues
- [ ] On-call rotation established

### Deployment Procedure

#### Step 1: Infrastructure Setup

```bash
# 1a. Provision infrastructure
# - VM/cloud instance with 4+ CPU, 8+ GB RAM
# - Managed PostgreSQL database
# - Managed Redis cache
# - TLS certificate from Let's Encrypt or CA

# 1b. Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

#### Step 2: Deploy Application

```bash
# 2a. Clone repository
git clone <repo-url> /opt/emailclient
cd /opt/emailclient

# 2b. Configure production environment
cp deployment/docker/email-service/.env.example .env.production
# Edit .env.production with REAL production values:
# - Unique JWT_SECRET (generate: python -c "import secrets; print(secrets.token_urlsafe(32))")
# - Unique ENCRYPTION_KEY
# - Production PostgreSQL URL (managed service)
# - Production Redis URL (managed service)
# - Real TLS certificate paths
# - Production domain names

# 2c. Build images (or pull from registry)
docker-compose build

# 2d. Start services
docker-compose --env-file .env.production up -d

# 2e. Verify deployment
docker-compose ps
curl http://localhost:5000/health
```

#### Step 3: Post-Deployment Validation

```bash
# 3a. Check all services are healthy
docker-compose ps --format "table {{.Names}}\t{{.Status}}"

# 3b. Test database connectivity
docker-compose exec -T postgres \
  psql -U emailclient -d emailclient_db -c "SELECT 1"

# 3c. Test Redis connectivity
docker-compose exec -T redis redis-cli ping

# 3d. Test email service API
curl http://localhost:5000/health
curl http://localhost:5000/api/accounts \
  -H "X-Tenant-ID: default" \
  -H "Authorization: Bearer $JWT_TOKEN"

# 3e. Check logs for errors
docker-compose logs --tail 50
```

#### Step 4: Configure Load Balancer

```nginx
# /etc/nginx/sites-available/emailclient

upstream emailclient_backend {
    server email-service:5000 weight=1;
    server email-service-2:5000 weight=1;
    server email-service-3:5000 weight=1;
}

server {
    listen 80;
    server_name emailclient.production.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name emailclient.production.example.com;

    ssl_certificate /etc/letsencrypt/live/emailclient.production.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/emailclient.production.example.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=60r/m;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://emailclient_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Tenant-ID $http_x_tenant_id;

        # Connection settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 8k;
        proxy_buffers 8 8k;
    }

    location /health {
        access_log off;
        proxy_pass http://emailclient_backend/health;
    }
}
```

#### Step 5: Configure Monitoring

```yaml
# prometheus.yml (example)
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'email-service'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
```

```yaml
# alerts.yml (example)
groups:
  - name: email_service
    rules:
      - alert: EmailServiceDown
        expr: up{job="email-service"} == 0
        for: 1m
        annotations:
          summary: "Email service is down"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"

      - alert: DatabaseConnectivityIssue
        expr: up{job="postgres"} == 0
        for: 2m
        annotations:
          summary: "Database is unreachable"
```

### Scaling Horizontally

For high-traffic deployments, scale horizontally across multiple nodes:

```yaml
# docker-compose.scale.yml (example)

services:
  email-service-1:
    build: ./emailclient/deployment/docker/email-service
    hostname: email-service-1
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  email-service-2:
    build: ./emailclient/deployment/docker/email-service
    hostname: email-service-2
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  email-service-3:
    build: ./emailclient/deployment/docker/email-service
    hostname: email-service-3
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - email-service-1
      - email-service-2
      - email-service-3
```

```bash
# Deploy scaled stack
docker-compose -f docker-compose.yml -f docker-compose.scale.yml up -d

# Scale to 5 instances
docker-compose -f docker-compose.yml -f docker-compose.scale.yml up -d --scale email-service=5
```

## Maintenance

### Backup Strategy

```bash
# Automated daily backup script
#!/bin/bash

BACKUP_DIR="/mnt/backups/emailclient"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker-compose exec -T postgres \
  pg_dump -U emailclient emailclient_db | \
  gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup Redis
docker-compose exec -T redis \
  redis-cli BGSAVE

docker cp emailclient-redis:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
find $BACKUP_DIR -name "redis_*.rdb" -mtime +30 -delete

# Send to cloud storage
aws s3 sync $BACKUP_DIR s3://emailclient-backups/

echo "Backup completed: $BACKUP_DIR"
```

Add to crontab:
```bash
0 2 * * * /opt/emailclient/scripts/backup.sh
```

### Log Rotation

```bash
# /etc/logrotate.d/emailclient

/var/lib/docker/volumes/email-service-logs/_data/* {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 root root
    sharedscripts
}
```

### Updates & Patches

```bash
# 1. Pull latest code
git pull origin main

# 2. Build updated image
docker-compose build --no-cache email-service

# 3. Restart service (with health check grace period)
docker-compose up -d email-service

# 4. Verify health
sleep 15
curl http://localhost:5000/health

# 5. Check logs for errors
docker-compose logs --tail 50 email-service
```

### Zero-Downtime Deployments

Using rolling restart with health checks:

```bash
# 1. Update code and rebuild
git pull origin main
docker-compose build

# 2. Rolling restart (one container at a time)
docker-compose up -d email-service   # Restarts one instance
# Health check verifies it's back up before next
docker-compose up -d email-service   # Restarts next instance

# Alternative: Use orchestration platform
# Kubernetes: kubectl rollout restart deployment/email-service
# Docker Swarm: docker service update --force-update email-service
```

## Troubleshooting

### Service Fails to Start

```bash
# Check logs
docker-compose logs email-service

# Verify dependencies
docker-compose ps

# Check environment variables
docker inspect emailclient-email-service | grep -A 20 "Env"

# Rebuild from scratch
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues

```bash
# Test connectivity
docker-compose exec -T email-service \
  psql -h postgres -U emailclient -d emailclient_db -c "SELECT 1"

# Check connection logs
docker-compose logs postgres | grep connection

# Verify credentials
echo $DATABASE_URL

# Check network connectivity
docker-compose exec postgres \
  netstat -tlnp | grep 5432
```

### High Memory Usage

```bash
# Monitor memory
docker stats email-service

# Reduce worker count
GUNICORN_WORKERS=2 docker-compose up -d email-service

# Clear caches
docker-compose exec redis redis-cli FLUSHALL
```

### Email Not Syncing

```bash
# Check Celery workers
docker-compose logs celery-worker

# Monitor task queue
docker-compose exec redis redis-cli LLEN celery

# Restart workers
docker-compose restart celery-worker celery-beat

# Check IMAP connectivity
docker-compose exec email-service \
  python -c "from imapclient import IMAPClient; IMAPClient('dovecot').login('user', 'pass')"
```

## Security Checklist

Production deployment must pass:

- [ ] All secrets use strong random values (>32 characters)
- [ ] TLS enabled for all connections (HTTPS, IMAPS, POP3S)
- [ ] Firewall rules restrict access to necessary ports only
- [ ] Container runs as non-root user
- [ ] Sensitive data not logged or exposed in errors
- [ ] Rate limiting configured to prevent abuse
- [ ] CORS origins limited to trusted domains
- [ ] Database credentials encrypted or in secrets manager
- [ ] Email credentials encrypted with strong key
- [ ] Regular security updates applied
- [ ] Security scanning enabled (container, dependency scanning)
- [ ] Monitoring and alerting configured

## Support

- **Issues**: GitHub Issues
- **Documentation**: CLAUDE.md, Email Client Plan
- **Contact**: dev@metabuilder.local

## Version

- **Phase**: 8 (Email Client Implementation)
- **Created**: 2026-01-24
- **Last Updated**: 2026-01-24
