# Root DBAL Seed Data

Minimal bootstrap seed data for the core system. Everything else belongs in packages.

## Philosophy

**Root DBAL seed = minimal. Packages = everything.**

The root seed folder only contains what the DBAL needs to know about:
- Which packages to install
- System-wide permissions and roles

All entity-specific seed data (pages, workflows, credentials, etc.) lives in the packages themselves.

## Structure

```
dbal/shared/seeds/database/
├── installed_packages.yaml    [List of 12 core packages]
└── package_permissions.yaml   [System permissions]
```

That's it. Nothing else belongs here.

## installed_packages.yaml

Lists the 12 packages that bootstrap automatically:

```yaml
entity: InstalledPackage
version: "1.0"
records:
  - packageId: package_manager
    version: "1.0.0"
    enabled: true
    config: |
      {
        "autoUpdate": false,
        "systemPackage": true
      }

  - packageId: ui_home
    version: "1.0.0"
    enabled: true
    config: |
      {
        "systemPackage": true,
        "defaultRoute": "/"
      }

  # ... 10 more packages
```

When bootstrap runs (`POST /api/bootstrap`):
1. DBAL reads this file
2. Creates InstalledPackage records for each
3. For each package, looks for entity folders in `/packages/[packageId]/`
4. Loads seed data from those entity folders

## package_permissions.yaml

System-wide permission and role definitions:

```yaml
entity: PackagePermission
version: "1.0"
records:
  - id: perm_read_public_pages
    packageId: null  # System-wide
    permissionType: "resource"
    resource: "page"
    action: "read"
    level: 0  # Public

  # ... more permissions
```

These define who can do what with packages and resources.

## Data Flow

```
/dbal/shared/seeds/database/installed_packages.yaml
  ↓
  1. DBAL reads package list
  2. Creates InstalledPackage records
  3. For each package, look for entity folders:
    /packages/ui_home/page-config/
    /packages/ui_home/workflow/
    /packages/dashboard/page-config/
    etc.
  4. Load all seed data from those folders
  5. Create records in database
```

## What Should NOT Go Here

❌ PageConfig seed data (goes in `/packages/*/page-config/`)
❌ Workflow definitions (goes in `/packages/*/workflow/`)
❌ Notification templates (goes in `/packages/*/notification/`)
❌ Component definitions (goes in `/packages/*/component/`)
❌ Credential templates (goes in `/packages/*/credential/`)
❌ Package-specific seed data (goes in packages)

These belong in the packages because:
1. They're specific to what each package provides
2. Different installations might load different packages
3. Packages are self-contained units

## Idempotency

All seed data is idempotent:
- Run bootstrap 100 times, same result
- Existing records are skipped
- Safe to run multiple times

## Adding a New Core Package

To add a 13th package to bootstrap:

1. Add to `installed_packages.yaml`:
```yaml
- packageId: new_package
  version: "1.0.0"
  enabled: true
  config: |
    {
      "systemPackage": true
    }
```

2. Create package folder: `/packages/new_package/`

3. Add entity folders with seed data:
```
packages/new_package/
├── page-config/
│   ├── metadata.json
│   └── pages.json
└── workflow/
    ├── metadata.json
    └── workflows.json
```

4. Run bootstrap: `POST /api/bootstrap`

## See Also

- `/packages/PACKAGE_STRUCTURE.md` - Package organization
- `/schemas/seed-data/` - JSON validation schemas
- `/dbal/development/src/seeds/index.ts` - Seed orchestration
- `/packages/SEED_FORMAT.md` - Seed data format
