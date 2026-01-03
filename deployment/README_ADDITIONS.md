# Additional Deployment Components

**Note**: These additions complement the main [README.md](README.md)

## New Services & Features

### 1. CLI & Admin Tools Container

**Dockerfiles**:
- [`docker/Dockerfile.cli`](docker/Dockerfile.cli) - Standalone MetaBuilder CLI
- [`docker/Dockerfile.tools`](docker/Dockerfile.tools) - Complete admin toolkit

**Build & Run**:
```bash
# Build tools container
docker build -f deployment/docker/Dockerfile.tools -t metabuilder-tools .

# Run CLI commands
docker run --rm --network metabuilder_metabuilder-network \
  metabuilder-tools metabuilder-cli package list

# Interactive admin shell
docker run -it --rm --network metabuilder_metabuilder-network \
  metabuilder-tools /bin/bash
```

**Included Tools**:
- MetaBuilder CLI (C++ binary)
- Node.js tools and Prisma client
- Database migration scripts
- Bootstrap and seed scripts
- PostgreSQL client tools

### 2. System Bootstrap

**Script**: [`scripts/bootstrap-system.sh`](scripts/bootstrap-system.sh)

Automates initial system setup:
1. Database migrations
2. Core package installation
3. Permission system initialization
4. Health verification

**Usage**:
```bash
# Development
./deployment/deploy.sh dev --bootstrap

# Production
./deployment/deploy.sh prod --bootstrap

# Manual
docker-compose -f deployment/docker/docker-compose.production.yml \
  run --rm metabuilder-tools /app/scripts/bootstrap-system.sh --env production
```

See [seed/README.md](../seed/README.md) for details on bootstrap configuration.

### 3. Monitoring Stack

**File**: [`docker/docker-compose.monitoring.yml`](docker/docker-compose.monitoring.yml)

**Services Added**:
- **Prometheus** (port 9090) - Metrics collection
- **Grafana** (port 3001) - Visualization dashboards
- **Loki** (port 3100) - Log aggregation
- **Promtail** - Log shipping
- **Alertmanager** (port 9093) - Alert routing
- **Node Exporter** (port 9100) - Host metrics
- **Postgres Exporter** (port 9187) - Database metrics
- **Redis Exporter** (port 9121) - Cache metrics
- **cAdvisor** (port 8080) - Container metrics

**Start Monitoring**:
```bash
docker-compose -f deployment/docker/docker-compose.monitoring.yml up -d
```

**Access**:
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090
- Alertmanager: http://localhost:9093

### 4. Backup Automation

**Script**: [`scripts/backup-database.sh`](scripts/backup-database.sh)

Automated database backups with compression and retention.

**Manual Backup**:
```bash
./deployment/scripts/backup-database.sh --retention-days 30
```

**Scheduled Backups** (cron):
```bash
# Daily at 2 AM
0 2 * * * /path/to/deployment/scripts/backup-database.sh
```

**Docker-based**:
```bash
docker-compose -f deployment/docker/docker-compose.production.yml \
  run --rm metabuilder-tools /app/scripts/backup-database.sh
```

## Quick Deployment Script

**File**: [`deploy.sh`](deploy.sh)

One-command deployment for all scenarios.

**Usage**:
```bash
# Development (with hot-reload)
./deployment/deploy.sh dev

# Development with bootstrap
./deployment/deploy.sh dev --bootstrap

# Production
./deployment/deploy.sh prod --bootstrap

# Monitoring only
./deployment/deploy.sh monitoring

# Full stack (production + monitoring)
./deployment/deploy.sh all --bootstrap
```

## Updated Directory Structure

```
deployment/
├── README.md                          # Main documentation (original)
├── README_ADDITIONS.md                # This file
├── DEPLOYMENT_GUIDE.md                # Comprehensive deployment guide
├── deploy.sh                          # Quick deployment script
│
├── docker/
│   ├── docker-compose.production.yml  # Production stack (original)
│   ├── docker-compose.development.yml # Development stack (original)
│   ├── docker-compose.monitoring.yml  # NEW: Monitoring stack
│   ├── Dockerfile.app                 # App dockerfile (original)
│   ├── Dockerfile.app.dev             # Dev app dockerfile (original)
│   ├── Dockerfile.cli                 # NEW: CLI-only container
│   └── Dockerfile.tools               # NEW: Admin tools container
│
├── config/
│   ├── dbal/
│   │   └── config.yaml
│   ├── nginx/
│   │   ├── production.conf
│   │   └── ssl/                       # SSL certificates
│   ├── prometheus/                    # NEW: Prometheus config
│   │   ├── prometheus.yml
│   │   └── alerts.yml
│   ├── grafana/                       # NEW: Grafana config
│   │   ├── provisioning/
│   │   │   ├── datasources/
│   │   │   │   └── datasources.yml
│   │   │   └── dashboards/
│   │   └── dashboards/
│   ├── loki/                          # NEW: Loki config
│   │   └── loki-config.yml
│   ├── promtail/                      # NEW: Promtail config
│   │   └── promtail-config.yml
│   └── alertmanager/                  # NEW: Alertmanager config
│       └── alertmanager.yml
│
├── scripts/
│   ├── init-db.sh                     # Original
│   ├── apply-schema-migrations.sh     # Original
│   ├── start.sh                       # Original
│   ├── bootstrap-system.sh            # NEW: System bootstrap
│   └── backup-database.sh             # NEW: Database backup
│
└── env/
    ├── .env.example
    ├── .env.development.example
    ├── .env.production.example
    └── .secrets.example
```

## Integration with Seed System

The deployment system integrates with the new seed bootstrapping system.

**Seed Location**: [`../seed/`](../seed/)

**Key Files**:
- `seed/packages/core-packages.yaml` - Packages to install
- `seed/database/installed_packages.yaml` - Initial DB records
- `seed/database/package_permissions.yaml` - Permission setup
- `seed/config/bootstrap.yaml` - Bootstrap configuration

Bootstrap automatically:
1. Reads seed configuration
2. Installs core packages
3. Sets up permissions
4. Verifies installation

## Environment-Specific Deployment

### Development

**Features**:
- Hot-reload enabled
- Debug logging
- Development tools (Adminer, Mailhog)
- Interactive DBAL mode
- Lower resource limits

**Deploy**:
```bash
./deployment/deploy.sh dev --bootstrap
```

### Production

**Features**:
- Optimized builds
- SSL/TLS enabled
- Resource limits enforced
- Health checks
- Monitoring integrated
- Automated backups

**Deploy**:
```bash
# Configure environment
cp deployment/env/.env.production.example .env
vim .env  # Set passwords!

# Deploy with bootstrap
./deployment/deploy.sh all --bootstrap
```

### Staging

**Hybrid Configuration**:
Use production compose with development settings:

```bash
NODE_ENV=staging \
DBAL_LOG_LEVEL=debug \
docker-compose \
  -f deployment/docker/docker-compose.production.yml \
  -f deployment/docker/docker-compose.monitoring.yml \
  up -d
```

## Monitoring & Observability

### Metrics

All services expose Prometheus-compatible metrics:

- **Next.js App**: `http://localhost:3000/api/metrics`
- **DBAL Daemon**: `http://localhost:8080/metrics`
- **Media Daemon**: `http://localhost:8090/metrics`
- **PostgreSQL**: via `postgres-exporter:9187`
- **Redis**: via `redis-exporter:9121`

### Logs

Centralized log aggregation via Loki:

```bash
# View in Grafana at http://localhost:3001
# Or query directly:
curl -G -s "http://localhost:3100/loki/api/v1/query" \
  --data-urlencode 'query={container_name="metabuilder-app-prod"}'
```

### Alerts

Configure alerts in `config/prometheus/alerts.yml`:
- High error rates
- Service downtime
- Resource exhaustion
- Database issues

Alerts route through Alertmanager to configured channels (email, Slack, PagerDuty).

## Scaling

### Horizontal Scaling (Docker Swarm)

```bash
# Initialize
docker swarm init

# Deploy
docker stack deploy -c deployment/docker/docker-compose.production.yml metabuilder

# Scale services
docker service scale metabuilder_metabuilder-app=5
docker service scale metabuilder_dbal-daemon=3
```

### Kubernetes

While not included yet, the Docker Compose files can be converted to Kubernetes manifests using Kompose:

```bash
kompose convert -f deployment/docker/docker-compose.production.yml
kubectl apply -f .
```

## Security Enhancements

1. **Docker Secrets** - Use instead of environment variables
2. **Network Isolation** - Internal networks for backend services
3. **SSL/TLS** - Automated certificate management
4. **RBAC** - Role-based access control
5. **Audit Logging** - All administrative actions logged

## Troubleshooting

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#troubleshooting) for comprehensive troubleshooting guide.

**Quick checks**:
```bash
# Service health
docker-compose -f deployment/docker/docker-compose.production.yml ps

# View logs
docker-compose -f deployment/docker/docker-compose.production.yml logs -f

# Bootstrap logs
cat ../seed/logs/bootstrap-*.log

# Database connectivity
docker-compose -f deployment/docker/docker-compose.production.yml exec postgres pg_isready
```

## Documentation

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [Main README.md](README.md) - Original deployment documentation
- [Seed README](../seed/README.md) - Bootstrap system documentation
- [CLI Documentation](../frontends/cli/README.md) - CLI tool usage

---

**Last Updated**: 2026-01-03
**Generated with Claude Code**
