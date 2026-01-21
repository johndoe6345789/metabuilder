# MetaBuilder Architecture Restructure

**Objective:** Move seed and Prisma schema into DBAL (Database Abstraction Layer)

**Rationale:** DBAL is the single source of truth for all database concerns. Seed data and schema belong with DBAL, not scattered across the project.

**Status:** PLANNING PHASE (Before CODEBASE_RECOVERY_PLAN.md execution)

---

## CURRENT PROBLEM

**Current Structure (WRONG):**
```
/
├── /seed/                           ← Seed data (root level - WRONG)
│   ├── database/
│   │   ├── installed_packages.yaml
│   │   └── package_permissions.yaml
│   └── config/
│
├── /prisma/                         ← Schema (root level - WRONG)
│   └── schema.prisma               ← Should be in DBAL
│
├── /dbal/
│   ├── development/
│   │   ├── src/
│   │   ├── prisma/                 ← Empty (UNUSED)
│   │   └── package.json
│   │
│   ├── shared/
│   │   ├── api/schema/entities/    ← YAML source of truth
│   │   └── docs/
│   │
│   └── production/                 ← C++ DBAL (future)
```

**Issues:**
1. ❌ Seed data at root level (not with database code)
2. ❌ Prisma schema at root level (not with database code)
3. ❌ DBAL doesn't own its own schema
4. ❌ DBAL can't be deployed independently (missing schema)
5. ❌ Multiple sources of truth (YAML in shared, Prisma at root)
6. ❌ /dbal/development/prisma/ is empty and unused

---

## TARGET STRUCTURE (CORRECT)

```
/
├── /seed/                           ← DELETED (moved to DBAL)
│
├── /prisma/                         ← DELETED (moved to DBAL)
│
├── /dbal/
│   ├── development/
│   │   ├── src/
│   │   │   ├── core/
│   │   │   ├── runtime/
│   │   │   ├── seeds/              ← Seed orchestration (NEW)
│   │   │   ├── adapters/
│   │   │   └── index.ts
│   │   │
│   │   ├── prisma/
│   │   │   └── schema.prisma       ← MOVED HERE (from /prisma/)
│   │   │
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared/
│   │   ├── api/
│   │   │   └── schema/
│   │   │       └── entities/       ← YAML source of truth
│   │   │
│   │   ├── seeds/                  ← MOVED HERE (from /seed/)
│   │   │   ├── database/
│   │   │   │   ├── installed_packages.yaml
│   │   │   │   └── package_permissions.yaml
│   │   │   ├── config/
│   │   │   ├── packages/           ← Package-specific seeds
│   │   │   └── README.md
│   │   │
│   │   ├── docs/
│   │   └── tools/
│   │
│   └── production/                 ← C++ DBAL (future)
│
├── /packages/
│   ├── ui_home/
│   │   └── seed/metadata.json      ← Package-specific seed
│   └── ...
│
└── /frontends/
    └── nextjs/
        └── src/
```

---

## BENEFITS OF RESTRUCTURE

**1. DBAL Self-Contained**
- ✅ DBAL owns all database code
- ✅ Can be deployed independently
- ✅ Can be versioned separately
- ✅ Can be reused by other frontends

**2. Single Source of Truth**
- ✅ YAML schemas in `/dbal/shared/api/schema/`
- ✅ Prisma schema auto-generated from YAML
- ✅ Seed data in `/dbal/shared/seeds/`
- ✅ No conflicting sources

**3. Clear Separation**
- ✅ Database logic: in DBAL
- ✅ Frontend code: in /frontends/
- ✅ Packages: in /packages/
- ✅ No mixing of concerns

**4. Proper Bootstrap**
- ✅ Seed orchestration in DBAL
- ✅ Database initialization in DBAL
- ✅ Package installation in DBAL
- ✅ Frontend just calls seedDatabase(db)

---

## MIGRATION PLAN

### STEP 1: Create DBAL Seed Structure

```bash
# Create seed orchestration in DBAL source
mkdir -p /dbal/development/src/seeds/
touch /dbal/development/src/seeds/index.ts          # Orchestrator
touch /dbal/development/src/seeds/load-yaml.ts      # YAML loader
touch /dbal/development/src/seeds/apply-seeds.ts    # Apply to DB
```

### STEP 2: Move Seed Data to DBAL Shared

```bash
# Create seed folder in DBAL shared
mkdir -p /dbal/shared/seeds/database/
mkdir -p /dbal/shared/seeds/config/
mkdir -p /dbal/shared/seeds/packages/

# Move seed data from root
mv /seed/database/installed_packages.yaml    → /dbal/shared/seeds/database/
mv /seed/database/package_permissions.yaml   → /dbal/shared/seeds/database/
mv /seed/config/bootstrap.yaml               → /dbal/shared/seeds/config/
mv /packages/*/seed/metadata.json            → Stay in packages (referenced by DBAL)

# Delete old /seed/ folder
rm -rf /seed/
```

### STEP 3: Move Prisma Schema to DBAL

```bash
# Move Prisma schema
mv /prisma/schema.prisma                     → /dbal/development/prisma/

# Move database file (dev only)
mv /prisma/dev.db                            → /dbal/development/prisma/dev.db

# Delete old /prisma/ folder (root level)
rm -rf /prisma/
```

### STEP 4: Update DBAL package.json Scripts

```json
{
  "scripts": {
    "db:generate": "prisma generate --schema=prisma/schema.prisma",
    "db:push": "prisma db push --schema=prisma/schema.prisma",
    "db:migrate": "prisma migrate deploy --schema=prisma/schema.prisma",
    "db:studio": "prisma studio --schema=prisma/schema.prisma",
    "codegen": "tsx ../shared/tools/codegen/gen_types.ts",
    "codegen:prisma": "node ../shared/tools/codegen/gen_prisma_schema.js",
    "seed": "tsx ../shared/seeds/load-and-apply.ts"
  }
}
```

### STEP 5: Update Frontend Scripts

```json
// frontends/nextjs/package.json
{
  "scripts": {
    "db:generate": "npm --prefix ../../dbal/development run db:generate",
    "db:push": "npm --prefix ../../dbal/development run db:push",
    "db:migrate": "npm --prefix ../../dbal/development run db:migrate"
  }
}
```

### STEP 6: Update Root Scripts

```json
// /package.json (root)
{
  "scripts": {
    "db:generate": "npm --prefix dbal/development run db:generate",
    "db:push": "npm --prefix dbal/development run db:push",
    "db:migrate": "npm --prefix dbal/development run db:migrate",
    "db:seed": "npm --prefix dbal/development run seed"
  }
}
```

### STEP 7: Update DBAL Exports

```typescript
// /dbal/development/src/index.ts
export { seedDatabase, loadYamlSeed, applySeed } from './seeds'
export { getDBALClient, useDBAL } from './core/client/factory'
export { getPrismaClient } from './runtime/prisma-client'
// ... rest of exports
```

### STEP 8: Update Frontend Bootstrap

```typescript
// frontends/nextjs/app/api/setup/route.ts
import { seedDatabase } from '@/dbal'
import { db } from '@/lib/db-client'

export async function POST() {
  try {
    await seedDatabase(db)  // DBAL handles everything
    return Response.json({ status: 'ok' })
  } catch (error) {
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
```

### STEP 9: Update Playwright Global Setup

```typescript
// playwright.global.ts
import { seedDatabase } from '@/dbal'
import { getDBALClient } from '@/dbal'

async function globalSetup() {
  const db = getDBALClient()
  await seedDatabase(db)
  // Database is now ready for tests
}

export default globalSetup
```

### STEP 10: Update TypeScript Paths

```json
// frontends/nextjs/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/dbal": ["../../node_modules/@metabuilder/dbal"],
      "@/dbal/*": ["../../node_modules/@metabuilder/dbal/*"]
    }
  }
}
```

### STEP 11: Update Documentation

```bash
# Update references in documentation
sed -i 's|/seed/|/dbal/shared/seeds/|g' CLAUDE.md
sed -i 's|/prisma/|/dbal/development/prisma/|g' CLAUDE.md
sed -i 's|/prisma/|/dbal/development/prisma/|g' README.md
sed -i 's|/seed/|/dbal/shared/seeds/|g' README.md
```

---

## EXECUTION ORDER

**This must happen BEFORE CODEBASE_RECOVERY_PLAN execution:**

1. ✅ This document (planning)
2. Create seed orchestration in DBAL source
3. Move `/seed/` → `/dbal/shared/seeds/`
4. Move `/prisma/schema.prisma` → `/dbal/development/prisma/`
5. Delete old `/seed/` and `/prisma/` folders
6. Update all package.json scripts
7. Update DBAL exports
8. Update frontend code
9. Update TypeScript paths
10. Update documentation
11. Verify no broken references
12. Test `npm run build` succeeds
13. Then proceed with CODEBASE_RECOVERY_PLAN

---

## GIT STRATEGY

```bash
# Single commit for the entire restructure
git add -A
git commit -m "refactor: Move seed and prisma into DBAL (architecture restructure)

DBAL is now fully self-contained:
- /dbal/development/prisma/ owns database schema
- /dbal/shared/seeds/ owns seed data
- /dbal/development/src/seeds/ owns seed orchestration

MOVED:
- /seed/ → /dbal/shared/seeds/
- /prisma/schema.prisma → /dbal/development/prisma/schema.prisma

UPDATED:
- All package.json scripts (db:generate, db:push, db:seed)
- DBAL exports (seedDatabase function)
- Frontend bootstrap (calls seedDatabase from DBAL)
- TypeScript paths and imports
- Documentation (all path references)

BENEFITS:
- DBAL is self-contained and independently deployable
- Single source of truth for seeds and schema
- Clear separation: database logic in DBAL, frontend in /frontends/
- Proper bootstrap: frontend just imports seedDatabase from DBAL

This restructure enables CODEBASE_RECOVERY_PLAN execution."
```

---

## CRITICAL: DO NOT SKIP THIS

This restructure must complete BEFORE CODEBASE_RECOVERY_PLAN.

**Why:** If we fix DBAL without moving seed/schema into it, we're perpetuating the wrong architecture. The time to fix architecture is NOW, while we're already fixing everything else.

**Impact if skipped:**
- ❌ DBAL still can't be deployed independently
- ❌ Seed data still scattered across project
- ❌ Future pain when trying to separate DBAL from frontend

**Impact if done:**
- ✅ DBAL is complete and self-contained
- ✅ Recovery plan can proceed with confidence
- ✅ Frontend is fully decoupled from database logic

---

## VERIFICATION CHECKLIST

After completing restructure:

- [ ] `/seed/` folder deleted
- [ ] `/prisma/` (root) folder deleted
- [ ] `/dbal/development/prisma/schema.prisma` exists
- [ ] `/dbal/shared/seeds/` contains all seed data
- [ ] `/dbal/development/src/seeds/` has seed orchestration
- [ ] `npm run db:generate` works
- [ ] `npm run db:push` works
- [ ] DBAL exports `seedDatabase` function
- [ ] Frontend imports `seedDatabase` from `@/dbal`
- [ ] No broken imports or references
- [ ] Documentation updated
- [ ] All paths point to new locations

---

## TIMELINE

This restructure should take **30-60 minutes** to execute fully (mostly file moving and script updates).

Then proceed with CODEBASE_RECOVERY_PLAN (fix compilation, types, database initialization, etc.)

Total time to full compliance: ~4 hours
