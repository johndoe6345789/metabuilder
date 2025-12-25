# Deployment Guide

Complete guide for deploying MetaBuilder to various environments.

## 📋 Prerequisites

- Node.js 18+
- Docker (for containerized deployment)
- npm or yarn
- Database access (SQLite for dev, PostgreSQL for production)

## 🚀 Deployment Options

### 1. Local Development

```bash
npm install
npm run db:generate
npm run db:push
npm run dev
```

Runs on `http://localhost:5173`.

### 2. Docker Development

```bash
docker-compose -f deployment/docker-compose.development.yml up
```

Features:
- Hot-reload on code changes
- Database mounted as volume
- Port 5173 mapped

### 3. Docker Production

```bash
docker-compose -f deployment/docker-compose.production.yml up -d
```

Features:
- Optimized build
- Production environment variables
- Health checks
- Auto-restart on failure

### 4. Cloud Deployment

Supports:
- **AWS** - EC2, ECS, Elastic Beanstalk
- **Google Cloud** - App Engine, Cloud Run
- **Azure** - App Service, Container Instances
- **Heroku** - Push to deploy
- **DigitalOcean** - Droplets or App Platform

## 🔧 Environment Configuration

### Development (.env.local)

```bash
VITE_API_URL=http://localhost:3000
DATABASE_URL=file:./dev.db
NODE_ENV=development
```

### Production (.env.production)

```bash
VITE_API_URL=https://api.example.com
DATABASE_URL=postgresql://user:pass@host/db
NODE_ENV=production
SECURE=true
```

### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | Database connection string | ✅ Yes |
| `VITE_API_URL` | API base URL | ✅ Yes |
| `NODE_ENV` | Environment (dev/prod) | ✅ Yes |
| `SECRET_KEY` | Application secret | ✅ Yes |
| `SECURE` | Enable HTTPS | ❌ No |

## 🗄️ Database Setup

### SQLite (Development)

```bash
npm run db:push
```

### PostgreSQL (Production)

```bash
# Set connection string
export DATABASE_URL="postgresql://user:password@localhost:5432/metabuilder"

# Run migrations
npm run db:push

# Verify setup
npm run db:studio
```

## 🐳 Docker Configuration

### Build Custom Image

```bash
docker build -f deployment/Dockerfile.app -t metabuilder:latest .
docker run -p 3000:3000 metabuilder:latest
```

### Docker Compose

Development:
```yaml
version: '3'
services:
  app:
    build:
      dockerfile: Dockerfile.app.dev
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
```

Production:
```yaml
version: '3'
services:
  app:
    image: metabuilder:latest
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://...
    healthcheck:
      test: curl -f http://localhost:3000/health
      interval: 30s
      timeout: 10s
      retries: 3
```

## 🔐 Security Checklist

Before production deployment:

- ✅ Use HTTPS (SSL/TLS certificates)
- ✅ Set strong database passwords
- ✅ Configure environment variables
- ✅ Enable database backups
- ✅ Set up monitoring & logging
- ✅ Configure firewall rules
- ✅ Enable rate limiting
- ✅ Set up admin users with strong passwords
- ✅ Review security documentation
- ✅ Test disaster recovery

## 📊 Health Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3000/health
```

Returns:
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 3600
}
```

### Logs

Docker logs:
```bash
docker logs metabuilder
docker logs -f metabuilder  # Follow logs
```

## 📈 Scaling Considerations

### Horizontal Scaling

Multiple instances behind load balancer:

```
┌─────────┐
│ Nginx   │ (Load Balancer)
└────┬────┘
     │
  ┌──┴──┬──────┬──────┐
  │     │      │      │
┌─┴─┐ ┌─┴─┐ ┌─┴─┐ ┌─┴─┐
│App│ │App│ │App│ │App│
└─┬─┘ └─┬─┘ └─┬─┘ └─┬─┘
  │     │     │     │
  └─────┴─────┴─────┘
         │
     ┌───┴────┐
    Database (shared)
```

### Database Optimization

- Use PostgreSQL connection pooling
- Enable query caching
- Monitor slow queries
- Regular backups

## 🔄 Continuous Deployment

### GitHub Actions Workflow

```yaml
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run lint
      - run: npm run test:e2e
      - run: npm run build
      - run: docker push metabuilder:latest
```

## 📊 Monitoring & Logging

### Essential Metrics

- Application uptime
- Response times
- Error rates
- Database performance
- User activity

### Log Aggregation

Consider:
- CloudWatch (AWS)
- Stackdriver (Google Cloud)
- Application Insights (Azure)
- ELK Stack (self-hosted)

## 🆘 Troubleshooting

### Common Issues

**Database connection fails**
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
npm run db:studio
```

**Port already in use**
```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Out of memory**
```bash
# Increase Node.js heap
export NODE_OPTIONS="--max-old-space-size=4096"
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Deployment](https://www.prisma.io/docs/concepts/deployment)
- [GitHub Actions](https://github.com/features/actions)

## 🔗 Related Documentation

- [Getting Started](../guides/getting-started.md)
- [Database Architecture](./database.md)
TODO: Security guide lives at ../security/SECURITY.md; update this link.
- [Security Guidelines](../SECURITY.md)
- [Architecture Overview](./5-level-system.md)
