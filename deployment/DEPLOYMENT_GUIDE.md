# MetaBuilder Deployment Guide

Complete guide for deploying MetaBuilder in various environments.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Deployment Stacks](#deployment-stacks)
4. [Bootstrap Process](#bootstrap-process)
5. [Monitoring & Observability](#monitoring--observability)
6. [Backup & Recovery](#backup--recovery)
7. [Scaling & High Availability](#scaling--high-availability)
8. [Security Hardening](#security-hardening)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

### One-Command Deployment (Development)

```bash
# Clone and deploy everything
git clone <repo>
cd metabuilder

# Start full development stack
docker-compose \
  -f deployment/docker/docker-compose.development.yml \
  -f deployment/docker/docker-compose.monitoring.yml \
  up -d

# Bootstrap the system
docker-compose -f deployment/docker/docker-compose.development.yml \
  exec metabuilder-tools /app/scripts/bootstrap-system.sh

# Access services
open http://localhost:5173  # App
open http://localhost:3001  # Grafana
```

### One-Command Deployment (Production)

```bash
# Configure environment
cp deployment/env/.env.production.example .env
vim .env  # Set passwords and secrets

# Deploy production stack
docker-compose \
  -f deployment/docker/docker-compose.production.yml \
  -f deployment/docker/docker-compose.monitoring.yml \
  up -d

# Bootstrap
docker-compose -f deployment/docker/docker-compose.production.yml \
  exec metabuilder-tools /app/scripts/bootstrap-system.sh --env production

# Access
open https://your-domain.com
```

---

## Architecture Overview

### Services

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer / CDN                   │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │   Nginx (SSL/TLS)   │
          └──────────┬──────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
┌────▼─────┐  ┌─────▼──────┐  ┌────▼─────┐
│ Next.js  │  │    DBAL    │  │  Media   │
│   App    │  │   Daemon   │  │  Daemon  │
│ (Node.js)│  │    (C++)   │  │  (C++)   │
└────┬─────┘  └─────┬──────┘  └────┬─────┘
     │              │               │
     └──────────────┼───────────────┘
                    │
     ┌──────────────┼──────────────┐
     │              │              │
┌────▼──────┐  ┌───▼────┐   ┌────▼────┐
│ PostgreSQL│  │ Redis  │   │ Icecast │
│    DB     │  │ Cache  │   │ (Radio) │
└───────────┘  └────────┘   └─────────┘

Monitoring Layer:
┌──────────────────────────────────────┐
│ Prometheus → Grafana → Alertmanager │
│ Loki → Promtail (Logs)              │
└──────────────────────────────────────┘
```

### Ports (Default Configuration)

| Service | Development | Production | Description |
|---------|------------|------------|-------------|
| Next.js App | 5173 | 3000 | Frontend & API |
| DBAL Daemon | 8081 | 8080 | Database layer |
| Media Daemon | 8090 | 8090 | Media processing |
| PostgreSQL | 5433 | 5432 | Database |
| Redis | 6380 | 6379 | Cache |
| Nginx | - | 80/443 | Reverse proxy |
| Icecast | 8000 | 8000 | Radio streaming |
| HLS Streaming | 8088 | 8088 | Video streaming |
| Prometheus | 9090 | 9090 | Metrics |
| Grafana | 3001 | 3001 | Dashboards |
| Loki | 3100 | 3100 | Logs |

---

## Deployment Stacks

### 1. Core Application Stack

**File**: [`docker/docker-compose.production.yml`](docker/docker-compose.production.yml)

**Services**:
- PostgreSQL (database)
- DBAL Daemon (C++ database abstraction)
- MetaBuilder App (Next.js frontend/API)
- Nginx (reverse proxy with SSL)
- Redis (caching)
- Media Daemon (media processing)
- Icecast (radio streaming)
- HLS Server (video streaming)

**Start**:
```bash
docker-compose -f deployment/docker/docker-compose.production.yml up -d
```

### 2. Monitoring Stack

**File**: [`docker/docker-compose.monitoring.yml`](docker/docker-compose.monitoring.yml)

**Services**:
- Prometheus (metrics collection)
- Grafana (visualization)
- Loki (log aggregation)
- Promtail (log shipper)
- Node Exporter (host metrics)
- Postgres Exporter (DB metrics)
- Redis Exporter (cache metrics)
- cAdvisor (container metrics)
- Alertmanager (alert routing)

**Start**:
```bash
docker-compose -f deployment/docker/docker-compose.monitoring.yml up -d
```

### 3. Development Stack

**File**: [`docker/docker-compose.development.yml`](docker/docker-compose.development.yml)

**Additional Services**:
- Adminer (database UI)
- Redis Commander (cache UI)
- Mailhog (email testing)

**Features**:
- Hot reload enabled
- Debug logging
- Interactive DBAL mode
- Development tools pre-installed

**Start**:
```bash
docker-compose -f deployment/docker/docker-compose.development.yml up
```

### 4. CLI & Tools Container

**Dockerfiles**:
- [`Dockerfile.cli`](docker/Dockerfile.cli) - Standalone CLI
- [`Dockerfile.tools`](docker/Dockerfile.tools) - Admin tools + CLI

**Usage**:
```bash
# Build tools container
docker build -f deployment/docker/Dockerfile.tools -t metabuilder-tools .

# Run CLI command
docker run --rm --network metabuilder_metabuilder-network \
  metabuilder-tools metabuilder-cli package list

# Interactive shell
docker run -it --rm --network metabuilder_metabuilder-network \
  metabuilder-tools /bin/bash
```

---

## Bootstrap Process

The bootstrap process initializes the MetaBuilder system with core packages and configuration.

### What It Does

1. **Database Setup**
   - Waits for PostgreSQL to be ready
   - Runs Prisma migrations
   - Generates Prisma client

2. **Seed Data**
   - Inserts `InstalledPackage` records
   - Inserts `PackagePermission` records
   - Sets up default configuration

3. **Package Installation**
   - Installs core packages in priority order:
     1. package_manager
     2. ui_header, ui_footer, ui_auth, ui_login
     3. dashboard
     4. user_manager, role_editor
     5. admin_dialog, database_manager, schema_editor

4. **Verification**
   - Validates database connectivity
   - Verifies package installation
   - Runs health checks

### Manual Bootstrap

```bash
# Using tools container
docker-compose -f deployment/docker/docker-compose.production.yml \
  run --rm metabuilder-tools /app/scripts/bootstrap-system.sh

# With options
docker-compose -f deployment/docker/docker-compose.production.yml \
  run --rm metabuilder-tools \
  /app/scripts/bootstrap-system.sh --env production --force
```

### Bootstrap Script

**Location**: [`scripts/bootstrap-system.sh`](scripts/bootstrap-system.sh)

**Options**:
- `--force` - Re-bootstrap even if already initialized
- `--env [production|development]` - Environment mode

**Logs**: `seed/logs/bootstrap-YYYYMMDD_HHMMSS.log`

### Automated Bootstrap on First Run

Add to `docker-compose.yml`:

```yaml
metabuilder-tools:
  build:
    context: ..
    dockerfile: deployment/docker/Dockerfile.tools
  container_name: metabuilder-tools
  depends_on:
    postgres:
      condition: service_healthy
    dbal-daemon:
      condition: service_healthy
  command: /app/scripts/bootstrap-system.sh --env production
  restart: "no"
  networks:
    - metabuilder-network
```

---

## Monitoring & Observability

### Grafana Dashboards

**Access**: http://localhost:3001
**Default Credentials**: admin/admin (change immediately)

**Pre-configured Dashboards**:
1. **System Overview** - All services health
2. **Application Metrics** - Next.js app performance
3. **Database Performance** - PostgreSQL metrics
4. **DBAL Performance** - C++ daemon metrics
5. **Media Processing** - Media daemon stats
6. **Container Resources** - Docker container usage
7. **Network Traffic** - Nginx metrics

### Metrics Endpoints

Configure your services to expose metrics:

```typescript
// Next.js (frontends/nextjs/src/app/api/metrics/route.ts)
import { register } from 'prom-client';

export async function GET() {
  return new Response(await register.metrics(), {
    headers: { 'Content-Type': register.contentType },
  });
}
```

### Log Aggregation

**Loki** collects logs from all services via **Promtail**.

**Query logs in Grafana**:
```logql
{container_name="metabuilder-app-prod"} |= "ERROR"
{job="dbal-daemon"} | json | line_format "{{.message}}"
```

### Alerts

Configure alerts in [`config/prometheus/alerts.yml`](config/prometheus/alerts.yml):

```yaml
groups:
  - name: metabuilder
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"

      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        annotations:
          summary: "PostgreSQL is down"
```

---

## Backup & Recovery

### Automated Backups

**Script**: [`scripts/backup-database.sh`](scripts/backup-database.sh)

**Schedule with cron**:
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup-database.sh --retention-days 30
```

**Docker-based backup**:
```bash
# Add to docker-compose.yml
backup:
  image: postgres:16-alpine
  container_name: metabuilder-backup
  environment:
    DATABASE_URL: ${DATABASE_URL}
  volumes:
    - ./backups:/backups
    - ./deployment/scripts:/scripts:ro
  command: /scripts/backup-database.sh
  restart: "no"
```

### Manual Backup

```bash
# Production
docker-compose -f deployment/docker/docker-compose.production.yml exec postgres \
  pg_dump -U metabuilder metabuilder | gzip > backup_$(date +%Y%m%d).sql.gz

# Development
docker-compose -f deployment/docker/docker-compose.development.yml exec postgres \
  pg_dump -U metabuilder metabuilder_dev | gzip > backup_dev_$(date +%Y%m%d).sql.gz
```

### Restore Database

```bash
# Stop application
docker-compose -f deployment/docker/docker-compose.production.yml stop metabuilder-app

# Restore
gunzip -c backup.sql.gz | docker-compose -f deployment/docker/docker-compose.production.yml \
  exec -T postgres psql -U metabuilder metabuilder

# Restart
docker-compose -f deployment/docker/docker-compose.production.yml start metabuilder-app
```

### Volume Backups

```bash
# Backup all volumes
docker run --rm \
  -v metabuilder_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz /data

# Restore
docker run --rm \
  -v metabuilder_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/postgres_data_YYYYMMDD.tar.gz -C /
```

---

## Scaling & High Availability

### Horizontal Scaling (Docker Swarm)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c deployment/docker/docker-compose.production.yml metabuilder

# Scale app
docker service scale metabuilder_metabuilder-app=5

# Scale DBAL daemon
docker service scale metabuilder_dbal-daemon=3
```

### Load Balancing

Update Nginx configuration for upstream load balancing:

```nginx
upstream metabuilder_app {
    least_conn;
    server metabuilder-app-1:3000;
    server metabuilder-app-2:3000;
    server metabuilder-app-3:3000;
}

upstream dbal_daemon {
    least_conn;
    server dbal-daemon-1:8080;
    server dbal-daemon-2:8080;
}
```

### Database Replication

Use PostgreSQL replication for read replicas:

```yaml
postgres-replica:
  image: postgres:16-alpine
  environment:
    POSTGRES_PRIMARY_HOST: postgres
    POSTGRES_PRIMARY_PORT: 5432
  command: >
    sh -c "until pg_basebackup -h postgres -D /var/lib/postgresql/data -U replicator -Fp -Xs -P -R; do
      sleep 5;
    done && postgres"
```

### Redis Clustering

Deploy Redis Sentinel or Cluster for cache high availability.

---

## Security Hardening

### Production Checklist

- [ ] Change all default passwords
- [ ] Use strong secrets (32+ characters)
- [ ] Configure SSL certificates
- [ ] Set `NODE_ENV=production`
- [ ] Enable firewall rules
- [ ] Configure rate limiting
- [ ] Restrict CORS origins
- [ ] Enable HTTPS redirect
- [ ] Use Docker secrets
- [ ] Regular security updates
- [ ] Audit logs enabled
- [ ] Intrusion detection
- [ ] Backup encryption

### Environment Variables Security

Use Docker secrets instead of environment variables:

```bash
# Create secrets
echo "my_secure_password" | docker secret create db_password -

# Reference in compose
services:
  postgres:
    secrets:
      - db_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
```

### Network Isolation

```yaml
networks:
  frontend:
    driver: overlay
  backend:
    driver: overlay
    internal: true  # No internet access

services:
  nginx:
    networks:
      - frontend
  metabuilder-app:
    networks:
      - frontend
      - backend
  postgres:
    networks:
      - backend  # Database isolated
```

---

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check database status
docker-compose -f deployment/docker/docker-compose.production.yml exec postgres pg_isready

# View logs
docker-compose -f deployment/docker/docker-compose.production.yml logs postgres

# Test connection
docker-compose -f deployment/docker/docker-compose.production.yml exec postgres \
  psql -U metabuilder -d metabuilder -c "SELECT version();"
```

**2. DBAL Daemon Not Responding**
```bash
# Check health
curl http://localhost:8080/health

# View logs
docker-compose -f deployment/docker/docker-compose.production.yml logs dbal-daemon

# Restart
docker-compose -f deployment/docker/docker-compose.production.yml restart dbal-daemon
```

**3. Bootstrap Failed**
```bash
# Check logs
cat seed/logs/bootstrap-*.log

# Re-run with force
docker-compose -f deployment/docker/docker-compose.production.yml \
  run --rm metabuilder-tools \
  /app/scripts/bootstrap-system.sh --force --env production
```

**4. Port Already in Use**
```bash
# Find process
sudo lsof -i :5432

# Change port in docker-compose.yml
ports:
  - "5433:5432"
```

**5. Out of Disk Space**
```bash
# Check Docker disk usage
docker system df

# Clean up
docker system prune -a --volumes

# Remove old images
docker image prune -a
```

### Health Checks

```bash
# All services
docker-compose -f deployment/docker/docker-compose.production.yml ps

# Individual health
curl http://localhost:3000/  # App
curl http://localhost:8080/health  # DBAL
curl http://localhost:8090/health  # Media
curl http://localhost:9090/-/healthy  # Prometheus
```

### Performance Debugging

```bash
# Container stats
docker stats

# Container top
docker top metabuilder-app-prod

# Logs with timestamps
docker-compose -f deployment/docker/docker-compose.production.yml logs -t -f

# Network inspection
docker network inspect metabuilder_metabuilder-network
```

---

## Additional Resources

- [Main README](../README.md) - Project overview
- [Seed System](../seed/README.md) - Bootstrap and package installation
- [DBAL Documentation](../dbal/README.md) - Database abstraction layer
- [Package System](../README.md#package-system) - Package architecture
- [CLI Documentation](../frontends/cli/README.md) - Command-line interface

---

**Last Updated**: 2026-01-03
**Version**: 1.0
**Generated with Claude Code**
