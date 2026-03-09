# Health Endpoints - Phase 8 Email Client Monitoring
# Comprehensive health check specifications for all services
# Last Updated: 2026-01-24

## Overview

All services must expose health check endpoints that return JSON status information. These endpoints are used by:
- Docker health checks
- Kubernetes liveness/readiness probes
- Load balancers for upstream routing
- Monitoring systems for availability tracking

## Standard Health Response Format

All health endpoints should return:

```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2026-01-24T10:00:00Z",
  "version": "1.0.0",
  "service": "email-service",
  "uptime_seconds": 3600,
  "checks": {
    "database": {
      "status": "healthy",
      "response_time_ms": 5,
      "timestamp": "2026-01-24T10:00:00Z"
    },
    "cache": {
      "status": "healthy",
      "response_time_ms": 2,
      "timestamp": "2026-01-24T10:00:00Z"
    }
  }
}
```

## Service Health Endpoints

### Email Service (Flask API)

**Endpoint:** `GET /health`

**Status Codes:**
- `200 OK` - Service is healthy
- `503 Service Unavailable` - Service is unhealthy

**Response (Healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-24T10:00:00Z",
  "version": "1.0.0",
  "service": "email-service",
  "uptime_seconds": 3600,
  "checks": {
    "database": {
      "status": "healthy",
      "response_time_ms": 5,
      "connection_pool": {
        "active": 8,
        "max": 20
      }
    },
    "cache": {
      "status": "healthy",
      "response_time_ms": 2,
      "memory_usage_mb": 45
    },
    "imap_pool": {
      "status": "healthy",
      "active": 5,
      "max": 10
    },
    "smtp_pool": {
      "status": "healthy",
      "active": 2,
      "max": 5
    }
  }
}
```

**Response (Degraded):**
```json
{
  "status": "degraded",
  "timestamp": "2026-01-24T10:00:00Z",
  "service": "email-service",
  "checks": {
    "database": {
      "status": "degraded",
      "response_time_ms": 45,
      "message": "Slow connection pool responses"
    },
    "cache": {
      "status": "healthy",
      "response_time_ms": 2
    }
  }
}
```

**Implementation (Flask):**
```python
from flask import jsonify
from datetime import datetime
import psutil
import os

@app.route('/health', methods=['GET'])
def health_check():
    start_time = time.time()

    checks = {
        'database': check_database_health(),
        'cache': check_cache_health(),
        'imap_pool': check_imap_pool_health(),
        'smtp_pool': check_smtp_pool_health(),
    }

    # Overall status: healthy if all checks pass, degraded if any slow
    overall_status = determine_overall_status(checks)

    response = {
        'status': overall_status,
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'version': os.getenv('APP_VERSION', '1.0.0'),
        'service': 'email-service',
        'uptime_seconds': int(time.time() - app.start_time),
        'checks': checks
    }

    status_code = 200 if overall_status == 'healthy' else 503
    return jsonify(response), status_code
```

### Celery Worker

**Endpoint:** `GET /health` (exposed via monitoring port 9999)

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-24T10:00:00Z",
  "service": "celery-worker",
  "worker": "celery@worker1",
  "checks": {
    "worker_online": {
      "status": "healthy",
      "active_tasks": 3
    },
    "queue_depth": {
      "status": "healthy",
      "pending_tasks": 42,
      "max_threshold": 1000
    },
    "task_failure_rate": {
      "status": "healthy",
      "failures_per_minute": 0.1
    }
  }
}
```

### Celery Beat

**Endpoint:** `GET /health` (exposed via monitoring port 9999)

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-24T10:00:00Z",
  "service": "celery-beat",
  "checks": {
    "scheduler_running": {
      "status": "healthy"
    },
    "next_scheduled_task": {
      "task_name": "sync_emails",
      "scheduled_time": "2026-01-24T10:05:00Z"
    }
  }
}
```

### PostgreSQL Database

**Endpoint:** `/health` (via postgres-exporter)

**SQL Query for Health:**
```sql
SELECT
  CASE
    WHEN max(extract(epoch from (now() - pg_stat_activity.query_start))) > 300
    THEN 'degraded'
    ELSE 'healthy'
  END as status,
  (SELECT count(*) FROM pg_stat_activity) as active_connections,
  current_setting('max_connections')::int as max_connections
FROM pg_stat_activity;
```

### Redis Cache

**Endpoint:** `/health` (via redis-exporter)

**Redis Command:**
```
PING
INFO memory
INFO stats
```

**Health Criteria:**
- `PING` returns `PONG` → healthy
- Memory usage < 85% of max_memory → healthy
- Response time < 5ms → healthy

### Postfix SMTP

**Endpoint:** Command-line health check

**Health Check:**
```bash
# Check if postfix service is running
postfix status

# Check mail queue
mailq | head -n 1  # Should show "Mail queue is empty"

# Monitor recent logs
tail -f /var/log/postfix/mail.log
```

**Metrics to Monitor:**
- Queue depth: < 100 messages
- Recent delivery success rate: > 95%
- SMTP port (25, 587, 465) connectivity

### Dovecot IMAP/POP3

**Endpoint:** Command-line health check

**Health Check:**
```bash
# Check if dovecot is running
systemctl status dovecot

# Test IMAP connection
doveadm ping

# Check authenticated sessions
doveadm auth test user@example.com password

# Monitor mailbox status
doveadm mailbox status all INBOX
```

**Metrics to Monitor:**
- IMAP/POP3 port connectivity (143, 993, 110, 995)
- Authentication success rate: > 99%
- Mailbox integrity

## Monitoring & Alerting

### Docker Health Checks

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
  interval: 30s      # Check every 30 seconds
  timeout: 10s       # Wait up to 10 seconds for response
  retries: 3         # Mark unhealthy after 3 failed checks
  start_period: 15s  # Grace period before first check
```

### Prometheus Health Status Queries

```promql
# Health endpoint availability
up{job="email-service"} == 1

# Service degraded
up{job="email-service"} == 0.5

# All services up
sum(up) by (cluster) == count(count by (job))
```

### Alert Rules

```yaml
# Service Down Alert
- alert: ServiceDown
  expr: up{job="email-service"} == 0
  for: 2m
  annotations:
    summary: "{{ $labels.service }} is down"

# Service Degraded Alert
- alert: ServiceDegraded
  expr: emailservice_health_status == 0.5
  for: 5m
  annotations:
    summary: "{{ $labels.service }} is degraded"
```

## Health Check Implementation Guide

### Required Checks

Every health endpoint MUST check:

1. **Database Connectivity**
   - Can connect to database
   - Connection pool not saturated
   - Response time acceptable (< 50ms)

2. **Cache Connectivity**
   - Can connect to Redis
   - Memory usage normal
   - Response time acceptable (< 10ms)

3. **External Services**
   - IMAP/SMTP pools functional
   - Message broker accessible
   - Dependencies not critical failures

### Health Status Definitions

| Status | Meaning | HTTP Code | Action |
|--------|---------|-----------|--------|
| healthy | All checks pass | 200 | Serve traffic normally |
| degraded | Some checks slow/warnings | 200* | Continue serving, alert on monitoring |
| unhealthy | Critical checks failed | 503 | Don't route traffic |

*Note: Docker will still restart containers on degraded status if configured

### Performance Baselines

**Expected Response Times:**
- Database check: < 50ms
- Cache check: < 10ms
- Queue check: < 100ms
- Full health endpoint: < 500ms

**Alert Thresholds:**
- Health endpoint not responding: 2 minutes
- Database response time > 100ms: 5 minutes
- Cache response time > 50ms: 5 minutes
- Any critical check failing: 1 minute

## Gradual Degradation Pattern

Services should support graceful degradation:

```python
def check_health():
    status = 'healthy'
    checks = {}

    # Critical checks - any failure = unhealthy
    for critical_check in ['database', 'cache']:
        result = critical_check()
        checks[critical_check] = result
        if result['status'] != 'healthy':
            status = 'unhealthy'

    # Warn checks - warnings = degraded (not unhealthy)
    for warn_check in ['imap_pool', 'smtp_pool']:
        result = warn_check()
        checks[warn_check] = result
        if result['status'] == 'degraded':
            status = 'degraded'

    return {
        'status': status,
        'checks': checks,
        'timestamp': utcnow()
    }
```

## Readiness vs Liveness

For Kubernetes deployments:

**Liveness Probe** (Is service alive?)
- Simple endpoint that just returns OK if running
- `GET /alive` → Always 200 if service started

**Readiness Probe** (Can service handle requests?)
- Full health checks including dependencies
- `GET /ready` → 503 if dependencies unavailable

## Monitoring Dashboard

Add to Grafana:

```
Health Status Panel:
- Email Service: {{ emailservice_health_status }}
- Celery Worker: {{ celery_worker_health_status }}
- PostgreSQL: {{ postgres_health_status }}
- Redis: {{ redis_health_status }}

Response Time (P95):
- {{ histogram_quantile(0.95, health_endpoint_duration) }}
```

## Testing Health Endpoints

```bash
# Test email service
curl -v http://email-service:5000/health

# Test with timeout
curl --max-time 10 http://email-service:5000/health

# Continuous monitoring
watch -n 5 'curl -s http://email-service:5000/health | jq'

# Load test health endpoint
ab -n 1000 -c 10 http://email-service:5000/health
```

## Troubleshooting

### Health Endpoint Returns 503

1. Check database connectivity: `curl http://postgres:5432`
2. Check cache connectivity: `redis-cli -h redis ping`
3. Check IMAP/SMTP pools: Review pool configuration
4. Check logs: `docker logs emailclient-email-service`

### Health Status Shows Degraded

1. Check response times: `curl -w "@curl-format.txt" http://email-service:5000/health`
2. Monitor database: `psql -d emailclient_db -c "SELECT count(*) FROM pg_stat_activity"`
3. Monitor cache memory: `redis-cli INFO memory`
4. Check application logs for slow queries/operations

### Health Endpoint Timing Out

1. Reduce number of checks (parallelize or async)
2. Add timeout context for sub-checks
3. Cache health check results (with short TTL)
4. Offload heavy checks to separate endpoint
