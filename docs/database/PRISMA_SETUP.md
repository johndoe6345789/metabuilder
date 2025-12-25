# Prisma Database Setup

The MetaBuilder project now uses Prisma as its database layer, replacing the previous `spark.kv` key-value store.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Create/Update Database
```bash
npm run db:push
```

### 5. Start Development Server
```bash
npm run dev
```

## Database Schema

The Prisma schema is defined in `prisma/schema.prisma` and includes:

- **Users**: User accounts, credentials, and authentication
- **Content**: Workflows, Lua scripts, pages, and data schemas
- **Components**: UI component hierarchy and configurations
- **Packages**: Installed packages and their data
- **Tenancy**: Multi-tenant support and power transfers
- **Configuration**: SMTP, CSS classes, dropdown configs, and system settings

## npm Scripts

- `npm run db:generate` - Generate Prisma Client from schema
- `npm run db:push` - Push schema changes to database (dev)
- `npm run db:migrate` - Run migrations (production)

## Database Files

- `prisma/schema.prisma` - Database schema definition
- `prisma/migrations/` - Migration history
- `dev.db` - SQLite database file (gitignored)
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/database.ts` - Database access layer

## Switching Database Providers

###  PostgreSQL (Recommended for Production)

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/metabuilder"
```

3. Run:
```bash
npm run db:push
```

### MySQL

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/metabuilder"
```

3. Run:
```bash
npm run db:push
```

## Data Migration

If you have existing data from the old `spark.kv` system:

1. Export data (before migration):
```typescript
const jsonData = await Database.exportDatabase()
// Save to file
```

2. After Prisma setup, import:
```typescript
await Database.importDatabase(jsonData)
```

## Troubleshooting

### Error: Cannot find module '@prisma/client'
Run: `npm run db:generate`

### Error: Database file doesn't exist
Run: `npm run db:push`

### Error: Database locked (SQLite)
Kill any processes using the database or restart your computer.

### Migration conflicts
Delete `prisma/migrations/` and `dev.db`, then run `npm run db:push`

## Production Deployment

1. Use PostgreSQL or MySQL (not SQLite)
2. Set `DATABASE_URL` environment variable
3. Run migrations: `npm run db:migrate`
4. Deploy application

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
TODO: The migration guide link should be relative to docs/database (remove ./docs/).
- [Migration Guide](./docs/PRISMA_MIGRATION.md)
