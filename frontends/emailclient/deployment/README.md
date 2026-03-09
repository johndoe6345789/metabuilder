# Phase 8 Email Client - Deployment Guide

**Status**: Production-Ready Email Client Deployment
**Version**: 1.0.0
**Last Updated**: 2026-01-24

Comprehensive deployment guide for the MetaBuilder Email Client with full Docker orchestration, database setup, monitoring, scaling, and security.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Port Mapping](#port-mapping)
4. [Environment Setup](#environment-setup)
5. [Database Initialization](#database-initialization)
6. [Health Checks](#health-checks)
7. [Viewing Logs](#viewing-logs)
8. [Troubleshooting](#troubleshooting)
9. [Horizontal Scaling](#horizontal-scaling)
10. [Backup & Restore](#backup--restore)
11. [Security](#security)
12. [Production Checklist](#production-checklist)

---

## Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 8GB RAM minimum
- 20GB disk space
- OpenSSL (for certificate generation)

### Deploy All Services

```bash
# Navigate to project root (where docker-compose.yml is located)
cd /path/to/emailclient

# Copy environment template
cp .env.example .env

# Start all services in detached mode
docker-compose up -d

# Verify all services are running
docker-compose ps

# Expected output (all services healthy):
# NAME                STATUS
# emailclient-redis   Up (healthy)
# emailclient-postgres  Up
# emailclient-email-service  Up
# emailclient-postfix  Up
# emailclient-dovecot  Up
```

### Quick Verification

```bash
# Check if all services are healthy
docker-compose ps

# View startup logs
docker-compose logs -f

# Test email service API
curl http://localhost:8500/health

# Test Redis connectivity
docker-compose exec redis redis-cli ping

# Test PostgreSQL connectivity
docker-compose exec postgres psql -U emailclient -d emailclient -c "SELECT 1;"
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                               │
│                    Next.js React Application                         │
│                     (emailclient:3000)                               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Nginx Proxy      │
                    │  (Port 80/443)      │
                    │ SSL/TLS + Caching   │
                    │ Rate Limiting       │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        │                      │                      │
   ┌────▼─────┐      ┌────────▼────────┐    ┌────────▼────────┐
   │   Flask   │      │   PostgreSQL    │    │   Redis Queue   │
   │  API      │      │   Database      │    │   + Cache       │
   │  Service  │      │   Metadata      │    │                 │
   │(5000)     │      │   (5432)        │    │   (6379)        │
   └────┬──────┘      └────────┬────────┘    └────────┬────────┘
        │                      │                      │
        │      ┌───────────────┼───────────────┐      │
        │      │               │               │      │
   ┌────▼──────▼───┐   ┌───────▼──────┐  ┌────▼─────┐│
   │  Postfix SMTP │   │  Dovecot     │  │ Celery   ││
   │  (25/587)     │   │  IMAP/POP3   │  │ Workers  ││
   │               │   │  (143/110)   │  │          ││
   └───────────────┘   └──────────────┘  └──────────┘│
                                                       │
        ┌──────────────────────────────────────────────┘
        │
   ┌────▼─────────────────────────────────────────┐
   │    Email Storage (Dovecot Maildir)            │
   │    - Persistent volume: dovecot-data         │
   │    - Multi-user mailbox hierarchy            │
   └──────────────────────────────────────────────┘
```

### Service Components

| Service | Purpose | Technology | Container | Port |
|---------|---------|-----------|-----------|------|
| **Email Service** | Flask REST API for IMAP/SMTP operations | Python 3.11, Flask, Gunicorn | emailclient-email-service | 5000 (8500) |
| **PostgreSQL** | Email metadata, accounts, folders, messages | PostgreSQL 16 | emailclient-postgres | 5432 (5433) |
| **Redis** | Celery message broker, session/cache store | Redis 7 | emailclient-redis | 6379 |
| **Postfix** | SMTP relay for outgoing mail | Postfix | emailclient-postfix | 25, 587 |
| **Dovecot** | IMAP/POP3 server for mail storage | Dovecot (Alpine) | emailclient-dovecot | 143, 110, 993, 995 |
| **Nginx** | Reverse proxy, SSL/TLS, rate limiting | Nginx 1.27 | emailclient-nginx | 80, 443 |

### Data Flow

```
User Client
    ↓
1. Next.js Frontend (browser) → loads React app
2. Compose form → REST API (POST /email/send)
3. Email Service (Flask) → validates, queues task
4. Celery Worker → processes async send job
5. Postfix/Dovecot → stores mail, delivers SMTP
6. PostgreSQL → logs metadata (sender, recipient, timestamp)
7. Redis → caches frequently accessed data
8. Frontend polls API → receives delivery status
```

---

## Port Mapping

### Container Ports (Internal Network)

All services communicate via internal Docker network `emailclient-net`:

```
Service               Internal Port    Purpose
─────────────────────────────────────────────────────────
Email Service        5000             Flask API
PostgreSQL           5432             Database
Redis                6379             Cache/Broker
Postfix SMTP         25               SMTP accept
Postfix Submission   587              SMTP auth
Dovecot IMAP         143              IMAP plaintext
Dovecot IMAPS        993              IMAP TLS/SSL
Dovecot POP3         110              POP3 plaintext
Dovecot POP3S        995              POP3 TLS/SSL
Nginx HTTP           80               HTTP (proxy)
Nginx HTTPS          443              HTTPS (proxy)
```

### Host Ports (Published to Host)

Exposed ports on your machine (via docker-compose.yml):

```
Host Port → Container Port  Service            Purpose
──────────────────────────────────────────────────────────────
8500       → 5000           Email Service      API testing
5433       → 5432           PostgreSQL         DB administration
6379       → 6379           Redis              Cache/queue access
1025       → 25             Postfix SMTP       SMTP relay
1587       → 587            Postfix Submission SMTP auth
1143       → 143            Dovecot IMAP       Email client access
1993       → 993            Dovecot IMAPS      Email client (TLS)
1110       → 110            Dovecot POP3       Email client access
1995       → 995            Dovecot POP3S      Email client (TLS)
3000       → 3000           Frontend           Browser access
80         → 80             Nginx HTTP         HTTP proxy
443        → 443            Nginx HTTPS        HTTPS proxy (when deployed)
```

### Accessing Services

```bash
# API Server (from host)
curl http://localhost:8500/health

# PostgreSQL admin (from host)
psql -h localhost -p 5433 -U emailclient -d emailclient

# Redis CLI (from inside container)
docker-compose exec redis redis-cli ping

# Dovecot IMAP (from host with telnet/nc)
nc -v localhost 1143

# Email Service logs
docker-compose logs -f email-service
```

---

## Environment Setup

### Create .env File

```bash
# Copy template
cp .env.example .env

# Edit with production values
nano .env
```

### Production .env Template

```env
# ═════════════════════════════════════════════════════════════════════
# PHASE 8 EMAIL CLIENT - PRODUCTION ENVIRONMENT
# ═════════════════════════════════════════════════════════════════════

# ────── FLASK CONFIGURATION ──────
FLASK_ENV=production
FLASK_HOST=0.0.0.0
FLASK_PORT=5000

# ────── DATABASE CONFIGURATION ──────
# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://emailservice:your-secure-password@postgres:5432/emailclient_db

# ────── REDIS CONFIGURATION ──────
# Redis connection for Celery message broker and cache
REDIS_URL=redis://:your-redis-password@redis:6379/0
CELERY_BROKER_URL=redis://:your-redis-password@redis:6379/1
CELERY_RESULT_BACKEND=redis://:your-redis-password@redis:6379/1

# ────── SECURITY - JWT CONFIGURATION ──────
# Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
JWT_SECRET=your-jwt-secret-key-generate-new-for-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# ────── SECURITY - ENCRYPTION ──────
# Generate with: python -c "import secrets; print(secrets.token_hex(32))"
# Used for encrypting stored email credentials
ENCRYPTION_KEY=your-encryption-key-generate-new-for-production

# ────── CORS CONFIGURATION ──────
# Comma-separated list of allowed origins
# Examples: localhost:3000,app.example.com:3000,api.example.com
CORS_ORIGINS=localhost:3000,emailclient.local:3000

# ────── EMAIL SERVICE CONFIGURATION ──────
# IMAP connection timeout (seconds)
IMAP_TIMEOUT=30

# SMTP connection timeout (seconds)
SMTP_TIMEOUT=30

# Connection pool sizes
IMAP_POOL_SIZE=10
SMTP_POOL_SIZE=5

# ────── GUNICORN CONFIGURATION ──────
# Number of worker processes (CPU cores * 2-4)
GUNICORN_WORKERS=4

# Thread pool size per worker
GUNICORN_THREADS=2

# Worker timeout (seconds)
GUNICORN_TIMEOUT=120

# ────── LOGGING ──────
# Log level: DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_LEVEL=INFO
LOG_FILE=/app/logs/email-service.log

# ────── FEATURE FLAGS ──────
ENABLE_IMAP_SYNC=true
ENABLE_SMTP_SEND=true
ENABLE_CELERY_TASKS=true
ENABLE_EMAIL_PARSING=true

# ────── RATE LIMITING ──────
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_REQUESTS_PER_HOUR=1000

# ────── MULTI-TENANT CONFIGURATION ──────
# Header name for tenant ID in HTTP requests
TENANT_ID_HEADER=X-Tenant-ID
DEFAULT_TENANT_ID=default

# ────── CELERY TASK CONFIGURATION ──────
# Task time limits (seconds)
CELERY_TASK_TIME_LIMIT=3600
CELERY_TASK_SOFT_TIME_LIMIT=3000

# Celery serializer format
CELERY_TASK_SERIALIZER=json
CELERY_RESULT_SERIALIZER=json
CELERY_ACCEPT_CONTENT=json

# ────── DATABASE SCHEMA MIGRATION ──────
# Auto-run migrations on startup
AUTO_RUN_MIGRATIONS=true
```

### Generate Secure Secrets

```bash
# Generate JWT Secret
python3 -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(32))"

# Generate Encryption Key
python3 -c "import secrets; print('ENCRYPTION_KEY=' + secrets.token_hex(32))"

# Generate Redis Password
python3 -c "import secrets; print('REDIS_PASSWORD=' + secrets.token_hex(16))"

# Generate Database Password
python3 -c "import secrets; print('DB_PASSWORD=' + secrets.token_urlsafe(16))"
```

### Environment Variable Validation

```bash
# Check all required variables are set
docker-compose config > /dev/null && echo "✓ Configuration valid" || echo "✗ Configuration error"

# List all environment variables loaded
docker-compose exec email-service env | grep -E "FLASK|DATABASE|REDIS|JWT" | sort
```

---

## Database Initialization

### Initial Schema Creation

PostgreSQL creates the database automatically, but you need to run migrations:

```bash
# 1. Wait for PostgreSQL to be ready (health check runs ~30s)
docker-compose up -d postgres
sleep 10

# 2. Create database and tables
docker-compose exec postgres psql -U emailclient -d emailclient -f /docker-entrypoint-initdb.d/init.sql

# Or via Flask application on startup (AUTO_RUN_MIGRATIONS=true)
```

### Manual Migration Steps

```bash
# 1. Access PostgreSQL directly
docker-compose exec postgres psql -U emailclient -d emailclient

# 2. Create email client schema
CREATE TABLE IF NOT EXISTS email_clients (
    id SERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS email_folders (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES email_clients(id) ON DELETE CASCADE,
    name VARCHAR(255),
    folder_type VARCHAR(50), -- 'inbox', 'sent', 'drafts', 'trash', 'custom'
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_messages (
    id SERIAL PRIMARY KEY,
    folder_id INTEGER REFERENCES email_folders(id) ON DELETE CASCADE,
    message_id VARCHAR(255) UNIQUE,
    subject VARCHAR(512),
    sender VARCHAR(255),
    recipients TEXT[], -- Array of email addresses
    body TEXT,
    html_body TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    received_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_folder_read (folder_id, is_read),
    INDEX idx_received (received_at DESC)
);

CREATE TABLE IF NOT EXISTS email_attachments (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES email_messages(id) ON DELETE CASCADE,
    filename VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    blob_path VARCHAR(512), -- S3 or filesystem path
    created_at TIMESTAMP DEFAULT NOW()
);

# 3. Create indexes for performance
CREATE INDEX idx_messages_folder_date ON email_messages(folder_id, received_at DESC);
CREATE INDEX idx_messages_sender ON email_messages(sender);
CREATE INDEX idx_folders_client ON email_folders(client_id);

# 4. Verify schema
\dt -- List all tables
\d email_messages -- Show table structure

# 5. Exit PostgreSQL
\q
```

### Data Integrity

```bash
# Check table row counts
docker-compose exec postgres psql -U emailclient -d emailclient -c "
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# Check for orphaned attachments (messages deleted but attachments remain)
docker-compose exec postgres psql -U emailclient -d emailclient -c "
SELECT COUNT(*) as orphaned_attachments
FROM email_attachments
WHERE message_id NOT IN (SELECT id FROM email_messages);
"
```

### Database Backup

```bash
# Full backup
docker-compose exec postgres pg_dump -U emailclient emailclient > emailclient_backup.sql

# Compressed backup
docker-compose exec postgres pg_dump -U emailclient emailclient | gzip > emailclient_backup.sql.gz

# Backup specific table
docker-compose exec postgres pg_dump -U emailclient -t email_messages emailclient > messages_backup.sql
```

### Restoring from Backup

```bash
# Full restore
docker-compose exec -T postgres psql -U emailclient emailclient < emailclient_backup.sql

# Restore with error handling
docker-compose exec -T postgres psql -U emailclient emailclient -v ON_ERROR_STOP=1 < emailclient_backup.sql.gz
```

---

## Health Checks

### Automated Health Checks

Docker Compose automatically monitors service health:

```bash
# View health status
docker-compose ps

# Expected output:
# NAME                       STATUS
# emailclient-redis         Up 2m (healthy)
# emailclient-postgres      Up 2m
# emailclient-email-service Up 2m (healthy)
# emailclient-postfix       Up 2m
# emailclient-dovecot       Up 2m (healthy)
```

### Manual Health Verification

```bash
# ═══════════════════════════════════════════════════════════════════
# Email Service Health
# ═══════════════════════════════════════════════════════════════════

# Check if Flask API is responding
curl -v http://localhost:8500/health

# Expected response: 200 OK
# {
#   "status": "healthy",
#   "service": "email-service",
#   "version": "1.0.0",
#   "timestamp": "2026-01-24T12:30:45Z"
# }

# ═══════════════════════════════════════════════════════════════════
# PostgreSQL Health
# ═══════════════════════════════════════════════════════════════════

# Test connection
docker-compose exec postgres pg_isready -U emailclient -d emailclient

# Expected output: accepting connections

# Test query execution
docker-compose exec postgres psql -U emailclient -d emailclient -c "SELECT 1;"

# Expected output: 1

# ═══════════════════════════════════════════════════════════════════
# Redis Health
# ═══════════════════════════════════════════════════════════════════

# Test Redis connectivity
docker-compose exec redis redis-cli ping

# Expected output: PONG

# Check memory usage
docker-compose exec redis redis-cli info memory | grep -E "used_memory|maxmemory"

# Check connected clients
docker-compose exec redis redis-cli info clients | grep connected_clients

# ═══════════════════════════════════════════════════════════════════
# Postfix Health
# ═══════════════════════════════════════════════════════════════════

# Check if SMTP port is listening
nc -zv localhost 1025

# Expected output: Connection to localhost port 1025 [tcp/*] succeeded!

# Check mail queue
docker-compose exec postfix mailq

# ═══════════════════════════════════════════════════════════════════
# Dovecot Health
# ═══════════════════════════════════════════════════════════════════

# Connect to IMAP port
nc -v localhost 1143

# Type: a001 NOOP
# Expected response: a001 OK NOOP completed

# Check process status
docker-compose exec dovecot dovecot -n | head -20
```

### Health Check Endpoints

| Service | Endpoint | Method | Expected Status |
|---------|----------|--------|-----------------|
| Email Service | `http://localhost:8500/health` | GET | 200 OK |
| PostgreSQL | `pg_isready` | CLI | accepting connections |
| Redis | `redis-cli ping` | CLI | PONG |
| Postfix | Port 1025 | TCP | Connection accepted |
| Dovecot | Port 1143 | TCP | IMAP greeting |
| Nginx | `http://localhost/health` | GET | 200 OK |

### Automated Monitoring Script

Create `/monitoring/health-check.sh`:

```bash
#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "Email Client Service Health Check"
echo "═══════════════════════════════════════════════════════════════"
echo "Timestamp: $(date)"
echo ""

# Email Service
echo "[1/6] Email Service..."
if curl -s http://localhost:8500/health | grep -q "healthy"; then
    echo "✓ Email Service: HEALTHY"
else
    echo "✗ Email Service: UNHEALTHY"
fi

# PostgreSQL
echo "[2/6] PostgreSQL..."
if docker-compose exec postgres pg_isready -q; then
    echo "✓ PostgreSQL: HEALTHY"
else
    echo "✗ PostgreSQL: UNHEALTHY"
fi

# Redis
echo "[3/6] Redis..."
if docker-compose exec redis redis-cli ping | grep -q "PONG"; then
    echo "✓ Redis: HEALTHY"
else
    echo "✗ Redis: UNHEALTHY"
fi

# Postfix
echo "[4/6] Postfix SMTP..."
if nc -z localhost 1025 2>/dev/null; then
    echo "✓ Postfix: HEALTHY"
else
    echo "✗ Postfix: UNHEALTHY"
fi

# Dovecot
echo "[5/6] Dovecot IMAP..."
if nc -z localhost 1143 2>/dev/null; then
    echo "✓ Dovecot: HEALTHY"
else
    echo "✗ Dovecot: UNHEALTHY"
fi

# Container Status
echo "[6/6] Container Status..."
UNHEALTHY=$(docker-compose ps | grep -c "Exited\|Error")
if [ "$UNHEALTHY" -eq 0 ]; then
    echo "✓ All containers: RUNNING"
else
    echo "✗ $UNHEALTHY containers not running"
    docker-compose ps
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
```

Run the script:

```bash
chmod +x monitoring/health-check.sh
./monitoring/health-check.sh
```

---

## Viewing Logs

### Real-Time Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f email-service
docker-compose logs -f postgres
docker-compose logs -f redis

# Last 100 lines
docker-compose logs --tail=100 email-service

# With timestamps
docker-compose logs -f --timestamps email-service

# Follow specific service for 5 minutes
timeout 300 docker-compose logs -f email-service
```

### Log Filtering

```bash
# Only errors
docker-compose logs email-service | grep ERROR

# Only warnings
docker-compose logs email-service | grep WARNING

# Email sync operations
docker-compose logs email-service | grep "sync\|IMAP\|sync_interval"

# Authentication failures
docker-compose logs email-service | grep "auth\|failed\|unauthorized"

# Database queries (if enabled)
docker-compose logs postgres | grep "statement\|duration"
```

### Log Files Inside Containers

```bash
# Email Service application logs
docker-compose exec email-service cat /app/logs/email-service.log

# Email Service access logs
docker-compose exec email-service cat /app/logs/access.log

# PostgreSQL logs
docker-compose exec postgres cat /var/lib/postgresql/data/pg_log/postgresql.log

# Redis logs
docker-compose logs redis

# Postfix logs
docker-compose logs postfix
```

### Structured Logging (JSON format)

Configure `docker-compose.yml` for structured logging:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
    labels: "service_name,environment"

# Parse JSON logs
docker-compose logs email-service | jq '.'
```

### Log Rotation

Docker Compose automatically rotates logs based on `docker-compose.yml` configuration:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"    # Rotate when log file reaches 10MB
    max-file: "3"      # Keep maximum 3 rotated files
```

Logs are stored in:
```
/var/lib/docker/containers/{container-id}/{container-id}-json.log*
```

### Long-Term Log Storage

For production, send logs to external service:

```yaml
logging:
  driver: "splunk"  # or "awslogs", "awsfirelens", "gelf", etc.
  options:
    splunk-token: "${SPLUNK_TOKEN}"
    splunk-url: "https://your-splunk-instance.com:8088"
    tag: "email-service"
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Email Service Won't Start

```bash
# Check logs
docker-compose logs email-service

# Issue 1: Database not ready
# Solution: Increase depends_on health check timeout
# Verify PostgreSQL is running
docker-compose logs postgres | grep "ready"

# Issue 2: Redis connection failed
# Solution: Check Redis password in .env
REDIS_URL=redis://:your-password@redis:6379/0
docker-compose down && docker-compose up -d redis && sleep 5

# Issue 3: Invalid environment variables
# Solution: Validate .env file
docker-compose config | grep -A 5 email-service
```

#### 2. PostgreSQL Connection Refused

```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check if port is exposed
docker-compose ps | grep postgres

# Test connection from host
psql -h localhost -p 5433 -U emailclient -d emailclient

# If connection fails:
# 1. Check .env DATABASE_URL
# 2. Verify postgres user exists: docker-compose exec postgres psql -U emailclient
# 3. Check permissions: docker-compose exec postgres psql -l
```

#### 3. Redis "Access Denied" Error

```bash
# Check Redis logs
docker-compose logs redis | grep -i error

# Verify REDIS_PASSWORD in .env
echo $REDIS_PASSWORD

# Test Redis connection with correct password
docker-compose exec redis redis-cli -a your-password ping

# If no password set:
# Update .env: REDIS_PASSWORD=
# Restart Redis: docker-compose restart redis
```

#### 4. Email Service Getting OOM (Out of Memory)

```bash
# Check memory usage
docker stats emailclient-email-service

# Reduce Gunicorn workers
# Edit .env: GUNICORN_WORKERS=2
docker-compose restart email-service

# Monitor memory trend
watch -n 5 'docker stats emailclient-email-service --no-stream'

# Increase available memory (Docker Desktop settings)
# Docker Desktop → Preferences → Resources → Memory: 8GB → 12GB
```

#### 5. Dovecot IMAP Connection Failing

```bash
# Check Dovecot logs
docker-compose logs dovecot | tail -50

# Test IMAP port
nc -v localhost 1143

# Verify maildir structure exists
docker-compose exec dovecot ls -la /var/mail/

# Check Dovecot configuration
docker-compose exec dovecot dovecot -n

# Restart Dovecot
docker-compose restart dovecot
```

#### 6. Postfix Mail Queue Stuck

```bash
# Check mail queue
docker-compose exec postfix mailq

# Flush queue
docker-compose exec postfix postfix flush

# View deferred mail
docker-compose exec postfix postqueue -p

# Remove specific message
docker-compose exec postfix postsuper -d message-id

# Clear entire queue (use with caution!)
docker-compose exec postfix postsuper -d ALL
```

#### 7. High API Latency

```bash
# Check if rate limiting is active
docker-compose logs email-service | grep "rate_limit"

# Check if Celery workers are running
docker-compose logs email-service | grep "celery\|worker"

# Monitor request timing
curl -w "@curl-format.txt" http://localhost:8500/health
# Create curl-format.txt:
# time_namelookup:  %{time_namelookup}s\n
# time_connect:     %{time_connect}s\n
# time_appconnect:  %{time_appconnect}s\n
# time_starttransfer: %{time_starttransfer}s\n
# time_total:       %{time_total}s\n

# Check Redis for slow commands
docker-compose exec redis redis-cli --latency-history
```

#### 8. Celery Tasks Not Processing

```bash
# Check Celery logs
docker-compose logs email-service | grep -i celery

# Verify Redis is accepting connections (message broker)
docker-compose exec redis redis-cli PING

# Check active tasks
docker-compose exec email-service celery -A tasks inspect active

# Purge failed tasks queue
docker-compose exec email-service celery -A tasks purge

# Monitor task processing
docker-compose exec email-service celery -A tasks events
```

#### 9. Docker Volumes Not Persisting Data

```bash
# Check volume mount points
docker volume ls | grep emailclient

# Verify volume contents
docker volume inspect emailclient_redis-data

# Check if volume is properly mounted in container
docker-compose exec redis df -h /data

# Manually backup volume data
docker run -v emailclient_redis-data:/data --rm -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz -C /data .

# Restore volume data
docker run -v emailclient_redis-data:/data --rm -v $(pwd):/backup alpine tar xzf /backup/redis-backup.tar.gz -C /data
```

#### 10. Certificate Validation Errors (TLS/SSL)

```bash
# Check certificate expiration
docker-compose exec dovecot openssl x509 -in /etc/dovecot/certs/dovecot.crt -text -noout | grep -A2 "Validity"

# Regenerate self-signed certificate
docker-compose exec dovecot openssl req -x509 -newkey rsa:2048 -keyout /etc/dovecot/private/dovecot.key -out /etc/dovecot/certs/dovecot.crt -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Org/CN=emailclient.local"

# For production, use Let's Encrypt:
# 1. Install certbot on host
# 2. Generate certificate: certbot certonly -d yourdomain.com
# 3. Mount certificate in docker-compose.yml
volumes:
  - /etc/letsencrypt/live/yourdomain.com/fullchain.pem:/etc/nginx/ssl/cert.pem:ro
  - /etc/letsencrypt/live/yourdomain.com/privkey.pem:/etc/nginx/ssl/key.pem:ro
```

### Debug Mode

Enable debug logging for all services:

```bash
# In .env
LOG_LEVEL=DEBUG
FLASK_DEBUG=1

# Rebuild and restart
docker-compose down
docker-compose up -d

# View debug logs
docker-compose logs -f email-service | grep -i debug
```

### Service Restart Procedures

```bash
# Restart specific service
docker-compose restart email-service

# Restart with fresh start
docker-compose down email-service
docker-compose up -d email-service

# Restart all services
docker-compose restart

# Hard restart (remove volumes, full reset)
docker-compose down -v
docker-compose up -d
# WARNING: This deletes all persistent data!

# Reload configuration without restart
docker-compose up -d --no-deps --build email-service
```

---

## Horizontal Scaling

### Scale Redis for High Throughput

#### Option 1: Redis Cluster (3+ nodes)

```yaml
# docker-compose-cluster.yml
version: '3.8'

services:
  redis-node-1:
    image: redis:7-alpine
    command: redis-server --port 6379 --cluster-enabled yes
    ports:
      - "6379:6379"
    networks:
      - emailclient-net

  redis-node-2:
    image: redis:7-alpine
    command: redis-server --port 6379 --cluster-enabled yes
    ports:
      - "6380:6379"
    networks:
      - emailclient-net

  redis-node-3:
    image: redis:7-alpine
    command: redis-server --port 6379 --cluster-enabled yes
    ports:
      - "6381:6379"
    networks:
      - emailclient-net

networks:
  emailclient-net:
    driver: bridge
```

Initialize cluster:

```bash
docker-compose -f docker-compose-cluster.yml up -d

# Create cluster
docker-compose exec redis-node-1 redis-cli --cluster create \
  127.0.0.1:6379 \
  127.0.0.1:6380 \
  127.0.0.1:6381 \
  --cluster-replicas 0

# Update .env to use cluster nodes
REDIS_URL=redis-cluster://redis-node-1:6379,redis-node-2:6380,redis-node-3:6381
```

#### Option 2: Redis Sentinel (High Availability)

```yaml
redis-master:
  image: redis:7-alpine
  ports:
    - "6379:6379"

redis-slave:
  image: redis:7-alpine
  command: redis-server --slaveof redis-master 6379
  ports:
    - "6380:6379"

redis-sentinel:
  image: redis:7-alpine
  command: redis-sentinel /etc/sentinel.conf --port 26379
  ports:
    - "26379:26379"
  volumes:
    - ./sentinel.conf:/etc/sentinel.conf
```

### Scale Email Service Workers

#### Horizontal Scaling (Multiple Instances)

```bash
# Scale to 3 instances of email-service
docker-compose up -d --scale email-service=3

# Behind Nginx load balancer
# Nginx distributes requests to: email-service:5000, email-service_2:5000, email-service_3:5000
```

#### Vertical Scaling (Single Instance)

```env
# In .env - Increase workers per instance
GUNICORN_WORKERS=8      # From 4
GUNICORN_THREADS=4      # From 2
```

Rebuild and restart:

```bash
docker-compose up -d --build email-service
```

### Scale Celery Workers for Async Tasks

```bash
# Option 1: Separate worker containers
docker-compose up -d email-service  # API server
docker-compose run -d --name email-worker-1 email-service celery -A tasks worker --concurrency=4
docker-compose run -d --name email-worker-2 email-service celery -A tasks worker --concurrency=4

# Option 2: Docker Compose worker service
cat >> docker-compose.yml << 'EOF'

  celery-worker:
    build: ./services/email_service
    container_name: emailclient-celery-worker
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/1
      - CELERY_RESULT_BACKEND=redis://redis:6379/1
    depends_on:
      - redis
    command: celery -A tasks worker --concurrency=4 --loglevel=info
    networks:
      - emailclient-net

EOF

# Scale workers
docker-compose up -d --scale celery-worker=3
```

### Scale PostgreSQL (Read Replicas)

For production, use managed PostgreSQL with replication:

```yaml
postgres-primary:
  image: postgres:16-alpine
  environment:
    POSTGRES_REPLICATION_MODE: master
    POSTGRES_REPLICATION_USER: replica
    POSTGRES_REPLICATION_PASSWORD: replica_password
  ports:
    - "5432:5432"

postgres-replica:
  image: postgres:16-alpine
  environment:
    POSTGRES_REPLICATION_MODE: slave
    POSTGRES_MASTER_SERVICE: postgres-primary
  depends_on:
    - postgres-primary
  ports:
    - "5433:5432"
```

### Load Balancing Strategy

```yaml
# Nginx configuration for load balancing
upstream email_service {
    least_conn;  # Route to server with fewest connections
    server email-service:5000;
    server email-service_2:5000;
    server email-service_3:5000;
}

server {
    listen 80;
    location / {
        proxy_pass http://email_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Monitoring Scaled Services

```bash
# View all service instances
docker-compose ps | grep email-service

# Monitor load across instances
docker stats --no-stream | grep email-service

# Check Redis backlog with multiple workers
docker-compose exec redis redis-cli LLEN celery

# Monitor Celery task distribution
docker-compose exec email-service celery -A tasks inspect stats | jq .
```

---

## Backup & Restore

### Database Backups

#### Daily Automated Backup Script

Create `deployment/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/email-client"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/emailclient_db_$TIMESTAMP.sql.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup PostgreSQL database
docker-compose exec -T postgres pg_dump -U emailclient emailclient | gzip > "$BACKUP_FILE"

# Verify backup integrity
if gzip -t "$BACKUP_FILE" 2>/dev/null; then
    echo "✓ Backup created: $BACKUP_FILE"
    echo "  Size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "✗ Backup failed: Corrupted file"
    exit 1
fi

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "emailclient_db_*.sql.gz" -mtime +7 -delete

# Backup Redis data
REDIS_BACKUP="$BACKUP_DIR/redis_$TIMESTAMP.rdb"
docker-compose exec redis redis-cli BGSAVE
sleep 2
docker cp emailclient-redis:/data/dump.rdb "$REDIS_BACKUP"

echo "✓ All backups complete"
```

Schedule with cron:

```bash
# Edit crontab
crontab -e

# Add: Run backup daily at 2 AM
0 2 * * * /path/to/deployment/backup.sh >> /var/log/email-backup.log 2>&1
```

#### Complete Volume Backup

```bash
# Backup all named volumes
for volume in redis-data postgres-data dovecot-data; do
    echo "Backing up $volume..."
    docker run --rm -v emailclient_$volume:/data -v $(pwd):/backup \
        alpine tar czf /backup/${volume}_$(date +%s).tar.gz -C /data .
done
```

### Restore from Backup

#### Restore PostgreSQL

```bash
# 1. Bring down services
docker-compose down

# 2. Remove old data volume
docker volume rm emailclient_postgres-data

# 3. Start fresh PostgreSQL
docker-compose up -d postgres
sleep 10

# 4. Restore from backup
gunzip < emailclient_db_20260124_020000.sql.gz | \
docker-compose exec -T postgres psql -U emailclient emailclient

# 5. Verify restoration
docker-compose exec postgres psql -U emailclient -d emailclient -c "SELECT COUNT(*) FROM email_messages;"

# 6. Restart all services
docker-compose up -d
```

#### Restore Redis

```bash
# 1. Stop Redis
docker-compose down redis

# 2. Restore dump file
docker cp redis_1706050800.rdb emailclient-redis:/data/dump.rdb

# 3. Start Redis
docker-compose up -d redis

# 4. Verify
docker-compose exec redis redis-cli DBSIZE
```

### Point-in-Time Recovery (PITR)

Enable PostgreSQL WAL archiving for PITR:

```yaml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_INITDB_ARGS: >
      -c wal_level=replica
      -c archive_mode=on
      -c archive_command='test ! -f /wal_archive/%f && cp %p /wal_archive/%f'
  volumes:
    - postgres-data:/var/lib/postgresql/data
    - wal-archive:/wal_archive

volumes:
  wal-archive:
    driver: local
```

Restore to specific point in time:

```bash
# 1. Get base backup
docker-compose exec postgres pg_basebackup -D /tmp/backup -v

# 2. Create recovery.conf
cat > /tmp/backup/recovery.conf << 'EOF'
restore_command = 'cp /wal_archive/%f %p'
recovery_target_timeline = 'latest'
recovery_target_time = '2026-01-24 12:30:00'
EOF

# 3. Restore
docker-compose exec postgres pg_ctl -D /tmp/backup start
```

### Backup Verification

```bash
# Verify backup integrity
gzip -t emailclient_db_20260124_020000.sql.gz && echo "✓ Backup valid"

# Test restore in temporary environment
docker-compose up -d postgres --no-start
docker volume create temp_postgres_data
gunzip < backup.sql.gz | docker-compose exec -T postgres psql -U emailclient
docker volume rm temp_postgres_data

# Checksum verification
sha256sum emailclient_db_*.sql.gz > backups.sha256
sha256sum -c backups.sha256
```

### Cloud Backup Integration

#### AWS S3 Backup

```bash
#!/bin/bash

BACKUP_FILE="emailclient_db_$(date +%Y%m%d_%H%M%S).sql.gz"

# Create backup
docker-compose exec -T postgres pg_dump -U emailclient emailclient | gzip > "$BACKUP_FILE"

# Upload to S3
aws s3 cp "$BACKUP_FILE" s3://my-backup-bucket/email-client/

# Delete local copy
rm "$BACKUP_FILE"

echo "✓ Backup uploaded to S3"
```

#### Google Cloud Storage Backup

```bash
#!/bin/bash

BACKUP_FILE="emailclient_db_$(date +%Y%m%d_%H%M%S).sql.gz"
BUCKET="gs://my-backup-bucket/email-client"

# Create backup
docker-compose exec -T postgres pg_dump -U emailclient emailclient | gzip > "$BACKUP_FILE"

# Upload to GCS
gsutil cp "$BACKUP_FILE" "$BUCKET/"

# Verify
gsutil ls "$BUCKET/"

echo "✓ Backup uploaded to GCS"
```

---

## Security

### SSL/TLS Certificate Setup

#### Self-Signed Certificates (Development)

Certificates are auto-generated in Dockerfiles:

```bash
# Check certificate expiration
docker-compose exec dovecot openssl x509 -in /etc/dovecot/certs/dovecot.crt -noout -dates

# Renew self-signed cert (365 days)
docker-compose exec dovecot openssl req -x509 -newkey rsa:2048 \
  -keyout /etc/dovecot/private/dovecot.key \
  -out /etc/dovecot/certs/dovecot.crt \
  -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=Org/CN=emailclient.local"
```

#### Let's Encrypt Certificates (Production)

```bash
# 1. Install certbot on host
sudo apt-get install certbot

# 2. Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# 3. Mount in docker-compose.yml
volumes:
  - /etc/letsencrypt/live/yourdomain.com/fullchain.pem:/etc/nginx/ssl/cert.pem:ro
  - /etc/letsencrypt/live/yourdomain.com/privkey.pem:/etc/nginx/ssl/key.pem:ro

# 4. Auto-renew with cron
# Add to crontab:
0 3 1 * * certbot renew && docker-compose reload nginx
```

#### Nginx SSL Configuration

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # SSL/TLS hardening
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # HSTS (enforce HTTPS)
    add_header Strict-Transport-Security "max-age=31536000" always;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Database Security

#### PostgreSQL Authentication

```bash
# Change default password
docker-compose exec postgres psql -U emailclient -d emailclient -c \
  "ALTER USER emailclient WITH PASSWORD 'new-secure-password';"

# Create read-only user for backups
docker-compose exec postgres psql -U emailclient -d emailclient -c \
  "CREATE USER backup_user WITH PASSWORD 'backup-password' LOGIN;"

docker-compose exec postgres psql -U emailclient -d emailclient -c \
  "GRANT CONNECT ON DATABASE emailclient TO backup_user;
   GRANT USAGE ON SCHEMA public TO backup_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;"
```

#### Connection Security

```env
# In .env - Use SSL for PostgreSQL connections
DATABASE_URL=postgresql://emailclient:password@postgres:5432/emailclient_db?sslmode=require
```

### Redis Security

#### Enable Redis Authentication

```bash
# Generate strong password
REDIS_PASSWORD=$(python3 -c "import secrets; print(secrets.token_hex(16))")

# Update docker-compose.yml
redis:
  command: redis-server --requirepass $REDIS_PASSWORD

# Update .env
REDIS_URL=redis://:$REDIS_PASSWORD@redis:6379/0
```

#### Redis Bind Address (Network Security)

```bash
# In redis.conf - Only bind to internal network
bind 127.0.0.1 redis  # Don't expose to host

# Disable dangerous commands
docker-compose exec redis redis-cli CONFIG SET CONFIG ""
docker-compose exec redis redis-cli CONFIG SET SHUTDOWN ""
```

### API Security

#### JWT Token Management

```bash
# Generate new JWT secret (run quarterly)
JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

# Update .env and redeploy
docker-compose down
# Edit .env with new JWT_SECRET
docker-compose up -d

# Active tokens remain valid until expiration (JWT_EXPIRATION_HOURS=24)
```

#### Rate Limiting

```env
# Prevent brute force attacks
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_REQUESTS_PER_HOUR=1000

# Stricter limits for sensitive endpoints
# POST /auth/login: 5 requests/minute
# POST /auth/register: 3 requests/minute
# POST /email/send: 50 requests/hour per user
```

#### CORS Headers

```env
# Only allow frontend origin
CORS_ORIGINS=yourdomain.com:3000

# Nginx adds security headers
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### Credential Management

#### Encrypt Email Credentials

```bash
# Generate encryption key (256-bit)
ENCRYPTION_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")

# Update .env
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env

# Restart services
docker-compose up -d
```

#### Secure Credential Storage

Email account passwords are:
- Encrypted at rest with `ENCRYPTION_KEY`
- Never returned in API responses
- Only used internally for IMAP/SMTP connections
- Never logged

```python
# Example secure credential retrieval
from cryptography.fernet import Fernet

cipher = Fernet(ENCRYPTION_KEY.encode())
encrypted_password = db.get_credential(user_id)
plaintext_password = cipher.decrypt(encrypted_password).decode()

# NEVER:
# - Log plaintext_password
# - Return plaintext_password to client
# - Use password in external API calls
```

### Access Control

#### Multi-Tenant Isolation

Every query must filter by `tenantId`:

```python
# ✓ CORRECT
def get_emails(tenant_id: str, user_id: str):
    return db.email_messages.filter({
        'tenant_id': tenant_id,
        'user_id': user_id
    })

# ✗ WRONG
def get_emails(user_id: str):
    return db.email_messages.filter({'user_id': user_id})  # Tenant exposed!
```

#### API Authentication

```bash
# All API requests require Authorization header
curl -H "Authorization: Bearer $JWT_TOKEN" http://localhost:8500/email/inbox

# Header structure: "Bearer <JWT token>"
# Token includes: user_id, tenant_id, permissions, expiration
```

### Audit Logging

```bash
# Enable audit logging in .env
LOG_LEVEL=INFO

# Audit log includes:
# - All authentication attempts (success/failure)
# - All email operations (send, delete, archive)
# - All account changes
# - All administrative actions

# View audit logs
docker-compose logs email-service | grep "audit\|AUDIT\|user_action"
```

### Regular Security Updates

```bash
# Weekly: Check for base image updates
docker pull python:3.11-slim
docker pull postgres:16-alpine
docker pull redis:7-alpine

# Monthly: Update Python packages
docker-compose exec email-service pip install --upgrade pip setuptools
docker-compose exec email-service pip install --upgrade -r requirements.txt

# Quarterly: Rotate secrets
# - JWT_SECRET
# - ENCRYPTION_KEY
# - Database passwords
# - API tokens

# Annually: Update SSL certificates
# - Renew Let's Encrypt certificates
# - Rotate self-signed certificates in development
```

---

## Production Checklist

Before deploying to production, verify all items:

### Infrastructure

- [ ] Docker Engine 20.10+ installed and updated
- [ ] Docker Compose 2.0+ installed
- [ ] Minimum 16GB RAM available
- [ ] Minimum 100GB disk space for databases/backups
- [ ] Network connectivity verified (ports 80, 443, 25, 587 accessible)
- [ ] Firewall configured (only needed ports exposed)
- [ ] SSL/TLS certificates installed and valid
- [ ] Backup strategy defined and tested
- [ ] Monitoring/alerting system in place

### Secrets Management

- [ ] All `.env` variables set with production values
- [ ] `.env` file NOT committed to git
- [ ] `JWT_SECRET` generated with cryptographically secure random
- [ ] `ENCRYPTION_KEY` generated and stored securely
- [ ] Database passwords changed from defaults
- [ ] Redis password set (REDIS_PASSWORD)
- [ ] Secrets stored in secure vault (HashiCorp Vault, AWS Secrets Manager)

### Database

- [ ] PostgreSQL initialized with schema
- [ ] Database backups automated (daily)
- [ ] Backup verification automated (restore test weekly)
- [ ] Read replicas configured (for high availability)
- [ ] Connection pooling configured (max_connections=100)
- [ ] Query logging enabled for troubleshooting
- [ ] Vacuum/analyze scheduled (daily)

### Email Service

- [ ] GUNICORN_WORKERS set to CPU cores × 2-4
- [ ] GUNICORN_THREADS tuned for workload
- [ ] Celery workers running (separate containers or processes)
- [ ] Task retry logic configured (exponential backoff)
- [ ] Dead letter queue monitoring enabled
- [ ] Rate limiting configured
- [ ] API authentication enforced (JWT tokens)

### Network & Security

- [ ] HTTPS/TLS enabled on all external traffic
- [ ] CORS origins restricted to known domains
- [ ] Security headers configured in Nginx
- [ ] WAF (Web Application Firewall) rules reviewed
- [ ] DDoS protection enabled (CloudFlare, AWS Shield)
- [ ] All logs centralized and monitored
- [ ] Intrusion detection enabled

### Monitoring & Logging

- [ ] Health check endpoints verified (all services responsive)
- [ ] Prometheus/Grafana dashboards created
- [ ] Log aggregation system active (ELK Stack, Splunk)
- [ ] Alert rules configured (CPU, memory, disk, error rates)
- [ ] Error budget defined and monitored
- [ ] Performance baselines established
- [ ] On-call rotation configured

### Email Delivery

- [ ] SPF records configured for domain
- [ ] DKIM keys generated and published
- [ ] DMARC policy configured (reject/quarantine)
- [ ] Postfix relay host configured correctly
- [ ] Dovecot TLS certificates installed
- [ ] Mail queue monitoring active
- [ ] Bounce handling configured
- [ ] Spam filter rules tuned

### Testing

- [ ] Load test passed (100+ concurrent users)
- [ ] Failover test completed (single service down)
- [ ] Restore from backup tested
- [ ] Email send/receive tested end-to-end
- [ ] API rate limiting tested
- [ ] Multi-tenant isolation verified (no data leakage)
- [ ] Penetration testing completed (by security team)

### Documentation

- [ ] Runbook created for common operations
- [ ] Disaster recovery plan documented
- [ ] On-call procedures documented
- [ ] API documentation updated
- [ ] Architecture diagram shared with team
- [ ] Deployment steps documented
- [ ] Escalation procedures documented

### Performance

- [ ] API response time < 500ms (p95)
- [ ] Database query time < 100ms (p95)
- [ ] Email sync completes within IMAP_SYNC_INTERVAL
- [ ] Redis memory usage < 80% of limit
- [ ] PostgreSQL active connections < max_connections
- [ ] CPU usage < 70% peak
- [ ] Disk I/O healthy (no throttling)

---

## Common Operations

### Daily Tasks

```bash
# Check service health
./monitoring/health-check.sh

# Review error logs
docker-compose logs --tail=100 email-service | grep ERROR

# Monitor Redis memory
docker-compose exec redis redis-cli INFO memory | grep -E "used_memory|maxmemory"

# Check mail queue (Postfix)
docker-compose exec postfix mailq | head -5
```

### Weekly Tasks

```bash
# Full system backup
./deployment/backup.sh

# Verify backup integrity
gzip -t backups/emailclient_db_*.sql.gz && echo "✓ All backups valid"

# Review performance metrics
docker stats --no-stream

# Check PostgreSQL bloat
docker-compose exec postgres psql -U emailclient -d emailclient -c \
  "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size DESC LIMIT 10;"
```

### Monthly Tasks

```bash
# Update Docker images
docker-compose pull
docker-compose up -d

# Review and rotate logs
docker-compose logs email-service | tail -1000 > logs/monthly_summary.log

# Rotate secrets (if needed)
# - Review JWT_SECRET usage
# - Check if encryption key rotation needed

# Test disaster recovery
# - Perform restore from backup to test environment
# - Verify all data integrity
```

---

## Support & Troubleshooting

For issues not covered above:

1. Check service logs: `docker-compose logs -f SERVICE_NAME`
2. Verify health checks: `./monitoring/health-check.sh`
3. Check system resources: `docker stats`
4. Review recent changes: `git log --oneline -20`
5. Contact DevOps team with logs attached

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-24
**Maintained By**: MetaBuilder DevOps
