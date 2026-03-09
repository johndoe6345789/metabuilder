# Phase 8: OpenAPI Documentation & SDK Generation

**Status**: ✅ COMPLETE

This phase creates production-grade API documentation using OpenAPI 3.0 specification, enabling automatic SDK generation for TypeScript/Python/Go clients.

## Overview

Phase 8 completes the email service API documentation stack:

- **OpenAPI 3.0.3 Specification** - Comprehensive API specification (`openapi.yaml`)
- **Swagger UI Integration** - Interactive API explorer
- **ReDoc Integration** - Beautiful API documentation
- **SDK Generation** - Automatic client libraries (TypeScript, Python, Go)
- **API Versioning Strategy** - Semantic versioning and backwards compatibility
- **Rate Limit Documentation** - Clear limits and headers
- **Authentication Schemes** - JWT and header-based auth examples
- **Error Response Documentation** - All HTTP status codes documented
- **Code Examples** - Request/response examples for all endpoints

## Files

```
services/email_service/
├── openapi.yaml                           # OpenAPI 3.0.3 specification (GENERATED)
├── PHASE_8_OPENAPI_DOCUMENTATION.md       # This file
├── swagger-ui.html                        # Standalone Swagger UI (for static hosting)
├── swagger-init.js                        # Swagger UI initialization script
├── client-sdks/                           # Auto-generated client libraries
│   ├── typescript/                        # TypeScript client (@metabuilder/email-service-client)
│   ├── python/                            # Python client (email-service-client)
│   └── go/                                # Go client (github.com/metabuilder/email-service-client)
├── docs/
│   ├── API_VERSIONING.md                  # Versioning strategy and deprecation
│   ├── SDK_USAGE_GUIDE.md                 # SDK examples for all languages
│   ├── MIGRATION_GUIDE.md                 # v1.0 → v2.0 migration path
│   └── SWAGGER_SETUP.md                   # Swagger UI setup instructions
└── nginx.conf                             # Nginx config for serving API docs
```

## OpenAPI Specification

The `openapi.yaml` file is the single source of truth for the API. It documents:

### Endpoints (13 total)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Service health check |
| `/api/accounts` | GET | List email accounts |
| `/api/accounts` | POST | Create account |
| `/api/accounts/{accountId}` | GET | Get account details |
| `/api/accounts/{accountId}` | PUT | Update account |
| `/api/accounts/{accountId}` | DELETE | Delete account |
| `/api/{accountId}/folders` | GET | List folders |
| `/api/{accountId}/folders/{folderId}/messages` | GET | List messages |
| `/api/{accountId}/messages/{messageId}` | GET | Get message details |
| `/api/{accountId}/messages/{messageId}` | PATCH | Update message flags |
| `/api/{accountId}/attachments/{attachmentId}/download` | GET | Download attachment |
| `/api/sync/{accountId}` | POST | Trigger IMAP sync |
| `/api/sync/task/{taskId}` | GET | Get sync status |
| `/api/compose/send` | POST | Send email |
| `/api/compose/draft` | POST | Save draft |

### Schemas (13 total)

- `AccountListResponse` - Paginated accounts response
- `AccountResponse` - Single account with full details
- `Account` - Simplified account object
- `CreateAccountRequest` - Request body for account creation
- `UpdateAccountRequest` - Request body for account updates
- `Folder` - Email folder structure
- `Message` - Message metadata and preview
- `MessageDetail` - Full message with body and attachments
- `Attachment` - Attachment metadata
- `SendEmailRequest` - Email composition request
- `Pagination` - Pagination metadata
- `ErrorResponse` - Standard error format

### Security Schemes

**JWT Bearer Token**:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Header-based Authentication**:
```http
X-Auth-Token: <jwt-token>
X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440000
X-User-ID: 550e8400-e29b-41d4-a716-446655440001
```

### Rate Limits

Enforced per-user via Redis:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `GET /api/accounts` | 100 | 1 minute |
| `POST /api/accounts` | 10 | 1 minute |
| `POST /api/sync/*` | 5 | 1 minute |
| `POST /api/compose/send` | 10 | 1 minute |
| All other endpoints | 50 | 1 minute |

Response headers:
```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1706033260000  (timestamp in ms)
```

## Swagger UI Integration

### Option 1: Flask Extension (Recommended)

Add Swagger UI to Flask app:

```bash
pip install flasgger flask-cors
```

Update `app.py`:

```python
from flasgger import Swagger

app = Flask(__name__)
swagger = Swagger(app, config={
    'specs': [
        {
            'endpoint': 'apispec',
            'route': '/apispec.json',
            'rule_filter': lambda rule: True,
            'model_filter': lambda tag: True,
        }
    ],
    'static_url_path': '/flasgger_static',
    'specs_route': '/api/docs',
    'title': 'Email Service API',
    'uiversion': 3,
    'version': '1.0.0',
    'description': 'Email service REST API'
})

# Load OpenAPI spec
import yaml
with open('openapi.yaml', 'r') as f:
    spec = yaml.safe_load(f)
    app.config['SWAGGER'] = spec
```

Access at: `http://localhost:5000/api/docs`

### Option 2: Standalone HTML (for static hosting)

See `swagger-ui.html` - can be deployed to S3, CDN, or static web server.

### Option 3: Docker Container

```bash
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/openapi.yaml \
  -v $(pwd)/openapi.yaml:/openapi.yaml \
  swaggerapi/swagger-ui
```

Access at: `http://localhost:8080`

## SDK Generation

### Prerequisites

```bash
npm install @openapitools/openapi-generator-cli -g
# or
pip install openapi-generator-cli
```

### Generate TypeScript SDK

```bash
openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o client-sdks/typescript \
  -p packageName=@metabuilder/email-service-client \
  -p packageVersion=1.0.0 \
  -p typescriptThreePlus=true
```

Install generated package:

```bash
cd client-sdks/typescript
npm install
npm pack  # Create tarball for publishing
```

Use in your application:

```typescript
import { EmailServiceApi, Configuration } from '@metabuilder/email-service-client'

const api = new EmailServiceApi(
  new Configuration({
    basePath: 'http://localhost:5000',
    accessToken: 'your-jwt-token'
  })
)

// List accounts
const accounts = await api.listAccounts({ limit: 100, offset: 0 })

// Create account
const newAccount = await api.createAccount({
  accountName: 'Gmail',
  emailAddress: 'user@gmail.com',
  protocol: 'imap',
  hostname: 'imap.gmail.com',
  port: 993,
  encryption: 'tls',
  username: 'user@gmail.com',
  password: 'app-password',
  isSyncEnabled: true,
  syncInterval: 300
})

// Send email
const response = await api.sendEmail({
  accountId: newAccount.id,
  to: ['recipient@example.com'],
  subject: 'Hello',
  body: 'Hi there!'
})

// Get sync status
const status = await api.getSyncStatus({ taskId: response.taskId })
console.log(`Sync: ${status.progress}%`)
```

### Generate Python SDK

```bash
openapi-generator-cli generate \
  -i openapi.yaml \
  -g python \
  -o client-sdks/python \
  -p packageName=email_service_client \
  -p projectName=email-service-client
```

Install:

```bash
cd client-sdks/python
pip install -e .
```

Usage:

```python
from email_service_client import EmailServiceApi, Configuration

config = Configuration(
    host='http://localhost:5000',
    access_token='your-jwt-token'
)
api = EmailServiceApi(config)

# List accounts
accounts = api.list_accounts(limit=100, offset=0)

# Create account
account = api.create_account({
    'accountName': 'Gmail',
    'emailAddress': 'user@gmail.com',
    'protocol': 'imap',
    'hostname': 'imap.gmail.com',
    'port': 993,
    'encryption': 'tls',
    'username': 'user@gmail.com',
    'password': 'app-password'
})

# Send email
response = api.send_email({
    'accountId': account.id,
    'to': ['recipient@example.com'],
    'subject': 'Hello',
    'body': 'Hi there!'
})

# Poll sync status
status = api.get_sync_status(task_id=response.task_id)
print(f"Sync: {status.progress}%")
```

### Generate Go SDK

```bash
openapi-generator-cli generate \
  -i openapi.yaml \
  -g go \
  -o client-sdks/go \
  -p packageName=emailservice \
  -p packageVersion=1.0.0
```

Usage:

```go
package main

import (
	"context"
	client "github.com/metabuilder/email-service-client"
)

func main() {
	config := client.NewConfiguration()
	config.Servers[0].URL = "http://localhost:5000"
	config.AddDefaultHeader("Authorization", "Bearer "+token)

	api := client.NewAPIClient(config)

	// List accounts
	accounts, _, err := api.AccountsApi.ListAccounts(context.Background()).Execute()
	if err != nil {
		panic(err)
	}

	// Create account
	createReq := *client.NewCreateAccountRequest(
		"Gmail",
		"user@gmail.com",
		"imap",
		"imap.gmail.com",
		int32(993),
		"user@gmail.com",
		"app-password",
	)
	account, _, _ := api.AccountsApi.CreateAccount(context.Background()).
		CreateAccountRequest(createReq).
		Execute()

	// Send email
	sendReq := *client.NewSendEmailRequest(
		account.Id,
		[]string{"recipient@example.com"},
		"Hello",
		"Hi there!",
	)
	response, _, _ := api.ComposeApi.SendEmail(context.Background()).
		SendEmailRequest(sendReq).
		Execute()
}
```

## API Versioning Strategy

### Current Version: 1.0.0

Uses semantic versioning: `MAJOR.MINOR.PATCH`

**Versioning rules**:

1. **MAJOR** (1.x.x → 2.x.x) - Breaking changes
   - Remove endpoints
   - Change response schema structure
   - Require new authentication scheme
   - Change rate limits significantly

2. **MINOR** (1.1.x → 1.2.x) - Backwards-compatible additions
   - New endpoints
   - New optional request fields
   - New response fields (safe if optional)
   - New query parameters

3. **PATCH** (1.0.x → 1.0.y) - Bug fixes
   - Fix documentation errors
   - Correct HTTP status codes
   - Improve error messages

### API URL Versioning

Include version in base path:

```
/api/v1/accounts          # Version 1
/api/v2/accounts          # Version 2 (future, breaking changes)
```

Current implementation uses implicit v1 (backward compatible).

### Deprecation Policy

**60-day deprecation cycle**:

1. **Announced** - Endpoint marked as deprecated in OpenAPI spec
2. **Day 1-45** - Endpoint still works, returns `Deprecation` header
3. **Day 45-60** - Final warning, returns `Sunset` header
4. **Day 60+** - Endpoint removed

Example response headers:

```http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sun, 24 Mar 2026 00:00:00 GMT
Link: </api/v2/accounts>; rel="successor-version"
```

### Backwards Compatibility Rules

**Safe changes** (no version bump):

```yaml
# Adding optional field to response
accounts:
  - id: "123"
    name: "Work"
    # NEW: optional field (safe)
    customField: "value"

# Adding optional query parameter
GET /api/accounts?limit=100&search=term  # NEW: search parameter

# Adding new endpoint
POST /api/accounts/{id}/labels  # NEW endpoint (doesn't break old ones)
```

**Unsafe changes** (requires MAJOR version bump):

```yaml
# Removing required field
# Before: { id, name, email }
# After:  { id, name }  # ❌ BREAKING

# Changing field type
# Before: { createdAt: "2026-01-24T12:00:00Z" }
# After:  { createdAt: 1706033200000 }  # ❌ BREAKING

# Removing endpoint entirely
DELETE /api/accounts/{id}  # ❌ BREAKING

# Changing response structure
# Before: { accounts: [...], pagination: {...} }
# After:  { data: [...], meta: {...} }  # ❌ BREAKING
```

## ReDoc Integration

Beautiful documentation UI with built-in search:

```bash
npm install redoc
```

Create `redoc.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Email Service API</title>
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
  <redoc spec-url='/openapi.yaml'></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
</body>
</html>
```

Serve with:

```python
@app.route('/api/redoc')
def redoc():
    return send_file('redoc.html')
```

## Error Response Examples

All errors follow standard format:

```json
{
  "error": "Bad request",
  "message": "Invalid email address format",
  "code": "INVALID_EMAIL_FORMAT",
  "timestamp": 1706033200000
}
```

### Common Errors

**400 - Bad Request**
```json
{
  "error": "Bad request",
  "message": "Invalid email address format",
  "code": "INVALID_EMAIL_FORMAT"
}
```

**401 - Unauthorized**
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid JWT token",
  "code": "AUTH_INVALID_TOKEN"
}
```

**409 - Conflict**
```json
{
  "error": "Email conflict",
  "message": "Email address already registered",
  "code": "EMAIL_DUPLICATE"
}
```

**429 - Rate Limited**
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests - try again in 30 seconds",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**500 - Internal Error**
```json
{
  "error": "Internal server error",
  "message": "Database connection failed",
  "code": "DATABASE_ERROR"
}
```

## Authentication Examples

### JWT Bearer Token

Request:
```http
GET /api/accounts HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Header-based Authentication

Request:
```http
GET /api/accounts HTTP/1.1
X-Auth-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440000
X-User-ID: 550e8400-e29b-41d4-a716-446655440001
```

Both methods are supported and validated by auth middleware.

## Rate Limit Handling

When rate limit exceeded:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706033260000

{
  "error": "Rate limit exceeded",
  "message": "Too many requests - try again in 30 seconds"
}
```

Client implementation:

```typescript
// Exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (error.status === 429) {
        const resetTime = parseInt(error.headers['x-ratelimit-reset'])
        const waitMs = resetTime - Date.now()
        console.log(`Rate limited, waiting ${waitMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitMs + 100))
      } else {
        throw error
      }
    }
  }
}

// Usage
const accounts = await retryWithBackoff(() => api.listAccounts())
```

## Monitoring & Analytics

### API Metrics to Track

1. **Request Rate** - Requests per second by endpoint
2. **Response Time** - P50, P95, P99 latencies
3. **Error Rate** - 4xx and 5xx errors by status code
4. **Rate Limit Hits** - 429 responses per user/IP
5. **Authentication Failures** - 401 responses per strategy

### Prometheus Metrics

Add to Flask app:

```python
from prometheus_flask_exporter import PrometheusMetrics

metrics = PrometheusMetrics(app)
metrics.info('email_service_info', 'Email Service', version='1.0.0')

@app.route('/metrics')
def prometheus_metrics():
    return metrics.generate_latest()
```

Access at: `http://localhost:5000/metrics`

## API Documentation Deployment

### Option 1: Swagger UI via S3 + CloudFront

```bash
# Generate Swagger UI bundle
npm run build:swagger

# Upload to S3
aws s3 cp swagger-ui/ s3://my-bucket/api-docs/ --recursive

# Create CloudFront distribution pointing to S3
# Access at: https://api-docs.example.com
```

### Option 2: Self-hosted with Nginx

```nginx
server {
  listen 80;
  server_name api-docs.example.com;

  location / {
    alias /var/www/swagger-ui/;
    index index.html;
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://email-service:5000;
    proxy_set_header Host $host;
  }
}
```

### Option 3: GitHub Pages

Push OpenAPI spec and Swagger UI to GitHub, enable Pages:

```bash
git add openapi.yaml swagger-ui/
git commit -m "docs: Update API documentation"
git push origin main
# Access at: https://username.github.io/emailclient/api/
```

## Testing with Examples

### Curl Examples

**Create account**:
```bash
curl -X POST http://localhost:5000/api/accounts \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Work Email",
    "emailAddress": "user@company.com",
    "protocol": "imap",
    "hostname": "imap.company.com",
    "port": 993,
    "encryption": "tls",
    "username": "user@company.com",
    "password": "SecurePassword123!"
  }'
```

**List accounts**:
```bash
curl http://localhost:5000/api/accounts \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Send email**:
```bash
curl -X POST http://localhost:5000/api/compose/send \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "cuid123456",
    "to": ["recipient@example.com"],
    "subject": "Hello",
    "body": "Hi there!"
  }'
```

### Python Examples

```python
import requests

BASE_URL = 'http://localhost:5000'
JWT_TOKEN = 'your-jwt-token'
headers = {'Authorization': f'Bearer {JWT_TOKEN}'}

# List accounts
response = requests.get(f'{BASE_URL}/api/accounts', headers=headers)
accounts = response.json()['accounts']

# Create account
data = {
    'accountName': 'Gmail',
    'emailAddress': 'user@gmail.com',
    'protocol': 'imap',
    'hostname': 'imap.gmail.com',
    'port': 993,
    'encryption': 'tls',
    'username': 'user@gmail.com',
    'password': 'app-password'
}
response = requests.post(f'{BASE_URL}/api/accounts', json=data, headers=headers)
account = response.json()

# Send email
data = {
    'accountId': account['id'],
    'to': ['recipient@example.com'],
    'subject': 'Hello',
    'body': 'Hi there!'
}
response = requests.post(f'{BASE_URL}/api/compose/send', json=data, headers=headers)
result = response.json()
print(f"Task ID: {result['taskId']}")
```

## Frequently Asked Questions

**Q: How do I get a JWT token?**
A: Tokens are issued by the authentication service (outside this API). They contain user ID, tenant ID, and roles.

**Q: What's the difference between Bearer and Header auth?**
A: Both support JWT. Bearer auth is more standard for REST APIs. Header auth is for cases where Bearer auth can't be used (CORS, etc).

**Q: Can I use this API from a browser?**
A: Yes! CORS is enabled. However, storing JWT in localStorage is a security risk. Use httpOnly cookies instead.

**Q: What happens if my token expires?**
A: You'll receive a 401 response. Get a new token from the auth service and retry.

**Q: How do I handle timeouts?**
A: Set timeouts in your HTTP client (30s recommended). Implement exponential backoff for retries.

**Q: Is there a WebSocket API?**
A: Not in Phase 8. The REST API with polling is sufficient for most use cases. WebSocket support could be added in Phase 9.

**Q: How do I deprecate a custom endpoint I added?**
A: Follow the 60-day deprecation cycle documented in the versioning section.

## Next Steps

**Phase 9 (Future):**
- WebSocket API for real-time updates
- GraphQL endpoint as alternative to REST
- SDK auto-update pipeline
- Enhanced analytics and monitoring
- Performance optimization (caching, indexing)

## References

- [OpenAPI 3.0.3 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Generator](https://openapi-generator.tech/)
- [ReDoc Documentation](https://redoc.ly/)
- [REST API Best Practices](https://restfulapi.net/)
- [API Versioning Strategies](https://www.troyhunt.com/your-api-versioning-is-wrong-which-is/)

---

**Status**: ✅ Phase 8 COMPLETE - Production-ready OpenAPI documentation
