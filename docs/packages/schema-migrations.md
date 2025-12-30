# Package Schema Migration System

## Overview

Packages can define their own database schemas in `seed/schema/entities.yaml`. The system:

1. **Validates** schemas across packages to prevent conflicts
2. **Queues** changes for admin approval
3. **Generates** Prisma schema fragments
4. **Applies** migrations on container restart

## Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Package with   │────▶│  npm run         │────▶│  Admin reviews  │
│  schema/        │     │  schema:scan     │     │  pending queue  │
│  entities.yaml  │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Prisma migrate │◀────│  Container       │◀────│  Admin approves │
│  applied        │     │  restart         │     │  migrations     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Package Schema Format

Create `packages/{name}/seed/schema/entities.yaml`:

```yaml
entities:
  - name: MyEntity
    version: "1.0"
    description: "Description of entity"
    
    fields:
      id:
        type: cuid
        primary: true
        generated: true
        
      tenantId:
        type: string
        required: true
        index: true
        
      name:
        type: string
        required: true
        maxLength: 100
        
      data:
        type: string
        nullable: true
        description: "JSON: additional data"
        
      createdAt:
        type: bigint
        required: true

    indexes:
      - fields: [tenantId, name]
        unique: true

    relations:
      - name: tenant
        type: belongsTo
        entity: Tenant
        field: tenantId
        onDelete: Cascade

    acl:
      create: [user]
      read: [public]
      update: [self, admin]
      delete: [admin]
```

## Field Types

| Type | Prisma | Notes |
|------|--------|-------|
| `string` | `String` | Text fields |
| `int` | `Int` | 32-bit integer |
| `bigint` | `BigInt` | 64-bit integer (timestamps) |
| `float` | `Float` | Decimal numbers |
| `boolean` | `Boolean` | True/false |
| `cuid` | `String` | CUID identifier |
| `uuid` | `String` | UUID identifier |
| `json` | `Json` | JSON data |

## CLI Commands

```bash
# Scan all packages for schema changes
npm run schema:scan

# List pending migrations
npm run schema:list

# Approve migrations
npm run schema:approve all
npm run schema:approve <migration-id>

# Generate Prisma fragment
npm run schema:generate

# Preview package schema as Prisma
npm run schema:preview audit_log

# Check status
npm run schema:status
```

## Checksum Validation

The system computes checksums from schema structure (not descriptions). If two packages define the same entity:

- **Same checksum**: Compatible, no conflict
- **Different checksum**: Error - packages must coordinate

## Metadata.json Integration

Add schema export to `metadata.json`:

```json
{
  "packageId": "my_package",
  "schema": {
    "entities": ["MyEntity", "MyOtherEntity"],
    "path": "schema/entities.yaml"
  }
}
```

## Docker Integration

The container startup script (`apply-schema-migrations.sh`) automatically:

1. Checks for approved migrations
2. Generates Prisma schema fragment
3. Runs `prisma migrate dev`
4. Updates registry to mark as applied
5. Regenerates Prisma client

## Security

- Only **admin** can approve migrations
- Schema changes require container restart
- Checksums prevent unauthorized modifications
- ACL rules define entity-level permissions
