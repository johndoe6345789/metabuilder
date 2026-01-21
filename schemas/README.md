# MetaBuilder Schemas

This directory contains schema files used across the MetaBuilder project for validation and IDE support.

## Schema Files

### YAML Schemas

**[yaml-schema.yaml](yaml-schema.yaml)** - YAML meta-schema (Draft 2025-11)
- Source: https://github.com/johndoe6345789/yaml-schema
- Purpose: Validates YAML file structure and syntax
- Used by: All `.yaml` files in the project

**Usage in YAML files:**
```yaml
# yaml-language-server: $schema=../../../../../schemas/yaml-schema.yaml
```

**Files using this schema:**
- `packages/*/seed/schema/entities.yaml` - Database entity definitions
- Other YAML configuration files

### JSON Schemas

JSON Schema files are located within individual packages:
- `packages/json_script_example/seed/script.schema.json` - JSON script validation
- `packages/json_script_example/seed/types.schema.json` - Type definitions
- `packages/json_script_example/seed/schema/entities.schema.json` - Entity structure validation
- `packages/json_script_example/tests/test.schema.json` - Test logic validation
- `packages/json_script_example/tests/test-parameters.schema.json` - Test parameters validation

## Adding New Schemas

### For YAML Files

1. Place the schema in this `schemas/` directory
2. Add documentation in this README
3. Reference the schema in YAML files using the `yaml-language-server` directive

### For JSON Files

1. Place the schema alongside the files it validates (in the package directory)
2. Add a `$schema` property to JSON files pointing to the schema
3. Document the schema in the package README

## IDE Support

### VS Code

Install the **YAML extension** by Red Hat for YAML schema validation:
- Extension ID: `redhat.vscode-yaml`
- Provides autocomplete, validation, and hover documentation

JSON schema support is built-in to VS Code.

### JetBrains IDEs

YAML and JSON schema validation is built-in to WebStorm, IntelliJ IDEA, and other JetBrains IDEs.

## Schema Validation Benefits

- ✅ **Real-time validation** - Catch errors while editing
- ✅ **IDE autocomplete** - IntelliSense for properties and values
- ✅ **Documentation** - Hover tooltips explain each field
- ✅ **Type safety** - Ensure files match their specifications
- ✅ **Consistency** - Enforce structure across all files

## Core Database Schemas

Entity definitions are stored in **`/dbal/shared/api/schema/`** using YAML format.

### Schema Directory Structure

```
dbal/shared/api/schema/
├── capabilities.yaml           # API capabilities definition
├── errors.yaml                 # Error type definitions
├── entities/                   # Entity definitions by domain
│   ├── core/                   # Core system entities
│   │   ├── user.yaml          # User accounts & auth
│   │   ├── session.yaml       # User sessions
│   │   ├── workflow.yaml      # Workflow definitions
│   │   ├── package.yaml       # Package metadata
│   │   └── ui_page.yaml       # UI page definitions
│   ├── access/                # Access control entities
│   │   ├── credential.yaml    # API credentials
│   │   ├── component_node.yaml # Component nodes
│   │   └── page_config.yaml   # Page configurations
│   ├── packages/              # Package-specific entities
│   │   ├── forum.yaml         # Forum entities
│   │   ├── notification.yaml  # Notification entities
│   │   ├── audit_log.yaml     # Audit log entities
│   │   ├── media.yaml         # Media entities
│   │   ├── irc.yaml           # IRC entities
│   │   └── streaming.yaml     # Streaming entities
│   ├── ecommerce/             # E-commerce entities
│   │   └── product.yaml       # Product definitions
│   ├── gaming/                # Gaming entities
│   │   └── game.yaml          # Game definitions
│   ├── spotify_clone/         # Spotify clone entities
│   │   └── artist.yaml        # Artist definitions
│   └── youtube_clone/         # YouTube clone entities
│       └── video.yaml         # Video definitions
└── operations/                # Operation definitions
    ├── access/                # Access operation specs
    │   ├── component_node.ops.yaml
    │   ├── credential.ops.yaml
    │   └── page_config.ops.yaml
    └── entities/              # Entity operation specs
        ├── user.ops.yaml
        ├── session.ops.yaml
        ├── package.ops.yaml
        └── workflow.ops.yaml
```

### Entity Schemas Overview

**Core Entities** (`dbal/shared/api/schema/entities/core/`)
- **user.yaml** - User accounts with auth, roles (public/user/moderator/admin/god/supergod)
- **session.yaml** - User session management
- **workflow.yaml** - Workflow definitions
- **package.yaml** - Package metadata
- **ui_page.yaml** - UI page routing

**Access Control Entities** (`dbal/shared/api/schema/entities/access/`)
- **credential.yaml** - API credentials and keys
- **component_node.yaml** - Component node configurations
- **page_config.yaml** - Page configuration settings

**Package Entities** (`dbal/shared/api/schema/entities/packages/`)
- **forum.yaml** - Forum categories, threads, posts
- **notification.yaml** - User notifications and alerts
- **audit_log.yaml** - Audit log entries
- **media.yaml** - Media assets and metadata
- **irc.yaml** - IRC chat entities
- **streaming.yaml** - Streaming content and configuration

**Domain-Specific Entities**
- **ecommerce/product.yaml** - E-commerce products
- **gaming/game.yaml** - Gaming content
- **spotify_clone/artist.yaml** - Music artist data
- **youtube_clone/video.yaml** - Video content

### Package-Level Entity Schemas

Individual packages may define local entity schemas in `entities/schema.json`:

1. **audit_log** - `packages/audit_log/entities/schema.json`
   - Defines `AuditLog` entity for tracking user and system actions
   - Fields: action, entity, entityId, oldValue, newValue, ipAddress, userAgent, timestamp
   - Indexes on: tenantId, userId, entity, action, timestamp

2. **notification_center** - `packages/notification_center/entities/schema.json`
   - Defines `Notification` entity for user alerts and system events
   - Fields: type, title, message, icon, read, data, createdAt, expiresAt
   - Indexes on: tenantId, userId+read, createdAt

3. **workflow_editor** - `packages/workflow_editor/entities/schema.json`
   - Defines workflow-related entities for the workflow editor package

## Package Inventory

For comprehensive documentation of all 62 packages and their file structures, see:
- **[PACKAGES_INVENTORY.md](../PACKAGES_INVENTORY.md)** - Complete package catalog with file listings
- **[PACKAGE_INVENTORY_GUIDE.md](../PACKAGE_INVENTORY_GUIDE.md)** - Guide to using package.json file inventory
