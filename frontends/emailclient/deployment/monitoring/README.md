# Phase 8 Monitoring Infrastructure
## Comprehensive Observability Stack for Email Client
**Last Updated:** 2026-01-24

## Overview

This directory contains a production-ready monitoring infrastructure for the Phase 8 Email Client implementation. It provides:

- **Metrics Collection:** Prometheus scraping all services
- **Log Aggregation:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Visualization:** Grafana dashboards
- **Distributed Tracing:** OpenTelemetry + Jaeger
- **Alerting:** Prometheus AlertManager with multi-channel notifications
- **Health Checks:** Standardized endpoints for all services

## Directory Structure

```
monitoring/
├── prometheus/                    # Prometheus configuration
│   ├── prometheus.yml            # Main scrape config
│   └── alert_rules.yml           # Alert rule definitions
├── grafana/                      # Grafana configuration
│   ├── provisioning/
│   │   ├── datasources.yml       # Data source definitions
│   │   └── dashboards.yml        # Dashboard provisioning
│   └── dashboards/
│       ├── email-service-overview.json
│       └── system-resources.json
├── alertmanager/                 # Alert routing & notifications
│   └── alertmanager.yml
├── logstash/                     # Log processing pipelines
│   ├── logstash.conf
│   └── email-service-template.json
├── opentelemetry/                # Distributed tracing
│   └── otel-collector-config.yml
├── loki/                         # Log aggregation (optional)
│   └── loki-config.yml
├── docker-compose.monitoring.yml # Full monitoring stack
├── HEALTH_ENDPOINTS.md          # Health check specifications
├── PERFORMANCE_BASELINES.md     # Expected metrics & thresholds
└── README.md                    # This file
```

## Quick Start

### 1. Start Monitoring Stack

```bash
# From project root
cd deployment/monitoring

# Create external network if not exists
docker network create emailclient-net || true

# Start monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

# Verify all services are running
docker-compose -f docker-compose.monitoring.yml ps
```

### 2. Access Web UIs

| Service | URL | Default Credentials |
|---------|-----|-------------------|
| **Grafana** | http://localhost:3000 | admin/admin |
| **Prometheus** | http://localhost:9090 | - |
| **Alertmanager** | http://localhost:9093 | - |
| **Kibana** | http://localhost:5601 | elastic/changeme |
| **Jaeger** | http://localhost:16686 | - |

### 3. Configure Notifications

Edit `alertmanager/alertmanager.yml` with your notification settings:

```yaml
# Slack notifications
global:
  slack_api_url: https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# PagerDuty for critical alerts
receivers:
  - name: critical-ops
    pagerduty_configs:
      - service_key: YOUR_SERVICE_KEY
```

### 4. Create Custom Dashboards

Grafana dashboards are provisioned from `grafana/dashboards/`.

**Add new dashboard:**
1. Design in Grafana UI
2. Export as JSON
3. Save to `grafana/dashboards/`
4. Restart Grafana to auto-load

## Key Features

### Metrics & Monitoring

**Prometheus collects metrics from:**
- Email Service (Flask + Gunicorn)
- Celery workers & beat scheduler
- PostgreSQL database
- Redis cache/broker
- Postfix SMTP server
- Dovecot IMAP/POP3 server
- Docker containers (cAdvisor)
- System resources (Node Exporter)

**Key metrics tracked:**
- Request latency (P50, P95, P99)
- Error rates (4xx, 5xx)
- Queue depth (Celery tasks)
- Database connections & queries
- Cache hit rates & memory usage
- Mail queue depth (Postfix)
- IMAP/POP3 active sessions

### Alert Rules

**Infrastructure Alerts:**
- CPU usage > 80% for 5 minutes
- Memory usage > 85% for 5 minutes
- Disk usage > 85% for 10 minutes
- Out of memory (< 5% available)

**Database Alerts:**
- Connection pool > 80% capacity
- Replication lag > 10 seconds
- Long-running queries (> 5 minutes)
- Database size > 5 GB

**Cache Alerts:**
- Redis memory > 85% of max
- Client connections > 1000
- Key evictions detected
- Command latency P99 > 100ms

**Application Alerts:**
- Email Service down (2 minutes)
- Error rate > 5% for 3 minutes
- Request latency P99 > 2 seconds
- DB connection pool > 80%
- IMAP pool > 90% utilized
- SMTP pool > 90% utilized

**Task Queue Alerts:**
- Queue backup > 1000 pending tasks
- Task failure rate > 10% for 5 minutes
- Worker offline
- Celery Beat not running

**Email Server Alerts:**
- Postfix down
- Mail queue > 100 messages
- Dovecot down
- IMAP connection errors elevated

### Log Aggregation

**ELK Stack components:**
- **Elasticsearch:** Central log storage & search
- **Logstash:** Parse, enrich, and forward logs
- **Kibana:** Log search and analysis interface

**Log sources:**
- Email Service application logs
- Celery task execution logs
- PostgreSQL query logs
- Postfix SMTP logs
- Dovecot IMAP/POP3 logs
- Container stdout/stderr
- Syslog messages

**Log indexing:** Logs automatically indexed by type and timestamp
- `logs-email-service-YYYY.MM.dd`
- `logs-celery-worker-YYYY.MM.dd`
- `logs-postgresql-YYYY.MM.dd`
- `logs-postfix-YYYY.MM.dd`
- `logs-dovecot-YYYY.MM.dd`

### Distributed Tracing

**OpenTelemetry Collector receives traces from:**
- OTLP protocol (gRPC + HTTP)
- Jaeger format
- Zipkin format

**Jaeger features:**
- Trace visualization across service boundaries
- Latency analysis by service
- Error tracking with full stack traces
- Dependency graph analysis

### Health Checks

All services expose `/health` endpoints:

```bash
curl http://email-service:5000/health | jq
curl http://prometheus:9090/-/healthy
curl http://elasticsearch:9200/_cluster/health
```

See [HEALTH_ENDPOINTS.md](./HEALTH_ENDPOINTS.md) for detailed specifications.

## Configuration

### Environment Variables

Create `.env` file in `deployment/` directory:

```bash
# Elasticsearch
ELASTICSEARCH_PASSWORD=your-secure-password

# Grafana
GRAFANA_USER=admin
GRAFANA_PASSWORD=your-secure-password

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
PAGERDUTY_SERVICE_KEY=...
OPSGENIE_API_KEY=...
EMAIL_PASSWORD=...
```

### Customizing Alert Rules

Edit `prometheus/alert_rules.yml` to:

1. **Adjust thresholds:**
   ```yaml
   - alert: HighCPUUsage
     expr: (100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)) > 80
     for: 5m
   ```

2. **Add new alert:**
   ```yaml
   - alert: MyCustomAlert
     expr: your_metric > threshold
     for: 5m
     annotations:
       summary: "Description"
   ```

3. **Reload alerts:**
   ```bash
   curl -X POST http://localhost:9090/-/reload
   ```

### Customizing Dashboards

**Grafana provisioning files:**
- `grafana/provisioning/datasources.yml` - Data source configuration
- `grafana/provisioning/dashboards.yml` - Dashboard location config

**Dashboard JSON files:**
- `grafana/dashboards/email-service-overview.json`
- `grafana/dashboards/system-resources.json`

To add new dashboard:
1. Create in Grafana UI
2. Export JSON
3. Save to `grafana/dashboards/`
4. Restart Grafana

## Performance Baselines

See [PERFORMANCE_BASELINES.md](./PERFORMANCE_BASELINES.md) for:
- Expected response times
- Normal resource usage
- Typical error rates
- Queue depth patterns
- Database query times
- Cache hit rates

## Troubleshooting

### Prometheus Not Scraping Metrics

1. Check service is running: `docker-compose ps`
2. Verify targets: http://localhost:9090/targets
3. Check prometheus.yml for syntax errors: `docker-compose logs prometheus`
4. Ensure network connectivity: `docker exec emailclient-prometheus curl http://email-service:5000/metrics`

### Kibana Not Showing Logs

1. Check Elasticsearch is running: http://localhost:9200/_cluster/health
2. Verify Logstash is processing: `docker-compose logs logstash`
3. Check indices were created: `curl http://localhost:9200/_cat/indices`
4. Inspect Logstash config: `docker-compose logs logstash | grep -i error`

### Alerts Not Firing

1. Check rule syntax: http://localhost:9090/alerts
2. Verify data is being scraped: http://localhost:9090/graph
3. Check alert evaluation: Look at Prometheus logs
4. Test alert manually: `docker-compose logs alertmanager`

### High Memory Usage

1. Check Elasticsearch heap: `curl http://localhost:9200/_nodes/stats | jq '.nodes[].jvm.mem.heap_used_in_bytes'`
2. Reduce retention: Edit `prometheus/prometheus.yml` `retention.time`
3. Scale horizontally: Add more Logstash instances
4. Monitor with: http://localhost:3000/d/system-resources

## Scaling Considerations

### Single Node (Development)

Current setup suitable for:
- < 10 services
- < 1000 metrics per service
- < 100 GB logs per day
- < 100 events per second

### Multi-Node (Production)

For production scaling:

1. **Separate Elasticsearch cluster**
   ```yaml
   elasticsearch:
     discovery.type: multi-node
     cluster.name: emailclient
     node.roles: [data, master]
   ```

2. **Add more Logstash workers**
   ```yaml
   logstash:
     scale: 3
   ```

3. **Use remote Prometheus storage**
   ```yaml
   remote_write:
     - url: http://victoriametrics:8428/api/v1/write
   ```

4. **Separate monitoring network**
   - Keep monitoring on isolated network
   - Use VPN for remote monitoring

## Maintenance

### Weekly Tasks

- Review alert firing patterns in Alertmanager
- Check disk usage on monitoring nodes
- Verify log ingestion rate in Kibana
- Spot-check dashboard accuracy

### Monthly Tasks

- Review and optimize alert thresholds
- Archive old logs to cold storage
- Update Prometheus retention policies
- Performance analysis & optimization

### Quarterly Tasks

- Full system backup (Elasticsearch indices, Grafana dashboards)
- Security audit of alerting credentials
- Capacity planning for next quarter
- Major version updates for monitoring stack

## Security

### Authentication

**Grafana:**
- Change default admin password
- Enable LDAP/SAML integration for enterprise

**Elasticsearch:**
- Use strong password (not shown in configs)
- Enable TLS/SSL for inter-node communication
- Restrict Kibana access via reverse proxy

### Network Security

- Keep monitoring on isolated network
- Use firewall rules to restrict access
- No public internet access to monitoring UIs
- VPN for remote access

### Credentials Management

```bash
# Store sensitive values in .env
ELASTICSEARCH_PASSWORD=generated-secure-password
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Never commit .env to git
echo ".env" >> .gitignore
```

## Backup & Recovery

### Daily Backup

```bash
# Backup Elasticsearch indices
curl -X PUT "localhost:9200/_snapshot/backup" -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/mnt/backup/elasticsearch"
  }
}'

# Backup Grafana dashboards
docker exec emailclient-grafana grafana-cli admin export-dashboard /var/lib/grafana/backup
```

### Restore from Backup

```bash
# Restore Elasticsearch indices
curl -X POST "localhost:9200/_snapshot/backup/my-snapshot/_restore"

# Restore Grafana dashboards
docker exec emailclient-grafana grafana-cli admin import-dashboard /var/lib/grafana/backup
```

## Documentation References

- [Health Endpoints](./HEALTH_ENDPOINTS.md) - Service health check specs
- [Performance Baselines](./PERFORMANCE_BASELINES.md) - Expected metrics & thresholds
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [ELK Stack Guide](https://www.elastic.co/guide/)
- [OpenTelemetry Guide](https://opentelemetry.io/docs/)

## Support & Issues

**Common Issues:**
1. Service discovery not finding services → Check DNS/hostnames in prometheus.yml
2. High cardinality metrics → Add metric relabel rules to drop high-cardinality labels
3. Slow Elasticsearch → Reduce shard count or add more nodes
4. Missing logs → Verify Logstash pipeline config and input sources

**Getting Help:**
- Check service logs: `docker-compose logs [service-name]`
- Review alert history in Alertmanager: http://localhost:9093
- Check Prometheus targets: http://localhost:9090/targets
- Query metrics directly: http://localhost:9090/graph
