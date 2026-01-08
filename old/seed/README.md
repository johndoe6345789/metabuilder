# Seed - Package System Bootstrap

This directory contains seed data and configuration for bootstrapping the MetaBuilder package system.

## Directory Structure

```
seed/
├── packages/           # Package installation manifests
│   └── core-packages.yaml
├── database/          # Database seed data (DBAL format)
│   ├── installed_packages.yaml
│   └── package_permissions.yaml
├── config/            # System configuration
│   ├── bootstrap.yaml
│   └── package-repo.yaml
└── README.md
```

## Purpose

The seed system provides:

1. **Core Package Definitions** - Which packages to auto-install on first boot
2. **Database Seeds** - Initial records for `InstalledPackage` and `PackagePermission` tables
3. **Bootstrap Configuration** - How the package system initializes
4. **Repository Configuration** - Where packages are loaded from and how conflicts are resolved

## Files

### packages/core-packages.yaml

Defines the packages that should be automatically installed during system bootstrap.

**Categories:**
- **packages** - Core required packages (package_manager, ui components, dashboard, etc.)
- **recommended** - Optional but recommended packages (notifications, audit log, etc.)
- **development** - Dev-only tools (testing framework, validators, editors)

**Fields:**
- `packageId` - Unique package identifier (snake_case)
- `version` - Semantic version (e.g., "1.0.0")
- `enabled` - Whether package is active by default
- `priority` - Installation order (lower = earlier)
- `required` - Whether bootstrap fails if this package can't be installed

**Bootstrap Phases:**
1. Core System (package_manager)
2. Base UI (header, footer, auth, login)
3. Essential Features (dashboard)
4. Administration (user_manager, role_editor)
5. Admin Tools (database_manager, schema_editor)
6. Recommended Packages (optional)

### database/installed_packages.yaml

Seed data for the `InstalledPackage` table matching the Prisma schema at [prisma/schema.prisma:327](prisma/schema.prisma#L327).

**Fields:**
- `packageId` - Unique identifier (primary key)
- `tenantId` - Tenant isolation (null = system-wide)
- `installedAt` - Timestamp (0 = use current time)
- `version` - Package version
- `enabled` - Whether package is active
- `config` - JSON configuration specific to each package

**Special Flags:**
- `systemPackage: true` - Core packages that cannot be uninstalled
- `uninstallProtection: true` - Prevents accidental removal
- `minLevel` - Minimum permission level to access (1-5)
- `dangerousOperations: true` - Packages that can modify system

### database/package_permissions.yaml

Seed data for the `PackagePermission` table matching [prisma/schema.prisma:1637](prisma/schema.prisma#L1637).

**Permission Levels (MetaBuilder 6-level system):**
- 0: `public` - Unauthenticated users
- 1: `user` - Authenticated users
- 2: `moderator` - Content moderators
- 3: `admin` - Tenant administrators
- 4: `god` - System administrators
- 5: `supergod` - Super administrators

**Permission Types:**
- `read` - View/access package features
- `write` - Modify package data
- `execute` - Execute package scripts
- `admin` - Full package administration

**Default Permissions:**
- UI packages (header, footer, login) → `public` or `user` level
- Dashboard → `user` level
- User management → `admin` level
- Package management → `god` level
- Database/schema tools → `supergod` only

### config/bootstrap.yaml

Controls how the package system initializes.

**Key Sections:**

**bootstrap:**
- `mode` - auto | manual | interactive
- `failOnError` - Continue if optional packages fail
- `validatePackages` - Verify package.json before installing
- `skipBrokenPackages` - Skip invalid packages

**phases:**
Defines installation phases that map to core-packages.yaml priorities.

**database:**
- `seedFiles` - YAML files to load into database
- `skipIfPopulated` - Don't re-seed existing data
- `useTransactions` - Rollback on failure

**hooks:**
DBAL CLI commands to run at various stages:
- `preBootstrap` - Before any operations
- `postBootstrap` - After successful completion
- `onError` - If bootstrap fails
- `prePhase/postPhase` - Around each installation phase

**Environment Overrides:**
- `development` - Verbose logging, include dev tools
- `production` - Fail on errors, exclude dev tools
- `test` - Always re-seed, use transactions

### config/package-repo.yaml

Package repository configuration.

**Key Sections:**

**sources:**
Where to load packages from (priority order):
- `local` - /packages directory (priority 0)
- Future: remote registries, git repositories

**discovery:**
- `scanPatterns` - Glob patterns to find packages
- `excludePatterns` - Directories to ignore
- `maxConcurrent` - Parallel discovery limit

**validation:**
- `requiredFields` - Must be present in package.json
- `schemaUrl` - JSON schema for validation
- `packageIdPattern` - Regex for valid IDs (snake_case)

**dependencies:**
- `missingDependencies` - error | warn | ignore
- `detectCircular` - Find circular dependency chains

**conflicts:**
- `strategy: priority` - Use lowest-priority source
- `duplicateVersions: newest` - Pick latest version

**security:**
- `sandboxPackageScripts` - Isolate package code
- `disallowedPatterns` - Prevent dangerous code

## Usage

### Bootstrap with DBAL CLI

```bash
# Run bootstrap process
dbal bootstrap --config seed/config/bootstrap.yaml

# Dry run (simulate without changes)
dbal bootstrap --dry-run

# Interactive mode
dbal bootstrap --interactive

# Specific environment
dbal bootstrap --env production
```

### Seed Database Only

```bash
# Seed all database files
dbal seed --dir seed/database

# Seed specific file
dbal seed seed/database/installed_packages.yaml

# Force re-seed (ignore skipIfExists)
dbal seed --force
```

### Validate Configuration

```bash
# Validate all seed files
dbal validate --dir seed

# Validate package definitions
dbal validate seed/packages/core-packages.yaml

# Check database seeds against schema
dbal validate-schema seed/database/*.yaml
```

### Install Specific Packages

```bash
# Install core packages only
dbal install-packages --manifest seed/packages/core-packages.yaml --filter priority=1-3

# Install recommended packages
dbal install-packages --manifest seed/packages/core-packages.yaml --filter section=recommended

# Install development tools
dbal install-packages --manifest seed/packages/core-packages.yaml --filter section=development
```

## Bootstrap Process Flow

1. **Pre-bootstrap hooks** - Run preparation commands
2. **Validate configuration** - Check seed files and package definitions
3. **Phase 1: Core System**
   - Install package_manager
   - Seed database records
   - Verify installation
4. **Phase 2: Base UI**
   - Install ui_header, ui_footer, ui_auth, ui_login
   - Set up permissions
5. **Phase 3-5: Features & Admin**
   - Install dashboard, user management, admin tools
6. **Phase 6: Recommended** (optional)
   - Install notification_center, audit_log, etc.
7. **Phase 7: Development** (dev only)
   - Install testing, validators, editors
8. **Post-bootstrap hooks** - Verification and cleanup
9. **Logging** - Record installation to logs/bootstrap.log

## Integration with Existing System

### Frontend Integration

The bootstrap system integrates with:
- [frontends/nextjs/src/lib/db/packages](frontends/nextjs/src/lib/db/packages) - Package CRUD operations
- [frontends/nextjs/src/lib/packages](frontends/nextjs/src/lib/packages) - Package loading and discovery

### DBAL Integration

Seed files use DBAL entity schemas:
- [dbal/shared/api/schema/entities/core/package.yaml](dbal/shared/api/schema/entities/core/package.yaml)
- Package CRUD operations in [dbal/development/src/core/entities/package](dbal/development/src/core/entities/package)

### Database Schema

Seed data matches Prisma schema:
- [prisma/schema.prisma:327](prisma/schema.prisma#L327) - `InstalledPackage` model
- [prisma/schema.prisma:1637](prisma/schema.prisma#L1637) - `PackagePermission` model

## Customization

### Adding Custom Packages to Bootstrap

1. Edit [seed/packages/core-packages.yaml](seed/packages/core-packages.yaml):

```yaml
packages:
  - packageId: my_custom_package
    version: "1.0.0"
    enabled: true
    priority: 10
    required: false
    description: "My custom functionality"
```

2. Add database seed in [seed/database/installed_packages.yaml](seed/database/installed_packages.yaml):

```yaml
records:
  - packageId: my_custom_package
    tenantId: null
    installedAt: 0
    version: "1.0.0"
    enabled: true
    config: |
      {
        "customSetting": "value"
      }
```

3. Add permissions in [seed/database/package_permissions.yaml](seed/database/package_permissions.yaml):

```yaml
records:
  - id: perm_my_custom_user_read
    packageId: my_custom_package
    role: user
    permission: read
    granted: true
```

### Environment-Specific Bootstrapping

Modify [seed/config/bootstrap.yaml](seed/config/bootstrap.yaml):

```yaml
environments:
  staging:
    bootstrap:
      verbose: true
      failOnError: false
    phases:
      - id: 7
        enabled: true  # Include dev tools in staging
```

### Custom Package Sources

Edit [seed/config/package-repo.yaml](seed/config/package-repo.yaml):

```yaml
sources:
  - id: company-packages
    name: "Company Private Packages"
    type: git
    url: https://github.com/company/metabuilder-packages.git
    priority: 5
    enabled: true
```

## Troubleshooting

### Bootstrap Fails

Check logs:
```bash
cat logs/bootstrap.log
```

Common issues:
- Missing package directories → Verify /packages exists
- Database connection → Check DBAL daemon is running
- Permission denied → Ensure user has supergod role
- Version conflicts → Check package versions in core-packages.yaml

### Package Not Installing

```bash
# Validate package
dbal validate packages/my_package/package.json

# Check for errors
dbal install-package my_package --verbose

# Verify dependencies
dbal check-dependencies my_package
```

### Re-running Bootstrap

Bootstrap is idempotent with `skipIfPopulated: true`. To force re-bootstrap:

```bash
# Clear package data
dbal seed --force seed/database/installed_packages.yaml

# Re-run bootstrap
dbal bootstrap --force
```

## Future Enhancements

- [ ] Remote package registry support
- [ ] Package signing and verification
- [ ] Automatic dependency resolution
- [ ] Package update notifications
- [ ] Rollback capabilities
- [ ] Multi-environment sync
- [ ] Package health checks
- [ ] Usage analytics

## See Also

- [Main README](../README.md) - Project overview
- [Package System Documentation](../README.md#package-system) - Package architecture
- [DBAL Documentation](../dbal/README.md) - Database layer
- [Package Schema Examples](../schemas/package-schemas/examples/README.md) - Package examples
- [6-Level Permission System](../README.md#6-level-permission-system) - Access control

---

**Generated with Claude Code**
