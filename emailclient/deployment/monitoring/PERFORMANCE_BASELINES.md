# Performance Baselines - Phase 8 Email Client
## Expected Metrics & Alert Thresholds
**Last Updated:** 2026-01-24

## Overview

This document establishes performance baselines for the Phase 8 Email Client monitoring infrastructure. Baselines define:
- Normal operating ranges for metrics
- Alert thresholds for anomalies
- Performance targets for SLAs
- Capacity planning boundaries

## Service Level Objectives (SLOs)

### Email Service API

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Availability | 99.9% | < 99.95% | < 99.0% |
| Error Rate | < 0.5% | > 1% | > 5% |
| P95 Latency | 200ms | 500ms | > 2s |
| P99 Latency | 300ms | 1s | > 5s |
| DB Connection Pool | < 50% | > 70% | > 85% |
| Cache Hit Rate | > 85% | < 80% | < 50% |

### Celery Task Processing

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Queue Depth | < 100 | > 500 | > 1000 |
| Task Failure Rate | < 1% | > 5% | > 10% |
| Avg Task Time | < 5s | > 10s | > 30s |
| Worker Availability | 100% | > 1 worker down | All workers down |

### Email Protocols

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| IMAP Pool Utilization | < 50% | > 75% | > 90% |
| SMTP Pool Utilization | < 40% | > 70% | > 90% |
| Postfix Queue | < 10 msgs | > 50 msgs | > 100 msgs |
| IMAP Sync Time | < 30s | > 60s | > 120s |

## Response Time Baselines

### Email Service Endpoints

**GET /emails** (List emails)
```
P50: 50ms
P75: 100ms
P90: 150ms
P95: 200ms
P99: 500ms
Max: 2000ms
```

**POST /emails/send** (Send email)
```
P50: 200ms
P75: 400ms
P90: 600ms
P95: 1s
P99: 2s
Max: 5s
```

**GET /emails/{id}** (Get single email)
```
P50: 20ms
P75: 50ms
P90: 100ms
P95: 150ms
P99: 300ms
Max: 1000ms
```

**POST /emails/{id}/sync** (Sync email account)
```
P50: 5s
P75: 10s
P90: 15s
P95: 20s
P99: 30s
Max: 120s
```

### Database Query Baselines

**SELECT queries**
```
P50: 5ms
P75: 10ms
P90: 20ms
P95: 50ms
P99: 100ms
Max: 500ms
Alert if P95 > 100ms for 5 minutes
```

**INSERT/UPDATE/DELETE queries**
```
P50: 10ms
P75: 20ms
P90: 40ms
P95: 100ms
P99: 200ms
Max: 1000ms
Alert if P95 > 200ms for 5 minutes
```

**Slow Query Threshold:** > 500ms
- Investigate and optimize queries regularly
- Log all slow queries for analysis

### Cache Access Baselines

**Redis GET operations**
```
P50: 1ms
P75: 2ms
P90: 3ms
P95: 5ms
P99: 10ms
Max: 50ms
Alert if P95 > 50ms for 5 minutes
```

**Redis SET operations**
```
P50: 2ms
P75: 3ms
P90: 5ms
P95: 10ms
P99: 20ms
Max: 100ms
Alert if P95 > 50ms for 5 minutes
```

**Expected Hit Rates**
```
Session cache: > 95%
Email metadata: > 85%
User preferences: > 90%
Overall cache: > 85%
Alert if < 50% for 10 minutes
```

## Resource Usage Baselines

### CPU

**Normal Operating Range:**
```
User Time: 30-50%
System Time: 5-15%
I/O Wait: 0-5%
Idle: 35-60%
```

**Alert Thresholds:**
```
Warning: > 70% for 5 minutes
Critical: > 85% for 5 minutes
Spike allowed up to 95% for < 1 minute
```

**By Component:**
- Email Service: 10-20% CPU per instance
- Celery Worker: 5-15% CPU per instance
- Postfix: 2-5% CPU
- Dovecot: 3-8% CPU
- PostgreSQL: 10-30% CPU
- Redis: 1-3% CPU

### Memory

**Normal Operating Range (Total System):**
```
Used: 40-60% of total
Available: 40-60% of total
Buffers/Cache: 10-20% of total
```

**Alert Thresholds:**
```
Warning: > 75% for 5 minutes
Critical: > 85% for 5 minutes
Out of Memory: < 5% available (immediate alert)
```

**By Component:**
- Email Service container: 200-400 MB
- Celery Worker container: 300-500 MB
- PostgreSQL container: 400-600 MB
- Redis container: 100-200 MB
- Elasticsearch container: 512-1024 MB
- Grafana container: 100-200 MB

### Disk I/O

**Normal Operating Range:**
```
Reads: 10-50 MB/s average
Writes: 10-50 MB/s average
Read IOPS: 100-500 average
Write IOPS: 100-500 average
```

**Alert Thresholds:**
```
Utilization > 80% for 10 minutes
Sustained read/write > 100 MB/s for extended period
I/O wait > 10% for 5 minutes
```

**Disk Usage:**
```
PostgreSQL data: Grows ~1-5 GB per week
Elasticsearch indices: Grows ~1-10 GB per week
Logstash data: Grows ~1-5 GB per week
Root filesystem: Keep < 85% full
```

### Network

**Normal Operating Range:**
```
Inbound: 1-10 Mbps average
Outbound: 1-10 Mbps average
Packet loss: 0%
Latency: < 5ms (local network)
```

**Alert Thresholds:**
```
Packet loss > 0.1% for 2 minutes
Inbound drops > 100 packets/sec for 5 minutes
Outbound drops > 100 packets/sec for 5 minutes
Link utilization > 80% for 5 minutes
```

## Database Baselines

### Connection Pool

**Normal Operating Range:**
```
Active Connections: 10-20
Max Connections: 200
Utilization: 5-10%
```

**Alert Thresholds:**
```
Warning: Active > 140 (70% of 200)
Critical: Active > 170 (85% of 200)
At capacity: Active >= 200
```

**Connection Breakdown (typical):**
- Email Service: 5-8 connections
- Celery Workers: 2-3 per worker
- Scheduled tasks: 1-2 connections
- Administrative tools: 1 connection
- Reserved: 20+ for surge handling

### Query Performance

**Query Types Baseline:**
```
Simple SELECT (< 1000 rows):
  P95: 5ms
  P99: 20ms

Complex SELECT (joins, aggregations):
  P95: 50ms
  P99: 200ms

INSERT (single):
  P95: 10ms
  P99: 50ms

BULK INSERT (1000s rows):
  P95: 500ms
  P99: 2s
```

**Slow Query Metrics:**
```
Queries > 500ms: < 1% of all queries
Queries > 1s: < 0.1% of all queries
Alert if slow queries > 5% for 5 minutes
```

### Replication Lag (if applicable)

**Normal Operating Range:**
```
Lag: < 100ms
Max acceptable: < 1s
```

**Alert Thresholds:**
```
Warning: > 500ms for 2 minutes
Critical: > 2s for 1 minute
Unreplicated transactions: Immediate alert
```

### Index Statistics

**Index Sizes:**
```
emails table: 500 MB - 2 GB (typical)
email_attachments table: 100 MB - 500 MB
email_folders table: < 1 MB
users table: < 10 MB
```

**Index Health:**
```
Index fragmentation: < 10% (healthy)
Scan efficiency: > 95% (using index)
Full table scan rate: < 1% of all queries
```

## Celery Task Queue Baselines

### Queue Depth

**Normal Operating Range:**
```
Depth: 0-100 tasks
Processing rate: 10-100 tasks/second
Avg task time: 1-5 seconds
```

**Alert Thresholds:**
```
Warning: > 500 pending (5+ minutes backlog)
Critical: > 1000 pending (10+ minutes backlog)
Growing: Rate of growth > 10% for 10 minutes
```

### Task Processing

**Task Distribution:**
```
sync_emails: 50%
send_emails: 30%
process_attachments: 15%
maintenance_tasks: 5%
```

**Task Performance Targets:**
```
sync_emails: < 5s
send_emails: < 10s
process_attachments: < 20s
maintenance_tasks: < 30s
```

**Failure Rates:**
```
Normal: < 1% failure rate
Acceptable: < 5% failure rate
Alert threshold: > 10% for 5 minutes
```

**Worker Status:**
```
Healthy: All workers running
Warning: 1+ worker down
Critical: 50%+ workers down
```

## Email Protocol Baselines

### IMAP Sync

**Sync Performance:**
```
New message detection: < 5s
Full sync (all folders): 10-30s
Incremental sync: < 5s
Error rate: < 0.1%
```

**Connection Pool:**
```
Pool size: 5-10 connections
Max utilization: 90%
Connection reuse: > 95%
Alert if > 90% for 5 minutes
```

### SMTP Sending

**Send Performance:**
```
Single email: 200-1000ms
Batch emails (10): 2-10s
Connection establish: 50-200ms
Error rate: < 0.5%
```

**Connection Pool:**
```
Pool size: 3-5 connections
Max utilization: 90%
Connection reuse: > 95%
Alert if > 90% for 5 minutes
```

### Postfix Queue

**Queue Metrics:**
```
Avg queue depth: 0-10 messages
Max queue depth: < 100 messages
Processing rate: 90%+ delivery success
Bounce rate: < 5%
```

**Alert Thresholds:**
```
Queue > 50: Warning
Queue > 100: Critical
Stuck messages (> 1 hour in queue): Investigate
Delivery failures > 5%: Warning
```

### Dovecot

**Active Connections:**
```
IMAP connections: 10-100 typical
POP3 connections: 5-20 typical
Active sessions: Varies with user load
```

**Authentication:**
```
Success rate: > 99%
Failed auth: < 1%
Connection errors: < 0.1%
```

## Monitoring Stack Baselines

### Prometheus

**Data Volume:**
```
Metrics per job: 100-500
Total unique metrics: 2000-5000
Data points per minute: 10,000-50,000
Disk storage: 5-20 GB for 30 days retention
```

**Performance Targets:**
```
Query response: < 1s
Alert evaluation: < 30s
Scrape duration: < 5s
Scrape success: > 99.9%
```

### Elasticsearch

**Index Size:**
```
Daily indices: 500 MB - 2 GB per day
Retention: 30 days = 15-60 GB
Shard count: 1 shard per index for single-node
Replica count: 0 for single-node
```

**Query Performance:**
```
Simple query: < 100ms
Complex aggregation: < 500ms
Full-text search: < 1s
Alert if P95 > 1s for queries
```

**Ingestion Rate:**
```
Logs per second: 100-1000
Bulk insert throughput: 50-200 MB/s
Alert if dropped events > 0 for 1 minute
```

### Grafana

**Dashboard Performance:**
```
Page load: < 2s
Query execution: < 1s
Alert state update: < 30s
```

### Jaeger

**Tracing Volume:**
```
Spans per second: 100-1000
Trace retention: 48 hours default
Storage: 50 MB - 500 MB typical
```

## Alert Configuration Examples

### Email Service

```yaml
# High error rate
- alert: EmailServiceHighErrorRate
  expr: rate(flask_http_request_total{status=~"5.."}[5m]) > 0.05
  for: 3m

# Slow requests
- alert: EmailServiceSlowRequests
  expr: histogram_quantile(0.99, rate(flask_http_request_duration_seconds_bucket[5m])) > 2
  for: 5m
```

### Database

```yaml
# Connection pool saturation
- alert: PostgreSQLConnectionPoolSaturation
  expr: pg_stat_activity_count > (pg_settings_max_connections * 0.8)
  for: 5m

# Slow queries
- alert: PostgreSQLSlowQueries
  expr: pg_slow_queries_seconds > 0.5
  for: 5m
```

### Cache

```yaml
# Memory pressure
- alert: RedisMemoryPressure
  expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.85
  for: 5m

# High eviction rate
- alert: RedisEvictions
  expr: rate(redis_evicted_keys_total[5m]) > 0
  for: 2m
```

### Celery

```yaml
# Queue backup
- alert: CeleryQueueBackup
  expr: celery_queue_length > 1000
  for: 5m

# Task failure spike
- alert: CeleryTaskFailureRate
  expr: rate(celery_task_failed_total[5m]) > 0.1
  for: 5m
```

## Capacity Planning

### Growth Projections

**Email Service:**
- Per 1000 daily users: ~100 req/sec during peak
- Response time degrades at > 500 req/sec
- Scale horizontally at 50% utilization

**Data Storage:**
- Email metadata: ~1 KB per email
- Email body + attachments: 50 KB - 5 MB per email
- Database growth: ~1-5 GB per month typical
- Elasticsearch logs: ~1-10 GB per week

**Resource Scaling:**
```
Low load (< 100 req/sec):
- 1x email-service, 2x celery-worker
- CPU: 20-40%, Memory: 50-60%

Medium load (100-500 req/sec):
- 3x email-service, 4x celery-worker
- CPU: 40-70%, Memory: 65-80%

High load (> 500 req/sec):
- 5+ email-service, 8+ celery-worker
- Consider horizontal scaling architecture
```

## Maintenance Windows

### Expected Downtime for Maintenance

- **Zero-copy schema changes:** < 1 minute
- **Index optimization:** 5-15 minutes
- **Database backup:** 10-30 minutes
- **Elasticsearch optimization:** 30-60 minutes
- **Full service deployment:** 5-10 minutes (blue-green)

### Maintenance Impact

- During maintenance windows, queue depth may increase
- Allow 2x queue capacity buffer for maintenance
- Use separate read replicas to avoid downtime

## Testing & Validation

### Load Testing Targets

```bash
# 1000 concurrent users
ab -n 100000 -c 1000 http://email-service:5000/emails

# Sustained 500 req/sec
vegeta attack -duration=10m -rate=500 | vegeta report

# Cache hit rate test
wrk -t 4 -c 100 -d 5m http://email-service:5000/emails
```

### Expected Results

**From load test (1000 concurrent users):**
```
P50 latency: 100-200ms
P95 latency: 500-1000ms
P99 latency: 2-5s
Error rate: < 1%
Throughput: 1000-2000 req/sec
```

## Ongoing Optimization

### Monthly Reviews

1. Compare actual metrics to baselines
2. Identify consistent deviations
3. Update baselines based on new hardware
4. Adjust alert thresholds as needed

### Metrics to Track

- Percentile drift (P50, P95, P99 latencies)
- Error rate trends
- Resource utilization trends
- Cache hit rate trends
- Queue processing efficiency

### Documentation Updates

- Update baselines after major changes
- Document reasons for threshold adjustments
- Keep historical baseline data for comparison
- Share findings with operations team
