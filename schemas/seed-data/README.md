# Seed Data Schemas

JSON schemas for validating package entity seed data files. These ensure seed data is well-formed before being loaded into the database.

## Entity Types

Each entity type has a corresponding JSON Schema file:

### page-config.schema.json
Validates PageConfig seed data - routes and pages exposed by packages.

**Location**: `packages/[packageId]/page-config/*.json`

**Required fields**: id, path, title, component

**Example**:
```json
[
  {
    "id": "page_ui_home_root",
    "path": "/",
    "title": "Home",
    "component": "home_page",
    "level": 0,
    "requiresAuth": false,
    "isPublished": true
  }
]
```

### workflow.schema.json
Validates Workflow seed data - automation workflows and processes.

**Location**: `packages/[packageId]/workflow/*.json`

**Required fields**: id, name, nodes, edges

**Example**:
```json
[
  {
    "id": "workflow_send_email",
    "name": "Send Email",
    "nodes": [
      { "id": "trigger_1", "type": "trigger", "config": { "event": "user.created" } }
    ],
    "edges": [{ "from": "trigger_1", "to": "action_1" }],
    "enabled": true
  }
]
```

### credential.schema.json
Validates Credential seed data - API keys, OAuth tokens, and authentication.

**Location**: `packages/[packageId]/credential/*.json`

**Required fields**: id, name, type, service

**Example**:
```json
[
  {
    "id": "cred_github_api",
    "name": "GitHub API",
    "type": "api_key",
    "service": "github",
    "config": { "apiKey": "${GITHUB_API_KEY}" },
    "isActive": true
  }
]
```

### notification.schema.json
Validates Notification seed data - email templates, SMS, push notifications.

**Location**: `packages/[packageId]/notification/*.json`

**Required fields**: id, name, type, trigger, template

**Example**:
```json
[
  {
    "id": "notif_welcome_email",
    "name": "Welcome Email",
    "type": "email",
    "trigger": "user.created",
    "subject": "Welcome!",
    "template": "Hi {{name}}, welcome!",
    "variables": ["name"],
    "isActive": true
  }
]
```

### component.schema.json
Validates Component seed data - reusable UI component definitions.

**Location**: `packages/[packageId]/component/*.json`

**Required fields**: id, name, category

**Example**:
```json
[
  {
    "id": "comp_form_input",
    "name": "Form Input",
    "category": "form",
    "schema": { "type": "object", "properties": { "label": { "type": "string" } } },
    "events": [{ "name": "onChange" }],
    "isPublished": true
  }
]
```

## Using These Schemas

### In VSCode
Add to `.vscode/settings.json`:
```json
{
  "json.schemas": [
    {
      "fileMatch": ["packages/*/page-config/*.json"],
      "url": "./schemas/seed-data/page-config.schema.json"
    },
    {
      "fileMatch": ["packages/*/workflow/*.json"],
      "url": "./schemas/seed-data/workflow.schema.json"
    }
  ]
}
```

### In Validation Scripts
Use any JSON Schema validator (ajv, quicktype, etc.):
```typescript
import Ajv from "ajv"
import pageConfigSchema from "./schemas/seed-data/page-config.schema.json"

const ajv = new Ajv()
const validate = ajv.compile(pageConfigSchema)
const valid = validate(seedData)
```

### In CI/CD
Validate seed data before seeding:
```bash
npx json-schema-validator packages/*/page-config/*.json schemas/seed-data/page-config.schema.json
```

## Rules

1. **One schema per entity type** - page-config, workflow, credential, etc.
2. **Always an array** - Seed files contain arrays of entities
3. **Validate before loading** - Check in CI, validation scripts, and admin panel
4. **Required fields vary** - Check each schema for required fields
5. **No additional properties** - Extra fields are rejected (additionalProperties: false)

## Adding New Entity Types

To add a new entity type:

1. Create `schemas/seed-data/[entity-type].schema.json`
2. Define required and optional fields
3. Add examples and descriptions
4. Update PACKAGE_STRUCTURE.md to document the new entity type
5. Create entity folders in packages as needed

## Common Properties

Most seed entities have these common properties:

| Property | Type | Description |
|----------|------|-------------|
| id | string | Unique identifier (type-prefixed: `page_`, `workflow_`, etc.) |
| name | string | Display name |
| description | string | What it does |
| tenantId | string/null | Tenant (null = system-wide) |
| packageId | string/null | Package that defined it |
| createdAt | integer/null | Creation timestamp |
| updatedAt | integer/null | Last update timestamp |

## Reference

- `/packages/PACKAGE_STRUCTURE.md` - How to organize packages
- `/packages/SEED_FORMAT.md` - Seed data format specification
- `/dbal/shared/api/schema/entities/` - YAML entity definitions
- `/dbal/shared/prisma/schema.prisma` - Database schema (auto-generated)
