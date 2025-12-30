# Prisma Database Configuration

This directory contains the Prisma database schema and migrations.

## 📋 Files

- `schema.prisma` - Database schema definition
- `migrations/` - Database migration history

## 🚀 Quick Start

### Generate Prisma Client

```bash
npm run db:generate
```

Regenerate the Prisma client after schema changes.

### Apply Migrations

```bash
npm run db:push
```

Apply pending schema changes to database.

### View Database

```bash
npm run db:studio
```

Opens Prisma Studio for visual database management.

## 📝 Database Schema

Key entities defined in `schema.prisma`:

- **User** - System users with permission levels
- **Tenant** - Multi-tenant support
- **Package** - Feature packages
- **Schema** - Dynamic data schemas
- **Data** - JSON data storage
- **LuaScript** - Business logic scripts
- **Audit** - Activity logging

### User Levels

```prisma
enum PermissionLevel {
  GUEST     // Level 1 (read-only)
  USER      // Level 2
  ADMIN     // Level 3
  GOD       // Level 4
  SUPERGOD  // Level 5 (system admin)
}
```

### Sample Table

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  password     String   // SHA-512 hash
  level        PermissionLevel
  tenantId     String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  tenant       Tenant   @relation(fields: [tenantId], references: [id])
}
```

## 🔒 Security

- All passwords stored as SHA-512 hashes
- Multi-tenant data isolation
- Permission-based access control
- Type-safe database queries

## 📚 Migrations

Migration files track schema changes:

```bash
# List migrations
ls migrations/

# Create new migration
npx prisma migrate dev --name add_feature

# Reset database (dev only!)
npx prisma migrate reset
```

## 🔗 Related

- [Database Architecture](../docs/architecture/database.md)
- [API Development](../docs/guides/api-development.md)
- [Security Guidelines](../docs/SECURITY.md)
- [Getting Started](../docs/guides/getting-started.md)
