# Seed Data Schemas Overview

Complete guide to MetaBuilder's seed data validation and entity type systems.

## Two-Layer Schema System

MetaBuilder uses two types of schemas working together:

### 1. Entity Definition Schemas (YAML)
**Location**: `/dbal/shared/api/schema/entities/`

Define the database structure - what fields exist, types, constraints, ACL rules.

- **Core entities**: User, Session, Workflow, etc. (`entities/core/`)
- **Access control**: Credential, PageConfig, ComponentNode (`entities/access/`)
- **Package-specific**: Notification, Media, Forum, etc. (`entities/packages/`)

These are the source of truth for what the DBAL can store.

**Example** (`page_config.yaml`):
```yaml
entity: PageConfig
fields:
  id: { type: uuid, primary: true }
  path: { type: string, required: true, max_length: 255 }
  title: { type: string, required: true }
  component: { type: string }
  level: { type: integer, min: 0, max: 5 }
```

### 2. Seed Data Validation Schemas (JSON)
**Location**: `/schemas/seed-data/`

Validate that seed data files conform to the entity structure before loading.

- page-config.schema.json
- workflow.schema.json
- credential.schema.json
- notification.schema.json
- component.schema.json

These schemas validate the JSON files in package entity folders.

**Example** (page-config.schema.json):
```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": { "type": "string", "pattern": "^page_" },
      "path": { "type": "string", "pattern": "^/" },
      "title": { "type": "string", "minLength": 1 },
      "component": { "type": "string" }
    },
    "required": ["id", "path", "title", "component"]
  }
}
```

## Data Flow

```
1. Package Developer
   ├── Creates entity folders in package
   │   └── packages/my-package/page-config/
   │   └── packages/my-package/workflow/
   │   └── etc.
   │
   └── Creates seed data JSON files
       └── packages/my-package/page-config/*.json
       └── packages/my-package/workflow/*.json

2. Validation Layer (Before Database)
   ├── JSON Schema validates file structure
   │   └── /schemas/seed-data/page-config.schema.json
   │   └── /schemas/seed-data/workflow.schema.json
   │
   └── DBAL receives validated data
       └── Applies YAML entity constraints
       └── Applies ACL rules
       └── Creates database records

3. Database Layer
   ├── Prisma enforces structure
   │   └── Generated from YAML schemas
   │   └── /dbal/shared/prisma/schema.prisma
   │
   └── Records stored in tables
       └── PageConfig, Workflow, Credential, etc.
```

## Package Entity Folder Structure

Each package organizes by entity type:

```
packages/my-package/
├── page-config/                    [Routes/pages]
│   ├── metadata.json               [Entity folder metadata]
│   └── home.json                   [Seed data]
│
├── workflow/                       [Automation workflows]
│   ├── metadata.json
│   └── user_sync.json
│
├── credential/                     [API credentials]
│   ├── metadata.json
│   └── api_keys.json
│
├── notification/                   [Notification templates]
│   ├── metadata.json
│   └── welcome_email.json
│
├── component/                      [Reusable components]
│   ├── metadata.json
│   └── form_field.json
│
└── package.json                    [Package manifest]
```

## Seed Data File Anatomy

Each seed data file is a JSON array of entities:

```json
[
  {
    "id": "page_home",           ← Entity ID (required)
    "path": "/",                 ← Entity property (required)
    "title": "Home",             ← Entity property (required)
    "component": "home_page",    ← Entity property (required)
    "level": 0,                  ← Entity property (optional)
    "requiresAuth": false,       ← Entity property (optional)
    "isPublished": true          ← Entity property (optional)
  }
]
```

**Always**:
- JSON array, even for one entity
- Include all required fields
- Include optional fields as needed
- Follow field names exactly from schema

## Validation Workflow

### 1. Development Time (VSCode)
Set up JSON Schema in `.vscode/settings.json`:
```json
{
  "json.schemas": [
    {
      "fileMatch": ["packages/*/page-config/*.json"],
      "url": "./schemas/seed-data/page-config.schema.json"
    }
  ]
}
```

**Benefits**: Autocompletion, error highlighting, documentation on hover

### 2. Pre-Commit (Local)
Validate before committing:
```bash
npx json-schema-validator packages/*/page-config/*.json \
  schemas/seed-data/page-config.schema.json
```

### 3. CI/CD Pipeline
Validate in GitHub Actions:
```yaml
- name: Validate seed data
  run: |
    npm install -g json-schema-validator
    json-schema-validator packages/*/page-config/*.json \
      schemas/seed-data/page-config.schema.json
```

### 4. Runtime (Database Load)
DBAL validates before creating records:
```typescript
// In /dbal/development/src/seeds/index.ts
const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'))
// Validated by JSON Schema before being applied to database
```

## Entity Types Reference

| Entity | Schema File | Required Fields | Typical Location |
|--------|------------|-----------------|------------------|
| **PageConfig** | page-config.schema.json | id, path, title, component | packages/*/page-config/ |
| **Workflow** | workflow.schema.json | id, name, nodes, edges | packages/*/workflow/ |
| **Credential** | credential.schema.json | id, name, type, service | packages/*/credential/ |
| **Notification** | notification.schema.json | id, name, type, trigger, template | packages/*/notification/ |
| **Component** | component.schema.json | id, name, category | packages/*/component/ |

## Common Patterns

### Adding a New Page
```json
// packages/ui_dashboard/page-config/dashboard.json
[
  {
    "id": "page_dashboard_user",
    "path": "/dashboard/user",
    "title": "User Dashboard",
    "component": "user_dashboard",
    "level": 1,
    "requiresAuth": true,
    "isPublished": true
  }
]
```

### Adding a Workflow
```json
// packages/notifications/workflow/send_welcome.json
[
  {
    "id": "workflow_welcome",
    "name": "Send Welcome Email",
    "nodes": [
      { "id": "trigger_1", "type": "trigger", "config": { "event": "user.created" } }
    ],
    "edges": [
      { "from": "trigger_1", "to": "action_1" }
    ],
    "enabled": true
  }
]
```

### Adding a Credential
```json
// packages/github_tools/credential/github_api.json
[
  {
    "id": "cred_github",
    "name": "GitHub API",
    "type": "api_key",
    "service": "github",
    "config": { "apiKey": "${GITHUB_API_KEY}" },
    "isActive": true
  }
]
```

## Troubleshooting

### "Seed data validation failed"
Check that:
1. File is a JSON array `[...]`
2. All required fields are present (check schema)
3. Field values match the correct type
4. IDs follow the pattern (e.g., `page_`, `workflow_`)

### "Path already exists"
Each PageConfig path must be unique. Check for duplicates across all packages.

### "Invalid schema"
Run JSON validation locally first:
```bash
npx ajv validate -s schemas/seed-data/page-config.schema.json -d packages/ui_home/page-config/page-config.json
```

## Best Practices

1. **Validate early** - Check in development before committing
2. **One entity per file** - Keep related entities in one data file
3. **Use descriptive IDs** - `page_ui_home_root`, not `p1`
4. **Document defaults** - Include optional fields if non-obvious
5. **Test idempotency** - Seed data should load multiple times safely
6. **Version seed changes** - Update package.json version when seed data changes

## See Also

- `/packages/PACKAGE_STRUCTURE.md` - How to organize packages
- `/packages/SEED_FORMAT.md` - Seed data file format details
- `/dbal/shared/api/schema/entities/` - YAML entity definitions
- `/schemas/seed-data/` - JSON validation schemas
