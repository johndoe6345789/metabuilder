# Multi-Frontend DBAL Integration Guide

This guide covers using DBAL across different frontend platforms in MetaBuilder.

## Overview

MetaBuilder supports multiple frontend technologies, all communicating with the same DBAL backend:

| Frontend | Language | Implementation |
|----------|----------|----------------|
| Next.js | TypeScript | Direct DBAL imports |
| Qt6/QML | C++/QML | DBALClient class |
| CLI | C++ | HTTP commands |
| Lua Packages | Lua | DBAL operations |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DBAL API Server                       │
│            (TypeScript / Node.js / Next.js)              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  Next.js   │  │   Qt6/QML  │  │    CLI     │         │
│  │  Frontend  │  │  Frontend  │  │  Frontend  │         │
│  └────────────┘  └────────────┘  └────────────┘         │
│        │                │               │                │
│        │  HTTP/REST     │  HTTP/REST    │  HTTP/REST    │
│        ▼                ▼               ▼                │
│  ┌─────────────────────────────────────────────────┐    │
│  │                 /api/dbal/*                      │    │
│  │           REST API Endpoints                     │    │
│  └─────────────────────────────────────────────────┘    │
│                          │                               │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │              DBAL Abstraction                    │    │
│  │    (dbal/development/src/adapters/prisma.ts)    │    │
│  └─────────────────────────────────────────────────┘    │
│                          │                               │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │                 Prisma ORM                       │    │
│  │              (prisma/schema.prisma)             │    │
│  └─────────────────────────────────────────────────┘    │
│                          │                               │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │                   SQLite DB                      │    │
│  │              (development.db)                   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Qt6/QML Integration

### C++ DBALClient

Location: `frontends/qt6/src/DBALClient.h` and `DBALClient.cpp`

```cpp
#include "DBALClient.h"

// Create client
DBALClient client;
client.setBaseUrl("http://localhost:3000");
client.setTenantId("default-tenant");
client.setAuthToken("your-jwt-token");

// CRUD operations
QJsonObject newUser;
newUser["name"] = "Alice";
newUser["email"] = "alice@example.com";
newUser["level"] = 1;

QJsonObject created = client.create("User", newUser);
QString userId = created["id"].toString();

QJsonObject user = client.read("User", userId);
qDebug() << "User:" << user["name"].toString();

user["level"] = 2;
QJsonObject updated = client.update("User", userId, user);

bool deleted = client.remove("User", userId);
```

### QML Provider

Location: `frontends/qt6/qmllib/dbal/DBALProvider.qml`

```qml
import QtQuick 2.15
import DBALObservatory 1.0

Item {
    DBALProvider {
        id: dbal
        baseUrl: "http://localhost:3000"
        tenantId: "default-tenant"
        authToken: settings.authToken
        
        onDataReceived: function(entity, data) {
            console.log("Received:", JSON.stringify(data))
        }
        
        onErrorOccurred: function(error) {
            console.error("DBAL Error:", error)
        }
    }
    
    Component.onCompleted: {
        // List users
        dbal.list("User", { level: 1 }, function(result) {
            userModel.clear()
            result.items.forEach(function(user) {
                userModel.append(user)
            })
        })
    }
    
    ListView {
        model: ListModel { id: userModel }
        delegate: Text { text: model.name }
    }
}
```

## CLI Integration

### Basic Commands

```bash
# Check connection
metabuilder-cli dbal ping

# Create a record
metabuilder-cli dbal create User name=Alice email=alice@test.com level=1

# Read a record
metabuilder-cli dbal read User clx123abc

# Update a record  
metabuilder-cli dbal update User clx123abc level=2 name=Bob

# Delete a record
metabuilder-cli dbal delete User clx123abc

# List with filters
metabuilder-cli dbal list User where.level=1 take=10

# Execute custom operation
metabuilder-cli dbal execute findFirst entity=User where.email=admin@test.com
```

### Schema Commands

```bash
# List all schemas
metabuilder-cli dbal schema list

# Show pending migrations
metabuilder-cli dbal schema pending

# Show entity schema
metabuilder-cli dbal schema entity User
```

## Lua Package Integration

### Package DB Operations

Location: `packages/{name}/seed/scripts/db/operations.lua`

```lua
-- packages/audit_log/seed/scripts/db/operations.lua
local M = {}

function M.create(dbal, params)
  return dbal:create('AuditLog', {
    tenantId = params.tenantId,
    userId = params.userId,
    action = params.action,
    entity = params.entity,
    entityId = params.entityId,
    timestamp = os.time() * 1000,
  })
end

function M.list(dbal, tenantId, filters)
  return dbal:list('AuditLog', {
    where = { tenantId = tenantId, ... },
    orderBy = { timestamp = 'desc' },
    take = filters.take or 50,
  })
end

return M
```

### Using Package Operations

```lua
local audit = require('audit_log.db.operations')

-- Log an action
audit.logCreate(dbal, tenantId, userId, 'User', newUserId, userData)

-- Get audit history
local history = audit.getEntityHistory(dbal, tenantId, 'User', userId)
```

## Package Schema System

### Schema File Format

Location: `packages/{name}/seed/schema/entities.yaml`

```yaml
package: audit_log
version: 1.0.0

entities:
  - name: AuditLog
    description: Tracks all data changes for compliance
    fields:
      - name: id
        type: string
        default: cuid()
      - name: tenantId
        type: string
      - name: userId
        type: string
        nullable: true
      - name: action
        type: string
        description: create|update|delete|login|logout
      - name: entity
        type: string
      - name: entityId
        type: string
        nullable: true
      - name: oldValue
        type: json
        nullable: true
      - name: newValue
        type: json
        nullable: true
      - name: timestamp
        type: datetime
        default: now()
    
    indexes:
      - name: idx_audit_tenant_entity
        fields: [tenantId, entity]
      - name: idx_audit_timestamp
        fields: [timestamp]
    
    acl:
      create: 0  # System only
      read: 3    # Admin+
      update: 6  # Supergod only
      delete: 6  # Supergod only
```

### Schema CLI Commands

```bash
# Scan all packages for schemas
npm run schema:scan

# Validate all schemas
npm run schema:validate

# Show pending migrations
npm run schema:pending

# Generate Prisma from approved schemas
npm run schema:generate
```

## API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dbal/ping` | Health check |
| POST | `/api/dbal/{entity}` | Create record |
| GET | `/api/dbal/{entity}/{id}` | Read record |
| PATCH | `/api/dbal/{entity}/{id}` | Update record |
| DELETE | `/api/dbal/{entity}/{id}` | Delete record |
| GET | `/api/dbal/{entity}?where.field=value` | List records |
| POST | `/api/dbal/execute` | Execute operation |
| GET | `/api/dbal/schema` | List schemas |
| GET | `/api/dbal/schema/pending` | Pending migrations |

### Query Parameters

```
?where.field=value     Filter by field
?take=N                Limit results
?skip=N                Skip first N
?orderBy.field=asc     Sort ascending
?orderBy.field=desc    Sort descending
?include.relation=true Include related data
```

## Authentication

All DBAL requests require authentication:

### CLI Authentication

```bash
# Login to get token
metabuilder-cli auth login admin@test.com password123

# Token is stored in ~/.metabuilder/config.json
```

### Qt6 Authentication

```cpp
DBALClient client;
client.setAuthToken(storedJwtToken);
```

### Headers

```
Authorization: Bearer <jwt-token>
X-Tenant-Id: <tenant-id>
Content-Type: application/json
```

## Multi-Tenancy

All DBAL operations are tenant-scoped:

1. Every entity has a `tenantId` field
2. Queries automatically filter by tenant
3. Tenant ID is passed via header or context
4. Cross-tenant access is forbidden at DBAL layer

```lua
-- Lua: tenantId is always first parameter
local logs = audit.list(dbal, currentTenantId, { take = 10 })
```

```cpp
// C++: Set tenant on client
client.setTenantId("my-tenant-id");
auto users = client.list("User", {}); // Automatically filtered
```

## Error Handling

### Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (ACL) |
| 404 | Not Found |
| 500 | Server Error |

### Error Response Format

```json
{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions to delete User",
  "code": 403,
  "details": {
    "entity": "User",
    "operation": "delete",
    "requiredLevel": 4,
    "userLevel": 2
  }
}
```

## Best Practices

1. **Always include tenantId** - Multi-tenancy is enforced at schema level
2. **Use ACL levels** - Define create/read/update/delete permissions in schema
3. **Validate in Lua** - Business logic validation before DBAL calls
4. **Handle errors** - Check response codes and error messages
5. **Paginate lists** - Use take/skip for large datasets
6. **Index queries** - Add indexes for frequently filtered fields

## Related Documentation

- [Package Schema Migrations](schema-migrations.md)
- [DBAL Development Guide](../../dbal/docs/AGENTS.md)
- [Permission System](../../docs/architecture/5-level-system.md)
