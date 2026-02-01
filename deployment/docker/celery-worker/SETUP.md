# Celery Worker Setup Guide

Phase 8: Email Service Background Task Processing - Complete Setup Instructions

## Quick Start

### 1. Prerequisite Check

```bash
# Verify Docker and docker-compose are installed
docker --version
docker-compose --version

# Should output versions for both commands
```

### 2. Start Services

```bash
# Navigate to project root
cd /path/to/metabuilder

# Option A: Start all services including Celery stack
docker-compose -f deployment/docker/docker-compose.development.yml \
               -f deployment/docker/celery-worker/docker-compose.yml \
               up -d

# Option B: Use management script (recommended)
cd deployment/docker/celery-worker
./manage.sh up
```

### 3. Verify Services

```bash
# Check all containers are running
docker ps | grep metabuilder

# Should show:
# - metabuilder-postgres-dev
# - metabuilder-redis-dev
# - metabuilder-celery-worker
# - metabuilder-celery-beat
# - metabuilder-celery-flower
```

### 4. Access Monitoring Dashboard

Open browser and navigate to:
- **Flower Dashboard**: http://localhost:5556
- **Redis Commander**: http://localhost:8083
- **Adminer (Database)**: http://localhost:8082

### 5. Test Task Processing

```bash
# Check worker is responsive
docker exec metabuilder-celery-worker \
  celery -A tasks.celery_app inspect ping

# Expected output: OK with worker name

# List active tasks
docker exec metabuilder-celery-worker \
  celery -A tasks.celery_app inspect active

# Should output: {} (no active tasks initially)
```

## Detailed Setup

### Environment Setup

#### 1. Create Environment File

```bash
cd deployment/docker/celery-worker
cp .env.example .env
```

#### 2. Configure Environment

Edit `.env` and set:

```bash
# For development (Docker networking)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379/0

DATABASE_URL=postgresql://metabuilder:dev_password@postgres:5432/metabuilder_dev

# Worker settings
CELERYD_CONCURRENCY=4
TASK_TIMEOUT=300
LOG_LEVEL=info
```

#### 3. For Local Development (without Docker)

If running locally without Docker:

```bash
# Install dependencies
pip install -r services/email_service/requirements.txt

# Create .env in services/email_service/
REDIS_HOST=localhost
REDIS_PORT=6379
DATABASE_URL=postgresql://metabuilder:dev_password@localhost:5432/metabuilder_dev
```

### Docker Setup

#### 1. Build Images

```bash
cd /path/to/metabuilder

# Build Celery worker image
docker build -t metabuilder/celery-worker:latest \
  -f deployment/docker/celery-worker/Dockerfile .

# Verify build
docker images | grep celery-worker
```

#### 2. Network Configuration

The services communicate via Docker network `metabuilder-dev-network`:

- **PostgreSQL**: `postgres:5432`
- **Redis**: `redis:6379`
- **Celery Broker**: `redis://redis:6379/0`
- **Result Backend**: `redis://redis:6379/1`

No additional configuration needed for Docker networking.

#### 3. Volume Configuration

Celery worker uses these volumes:

```yaml
volumes:
  celery_worker_logs:           # Worker and beat logs
    driver: local
    driver_opts:
      type: tmpfs               # In-memory, survives restarts
      device: tmpfs
      o: "size=100m"

  celery_flower_data:           # Flower persistent database
    driver: local
```

### Database Setup

The Celery worker requires PostgreSQL for:
- Email message persistence
- Client configuration
- Folder structure
- Attachment metadata

```bash
# Verify database is running
docker-compose -f deployment/docker/docker-compose.development.yml \
               exec postgres pg_isready

# Expected: accepting connections

# Check email_service tables exist
docker-compose -f deployment/docker/docker-compose.development.yml \
               exec postgres psql -U metabuilder -d metabuilder_dev -c "\dt"
```

### Redis Setup

Redis serves two purposes:

1. **Broker** (DB 0): Task queue
2. **Result Backend** (DB 1): Task results

```bash
# Connect to Redis
docker-compose -f deployment/docker/docker-compose.development.yml \
               exec redis redis-cli

# Check keys
> KEYS *
> DBSIZE

# Monitor queue
> LLEN celery
```

## Configuration Guide

### Concurrency Settings

Adjust based on workload:

```bash
# Low traffic (development)
CELERYD_CONCURRENCY=2

# Medium traffic
CELERYD_CONCURRENCY=4    # 4 processes

# High traffic
CELERYD_CONCURRENCY=8    # 8 processes (requires more memory)
```

Memory per worker: ~128-256 MB

**Formula**: `Workers = (CPU Cores / 2) to (CPU Cores * 2)`

### Timeout Settings

For different task types:

```bash
# Quick tasks (< 1 min)
TASK_TIMEOUT=300          # 5 minutes is safe

# Medium tasks (1-5 min)
TASK_TIMEOUT=600          # 10 minutes

# Long sync operations (5-30 min)
TASK_TIMEOUT=1800         # 30 minutes
CELERY_TASK_SOFT_TIME_LIMIT=1740  # 29 minutes
```

### Memory Management

If worker uses too much memory:

```bash
# Reduce concurrency
CELERYD_CONCURRENCY=2

# Restart workers more frequently
CELERY_WORKER_MAX_TASKS_PER_CHILD=500

# Reduce prefetch
CELERY_WORKER_PREFETCH_MULTIPLIER=1
```

### Logging Configuration

```bash
# Verbose logging (development)
LOG_LEVEL=debug

# Normal logging (production)
LOG_LEVEL=info

# Minimal logging
LOG_LEVEL=warning
```

View logs:

```bash
docker-compose logs -f celery-worker
docker-compose logs -f celery-beat
docker-compose logs -f celery-flower
```

## Operational Tasks

### Starting Services

```bash
# Using docker-compose
docker-compose -f deployment/docker/docker-compose.development.yml \
               -f deployment/docker/celery-worker/docker-compose.yml \
               up -d

# Using management script
cd deployment/docker/celery-worker
./manage.sh up

# With specific log level
LOG_LEVEL=debug ./manage.sh up
```

### Monitoring

#### Flower Dashboard (Recommended)

http://localhost:5556

Features:
- Active/completed/failed tasks
- Worker status and statistics
- Queue monitoring
- Real-time graphs
- Task execution history

#### Command Line Tools

```bash
# Worker status
./manage.sh stats

# Active tasks
./manage.sh tasks active

# Queue status
./manage.sh queue:status

# Worker ping
./manage.sh worker:ping

# All health checks
./manage.sh health
```

#### Logs

```bash
# Follow all logs
./manage.sh dev:logs

# Follow specific service
./manage.sh logs -f worker
./manage.sh logs -f beat
./manage.sh logs -f flower
```

### Task Management

#### List Tasks

```bash
# Active tasks
./manage.sh tasks active

# Reserved (prefetched) tasks
./manage.sh tasks reserved

# All registered tasks
./manage.sh tasks registered

# Failed tasks (in Flower UI)
http://localhost:5556
```

#### Check Task Status

```bash
# Get status of specific task
./manage.sh task:status <task-id>

# Expected output:
# Status: SUCCESS
# Result: {...}
# Ready: True
```

#### Cancel Task

```bash
# Revoke (cancel) a running task
./manage.sh task:revoke <task-id>

# Note: Task is cancelled but worker continues running
```

#### Trigger Task Manually

```bash
# Open Python shell in worker
./manage.sh dev:shell

# In shell:
from tasks.celery_app import sync_emails
task = sync_emails.delay(
    email_client_id='client-123',
    tenant_id='acme',
    user_id='user-456'
)
print(f"Task ID: {task.id}")
```

### Stopping Services

```bash
# Using docker-compose
docker-compose -f deployment/docker/docker-compose.development.yml \
               -f deployment/docker/celery-worker/docker-compose.yml \
               down

# Using management script
./manage.sh down

# Down and remove volumes
docker-compose ... down -v
```

### Restarting Services

```bash
# Full restart
./manage.sh restart

# Restart specific service
docker-compose restart celery-worker
docker-compose restart celery-beat
docker-compose restart celery-flower
```

## Troubleshooting

### Worker Not Starting

**Symptom**: `docker ps` doesn't show celery-worker

**Solutions**:

```bash
# Check logs
docker-compose logs celery-worker

# Verify Redis is running
docker exec metabuilder-redis redis-cli ping

# Verify Database is running
docker-compose exec postgres pg_isready

# Rebuild image
./manage.sh rebuild

# Start again
./manage.sh up
```

### Worker Crashes Immediately

**Symptom**: Worker starts then exits

**Check**:
1. Redis connection: `docker-compose logs celery-worker | grep -i redis`
2. Database connection: `docker-compose logs celery-worker | grep -i database`
3. Missing imports: `docker-compose logs celery-worker | grep -i import`

**Fix**:
```bash
# Check requirements
pip list | grep -i celery

# Rebuild with fresh dependencies
docker-compose build --no-cache celery-worker

# Start
./manage.sh up
```

### Tasks Not Processing

**Symptom**: Tasks appear in queue but don't execute

**Check**:
```bash
# Is worker running?
./manage.sh worker:ping

# What is worker doing?
./manage.sh stats

# Is queue empty?
./manage.sh queue:status

# How many tasks are reserved?
./manage.sh tasks reserved
```

**Fix**:
```bash
# Check logs for errors
docker-compose logs celery-worker

# If stuck, restart worker
docker-compose restart celery-worker

# If many reserved tasks, clear them
docker-compose exec redis redis-cli FLUSHDB
docker-compose restart celery-worker
```

### Memory Usage Too High

**Symptom**: Worker process using > 512MB

**Solutions**:

```bash
# Reduce concurrency
docker-compose set-env CELERYD_CONCURRENCY=2
docker-compose restart celery-worker

# Restart workers more frequently
docker-compose set-env CELERY_WORKER_MAX_TASKS_PER_CHILD=500
docker-compose restart celery-worker

# Monitor memory
watch -n 1 'docker stats metabuilder-celery-worker'
```

### Task Timeouts

**Symptom**: Tasks fail with "SoftTimeLimitExceeded"

**Solutions**:

```bash
# Increase timeout
TASK_TIMEOUT=600 ./manage.sh restart

# Or edit .env:
TASK_TIMEOUT=600
CELERY_TASK_SOFT_TIME_LIMIT=580

# Restart
./manage.sh restart
```

### Redis Connection Issues

**Symptom**: "Cannot connect to Redis"

**Check**:
```bash
# Is Redis running?
docker ps | grep redis

# Can we connect?
docker-compose exec redis redis-cli ping

# Check network
docker network ls | grep metabuilder-dev-network
```

**Fix**:
```bash
# Restart Redis
docker-compose restart redis

# Check Docker network
docker-compose exec celery-worker ping redis

# If network issues, recreate
docker-compose down
docker-compose up -d
```

### Database Connection Issues

**Symptom**: "Cannot connect to PostgreSQL"

**Check**:
```bash
# Is database running?
docker ps | grep postgres

# Can we connect?
docker-compose exec postgres pg_isready

# Check credentials
echo $DATABASE_URL
```

**Fix**:
```bash
# Verify credentials in docker-compose.yml
# Check POSTGRES_PASSWORD matches DATABASE_URL password

# Restart database
docker-compose restart postgres
```

## Performance Tuning

### Queue Optimization

For high-throughput scenarios:

```bash
# Increase prefetch (allows queuing multiple tasks)
CELERY_WORKER_PREFETCH_MULTIPLIER=4

# Increase concurrency
CELERYD_CONCURRENCY=8

# Increase batch size
SYNC_BATCH_SIZE=500
```

### Database Connection Pooling

For PostgreSQL:

```python
# In tasks code
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)
```

### Redis Optimization

For production Redis:

```bash
# Enable persistence
redis-server --appendonly yes

# Monitor memory
redis-cli info memory

# Eviction policy
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### Monitoring with Prometheus

Optional: Add Prometheus metrics

```bash
# Install prometheus-client
pip install prometheus-client

# Export metrics
http://localhost:8000/metrics
```

## Production Deployment

### Pre-Production Checklist

- [ ] Set `DEBUG=false`
- [ ] Use separate Redis instances (broker, result backend)
- [ ] Enable Redis SSL/TLS
- [ ] Configure log aggregation (ELK, DataDog, etc.)
- [ ] Set up alerting for failed tasks
- [ ] Test with production database
- [ ] Load test with expected task volume
- [ ] Document task SLA (Service Level Agreement)
- [ ] Configure graceful shutdown (stop_grace_period)
- [ ] Set up dead-letter queue for unprocessable tasks
- [ ] Monitor memory and CPU usage
- [ ] Configure restart policies

### Environment Variables for Production

```bash
# Production database
DATABASE_URL=postgresql://user:pass@prod-db-host:5432/metabuilder

# Managed Redis (AWS ElastiCache, GCP Memorystore, etc.)
REDIS_URL=redis://prod-redis-host:6379/0
REDIS_USE_SSL=true
REDIS_SSL_CERT_REQS=CERT_REQUIRED

# Worker settings
CELERYD_CONCURRENCY=4
TASK_TIMEOUT=300
LOG_LEVEL=info

# Security
CREDENTIAL_ENCRYPTION_KEY=<generated-key>
SSL_VERIFY=true
```

### Docker Production Build

```bash
# Build with production tag
docker build -t metabuilder/celery-worker:v1.0.0 \
  -f deployment/docker/celery-worker/Dockerfile .

# Push to registry
docker push metabuilder/celery-worker:v1.0.0

# Deploy with Kubernetes/ECS/etc.
```

### Kubernetes Deployment

Example manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: celery-worker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: celery-worker
  template:
    metadata:
      labels:
        app: celery-worker
    spec:
      containers:
      - name: celery-worker
        image: metabuilder/celery-worker:v1.0.0
        env:
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: celery-config
              key: redis-url
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: celery-config
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "500m"
          limits:
            memory: "512Mi"
            cpu: "1000m"
        livenessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - celery -A tasks.celery_app inspect ping
          initialDelaySeconds: 30
          periodSeconds: 30
```

## Support & Resources

- **Celery Documentation**: https://docs.celeryproject.org/
- **Flower Dashboard**: https://flower.readthedocs.io/
- **Email Client Plan**: See `docs/plans/2026-01-23-email-client-implementation.md`
- **Logs**: Check `/app/logs/` in worker container
- **Issues**: Check docker-compose logs for error messages

## Next Steps

1. **Start Services**: `./manage.sh up`
2. **Access Dashboard**: http://localhost:5556
3. **Monitor Tasks**: `./manage.sh tasks active`
4. **Review Logs**: `./manage.sh logs -f worker`
5. **Read Email Service**: `services/email_service/README.md`
6. **Review Tasks Code**: `services/email_service/tasks/celery_app.py`
