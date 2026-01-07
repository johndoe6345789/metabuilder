# Prisma Database Configuration

This directory contains the Prisma database schema and migrations.
The schema is generated from DBAL and should not be edited manually.

## 📋 Files

- `schema.prisma` - Database schema definition
- `migrations/` - Database migration history

## 🚀 Quick Start

### Generate Prisma Client

```bash
npm --prefix dbal/development run codegen:prisma
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

- **User** - Core user identity
- **Credential** - Authentication hashes
- **Session** - Active sessions
- **PageConfig** - Routes and page metadata
- **ComponentNode** - Component tree nodes
- **ComponentConfig** - Component configuration payloads
- **Workflow** - Automation workflows
- **InstalledPackage** - Installed package metadata
- **PackageData** - Package data payloads

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
