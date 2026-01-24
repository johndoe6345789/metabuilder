# Celery Worker Architecture

Phase 8: Email Service Background Task Processing - Technical Architecture

## System Overview

### Component Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     Email Service Frontend                        │
│                    (Next.js + React Redux)                       │
└─────────────────────────────┬──────────────────────────────────┘
                              │ HTTP
                    ┌─────────▼──────────┐
                    │   Flask API        │
                    │ (Email Service)    │
                    │  Port: 5000        │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────────────┐
                    │  Celery Task Queue         │
                    │  (Redis Broker DB 0)       │
                    │  Port: 6379/0              │
                    └─────────┬──────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌─────────┐     ┌──────────┐   ┌──────────┐
        │ Sync    │     │  Send    │   │  Delete  │
        │ Queue   │     │  Queue   │   │  Queue   │
        │(Priority│     │(Priority │   │(Priority │
        │  10)    │     │   8)     │   │   5)     │
        └─────────┘     └──────────┘   └──────────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         ┌────▼────┐     ┌────▼────┐    ┌───▼────┐
         │ Worker  │     │ Worker  │    │ Worker │ ...
         │ Process │     │ Process │    │ Process│
         │   (#1)  │     │   (#2)  │    │  (#3)  │
         └────┬────┘     └────┬────┘    └───┬────┘
              │               │             │
              └───────────────┼─────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Results Backend   │
                    │ (Redis DB 1)       │
                    │ TTL: 3600 seconds  │
                    └────────────────────┘
```

### Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Docker Compose Services                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌────────────────┐  ┌──────────────────┐ │
│  │  celery-worker   │  │  celery-beat   │  │ celery-flower    │ │
│  ├──────────────────┤  ├────────────────┤  ├──────────────────┤ │
│  │ Processes tasks  │  │ Schedules      │  │ Monitors tasks   │ │
│  │ from queues      │  │ periodic tasks │  │ Web UI: 5556     │ │
│  │ Concurrency: 4   │  │ Triggers sync  │  │ Database-backed  │ │
│  │ Timeout: 300s    │  │ Cleanup jobs   │  │ Persistent       │ │
│  │ Soft: 280s       │  │                │  │                  │ │
│  │                  │  │                │  │                  │ │
│  │ Image: Custom    │  │ Image: Custom  │  │ Image: Official  │ │
│  │ Python 3.11-slim │  │ Python 3.11    │  │ mher/flower:2.0.1│
│  │                  │  │                │  │                  │ │
│  │ Healthcheck:     │  │ Healthcheck:   │  │ Healthcheck:     │ │
│  │ celery inspect   │  │ ps aux         │  │ curl /health     │ │
│  │ ping             │  │                │  │                  │ │
│  │                  │  │ Depends on:    │  │ Depends on:      │ │
│  │ Depends on:      │  │ redis, postgres│  │ redis, worker    │ │
│  │ redis, postgres  │  │ celery-worker  │  │                  │ │
│  │                  │  │                │  │                  │ │
│  │ Restart: always  │  │ Restart: always│  │ Restart: always  │ │
│  │ Logs: JSON-file  │  │ Logs: JSON-file│  │ Logs: JSON-file  │ │
│  │ Max: 10m/3 files │  │ Max: 10m/3     │  │ Max: 10m/3 files │ │
│  └──────────────────┘  └────────────────┘  └──────────────────┘ │
│         │                      │                     │           │
│         └──────────┬───────────┴─────────────────────┘           │
│                    │                                             │
│  ┌─────────────────▼────────────────────────────────────────┐   │
│  │  Shared Infrastructure (from main compose)              │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐       │   │
│  │  │ Postgres │  │  Redis   │  │ Docker Network   │       │   │
│  │  │ Database │  │ Broker   │  │ metabuilder-dev  │       │   │
│  │  │ Port 5432│  │ Port 6379│  │ Subnet 172.21.0  │       │   │
│  │  └──────────┘  └──────────┘  └──────────────────┘       │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### Celery Worker (celery-worker)

**Purpose**: Execute background email operations asynchronously

**Configuration**:
```python
CELERYD_CONCURRENCY = 4          # Process count
TASK_TIME_LIMIT = 300            # Hard limit (5 min)
TASK_SOFT_TIME_LIMIT = 280       # Soft limit (4m 40s)
WORKER_PREFETCH_MULTIPLIER = 1   # One task per worker
WORKER_MAX_TASKS_PER_CHILD = 1000 # Restart after 1000 tasks
```

**Process Pool**:
```
Prefork (default for email operations)
├─ Process 1: Accepts 1 task at a time
├─ Process 2: Accepts 1 task at a time
├─ Process 3: Accepts 1 task at a time
└─ Process 4: Accepts 1 task at a time
```

**Task Queues**:
```
sync:      Priority 10 (highest) - Email synchronization
send:      Priority 8            - Email delivery
delete:    Priority 5            - Batch deletion
spam:      Priority 3            - Spam analysis
periodic:  Priority 10 (highest) - Scheduled maintenance
```

**Health Check**:
```bash
celery -A tasks.celery_app inspect ping
# Returns: {worker-name: {'ok': 'pong'}}
```

**Logs**: `/app/logs/celery-worker.log`

### Celery Beat (celery-beat)

**Purpose**: Schedule periodic/delayed tasks

**Configuration**:
```python
beat_schedule = {
    'sync-emails-every-5min': {
        'task': 'email_service.tasks.periodic_sync',
        'schedule': timedelta(minutes=5),
        'options': {'expires': 300}
    },
    'cleanup-stale-tasks-hourly': {
        'task': 'email_service.tasks.cleanup_stale_results',
        'schedule': timedelta(hours=1),
        'options': {'expires': 3600}
    },
}
```

**Scheduler**: PersistentScheduler (database-backed, survives restarts)

**Health Check**: `ps aux | grep celery`

**Logs**: `/app/logs/celery-beat.log`

**Database**: `/app/logs/celery-beat-schedule.db` (SQLite)

### Celery Flower (celery-flower)

**Purpose**: Web-based monitoring dashboard

**Access**: http://localhost:5556

**Features**:
- Active task monitoring
- Worker status and statistics
- Queue depth visualization
- Task success/failure rates
- Real-time graphs
- Persistent task history
- Task filtering and search

**Image**: Official `mher/flower:2.0.1`

**Database**: `/data/flower.db` (SQLite, persistent)

**Health Check**: `curl http://localhost:5555/health`

## Data Flow

### Email Sync Task Flow

```
1. Periodic Task Triggered (every 5 min)
   └─ Beat schedules periodic_sync() task

2. periodic_sync() Task Executes
   └─ Fetches all enabled EmailClient records
   └─ For each client, spawns sync_emails() task

3. sync_emails() Task Queued
   └─ Placed on 'sync' queue (priority 10)
   └─ Task ID: <UUID>

4. Worker Picks Up Task
   └─ Checks multi-tenant context (tenant_id, user_id)
   └─ Validates user owns email_client

5. IMAP Connection
   └─ Retrieves credentials from Credential entity
   └─ Connects to IMAP server
   └─ Gets sync token from EmailFolder

6. Incremental Sync
   └─ Fetches new/updated messages since last sync
   └─ For each message:
      ├─ Parse headers and body
      ├─ Extract attachments
      └─ Create EmailMessage record + attachments

7. Update Sync State
   └─ Update EmailClient.lastSyncAt = now()
   └─ Update EmailFolder.syncToken
   └─ Commit to database

8. Task Completes
   └─ Result stored in Redis (DB 1) with TTL=3600s
   └─ Flower records task metadata
   └─ Task status: SUCCESS
```

### Email Send Task Flow

```
1. User Initiates Send (Frontend)
   └─ POST /api/v1/{tenant}/email/send
   └─ Flask validates and queues task

2. send_email() Task Queued
   └─ Placed on 'send' queue (priority 8)

3. Worker Picks Up Task
   └─ Multi-tenant validation (owns client?)
   └─ Fetches credentials from Credential entity

4. Build MIME Message
   └─ Create RFC 5322 message structure
   └─ Add headers (From, To, Cc, Bcc, Subject)
   └─ Add body (text and/or HTML)
   └─ Add attachments from S3/blob storage

5. SMTP Delivery
   └─ Connect to SMTP server (with TLS/STARTTLS)
   └─ Authenticate with credentials
   └─ Send message
   └─ Close connection

6. Create Sent Message Record
   └─ Create EmailMessage with isSent=true
   └─ Store in EmailFolder(type='sent')

7. Task Completes
   └─ Result includes message_id and recipients_sent
   └─ Frontend receives task_id to poll status
```

## Multi-Tenant Safety

### Validation Pattern

Every task validates multi-tenant context:

```python
@celery_app.task
def sync_emails(email_client_id, tenant_id, user_id, **kwargs):
    # Step 1: Validate caller owns email_client
    client = db.query(EmailClient).filter(
        EmailClient.id == email_client_id,
        EmailClient.tenantId == tenant_id,
        EmailClient.userId == user_id
    ).first()

    if not client:
        raise PermissionError("Unauthorized")

    # Step 2: Proceed with sync
    ...
```

### Data Isolation

All database queries filter by tenantId:

```python
# ✓ CORRECT
messages = db.query(EmailMessage).filter(
    EmailMessage.tenantId == tenant_id,
    EmailMessage.userId == user_id
).all()

# ✗ WRONG (would leak other tenant data)
messages = db.query(EmailMessage).all()
```

## Retry & Error Handling

### Exponential Backoff

```
Attempt 1: Immediate
Attempt 2: +5 seconds (base delay)
Attempt 3: +10 seconds (5 * 2^1)
Attempt 4: +20 seconds (5 * 2^2)
Attempt 5: +40 seconds (5 * 2^3)
Attempt 6: Failed (max retries exceeded)

Max backoff: 600 seconds (10 minutes)
```

### Per-Task Retry Configuration

```python
@celery_app.task(
    max_retries=5,
    default_retry_delay=10,
)
def sync_emails(...):
    try:
        # Task logic
    except Exception as exc:
        raise self.retry(exc=exc, countdown=backoff_seconds)
```

### Task Failure Handling

```
Task Fails After All Retries
└─ on_failure() hook called
   ├─ Log failure with context
   ├─ Notify monitoring systems
   └─ Record in Flower database (persistent)

Result Stored in Redis
└─ TTL: 3600 seconds (1 hour)
└─ After TTL expires: Auto-deleted by Redis
└─ Flower: Queries Redis on dashboard load
```

## Health Checks

### Worker Health

```bash
# Command
celery -A tasks.celery_app inspect ping

# Response (healthy)
{'celery@hostname': {'ok': 'pong'}}

# Interval: 30 seconds
# Timeout: 10 seconds
# Retries: 3 (marks unhealthy after 3 failures)
```

### Beat Health

```bash
# Command
ps aux | grep celery

# Check: Beat process is running
# Interval: 30 seconds
# Timeout: 10 seconds
```

### Flower Health

```bash
# Command
curl http://localhost:5555/health

# Response
HTTP 200 OK

# Interval: 30 seconds
# Timeout: 10 seconds
```

### Startup Verification

```bash
# 1. Worker starts listening on broker
# 2. Beat registers schedule with scheduler
# 3. Flower connects to broker and worker
# 4. First health check after start_period=15s

Total startup time: ~15-30 seconds
```

## Resource Management

### Memory Usage

```
Per Worker Process:
- Base: ~50-100 MB
- Task overhead: ~20-50 MB
- Per message cache: ~1-5 MB

Example (4 workers, 50 tasks each):
4 processes * 100 MB = 400 MB base
+ 4 * 50 * 2 MB task overhead = 400 MB
= ~800 MB total

Configure limits in docker-compose:
limits:
  memory: 512M
reservations:
  memory: 256M
```

### CPU Usage

```
Prefork pool: CPU-bound tasks don't block other workers
Each worker has its own process on separate CPU core

Example (4-core system):
- Process 1: Core 1
- Process 2: Core 2
- Process 3: Core 3
- Process 4: Core 4

Recommendation: Concurrency = number of CPU cores
```

### Connection Pooling

```
Database Connections:
- Pool size: 10
- Max overflow: 20
- Per worker: 1 active + queued

Redis Connections:
- Connection pool managed by redis-py
- Auto-reconnect on failure
- Connection timeout: 5 seconds
```

## Volume & Persistence

### celery_worker_logs Volume

```
Type: tmpfs (in-memory filesystem)
Size: 100 MB
Path: /app/logs/

Files:
- celery-worker.log (worker logs)
- celery-beat.log (beat logs)
- celery-beat-schedule.db (beat schedule)
```

**Persistence**: Lost on container restart

**Why tmpfs?**:
- Faster than disk I/O
- Logs are temporary (use log aggregation)
- Reduces disk I/O overhead
- Survives container restarts

### celery_flower_data Volume

```
Type: local (host filesystem)
Path: /data/ (in container)

Files:
- flower.db (SQLite database)
  └─ Task history
  └─ Worker statistics
  └─ Task metadata
```

**Persistence**: Survives container/host restarts

**Recommended for**: Production (keep task history)

## Security

### Task Validation

```python
# All tasks validate:
# 1. tenant_id parameter exists
# 2. user_id parameter exists
# 3. Task can access resources owned by user

# No task can:
# - Access another tenant's data
# - Run without explicit tenant_id
# - Bypass database ACL checks
```

### Credential Handling

```python
# Email passwords stored encrypted in Credential entity
# Tasks retrieve and decrypt at execution time
# Decrypted password never logged or returned to client

# Encryption: SHA-512 + salt
# Key: CREDENTIAL_ENCRYPTION_KEY from environment
```

### Network Security

```
All services on internal Docker network:
- Isolated from host network (unless explicitly exposed)
- Only Flower (5556) exposed to host for monitoring
- Worker/Beat communicate via internal network

External Access:
- Flower: http://localhost:5556 (monitoring only, read access)
- Email Service: Port 5000 (API, protected by auth)
- Database: Port 5432 (internal only)
- Redis: Port 6379 (internal only)
```

## Monitoring & Observability

### Metrics Available

**Worker Metrics**:
- `worker.concurrency` - Number of concurrent processes
- `task.active` - Number of currently executing tasks
- `task.reserved` - Number of prefetched tasks
- `task.success` - Success count (lifetime)
- `task.failure` - Failure count (lifetime)
- `task.retry` - Retry count (lifetime)
- `worker.uptime` - Worker uptime in seconds
- `memory.usage` - Current memory usage (bytes)

**Task Metrics**:
- `task.duration` - Execution time (seconds)
- `task.retries` - Number of retries before success/failure
- `task.queue_time` - Time waiting in queue (seconds)
- `task.worker_time` - Time executing on worker (seconds)

**Queue Metrics**:
- `queue.depth` - Number of pending tasks
- `queue.throughput` - Tasks processed per second
- `queue.latency` - Average time from queue to execution

### Logging

**Worker Logs** (`/app/logs/celery-worker.log`):
```
[2026-01-24 12:00:00,123] INFO [task_prerun_handler] Task sync_emails starting (task_id=abc123...)
[2026-01-24 12:00:05,456] INFO [task_postrun_handler] Task sync_emails completed
[2026-01-24 12:00:10,789] ERROR [sync_emails] Connection failed: timeout
[2026-01-24 12:00:15,012] INFO [sync_emails] Retrying in 5 seconds...
```

**Beat Logs** (`/app/logs/celery-beat.log`):
```
[2026-01-24 12:00:00] celery beat v5.3.4 (vi)
[2026-01-24 12:05:00] Scheduler: Triggering task 'email_service.tasks.periodic_sync'
```

**Flower Web UI** (http://localhost:5556):
- All metrics available in real-time
- Task history searchable
- Worker status dashboard
- Graphs and charts

## References

- [Celery Architecture Documentation](https://docs.celeryproject.org/en/stable/architecture/)
- [Prefork Pool Design](https://docs.celeryproject.org/en/stable/userguide/workers.html#prefork-pool)
- [Task Routing](https://docs.celeryproject.org/en/stable/userguide/routing.html)
- [Flower Dashboard](https://flower.readthedocs.io/)
- [Redis Pub/Sub](https://redis.io/topics/pubsub)
