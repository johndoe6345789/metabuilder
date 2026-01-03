# DBAL Daemon Docker Deployment Guide

## Quick Start

### Build the Docker Image

```bash
cd dbal/production
docker build -t dbal-daemon:latest .
```

Note: The Dockerfile uses Conan to fetch build dependencies (including Drogon). Ensure the build environment has network access.

### Run with Docker

```bash
# Basic run
docker run -p 8080:8080 dbal-daemon:latest

# With environment variables
docker run -p 8080:8080 \
  -e DBAL_LOG_LEVEL=debug \
  -e DBAL_MODE=development \
  dbal-daemon:latest

# With custom config
docker run -p 8080:8080 \
  -v $(pwd)/config.yaml:/app/config.yaml:ro \
  dbal-daemon:latest
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f dbal

# Stop services
docker-compose down
```

## Environment Variables

The daemon supports the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DBAL_BIND_ADDRESS` | `0.0.0.0` | Bind address (use 0.0.0.0 in Docker) |
| `DBAL_PORT` | `8080` | Port number |
| `DBAL_LOG_LEVEL` | `info` | Log level (trace/debug/info/warn/error/critical) |
| `DBAL_MODE` | `production` | Run mode (production/development) |
| `DBAL_CONFIG` | `/app/config.yaml` | Configuration file path |
| `DBAL_DAEMON` | `true` | Run in daemon mode (Docker default) |

## Production Deployment

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dbal-daemon
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dbal
  template:
    metadata:
      labels:
        app: dbal
    spec:
      containers:
      - name: dbal
        image: dbal-daemon:latest
        ports:
        - containerPort: 8080
        env:
        - name: DBAL_BIND_ADDRESS
          value: "0.0.0.0"
        - name: DBAL_LOG_LEVEL
          value: "info"
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
          requests:
            cpu: "100m"
            memory: "128Mi"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: dbal-service
spec:
  selector:
    app: dbal
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

### Docker Swarm Deployment

```bash
# Create overlay network
docker network create --driver overlay dbal-network

# Deploy stack
docker stack deploy -c docker-compose.yml dbal

# Scale service
docker service scale dbal_dbal=5

# View services
docker stack services dbal
```

## Multi-Stage Build

The Dockerfile uses multi-stage builds for:
- **Smaller image size**: Runtime image ~50MB vs build ~500MB
- **Security**: Only runtime dependencies in final image
- **Speed**: Build cache optimization

## Security Best Practices

1. **Non-root user**: Daemon runs as user `dbal` (UID 1000)
2. **Minimal base**: Ubuntu 22.04 with only required packages
3. **Read-only config**: Mount config.yaml as read-only
4. **Network isolation**: Use Docker networks
5. **Resource limits**: Set CPU and memory limits

## Health Checks

The container includes a health check that:
- Checks `/health` endpoint every 30 seconds
- Waits 5 seconds before first check
- Marks unhealthy after 3 failed attempts

## Logging

View logs:

```bash
# Docker
docker logs -f <container_id>

# Docker Compose
docker-compose logs -f dbal

# Kubernetes
kubectl logs -f deployment/dbal-daemon

# With log level
docker run -e DBAL_LOG_LEVEL=debug dbal-daemon:latest
```

## Volumes

Mount persistent data:

```bash
docker run -p 8080:8080 \
  -v /path/to/config.yaml:/app/config.yaml:ro \
  -v /path/to/data:/app/data \
  dbal-daemon:latest
```

## Behind Nginx Reverse Proxy

The daemon is designed to run behind nginx for:
- SSL/TLS termination
- Load balancing
- Rate limiting
- Caching

See `NGINX_INTEGRATION.md` for nginx configuration examples.

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs <container_id>

# Run interactively
docker run -it --entrypoint /bin/bash dbal-daemon:latest

# Check health
docker inspect --format='{{.State.Health.Status}}' <container_id>
```

### Port already in use

```bash
# Use different port
docker run -p 8081:8080 dbal-daemon:latest

# Or set via environment
docker run -p 8081:8081 -e DBAL_PORT=8081 dbal-daemon:latest
```

### Permission denied

```bash
# Check file ownership
ls -la /path/to/config.yaml

# Fix ownership (config should be readable by UID 1000)
chown 1000:1000 /path/to/config.yaml
```

## Building for Multiple Platforms

```bash
# Enable buildx
docker buildx create --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  -t dbal-daemon:latest \
  --push .
```

## Development

For development, use interactive mode:

```bash
docker run -it \
  -e DBAL_DAEMON=false \
  -e DBAL_LOG_LEVEL=debug \
  --entrypoint ./dbal_daemon \
  dbal-daemon:latest
```

This gives you the interactive command prompt for debugging.
