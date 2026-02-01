# PostgreSQL Email Service - Quick Start Guide

Get started with the email service PostgreSQL container in 5 minutes.

## Prerequisites

- Docker and Docker Compose installed
- 2GB RAM available
- 5GB disk space for database

## Start the Container

### Option 1: Using docker-compose (Recommended)

```bash
cd deployment/docker

# Create .env file with password
echo "POSTGRES_PASSWORD=my_secure_password" > .env

# Start PostgreSQL
docker-compose -f docker-compose.email-service.yml up email-postgres

# Wait for health check (look for: "healthy" status)
docker-compose -f docker-compose.email-service.yml ps
```

### Option 2: Using Docker directly

```bash
# Build image
docker build -t email-postgres:16 postgres/

# Run container
docker run -d \
  --name email-postgres \
  -e POSTGRES_DB=email_service \
  -e POSTGRES_USER=email_service \
  -e POSTGRES_PASSWORD=my_secure_password \
  -p 5434:5432 \
  -v email_postgres_data:/var/lib/postgresql/data \
  email-postgres:16

# Check health
docker logs email-postgres
```

## Connect to Database

### Using psql

```bash
# Connect via Docker
docker exec -it email-postgres psql -U email_service -d email_service

# Connect from host (if psql installed locally)
psql postgresql://email_service:my_secure_password@localhost:5434/email_service
```

### Using Adminer (Web UI)

```bash
# Start Adminer alongside PostgreSQL
docker-compose -f docker-compose.email-service.yml up -d

# Open in browser
http://localhost:8085

# Login:
# System: PostgreSQL
# Server: email-postgres
# Username: email_service
# Password: my_secure_password
# Database: email_service
```

## Verify Database

```sql
-- List tables
\dt email_*

-- Show table structure
\d email_accounts

-- Check indexes
\di idx_email_*

-- Count records
SELECT COUNT(*) FROM email_accounts;
```

## Insert Test Data

```sql
-- Insert test account
INSERT INTO email_accounts (
  tenant_id,
  user_id,
  account_name,
  email_address,
  protocol,
  hostname,
  port,
  encryption,
  username,
  credential_id
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '650e8400-e29b-41d4-a716-446655440000',
  'Personal Email',
  'user@gmail.com',
  'imap',
  'imap.gmail.com',
  993,
  'tls',
  'user@gmail.com',
  '750e8400-e29b-41d4-a716-446655440000'
);

-- Verify
SELECT * FROM email_accounts;
```

## Monitor Database

```bash
# View logs
docker logs email-postgres

# Check connection count
docker exec email-postgres psql -U email_service -d email_service \
  -c "SELECT datname, COUNT(*) FROM pg_stat_activity GROUP BY datname;"

# Check table sizes
docker exec email-postgres psql -U email_service -d email_service \
  -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables WHERE schemaname = 'public';"

# Check index status
docker exec email-postgres psql -U email_service -d email_service \
  -c "SELECT schemaname, indexname, idx_scan FROM pg_stat_user_indexes;"
```

## Stop and Clean Up

```bash
# Stop container (preserves data)
docker-compose -f docker-compose.email-service.yml down

# Stop and remove volume (deletes data)
docker-compose -f docker-compose.email-service.yml down -v

# Manual cleanup
docker stop email-postgres
docker rm email-postgres
docker volume rm email_postgres_data
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 5434
lsof -i :5434

# Use different port
docker run -p 5435:5432 ...
```

### Permission Denied

```bash
# Create data directory
mkdir -p data/email-postgres
chmod 755 data/email-postgres

# Run with proper permissions
docker run -v $(pwd)/data/email-postgres:/var/lib/postgresql/data ...
```

### Container Exits Immediately

```bash
# Check logs
docker logs email-postgres

# Common issues:
# 1. POSTGRES_PASSWORD not set
# 2. Port already in use
# 3. Data directory not writable
```

### Health Check Failing

```bash
# Wait longer (initialization takes 30-60 seconds)
sleep 60
docker-compose ps

# Check PostgreSQL is responsive
docker exec email-postgres pg_isready -U email_service

# View detailed logs
docker logs --tail 100 email-postgres
```

## Common Commands

```bash
# Backup database
docker exec email-postgres pg_dump -U email_service email_service > backup.sql

# Restore from backup
docker exec -i email-postgres psql -U email_service email_service < backup.sql

# Run SQL file
docker exec -i email-postgres psql -U email_service email_service < script.sql

# Access PostgreSQL shell
docker exec -it email-postgres psql -U email_service -d email_service
```

## Production Deployment

For production, use the production overrides:

```bash
docker-compose \
  -f docker-compose.email-service.yml \
  -f docker-compose.email-service.prod.yml \
  up -d

# Features:
# - 4GB shared_buffers (vs 256MB dev)
# - Replication support
# - SSL/TLS encryption
# - Advanced monitoring
# - Higher connection limits
```

See `docker-compose.email-service.prod.yml` for details.

## Next Steps

1. **Configure Email Service Backend**
   - Implement Python Flask API (services/email_service/)
   - Add IMAP/SMTP protocol handlers
   - Set up Celery background jobs

2. **Create Application Routes**
   - API endpoints in Next.js app
   - Connect to Redux state management
   - Implement custom hooks

3. **Test Integration**
   - Add test data via API
   - Verify multi-tenant isolation
   - Test sync workflows

## Documentation

- **Full Setup**: See `README.md` in this directory
- **Schema Details**: See the README for table definitions
- **Monitoring**: See `init-connection-pooling.sql` for monitoring queries
- **Performance Tuning**: See `docker-compose.email-service.prod.yml` comments

## Support

For issues:
1. Check `docker logs email-postgres`
2. Review `README.md` troubleshooting section
3. Verify environment variables in `.env`
4. Check disk space: `docker system df`
