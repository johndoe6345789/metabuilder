# Deploy Application

Deploy MetaBuilder to production:

## Pre-Deployment Checks (from `frontends/nextjs/`)
```bash
npm run act              # Full CI locally
npm run build            # Verify build succeeds
npm run typecheck        # No type errors
```

## Docker Deployment (from repo root)
```bash
# Development
docker-compose -f deployment/docker-compose.development.yml up

# Production
docker-compose -f deployment/docker-compose.production.yml up -d
```

## Database Migration (from `frontends/nextjs/`)
```bash
npm run db:migrate       # Apply migrations
```

## Environment Variables
Required in production:
- `DATABASE_URL` - Database connection string
- `NODE_ENV=production`

## Post-Deployment
1. Verify health endpoints
2. Check logs for errors
3. Test critical user flows
4. Monitor tenant isolation working correctly
