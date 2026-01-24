# Phase 8: Redis Container

Redis cache and Celery broker for the Email Client implementation.

## Overview

This Redis container serves two critical roles in the email client architecture:

1. **Cache Layer**: High-speed in-memory data store for frequently accessed data (email metadata, user sessions, etc.)
2. **Celery Broker**: Message queue for background job processing (IMAP sync, email sending, etc.)
3. **Result Backend**: Storage for task results and status tracking

## Configuration

### Memory Management

- **Max Memory**: 512MB (configurable via `REDIS_MAXMEMORY`)
- **Eviction Policy**: `allkeys-lru` (removes least recently used keys when memory limit is reached)
- **Memory Sampling**: 5 samples for eviction decision

### Persistence

The container enables both RDB (Redis Database) snapshots and AOF (Append-Only File) for data durability:

#### RDB Snapshots
- Snapshot every 15 minutes if 1+ key changed
- Snapshot every 5 minutes if 10+ keys changed
- Snapshot every 1 minute if 10,000+ keys changed
- Compression enabled (LZF)
- Checksum validation enabled

#### AOF (Append-Only File)
- Journal every write operation to disk
- Fsync every second (balanced between safety and performance)
- Auto-rewrite when file grows to 64MB

### Authentication

- **Default Password**: `redis_development_password` (development only)
- **Production**: Change `REDIS_PASSWORD` environment variable to a strong random value

### Health Check

- **Endpoint**: Port 6379
- **Check Command**: `redis-cli --raw incr ping`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Start Period**: 5 seconds
- **Retries**: 3 failures before container marked unhealthy

## Building the Container

```bash
# Build the Redis image
docker build -t emailclient-redis:latest deployment/docker/redis/

# Or build via docker-compose
docker-compose build redis
```

## Running the Container

```bash
# Start Redis via docker-compose
docker-compose up -d redis

# Or run standalone
docker run -d \
  --name emailclient-redis \
  -p 6379:6379 \
  -v redis-data:/data \
  -e REDIS_PASSWORD="your_strong_password" \
  -e REDIS_MAXMEMORY="512mb" \
  emailclient-redis:latest
```

## Environment Variables

### Redis Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_PASSWORD` | `redis_development_password` | Authentication password |
| `REDIS_MAXMEMORY` | `512mb` | Maximum memory Redis can use |
| `REDIS_MAXMEMORY_POLICY` | `allkeys-lru` | Key eviction policy |

### Celery Configuration

| Variable | Default | Description |
| `CELERY_BROKER_URL` | `redis://:password@redis:6379/0` | Celery message broker |
| `CELERY_RESULT_BACKEND` | `redis://:password@redis:6379/0` | Task result storage |
| `CELERY_TASK_SERIALIZER` | `json` | Task serialization format |
| `CELERY_TASK_TIME_LIMIT` | `3600` | Hard timeout (seconds) |
| `CELERY_TASK_SOFT_TIME_LIMIT` | `3000` | Soft timeout (seconds) |

## Celery Integration

The Redis container is configured to work with Celery for background job processing:

### Broker Configuration
```python
# In services/email_service/celery_app.py
broker_url = os.getenv('CELERY_BROKER_URL', 'redis://:password@redis:6379/0')
result_backend = os.getenv('CELERY_RESULT_BACKEND', 'redis://:password@redis:6379/0')
```

### Supported Tasks

- **IMAP Sync**: Fetch emails from IMAP servers
- **Email Sending**: Send emails via SMTP
- **Message Parsing**: Parse and sanitize email content
- **Search**: Full-text email search indexing
- **Cleanup**: Remove old messages and attachments

### Task Monitoring

```bash
# Connect to Redis and monitor
redis-cli -p 6379 -a your_password

# Check Celery queues
> KEYS "celery:*"

# Monitor task messages
> SUBSCRIBE celery-task-meta-*

# Check task status
> GET celery-task-meta-{task_id}
```

## Persistence

### Data Storage

Data is persisted to the `redis-data` volume:

```bash
# Backup RDB snapshot
docker exec emailclient-redis redis-cli BGSAVE

# Backup AOF
docker exec emailclient-redis redis-cli BGREWRITEAOF

# View persistence files
docker volume inspect redis-data
```

### Disaster Recovery

If Redis data is corrupted:

```bash
# Remove corrupted data
docker volume rm redis-data

# Restart Redis (will start fresh)
docker-compose up -d redis

# Re-sync emails from IMAP
# Celery tasks will be re-queued
```

## Monitoring

### Health Check

```bash
# Check Redis health
docker exec emailclient-redis redis-cli ping

# Get server info
docker exec emailclient-redis redis-cli info server

# Get memory stats
docker exec emailclient-redis redis-cli info memory

# Get Celery stats
docker exec emailclient-redis redis-cli info stats
```

### Performance Metrics

```bash
# List all keys
docker exec emailclient-redis redis-cli DBSIZE

# Get eviction stats
docker exec emailclient-redis redis-cli info stats | grep evicted

# Monitor slow commands
docker exec emailclient-redis redis-cli SLOWLOG GET 10
```

### Log Monitoring

```bash
# View Redis logs
docker logs emailclient-redis

# Follow logs in real-time
docker logs -f emailclient-redis

# Filter for warnings/errors
docker logs emailclient-redis 2>&1 | grep -E "WARNING|ERROR"
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs emailclient-redis

# Verify configuration file syntax
docker run --rm -it \
  -v $(pwd)/deployment/docker/redis/redis.conf:/usr/local/etc/redis/redis.conf:ro \
  redis:7-alpine redis-cli -h localhost CONFIG GET "*"
```

### Memory Issues

```bash
# Check memory usage
docker exec emailclient-redis redis-cli INFO memory

# Force eviction cleanup
docker exec emailclient-redis redis-cli MEMORY PURGE

# Check keys by type
docker exec emailclient-redis redis-cli --scan --pattern "*" | wc -l
```

### Connection Issues

```bash
# Test connectivity from another container
docker exec emailclient-email-service redis-cli -h redis -p 6379 ping

# Check network connectivity
docker network inspect emailclient-net

# Verify DNS resolution
docker exec emailclient-email-service nslookup redis
```

### Slow Performance

```bash
# Check slow log
docker exec emailclient-redis redis-cli SLOWLOG GET 10

# Profile memory usage by type
docker exec emailclient-redis redis-cli --scan --pattern "*" | \
  while read key; do echo "$key"; done | head -20

# Clear old data (use with caution)
docker exec emailclient-redis redis-cli FLUSHDB
```

## Security Considerations

### Development vs. Production

**Development** (current):
- Default password used
- All interfaces listening (0.0.0.0)
- Debug logging enabled

**Production** (recommended):
```bash
# Set strong password
export REDIS_PASSWORD=$(openssl rand -base64 32)

# Restrict network access
# In docker-compose: change bind to 127.0.0.1 or specific network
# In redis.conf: bind redis

# Disable RDB snapshots (if using AOF only)
# In redis.conf: save ""

# Enable ACL configuration
# In redis.conf: aclfile /usr/local/etc/redis/acl.conf
```

### Backup Strategy

```bash
# Daily backup of RDB
docker exec emailclient-redis redis-cli --rdb /tmp/dump.rdb

# Backup to S3
aws s3 cp /tmp/dump.rdb s3://backup-bucket/redis/$(date +%Y%m%d).rdb

# Automated backup script (cron)
# See: deployment/docker/redis/backup.sh (if created)
```

## Resource Limits

Recommended Docker resource allocation:

```yaml
# docker-compose.yml
redis:
  cpus: '0.5'
  mem_limit: 1g
  memswap_limit: 1g
```

## Version Information

- **Base Image**: `redis:7-alpine`
- **Redis Version**: 7.x (Latest stable)
- **Alpine Linux**: 3.19 or later
- **Dockerfile**: Production-ready with health checks

## Additional Resources

- [Redis Official Docs](https://redis.io/documentation)
- [Celery Task Queue](https://docs.celeryproject.io/)
- [Redis Persistence](https://redis.io/topics/persistence)
- [Redis Admin Commands](https://redis.io/commands/admin)

## Related Containers

- **email-service**: Flask backend that uses Redis as broker
- **postgres**: PostgreSQL for email metadata
- **postfix**: SMTP relay for sending emails
- **dovecot**: IMAP/POP3 server for receiving emails
