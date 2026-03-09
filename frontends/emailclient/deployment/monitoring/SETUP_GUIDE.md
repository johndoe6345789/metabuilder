# Phase 8 Monitoring Infrastructure - Setup Guide
## Complete Deployment Instructions
**Last Updated:** 2026-01-24

## Prerequisites

- Docker and Docker Compose installed
- 4+ GB free memory
- 50+ GB free disk space
- Network connectivity between containers
- Bash shell

## Step 1: Prepare Environment

### Create Environment File

```bash
cd /Users/rmac/Documents/metabuilder/emailclient/deployment

# Create .env with monitoring settings
cat > .env << 'EOF'
# ============================================================================
# Elasticsearch Configuration
# ============================================================================
ELASTICSEARCH_PASSWORD=secure-elasticsearch-password-change-me-prod

# ============================================================================
# Grafana Configuration
# ============================================================================
GRAFANA_USER=admin
GRAFANA_PASSWORD=secure-grafana-password-change-me-prod

# ============================================================================
# Database Configuration (from main docker-compose.yml)
# ============================================================================
DB_USER=emailclient
DB_PASSWORD=secure_password
DB_NAME=emailclient_db

# ============================================================================
# Redis Configuration
# ============================================================================
REDIS_PORT=6379

# ============================================================================
# Notification Configuration (Optional)
# ============================================================================
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
PAGERDUTY_SERVICE_KEY=your-service-key
OPSGENIE_API_KEY=your-api-key
EMAIL_PASSWORD=your-email-password

# ============================================================================
# Monitoring Configuration
# ============================================================================
FLASK_ENV=production
LOG_LEVEL=INFO
EOF

chmod 600 .env
```

### Create Shared Network

```bash
# Create the bridge network used by both stacks
docker network create emailclient-net || echo "Network already exists"

# Verify network creation
docker network ls | grep emailclient-net
```

## Step 2: Start Main Email Service Stack

```bash
# Start core email services
docker-compose -f docker-compose.yml up -d

# Wait for services to be healthy (2-3 minutes)
docker-compose -f docker-compose.yml ps

# Verify all services are running
docker-compose -f docker-compose.yml logs --tail=50
```

## Step 3: Create Monitoring Directories

```bash
# Create directories for exporters and monitoring data
mkdir -p monitoring/data
mkdir -p monitoring/prometheus/data
mkdir -p monitoring/elasticsearch/data
mkdir -p monitoring/grafana/data
mkdir -p monitoring/logstash/data
mkdir -p monitoring/alertmanager/data
mkdir -p monitoring/loki/data

# Set permissions
chmod -R 777 monitoring/data
```

## Step 4: Start Monitoring Stack

```bash
# Start all monitoring services
docker-compose -f monitoring/docker-compose.monitoring.yml up -d

# Wait for services to be healthy (3-5 minutes)
docker-compose -f monitoring/docker-compose.monitoring.yml ps

# Check logs for any errors
docker-compose -f monitoring/docker-compose.monitoring.yml logs --tail=100
```

## Step 5: Verify Service Connectivity

### Check Prometheus Targets

```bash
# Wait 30 seconds for targets to appear, then check
sleep 30

# View Prometheus targets
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets | length'

# Expected output: Should show number of registered targets (20+)
```

### Check Elasticsearch Health

```bash
# Verify Elasticsearch is running
curl -s http://localhost:9200/_cluster/health | jq '.'

# Expected output:
# {
#   "cluster_name": "docker-cluster",
#   "status": "yellow",  # (yellow is ok for single node)
#   "timed_out": false,
#   "number_of_nodes": 1
# }
```

### Verify Logstash Connectivity

```bash
# Check if Logstash is receiving metrics
curl -s http://localhost:9600/ | jq '.host'

# Check Logstash pipeline status
curl -s http://localhost:9600/_node/stats | jq '.pipelines.main.events.in'
```

## Step 6: Configure Grafana

### Access Grafana UI

```
URL: http://localhost:3000
Default credentials: admin/admin
```

### First-Time Setup

1. **Change Admin Password:**
   - Click Profile icon (top right)
   - Select "Change password"
   - Set new secure password

2. **Verify Data Sources:**
   - Go to Configuration → Data Sources
   - Should see: Prometheus, Elasticsearch, Loki, Jaeger, Alertmanager
   - Click each to verify green checkmark

3. **Verify Dashboards:**
   - Go to Dashboards → Browse
   - Should see: "Email Service Overview", "System Resources"
   - Click to view dashboard

### Create Custom Dashboard (Optional)

```bash
# Export dashboard from Grafana UI
# 1. Open dashboard
# 2. Click dashboard title → Edit
# 3. Menu → Dashboard → Copy to clipboard
# 4. Paste into new .json file in grafana/dashboards/
# 5. Restart Grafana to auto-load

docker-compose -f monitoring/docker-compose.monitoring.yml restart grafana
```

## Step 7: Configure Alerting

### Configure Slack Notifications

```bash
# Edit alertmanager configuration
nano monitoring/alertmanager/alertmanager.yml

# Find section: global.slack_api_url
# Update with your Slack webhook URL
# Get webhook from: Slack → Settings → Apps → Webhooks

# Reload alertmanager
curl -X POST http://localhost:9093/-/reload
```

### Configure Email Notifications

```bash
# Edit alertmanager configuration
nano monitoring/alertmanager/alertmanager.yml

# Update email settings under receivers:
# - to: your-email@example.com
# - from: alertmanager@example.com
# - smarthost: smtp.example.com:587
# - auth_username: your-email@example.com
# - auth_password: your-app-password

# Reload alertmanager
curl -X POST http://localhost:9093/-/reload
```

### Test Alert Routing

```bash
# Send test alert via Prometheus
# Go to http://localhost:9090/alerts
# Click "Pending" or "Firing" to see alert status

# Manually trigger alert for testing:
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[{
    "labels": {
      "alertname": "TestAlert",
      "severity": "warning",
      "service": "test"
    },
    "annotations": {
      "summary": "Test alert for monitoring setup",
      "description": "This is a test alert"
    }
  }]'
```

## Step 8: Configure Log Ingestion

### Enable Structured Logging in Email Service

Update email service to send logs to Logstash:

```python
# In email-service code
import logging
from pythonjsonlogger import jsonlogger

handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
handler.setFormatter(formatter)
logger.addHandler(handler)

# Or send via TCP to Logstash
tcp_handler = logging.handlers.SocketHandler('logstash', 5000)
logger.addHandler(tcp_handler)
```

### Verify Logs in Kibana

```bash
# Wait 2-3 minutes for logs to be ingested
# Go to http://localhost:5601

# 1. Create index pattern:
#    - Analytics → Index Patterns → Create index pattern
#    - Pattern: logs-*
#    - Timestamp field: @timestamp
#    - Create index pattern

# 2. View logs:
#    - Analytics → Discover
#    - Select "logs-*" index
#    - Browse recent logs
```

## Step 9: Verify Metric Collection

### Check Prometheus Metrics

```bash
# Query email service metrics
curl -s 'http://localhost:9090/api/v1/query?query=flask_http_request_total' | jq '.data.result | length'

# Expected: > 0 (should have some request metrics)

# Check specific metric
curl -s 'http://localhost:9090/api/v1/query?query=up' | jq '.data.result[] | select(.labels.job=="email-service")'

# Expected: Status should be 1 (up)
```

### View Available Metrics

```bash
# List all metrics from email service
curl -s http://email-service:5000/metrics | head -20

# List all metrics from system
curl -s http://node-exporter:9100/metrics | head -20

# List all metrics from database
curl -s http://postgres-exporter:9187/metrics | head -20
```

### Create Custom Prometheus Query

```bash
# Go to http://localhost:9090/graph
#
# Example queries:
# - rate(flask_http_request_total[5m])  # Request rate
# - histogram_quantile(0.95, flask_http_request_duration_seconds_bucket)  # P95 latency
# - up  # Service up/down status
```

## Step 10: Verify Distributed Tracing

### Check Jaeger UI

```bash
# Access Jaeger interface
# URL: http://localhost:16686
```

### Send Test Trace

```bash
# If application supports OpenTelemetry:
# 1. Add OTEL SDK to your application
# 2. Configure OTEL exporter to jaeger:14250
# 3. Make request to application
# 4. Check Jaeger UI for trace

# Example curl with trace context:
curl -H "traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01" \
  http://email-service:5000/emails
```

## Step 11: Health Check Validation

### Test All Health Endpoints

```bash
# Email Service
curl -v http://localhost:5000/health | jq '.'

# PostgreSQL (via exporter)
curl -s http://localhost:9187/metrics | grep pg_up

# Redis (via exporter)
curl -s http://localhost:9121/metrics | grep redis_up

# Prometheus
curl -s http://localhost:9090/-/healthy

# Grafana
curl -s http://localhost:3000/api/health | jq '.database'

# Elasticsearch
curl -s http://localhost:9200/_cluster/health | jq '.status'

# Logstash
curl -s http://localhost:9600/ | jq '.host'

# Loki
curl -s http://localhost:3100/ready

# OpenTelemetry Collector
curl -s http://localhost:13133 | jq '.'

# Jaeger
curl -s http://localhost:16686/api/services | jq '.data | length'
```

## Step 12: Configure Backup Strategy

### Backup Elasticsearch Indices

```bash
# Create backup repository
curl -X PUT "localhost:9200/_snapshot/backup" \
  -H 'Content-Type: application/json' \
  -d'{
    "type": "fs",
    "settings": {
      "location": "/mnt/backups/elasticsearch"
    }
  }'

# Create snapshot
curl -X PUT "localhost:9200/_snapshot/backup/daily-backup"

# Schedule automated backups (cron)
# 0 2 * * * curl -X PUT "localhost:9200/_snapshot/backup/daily-$(date +\%Y\%m\%d)"
```

### Backup Grafana Dashboards

```bash
# Backup via API
curl -s http://localhost:3000/api/search?query=&starred=false \
  -H "Authorization: Bearer YOUR_API_KEY" | jq '.[] | .id' | \
  while read id; do
    curl -s http://localhost:3000/api/dashboards/id/$id \
      -H "Authorization: Bearer YOUR_API_KEY" > dashboard-$id.json
  done

# Or use cron job:
# 0 3 * * * bash /path/to/backup-grafana.sh
```

### Backup Prometheus Data

```bash
# Use built-in snapshot feature
curl -X POST http://localhost:9090/api/v1/admin/tsdb/snapshot

# Or copy volumes directly
docker run --rm -v prometheus-data:/source -v $(pwd):/backup \
  alpine tar czf /backup/prometheus-backup.tar.gz -C /source .
```

## Step 13: Monitoring & Maintenance

### Daily Checks

```bash
# Check alert status
curl -s http://localhost:9093/api/v1/alerts | jq '.data | length'

# Check service health
curl -s http://email-service:5000/health | jq '.status'

# Check Prometheus targets
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets | length'

# Check Elasticsearch indices
curl -s http://localhost:9200/_cat/indices | wc -l
```

### Weekly Maintenance

```bash
# Review and optimize Elasticsearch
curl -X POST http://localhost:9200/logs-*/_forcemerge?max_num_segments=1

# Clean up old indices (> 30 days)
curl -X DELETE http://localhost:9200/logs-*-2025-12-*

# Vacuum PostgreSQL
docker exec emailclient-postgres \
  psql -U emailclient -d emailclient_db -c "VACUUM ANALYZE;"
```

### Monthly Optimization

```bash
# Update alert thresholds based on metrics
# Review and archive old dashboards
# Check storage usage and plan capacity
# Update documentation with findings

# Storage check
du -sh monitoring/elasticsearch/data
du -sh monitoring/prometheus/data
du -sh monitoring/logstash/data
```

## Troubleshooting

### Services Won't Start

```bash
# Check for port conflicts
netstat -tlnp | grep -E '3000|5601|9090|9093'

# Free up ports if needed
lsof -i :3000  # Find process using port 3000
kill -9 <PID>

# Check Docker resources
docker stats
docker system df

# Clean up unused resources
docker system prune -a --volumes
```

### No Metrics Appearing

```bash
# Verify Prometheus can scrape targets
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | .lastScrapeStatus'

# Check target HTTP endpoint directly
curl -s http://email-service:5000/metrics | head -10

# Look for Prometheus errors
docker logs emailclient-prometheus | grep -i error
```

### Logs Not Appearing in Kibana

```bash
# Check Logstash pipeline
curl -s http://localhost:9600/_node/stats | jq '.pipelines.main.events'

# Verify Elasticsearch is indexing
curl -s http://localhost:9200/_cat/indices

# Check for parsing errors
docker logs emailclient-logstash | grep -i error | tail -20

# Manually send test log
curl -X POST http://localhost:8080 \
  -H 'Content-Type: application/json' \
  -d '{"message": "test log", "level": "info"}'
```

### High Memory Usage

```bash
# Check memory by service
docker stats --no-stream | grep -E 'emailclient|monitoring'

# Reduce Elasticsearch heap
docker exec emailclient-elasticsearch jvm-options
# Edit ES_JAVA_OPTS to reduce -Xmx value

# Reduce retention periods
# Edit prometheus/prometheus.yml: storage.tsdb.retention.time=7d
# Edit logstash.conf: max_cache_freshness_per_query: 5m

# Restart affected services
docker-compose -f monitoring/docker-compose.monitoring.yml restart elasticsearch
```

### Slow Queries

```bash
# Check slow query log
docker exec emailclient-postgres \
  tail -f /var/log/postgresql/postgresql.log | grep duration

# Check long-running queries
docker exec emailclient-postgres \
  psql -U emailclient -d emailclient_db \
  -c "SELECT pid, query, query_start FROM pg_stat_activity WHERE query != '<idle>';"

# Kill long-running query
docker exec emailclient-postgres \
  psql -U emailclient -d emailclient_db \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE duration > 300000;"
```

## Production Checklist

- [ ] All passwords changed from defaults
- [ ] Slack/PagerDuty/OpsGenie configured
- [ ] TLS/SSL enabled for external access
- [ ] Firewall rules configured
- [ ] Backup strategy implemented
- [ ] Alert thresholds tuned to environment
- [ ] Log retention policies set
- [ ] Health checks validated
- [ ] Load testing completed
- [ ] Runbooks created for on-call team
- [ ] Documentation updated
- [ ] Team training completed

## Next Steps

1. **Create Runbooks:** Document procedures for common alerts
2. **On-Call Rotation:** Set up team rotation with alert escalation
3. **Regular Reviews:** Weekly review of alert patterns and metrics
4. **Capacity Planning:** Monthly review of resource usage trends
5. **Security Hardening:** Implement network policies and authentication
6. **Integration:** Add monitoring to CI/CD pipeline

## Support Resources

- Prometheus Docs: https://prometheus.io/docs/
- Grafana Docs: https://grafana.com/docs/
- Elasticsearch Docs: https://www.elastic.co/guide/
- Logstash Docs: https://www.elastic.co/guide/en/logstash/
- OpenTelemetry: https://opentelemetry.io/docs/
- Jaeger Docs: https://www.jaegertracing.io/docs/

## Questions?

Refer to:
- `README.md` - Overview and features
- `HEALTH_ENDPOINTS.md` - Health check specifications
- `PERFORMANCE_BASELINES.md` - Expected metrics and thresholds
