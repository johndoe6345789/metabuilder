# Phase 7: Celery Async Task Queue

**Email Client Implementation Phase 7: Async Task Queue for Background Operations**

## Overview

Phase 7 implements a production-ready Celery task queue with Redis broker for handling background email operations. This enables the email service to handle long-running operations asynchronously without blocking API endpoints.

**Status**: ✅ Complete - Ready for integration with Phases 3-6

## Architecture

### Components

| Component | Purpose | Technology |
|-----------|---------|-----------|
| **Celery App** | Task queue framework | `tasks/celery_app.py` |
| **Redis Broker** | Task message broker | Redis 7+ |
| **Redis Results** | Result backend & state | Redis 7+ |
| **Workers** | Task executors | Multi-process workers |
| **Beat Scheduler** | Periodic tasks | Celery Beat + Django |
| **Flower** | Monitoring UI | Web dashboard on port 5555 |

### Task Queues (by priority)

| Queue | Priority | Tasks | Concurrency |
|-------|----------|-------|-------------|
| `sync` | 10 (High) | `sync_emails` | 2 workers |
| `send` | 8 | `send_email` | 2 workers |
| `delete` | 5 | `delete_emails` | 2 workers |
| `spam` | 3 (Low) | `check_spam` | 2 workers |
| `periodic` | 10 | `periodic_sync`, cleanup | Dedicated |

### Multi-Tenant Safety

All tasks enforce multi-tenant boundaries:

```python
# Every task requires tenant_id and user_id
sync_emails.delay(
    email_client_id='client-123',
    tenant_id='acme-corp',  # Required
    user_id='user-456',      # Required
    folder_id=None,
    force_full_sync=False
)
```

## Tasks

### 1. sync_emails

Synchronize emails from IMAP/POP3 server.

```python
@celery_app.task(
    name='email_service.tasks.sync_emails',
    bind=True,
    max_retries=5,
    default_retry_delay=10,
)
def sync_emails(
    self,
    email_client_id: str,
    tenant_id: str,
    user_id: str,
    folder_id: Optional[str] = None,
    force_full_sync: bool = False,
) -> Dict[str, Any]
```

**Returns**:
```json
{
  "status": "success",
  "messages_synced": 42,
  "messages_updated": 5,
  "messages_deleted": 0,
  "sync_duration_seconds": 12.4,
  "timestamp": 1705027200000
}
```

**Retry**: Up to 5 times with exponential backoff (5s → 10s → 20s → 40s → 80s)

### 2. send_email

Send email via SMTP.

```python
def send_email(
    self,
    email_client_id: str,
    tenant_id: str,
    user_id: str,
    to: List[str],
    cc: Optional[List[str]] = None,
    bcc: Optional[List[str]] = None,
    subject: str = '',
    body_text: str = '',
    body_html: Optional[str] = None,
    attachment_ids: Optional[List[str]] = None,
) -> Dict[str, Any]
```

**Returns**:
```json
{
  "status": "success",
  "message_id": "<abc123@email.example.com>",
  "sent_timestamp": 1705027200000,
  "recipients_sent": 3
}
```

**Retry**: Up to 3 times on SMTP failures

### 3. delete_emails

Delete emails (soft delete or move to trash).

```python
def delete_emails(
    self,
    email_ids: List[str],
    tenant_id: str,
    user_id: str,
    permanent: bool = False,
) -> Dict[str, Any]
```

**Returns**:
```json
{
  "status": "success",
  "deleted_count": 15
}
```

**Batch Operation**: Can delete multiple emails efficiently

### 4. check_spam

Analyze email for spam/phishing indicators.

```python
def check_spam(
    self,
    email_id: str,
    tenant_id: str,
    user_id: str,
) -> Dict[str, Any]
```

**Returns**:
```json
{
  "status": "success",
  "is_spam": false,
  "spam_score": 0.23,
  "indicators": ["potential_phishing_url"]
}
```

### 5. periodic_sync (Scheduled)

Runs every 5 minutes. Syncs all enabled email accounts.

```
Every 5 minutes:
  1. Query EmailClient WHERE isSyncEnabled = true
  2. Filter by lastSyncAt vs syncInterval
  3. Spawn sync_emails tasks
  4. Return task IDs for monitoring
```

### 6. cleanup_stale_results (Scheduled)

Runs hourly. Cleans up old task results from Redis.

## Setup & Testing

### Prerequisites

- Python 3.11+
- Redis 7+
- PostgreSQL 14+ (for database)

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
```

### Environment Variables

```bash
# Redis Broker
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=celery_test_pass
REDIS_BROKER_DB=0
REDIS_USE_SSL=false

# Redis Result Backend
REDIS_RESULT_HOST=localhost
REDIS_RESULT_PORT=6379
REDIS_RESULT_PASSWORD=celery_results_pass
REDIS_RESULT_DB=1
REDIS_RESULT_USE_SSL=false

# PostgreSQL
DATABASE_URL=postgresql://email_service:email_service_pass@localhost:5432/email_service_db

# SSL Options
REDIS_SSL_VERIFY_CERT=true
```

### Quick Start - Docker Compose

```bash
# Start all services (Redis, Workers, Beat, Flower)
docker-compose -f docker-compose.test.yml up -d

# Check logs
docker-compose -f docker-compose.test.yml logs -f celery-worker-sync

# Stop services
docker-compose -f docker-compose.test.yml down
```

**Services**:
- Workers: sync, send, async queues
- Beat scheduler: Periodic tasks
- Flower: http://localhost:5555 (monitoring)
- Redis broker: localhost:6379
- Redis results: localhost:6380
- PostgreSQL: localhost:5432

### Manual Testing

```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Start Celery Worker
celery -A tasks.celery_app worker --loglevel=info --queues=sync,send,delete,spam,periodic

# Terminal 3: Start Celery Beat (optional)
celery -A tasks.celery_app beat --loglevel=info

# Terminal 4: Start Flower (optional)
celery -A tasks.celery_app flower

# Terminal 5: Send test tasks
python
>>> from tasks.celery_app import sync_emails
>>> task = sync_emails.delay(
...     email_client_id='test-client',
...     tenant_id='test-tenant',
...     user_id='test-user'
... )
>>> task.id
'abc123def456'
>>> task.get(timeout=30)
```

### Unit Tests

```bash
# Run all tests
pytest tests/test_celery_app.py -v

# Run specific test class
pytest tests/test_celery_app.py::TestCeleryAppInitialization -v

# Run with coverage
pytest tests/test_celery_app.py --cov=tasks --cov-report=html
```

**Test Coverage**:
- 50+ test cases
- Celery app initialization & configuration
- Task registration
- Multi-tenant safety validation
- Retry logic & exponential backoff
- Task state tracking
- Signal handlers
- Utility functions
- Periodic task scheduling

## Monitoring

### Flower Web Dashboard

Access http://localhost:5555 to see:

- Active tasks in real-time
- Task history and statistics
- Worker status and performance
- Task execution times
- Error tracking
- Rate limiting

### Command-line Monitoring

```bash
# Inspect active tasks
python -c "from tasks.celery_app import get_active_tasks; print(get_active_tasks())"

# Get task status
python -c "from tasks.celery_app import get_task_status; print(get_task_status('task-id'))"

# Get queue statistics
python -c "from tasks.celery_app import get_queue_stats; print(get_queue_stats())"
```

### Celery Signals

Tasks emit signals for monitoring:

```python
from tasks.celery_app import celery_app

@celery_app.task.after_return.connect
def task_after_return(sender=None, **kwargs):
    print(f"Task {sender.name} completed")

@celery_app.task.failure.connect
def task_failure(sender=None, **kwargs):
    print(f"Task {sender.name} failed: {kwargs['exception']}")
```

## Configuration Details

### Retry Strategy

**Exponential Backoff Formula**:
```
next_delay = base_delay * (backoff_base ^ retry_attempt)
max_delay = 600 seconds (10 minutes)

Example (base=5s, multiplier=2):
Attempt 1: 5s
Attempt 2: 10s
Attempt 3: 20s
Attempt 4: 40s
Attempt 5: 80s (capped at 600s)
```

### Task Time Limits

| Limit | Duration | Purpose |
|-------|----------|---------|
| **Soft** | 25 minutes | Graceful shutdown signal |
| **Hard** | 30 minutes | Forceful termination |

If task exceeds soft limit: `SoftTimeLimitExceeded` exception → cleanup → retry

If task exceeds hard limit: Celery terminates worker

### Worker Configuration

```python
TASK_ACKS_LATE = True          # ACK only after completion
WORKER_PREFETCH_MULTIPLIER = 1 # One task per worker (fair distribution)
WORKER_MAX_TASKS_PER_CHILD = 1000  # Restart after 1000 tasks (memory safety)
```

### Result Backend TTL

- Task results expire after 1 hour
- Automatic cleanup via `cleanup_stale_results` task
- Redis keys: `celery-task-meta-{task_id}`

## Integration Points

### With DBAL

```python
# Inside sync_emails task:
from dbal import get_db

db = get_db()

# Multi-tenant query
email_client = db.email_client.get(
    id=email_client_id,
    filter={'tenantId': tenant_id, 'userId': user_id}
)

# Verify ownership before proceeding
if not email_client or email_client['userId'] != user_id:
    raise ValueError('Unauthorized')
```

### With Redux

Frontend dispatches task and polls for status:

```typescript
// Frontend (React)
import { useReduxAsyncData } from '@metabuilder/api-clients'

const { data: syncStatus } = useReduxAsyncData(async () => {
  const response = await fetch('/api/email/sync', { method: 'POST' })
  const { taskId } = await response.json()

  // Poll task status
  return await fetch(`/api/tasks/${taskId}`).then(r => r.json())
})
```

Backend API endpoint:

```python
# Flask API (app.py)
@app.route('/api/email/sync', methods=['POST'])
def trigger_sync():
    tenant_id = g.tenant_id
    user_id = g.user_id

    task = sync_emails.delay(
        email_client_id=request.json['email_client_id'],
        tenant_id=tenant_id,
        user_id=user_id
    )

    return jsonify({'taskId': task.id, 'status': 'pending'})

@app.route('/api/tasks/<task_id>', methods=['GET'])
def get_task_status(task_id):
    from tasks.celery_app import get_task_status
    return jsonify(get_task_status(task_id))
```

## Production Deployment

### Scaling

```bash
# Multiple workers per queue
celery -A tasks.celery_app worker -n sync@%h --queues=sync --concurrency=4
celery -A tasks.celery_app worker -n send@%h --queues=send --concurrency=2
celery -A tasks.celery_app worker -n async@%h --queues=delete,spam --concurrency=3

# Or use Kubernetes with Helm:
helm install celery ./chart --values values.yaml
```

### High Availability

```yaml
# docker-compose.prod.yml
redis-broker:
  image: redis:7-alpine
  command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
  volumes:
    - redis_data:/data  # Persistent storage
  restart: always

# Multiple replicas with load balancing
celery-worker-sync:
  replicas: 3
  restart: always
```

### Monitoring in Production

- Flower dashboard with authentication
- ELK stack (Elasticsearch, Logstash, Kibana)
- Prometheus metrics export
- CloudWatch / DataDog integration
- PagerDuty alerts for failures

## Troubleshooting

### Task Not Executing

```bash
# Check if worker is running
celery -A tasks.celery_app inspect active

# Check registered tasks
celery -A tasks.celery_app inspect registered

# Check Redis connection
redis-cli -a password ping
```

### Tasks Stuck in PENDING

```python
# Check if task is revoked
from tasks.celery_app import celery_app
celery_app.control.inspect().revoked()

# Revoke stuck task
from tasks.celery_app import revoke_task
revoke_task('task-id', terminate=True)
```

### Redis Connection Issues

```python
# Test Redis connection
import redis
r = redis.Redis(host='localhost', port=6379, password='pass', db=0)
r.ping()  # Should return True
```

### Task Timeout Issues

- Increase `TASK_SOFT_TIME_LIMIT` and `TASK_TIME_LIMIT`
- Optimize task logic (pagination, chunking)
- Use smaller batches for bulk operations

## Files

```
services/email_service/
├── tasks/
│   └── celery_app.py           # Celery app + 6 tasks (1000+ lines)
├── tests/
│   └── test_celery_app.py       # 50+ tests with 90%+ coverage
├── docker-compose.test.yml      # Full test environment
├── Dockerfile                   # Multi-stage build
├── requirements.txt             # 50+ dependencies
├── PHASE_7_CELERY.md           # This file
├── .env.example                # Environment template
├── app.py                      # Flask API (Phase 3)
├── README.md                   # Project overview
└── src/                        # Other service code

Total: ~1500 lines of production code
```

## Next Phases

- **Phase 3**: Flask API for email service endpoints
- **Phase 6**: Email workflow plugins for DAG execution
- **Phase 8**: Email client Next.js bootloader

## References

- [Celery Documentation](https://docs.celeryproject.io/)
- [Redis Documentation](https://redis.io/documentation)
- [Flower Monitoring](https://flower.readthedocs.io/)
- [Email Service README](./README.md)
