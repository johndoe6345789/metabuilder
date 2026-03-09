# Package Seed Data Format

## Overview

Each MetaBuilder package can include seed data - initial records that populate the database when the system bootstraps. Seed data is:

- **Simple JSON or YAML files** - Just data, no code
- **Entity-specific** - One folder per entity type (e.g., `page-config`, `workflow`)
- **Loaded automatically** - The DBAL seed orchestration loads them in order
- **Idempotent** - Safe to run multiple times (existing records are skipped)

## Structure

```
packages/[packageId]/
├── seed/
│   ├── metadata.json          [Required - manifest file]
│   ├── page-config.json       [Optional - PageConfig records]
│   ├── workflow.json          [Optional - Workflow records]
│   └── ...other entities...
└── ...other package files...
```

## metadata.json Format

The `metadata.json` file tells the system:
1. Which data files to load
2. Basic package information
3. Permission requirements

```json
{
  "$schema": "https://metabuilder.dev/schemas/package-metadata.schema.json",
  "packageId": "ui_home",
  "name": "Home Page",
  "version": "1.0.0",
  "description": "Seed data for ui_home package",
  "author": "MetaBuilder Contributors",
  "license": "MIT",
  "category": "ui",
  "minLevel": 0,
  "primary": true,
  "keywords": ["home", "landing", "seed-data"],
  "seed": {
    "schema": "page-config.json"
  }
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `$schema` | string | No | JSON schema URL for validation |
| `packageId` | string | Yes | Must match package folder name |
| `name` | string | Yes | Human-readable package name |
| `version` | string | Yes | Semantic version (e.g., "1.0.0") |
| `description` | string | Yes | What this seed data does |
| `author` | string | Yes | Creator/maintainer |
| `license` | string | No | Software license (MIT, Apache-2.0, etc.) |
| `category` | string | No | Package category (ui, admin, system, etc.) |
| `minLevel` | number | No | Minimum permission level required (0-5) |
| `primary` | boolean | No | Is this a core system package? |
| `keywords` | array | No | Search keywords |
| `seed.schema` | string | No | Reference to data file (if any) |

## Data File Format

Each data file contains an array of entity records:

```json
[
  {
    "id": "page_ui_home_root",
    "path": "/",
    "title": "MetaBuilder",
    "component": "home_page",
    "level": 0,
    "requiresAuth": false,
    "isPublished": true
  }
]
```

### Important Rules

1. **Array format** - Always a JSON array, even if one record
2. **No code** - Only JSON data, no TypeScript functions
3. **Entity fields** - Use fields defined in the DBAL entity schema
4. **No hardcoding** - Values can be customized via admin panel after seed load

## Entity Types

Common entity types that packages seed:

| Entity | File | Description |
|--------|------|-------------|
| PageConfig | `page-config.json` | Routes/pages that packages expose |
| Workflow | `workflow.json` | Automation workflows |
| Credential | `credential.json` | API credentials or secrets |
| ComponentConfig | `component-config.json` | Reusable component configurations |
| Notification | `notification.json` | Notification templates |

## How Seed Loading Works

1. System calls `POST /api/bootstrap`
2. DBAL reads `/dbal/shared/seeds/database/installed_packages.yaml` (list of packages to install)
3. For each package in the list:
   - Reads `seed/metadata.json`
   - If `seed.schema` is specified, reads that data file
   - Creates records in database using DBAL client
   - Skips if records already exist (idempotent)
4. Returns success/error JSON response

## Example: Page Config Seed

File: `packages/my_package/seed/page-config.json`

```json
[
  {
    "id": "page_my_pkg_dashboard",
    "path": "/my-dashboard",
    "title": "My Dashboard",
    "description": "Custom dashboard for my package",
    "component": "my_dashboard_component",
    "level": 1,
    "requiresAuth": true,
    "isPublished": true
  }
]
```

This creates a new route `/my-dashboard` that loads the component defined in this package.

## Do's and Don'ts

### ✅ DO:

- Keep seed files simple - just data
- Use one file per entity type
- Include metadata for every seed package
- Match entity field names exactly
- Use the admin panel to customize after bootstrap

### ❌ DON'T:

- Add code files to seed folder
- Create documentation markdown in seed folder
- Add nested folder structures
- Include scripts or utilities
- Hardcode sensitive data (use Credential entity instead)

## Bootstrap API

### Endpoint
```
POST /api/bootstrap
```

### Response (Success)
```json
{
  "success": true,
  "message": "Database seeded successfully",
  "packagesInstalled": 12,
  "recordsCreated": 45
}
```

### Response (Error)
```json
{
  "success": false,
  "error": "Failed to create PageConfig: Duplicate path '/'"
}
```

## Multi-Entity Seed

If a package needs to seed multiple entity types:

```
packages/complex_package/
└── seed/
    ├── metadata.json
    ├── page-config.json      [Routes]
    ├── workflow.json         [Workflows]
    └── credential.json       [Credentials]
```

Update `metadata.json` to reference all:

```json
{
  ...other fields...,
  "seed": {
    "pageConfig": "page-config.json",
    "workflow": "workflow.json",
    "credential": "credential.json"
  }
}
```

Then update `/dbal/development/src/seeds/index.ts` to load all referenced files.

## Guidelines

1. **Keep it minimal** - Only include essential bootstrap data
2. **Describe your data** - Use meaningful field values, not placeholder text
3. **Version your data** - Update version in metadata when seed data changes
4. **Test idempotency** - Seed should be safe to run multiple times
5. **Document changes** - When modifying seed data, update the description field

## See Also

- `/dbal/development/src/seeds/index.ts` - Seed orchestration implementation
- `/dbal/shared/api/schema/entities/` - Entity definitions (source of truth for fields)
- `/packages/ui_home/seed/` - Example: home page seed data
- `CLAUDE.md` - Seed folder guidelines and mistakes to avoid
