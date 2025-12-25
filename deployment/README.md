# MetaBuilder Deployment

This directory contains production and development deployment configurations for the entire MetaBuilder project.

## 🚀 Quick Start

### Production Deployment

```bash
# 1. Copy and configure environment variables
cp .env.production.example .env
vim .env  # Update with your production values

# 2. Start the entire stack
docker-compose -f deployment/docker-compose.production.yml up -d

# 3. Check status
docker-compose -f deployment/docker-compose.production.yml ps

# 4. View logs
docker-compose -f deployment/docker-compose.production.yml logs -f

# 5. Access services
# - App: https://localhost (or your domain)
# - DBAL API: https://localhost/api/dbal/
```

### Development Deployment

```bash
# 1. Copy development environment
cp .env.development.example .env.development

# 2. Start development stack
docker-compose -f deployment/docker-compose.development.yml up

# 3. Access services
# - App: http://localhost:5173 (Vite dev server with hot-reload)
# - DBAL API: http://localhost:8081
# - Adminer (DB UI): http://localhost:8082
# - Redis Commander: http://localhost:8083
# - Mailhog (Email): http://localhost:8025
```

## 📦 Services

### Production Stack

- **PostgreSQL** - Production database (port 5432)
- **DBAL Daemon** - C++ database abstraction layer (port 8080)
- **MetaBuilder App** - React frontend + API (port 3000)
- **Nginx** - Reverse proxy with SSL (ports 80, 443)
- **Redis** - Cache layer (port 6379)

### Development Stack

- **PostgreSQL** - Development database (port 5433)
- **DBAL Daemon** - C++ DBAL with debug logging (port 8081)
- **MetaBuilder App** - Development server with hot-reload (port 5173)
- **Redis** - Development cache (port 6380)
- **Mailhog** - Email testing UI (SMTP: 1025, Web: 8025)
- **Adminer** - Database management UI (port 8082)
- **Redis Commander** - Redis management UI (port 8083)

## 🔧 Configuration

### Environment Variables

All configuration is done through environment variables. See:
- `.env.production.example` - Production configuration template
- `.env.development.example` - Development configuration template

Key variables:
- `POSTGRES_PASSWORD` - Database password
- `REDIS_PASSWORD` - Redis password (production only)
- `JWT_SECRET` - JWT signing secret
- `DBAL_LOG_LEVEL` - Log level (trace, debug, info, warn, error, critical)
- `NODE_ENV` - Node environment (production, development)

### SSL Certificates (Production)

Place your SSL certificates in `deployment/config/nginx/ssl/`:
- `cert.pem` - SSL certificate
- `key.pem` - Private key

Generate self-signed certificate for testing:
```bash
mkdir -p deployment/config/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout deployment/config/nginx/ssl/key.pem \
  -out deployment/config/nginx/ssl/cert.pem
```

## 🛠️ Management Commands

### Production

```bash
# Start services
docker-compose -f deployment/docker-compose.production.yml up -d

# Stop services
docker-compose -f deployment/docker-compose.production.yml down

# Stop and remove volumes (⚠️ deletes data)
docker-compose -f deployment/docker-compose.production.yml down -v

# Restart a service
docker-compose -f deployment/docker-compose.production.yml restart metabuilder-app

# View logs for specific service
docker-compose -f deployment/docker-compose.production.yml logs -f metabuilder-app

# Execute command in container
docker-compose -f deployment/docker-compose.production.yml exec metabuilder-app sh

# Scale a service (horizontal scaling)
docker-compose -f deployment/docker-compose.production.yml up -d --scale metabuilder-app=3
```

### Development

```bash
# Start services (foreground with logs)
docker-compose -f deployment/docker-compose.development.yml up

# Start services (background)
docker-compose -f deployment/docker-compose.development.yml up -d

# Rebuild and start
docker-compose -f deployment/docker-compose.development.yml up --build

# Stop services
docker-compose -f deployment/docker-compose.development.yml down

# View service logs
docker-compose -f deployment/docker-compose.development.yml logs -f metabuilder-app
```

## 🗄️ Database Management

### Run Migrations

```bash
# Production
docker-compose -f deployment/docker-compose.production.yml exec metabuilder-app npm run db:migrate

# Development
docker-compose -f deployment/docker-compose.development.yml exec metabuilder-app npm run db:migrate
```

### Backup Database

```bash
# Production
docker-compose -f deployment/docker-compose.production.yml exec postgres \
  pg_dump -U metabuilder metabuilder > backup_$(date +%Y%m%d_%H%M%S).sql

# Development
docker-compose -f deployment/docker-compose.development.yml exec postgres \
  pg_dump -U metabuilder metabuilder_dev > backup_dev_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Production
cat backup.sql | docker-compose -f deployment/docker-compose.production.yml exec -T postgres \
  psql -U metabuilder metabuilder

# Development
cat backup.sql | docker-compose -f deployment/docker-compose.development.yml exec -T postgres \
  psql -U metabuilder metabuilder_dev
```

## 🔍 Monitoring & Health Checks

All services have health checks configured. Check service health:

```bash
# Production
docker-compose -f deployment/docker-compose.production.yml ps

# Development
docker-compose -f deployment/docker-compose.development.yml ps
```

Health check endpoints:
- App: `http://localhost:3000/` (production) or `http://localhost:5173/` (dev)
- DBAL: `http://localhost:8080/health` (production) or `http://localhost:8081/health` (dev)
- Nginx: `http://localhost/health`

## 🚢 Production Deployment Options

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c deployment/docker-compose.production.yml metabuilder

# Scale services
docker service scale metabuilder_metabuilder-app=5

# View services
docker stack services metabuilder

# View logs
docker service logs -f metabuilder_metabuilder-app

# Remove stack
docker stack rm metabuilder
```

### Kubernetes

See `deployment/kubernetes/` for Kubernetes manifests (if available).

```bash
# Apply configurations
kubectl apply -f deployment/kubernetes/

# Scale deployment
kubectl scale deployment metabuilder-app --replicas=5

# View pods
kubectl get pods

# View logs
kubectl logs -f deployment/metabuilder-app
```

## 🔒 Security Considerations

### Production Checklist

- [ ] Change all default passwords in `.env`
- [ ] Use strong passwords (minimum 32 characters)
- [ ] Configure SSL certificates properly
- [ ] Set `NODE_ENV=production`
- [ ] Enable firewall rules to restrict access
- [ ] Regular backups configured
- [ ] Monitor logs for security issues
- [ ] Keep Docker images updated
- [ ] Use secrets management (Docker secrets, Kubernetes secrets, etc.)
- [ ] Configure rate limiting in Nginx
- [ ] Enable CORS only for trusted origins

### Network Security

The production stack uses an isolated bridge network (172.20.0.0/16). Only nginx is exposed to the internet. Internal services communicate within the private network.

## 📊 Resource Limits

Resource limits are configured in the production compose file:

| Service | CPU Limit | Memory Limit | CPU Reserve | Memory Reserve |
|---------|-----------|--------------|-------------|----------------|
| PostgreSQL | - | - | - | - |
| DBAL Daemon | 2 | 1GB | 0.5 | 256MB |
| MetaBuilder App | 2 | 2GB | 0.5 | 512MB |
| Nginx | 1 | 512MB | 0.25 | 128MB |
| Redis | 0.5 | 512MB | 0.1 | 128MB |

Adjust these based on your server resources.

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :5432

# Kill process
sudo kill -9 <PID>
```

### Container Won't Start

```bash
# Check logs
docker-compose -f deployment/docker-compose.production.yml logs <service-name>

# Check container status
docker ps -a

# Inspect container
docker inspect <container-name>
```

### Database Connection Issues

```bash
# Test database connection
docker-compose -f deployment/docker-compose.production.yml exec postgres \
  psql -U metabuilder -d metabuilder -c "SELECT version();"

# Check database logs
docker-compose -f deployment/docker-compose.production.yml logs postgres
```

### Rebuild Everything

```bash
# Stop and remove all containers, networks, volumes
docker-compose -f deployment/docker-compose.production.yml down -v

# Rebuild images
docker-compose -f deployment/docker-compose.production.yml build --no-cache

# Start fresh
docker-compose -f deployment/docker-compose.production.yml up -d
```

## 📝 Notes

- **Fire and Forget**: Both stacks are designed to be complete and self-contained. Just run `docker-compose up` and everything works.
- **Hot Reload**: Development stack has hot-reload enabled for frontend changes.
- **Persistence**: All data is stored in Docker volumes and persists across restarts.
- **Isolation**: Production and development stacks use different networks and ports to avoid conflicts.
- **Debugging Tools**: Development stack includes Adminer, Redis Commander, and Mailhog for easier debugging.

## 🆘 Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Check health: `docker-compose ps`
3. Review documentation in `/docs`
4. Check GitHub issues

## 📄 License

See LICENSE file in project root.
