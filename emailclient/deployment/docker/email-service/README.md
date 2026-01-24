# Phase 8: Email Service Container

Production-ready Flask REST API service for the MetaBuilder Email Client implementation. This container provides IMAP/SMTP email operations, Celery background job processing, and multi-tenant support.

## Overview

### Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Email Service (Flask)                        │
│                     Port 5000 (HTTP)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  RESTful API Endpoints:                                  │  │
│  │  - /api/accounts - Email account management              │  │
│  │  - /api/sync - IMAP synchronization                      │  │
│  │  - /api/compose - Email composition & sending            │  │
│  │  - /health - Service health check                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         ↓              ↓              ↓
    [PostgreSQL]   [Redis]       [Postfix/Dovecot]
    Database       Cache/Tasks    Email Infrastructure
```

### Features

- **Flask REST API**: 4 worker processes with thread support for high concurrency
- **Gunicorn Server**: Production-grade WSGI application server with graceful shutdown
- **Celery Integration**: Background job processing for async email operations
- **Multi-tenant Support**: Tenant isolation via X-Tenant-ID header
- **Security**: JWT authentication, encrypted credential storage, rate limiting
- **Health Monitoring**: Built-in health check endpoint and container healthcheck
- **Comprehensive Logging**: Access and error logs to persistent volume
- **Non-root User**: Runs as unprivileged `emailservice` user for security

### Phase 8 Components

Part of the Email Client Implementation Phase 8 which includes:
1. **Email Service Container** (this)
2. Postfix SMTP Server
3. Dovecot IMAP/POP3 Server
4. PostgreSQL Database
5. Redis Cache & Message Broker
6. Celery Workers (async task processing)
7. Celery Beat (scheduled tasks)

## Building the Container

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Access to services/email_service/ source code

### Build from Source

```bash
# From project root
docker build -f emailclient/deployment/docker/email-service/Dockerfile \
  -t emailclient-email-service:latest \
  --build-arg SERVICE_VERSION=1.0.0 \
  .

# With custom tag
docker build -f emailclient/deployment/docker/email-service/Dockerfile \
  -t myregistry.azurecr.io/emailclient-email-service:v1.0.0 \
  .
```

### Build Configuration

- **Base Image**: python:3.11-slim (82 MB)
- **Multi-stage Build**: Reduces final image size by excluding build dependencies
- **Optimization**: Virtual environment reuse, minimal runtime dependencies
- **Final Image Size**: ~250-300 MB (including all Python dependencies)

## Running the Container

### Docker Compose (Recommended)

```bash
# Start all services
cd emailclient
docker-compose up -d

# View logs
docker-compose logs -f email-service

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: data loss)
docker-compose down -v
```

### Docker Run (Standalone)

```bash
docker run -d \
  --name emailclient-email-service \
  --net emailclient-net \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@postgres:5432/emailclient_db" \
  -e REDIS_URL="redis://redis:6379/0" \
  -e JWT_SECRET="your-secret-key-here" \
  -v email-service-logs:/app/logs \
  -v email-service-data:/app/data \
  emailclient-email-service:latest
```

## Environment Variables

### Required Variables

```bash
# Database connection
DATABASE_URL=postgresql://emailclient:password@postgres:5432/emailclient_db

# Redis connection (Celery broker)
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/1

# Security token
JWT_SECRET=your-jwt-secret-key-change-in-production
```

### Optional Variables (with defaults)

```bash
# Flask Configuration
FLASK_ENV=production                    # or 'development'
FLASK_HOST=0.0.0.0
FLASK_PORT=5000

# CORS Configuration
CORS_ORIGINS=localhost:3000,emailclient.local:3000

# Email Service Configuration
IMAP_TIMEOUT=30                         # seconds
SMTP_TIMEOUT=30                         # seconds
IMAP_POOL_SIZE=10
SMTP_POOL_SIZE=5

# Gunicorn Configuration
GUNICORN_WORKERS=4                      # worker processes
GUNICORN_THREADS=2                      # threads per worker
GUNICORN_TIMEOUT=120                    # seconds

# Encryption
ENCRYPTION_KEY=your-encryption-key-change-in-production

# Logging
LOG_LEVEL=INFO                          # DEBUG, INFO, WARNING, ERROR

# Feature Flags
ENABLE_IMAP_SYNC=true
ENABLE_SMTP_SEND=true
ENABLE_CELERY_TASKS=true
ENABLE_EMAIL_PARSING=true

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_REQUESTS_PER_HOUR=1000

# Multi-tenant
TENANT_ID_HEADER=X-Tenant-ID
DEFAULT_TENANT_ID=default
```

### Configuration File

Create `.env` file in `emailclient/` directory (copy from `.env.example`):

```bash
cp emailclient/deployment/docker/email-service/.env.example .env
```

## API Endpoints

### Health Check

```bash
GET /health

Response: 200 OK
{
  "status": "healthy",
  "service": "email_service"
}
```

### Account Management

```bash
# List email accounts
GET /api/accounts

# Create email account
POST /api/accounts
Body: { "email": "user@example.com", "password": "***" }

# Get account details
GET /api/accounts/{account_id}

# Update account
PUT /api/accounts/{account_id}

# Delete account
DELETE /api/accounts/{account_id}
```

### Email Synchronization

```bash
# Trigger IMAP sync for account
POST /api/sync/imap/{account_id}

# Get sync status
GET /api/sync/status/{account_id}

# Search emails
GET /api/sync/search?query=from:user@example.com
```

### Email Composition

```bash
# Compose new email
POST /api/compose
Body: {
  "to": ["recipient@example.com"],
  "subject": "Email Subject",
  "body": "Email body text",
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"]
}

# Send email
POST /api/compose/send/{draft_id}

# Save draft
POST /api/compose/draft
```

### Multi-tenant Requests

All requests support multi-tenancy via header:

```bash
curl -H "X-Tenant-ID: acme-corp" http://localhost:5000/api/accounts
```

## Health Checks

### Container Health Status

```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# View health status details
docker inspect --format='{{.State.Health.Status}}' emailclient-email-service
```

### Manual Health Check

```bash
# From host
curl http://localhost:5000/health

# From another container
docker exec emailclient-email-service curl http://localhost:5000/health
```

### Healthcheck Configuration

The container includes an automated health check:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
  interval: 30s         # Check every 30 seconds
  timeout: 10s          # Timeout after 10 seconds
  retries: 3            # Mark unhealthy after 3 failures
  start_period: 15s     # Grace period before checks start
```

## Volumes

### Logs Volume

- **Mount Path**: `/app/logs`
- **Contents**:
  - `access.log` - HTTP access logs from gunicorn
  - `error.log` - Application error logs
  - `email-service.log` - Service-specific logs

```bash
# View logs in real-time
docker-compose logs -f email-service

# Extract specific logs
docker cp emailclient-email-service:/app/logs ./logs
```

### Data Volume

- **Mount Path**: `/app/data`
- **Contents**:
  - Email drafts (temporary)
  - Application cache files
  - Attachment temporary storage

## Worker Processes

### Configuration

- **Worker Processes**: 4 (configurable via GUNICORN_WORKERS)
- **Threads per Worker**: 2 (configurable via GUNICORN_THREADS)
- **Total Concurrency**: 8 concurrent connections
- **Worker Class**: gthread (threaded worker for I/O-bound operations)

### Performance Tuning

```bash
# For higher throughput (more workers)
GUNICORN_WORKERS=8              # Increase for CPU-bound workload
GUNICORN_THREADS=4              # Increase for I/O-bound workload

# For memory-constrained environments
GUNICORN_WORKERS=2              # Reduce workers
GUNICORN_THREADS=1              # Single thread mode

# Worker lifecycle management
--max-requests=10000            # Restart worker after 10k requests
--max-requests-jitter=1000      # Random jitter to prevent thundering herd
--timeout=120                   # Kill worker if no response in 120s
```

## Background Jobs (Celery)

### Email Service Celery Tasks

Email-intensive operations run asynchronously via Celery workers:

```python
# IMAP synchronization task
@celery.task
def sync_imap_account(account_id, tenant_id):
    """Fetch emails from IMAP server"""

# SMTP sending task
@celery.task
def send_email(draft_id, tenant_id):
    """Send email via Postfix"""

# Email parsing task
@celery.task
def parse_email_body(message_id, tenant_id):
    """Parse HTML/plain-text email bodies"""
```

### Running Task Workers

The docker-compose.yml includes dedicated services:

```yaml
celery-worker:
  # Background job processor (4 concurrent tasks)

celery-beat:
  # Scheduled task runner (e.g., hourly IMAP sync)
```

### View Task Status

```bash
# Monitor Celery tasks
docker-compose logs -f celery-worker

# Check task queue depth
redis-cli LLEN celery  # Broker queue length
```

## Networking

### Network Topology

```
emailclient-net (bridge network)
├── email-service      (172.25.0.x)
├── postgres           (172.25.0.x)
├── redis              (172.25.0.x)
├── postfix            (172.25.0.x)
└── dovecot            (172.25.0.x)
```

### DNS Resolution

Services can reach each other by hostname within the network:

```bash
# From email-service container
curl http://postgres:5432              # PostgreSQL
curl http://redis:6379                 # Redis
curl http://postfix:25                 # Postfix SMTP
curl http://dovecot:143                # Dovecot IMAP
```

### Port Mapping

| Service | Internal Port | External Port | Protocol |
|---------|--------------|---------------|----------|
| Flask API | 5000 | 5000 | HTTP |
| PostgreSQL | 5432 | 5433 | TCP |
| Redis | 6379 | 6379 | TCP |
| Postfix SMTP | 25 | 25 | SMTP |
| Dovecot IMAP | 143 | 143 | IMAP |
| Dovecot IMAPS | 993 | 993 | IMAPS |
| Dovecot POP3 | 110 | 110 | POP3 |
| Dovecot POP3S | 995 | 995 | POP3S |

## Security Considerations

### User Privilege

The container runs as non-root user for security:

```dockerfile
RUN useradd -m -u 1000 -s /sbin/nologin emailservice
USER emailservice
```

### Credential Storage

Email credentials are encrypted using AES-256:

```python
from cryptography.fernet import Fernet

# Credentials stored as encrypted tokens in PostgreSQL
encrypted = Fernet(ENCRYPTION_KEY).encrypt(password.encode())
```

### JWT Authentication

API requests require JWT tokens in Authorization header:

```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:5000/api/accounts
```

### Rate Limiting

Protect against abuse with configurable rate limits:

```bash
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60      # 60 requests/minute per IP
RATE_LIMIT_REQUESTS_PER_HOUR=1000      # 1000 requests/hour per IP
```

## Troubleshooting

### Container Won't Start

```bash
# Check build logs
docker-compose logs email-service

# Verify image exists
docker images | grep emailclient-email-service

# Check resource availability
docker stats

# Rebuild image
docker-compose build --no-cache email-service
```

### Health Check Failures

```bash
# Test health endpoint manually
docker exec emailclient-email-service \
  curl -v http://localhost:5000/health

# Check recent logs
docker-compose logs --tail 50 email-service

# Verify dependencies
docker-compose logs postgres redis postfix dovecot
```

### High Memory Usage

```bash
# Check current usage
docker stats emailclient-email-service

# Reduce worker count
GUNICORN_WORKERS=2 docker-compose up -d

# Monitor over time
docker stats --no-stream emailclient-email-service
```

### Database Connection Issues

```bash
# Test PostgreSQL connectivity
docker exec emailclient-email-service \
  psql -h postgres -U emailclient -d emailclient_db -c "SELECT 1"

# Check DATABASE_URL environment variable
docker inspect emailclient-email-service | grep DATABASE_URL

# View PostgreSQL logs
docker-compose logs postgres
```

### Email Not Syncing

```bash
# Check Celery worker logs
docker-compose logs celery-worker

# Verify Redis connection
docker exec emailclient-email-service redis-cli ping

# Monitor task queue
redis-cli LLEN celery

# Check Celery task results
docker exec emailclient-email-service \
  celery -A tasks inspect active
```

## Deployment Checklist

Before deploying to production:

- [ ] Set unique JWT_SECRET (not default value)
- [ ] Set ENCRYPTION_KEY to strong random value
- [ ] Configure DATABASE_URL with production database
- [ ] Configure REDIS_URL with production Redis instance
- [ ] Set appropriate GUNICORN_WORKERS for expected load
- [ ] Configure RATE_LIMIT_* based on API usage patterns
- [ ] Set FLASK_ENV=production (never 'development')
- [ ] Configure CORS_ORIGINS to trusted domains only
- [ ] Set up log aggregation (send logs to ELK, Splunk, etc.)
- [ ] Configure database backups
- [ ] Set up monitoring/alerting for health checks
- [ ] Test failover and recovery procedures
- [ ] Review security settings with IT team
- [ ] Load test with expected concurrent users

## Performance Optimization

### Scaling Horizontally

```yaml
# Multiple service replicas with load balancer
email-service-1:
  # Instance 1

email-service-2:
  # Instance 2

email-service-3:
  # Instance 3

nginx:
  # Load balancer routing to all instances
```

### Scaling Vertically

```bash
# Increase worker processes (4 → 8)
GUNICORN_WORKERS=8

# Increase threads per worker (2 → 4)
GUNICORN_THREADS=4

# Total concurrency: 8 × 4 = 32 concurrent connections
```

### Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_email_account_tenant ON email_account(tenant_id);
CREATE INDEX idx_email_message_account ON email_message(account_id);
CREATE INDEX idx_email_message_received ON email_message(received_date DESC);
```

## Maintenance

### Backup Strategy

```bash
# Backup PostgreSQL database
docker exec emailclient-postgres \
  pg_dump -U emailclient emailclient_db > backup.sql

# Backup volumes
docker run --rm \
  -v email-service-logs:/app/logs \
  -v $(pwd):/backup \
  alpine tar czf /backup/logs.tar.gz /app/logs
```

### Log Rotation

Logs are stored in persistent volume. Implement log rotation:

```bash
# In docker-compose.yml (optional)
email-service:
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "10"
```

### Upgrade Procedure

```bash
# Pull latest code
git pull origin main

# Rebuild container
docker-compose build --no-cache email-service

# Restart service (with zero downtime via rolling restart)
docker-compose up -d email-service
```

## Monitoring & Logging

### Prometheus Metrics (Future Phase)

```yaml
# Metrics endpoint (to be implemented)
GET /metrics

Exports:
- request_duration_seconds
- requests_total
- emails_processed_total
- database_connection_pool_size
- redis_cache_hits_total
```

### Structured Logging

All logs include JSON structure for parsing:

```json
{
  "timestamp": "2026-01-24T10:30:45.123Z",
  "level": "INFO",
  "service": "email_service",
  "request_id": "uuid-1234-5678",
  "tenant_id": "acme-corp",
  "message": "Email account synced successfully",
  "duration_ms": 2345
}
```

## Support & Documentation

- **CLAUDE.md**: Full project development guide
- **Email Client Plan**: `/docs/plans/2026-01-23-email-client-implementation.md`
- **Issue Tracker**: GitHub Issues (link in repo)
- **Contact**: dev@metabuilder.local

## Version

- **Phase**: 8 (Email Client Implementation)
- **Image Version**: 1.0.0
- **Base Python**: 3.11
- **Created**: 2026-01-24
- **Last Updated**: 2026-01-24

## License

MetaBuilder - Internal Use Only
