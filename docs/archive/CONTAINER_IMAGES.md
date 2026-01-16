# MetaBuilder Container Images

MetaBuilder provides official container images hosted on GitHub Container Registry (GHCR) for easy deployment.

## Available Images

### 1. Next.js App (`ghcr.io/johndoe6345789/metabuilder/nextjs-app`)
The main MetaBuilder web application built with Next.js.

**Features:**
- Multi-architecture support (amd64, arm64)
- Standalone output for minimal image size
- Built-in health checks
- Non-root user for security
- DBAL types pre-generated

**Tags:**
- `latest` - Latest stable build from main branch
- `develop` - Latest development build
- `v*.*.*` - Semantic version tags
- `main-<sha>` - Specific commit from main branch

### 2. DBAL Daemon (`ghcr.io/johndoe6345789/metabuilder/dbal-daemon`)
The secure C++ DBAL daemon for production deployments.

**Features:**
- Multi-architecture support (amd64, arm64)
- Process isolation for security
- Connection pooling
- Row-level security enforcement

## Quick Start

### Using Docker Compose with GHCR Images

```bash
# Pull and start all services
docker compose -f docker-compose.ghcr.yml up -d

# With monitoring stack
docker compose -f docker-compose.ghcr.yml --profile monitoring up -d

# Stop services
docker compose -f docker-compose.ghcr.yml down

# View logs
docker compose -f docker-compose.ghcr.yml logs -f
```

### Running Individual Containers

```bash
# Run Next.js app
docker run -d \
  --name metabuilder-nextjs \
  -p 3000:3000 \
  -e DATABASE_URL=file:/app/data/metabuilder.db \
  -v metabuilder-data:/app/data \
  ghcr.io/johndoe6345789/metabuilder/nextjs-app:latest

# Run DBAL daemon
docker run -d \
  --name metabuilder-dbal \
  -p 8080:8080 \
  -p 50051:50051 \
  -e DATABASE_URL=file:/app/data/metabuilder.db \
  -v metabuilder-data:/app/data \
  ghcr.io/johndoe6345789/metabuilder/dbal-daemon:latest
```

## Authentication

To pull images from GHCR, you need a GitHub Personal Access Token with `read:packages` scope:

```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull an image
docker pull ghcr.io/johndoe6345789/metabuilder/nextjs-app:latest
```

## Building Images Locally

```bash
# Build Next.js app
docker build -f frontends/nextjs/Dockerfile -t metabuilder/nextjs-app:local .

# Build with specific platform
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f frontends/nextjs/Dockerfile \
  -t metabuilder/nextjs-app:local .
```

## Environment Variables

### Next.js App
- `DATABASE_URL` - Database connection string
- `DBAL_API_URL` - DBAL daemon API URL (default: `http://localhost:8080`)
- `DBAL_WS_URL` - DBAL daemon WebSocket URL (default: `ws://localhost:50051`)
- `NEXTAUTH_SECRET` - NextAuth secret for session encryption
- `NODE_ENV` - Environment mode (production/development)

### DBAL Daemon
- `DATABASE_URL` - Database connection string
- `LOG_LEVEL` - Logging level (debug/info/warn/error)
- `ENABLE_METRICS` - Enable Prometheus metrics (true/false)
- `MAX_CONNECTIONS` - Maximum database connections

## Health Checks

Both images include health checks:

```bash
# Check Next.js app health
curl http://localhost:3000/api/health

# Check DBAL daemon health
curl http://localhost:8080/health
```

## Security

### Image Scanning
All images are automatically scanned for vulnerabilities using Trivy during the CI/CD pipeline. Results are available in the GitHub Security tab.

### Attestations
Build provenance attestations are generated for all images pushed to GHCR, ensuring supply chain security.

### Non-Root Users
All containers run as non-root users:
- Next.js app runs as user `nextjs` (UID 1001)
- DBAL daemon runs as user `dbal` (UID 1000)

## Monitoring

When using the monitoring profile:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

## Volumes

- `metabuilder-data` - Persistent database and application data
- `dbal-logs` - DBAL daemon logs
- `prometheus-data` - Prometheus metrics storage
- `grafana-data` - Grafana dashboards and settings

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs metabuilder-nextjs
docker logs metabuilder-dbal

# Check health status
docker inspect --format='{{json .State.Health}}' metabuilder-nextjs
```

### Permission issues
```bash
# Ensure volumes have correct permissions
docker volume inspect metabuilder-data
```

### Network connectivity
```bash
# Test network connectivity between containers
docker compose -f docker-compose.ghcr.yml exec nextjs-app curl http://dbal-daemon:8080/health
```

## CI/CD Integration

Images are automatically built and pushed on:
- Push to `main` or `develop` branches
- New version tags (`v*.*.*`)
- Manual workflow dispatch

See `.github/workflows/container-build.yml` for the complete workflow.

## Support

For issues related to container images, please open an issue in the MetaBuilder repository with:
- Image tag being used
- Docker/Podman version
- Platform (amd64/arm64)
- Container logs
- docker-compose.yml configuration (if applicable)
