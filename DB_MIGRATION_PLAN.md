# Database Operations Migration Plan

## Overview
Move all database operations from `frontends/nextjs/src/lib/db/` to DBAL (`dbal/development/src/`).

## Current State
- **Frontend DB**: 235 files (1.3MB) in `frontends/nextjs/src/lib/db/`
- **DBAL**: Core entity operations in `dbal/development/src/core/entities/`
- **Seed System**: DBAL has proper seed orchestration in `dbal/development/src/seeds/`

## Migration Status

### ✅ Completed
1. **Seed Operations** - `api/setup/route.ts` now uses DBAL's `seedDatabase()` instead of frontend `Database.seedDefaultData()`

### 🚧 In Progress

#### Priority 1: Core Entity Operations
These operations exist in DBAL and should be migrated first:
- [ ] User operations (`frontends/nextjs/src/lib/db/users/` → `dbal/development/src/core/entities/user/`)
- [ ] Session operations (`frontends/nextjs/src/lib/db/sessions/` → `dbal/development/src/core/entities/session/`)
- [ ] Workflow operations (`frontends/nextjs/src/lib/db/workflows/` → `dbal/development/src/core/entities/workflow/`)
- [ ] Package operations (`frontends/nextjs/src/lib/db/packages/` → `dbal/development/src/core/entities/package/`)
- [ ] Page operations (`frontends/nextjs/src/lib/db/pages/` → `dbal/development/src/core/entities/page/`)

#### Priority 2: Extended Operations
Operations that need entity definitions added to DBAL:
- [ ] Comments (`frontends/nextjs/src/lib/db/comments/`)
- [ ] Components (`frontends/nextjs/src/lib/db/components/`)
- [ ] CSS Classes (`frontends/nextjs/src/lib/db/css-classes/`)
- [ ] Dropdown Configs (`frontends/nextjs/src/lib/db/dropdown-configs/`)
- [ ] Error Logs (`frontends/nextjs/src/lib/db/error-logs/`)
- [ ] Tenants (`frontends/nextjs/src/lib/db/tenants/`)
- [ ] SMTP Config (`frontends/nextjs/src/lib/db/smtp-config/`)
- [ ] God Credentials (`frontends/nextjs/src/lib/db/god-credentials/`)
- [ ] Power Transfers (`frontends/nextjs/src/lib/db/power-transfers/`)

#### Priority 3: Utility Functions
- [ ] Password operations (`hash-password.ts`, `verify-password.ts`) → Move to `dbal/development/src/core/auth/`
- [ ] Schema operations (`frontends/nextjs/src/lib/db/schemas/`)
- [ ] App Config (`frontends/nextjs/src/lib/db/app-config/`)
- [ ] System Config (`frontends/nextjs/src/lib/db/system-config/`)

### 📋 Migration Process

For each entity type:

1. **Check if entity exists in DBAL**
   - Look in `dbal/shared/api/schema/entities/` for YAML definition
   - Look in `dbal/development/src/core/entities/` for TypeScript operations

2. **If entity exists in DBAL:**
   - Update frontend API routes to use `getDBALClient()` instead of direct imports
   - Example: Replace `import { getUser } from '@/lib/db/users/get-user'` with `const dbal = getDBALClient(); await dbal.users.read(id)`
   - Remove frontend implementation files once all usages are migrated

3. **If entity doesn't exist in DBAL:**
   - Create YAML entity definition in `dbal/shared/api/schema/entities/`
   - Run code generation: `npm --prefix dbal/development run codegen`
   - Implement operations in `dbal/development/src/core/entities/{entity}/`
   - Then follow step 2 above

4. **Update imports across frontend:**
   - Replace `@/lib/db/*` imports with `@/dbal` imports
   - Use DBALClient entity operations instead of direct function calls

## Testing Strategy

1. **Unit Tests**: Ensure DBAL operations have test coverage
2. **Integration Tests**: Test DBAL operations with actual database
3. **E2E Tests**: Verify frontend still works with DBAL operations
4. **Incremental Migration**: Migrate one entity type at a time, test before moving to next

## Benefits

1. **Single Source of Truth**: All database logic in one place (DBAL)
2. **Better Security**: DBAL enforces ACL and tenant isolation
3. **Type Safety**: Generated types from YAML schemas
4. **Easier Testing**: DBAL operations isolated from frontend
5. **Future C++ Daemon**: Path to Phase 3 architecture with C++ DBAL daemon

## Architecture Alignment

### Before (Current State)
```
Frontend (Next.js)
  └── lib/db/
       ├── users/
       ├── sessions/
       ├── workflows/
       └── ... (235 files)
           └── Direct Prisma access
```

### After (Target State)
```
Frontend (Next.js)
  └── Uses getDBALClient() only

DBAL (TypeScript/Future C++)
  └── dbal/development/src/
       ├── core/entities/
       │    ├── user/
       │    ├── session/
       │    ├── workflow/
       │    └── ...
       └── seeds/
            └── Seed orchestration
```

## Next Steps

1. ✅ Update `/api/setup` route to use DBAL seed system (DONE)
2. Create migration scripts to help automate the refactoring
3. Migrate Priority 1 entities one by one
4. Update all API routes to use DBAL
5. Remove `frontends/nextjs/src/lib/db/` once migration complete

## Notes

- This is a large refactoring (235 files)
- Incremental approach recommended
- Test thoroughly at each step
- Consider creating a feature flag to toggle between old/new implementations during transition
