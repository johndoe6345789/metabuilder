# Package Inventory Guide

## Overview

All 62 MetaBuilder packages now include comprehensive file inventories in their `package.json` files. This enables automated tooling, discovery, and documentation generation.

## New `files` Section in package.json

Each package now includes a `files` section that documents:

### 1. Directories

Lists all top-level subdirectories in the package:

```json
"files": {
  "directories": [
    "components",
    "page-config",
    "permissions",
    "static_content",
    "storybook",
    "styles",
    "tests",
    "workflow"
  ]
}
```

### 2. Files by Type

Organizes files into semantic categories:

```json
"byType": {
  "components": ["components/ui.json"],
  "pages": ["page-config/page-config.json", "page-config/metadata.json"],
  "workflows": [
    "workflow/fetch-dashboard-data.jsonscript",
    "workflow/fetch-user-profile.jsonscript"
  ],
  "tests": [
    "tests/metadata.test.json",
    "tests/metadata.params.json",
    "playwright/tests.json"
  ],
  "config": ["package.json", "storybook/config.json"],
  "permissions": ["permissions/roles.json"],
  "styles": ["styles/tokens.json"],
  "seeds": ["seed/metadata.json"],
  "schemas": ["entities/schema.json"],
  "other": ["static_content/icon.svg"]
}
```

## File Categories

| Category | Purpose | Example Files |
|----------|---------|----------------|
| **components** | UI component definitions | `components/ui.json` |
| **pages** | Page routes and configurations | `page-config/page-config.json` |
| **workflows** | JSON Script workflows | `workflow/*.jsonscript` |
| **tests** | Test specifications | `tests/*.test.json`, `playwright/tests.json` |
| **config** | Configuration files | `package.json`, `storybook/config.json` |
| **permissions** | Role and permission definitions | `permissions/roles.json` |
| **styles** | Design tokens and styles | `styles/tokens.json` |
| **seeds** | Seed data and metadata | `seed/metadata.json` |
| **schemas** | Entity schema definitions | `entities/schema.json` |
| **other** | Static assets and miscellaneous | `static_content/icon.svg` |

## Usage Examples

### Finding Files by Type

To programmatically find all workflow files in a package:

```javascript
const pkg = require('./packages/dashboard/package.json');
const workflows = pkg.files.byType.workflows || [];
console.log(workflows);
// Output: ["workflow/fetch-dashboard-data.jsonscript", ...]
```

### Discovering Package Capabilities

Check if a package has tests:

```javascript
if (pkg.files.byType.tests && pkg.files.byType.tests.length > 0) {
  console.log(`Package has ${pkg.files.byType.tests.length} test files`);
}
```

### Building Documentation

Use file inventory to generate package documentation:

```javascript
const fs = require('fs');

Object.entries(pkg.files.byType).forEach(([type, files]) => {
  if (files.length > 0) {
    console.log(`## ${type.toUpperCase()}`);
    files.forEach(file => console.log(`- ${file}`));
  }
});
```

## Package Inventory Document

A master document listing all packages is available at:

**[PACKAGES_INVENTORY.md](./PACKAGES_INVENTORY.md)**

This document includes:
- All 62 packages organized by category (UI, Tools, Testing, etc.)
- Package metadata (name, version, description)
- Complete directory structure for each package
- File inventory by type

## Packages with Entity Schemas

The following packages define custom database entity schemas:

### 1. audit_log
- **Entity**: `AuditLog`
- **Schema**: `entities/schema.json`
- **Fields**: id, tenantId, userId, action, entity, entityId, oldValue, newValue, ipAddress, userAgent, timestamp
- **Purpose**: Track user and system actions for security auditing

### 2. notification_center
- **Entity**: `Notification`
- **Schema**: `entities/schema.json`
- **Fields**: id, tenantId, userId, type, title, message, icon, read, data, createdAt, expiresAt
- **Purpose**: User notifications for alerts and system events

### 3. workflow_editor
- **Schema**: `entities/schema.json`
- **Purpose**: Workflow-related entities

## File Type Distribution

Across all 62 packages:

- **UI Packages** (28): Contain components, pages, and styles
- **Tool Packages** (10): Contain editors, validators, managers
- **Testing Packages** (4): Contain comprehensive test suites
- **Development Tools** (6): Support development workflows

## Adding Files to New Packages

When creating a new package, ensure the `files` section includes:

1. **All directories** at the top level
2. **All files** organized by semantic category
3. **No duplicate files** across categories
4. **Optional categories** can be omitted if empty

Example for a minimal package:

```json
{
  "packageId": "my_package",
  "name": "My Package",
  "files": {
    "directories": ["components", "tests", "styles"],
    "byType": {
      "components": ["components/ui.json"],
      "tests": ["tests/test.json"],
      "styles": ["styles/tokens.json"]
    }
  }
}
```

## Integration Points

The file inventory enables:

- **Automated Discovery**: Tools can discover what files a package contains
- **Documentation Generation**: Auto-generate package documentation
- **Build Validation**: Verify required files are present
- **Test Running**: Automatically find and run test files
- **Schema Validation**: Locate and validate schema files
- **IDE Support**: Provide intelligent package exploration

## Benefits

✅ **Discoverability** - Easily find files by type or purpose
✅ **Automation** - Enable tooling to work with package files
✅ **Documentation** - Generate accurate, up-to-date docs
✅ **Validation** - Verify package structure and completeness
✅ **Maintenance** - Track which files belong to which package

## See Also

- [PACKAGES_INVENTORY.md](./PACKAGES_INVENTORY.md) - Master package catalog
- [CLAUDE.md](./CLAUDE.md) - Development guidelines
- [schemas/README.md](./schemas/README.md) - Schema documentation
