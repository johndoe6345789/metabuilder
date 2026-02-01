# Phase 8: Email Client Docker Compose Orchestration

## Overview

Production-ready Docker Compose configuration for the complete email client system with:

- **Frontend**: Next.js application (emailclient) on port 3000
- **Email Service**: Python Flask API with IMAP/SMTP/POP3 support on port 5000
- **Message Queue**: Celery worker for background jobs
- **Database**: PostgreSQL 16 for multi-tenant email metadata
- **Cache**: Redis for sessions, cache, and message broker
- **SMTP Relay**: Postfix for outgoing email
- **IMAP Server**: Dovecot for incoming email and storage
- **Reverse Proxy**: Nginx with SSL/TLS termination and rate limiting

## Architecture

### Networks

```
┌─────────────────────────────────────────────────┐
│                   Public Network                │
│              (Nginx - Port 80/443)              │
└────────────────┬────────────────────────────────┘
                 │
         ┌───────▼────────┐
         │  emailclient   │ (Next.js Frontend)
         │   (Port 3000)  │
         └───────┬────────┘
                 │
         ┌───────▼─────────────────────────────┐
         │       Internal Network              │
         │  (Backend Services - No External)   │
         │                                     │
         │  ┌─────────────────────────────┐   │
         │  │  email-service (Flask)      │   │
         │  │  celery-worker (Celery)     │   │
         │  │  postgres (Database)        │   │
         │  │  redis (Cache/Broker)       │   │
         │  │  postfix (SMTP Relay)       │   │
         │  │  dovecot (IMAP Server)      │   │
         │  └─────────────────────────────┘   │
         └─────────────────────────────────────┘
```

### Service Dependencies

```
emailclient
├── postgres (database)
├── redis (cache)
└── email-service

email-service
├── postgres
├── redis
├── postfix
└── dovecot

celery-worker
├── postgres
├── redis
├── email-service
├── postfix
└── dovecot

nginx
└── emailclient
```

## Quick Start

### 1. Prerequisites

```bash
# Verify Docker and Docker Compose installation
docker --version
docker compose version

# Minimum requirements:
# - Docker Engine 20.10+
# - Docker Compose 2.0+
# - 8GB RAM available
# - 20GB disk space
```

### 2. Configuration

```bash
# Create environment file
cp deployment/.env.example deployment/.env

# Edit .env with your values
nano deployment/.env

# Key variables to update:
POSTGRES_PASSWORD=your_secure_password
REDIS_PASSWORD=your_secure_password
SESSION_SECRET=your_random_32_char_string
ENCRYPTION_KEY=your_random_32_char_string
POSTFIX_ALLOWED_DOMAINS=your.domain.com
POSTFIX_HOSTNAME=mail.your.domain.com
```

### 3. SSL/TLS Certificates

```bash
# Create SSL directory
mkdir -p deployment/config/nginx/ssl
mkdir -p deployment/config/postfix/tls
mkdir -p deployment/config/dovecot/tls

# Generate self-signed certificates for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout deployment/config/nginx/ssl/emailclient.key \
  -out deployment/config/nginx/ssl/emailclient.crt

# For Postfix (SMTP TLS)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout deployment/config/postfix/tls/postfix.key \
  -out deployment/config/postfix/tls/postfix.crt

# For Dovecot (IMAP/POP3 TLS)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout deployment/config/dovecot/tls/dovecot.key \
  -out deployment/config/dovecot/tls/dovecot.crt

# Production: Use Let's Encrypt
certbot certonly --standalone -d your.domain.com
cp /etc/letsencrypt/live/your.domain.com/fullchain.pem deployment/config/nginx/ssl/emailclient.crt
cp /etc/letsencrypt/live/your.domain.com/privkey.pem deployment/config/nginx/ssl/emailclient.key
```

### 4. Create Database Initialization Script

The `deployment/scripts/init-email-db.sql` is automatically applied on PostgreSQL startup.
Contains:
- Email client configuration tables
- Email message and folder schemas
- Sync state tracking
- Draft and send queue management
- Full-text search indexes
- View definitions for common queries

### 5. Start Services

```bash
# Verify configuration
docker compose -f deployment/docker-compose.yml config

# Start all services
docker compose -f deployment/docker-compose.yml up -d

# Monitor startup
docker compose -f deployment/docker-compose.yml logs -f

# Check service health
docker compose -f deployment/docker-compose.yml ps
```

### 6. Access Application

```
Frontend:   http://localhost:80 or https://localhost:443
API:        http://localhost:8000/api/
Database:   localhost:5432
Redis:      localhost:6379
SMTP:       localhost:25 (internal) or localhost:587 (TLS)
IMAP:       localhost:143 (plain) or localhost:993 (TLS)
POP3:       localhost:110 (plain) or localhost:995 (TLS)
```

## Service Descriptions

### Nginx (Reverse Proxy)

**Purpose**: SSL/TLS termination, rate limiting, caching, security headers

**Exposed Ports**:
- 80: HTTP (redirects to HTTPS)
- 443: HTTPS

**Features**:
- TLSv1.2/TLSv1.3 encryption
- Gzip compression for responses
- Rate limiting: 100 req/s API, 5 req/m auth, 50 req/m compose
- Static asset caching (up to 365 days)
- Request/response buffering control for streaming
- Connection pooling to backend services

**Health Check**: GET /health (returns JSON status)

### Email Client (Frontend)

**Purpose**: Next.js web interface for email management

**Container**: emailclient
**Port**: 3000
**Dependencies**: postgres, redis, email-service

**Features**:
- Multi-tenant support
- Redux state management
- Real-time email list updates
- Offline draft support (via IndexedDB)
- Role-based access control

**Health Check**: GET / (200 response indicates healthy)

### Email Service (Backend)

**Purpose**: Python Flask API for email operations

**Container**: email-service
**Port**: 5000
**Dependencies**: postgres, redis, postfix, dovecot

**Endpoints**:
- POST /api/accounts - Create email account
- GET /api/accounts - List accounts
- POST /api/sync/start - Start IMAP sync
- GET /api/sync/status - Check sync status
- POST /api/compose/draft - Save draft
- POST /api/compose/send - Send email
- GET /health - Health check

**Environment Variables**:
- DATABASE_URL: PostgreSQL connection
- REDIS_URL: Redis cache
- CELERY_BROKER_URL: Celery message broker
- EMAIL_MAX_ATTACHMENT_SIZE: 50MB default
- EMAIL_SYNC_INTERVAL: 300 seconds default

**Health Check**: Custom Python script checking HTTP endpoint

### Celery Worker (Background Jobs)

**Purpose**: Asynchronous processing of email operations

**Container**: celery-worker
**No External Port**: Internal communication only

**Features**:
- IMAP synchronization
- Email sending (queued)
- Attachment processing
- Retry logic with exponential backoff
- Task deduplication

**Configuration**:
- Concurrency: 4 workers (configurable via CELERY_WORKER_CONCURRENCY)
- Prefetch multiplier: 1 (one task per worker)
- Max tasks per child: 1000 (memory management)

**Health Check**: celery inspect active command

### PostgreSQL (Database)

**Purpose**: Multi-tenant email metadata storage

**Container**: postgres
**Port**: 5432
**Version**: 16-alpine

**Databases**:
- emailclient: Primary database with email schemas

**Tables**:
- email_client: Account configuration
- email_folder: Folder hierarchy
- email_message: Individual emails
- email_attachment: Attachment metadata
- email_sync_state: Synchronization progress
- email_draft: Draft management
- email_send_queue: Outgoing email queue

**Features**:
- Full-text search indexes
- Multi-tenant isolation via tenant_id
- Automatic timestamp updates (triggers)
- View definitions for common queries
- Row-level security ready

**Health Check**: pg_isready command

**Backup Recommendation**:
```bash
# Daily backup
docker compose exec postgres pg_dump -U emailclient emailclient > backup-$(date +%Y%m%d).sql

# Restore
docker compose exec -T postgres psql -U emailclient emailclient < backup-20260124.sql
```

### Redis (Cache & Message Broker)

**Purpose**: Session caching, message broker for Celery, real-time data cache

**Container**: redis
**Port**: 6379
**Configuration**:
- Password protected
- Append-only file (AOF) persistence
- LRU eviction policy (max 512MB default)

**Databases**:
- 0: Frontend session cache
- 1: Email service cache
- 2: Celery task broker
- 3: Celery result backend

**Features**:
- Automatic memory management (LRU eviction)
- Persistence to disk
- Password authentication

**Health Check**: PING command

**Maintenance**:
```bash
# Monitor memory usage
docker compose exec redis redis-cli INFO memory

# Clear all data (development only)
docker compose exec redis redis-cli FLUSHALL

# Monitor tasks
docker compose exec redis redis-cli --db 2 KEYS '*'
```

### Postfix (SMTP Relay)

**Purpose**: Outgoing email relay

**Container**: postfix
**Port**: 25 (internal), 587 (TLS)

**Configuration**:
- Allowed domains (configurable)
- Optional relay through external SMTP (Gmail, SendGrid, etc.)
- Message size limit: 50MB
- TLS certificate support

**Features**:
- Queue management
- Bounce handling
- SPF/DKIM/DMARC ready (needs DNS configuration)

**Health Check**: postfix status command

**Relay Configuration (Optional)**:
```env
POSTFIX_RELAYHOST=[smtp.gmail.com]:587
POSTFIX_RELAYHOST_USERNAME=your-email@gmail.com
POSTFIX_RELAYHOST_PASSWORD=your-app-password
```

### Dovecot (IMAP/POP3 Server)

**Purpose**: Incoming email server and message storage

**Container**: dovecot
**Ports**:
- 143: IMAP
- 993: IMAPS (TLS)
- 110: POP3
- 995: POP3S (TLS)

**Configuration**:
- Mail storage: /var/mail
- Protocols: IMAP and POP3
- TLS certificate support

**Features**:
- Full IMAP protocol support
- POP3 compatibility
- Mailbox management
- UID validity tracking

**Health Check**: doveadm ping command

## Volumes & Persistence

| Volume | Container | Purpose | Size |
|--------|-----------|---------|------|
| postgres_data | postgres | Database files | Dynamic |
| redis_data | redis | Cache persistence | Dynamic |
| emailclient_uploads | emailclient | User uploads | 5GB |
| emailclient_cache | emailclient | Next.js cache | Dynamic |
| emailclient_sessions | emailclient | Session storage | Dynamic |
| email_service_logs | email-service, celery-worker | Application logs | Dynamic |
| email_attachments | email-service, celery-worker | Attachment temp storage | 10GB |
| email_temp | email-service, celery-worker | Temporary files | 5GB |
| postfix_queue | postfix | SMTP queue | Dynamic |
| postfix_logs | postfix | Mail logs | Dynamic |
| dovecot_data | dovecot | Mailbox storage | Dynamic |
| dovecot_config | dovecot | Configuration | Dynamic |
| dovecot_logs | dovecot | Mail logs | Dynamic |
| nginx_cache | nginx | Response cache | 2GB |
| nginx_logs | nginx | Access logs | Dynamic |

**Backup Strategy**:
```bash
# Backup database
docker compose exec postgres pg_dump -U emailclient emailclient > backup.sql

# Backup attachments
docker compose exec -T emailclient tar czf /tmp/attachments.tar.gz /data/attachments
docker cp emailclient-app:/tmp/attachments.tar.gz ./backup/

# Backup mailbox data
docker cp emailclient-dovecot:/var/mail ./backup/dovecot-mail-$(date +%Y%m%d)
```

## Resource Limits

Docker resource allocation per service:

| Service | CPU Limit | Memory Limit | CPU Reserve | Memory Reserve |
|---------|-----------|--------------|-------------|----------------|
| nginx | 1 | 512M | 0.25 | 128M |
| emailclient | 2 | 2G | 0.5 | 512M |
| email-service | 1.5 | 1G | 0.5 | 256M |
| celery-worker | 2 | 1.5G | 0.5 | 512M |
| postgres | 2 | 2G | 0.5 | 512M |
| redis | 1 | 1G | 0.25 | 256M |
| postfix | 0.5 | 512M | 0.25 | 128M |
| dovecot | 1 | 1G | 0.25 | 256M |

**Total**: 11.5 CPU / 9.5 GB RAM (limits) | 3.75 CPU / 3.25 GB RAM (reserved)

**Adjust** via docker-compose.yml `deploy.resources` section for your infrastructure.

## Logging

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f email-service

# Last 100 lines
docker compose logs --tail=100 emailclient

# Nginx access logs
docker compose logs -f nginx

# Error logs only
docker compose logs -f email-service 2>&1 | grep ERROR
```

### Log Rotation (Production)

```bash
# Configure logrotate
cat > /etc/logrotate.d/emailclient << 'EOF'
/path/to/deployment/volumes/nginx_logs/* {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  notifempty
}
/path/to/deployment/volumes/email_service_logs/* {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  notifempty
}
EOF
```

## Monitoring & Health Checks

### Service Status

```bash
# Check all services
docker compose ps

# Expected output:
# NAME                    STATUS              PORTS
# emailclient-app         Up (healthy)        3000/tcp
# emailclient-email-service   Up (healthy)    5000/tcp
# emailclient-celery-worker   Up (healthy)    (no ports)
# emailclient-postgres    Up (healthy)        5432/tcp
# emailclient-redis       Up (healthy)        6379/tcp
# emailclient-postfix     Up                  25/tcp, 587/tcp
# emailclient-dovecot     Up                  143/tcp, 993/tcp, 110/tcp, 995/tcp
# emailclient-nginx       Up (healthy)        80/tcp, 443/tcp
```

### Health Endpoints

```bash
# Nginx
curl https://localhost/health

# Email Service
curl http://localhost:5000/health

# Frontend
curl http://localhost:3000/

# Database
docker compose exec postgres pg_isready -U emailclient

# Redis
docker compose exec redis redis-cli ping
```

### Monitoring Tools Integration

**Prometheus Metrics** (if enabled):
```bash
docker compose logs email-service | grep -i metric
```

**Status Monitoring Script**:
```bash
#!/bin/bash
while true; do
  clear
  echo "=== Email Client System Status ==="
  docker compose ps
  echo ""
  echo "=== Recent Errors ==="
  docker compose logs --since 5m 2>&1 | grep -i error | tail -5
  sleep 30
done
```

## Maintenance & Operations

### Database Operations

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U emailclient emailclient

# Run migrations
docker compose exec postgres psql -U emailclient emailclient < migration.sql

# Check database size
docker compose exec postgres psql -U emailclient emailclient \
  -c "SELECT pg_size_pretty(pg_database_size('emailclient'))"

# Vacuum database (maintenance)
docker compose exec postgres psql -U emailclient emailclient -c "VACUUM ANALYZE"
```

### Cache Operations

```bash
# Monitor Redis memory
docker compose exec redis redis-cli INFO memory

# Clear specific cache key
docker compose exec redis redis-cli DEL "emailclient:*"

# Monitor task queue
docker compose exec redis redis-cli --db 2 KEYS '*' | wc -l

# Check queue size
docker compose exec redis redis-cli --db 2 LLEN celery
```

### Email Service Operations

```bash
# Check service logs
docker compose logs -f email-service

# Monitor sync status
curl http://localhost:5000/api/sync/status

# Trigger manual sync
curl -X POST http://localhost:5000/api/sync/start \
  -H "Content-Type: application/json" \
  -d '{"email_client_id": 1}'

# Check pending tasks
docker compose logs celery-worker | grep "Task"
```

## Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Check PostgreSQL is running and healthy
docker compose ps postgres

# View logs
docker compose logs postgres

# Reset database (development only)
docker compose down postgres
docker volume rm deployment_postgres_data
docker compose up -d postgres
```

**2. Email Service Crashes**
```bash
# Check logs
docker compose logs email-service

# Verify environment variables
docker compose config | grep -A 20 "email-service"

# Test database connection
docker compose exec email-service python -c \
  "import psycopg2; psycopg2.connect(os.environ['DATABASE_URL'])"
```

**3. Celery Tasks Not Processing**
```bash
# Check worker is running
docker compose logs celery-worker

# Inspect active tasks
docker compose exec celery-worker celery -A tasks.celery_app inspect active

# Check Redis connection
docker compose logs celery-worker | grep redis

# Clear stuck tasks
docker compose exec redis redis-cli --db 2 FLUSHDB
docker compose restart celery-worker
```

**4. High Memory Usage**
```bash
# Check which service
docker compose stats

# For Redis
docker compose exec redis redis-cli INFO memory
# Clear old data
docker compose exec redis redis-cli FLUSHALL

# For Node.js
docker compose logs emailclient | grep "heap"
# Increase memory limit in docker-compose.yml
```

**5. SSL/TLS Certificate Issues**
```bash
# Check certificate
openssl x509 -in deployment/config/nginx/ssl/emailclient.crt -text -noout

# Verify certificate matches key
openssl x509 -noout -modulus -in deployment/config/nginx/ssl/emailclient.crt | openssl md5
openssl rsa -noout -modulus -in deployment/config/nginx/ssl/emailclient.key | openssl md5

# Test SSL connection
openssl s_client -connect localhost:443

# Regenerate if needed
./scripts/generate-certs.sh
docker compose restart nginx
```

## Upgrade & Maintenance

### Update Docker Images

```bash
# Pull latest images
docker compose pull

# Rebuild custom images
docker compose build --no-cache

# Recreate containers
docker compose up -d
```

### Database Migrations

```bash
# Create migration
docker compose exec postgres psql -U emailclient emailclient < migration-001.sql

# Backup before migration
docker compose exec postgres pg_dump -U emailclient emailclient > backup-pre-migration.sql

# Apply migration
docker compose exec postgres psql -U emailclient emailclient < schema-update.sql

# Verify
docker compose exec postgres psql -U emailclient emailclient \
  -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
```

### Backup & Restore

```bash
# Full backup
backup_file="backup-$(date +%Y%m%d-%H%M%S).sql"
docker compose exec postgres pg_dump -U emailclient emailclient > $backup_file

# Incremental backup (attachments only)
docker compose exec -T emailclient tar czf /tmp/attachments.tar.gz /data/attachments
docker cp emailclient-app:/tmp/attachments.tar.gz ./backups/

# Restore database
docker compose exec -T postgres psql -U emailclient emailclient < backup-20260124.sql

# Restore attachments
docker cp ./backups/attachments.tar.gz emailclient-app:/tmp/
docker compose exec emailclient tar xzf /tmp/attachments.tar.gz
```

## Production Deployment

### Pre-Production Checklist

- [ ] Update all passwords in .env
- [ ] Generate proper SSL/TLS certificates (Let's Encrypt)
- [ ] Configure email relay (POSTFIX_RELAYHOST settings)
- [ ] Set up external database backup
- [ ] Configure log rotation
- [ ] Set up monitoring/alerting
- [ ] Test failover scenarios
- [ ] Document access procedures
- [ ] Set up CI/CD pipeline
- [ ] Configure auto-scaling if needed

### Production Environment

```env
# .env (production)
FLASK_ENV=production
FLASK_DEBUG=0
NODE_ENV=production

# Use strong, random values (generate with: openssl rand -hex 32)
SESSION_SECRET=<32-char-random-string>
ENCRYPTION_KEY=<32-char-random-string>
POSTGRES_PASSWORD=<strong-password>
REDIS_PASSWORD=<strong-password>

# External services
POSTFIX_RELAYHOST=[smtp.company.com]:587
POSTFIX_RELAYHOST_USERNAME=relay@company.com
POSTFIX_RELAYHOST_PASSWORD=<generated-password>

# Domain configuration
POSTFIX_HOSTNAME=mail.company.com
EMAILCLIENT_API_URL=https://mail.company.com
```

### Scaling Considerations

```yaml
# Increase Celery workers for heavy email load
celery-worker:
  deploy:
    replicas: 3  # Run 3 worker instances

# Increase Nginx worker processes
nginx:
  environment:
    NGINX_WORKER_PROCESSES: 8  # Match CPU count

# Adjust resource limits based on load
email-service:
  deploy:
    resources:
      limits:
        cpus: '4'
        memory: 4G
```

## References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL 16 Documentation](https://www.postgresql.org/docs/16/)
- [Redis Documentation](https://redis.io/docs/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Email Client Implementation Plan](../../docs/plans/2026-01-23-email-client-implementation.md)
- [DBAL Schema Reference](../../dbal/shared/api/schema/)

## Support

For issues or questions:
1. Check logs: `docker compose logs -f <service>`
2. Review troubleshooting section above
3. Check email client implementation plan
4. Consult project documentation in `/docs/`
