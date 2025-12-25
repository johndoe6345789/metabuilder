# Prisma Database Layer Migration

This document describes the migration from `spark.kv` to Prisma for the MetaBuilder database layer.

## What Changed

### 1. Database Backend
- **Before**: Used `spark.kv` (key-value store) for all data persistence
- **After**: Uses Prisma ORM with SQLite database (configurable to PostgreSQL/MySQL)

### 2. Data Structure
All data structures remain the same at the application level. The Database class API is unchanged, ensuring no breaking changes to existing code.

### 3. Prisma Schema
Created comprehensive Prisma schema at `prisma/schema.prisma` including:
- User management (users, credentials, password tracking)
- Content (workflows, lua scripts, pages, schemas)
- UI configuration (component hierarchy, component configs, CSS classes, dropdowns)
- Packages (installed packages, package data)
- Multi-tenancy (tenants, power transfer requests)
- System configuration (SMTP, password reset tokens, system settings)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

This installs:
- `@prisma/client` - Prisma Client for database access
- `prisma` - Prisma CLI for migrations

### 2. Set Database URL
Create a `.env` file in the project root:
```env
DATABASE_URL="file:./dev.db"
```

For production, use PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/metabuilder?schema=public"
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

This generates the TypeScript types and Prisma Client based on the schema.

### 4. Create Database
```bash
npm run db:push
```

This creates the database and all tables based on the schema.

### 5. Run Migrations (Production)
```bash
npm run db:migrate
```

## Benefits of Prisma

1. **Type Safety**: Full TypeScript support with generated types
2. **Relational Data**: Proper foreign keys and relationships
3. **Performance**: Optimized queries and connection pooling
4. **Scalability**: Easy to switch from SQLite to PostgreSQL/MySQL
5. **Migrations**: Track database schema changes over time
6. **Query Builder**: Intuitive API for complex queries

## File Changes

### New Files
- `prisma/schema.prisma` - Database schema definition
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/database-prisma.ts` - New Prisma-based database implementation (backup)

### Modified Files
- `src/lib/database.ts` - Replaced spark.kv with Prisma implementation
- `prisma/migrations/` - Database migration history

### Unchanged API
The `Database` class maintains the exact same public API, so all existing code continues to work without modification.

## Data Migration

If you have existing data in spark.kv:

1. Export existing data using the old system:
```typescript
const jsonData = await Database.exportDatabase()
// Save jsonData to a file
```

2. After switching to Prisma, import the data:
```typescript
await Database.importDatabase(jsonData)
```

## Troubleshooting

### "Cannot find module '@prisma/client'"
Run: `npm run db:generate`

### Database doesn't exist
Run: `npm run db:push`

### Migration conflicts
Delete `prisma/migrations` folder and run: `npm run db:push`

### SQLite locked error
Ensure no other process is accessing the database file.

## Further Customization

### Change Database Provider
Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // or "mysql"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npm run db:push
```

### Add New Models
1. Edit `prisma/schema.prisma`
2. Run `npm run db:push`
3. Run `npm run db:generate`
4. Update `src/lib/database.ts` with new methods

## Performance Notes

- Prisma automatically handles connection pooling
- Use transactions for bulk operations when needed
- Consider adding indexes for frequently queried fields
- For production, use PostgreSQL with proper connection limits
