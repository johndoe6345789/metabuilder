# MetaBuilder Schemas - Comprehensive Reference

Complete documentation of all 27 schema files in `/schemas/package-schemas/` and core database schemas in `/dbal/shared/api/schema/`.

**Last Updated**: 2026-01-21
**Total Schemas**: 27 JSON schemas + 27 YAML entity definitions

---

## Schema Files Index

### Core Package Schemas (16 files)

| Schema | File | Purpose | Required Fields |
|--------|------|---------|-----------------|
| **Package Metadata** | metadata_schema.json | Package info, version, deps | packageId, name, version, description |
| **Entities** | entities_schema.json | Database schema definitions | schemaVersion, entities |
| **Types** | types_schema.json | TypeScript-style types | schemaVersion, package, types |
| **Scripts** | script_schema.json | JSON scripting language v2.2.0 | schemaVersion, package |
| **Components** | components_schema.json | Declarative UI components | schemaVersion, package |
| **Validation** | validation_schema.json | Validation functions | schemaVersion, package |
| **Styles** | styles_schema.json | Design tokens & themes | schemaVersion |
| **API** | api_schema.json | REST/GraphQL endpoints | schemaVersion, package |
| **Events** | events_schema.json | Event-driven architecture | schemaVersion, package |
| **Config** | config_schema.json | Environment configuration | schemaVersion, package |
| **Jobs** | jobs_schema.json | Background tasks & scheduling | schemaVersion, package |
| **Permissions** | permissions_schema.json | RBAC & access control | schemaVersion, package |
| **Forms** | forms_schema.json | Dynamic form definitions | schemaVersion, package |
| **Migrations** | migrations_schema.json | Database migrations | schemaVersion, package |
| **Assets** | assets_schema.json | Static assets (images, fonts) | schemaVersion, package |
| **Storybook** | storybook_schema.json | Storybook configuration | $schema |

### Utility Schemas (11 files)

| Schema | File | Purpose |
|--------|------|---------|
| **Index** | index_schema.json | Master index & cross-validation |
| **Standard Library** | stdlib_schema.json | Built-in functions for scripts |
| **Tests** | tests_schema.json | Parameterized unit tests |
| **Test Parameters** | test-parameters_schema.json | Test input parameters |
| **Playwright** | playwright.schema.json | E2E test configuration |
| **Storybook Common** | storybook-common-definitions.json | Shared Storybook definitions |
| **Component** | component.schema.json | Individual component definitions |
| **Credential** | credential.schema.json | API credentials |
| **Notification** | notification.schema.json | Notification templates |
| **Page Config** | page-config.schema.json | Page route configurations |
| **Workflow** | workflow.schema.json | Workflow definitions |

---

## Core Database Schemas

**Location**: `/dbal/shared/api/schema/`

### System-Level Files
- `capabilities.yaml` - API capabilities definition
- `errors.yaml` - Error type definitions

### Entity Definitions by Domain

#### Core System Entities (5)
- `entities/core/user.yaml` - User accounts with roles
- `entities/core/session.yaml` - Session management
- `entities/core/workflow.yaml` - Workflow definitions
- `entities/core/package.yaml` - Package metadata
- `entities/core/ui_page.yaml` - UI page routing

#### Access Control Entities (3)
- `entities/access/credential.yaml` - API credentials
- `entities/access/component_node.yaml` - Component nodes
- `entities/access/page_config.yaml` - Page configurations

#### Package-Specific Entities (6)
- `entities/packages/forum.yaml` - Forum content
- `entities/packages/notification.yaml` - Notifications
- `entities/packages/audit_log.yaml` - Audit logs
- `entities/packages/media.yaml` - Media assets
- `entities/packages/irc.yaml` - IRC chat
- `entities/packages/streaming.yaml` - Streaming content

#### Domain-Specific Entities (4)
- `entities/ecommerce/product.yaml` - E-commerce products
- `entities/gaming/game.yaml` - Gaming content
- `entities/spotify_clone/artist.yaml` - Music artists
- `entities/youtube_clone/video.yaml` - Videos

### Operation Specifications (7)

#### Access Operations (3)
- `operations/access/component_node.ops.yaml`
- `operations/access/credential.ops.yaml`
- `operations/access/page_config.ops.yaml`

#### Entity Operations (4)
- `operations/entities/user.ops.yaml`
- `operations/entities/session.ops.yaml`
- `operations/entities/package.ops.yaml`
- `operations/entities/workflow.ops.yaml`

---

## Schema Details

### 1. metadata_schema.json
**Package metadata and configuration**

Required fields:
- `packageId` - Unique identifier (snake_case or kebab-case)
- `name` - Human-readable name
- `version` - Semantic version
- `description` - Package description

Optional fields:
- `author`, `license`, `repository`, `homepage`, `bugs`
- `keywords`, `category`, `icon`
- `minLevel` (0-6), `primary` (boolean), `private` (boolean)
- `dependencies`, `devDependencies`, `peerDependencies`
- `exports` (scripts, types, components, constants)
- `deprecated` (boolean or object with reason)

### 2. entities_schema.json
**Database entity definitions**

Structure:
- `schemaVersion` - Version (e.g., "2.0.0")
- `entities` - Array of entity definitions

Entity properties:
- `name` - PascalCase entity name
- `version` - Entity schema version
- `fields` - Field definitions with types, constraints
- `primaryKey` - Single field or composite keys
- `timestamps` - Auto createdAt/updatedAt
- `softDelete` - Enable soft delete
- `indexes` - Database indexes
- `relations` - Relationships to other entities
- `acl` - Access control rules

### 3. types_schema.json
**TypeScript-style type definitions**

Structure:
- `schemaVersion` - Version
- `package` - Package ID
- `types` - Array of type definitions

Type properties:
- `id` - Type identifier
- `name` - Type name
- `kind` - object, interface, union, enum, etc.
- `properties` - Object properties
- `items` - Array item type
- `generics` - Generic type parameters
- `extends` - Type inheritance

### 4. script_schema.json (v2.2.0)
**JSON-based scripting language**

Structure:
- `schemaVersion` - "2.2.0"
- `package` - Package ID
- `imports` - Module imports
- `constants` - Constant definitions
- `functions` - Function definitions

Function properties:
- `id`, `name` - Function identifier
- `params` - Parameter definitions
- `returnType` - Return type
- `body` - Function body (array of statements)
- `async` - Is asynchronous
- `pure` - Pure function (enables memoization)
- `visual` - Visual programming metadata

### 5. components_schema.json
**Declarative UI components**

Structure:
- `schemaVersion` - Version
- `package` - Package ID
- `components` - Array of component definitions

Component properties:
- `id`, `name` - Component identifier
- `props` - Component properties
- `state` - Internal state
- `events` - Event handlers
- `render` - Render definition
- `computed` - Computed properties
- `lifecycle` - Lifecycle hooks

### 6. validation_schema.json
**Validation utility functions**

Structure:
- `schemaVersion` - Version
- `package` - Package ID
- `patterns` - Regex patterns
- `functions` - Validator functions

Validator properties:
- `id`, `name` - Validator identifier
- `params` - Input parameters
- `returnType` - Return type
- `severity` - error, warning, info
- `sanitize` - Sanitize inputs (default: true)
- `sanitizeOptions` - HTML/SQL injection protection

### 7. styles_schema.json
**Design tokens and style system**

Properties:
- `schemaVersion` - Version
- `colors` - Color palette
- `typography` - Font definitions
- `spacing` - Spacing scale
- `animations` - Animation definitions
- `breakpoints` - Responsive breakpoints
- `shadows`, `opacity`, `blur` - Visual effects

### 8. api_schema.json
**REST and GraphQL API endpoints**

Structure:
- `schemaVersion` - Version
- `package` - Package ID
- `basePath` - Base API path
- `routes` - API route definitions

Route properties:
- `path` - URL path
- `method` - HTTP method
- `handler` - Handler function
- `auth` - Authentication requirement
- `rateLimit` - Rate limiting
- `params` - Path/query parameters
- `body` - Request body schema
- `response` - Response schemas

### 9. events_schema.json
**Event-driven architecture**

Structure:
- `schemaVersion` - Version
- `package` - Package ID
- `events` - Event definitions
- `subscribers` - Event subscribers

Event properties:
- `name` - Event name (e.g., "user.created")
- `version` - Event version
- `payload` - Payload schema
- `description` - Event description

### 10. config_schema.json
**Configuration and environment variables**

Properties:
- `schemaVersion` - Version
- `package` - Package ID
- `variables` - Environment variables
- `featureFlags` - Feature flag definitions
- `defaults` - Default values

### 11. jobs_schema.json
**Background jobs and scheduled tasks**

Structure:
- `schemaVersion` - Version
- `package` - Package ID
- `jobs` - Job definitions

Job properties:
- `id`, `name` - Job identifier
- `handler` - Handler function
- `schedule` - Cron schedule or interval
- `retry` - Retry strategy
- `timeout` - Job timeout
- `priority` - Job priority

### 12. permissions_schema.json
**RBAC and access control**

Structure:
- `schemaVersion` - Version
- `package` - Package ID
- `roles` - Role definitions
- `permissions` - Permission definitions

Role properties:
- `id`, `name` - Role identifier
- `level` - Permission level (0-100)
- `permissions` - Assigned permissions
- `parent` - Parent role (inheritance)

### 13. forms_schema.json
**Dynamic form definitions**

Structure:
- `schemaVersion` - Version
- `package` - Package ID
- `forms` - Form definitions

Form properties:
- `id`, `name` - Form identifier
- `fields` - Form field definitions
- `validation` - Form-level validation
- `onSubmit` - Submit handler
- `layout` - Layout configuration

### 14. migrations_schema.json
**Database migrations**

Structure:
- `schemaVersion` - Version
- `package` - Package ID
- `migrations` - Migration definitions

Migration properties:
- `version` - Migration version
- `timestamp` - Migration timestamp
- `description` - Migration description
- `up` - Upgrade operations
- `down` - Rollback operations

### 15. assets_schema.json
**Static asset definitions**

Properties:
- `schemaVersion` - Version
- `package` - Package ID
- `basePath` - Base asset path
- `images` - Image assets
- `fonts` - Font definitions
- `icons` - Icon assets
- `files` - Generic files
- `optimization` - Compression settings

### 16. storybook_schema.json
**Storybook configuration**

Properties:
- `$schema` - Schema reference
- `featured` - Featured package
- `title` - Storybook title
- `stories` - Story definitions
- `renders` - Render function definitions
- `contextVariants` - User scenario variants
- `parameters` - Storybook parameters

---

## Usage in Packages

### Adding $schema References

Each package file should reference the appropriate schema:

```json
{
  "$schema": "https://metabuilder.dev/schemas/package-metadata.schema.json",
  ...
}
```

### File Organization

```
my-package/
├── package.json                    # metadata_schema.json
├── entities/schema.json            # entities_schema.json
├── types/index.json                # types_schema.json
├── scripts/workflow.json           # script_schema.json
├── components/ui.json              # components_schema.json
├── validation/validators.json      # validation_schema.json
├── styles/tokens.json              # styles_schema.json
├── api/routes.json                 # api_schema.json
├── events/handlers.json            # events_schema.json
├── config/settings.json            # config_schema.json
├── jobs/tasks.json                 # jobs_schema.json
├── permissions/roles.json          # permissions_schema.json
├── forms/forms.json                # forms_schema.json
├── migrations/001_init.json        # migrations_schema.json
├── assets/assets.json              # assets_schema.json
├── storybook/config.json           # storybook_schema.json
├── tests/test.json                 # tests_schema.json
└── playwright/tests.json           # playwright.schema.json
```

---

## Security Features

### Input Sanitization (validation_schema.json)
- XSS protection enabled by default
- SQL injection protection
- HTML tag whitelisting
- Script stripping

### Password Validation
- Minimum length enforcement
- Complexity requirements
- Secure hashing ready

### Rate Limiting (api_schema.json)
- Per-route rate limits
- Global rate limiting
- Custom window sizes

---

## Validation & Tools

### Schema Validation
```bash
./schemas/package-schemas/schema_validator.sh my-file.json
```

### Cross-Schema Validation (index_schema.json)
12 automatic validation rules:
1. function-handler-exists
2. component-handler-exists
3. type-reference-exists
4. entity-reference-exists
5. permission-reference-exists
6. circular-dependencies
7. event-handler-exists
8. job-handler-exists
9. form-validator-exists
10. migration-entity-matches
11. max-function-complexity
12. secure-password-validation

---

## Standard Library (stdlib_schema.json)

Built-in function modules:
- `string.*` - String manipulation
- `array.*` - Array operations
- `object.*` - Object utilities
- `math.*` - Mathematical functions
- `date.*` - Date/time handling
- `validation.*` - Validators
- `http.*` - HTTP requests
- `db.*` - Database operations

---

## Documentation Resources

- **Quick Start**: `schemas/package-schemas/QUICKSTART.md`
- **Full Reference**: `schemas/package-schemas/SCHEMAS_README.md`
- **Improvements**: `schemas/package-schemas/IMPROVEMENTS_SUMMARY.md`
- **Script Deep Dive**: `schemas/package-schemas/SCRIPT_SCHEMA_DEEP_DIVE.md`
- **Code Review**: `schemas/package-schemas/CODE_REVIEW_IMPROVEMENTS.md`
- **Playwright**: `schemas/package-schemas/PLAYWRIGHT_SCHEMA_README.md`
- **n8n Mapping**: `schemas/package-schemas/N8N_WORKFLOW_MAPPING.md`

---

## Version History

- **v2.2.0** (Current) - JSON Script enhancements, visual programming support
- **v2.0.0** - Security improvements, new schemas added
- **v1.0.0** - Initial release

---

**See Also**:
- [PACKAGES_INVENTORY.md](./PACKAGES_INVENTORY.md) - All 62 packages documented
- [PACKAGE_INVENTORY_GUIDE.md](./PACKAGE_INVENTORY_GUIDE.md) - Package.json file inventory guide
