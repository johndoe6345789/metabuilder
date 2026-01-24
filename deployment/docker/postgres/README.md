# Email Service PostgreSQL Container

PostgreSQL 16 Docker container configured for MetaBuilder email client with IMAP/SMTP support. Provides multi-tenant database with row-level security, comprehensive indexing, and production-ready configuration.

## Features

### Database Design
- **4 Core Tables**: email_accounts, email_folders, email_messages, email_attachments
- **Multi-Tenant**: Tenant isolation via Row Level Security (RLS) policies
- **RFC 5322 Compliant**: Full email header support with threading
- **Soft Deletes**: Audit trail via is_deleted flags and deleted_at timestamps
- **IMAP Sync**: Message-ID and IMAP UID tracking for incremental sync

### Security
- **Row Level Security**: All tables use RLS for tenant isolation
- **pgcrypto Extension**: UUID generation and password hashing
- **Application User**: Separate email_service user with limited privileges
- **Encryption Support**: TLS/STARTTLS configuration for remote connections

### Performance
- **30+ Indexes**: Optimized for common queries (sync, search, threading)
- **Connection Pooling**: Supports 200 concurrent connections
- **Full-Text Search**: GIN index for subject and body search
- **Query Optimization**: Partial indexes for active/unread messages

### High Availability
- **Health Checks**: Automatic liveness probe on port 5432
- **Data Persistence**: Docker volumes for recovery across container restarts
- **Incremental Backups**: WAL configuration for point-in-time recovery
- **Replication Ready**: Configuration for primary/standby setup

## Quick Start

### Development

```bash
# Start PostgreSQL container
docker-compose -f deployment/docker/docker-compose.email-service.yml up email-postgres

# Connect with psql
psql postgresql://email_service:postgres@localhost:5434/email_service

# View database structure
\dt email_*
\di idx_email_*

# Check connection pool status
SELECT * FROM pg_stat_activity;
```

### Docker Compose

```yaml
version: '3.8'

services:
  email-postgres:
    build:
      context: deployment/docker/postgres
      dockerfile: Dockerfile
    container_name: email-postgres
    environment:
      POSTGRES_DB: email_service
      POSTGRES_USER: email_service
      POSTGRES_PASSWORD: secure_password
    volumes:
      - email_postgres_data:/var/lib/postgresql/data
    ports:
      - "5434:5432"
    networks:
      - email-service-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U email_service -d email_service"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  email_postgres_data:
    driver: local

networks:
  email-service-network:
    driver: bridge
```

## Database Schema

### email_accounts
Email account configuration (IMAP/POP3/SMTP).

```sql
CREATE TABLE email_accounts (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  account_name VARCHAR(255),
  email_address VARCHAR(255) UNIQUE,
  protocol VARCHAR(20) -- 'imap', 'pop3'
  hostname VARCHAR(255),
  port INTEGER,
  encryption VARCHAR(20) -- 'none', 'tls', 'starttls'
  username VARCHAR(255),
  credential_id UUID,
  is_sync_enabled BOOLEAN DEFAULT TRUE,
  sync_interval INTEGER DEFAULT 300,
  last_sync_at BIGINT,
  is_syncing BOOLEAN DEFAULT FALSE,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at BIGINT,
  updated_at BIGINT
);

Indexes:
- idx_email_accounts_tenant_user (tenant_id, user_id)
- idx_email_accounts_email_address (email_address)
- idx_email_accounts_sync_enabled (tenant_id, is_sync_enabled, last_sync_at)
```

### email_folders
Email folder hierarchy (Inbox, Sent, Drafts, custom).

```sql
CREATE TABLE email_folders (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES email_accounts,
  name VARCHAR(255),
  type VARCHAR(20) -- 'inbox', 'sent', 'drafts', 'trash', 'spam', 'archive', 'custom'
  unread_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  sync_token TEXT,
  is_selectable BOOLEAN DEFAULT TRUE,
  created_at BIGINT,
  updated_at BIGINT
);

Indexes:
- idx_email_folders_account_type (account_id, type)
- idx_email_folders_tenant_account (tenant_id, account_id)
- idx_email_folders_type (type) WHERE type IN ('inbox', 'sent', ...)
```

### email_messages
Email messages with RFC 5322 headers and threading support.

```sql
CREATE TABLE email_messages (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES email_accounts,
  folder_id UUID NOT NULL REFERENCES email_folders,
  message_id VARCHAR(500) NOT NULL,
  imap_uid VARCHAR(100),
  in_reply_to VARCHAR(500),
  from VARCHAR(500),
  to JSONB,              -- ['user@example.com', ...]
  cc JSONB,
  bcc JSONB,
  reply_to VARCHAR(255),
  subject VARCHAR(500),
  text_body TEXT,
  html_body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  is_draft BOOLEAN DEFAULT FALSE,
  thread_id UUID,
  sent_at BIGINT,
  received_at BIGINT,
  created_at BIGINT,
  updated_at BIGINT
);

Indexes:
- idx_email_messages_folder_received (folder_id, received_at DESC)
- idx_email_messages_thread_id (thread_id)
- idx_email_messages_account_read (account_id, is_read)
- idx_email_messages_message_id (message_id, account_id) UNIQUE
- idx_email_messages_imap_uid (imap_uid, folder_id) UNIQUE
- idx_email_messages_text_search (full-text search on subject + body)
```

### email_attachments
File attachments with S3/blob storage references.

```sql
CREATE TABLE email_attachments (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  message_id UUID NOT NULL REFERENCES email_messages,
  filename VARCHAR(500),
  mime_type VARCHAR(100),
  size_bytes INTEGER,
  storage_path VARCHAR(1000),
  storage_type VARCHAR(20) -- 'blob', 's3', 'local'
  blob_id UUID,
  content_hash VARCHAR(64),
  created_at BIGINT
);

Indexes:
- idx_email_attachments_message_id (message_id)
- idx_email_attachments_tenant (tenant_id)
- idx_email_attachments_storage_path (storage_path)
- idx_email_attachments_content_hash (content_hash)
```

## Configuration

### Connection Pooling (Port 5432)

```
max_connections = 200

For external pooling with PgBouncer:
  max_client_conn = 1000     (clients)
  max_db_connections = 25    (per database)
  default_pool_size = 25     (per user)
  reserve_pool_size = 5      (reserve)
```

### Memory Settings

```
shared_buffers = 256MB          # PostgreSQL page cache
effective_cache_size = 1GB      # Query planner hint
work_mem = 1310kB               # Per-operation sorting/hashing
maintenance_work_mem = 64MB     # CREATE INDEX, VACUUM, ALTER
```

### WAL (Write-Ahead Logging)

```
wal_buffers = 16MB                       # WAL page cache
min_wal_size = 1GB                       # Minimum WAL files
max_wal_size = 4GB                       # Maximum WAL files before checkpoint
checkpoint_completion_target = 0.9       # Spread I/O over time
```

### Query Planning

```
random_page_cost = 1.1                   # SSD-optimized
effective_io_concurrency = 200           # NVMe-optimized
default_statistics_target = 100          # Column statistics
```

## Initialization Scripts

Executed automatically on container startup in order:

### 1. init-email-service.sql
- Creates email_service database
- Creates 4 core tables with constraints
- Enables extensions (uuid-ossp, pgcrypto, pg_trgm)
- Sets up RLS policies for multi-tenancy
- Creates audit table (email_audit_log)

### 2. init-indexes.sql
- Creates 30+ indexes for query optimization
- Partial indexes for active/unread messages
- BRIN indexes for timestamp columns
- Analyzes statistics for query planner

### 3. init-connection-pooling.sql
- Configures connection pooling parameters
- Creates monitoring views (pg_connection_stats, pg_long_queries)
- Provides helper functions (pg_table_bloat_status)
- Documents configuration guidelines

## Multi-Tenant Isolation

Row Level Security (RLS) policies ensure data isolation:

```sql
-- RLS Policy: email_messages - tenant isolation
CREATE POLICY email_messages_tenant_policy ON email_messages
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

Application must set tenant context before queries:

```typescript
// Set tenant for this connection
await db.raw(`SET LOCAL app.current_tenant_id = '${tenantId}'`)

// All subsequent queries automatically filtered by tenant_id
const messages = await db.email_messages.select() // Only this tenant's messages
```

## Monitoring

### Connection Usage

```sql
-- Current connections by user/database
SELECT * FROM pg_connection_stats;

-- Long-running queries
SELECT * FROM pg_long_queries;
```

### Table Statistics

```sql
-- Table bloat
SELECT * FROM pg_table_bloat_status();

-- Index usage
SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan DESC;

-- Unused indexes
SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;
```

### Query Performance

```sql
-- Cache hit ratio (should be > 95%)
SELECT
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;

-- Slow queries (> 1 second)
SELECT query, calls, mean_exec_time FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;
```

## Troubleshooting

### PostgreSQL won't start

```bash
# Check logs
docker logs metabuilder-email-postgres

# Verify data directory permissions
docker exec metabuilder-email-postgres ls -la /var/lib/postgresql

# Reset volume
docker volume rm email_postgres_data
docker-compose up email-postgres
```

### Health check failing

```bash
# Check if PostgreSQL is responsive
docker exec metabuilder-email-postgres pg_isready -U email_service

# View last 50 lines of logs
docker logs --tail 50 metabuilder-email-postgres

# Connect directly
docker exec -it metabuilder-email-postgres psql -U email_service -d email_service
```

### Connection pool exhausted

```sql
-- Check active connections
SELECT datname, usename, COUNT(*) FROM pg_stat_activity GROUP BY datname, usename;

-- Kill idle connections (over 30 minutes)
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE state = 'idle' AND query_start < NOW() - INTERVAL '30 minutes';

-- Increase max_connections (requires restart)
ALTER SYSTEM SET max_connections = 300;
SELECT pg_reload_conf();
```

### Slow queries

```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- 1 second
SELECT pg_reload_conf();

-- View slow query log
SELECT query_start, query, query_time FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Performance Tuning

### For production (8GB+ RAM)

```sql
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET work_mem = '10MB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';
SELECT pg_reload_conf();
```

### For high-throughput email (1000+ messages/sec)

```sql
ALTER SYSTEM SET wal_level = 'minimal';  # Disable replication logging
ALTER SYSTEM SET synchronous_commit = 'off';  # Async WAL writes
ALTER SYSTEM SET max_wal_size = '16GB';
SELECT pg_reload_conf();
```

### For read-heavy workloads

```sql
ALTER SYSTEM SET random_page_cost = 1.01;  # Favor index scans
ALTER SYSTEM SET effective_io_concurrency = 500;
ALTER SYSTEM SET effective_cache_size = '8GB';
SELECT pg_reload_conf();
```

## Backup & Recovery

### Manual backup

```bash
# Backup entire database
docker exec metabuilder-email-postgres pg_dump -U email_service email_service > backup.sql

# Backup with compression
docker exec metabuilder-email-postgres pg_dump -U email_service -Fc email_service > backup.dump

# Restore from backup
docker exec -i metabuilder-email-postgres psql -U email_service email_service < backup.sql
```

### Point-in-time recovery

```sql
-- Enable WAL archiving
ALTER SYSTEM SET archive_mode = 'on';
ALTER SYSTEM SET archive_command = 'cp %p /mnt/archive/%f';
SELECT pg_reload_conf();

-- Recover to specific timestamp
SELECT pg_create_restore_point('pre_migration');

-- Restore using backup + WAL files
```

## Docker Compose Integration

### Development Environment

```bash
# Start all services (PostgreSQL + email service + Redis)
docker-compose -f deployment/docker/docker-compose.email-service.yml up

# View logs
docker-compose -f deployment/docker/docker-compose.email-service.yml logs -f email-postgres

# Stop services
docker-compose -f deployment/docker/docker-compose.email-service.yml down
```

### Production Environment

```bash
# Start with production overrides
docker-compose \
  -f deployment/docker/docker-compose.email-service.yml \
  -f deployment/docker/docker-compose.email-service.prod.yml \
  up -d

# View status
docker-compose -f deployment/docker/docker-compose.email-service.yml ps
```

## Environment Variables

Create `.env` file in `deployment/docker/`:

```bash
# Database
POSTGRES_PASSWORD=secure_password_here
POSTGRES_PORT=5434

# Email service (future)
FLASK_ENV=production
LOG_LEVEL=INFO
IMAP_POLL_INTERVAL=300
SMTP_TIMEOUT=30
```

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/16/)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/runtime-config.html)
- [Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Email Schemas](../../docs/plans/2026-01-23-email-client-implementation.md)
