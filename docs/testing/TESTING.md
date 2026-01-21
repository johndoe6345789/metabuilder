# MetaBuilder E2E Testing Guide

## Test Architecture Overview

```
Playwright Test Execution
    ↓
1. Start WebServer
   - npm run db:generate (create Prisma client)
   - npm run dev (start Next.js)
    ↓
2. Global Setup (./e2e/global.setup.ts)
   - Wait 2 seconds for server
   - POST /api/setup (calls Database.seedDefaultData())
    ↓
3. Run Tests
   - Tests execute against seeded database
```

## Database Setup Flow

### Schema Creation
```bash
# From frontends/nextjs directory
npm run db:generate  # Generate Prisma client
npm run db:push      # Create database schema
```

**Important**: The `db:push` command requires `DATABASE_URL` environment variable pointing to the database file.

### Seeding Data
Seeding happens automatically when tests run via global setup:

```
/api/setup endpoint (POST)
    ↓
Database.seedDefaultData()
    ↓
seedUsers()           → Creates admin, god, manager, demo users
seedAppConfig()       → App configuration
seedHomePage()        → Home page route (from ui_home package)
seedCssCategories()   → CSS utilities
seedDropdownConfigs() → Dropdown options
```

## Running Tests

### First Time Setup
```bash
cd frontends/nextjs

# 1. Generate Prisma client
npm run db:generate

# 2. Create database schema (requires DATABASE_URL env var)
DATABASE_URL=file:../../prisma/prisma/dev.db npm run db:push

# 3. Run tests (automatically seeds via global setup)
npm run test:e2e
```

### Subsequent Test Runs
```bash
# Tests reuse existing database by default (reuseExistingServer: true)
# To start fresh:
rm prisma/prisma/dev.db
npm run test:e2e
```

### Test Commands
```bash
npm run test:e2e              # Run all E2E tests headlessly
npm run test:e2e:ui          # Run with Playwright UI
npm run test:e2e:headed      # Run with visible browser
npm run test:e2e:debug       # Run in debug mode
npm run test:e2e:report      # View HTML report
```

## Understanding the Seed System

### Seed Modules
Location: `src/lib/db/database-admin/seed-default-data/`

Each module follows the pattern:
```typescript
export const seedXxx = async (): Promise<void> => {
  const adapter = getAdapter()

  // 1. Check if already exists (idempotent)
  const existing = await adapter.list('Entity', { filter: {...} })
  if (existing.data.length > 0) return

  // 2. Create seed data
  await adapter.create('Entity', { ... })
}
```

### Default Users
Seeded with test credentials (username/password):

| Username | Email | Role | Password |
|----------|-------|------|----------|
| admin | admin@localhost | supergod | admin123 |
| god | god@localhost | god | god123 |
| manager | manager@localhost | admin | manager123 |
| demo | demo@localhost | user | demo123 |

### Modifying Seeds
To add new seed data:

1. Create new file in `seed-default-data/` following the pattern
2. Add to `seedDefaultData()` orchestrator function
3. Make seeds idempotent (check before creating)
4. Run `npm run test:e2e` - global setup will seed automatically

## Troubleshooting

### "The table `PageConfig` does not exist"
**Cause**: Database schema hasn't been pushed
**Solution**:
```bash
DATABASE_URL=file:../../prisma/prisma/dev.db npm run db:push
```

### "Database seeded successfully" but tests still fail
**Cause**: Existing database might have stale state
**Solution**:
```bash
rm frontends/nextjs/prisma/prisma/dev.db
npm run test:e2e
```

### Playwright times out waiting for server
**Cause**: `db:push` failing silently or dev server not starting
**Solution**:
```bash
# Check console output from webServer
npm run test:e2e 2>&1 | head -100

# Manually test health endpoint
curl http://localhost:3000/api/health

# Check database file exists
ls -la frontends/nextjs/prisma/prisma/dev.db
```

## Key Files

| File | Purpose |
|------|---------|
| `/playwright.config.ts` | Root test configuration (globalSetup, webServer config) |
| `e2e/global.setup.ts` | Runs before tests to seed database |
| `e2e/smoke.spec.ts` | Basic smoke tests |
| `/api/setup` | POST endpoint to seed database |
| `/api/health` | GET endpoint for health checks |
| `src/lib/db/database-admin/seed-default-data/` | Seed data modules |

## Environment Variables

### For Testing
- `DATABASE_URL`: Required for `db:push` - Set to `file:../../prisma/prisma/dev.db`
- `NODE_ENV`: Auto-detected as 'test' when running tests

### Test Environment Detection
```typescript
// From src/lib/config/prisma.ts
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true'
const isIntegrationTest = process.env.VITEST_INTEGRATION === 'true'

// Prisma modes:
// - Unit tests: Mock PrismaClient (no DB access)
// - Integration tests: In-memory SQLite
// - E2E tests: File-based SQLite (dev.db)
```

## Package System

Packages define seed data in `seed/metadata.json`:

```json
{
  "packageId": "ui_home",
  "exports": {
    "pages": [
      {
        "path": "/",
        "title": "MetaBuilder",
        "component": "home_page",
        "level": 0,
        "requiresAuth": false,
        "isPublished": true
      }
    ]
  }
}
```

This is loaded by `seedDefaultData()` to create PageConfig entries.

## CI/CD Considerations

Playwright CI configuration (from `/playwright.config.ts`):
- `retries: 2` (retry failed tests)
- `workers: 1` (sequential execution)
- `reuseExistingServer: false` (fresh server for each run)

For CI, ensure:
1. `npm run db:generate` runs before tests
2. `DATABASE_URL=file:path/to/dev.db npm run db:push` runs to create schema
3. Global setup will handle seeding via `/api/setup`
