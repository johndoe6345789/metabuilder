# WorkflowUI Docker Deployment Guide

## Overview

WorkflowUI is containerized as a multi-stage Docker image combining:
- **Frontend**: Next.js React application (Node.js)
- **Backend**: Python Flask API server
- **Database**: SQLite with persistent volumes
- **SMTP Relay**: Optional email service for notifications

## Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 1GB disk space for images

### Deployment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/metabuilder.git
   cd metabuilder/workflowui
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start services**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - SMTP Admin: http://localhost:8081

5. **Check logs**:
   ```bash
   docker-compose logs -f workflowui
   ```

## Configuration

### Environment Variables

**Required**:
- `NEXTAUTH_SECRET`: JWT secret for NextAuth (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Frontend URL (e.g., `http://localhost:3000`)

**Optional**:
- `NODE_ENV`: `production` or `development` (default: `production`)
- `FLASK_ENV`: `production` or `development` (default: `production`)
- `DATABASE_URL`: SQLite path (default: `file:/app/data/workflows.db`)
- `SMTP_RELAY_HOST`: SMTP relay hostname (default: `smtp-relay`)
- `SMTP_RELAY_PORT`: SMTP relay port (default: `2525`)
- `SMTP_FROM_ADDRESS`: Sender email (default: `noreply@metabuilder.local`)

### Email Configuration (Optional)

To enable email notifications via Gmail:

1. **Create Gmail app password**:
   - Enable 2FA on your Gmail account
   - Generate an app password at: https://myaccount.google.com/apppasswords
   - Copy the 16-character password

2. **Set environment variables**:
   ```bash
   GMAIL_USERNAME=your-email@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   FORWARD_TO=recipient@example.com
   ```

3. **Restart services**:
   ```bash
   docker-compose restart
   ```

## Building Images

### Build Locally

```bash
# Build multi-arch image (requires buildx)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t workflowui:latest \
  .

# Or build single architecture
docker build -t workflowui:latest .
```

### Push to Registry

```bash
# Tag image
docker tag workflowui:latest myregistry.azurecr.io/workflowui:latest

# Push to registry
docker push myregistry.azurecr.io/workflowui:latest
```

## Persistent Data

### Volumes

- **workflowui-data**: SQLite database and application state
- **workflowui-logs**: Application logs

### Backup

```bash
# Backup database
docker-compose exec workflowui tar czf - /app/data | gzip > workflowui-backup.tar.gz

# Restore database
docker-compose exec -T workflowui tar xzf - < workflowui-backup.tar.gz
```

## Networking

### Port Mappings

| Service | Container Port | Host Port | Purpose |
|---------|----------------|-----------|---------|
| WorkflowUI Frontend | 3000 | 3000 | Web application |
| WorkflowUI Backend | 5000 | 5000 | REST API |
| SMTP Relay | 2525 | 2525 | SMTP service |
| SMTP Admin | 8080 | 8081 | Management UI |

### Custom Network

All services connect via `metabuilder-network` bridge network. To use external services:

```yaml
# docker-compose.override.yml
services:
  workflowui:
    extra_hosts:
      - "external-api:host-gateway"
```

## Health Checks

Services include health checks that restart containers if they fail:

```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:3000/api/health
curl http://localhost:5000/api/health
```

## Performance Tuning

### Memory Limits

```yaml
# docker-compose.override.yml
services:
  workflowui:
    mem_limit: 2g
    memswap_limit: 4g
```

### CPU Limits

```yaml
services:
  workflowui:
    cpus: '2.0'
    cpuset: '0,1'
```

### Database Optimization

```bash
# Access backend container
docker-compose exec workflowui /bin/sh

# Optimize database
cd backend
python3 -c "from server_sqlalchemy import db; db.session.execute('VACUUM'); db.session.commit()"
```

## Debugging

### View Logs

```bash
# View all logs
docker-compose logs

# View specific service
docker-compose logs workflowui

# Follow logs in real-time
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100
```

### Access Shell

```bash
# Node.js/Frontend shell
docker-compose exec workflowui sh

# Python/Backend shell
docker-compose exec workflowui python3
```

### Inspect Container

```bash
# View running processes
docker-compose top workflowui

# View resource usage
docker stats

# Inspect network
docker network inspect metabuilder_metabuilder-network
```

## Common Issues

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Change ports in docker-compose.override.yml
services:
  workflowui:
    ports:
      - "3001:3000"
      - "5001:5000"
```

### Container Exits Immediately

```bash
# Check logs
docker-compose logs workflowui

# Rebuild without cache
docker-compose build --no-cache
```

### Database Lock

```bash
# Clear database
docker-compose exec workflowui rm /app/data/workflows.db

# Restart services
docker-compose restart
```

### Out of Memory

```bash
# Reduce container memory
docker-compose down
docker volume prune -f
docker image prune -f
docker-compose up -d
```

## Production Deployment

### Security Checklist

- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Configure real `NEXTAUTH_URL` (not localhost)
- [ ] Enable SSL/TLS (use reverse proxy like Nginx)
- [ ] Configure SMTP credentials securely
- [ ] Use secrets management (Docker Secrets, Vault)
- [ ] Enable authentication on SMTP admin UI
- [ ] Regular database backups
- [ ] Monitor container resource usage
- [ ] Update images regularly

### Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name workflowui.example.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name workflowui.example.com;
    return 301 https://$server_name$request_uri;
}
```

### Docker Secrets

```bash
# Create secrets
echo "your-secret-value" | docker secret create nextauth_secret -

# Use in docker-compose
services:
  workflowui:
    secrets:
      - nextauth_secret
    environment:
      - NEXTAUTH_SECRET_FILE=/run/secrets/nextauth_secret

secrets:
  nextauth_secret:
    external: true
```

## Monitoring

### Prometheus Metrics

Enable Prometheus endpoint (if configured):

```bash
# Check metrics
curl http://localhost:5000/metrics
```

### Container Monitoring

```bash
# Real-time resource usage
watch -n 1 'docker stats --no-stream'

# Historical metrics with Docker events
docker events --filter type=container --format "{{.Action}} {{.Actor.Attributes.name}}"
```

## Troubleshooting

### Rebuild from Scratch

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove images
docker rmi $(docker images -q)

# Rebuild
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

### Connection Issues

```bash
# Test connectivity
docker-compose exec workflowui curl http://localhost:5000/api/health

# Check network
docker network inspect metabuilder_metabuilder-network
```

## Support

For issues and questions:
- Check logs: `docker-compose logs workflowui`
- Create issue: https://github.com/yourusername/metabuilder/issues
- Documentation: https://docs.example.com
