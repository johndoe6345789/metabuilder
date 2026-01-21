# MetaBuilder API Documentation Guide

**Status**: ✅ COMPLETE
**Endpoints**: `/api/docs` (Swagger UI), `/api/docs/openapi` (Raw spec)
**Specification**: OpenAPI 3.0.0

## Quick Start

### View Documentation

1. **Interactive Swagger UI**:
   ```
   http://localhost:3000/api/docs
   ```
   - Visual API browser
   - Try it out feature
   - Request/response examples

2. **Raw OpenAPI Spec**:
   ```
   http://localhost:3000/api/docs/openapi.json
   ```
   - JSON format
   - For tools and integrations
   - CORS-enabled

### Basic API Pattern

```
/api/v1/{tenant}/{package}/{entity}[/{id}[/{action}]]
```

**Example**:
```
GET  /api/v1/acme/forum_forge/posts       → List posts
POST /api/v1/acme/forum_forge/posts       → Create post
GET  /api/v1/acme/forum_forge/posts/123   → Get post 123
PUT  /api/v1/acme/forum_forge/posts/123   → Update post 123
DELETE /api/v1/acme/forum_forge/posts/123 → Delete post 123
POST /api/v1/acme/forum_forge/posts/123/like → Custom action
```

---

## API Endpoints

### CRUD Operations

#### List Entities
```
GET /api/v1/{tenant}/{package}/{entity}

Parameters:
  - tenant (path): Organization slug (e.g., "acme")
  - package (path): Package ID (e.g., "forum_forge")
  - entity (path): Entity type (e.g., "posts")
  - limit (query): Max records (default: 50, max: 1000)
  - offset (query): Skip N records (default: 0)

Response: 200 OK
  [
    { id: "post_1", title: "...", tenantId: "acme", ... },
    { id: "post_2", title: "...", tenantId: "acme", ... }
  ]

Rate Limit: 100 requests/minute per IP
```

**Example**:
```bash
curl -X GET "http://localhost:3000/api/v1/acme/forum_forge/posts?limit=10" \
  -H "Cookie: mb_session=..."
```

#### Create Entity
```
POST /api/v1/{tenant}/{package}/{entity}

Body: JSON object with entity fields

Response: 201 Created
  {
    id: "post_123",
    title: "New Post",
    tenantId: "acme",
    createdAt: 1674345600000
  }

Rate Limit: 50 requests/minute per IP
```

**Example**:
```bash
curl -X POST "http://localhost:3000/api/v1/acme/forum_forge/posts" \
  -H "Cookie: mb_session=..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello World",
    "content": "Welcome to MetaBuilder"
  }'
```

#### Get Entity by ID
```
GET /api/v1/{tenant}/{package}/{entity}/{id}

Response: 200 OK
  {
    id: "post_123",
    title: "Hello World",
    content: "...",
    tenantId: "acme",
    createdAt: 1674345600000
  }

Response: 404 Not Found
  { error: "Record not found" }

Rate Limit: 100 requests/minute per IP
```

#### Update Entity
```
PUT /api/v1/{tenant}/{package}/{entity}/{id}

Body: JSON object with fields to update

Response: 200 OK
  {
    id: "post_123",
    title: "Updated Title",
    content: "...",
    tenantId: "acme",
    updatedAt: 1674345700000
  }

Rate Limit: 50 requests/minute per IP
```

**Example**:
```bash
curl -X PUT "http://localhost:3000/api/v1/acme/forum_forge/posts/post_123" \
  -H "Cookie: mb_session=..." \
  -H "Content-Type: application/json" \
  -d '{ "title": "Updated Title" }'
```

#### Delete Entity
```
DELETE /api/v1/{tenant}/{package}/{entity}/{id}

Response: 200 OK
  { deleted: "post_123" }

Response: 404 Not Found
  { error: "Record not found" }

Rate Limit: 50 requests/minute per IP
```

### Custom Actions

#### Execute Package Action
```
POST /api/v1/{tenant}/{package}/{entity}/{id}/{action}

Parameters:
  - action: Custom action name (e.g., "publish", "archive", "like")

Body: Optional JSON object with action parameters

Response: 200 OK (depends on action implementation)

Rate Limit: 50 requests/minute per IP
```

**Example**:
```bash
# Like a post
curl -X POST "http://localhost:3000/api/v1/acme/forum_forge/posts/post_123/like" \
  -H "Cookie: mb_session=..."

# Publish a post with options
curl -X POST "http://localhost:3000/api/v1/acme/forum_forge/posts/post_123/publish" \
  -H "Cookie: mb_session=..." \
  -H "Content-Type: application/json" \
  -d '{ "notifyFollowers": true }'
```

### System Endpoints

#### Bootstrap System
```
POST /api/bootstrap

Response: 200 OK
  {
    success: true,
    message: "Database seeded successfully"
  }

Rate Limit: 1 attempt/hour per IP
```

**Note**: Idempotent - safe to call multiple times. Seeds database with default configuration.

#### Health Check
```
GET /api/health

Response: 200 OK
  { status: "ok" }
```

---

## Authentication

### Session Cookie

The API uses session cookies for authentication:

```
Cookie: mb_session={session_token}
```

### How to Authenticate

1. **Login** (not documented here - varies by frontend)
2. **Get Session Cookie** (set by login endpoint)
3. **Include in Requests**: All API calls must include the cookie

### Authentication Errors

```
401 Unauthorized
  { error: "Authentication required" }

403 Forbidden
  { error: "Insufficient permissions" }
```

---

## Multi-Tenant Support

### Tenant Routing

All API routes include the tenant in the URL:

```
/api/v1/{tenant}/...
```

**Important**: Users are automatically isolated to their tenant:
- Regular users can only access their own tenant
- Admin/God users can access any tenant (specify different tenant slug)
- Public pages accessible without authentication

### Tenant Data Isolation

All operations automatically filter by the user's tenant:

```typescript
// Behind the scenes
// If user belongs to tenant "acme",
// they can ONLY access "acme" data

GET /api/v1/acme/forum_forge/posts    ✅ Works (user's tenant)
GET /api/v1/widgets-co/forum_forge/posts ❌ Rejected (not user's tenant)
```

### Multi-Tenant Examples

```bash
# Acme tenant
curl "http://localhost:3000/api/v1/acme/forum_forge/posts"

# Widgets Corp tenant (different organization)
curl "http://localhost:3000/api/v1/widgets-co/forum_forge/posts"

# As admin/god, access any tenant
curl "http://localhost:3000/api/v1/competitor-inc/forum_forge/posts" \
  -H "Cookie: mb_session={god_token}"
```

---

## Rate Limiting

### Rate Limit Rules

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Login | 5 | 1 minute |
| Register | 3 | 1 minute |
| GET (list) | 100 | 1 minute |
| Mutations (POST/PUT/DELETE) | 50 | 1 minute |
| Bootstrap | 1 | 1 hour |

### Rate Limit Response

When rate limit exceeded:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "error": "Too many requests",
  "retryAfter": 60
}
```

### Handling Rate Limits

```bash
# 1. Check rate limit before making requests
curl -I "http://localhost:3000/api/v1/acme/..."

# 2. If you get 429, wait before retrying
# Use the Retry-After header: wait 60 seconds

# 3. Implement exponential backoff
# First retry: wait 2 seconds
# Second retry: wait 4 seconds
# Third retry: wait 8 seconds
# etc.
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Request successful |
| 201 | Created | Entity created |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Entity doesn't exist |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Error | Server error |

### Error Response Format

```json
{
  "error": "Human-readable error message"
}
```

### Common Errors

**Invalid tenant**:
```json
{ "error": "Tenant not found: invalid-slug" }
```

**Entity not found**:
```json
{ "error": "Record not found" }
```

**Access denied**:
```json
{ "error": "Not a member of this tenant" }
```

**Invalid request body**:
```json
{ "error": "Body required for create operation" }
```

---

## Code Examples

### JavaScript/Node.js

```javascript
// Login
const loginRes = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Include cookies
  body: JSON.stringify({ username: 'user@example.com', password: 'pass' })
})

// List posts
const postsRes = await fetch(
  'http://localhost:3000/api/v1/acme/forum_forge/posts',
  {
    credentials: 'include' // Include session cookie
  }
)
const posts = await postsRes.json()

// Create post
const createRes = await fetch(
  'http://localhost:3000/api/v1/acme/forum_forge/posts',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      title: 'New Post',
      content: 'Post content here'
    })
  }
)
const newPost = await createRes.json()

// Update post
const updateRes = await fetch(
  'http://localhost:3000/api/v1/acme/forum_forge/posts/post_123',
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ title: 'Updated Title' })
  }
)

// Delete post
const deleteRes = await fetch(
  'http://localhost:3000/api/v1/acme/forum_forge/posts/post_123',
  {
    method: 'DELETE',
    credentials: 'include'
  }
)
```

### Python

```python
import requests

session = requests.Session()

# Login
response = session.post(
    'http://localhost:3000/api/auth/login',
    json={'username': 'user@example.com', 'password': 'pass'}
)

# List posts
response = session.get(
    'http://localhost:3000/api/v1/acme/forum_forge/posts'
)
posts = response.json()

# Create post
response = session.post(
    'http://localhost:3000/api/v1/acme/forum_forge/posts',
    json={'title': 'New Post', 'content': 'Content here'}
)
new_post = response.json()

# Update post
response = session.put(
    'http://localhost:3000/api/v1/acme/forum_forge/posts/post_123',
    json={'title': 'Updated Title'}
)

# Delete post
response = session.delete(
    'http://localhost:3000/api/v1/acme/forum_forge/posts/post_123'
)
```

### cURL

```bash
# Login
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","password":"pass"}' \
  -c cookies.txt

# List posts
curl "http://localhost:3000/api/v1/acme/forum_forge/posts" \
  -b cookies.txt

# Create post
curl -X POST "http://localhost:3000/api/v1/acme/forum_forge/posts" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"New Post","content":"Content here"}'

# Update post
curl -X PUT "http://localhost:3000/api/v1/acme/forum_forge/posts/post_123" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Updated Title"}'

# Delete post
curl -X DELETE "http://localhost:3000/api/v1/acme/forum_forge/posts/post_123" \
  -b cookies.txt
```

---

## Best Practices

### 1. Always Include Cookies

```javascript
// ✅ Correct
fetch(url, { credentials: 'include' })

// ❌ Wrong - will be rejected
fetch(url)
```

### 2. Handle Rate Limits

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options)

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 60
      const delay = Math.pow(2, attempt - 1) * parseInt(retryAfter)
      console.log(`Rate limited. Waiting ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      continue
    }

    return response
  }
}
```

### 3. Validate Tenant Access

```javascript
// Always verify you have permission
if (!response.ok) {
  if (response.status === 403) {
    console.error('Access denied - verify tenant membership')
  } else if (response.status === 401) {
    console.error('Not authenticated - login required')
  }
}
```

### 4. Use Pagination

```javascript
// Good for large datasets
const limit = 50
const offset = 0

const response = await fetch(
  `http://localhost:3000/api/v1/acme/forum_forge/posts?limit=${limit}&offset=${offset}`
)
```

### 5. Handle Errors Gracefully

```javascript
async function makeRequest(url, options) {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    return await response.json()
  } catch (err) {
    console.error('API request failed:', err.message)
    // Show user-friendly error message
    return null
  }
}
```

---

## Integration with Swagger/OpenAPI Tools

### Using with Swagger Editor

1. Open [Swagger Editor](https://editor.swagger.io/)
2. Go to **File → Import URL**
3. Enter: `http://localhost:3000/api/docs/openapi.json`
4. View interactive documentation

### Using with Postman

1. Open Postman
2. Click **Import** → **Link** → Enter spec URL
3. URL: `http://localhost:3000/api/docs/openapi.json`
4. Test endpoints directly from Postman

### Using with ReDoc

```html
<!DOCTYPE html>
<html>
  <head>
    <title>MetaBuilder API</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url='http://localhost:3000/api/docs/openapi.json'></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc/bundles/redoc.standalone.js"></script>
  </body>
</html>
```

---

## Troubleshooting

### 401 Unauthorized

**Problem**: Getting 401 errors on all requests

**Solutions**:
1. Verify you're logged in
2. Check if session cookie is set: `document.cookie`
3. Login again to get new session token
4. Ensure `credentials: 'include'` in fetch options

### 403 Forbidden

**Problem**: Getting 403 errors when accessing tenant data

**Solutions**:
1. Verify you belong to the tenant (check user profile)
2. If not, ask tenant admin to add you
3. If you're god/admin, verify the tenant slug is correct
4. Check tenant exists: `GET /api/v1/{tenant}/...`

### 429 Too Many Requests

**Problem**: Rate limiting triggered

**Solutions**:
1. Wait before retrying (check `Retry-After` header)
2. Reduce request frequency
3. Implement exponential backoff
4. Contact support if legitimate use case exceeds limits

### 404 Not Found

**Problem**: Entity doesn't exist

**Solutions**:
1. Verify entity ID is correct
2. Check entity belongs to your tenant
3. List all entities to find correct ID: `GET /api/v1/{tenant}/{package}/{entity}`

---

## Performance Tips

1. **Batch Operations**: Group multiple creates into single request when possible
2. **Use Pagination**: Don't fetch all records at once, use `limit` and `offset`
3. **Cache Results**: Cache API responses client-side when appropriate
4. **Compress Requests**: Enable gzip compression for JSON payloads
5. **Monitor Rate Limits**: Track rate limit headers to avoid 429 errors

---

## Security Tips

1. **Keep Credentials Secure**: Never expose `mb_session` cookie in logs
2. **Use HTTPS**: Always use HTTPS in production
3. **Validate Input**: Validate all user input before sending to API
4. **Handle Errors**: Don't expose sensitive info in error messages
5. **Monitor Access**: Check audit logs for suspicious activity

---

## References

- **Rate Limiting**: See `/docs/RATE_LIMITING_GUIDE.md`
- **Multi-Tenant**: See `/docs/MULTI_TENANT_AUDIT.md`
- **OpenAPI Spec**: `/frontends/nextjs/src/app/api/docs/openapi.json`
- **Swagger UI**: `http://localhost:3000/api/docs`

---

**Status**: Production Ready
**Last Updated**: 2026-01-21
**API Version**: 1.0.0

