# Seed System Overhaul Plan

## Current State Assessment

### What Exists (Well-Structured)
✅ **YAML Configuration Files** (`seed/config/`)
- `bootstrap.yaml` - Phase-based installation, hooks, environment overrides
- `package-repo.yaml` - Package discovery, validation, conflict resolution, caching

✅ **Package Manifests** (`seed/packages/`)
- `core-packages.yaml` - 12+ packages with priority, version, dependencies

✅ **Database Seed Templates** (`seed/database/`)
- `installed_packages.yaml` - Package installation records (well-formatted)
- `package_permissions.yaml` - Role-based permissions (complete permission matrix)

✅ **Documentation** (`seed/README.md`)
- Clear structure, usage, customization examples

### What's Missing (Critical)

❌ **Complete Seed Data Files**
Currently missing seed YAML files for:
1. `seed/database/default-users.yaml` - System users (admin, god, manager, demo)
2. `seed/database/app-config.yaml` - App configuration, settings, defaults
3. `seed/database/css-categories.yaml` - CSS class categories
4. `seed/database/dropdown-configs.yaml` - Dropdown/select configurations
5. `seed/database/system-constants.yaml` - Role levels, timeouts, environment defaults

❌ **DBAL Implementation**
- `dbal/development/src/seeds/index.ts` - Only placeholder, no actual loading logic
- YAML loader function (parse YAML from disk)
- Entity creator function (save to database via DBAL)
- Error handling and validation

❌ **Seed Orchestration**
- No integration between bootstrap config and actual seeding
- No idempotency checking (does record exist before creating)
- No transaction handling or rollback

❌ **Remaining TypeScript Seed Files**
Still in frontend (should be migrated to YAML):
- `/frontends/nextjs/src/lib/db/database-admin/seed-default-data/users/seed-users.ts`
- `/frontends/nextjs/src/lib/db/database-admin/seed-default-data/app/seed-app-config.ts`
- `/frontends/nextjs/src/lib/db/database-admin/seed-default-data/css/seed-css-categories.ts`
- `/frontends/nextjs/src/lib/db/database-admin/seed-default-data/dropdowns/seed-dropdown-configs.ts`

---

## Comprehensive Overhaul Plan

### Phase 1: Create Seed YAML Files (2-3 hours)

#### 1.1 Migrate default users to YAML
Create: `seed/database/default-users.yaml`
```yaml
entity: User
version: "1.0"
records:
  - id: user_admin
    username: admin
    email: admin@localhost
    role: admin  # Level 3
    enabled: true
    createdAt: 0

  - id: user_god
    username: god
    email: god@localhost
    role: god    # Level 4
    enabled: true
    createdAt: 0

  - id: user_manager
    username: manager
    email: manager@localhost
    role: moderator  # Level 2
    enabled: true
    createdAt: 0

  - id: user_demo
    username: demo
    email: demo@localhost
    role: user   # Level 1
    enabled: true
    createdAt: 0

metadata:
  bootstrap: true
  skipIfExists: true
  note: "These are default system users for development and testing"
```

#### 1.2 App Configuration
Create: `seed/database/app-config.yaml`
```yaml
entity: AppConfig
version: "1.0"
records:
  - id: config_app_name
    key: app.name
    value: "MetaBuilder"
    configType: string
    description: "Application name"

  - id: config_app_version
    key: app.version
    value: "0.1.0"
    configType: string

  - id: config_session_timeout
    key: session.timeoutMinutes
    value: "1440"  # 24 hours
    configType: integer

  - id: config_max_login_attempts
    key: security.maxLoginAttempts
    value: "5"
    configType: integer

  - id: config_password_min_length
    key: security.passwordMinLength
    value: "8"
    configType: integer

metadata:
  bootstrap: true
  skipIfExists: true
```

#### 1.3 CSS Categories
Create: `seed/database/css-categories.yaml`
```yaml
entity: CSSCategory
version: "1.0"
records:
  - id: css_colors
    name: "Colors"
    description: "Color utility classes"
    priority: 1

  - id: css_spacing
    name: "Spacing"
    description: "Margin and padding utilities"
    priority: 2

  - id: css_typography
    name: "Typography"
    description: "Text and font utilities"
    priority: 3

  - id: css_layout
    name: "Layout"
    description: "Flexbox, grid, and position utilities"
    priority: 4

  - id: css_effects
    name: "Effects"
    description: "Shadows, borders, animations"
    priority: 5

metadata:
  bootstrap: true
  skipIfExists: true
```

#### 1.4 Dropdown Configurations
Create: `seed/database/dropdown-configs.yaml`
```yaml
entity: DropdownConfig
version: "1.0"
records:
  - id: dropdown_roles
    name: "User Roles"
    options:
      - id: 0
        label: "Public"
        value: "public"
      - id: 1
        label: "User"
        value: "user"
      - id: 2
        label: "Moderator"
        value: "moderator"
      - id: 3
        label: "Admin"
        value: "admin"
      - id: 4
        label: "God"
        value: "god"
      - id: 5
        label: "Supergod"
        value: "supergod"

  - id: dropdown_yes_no
    name: "Yes/No"
    options:
      - id: 1
        label: "Yes"
        value: "true"
      - id: 2
        label: "No"
        value: "false"

metadata:
  bootstrap: true
  skipIfExists: true
```

#### 1.5 System Constants
Create: `seed/database/system-constants.yaml`
```yaml
entity: SystemConstant
version: "1.0"
records:
  - key: ROLE_PUBLIC
    value: "0"

  - key: ROLE_USER
    value: "1"

  - key: ROLE_MODERATOR
    value: "2"

  - key: ROLE_ADMIN
    value: "3"

  - key: ROLE_GOD
    value: "4"

  - key: ROLE_SUPERGOD
    value: "5"

metadata:
  bootstrap: true
  skipIfExists: true
  note: "System-wide role level constants"
```

### Phase 2: Implement DBAL Seed Loading (3-4 hours)

#### 2.1 Create Seed Loader
File: `dbal/development/src/seeds/seed-loader.ts`

Responsibilities:
- Load YAML files from `seed/database/` directory
- Parse YAML into SeedFile objects
- Validate YAML structure
- Return array of seed files in correct order

#### 2.2 Implement Seed Orchestration
File: `dbal/development/src/seeds/seed-orchestrator.ts`

Responsibilities:
- Execute seeds in correct order
- Check idempotency (skipIfExists)
- Create records via DBALClient
- Handle errors and transactions
- Provide logging and progress updates

#### 2.3 Update Bootstrap Config
Modify: `seed/config/bootstrap.yaml`
```yaml
database:
  seedFiles:
    - database/default-users.yaml
    - database/app-config.yaml
    - database/css-categories.yaml
    - database/dropdown-configs.yaml
    - database/system-constants.yaml
    - database/installed_packages.yaml
    - database/package_permissions.yaml

  skipIfPopulated: true
  useTransactions: true
  validateSchema: true
```

### Phase 3: Migrate TypeScript Seed Files (2-3 hours)

Delete from frontend:
- `/frontends/nextjs/src/lib/db/database-admin/seed-default-data/` (entire directory)

These are now covered by YAML files in `seed/database/`

### Phase 4: Update DBAL Index Exports (30 minutes)

File: `dbal/development/src/index.ts`
```typescript
export { seedDatabase } from './seeds'
export { loadSeedFile, loadAllSeedFiles } from './seeds/seed-loader'
```

### Phase 5: Integration Testing (1-2 hours)

Test each phase:
1. ✅ Load seed YAML files
2. ✅ Create records via DBAL
3. ✅ Verify idempotency (re-run doesn't duplicate)
4. ✅ Check role levels match
5. ✅ Verify permissions are set correctly
6. ✅ Run E2E tests with seeded data

---

## Implementation Timeline

```
Week 1: Phase 1 (Create YAML files) - 2-3h
  ├── Create default-users.yaml
  ├── Create app-config.yaml
  ├── Create css-categories.yaml
  ├── Create dropdown-configs.yaml
  └── Create system-constants.yaml

Week 1-2: Phase 2 (Implement DBAL loading) - 3-4h
  ├── Create seed-loader.ts
  ├── Create seed-orchestrator.ts
  ├── Update bootstrap.yaml
  └── Test seed loading

Week 2: Phase 3 (Migrate frontend files) - 2-3h
  ├── Delete TypeScript seed files
  ├── Update imports
  └── Test that everything still works

Week 2: Phase 4 (Update exports) - 30m
  ├── Update dbal/index.ts
  └── Build and test

Week 2-3: Phase 5 (Integration testing) - 1-2h
  ├── Manual testing
  ├── E2E test validation
  └── Documentation updates
```

**Total Effort**: 9-13 hours
**Timeline**: 2-3 weeks

---

## Success Criteria

✅ All seed data is YAML-based (zero hardcoded TypeScript seed files)
✅ DBAL seedDatabase() fully implements the bootstrap config
✅ Seeding is idempotent (safe to re-run)
✅ All default data exists after bootstrap
✅ E2E tests pass with seeded data
✅ Seed system supports custom seed files for extensions
✅ Bootstrap is production-ready (transactions, validation, logging)

---

## Files to Create/Modify

### Create
- `seed/database/default-users.yaml`
- `seed/database/app-config.yaml`
- `seed/database/css-categories.yaml`
- `seed/database/dropdown-configs.yaml`
- `seed/database/system-constants.yaml`
- `dbal/development/src/seeds/seed-loader.ts`
- `dbal/development/src/seeds/seed-orchestrator.ts`

### Modify
- `seed/config/bootstrap.yaml` (add all seed files to list)
- `dbal/development/src/seeds/index.ts` (implement seedDatabase)
- `dbal/development/src/index.ts` (add exports)

### Delete
- `/frontends/nextjs/src/lib/db/database-admin/seed-default-data/` (entire directory)

---

## Related Documentation

- **ROADMAP.md**: See "Phase 2: Architecture Refactoring" → P2.1
- **ARCHITECTURE.md**: See "Seed Data Organization"
- **seed/README.md**: Comprehensive seed system documentation
- **DBAL_REFACTOR_PLAN.md**: Phase 2 cleanup implementation
