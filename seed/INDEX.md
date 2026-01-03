# Seed Directory Index

Quick reference for all seed files and their purposes.

## File Structure

```
seed/
├── README.md                           # Main documentation
├── INDEX.md                            # This file - quick reference
├── .gitignore                          # Git ignore rules for logs/cache
│
├── packages/                           # Package manifests
│   └── core-packages.yaml             # Core packages to auto-install
│
├── database/                           # DBAL-format database seeds
│   ├── installed_packages.yaml        # InstalledPackage table records
│   └── package_permissions.yaml       # PackagePermission table records
│
├── config/                             # Bootstrap configuration
│   ├── bootstrap.yaml                 # Bootstrap behavior and phases
│   └── package-repo.yaml              # Package source and validation config
│
└── logs/                               # Bootstrap execution logs
    └── .gitkeep                       # Keep directory in git
```

## Quick Links

| File | Purpose | Lines | Key Sections |
|------|---------|-------|--------------|
| [README.md](README.md) | Main documentation | ~400 | Usage, integration, troubleshooting |
| [packages/core-packages.yaml](packages/core-packages.yaml) | Package definitions | ~150 | packages, recommended, development, bootstrap_order |
| [database/installed_packages.yaml](database/installed_packages.yaml) | Package install records | ~130 | records (11 packages) |
| [database/package_permissions.yaml](database/package_permissions.yaml) | Package ACL records | ~200 | records (~20 permissions), permission_levels |
| [config/bootstrap.yaml](config/bootstrap.yaml) | Bootstrap config | ~170 | bootstrap, phases, database, hooks, environments |
| [config/package-repo.yaml](config/package-repo.yaml) | Repository config | ~250 | sources, discovery, validation, conflicts, security |

## Usage Cheat Sheet

### Bootstrap Commands (DBAL CLI)

```bash
# Full bootstrap
dbal bootstrap --config seed/config/bootstrap.yaml

# Dry run
dbal bootstrap --dry-run

# Production mode
dbal bootstrap --env production

# Development with verbose output
dbal bootstrap --env development --verbose
```

### Seed Database

```bash
# Seed all
dbal seed --dir seed/database

# Seed specific table
dbal seed seed/database/installed_packages.yaml
dbal seed seed/database/package_permissions.yaml

# Force re-seed
dbal seed --force
```

### Validation

```bash
# Validate all seed files
dbal validate --dir seed

# Validate packages
dbal validate seed/packages/core-packages.yaml

# Check schema compatibility
dbal validate-schema seed/database/*.yaml
```

## File Details

### packages/core-packages.yaml

**11 Core Packages:**
1. package_manager (priority 1) - Required
2. ui_header, ui_footer, ui_auth, ui_login (priority 2) - Required
3. dashboard (priority 3) - Required
4. user_manager, role_editor (priority 4) - Required
5. admin_dialog (priority 5) - Optional
6. database_manager, schema_editor (priority 6) - Optional

**6 Recommended Packages:**
- notification_center, audit_log, data_table, form_builder, quick_guide

**5 Development Packages:**
- testing, package_validator, component_editor, theme_editor, code_editor

### database/installed_packages.yaml

**Fields per record:**
- packageId (PK)
- tenantId (null = system-wide)
- installedAt (0 = use current timestamp)
- version (semver)
- enabled (boolean)
- config (JSON string with package settings)

**Special config flags:**
- systemPackage: true → Cannot uninstall
- uninstallProtection: true → Extra confirmation required
- minLevel: 4-5 → Permission level requirement
- dangerousOperations: true → Can modify system

### database/package_permissions.yaml

**Permission levels:**
- 0: public → ui_auth, ui_login
- 1: user → ui_header, ui_footer, dashboard
- 3: admin → user_manager
- 4: god → package_manager, role_editor
- 5: supergod → database_manager, schema_editor

**Permission types:**
- read → View/access
- write → Modify data
- execute → Run scripts
- admin → Full control

### config/bootstrap.yaml

**6 Installation Phases:**
1. Core System (package_manager)
2. Base UI (ui components)
3. Essential Features (dashboard)
4. Administration (user/role management)
5. Admin Tools (database/schema tools)
6. Recommended (optional packages)
7. Development (dev-only tools)

**Hooks:**
- preBootstrap → Before start
- postBootstrap → After success (runs validate-schema, verify-packages)
- onError → On failure (runs rollback-seed)
- prePhase/postPhase → Around each phase

**Environment configs:**
- development → Verbose, include dev tools
- production → Strict validation, exclude dev tools
- test → Always re-seed, use transactions

### config/package-repo.yaml

**Sources:**
- local (/packages, priority 0)
- Future: remote registries, git repos

**Validation:**
- Required fields: packageId, name, version, description, author, license
- packageId pattern: ^[a-z][a-z0-9_]*$ (snake_case)
- Version format: semver
- Schema: https://metabuilder.dev/schemas/package-metadata.schema.json

**Conflict resolution:**
- Strategy: priority (lowest priority number wins)
- Duplicate versions: newest

**Security:**
- Sandbox package scripts
- Disallow: eval, Function, require, import
- Trust only: local source

## Integration Points

### Database Schema
- [prisma/schema.prisma:327](../prisma/schema.prisma#L327) → InstalledPackage
- [prisma/schema.prisma:1637](../prisma/schema.prisma#L1637) → PackagePermission

### DBAL Schema
- [dbal/shared/api/schema/entities/core/package.yaml](../dbal/shared/api/schema/entities/core/package.yaml)

### Frontend Integration
- [frontends/nextjs/src/lib/db/packages](../frontends/nextjs/src/lib/db/packages) → CRUD
- [frontends/nextjs/src/lib/packages](../frontends/nextjs/src/lib/packages) → Loading

### Package Sources
- [packages/](../packages/) → Local package directory

## Modification Guide

### Add a Core Package

1. Add to [packages/core-packages.yaml](packages/core-packages.yaml):
   ```yaml
   - packageId: my_package
     version: "1.0.0"
     enabled: true
     priority: 10
     required: false
   ```

2. Add to [database/installed_packages.yaml](database/installed_packages.yaml):
   ```yaml
   - packageId: my_package
     tenantId: null
     installedAt: 0
     version: "1.0.0"
     enabled: true
     config: |
       {
         "systemPackage": false
       }
   ```

3. Add to [database/package_permissions.yaml](database/package_permissions.yaml):
   ```yaml
   - id: perm_my_package_user_read
     packageId: my_package
     role: user
     permission: read
     granted: true
   ```

### Add a Bootstrap Phase

Edit [config/bootstrap.yaml](config/bootstrap.yaml):

```yaml
phases:
  - id: 8
    name: "Custom Phase"
    required: false
    packages:
      source: core-packages.yaml
      filter: priority=100
```

### Add a Package Source

Edit [config/package-repo.yaml](config/package-repo.yaml):

```yaml
sources:
  - id: custom-source
    name: "Custom Packages"
    type: git
    url: https://github.com/org/packages.git
    priority: 10
    enabled: true
```

## Logs

Bootstrap logs are written to:
- `logs/bootstrap.log` - Main execution log
- Format: JSON (structured logging)
- Retention: 30 days (configurable in bootstrap.yaml)

Log levels:
- `debug` - Verbose debugging
- `info` - Normal operations (default)
- `warn` - Warnings and non-critical issues
- `error` - Failures and critical problems

---

**Last Updated:** 2026-01-03
**Bootstrap Version:** 1.0
**Generated with Claude Code**
