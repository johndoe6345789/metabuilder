# Celery Worker - Email Service Background Tasks

Phase 8 implementation of the Email Client: Async task queue worker container for handling background email operations.

## Overview

The Celery worker container processes asynchronous email operations:

- **Email Synchronization**: IMAP/POP3 incremental and full sync
- **Email Sending**: SMTP message delivery
- **Batch Deletions**: Multi-message deletion operations
- **Spam Detection**: Email analysis and classification
- **Periodic Tasks**: Scheduled sync and maintenance

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Celery Architecture                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐     ┌──────────────────┐             │
│  │  Email Service   │────→│  Redis Broker    │             │
│  │  (Flask API)     │     │  (Queue Storage) │             │
│  └──────────────────┘     └──────────────────┘             │
│                                  │                           │
│                           ┌──────┴──────┐                   │
│                           ↓             ↓                   │
│                     ┌──────────────┬──────────────┐         │
│                     │   Worker 1   │   Worker 2   │ ...    │
│                     │ (Prefork Pool)              │         │
│                     └──────────────┬──────────────┘         │
│                                    │                        │
│                              ┌─────┴──────┐                │
│                              ↓            ↓                │
│                        ┌──────────┬──────────────┐          │
│                        │  Results │  PostgreSQL  │          │
│                        │ (Redis)  │  (Persistence)         │
│                        └──────────┴──────────────┘          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Tenant Safety

All tasks validate `tenant_id` and `user_id` parameters:

```python
@celery_app.task
def sync_emails(email_client_id, tenant_id, user_id, **kwargs):
    # Task validates:
    # 1. email_client_id belongs to tenant_id
    # 2. email_client_id.userId == user_id
    # Cannot operate across tenant boundaries
```

### Queue Types

| Queue | Priority | Purpose | Max Retries |
|-------|----------|---------|-------------|
| **sync** | 10 (High) | IMAP/POP3 synchronization | 5 |
| **send** | 8 | SMTP email delivery | 3 |
| **delete** | 5 | Batch message deletion | 2 |
| **spam** | 3 (Low) | Spam analysis | 2 |
| **periodic** | 10 (High) | Scheduled tasks | 1 |

### Task Timeouts

- **Hard limit**: 300 seconds (5 minutes) - Task is killed
- **Soft limit**: 280 seconds (4m 40s) - Task receives SIGTERM for graceful shutdown
- **Result TTL**: 3600 seconds (1 hour) - Results expire and are cleaned up

## Deployment

### Docker Build

```bash
# Build Celery worker image
docker build -t metabuilder/celery-worker:latest \
  -f deployment/docker/celery-worker/Dockerfile .
```

### Docker Compose (Recommended)

#### Option 1: Merge with Main Compose

```bash
# Run development stack including Celery worker, beat, and Flower
docker-compose -f deployment/docker/docker-compose.development.yml \
               -f deployment/docker/celery-worker/docker-compose.yml \
               up -d
```

#### Option 2: Use Standalone

```bash
cd deployment/docker/celery-worker
docker-compose up -d
```

### Configuration

#### Environment Variables

Set in `.env` or docker-compose:

```bash
# Redis
REDIS_URL=redis://redis:6379/0
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_BROKER_DB=0
REDIS_RESULT_DB=1

# Database
DATABASE_URL=postgresql://metabuilder:password@postgres:5432/metabuilder_dev

# Worker Concurrency
CELERYD_CONCURRENCY=4                    # Number of worker processes
TASK_TIMEOUT=300                         # Hard limit in seconds
CELERY_TASK_SOFT_TIME_LIMIT=280         # Soft limit in seconds

# Logging
LOG_LEVEL=info                          # info, debug, warning, error
```

#### Resource Limits

```yaml
# docker-compose.yml deployment section
deploy:
  resources:
    limits:
      cpus: "2"
      memory: 512M
    reservations:
      cpus: "1"
      memory: 256M
```

Adjust based on:
- Number of concurrent workers (`CELERYD_CONCURRENCY`)
- Average task duration
- Expected task throughput

## Services

### celery-worker

Main worker process that executes tasks from queues.

**Image**: `python:3.11-slim` (multi-stage build)
**Container**: `metabuilder-celery-worker`
**Ports**: 5555 (Flower monitoring)
**Logs**: `/app/logs/celery-worker.log`

**Health Check**:
```bash
celery -A tasks.celery_app inspect ping
```

**Restart Policy**: `unless-stopped` (auto-restart on failure)

### celery-beat

Scheduler that triggers periodic tasks:
- `sync-emails-every-5min`: Runs `periodic_sync` every 5 minutes
- `cleanup-stale-tasks-hourly`: Cleans up Redis results every hour

**Image**: Same as worker (custom Dockerfile)
**Container**: `metabuilder-celery-beat`
**Logs**: `/app/logs/celery-beat.log`
**Schedule DB**: `/app/logs/celery-beat-schedule.db`

### celery-flower

Web-based monitoring dashboard for Celery tasks.

**Image**: `mher/flower:2.0.1` (official Flower image)
**Container**: `metabuilder-celery-flower`
**Port**: `5556:5555`
**URL**: `http://localhost:5556`
**Database**: `/data/flower.db` (persistent)

## Monitoring

### Flower Dashboard

Access Celery monitoring at `http://localhost:5556`:

- **Tasks**: View active, completed, failed tasks
- **Workers**: Monitor worker status and statistics
- **Queues**: Check queue depths and throughput
- **Graphs**: Real-time task metrics
- **Logs**: Aggregated worker logs

### Health Checks

All services include health checks:

```bash
# Worker health
docker-compose exec celery-worker celery -A tasks.celery_app inspect ping

# Active tasks
docker-compose exec celery-worker celery -A tasks.celery_app inspect active

# Worker stats
docker-compose exec celery-worker celery -A tasks.celery_app inspect stats

# Queue status
docker-compose exec celery-worker celery -A tasks.celery_app inspect reserved
```

### Logs

```bash
# Follow worker logs
docker-compose logs -f celery-worker

# Follow beat logs
docker-compose logs -f celery-beat

# Follow Flower logs
docker-compose logs -f celery-flower

# View all container logs
docker-compose logs -f
```

## Task Management

### Trigger Tasks Manually

```python
from tasks.celery_app import sync_emails, send_email, delete_emails

# Sync emails (async, returns task ID)
task = sync_emails.delay(
    email_client_id='client-123',
    tenant_id='acme',
    user_id='user-456',
    force_full_sync=False
)
print(f"Task ID: {task.id}")

# Check task status
from celery.result import AsyncResult
result = AsyncResult(task.id)
print(result.status)  # PENDING, STARTED, SUCCESS, FAILURE, RETRY

# Send email
send_email.delay(
    email_client_id='client-123',
    tenant_id='acme',
    user_id='user-456',
    to=['recipient@example.com'],
    subject='Test Email',
    body_text='Hello, World!'
)

# Delete emails
delete_emails.delay(
    email_ids=['msg-1', 'msg-2', 'msg-3'],
    tenant_id='acme',
    user_id='user-456',
    permanent=False  # Soft delete to trash
)
```

### Revoke/Cancel Tasks

```python
from tasks.celery_app import celery_app

# Cancel running task
celery_app.control.revoke('task-id', terminate=True)

# Cancel all tasks
celery_app.control.purge()
```

### Check Queue Depth

```python
from tasks.celery_app import get_queue_stats

stats = get_queue_stats()
print(f"Active tasks: {stats['active_tasks']}")
print(f"Registered tasks: {stats['registered_tasks']}")
```

## Troubleshooting

### Worker Not Starting

```bash
# Check logs
docker-compose logs celery-worker

# Verify Redis connection
docker-compose exec redis redis-cli ping

# Verify Database connection
docker-compose exec celery-worker python -c \
  "import sqlalchemy; \
   print('Database OK')"
```

### Tasks Not Processing

```bash
# Check worker health
docker-compose exec celery-worker \
  celery -A tasks.celery_app inspect active

# Check queue status
docker-compose exec celery-worker \
  celery -A tasks.celery_app inspect reserved

# Check Redis
docker-compose exec redis redis-cli
> KEYS celery*
> LLEN celery
```

### Memory Issues

If worker memory usage is high:

1. **Reduce concurrency**:
   ```bash
   CELERYD_CONCURRENCY=2  # Reduce from 4
   ```

2. **Reduce max tasks per child**:
   ```bash
   CELERY_WORKER_MAX_TASKS_PER_CHILD=500  # Restart more frequently
   ```

3. **Monitor with Flower** - Check "Workers" tab for memory usage

### Task Timeouts

If tasks are timing out:

1. **Increase timeout**:
   ```bash
   TASK_TIMEOUT=600  # 10 minutes instead of 5
   ```

2. **Optimize task code** - Check database queries, API calls

3. **Split large tasks** - Break into smaller subtasks

### Task Failures

```bash
# View failed tasks in Flower
http://localhost:5556

# Check task error in logs
docker-compose logs celery-worker | grep "FAILED"

# Retry failed task
celery -A tasks.celery_app inspect failed_tasks
```

## Development

### Local Development (without Docker)

```bash
# Install dependencies
pip install -r services/email_service/requirements.txt

# Start Redis (required)
redis-server

# Start worker in separate terminal
celery -A services.email_service.tasks.celery_app worker \
  --loglevel=info \
  --concurrency=2

# Start beat scheduler (optional, separate terminal)
celery -A services.email_service.tasks.celery_app beat \
  --loglevel=info

# Test task
python -c "from services.email_service.tasks.celery_app import sync_emails; sync_emails.delay(email_client_id='test', tenant_id='test', user_id='test')"
```

### Adding New Tasks

1. Add task function to `services/email_service/tasks/celery_app.py`:

```python
@celery_app.task(
    name='email_service.tasks.my_task',
    bind=True,
    max_retries=3,
    default_retry_delay=10,
)
def my_task(self, tenant_id: str, user_id: str, **kwargs):
    """Task description."""
    try:
        # Validate multi-tenant context
        # Do work
        return {'status': 'success'}
    except Exception as exc:
        raise self.retry(exc=exc)
```

2. Add task routing in `create_celery_app()`:

```python
app.conf.task_routes = {
    'email_service.tasks.my_task': {'queue': 'default'},
}
```

3. Restart worker:

```bash
docker-compose restart celery-worker
```

## Production Checklist

- [ ] Use separate Redis instances for broker and result backend
- [ ] Enable Redis SSL/TLS if exposed over network
- [ ] Set up log aggregation (ELK stack, DataDog, etc.)
- [ ] Monitor worker memory usage - adjust concurrency if needed
- [ ] Configure database connection pooling
- [ ] Set up alerting for failed tasks
- [ ] Test task retries and timeouts
- [ ] Configure SigTermHandler for graceful shutdown
- [ ] Use production database (PostgreSQL, not SQLite)
- [ ] Use production Redis (Elasticache, Memorystore, etc.)
- [ ] Load test with expected task volume
- [ ] Document SLA for task processing
- [ ] Set up dead-letter queue for unprocessable tasks

## Related Documentation

- [Email Client Implementation Plan](../../../docs/plans/2026-01-23-email-client-implementation.md)
- [Celery Task Queue Configuration](../../../services/email_service/tasks/celery_app.py)
- [Email Service README](../../../services/email_service/README.md)
- [DBAL Multi-Tenant Guide](../../../docs/MULTI_TENANT_AUDIT.md)

## References

- [Celery Documentation](https://docs.celeryproject.org/)
- [Flower Monitoring](https://flower.readthedocs.io/)
- [Redis Documentation](https://redis.io/documentation)
- [Email Service RFC 5322](https://tools.ietf.org/html/rfc5322)
