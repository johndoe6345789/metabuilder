# TODO 7 - Database & Prisma

## Schema Improvements

- [ ] Review and optimize Prisma schema relations
- [ ] Add missing indexes for frequently queried fields
- [ ] Implement soft delete pattern for auditable entities
- [ ] Add database-level constraints for data integrity
- [ ] Create schema documentation with entity relationships

## Multi-Tenancy

- [ ] Audit all database queries for tenant ID filtering
- [ ] Implement row-level security at database level
- [ ] Add tenant isolation tests
- [ ] Create tenant provisioning automation
- [ ] Implement tenant data export functionality

## Migrations

- [ ] Fix Prisma CLI schema path for `frontends/nextjs` (currently `cd frontends/nextjs && npx prisma validate` cannot find `schema.prisma`)
- [ ] Review pending migrations for production readiness
- [ ] Add rollback scripts for all migrations
- [ ] Create migration testing pipeline
- [ ] Document migration procedures for production
- [ ] Implement zero-downtime migration strategies

## Database Utilities

- [ ] Complete Database class helper methods
- [ ] Add query performance logging
- [ ] Implement database health checks
- [ ] Create database backup automation
- [ ] Add connection pool monitoring

## Seeding

- [ ] Complete seed data for all entity types
- [ ] Add environment-specific seed data
- [ ] Create seed data validation scripts
- [ ] Implement idempotent seeding (safe to re-run)
- [ ] Add seed data for test environments

## Performance

- [ ] Profile and optimize slow queries
- [ ] Add query caching layer
- [ ] Implement database connection pooling optimization
- [ ] Create query explain analysis tooling
- [ ] Add database metrics dashboard
