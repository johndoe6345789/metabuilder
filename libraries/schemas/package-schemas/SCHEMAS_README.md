# MetaBuilder Schemas

Complete JSON Schema collection for MetaBuilder packages, providing declarative definitions for all aspects of package development.

## 📋 Schema Overview

### Core Schemas (Existing)

1. **metadata_schema.json** - Package metadata and configuration
2. **entities_schema.json** - Database entity definitions
3. **types_schema.json** - TypeScript-style type definitions
4. **script_schema.json** - JSON-based scripting language
5. **components_schema.json** - UI component definitions
6. **validation_schema.json** - Validation function definitions
7. **styles_schema.json** - Design tokens and styles

### New Schemas (Added)

8. **api_schema.json** - REST/GraphQL API endpoint definitions
9. **events_schema.json** - Event-driven architecture definitions
10. **config_schema.json** - Configuration and environment variables
11. **jobs_schema.json** - Background jobs and scheduled tasks
12. **permissions_schema.json** - RBAC and access control
13. **forms_schema.json** - Dynamic form definitions
14. **migrations_schema.json** - Database migration definitions
15. **assets_schema.json** - Static assets (images, fonts, icons, files)
16. **index_schema.json** - Master schema index
17. **storybook_schema.json** - Storybook configuration for package preview

## 🚀 Quick Start

### Package Structure

```
my-package/
├── package.json              # metadata_schema.json
├── entities/
│   └── schema.json          # entities_schema.json
├── types/
│   └── index.json           # types_schema.json
├── scripts/
│   └── [script-name].json   # script_schema.json (e.g., automation.json)
├── components/
│   └── ui.json              # components_schema.json
├── validation/
│   └── validators.json      # validation_schema.json
├── styles/
│   └── tokens.json          # styles_schema.json
├── api/
│   └── routes.json          # api_schema.json
├── events/
│   └── definitions.json     # events_schema.json
├── config/
│   └── settings.json        # config_schema.json
├── jobs/
│   └── tasks.json           # jobs_schema.json
├── permissions/
│   └── roles.json           # permissions_schema.json
├── forms/
│   └── forms.json           # forms_schema.json
├── migrations/
│   └── versions.json        # migrations_schema.json
└── storybook/
    └── config.json          # storybook_schema.json
```

## 📚 Schema Details

### 1. Metadata Schema
**Purpose**: Package identification, versioning, dependencies, and exports

**Key Features**:
- Semantic versioning with pre-release support
- Dependency management with version constraints
- License and repository information
- Storybook integration
- Test configuration

**Example**:
```json
{
  "$schema": "https://metabuilder.dev/schemas/package-metadata.schema.json",
  "packageId": "my-package",
  "name": "My Package",
  "version": "1.0.0",
  "description": "A sample package",
  "dependencies": {
    "core-utils": "^1.0.0"
  }
}
```

### 2. Entities Schema
**Purpose**: Database schema definitions with relationships and ACL

**Key Features**:
- Composite primary keys
- Soft delete support
- Auto-timestamps
- Relationships (belongsTo, hasMany, hasOne, manyToMany)
- Row-level security

**Example**:
```json
{
  "entities": [
    {
      "name": "User",
      "version": "1.0",
      "fields": {
        "id": { "type": "uuid", "primary": true },
        "email": { "type": "string", "unique": true },
        "name": { "type": "string" }
      },
      "timestamps": true,
      "softDelete": true
    }
  ]
}
```

### 3. Types Schema
**Purpose**: TypeScript-style type definitions

**Key Features**:
- Generic types with constraints
- Union and intersection types
- Tuple types
- Utility types (Pick, Omit, Partial, etc.)
- Type inheritance

**Example**:
```json
{
  "types": [
    {
      "id": "user_type",
      "name": "User",
      "kind": "object",
      "properties": {
        "id": { "type": "string", "required": true },
        "email": { "type": "string", "required": true }
      }
    }
  ]
}
```

### 4. Script Schema
**Purpose**: JSON-based scripting with full language features

**Key Features**:
- Async/await support
- Arrow functions
- Destructuring
- Switch statements
- While loops
- Template literals

**Example**:
```json
{
  "functions": [
    {
      "id": "greet",
      "name": "greet",
      "params": [{ "name": "name", "type": "string" }],
      "body": [
        {
          "type": "return",
          "value": {
            "type": "template_literal",
            "parts": ["Hello, ", { "type": "identifier", "name": "name" }]
          }
        }
      ]
    }
  ]
}
```

### 5. Components Schema
**Purpose**: Declarative UI component definitions

**Key Features**:
- Props with validation
- State management
- Event handlers
- Computed properties
- Conditional rendering
- List iteration

**Example**:
```json
{
  "components": [
    {
      "id": "button",
      "name": "Button",
      "props": [
        { "name": "text", "type": "string", "required": true },
        { "name": "onClick", "type": "function" }
      ],
      "render": {
        "type": "element",
        "template": {
          "type": "button",
          "onClick": "onClick",
          "children": "{{ props.text }}"
        }
      }
    }
  ]
}
```

### 6. Validation Schema
**Purpose**: Reusable validation functions

**Key Features**:
- Common patterns (email, URL, UUID, etc.)
- Async validators
- Severity levels
- Composable validators
- Security (sanitization)

**Example**:
```json
{
  "patterns": {
    "email": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  },
  "functions": [
    {
      "id": "validate_email",
      "name": "validateEmail",
      "params": [{ "name": "email", "type": "string" }],
      "returnType": "boolean"
    }
  ]
}
```

### 7. Styles Schema
**Purpose**: Design tokens and style system

**Key Features**:
- Color palettes
- Typography scales
- Spacing system
- Animations
- Responsive breakpoints
- Opacity and blur values

**Example**:
```json
{
  "colors": {
    "primary": "#007bff",
    "secondary": "#6c757d"
  },
  "spacing": {
    "sm": "8px",
    "md": "16px",
    "lg": "24px"
  }
}
```

### 8. API Schema (NEW)
**Purpose**: REST and GraphQL API definitions

**Key Features**:
- Route definitions with parameters
- Authentication configuration
- Rate limiting
- CORS settings
- Request/response schemas
- GraphQL resolver mappings

**Example**:
```json
{
  "basePath": "/api/v1",
  "routes": [
    {
      "path": "/users/:id",
      "method": "GET",
      "handler": "getUser",
      "auth": { "type": "bearer", "required": true },
      "params": [
        { "name": "id", "type": "string", "required": true }
      ]
    }
  ]
}
```

### 9. Events Schema (NEW)
**Purpose**: Event-driven architecture

**Key Features**:
- Event definitions with versioning
- Pub/sub subscribers
- Channels and topics
- Retry policies
- Dead letter queues
- Event replay

**Example**:
```json
{
  "events": [
    {
      "name": "user.created",
      "version": "1.0.0",
      "payload": "User"
    }
  ],
  "subscribers": [
    {
      "id": "welcome_email",
      "events": ["user.created"],
      "handler": "sendWelcomeEmail"
    }
  ]
}
```

### 10. Config Schema (NEW)
**Purpose**: Configuration management

**Key Features**:
- Environment variables
- Feature flags with rollout
- Secret management
- Multiple config providers
- Type validation
- A/B testing variants

**Example**:
```json
{
  "variables": [
    {
      "name": "DATABASE_URL",
      "type": "url",
      "required": true,
      "sensitive": true
    }
  ],
  "featureFlags": [
    {
      "name": "new-dashboard",
      "enabled": false,
      "environments": {
        "production": {
          "enabled": true,
          "rollout": { "percentage": 50 }
        }
      }
    }
  ]
}
```

### 11. Jobs Schema (NEW)
**Purpose**: Background jobs and scheduled tasks

**Key Features**:
- Cron scheduling
- Job queues with priorities
- Retry strategies
- Job dependencies
- Rate limiting
- Dead letter queues

**Example**:
```json
{
  "jobs": [
    {
      "id": "daily_report",
      "name": "Daily Report",
      "handler": "generateDailyReport",
      "schedule": "0 0 * * *",
      "retry": {
        "maxAttempts": 3,
        "backoff": "exponential"
      }
    }
  ]
}
```

### 12. Permissions Schema (NEW)
**Purpose**: RBAC and access control

**Key Features**:
- Role hierarchy
- Permission inheritance
- Resource-based access
- ABAC support
- Policy engine
- Conditional access

**Example**:
```json
{
  "roles": [
    {
      "id": "admin",
      "name": "Administrator",
      "level": 100,
      "permissions": ["users.*", "settings.*"]
    }
  ],
  "permissions": [
    {
      "id": "users.create",
      "resource": "users",
      "action": "create",
      "effect": "allow"
    }
  ]
}
```

### 13. Forms Schema (NEW)
**Purpose**: Dynamic form definitions

**Key Features**:
- Field types (text, select, date, etc.)
- Validation rules
- Conditional logic
- Multi-step forms
- Cross-field validation
- Custom components

**Example**:
```json
{
  "forms": [
    {
      "id": "user_form",
      "name": "User Form",
      "fields": [
        {
          "name": "email",
          "type": "email",
          "required": true,
          "validation": {
            "email": true
          }
        }
      ]
    }
  ]
}
```

### 14. Migrations Schema (NEW)
**Purpose**: Database migrations

**Key Features**:
- Up/down migrations
- Table operations
- Column modifications
- Index management
- Foreign keys
- Data seeding

**Example**:
```json
{
  "migrations": [
    {
      "version": "001",
      "timestamp": "2024-01-01T00:00:00Z",
      "description": "Create users table",
      "up": [
        {
          "type": "createTable",
          "table": "users",
          "columns": [
            { "name": "id", "type": "uuid", "primary": true },
            { "name": "email", "type": "string", "unique": true }
          ]
        }
      ]
    }
  ]
}
```

### 15. Assets Schema (NEW)
**Purpose**: Static asset management (images, fonts, icons, files)

**Key Features**:
- Image assets with responsive variants
- Font definitions with multiple formats
- Icon management (SVG, PNG, sprite sheets)
- Generic file assets (PDFs, documents)
- Video and audio assets
- CDN configuration
- Optimization settings (compression, formats)
- Caching strategies
- Asset metadata and licensing

**Example**:
```json
{
  "basePath": "/assets",
  "images": [
    {
      "id": "logo",
      "path": "/images/logo.svg",
      "alt": "Company Logo",
      "format": "svg",
      "priority": "high",
      "variants": [
        {
          "width": 200,
          "path": "/images/logo-200.webp",
          "format": "webp"
        }
      ]
    }
  ],
  "fonts": [
    {
      "id": "primary_font",
      "family": "Inter",
      "category": "sans-serif",
      "files": [
        {
          "path": "/fonts/inter-regular.woff2",
          "format": "woff2",
          "weight": 400
        }
      ],
      "display": "swap",
      "preload": true
    }
  ],
  "optimization": {
    "images": {
      "compress": true,
      "quality": 85,
      "formats": ["webp", "avif", "original"],
      "responsive": true
    }
  }
}
```

## 🔧 Validation

### 16. Storybook Schema (NEW)
**Purpose**: Storybook configuration for package preview and documentation

**Key Features**:
- Story definitions with render function references
- Interactive controls for function/component arguments
- Context variants for testing different user scenarios
- Package-level rendering configuration
- Storybook parameters (backgrounds, viewport, layout)
- Auto-discovery configuration
- Support for featured packages and renders

**Example**:
```json
{
  "$schema": "https://metabuilder.dev/schemas/package-storybook.schema.json",
  "featured": true,
  "title": "Dashboard Components",
  "description": "Dashboard layouts and stat cards",
  "stories": [
    {
      "name": "StatsCard",
      "render": "stats",
      "description": "Single stat card with trend indicator"
    },
    {
      "name": "DashboardLayout",
      "render": "layout"
    }
  ],
  "renders": {
    "stats.card": {
      "description": "Single stat card with trend indicator",
      "featured": true
    }
  },
  "contextVariants": [
    {
      "name": "Admin",
      "context": { "user": { "level": 4 } }
    },
    {
      "name": "Guest",
      "context": { "user": { "level": 1 } }
    }
  ],
  "parameters": {
    "layout": "fullscreen",
    "backgrounds": { "default": "light" }
  }
}
```

All schemas are valid JSON Schema Draft-07. Validate your data:

```bash
# Using ajv-cli
npm install -g ajv-cli
ajv validate -s api_schema.json -d my-api.json
```

## 🔗 Schema Relationships

```
metadata_schema.json (root)
├── entities_schema.json (database)
├── types_schema.json (type system)
├── scripts_schema.json (business logic)
│   └── validation_schema.json (validators)
├── components_schema.json (UI)
│   └── styles_schema.json (styling)
├── api_schema.json (endpoints)
│   ├── types_schema.json (request/response types)
│   └── permissions_schema.json (auth)
├── events_schema.json (messaging)
├── config_schema.json (settings)
├── jobs_schema.json (background tasks)
├── permissions_schema.json (access control)
│   └── entities_schema.json (resource definitions)
├── forms_schema.json (user input)
│   └── validation_schema.json (form validation)
├── migrations_schema.json (schema evolution)
│   └── entities_schema.json (target schema)
└── storybook_schema.json (preview/docs)
    ├── components_schema.json (story components)
    └── scripts_schema.json (render functions)
```

## 📦 NPM Package Usage

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "metabuilder": {
    "schemas": {
      "metadata": "./package.json",
      "entities": "./entities/schema.json",
      "api": "./api/routes.json",
      "events": "./events/definitions.json"
    }
  }
}
```

## 🛠️ Development Tools

### Schema Validation
```javascript
const Ajv = require('ajv');
const ajv = new Ajv();

const schema = require('./api_schema.json');
const data = require('./my-api.json');

const valid = ajv.validate(schema, data);
if (!valid) console.log(ajv.errors);
```

### TypeScript Generation
```bash
# Generate TypeScript types from schemas
json2ts api_schema.json > api.types.ts
```

## 📖 Best Practices

1. **Version all schemas** - Use schemaVersion in every file
2. **Validate early** - Validate during development, not production
3. **Use references** - Link between schemas with $ref
4. **Document everything** - Use description fields
5. **Follow naming conventions**:
   - PascalCase for types and components
   - snake_case for IDs
   - UPPER_SNAKE_CASE for constants
   - kebab-case for package IDs

## 🔄 Migration Guide

### From Old to New Schema Format

```json
// Old (deprecated)
{
  "schema_version": "1.0.0"
}

// New
{
  "schemaVersion": "1.0.0"
}
```

See FIXES_SUMMARY.md for complete migration guide.

## 🤝 Contributing

When adding new schemas:
1. Follow JSON Schema Draft-07 spec
2. Include comprehensive examples
3. Add to index_schema.json
4. Update this README
5. Provide migration path if breaking changes

## 📄 License

MIT License - see individual package metadata for details

## 🔗 Resources

- [JSON Schema Spec](https://json-schema.org/)
- [MetaBuilder Documentation](https://metabuilder.dev)
- [Schema Registry](https://metabuilder.dev/schemas)

---

**Schema Version**: 2.0.0
**Last Updated**: 2026-01-01
**Maintained by**: MetaBuilder Team
