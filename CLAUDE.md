# MetaBuilder Project Instructions for AI Assistants

## Architecture Overview

MetaBuilder is a **data-driven platform** where everything flows through the database. The key principle: **No hardcoded routes, components, or UI structure.**

```
Browser → Database Query → JSON Definition → Generic Renderer → React UI
```

## Critical Concepts

### 1. DBAL (Database Abstraction Layer)
- **Never** use Prisma directly
- **Always** use the DBAL adapter through `getAdapter()` from `@/lib/db/core/dbal-client`
- The adapter wraps Prisma but provides a unified interface
- DBAL is defined in packages but fronted by the DBAL daemon (C++ service)

### 2. Database Schema
- Schema is **auto-generated from DBAL** - DO NOT EDIT `prisma/schema.prisma` MANUALLY
- Tables include: User, Session, PageConfig, InstalledPackage, ComponentConfig, etc.
- To create/push schema: `npm run db:push` (from frontends/nextjs)

### 3. Package System
- Packages are in `/packages/<package-name>/`
- Each package has:
  - `package.json` - metadata
  - `components/` - JSON component definitions
  - `seed/metadata.json` - seed data defining what gets inserted into PageConfig
  - `static_content/` - assets

### 4. Routing System
- **No hardcoded routes** - all routes come from `PageConfig` database table
- PageConfig references a package + component
- Home page (`/`) must have an entry in PageConfig with `path: '/'`
- Package's `seed/metadata.json` defines what pages should be created

### 5. JSON Components
- Components are defined as JSON in package `components/*.json`
- Rendered by generic `renderJSONComponent()`
- Structure: `{ id, name, render: { type, template } }`
- `template` uses component types like Button, Text, Box, Link, etc. (NOT HTML tags)

## Development Workflow

1. **Never modify Prisma schema directly** - it's generated from DBAL
2. **Database initialization**:
   ```bash
   npm run db:generate  # Generate Prisma client
   npm run db:push      # Create/sync database schema
   ```
3. **Seeding**:
   - Packages define seed data in `seed/metadata.json`
   - Seed functions in `src/lib/db/database-admin/seed-default-data/`
   - Health endpoint triggers seeding on first request
4. **Always use DBAL adapter** - never raw Prisma queries

## Key Files & Paths

- `/prisma/schema.prisma` - Database schema (auto-generated)
- `/frontends/nextjs/src/lib/db/core/dbal-client/` - DBAL adapter interface
- `/frontends/nextjs/src/lib/db/core/operations.ts` - Database operations (Database class)
- `/frontends/nextjs/src/app/page.tsx` - Root page (loads from PageConfig)
- `/packages/` - All UI packages
- `/frontends/nextjs/src/lib/packages/json/render-json-component.tsx` - Generic renderer

## Testing

- E2E tests in `/e2e/` using Playwright
- Config: `/playwright.config.ts`
- Must run: `npm run db:generate && npm run db:push` before tests
- Health endpoint seeding is automatic on first request

## Common Tasks

### Add a new home page
1. Ensure `ui_home` package exists with `components/ui.json` having `home_page` component
2. Create `/packages/ui_home/seed/metadata.json` with PageConfig definition for `path: /`
3. Update `seed-home-page.ts` to load from the seed metadata
4. Database seeding happens automatically on first `/api/health` call

### Create a new page
1. Define the route in PageConfig table (via API or seed)
2. Reference a package + component
3. System automatically loads and renders it

### Modify the schema
- Edit DBAL definition (not Prisma schema)
- Run code gen: `npm run db:generate`
- Push to DB: `npm run db:push`

## DO NOTs

- ❌ Don't edit `prisma/schema.prisma` directly
- ❌ Don't use `prisma` client directly - use `getAdapter()`
- ❌ Don't hardcode routes or components
- ❌ Don't delete the DATABASE_URL env var
- ❌ Don't mix HTML tags in JSON components (use Component types instead)

## DO NOTs for Bots

- ❌ Don't try to understand the full DBAL system - it's complex
- ✅ DO understand that everything goes through the adapter
- ✅ DO check how seed data works before modifying database initialization
- ✅ DO ensure database schema exists before accessing tables
- ✅ DO follow the pattern of using `Database.seedDefaultData()` for initialization
