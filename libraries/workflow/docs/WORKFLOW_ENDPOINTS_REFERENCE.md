# Workflow API Endpoints Reference

**Last Updated**: 2026-01-22
**Base URL**: `http://localhost:3000/api/v1`
**Authentication**: Required (except public endpoints)
**Rate Limiting**: Applied per endpoint type

---

## Endpoint Summary

| Method | Endpoint | Purpose | Auth | Rate Limit | Status |
|--------|----------|---------|------|------------|--------|
| GET | `/api/v1/{tenant}/workflows` | List workflows | ✅ Lvl1+ | list | ✅ Ready |
| POST | `/api/v1/{tenant}/workflows` | Create workflow | ✅ Lvl2+ | mutation | ✅ Ready |
| POST | `/api/v1/{tenant}/workflows/{id}/execute` | Execute workflow | ✅ Lvl1+ | mutation | ✅ Ready |
| GET | `/api/v1/{tenant}/workflows/{id}/executions` | List executions | ❌ TBD | list | ⏳ Not yet |
| GET | `/api/v1/{tenant}/workflows/{id}/executions/{execId}` | Get execution | ❌ TBD | list | ⏳ Not yet |
| DELETE | `/api/v1/{tenant}/workflows/{id}/executions/{execId}` | Cancel execution | ❌ TBD | mutation | ⏳ Not yet |

---

## Endpoint Details

### 1. List Workflows

**Route**: `GET /api/v1/{tenant}/workflows`

**Purpose**: Retrieve workflows for a tenant with optional filtering

#### Request

```http
GET /api/v1/acme/workflows?limit=20&offset=0&category=automation&active=true HTTP/1.1
Host: localhost:3000
Cookie: mb_session=<session-token>
```

#### Query Parameters

| Parameter | Type | Default | Max | Example | Notes |
|-----------|------|---------|-----|---------|-------|
| `limit` | integer | 50 | 100 | 20 | Items per page |
| `offset` | integer | 0 | - | 0 | Pagination offset |
| `category` | string | - | - | automation | automation, integration, business-logic, data-transformation, notification, approval, other |
| `tags` | string | - | - | tag1,tag2 | Comma-separated |
| `active` | boolean | - | - | true | true or false |

#### Response (200 OK)

```json
{
  "workflows": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Send Welcome Email",
      "description": "Send email to new users",
      "category": "automation",
      "version": "1.0.0",
      "createdAt": "2026-01-22T10:30:00Z",
      "updatedAt": "2026-01-22T15:45:00Z",
      "active": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Process Orders",
      "description": null,
      "category": "integration",
      "version": "2.1.0",
      "createdAt": "2026-01-20T08:00:00Z",
      "updatedAt": "2026-01-22T12:00:00Z",
      "active": true
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid query parameters
```json
{
  "error": "Bad Request",
  "message": "Invalid JSON in request body"
}
```

**401 Unauthorized** - Missing authentication
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**403 Forbidden** - Insufficient permissions
```json
{
  "error": "Forbidden",
  "message": "Access denied to this tenant"
}
```

**429 Too Many Requests** - Rate limited
```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

**500 Internal Server Error** - Database error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to list workflows"
}
```

#### cURL Example

```bash
curl -X GET \
  "http://localhost:3000/api/v1/acme/workflows?limit=10&category=automation" \
  -H "Cookie: mb_session=<token>"
```

---

### 2. Create Workflow

**Route**: `POST /api/v1/{tenant}/workflows`

**Purpose**: Create a new workflow with initial configuration

#### Request

```http
POST /api/v1/acme/workflows HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Cookie: mb_session=<session-token>

{
  "name": "Send Welcome Email",
  "description": "Send email to new users",
  "category": "automation",
  "nodes": [],
  "connections": {},
  "triggers": [],
  "tags": ["email", "notification"],
  "active": true,
  "metadata": {
    "owner": "marketing",
    "slackChannel": "#automation"
  }
}
```

#### Request Body

| Field | Type | Required | Max Length | Example | Notes |
|-------|------|----------|------------|---------|-------|
| `name` | string | ✅ | 255 | "Send Email" | Display name |
| `description` | string | ❌ | 500 | "Email new users" | Optional description |
| `category` | string | ✅ | - | automation | See category list |
| `nodes` | array | ❌ | - | [] | Node definitions |
| `connections` | object | ❌ | - | {} | Node connections |
| `triggers` | array | ❌ | - | [] | Trigger definitions |
| `tags` | array | ❌ | - | ["tag1"] | String array |
| `active` | boolean | ❌ | - | true | Default: true |
| `metadata` | object | ❌ | - | {} | Custom metadata |

#### Response (201 Created)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Send Welcome Email",
  "description": "Send email to new users",
  "category": "automation",
  "version": "1.0.0",
  "createdAt": "2026-01-22T16:30:00Z",
  "updatedAt": "2026-01-22T16:30:00Z",
  "active": true
}
```

#### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "error": "Validation Error",
  "errors": [
    "name is required and must be a string",
    "category must be one of: automation, integration, business-logic, etc"
  ]
}
```

**401 Unauthorized** - Not authenticated
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**403 Forbidden** - Insufficient permissions (requires level 2+)
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions. Required level: 2, your level: 1"
}
```

**429 Too Many Requests** - Rate limited
```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

**500 Internal Server Error** - Server error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to create workflow"
}
```

#### cURL Example

```bash
curl -X POST \
  "http://localhost:3000/api/v1/acme/workflows" \
  -H "Content-Type: application/json" \
  -H "Cookie: mb_session=<token>" \
  -d '{
    "name": "Send Email",
    "category": "automation",
    "description": "Email new users"
  }'
```

---

### 3. Execute Workflow

**Route**: `POST /api/v1/{tenant}/workflows/{workflowId}/execute`

**Purpose**: Execute a workflow and get results

#### Request

```http
POST /api/v1/acme/workflows/550e8400-e29b-41d4-a716-446655440000/execute HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Cookie: mb_session=<session-token>

{
  "triggerData": {
    "email": "user@example.com",
    "name": "John"
  },
  "variables": {
    "emailTemplate": "welcome_v2"
  },
  "request": {
    "method": "POST",
    "headers": {
      "X-Request-ID": "req-123"
    }
  }
}
```

#### Request Body

| Field | Type | Required | Example | Notes |
|-------|------|----------|---------|-------|
| `triggerData` | object | ❌ | {} | Input data for workflow |
| `variables` | object | ❌ | {} | Workflow variables |
| `request` | object | ❌ | {} | HTTP request context |
| `request.method` | string | ❌ | POST | HTTP method |
| `request.headers` | object | ❌ | {} | HTTP headers |
| `request.query` | object | ❌ | {} | Query parameters |
| `request.body` | object | ❌ | {} | Request body |

#### Response (200 OK)

```json
{
  "executionId": "exec-550e8400-e29b-41d4-a716-446655440000",
  "workflowId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "state": {
    "node_1": {
      "status": "success",
      "output": { "email_sent": true },
      "timestamp": 1674406200000
    },
    "node_2": {
      "status": "success",
      "output": { "log_id": "log_123" },
      "timestamp": 1674406210000
    }
  },
  "metrics": {
    "nodesExecuted": 2,
    "successNodes": 2,
    "failedNodes": 0,
    "retriedNodes": 0,
    "totalRetries": 0,
    "peakMemory": 45,
    "dataProcessed": 1024,
    "apiCallsMade": 1
  },
  "startTime": "2026-01-22T16:30:00Z",
  "endTime": "2026-01-22T16:30:15Z",
  "duration": 15000
}
```

**Status field values**:
- `success`: All nodes succeeded
- `error`: One or more nodes failed
- `running`: Still executing (rare - most complete synchronously)

#### Error Response Example (400)

```json
{
  "error": "Validation Error",
  "code": "SCHEMA_VALIDATION_FAILED",
  "message": "Workflow does not match expected schema",
  "details": {
    "errors": [
      {
        "path": "/nodes/0",
        "message": "Unknown node type",
        "keyword": "enum"
      }
    ]
  }
}
```

#### Error Response Example (404)

```json
{
  "error": "Not Found",
  "message": "Workflow not found"
}
```

#### Error Response Example (500)

```json
{
  "error": "Internal Server Error",
  "message": "Workflow execution failed: Node executor error"
}
```

#### cURL Example

```bash
curl -X POST \
  "http://localhost:3000/api/v1/acme/workflows/550e8400-e29b-41d4-a716-446655440000/execute" \
  -H "Content-Type: application/json" \
  -H "Cookie: mb_session=<token>" \
  -d '{
    "triggerData": {
      "email": "user@example.com"
    }
  }'
```

---

## Authentication

### Session Cookie

All endpoints require `mb_session` cookie with valid session token:

```http
Cookie: mb_session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Permission Levels

| Level | Role | Can List | Can Create | Can Execute |
|-------|------|----------|------------|-------------|
| 0 | Public | ❌ | ❌ | ❌ |
| 1 | User | ✅ | ❌ | ✅ |
| 2 | Moderator | ✅ | ✅ | ✅ |
| 3 | Admin | ✅ | ✅ | ✅ |
| 4 | God | ✅ | ✅ | ✅ |
| 5 | Supergod | ✅ | ✅ | ✅ |

---

## Rate Limiting

### Limits

- **List endpoints**: 100 requests/minute per IP
- **Mutation endpoints**: 50 requests/minute per IP

### Rate Limit Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 89
X-RateLimit-Reset: 1674406260
```

### When Limit Exceeded

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60

{
  "error": "Too many requests",
  "retryAfter": 60
}
```

---

## Common Patterns

### Pagination

List endpoints support cursor-like pagination:

```bash
# First page
curl "http://localhost:3000/api/v1/acme/workflows?limit=10&offset=0"

# Next page
curl "http://localhost:3000/api/v1/acme/workflows?limit=10&offset=10"

# Large page
curl "http://localhost:3000/api/v1/acme/workflows?limit=100&offset=50"
```

Response includes `hasMore` to determine if more pages exist:
```json
{
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### Filtering

Combine query parameters for filtering:

```bash
# Active workflows only
curl "...?active=true"

# By category
curl "...?category=automation"

# By tags (comma-separated)
curl "...?tags=email,notification"

# Combined
curl "...?category=automation&tags=email&active=true"
```

### Error Handling

All error responses follow the same pattern:

```json
{
  "error": "<ErrorCode>",
  "message": "<Human-readable message>",
  "details": {
    "field": "value",
    "errors": []
  }
}
```

**Status codes**:
- 400: Bad Request (validation error)
- 401: Unauthorized (missing/invalid auth)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 429: Too Many Requests (rate limited)
- 500: Internal Server Error (server error)

---

## Workflow Categories

Valid categories:
- `automation` - Automated tasks and processes
- `integration` - System integrations and data sync
- `business-logic` - Core business processes
- `data-transformation` - ETL and data processing
- `notification` - Alerts and notifications
- `approval` - Approval workflows
- `other` - Miscellaneous

---

## Multi-Tenant Behavior

### Tenant Isolation

- All operations scoped to `{tenant}` in URL
- User must belong to tenant or have god-level permissions
- Workflows filtered by tenantId automatically
- Executions tracked per tenant

### Example

User in `acme` tenant:
```bash
# ✅ Can access
curl "http://localhost:3000/api/v1/acme/workflows"

# ❌ Cannot access (forbidden)
curl "http://localhost:3000/api/v1/other-tenant/workflows"
```

God-level user:
```bash
# ✅ Can access any tenant
curl "http://localhost:3000/api/v1/acme/workflows"
curl "http://localhost:3000/api/v1/other-tenant/workflows"
```

---

## Testing

### Using curl

```bash
# Login (get session)
curl -X POST http://localhost:3000/api/v1/acme/auth/login \
  -d '{"email":"user@example.com","password":"..."}'

# Extract token from response, set cookie
TOKEN="eyJ..."

# List workflows
curl -X GET "http://localhost:3000/api/v1/acme/workflows" \
  -H "Cookie: mb_session=$TOKEN"

# Create workflow
curl -X POST "http://localhost:3000/api/v1/acme/workflows" \
  -H "Content-Type: application/json" \
  -H "Cookie: mb_session=$TOKEN" \
  -d '{"name":"Test","category":"automation"}'

# Execute workflow
curl -X POST "http://localhost:3000/api/v1/acme/workflows/WORKFLOW_ID/execute" \
  -H "Content-Type: application/json" \
  -H "Cookie: mb_session=$TOKEN" \
  -d '{"triggerData":{}}'
```

### Using Postman

1. Create environment variable: `token` = session cookie value
2. Create environment variable: `tenant` = tenant slug (e.g., "acme")
3. In request headers: `Cookie: mb_session={{token}}`
4. In URL: Use `{{tenant}}` placeholder

### Using JavaScript/TypeScript

```typescript
async function listWorkflows(tenant: string, token: string) {
  const response = await fetch(
    `http://localhost:3000/api/v1/${tenant}/workflows`,
    {
      method: 'GET',
      headers: {
        'Cookie': `mb_session=${token}`
      }
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

async function executeWorkflow(
  tenant: string,
  workflowId: string,
  token: string,
  triggerData?: Record<string, any>
) {
  const response = await fetch(
    `http://localhost:3000/api/v1/${tenant}/workflows/${workflowId}/execute`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `mb_session=${token}`
      },
      body: JSON.stringify({ triggerData: triggerData || {} })
    }
  )

  return response.json()
}
```

---

## Future Endpoints (Not Yet Implemented)

These endpoints are planned but not yet available:

### Get Workflow Executions

```http
GET /api/v1/{tenant}/workflows/{workflowId}/executions
GET /api/v1/{tenant}/workflows/{workflowId}/executions/{executionId}
DELETE /api/v1/{tenant}/workflows/{workflowId}/executions/{executionId}
```

### Update Workflow

```http
PUT /api/v1/{tenant}/workflows/{workflowId}
PATCH /api/v1/{tenant}/workflows/{workflowId}
```

### Delete Workflow

```http
DELETE /api/v1/{tenant}/workflows/{workflowId}
```

### Workflow Versions

```http
GET /api/v1/{tenant}/workflows/{workflowId}/versions
GET /api/v1/{tenant}/workflows/{workflowId}/versions/{versionId}
POST /api/v1/{tenant}/workflows/{workflowId}/versions/{versionId}/restore
```

---

## Troubleshooting

### 401 Unauthorized

- Session cookie expired: Re-login
- Invalid cookie value: Check cookie name is `mb_session`
- No cookie sent: Ensure credentials mode is set properly

### 403 Forbidden

- Not member of tenant: Use correct tenant slug
- Insufficient level: Need higher permissions
- Workflow access denied: Workflow in different tenant

### 404 Not Found

- Workflow doesn't exist: Check workflow ID
- Workflow deleted: Retrieve from execution history
- Tenant doesn't exist: Check tenant slug

### 429 Too Many Requests

- Rate limit exceeded: Wait for window reset
- Check `Retry-After` header for how long to wait
- Multiple requests in quick succession: Add delays

### 500 Internal Server Error

- Database connection error: Check database status
- Invalid workflow definition: Validate against schema
- Node executor error: Check node configuration
- Check server logs for details
