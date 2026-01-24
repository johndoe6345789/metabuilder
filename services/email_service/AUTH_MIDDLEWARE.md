# Phase 7: Flask Authentication Middleware

Comprehensive JWT-based authentication middleware for the email service with multi-tenant isolation, role-based access control, rate limiting, and request logging.

**Status**: Production Ready
**Location**: `services/email_service/src/middleware/auth.py`
**Test Coverage**: `services/email_service/tests/test_auth_middleware.py` (50+ tests)

---

## Features

### 1. JWT Token Management
- **Create tokens**: `create_jwt_token(tenant_id, user_id, role, expires_in_hours)`
- **Decode tokens**: `decode_jwt_token(token)`
- **Bearer token extraction**: Automatic extraction from `Authorization: Bearer <token>` header
- **Token expiration**: Configurable expiration hours (default: 24 hours)
- **Role support**: User or Admin roles

### 2. Multi-Tenant Isolation
- **Tenant context extraction**: From JWT claims or headers
- **All queries filtered by tenantId**: Enforced at middleware level
- **Cross-tenant access prevention**: Raises 403 Forbidden
- **Row-level security**: Regular users can only access their own resources, admins can access any resource in their tenant

### 3. Role-Based Access Control (RBAC)
- **User role**: Regular user (default)
- **Admin role**: Administrative privileges
- **@verify_role decorator**: Restrict endpoints to specific roles
- **Multi-role support**: Allow multiple roles for a single endpoint

### 4. Request Logging
- **Automatic context logging**: User ID, role, tenant ID, endpoint, method, IP address
- **Audit trail**: All authenticated requests logged with context
- **Error logging**: Detailed error logging with stack traces

### 5. Rate Limiting
- **Per-user rate limiting**: 50 requests/minute per user
- **Redis backend**: Distributed rate limiting across instances
- **In-memory fallback**: Works without Redis (development)
- **Customizable limits**: Configure per-endpoint

### 6. CORS Configuration
- **Pre-configured for email client**: Supports localhost:3000 by default
- **Configurable origins**: Set via `CORS_ORIGINS` environment variable
- **Standard methods**: GET, POST, PUT, DELETE, OPTIONS

---

## Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Rate Limiting
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ORIGINS=localhost:3000,example.com

# Flask
FLASK_ENV=development
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
```

### Default Values

| Variable | Default |
|----------|---------|
| `JWT_SECRET_KEY` | `your-secret-key-change-in-production` |
| `JWT_ALGORITHM` | `HS256` |
| `JWT_EXPIRATION_HOURS` | `24` |
| `REDIS_URL` | `redis://localhost:6379/0` |
| `CORS_ORIGINS` | `localhost:3000` |
| `FLASK_ENV` | `development` |
| `FLASK_HOST` | `0.0.0.0` |
| `FLASK_PORT` | `5000` |

---

## API Usage

### 1. Creating JWT Tokens

```python
from src.middleware.auth import create_jwt_token

# Create user token (24 hours)
token = create_jwt_token(
    tenant_id="550e8400-e29b-41d4-a716-446655440000",
    user_id="550e8400-e29b-41d4-a716-446655440001",
    role="user"
)

# Create admin token with custom expiration
admin_token = create_jwt_token(
    tenant_id="550e8400-e29b-41d4-a716-446655440000",
    user_id="550e8400-e29b-41d4-a716-446655440002",
    role="admin",
    expires_in_hours=48
)
```

### 2. Protecting Endpoints with @verify_tenant_context

```python
from flask import request
from src.middleware.auth import verify_tenant_context, get_tenant_context

@app.route('/api/accounts')
@verify_tenant_context
def list_accounts():
    tenant_id, user_id = get_tenant_context()

    # Query accounts for this tenant and user
    accounts = db.query(Account).filter(
        Account.tenant_id == tenant_id,
        Account.user_id == user_id
    ).all()

    return {'accounts': [a.to_dict() for a in accounts]}, 200
```

**Request with JWT token:**
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/accounts
```

**Request with headers (development):**
```bash
curl -H "X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440000" \
     -H "X-User-ID: 550e8400-e29b-41d4-a716-446655440001" \
     http://localhost:5000/api/accounts
```

### 3. Role-Based Access Control with @verify_role

```python
from src.middleware.auth import verify_tenant_context, verify_role

@app.route('/api/admin/users')
@verify_tenant_context
@verify_role('admin')
def list_all_users():
    """Admin-only endpoint: list all users in tenant"""
    tenant_id, _ = get_tenant_context()

    users = db.query(User).filter(User.tenant_id == tenant_id).all()
    return {'users': [u.to_dict() for u in users]}, 200


@app.route('/api/settings')
@verify_tenant_context
@verify_role('user', 'admin')  # Both user and admin allowed
def get_settings():
    """Accessible by both users and admins"""
    tenant_id, user_id = get_tenant_context()

    settings = db.query(Settings).filter(
        Settings.tenant_id == tenant_id,
        Settings.user_id == user_id
    ).first()

    return {'settings': settings.to_dict()}, 200
```

### 4. Row-Level Access Control with verify_resource_access

```python
from src.middleware.auth import (
    verify_tenant_context,
    get_tenant_context,
    verify_resource_access
)

@app.route('/api/accounts/<account_id>')
@verify_tenant_context
def get_account(account_id):
    tenant_id, user_id = get_tenant_context()

    # Get account from database
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.tenant_id == tenant_id
    ).first()

    if not account:
        return {'error': 'Not found'}, 404

    # Verify user can access this account
    try:
        verify_resource_access(account.tenant_id, account.user_id)
    except AuthError as e:
        return {'error': e.message}, e.status_code

    return {'account': account.to_dict()}, 200
```

---

## Middleware Workflow

### 1. Request Authentication

```
Request arrives with:
  - Authorization: Bearer <JWT token>
  - OR X-Tenant-ID and X-User-ID headers

↓

@verify_tenant_context decorator:
  1. Extract tenant_id, user_id, role from token or headers
  2. Validate UUIDs
  3. Store in request object (request.tenant_id, request.user_id, request.user_role)
  4. Log request context (audit trail)
  5. Pass to route handler

↓

Route handler:
  1. Call get_tenant_context() to retrieve tenant_id and user_id
  2. All database queries must filter by tenant_id
  3. For resource access, call verify_resource_access()
```

### 2. Role-Based Access

```
Request with tenant context + @verify_role('admin') decorator:

↓

@verify_role checks:
  1. Extract request.user_role
  2. Compare against allowed roles
  3. If match: Continue to handler
  4. If no match: Return 403 Forbidden
```

### 3. Resource Access Control

```
Route accesses a resource (email, account, etc):

↓

verify_resource_access(resource_tenant_id, resource_user_id):
  1. Get current tenant_id, user_id, role from request
  2. If admin: Allow access (within same tenant)
  3. If user: Allow only if resource.user_id == current.user_id
  4. If cross-tenant: Block (403 Forbidden)
  5. Raise AuthError on violation
```

---

## Security Considerations

### 1. Multi-Tenant Isolation

**CRITICAL**: All database queries must include `tenant_id` filtering:

```python
# ✅ CORRECT: Filtered by tenant_id
accounts = db.query(Account).filter(Account.tenant_id == tenant_id).all()

# ❌ WRONG: No tenant filtering (SECURITY ISSUE)
accounts = db.query(Account).all()

# ✅ CORRECT: Also filter by user_id for user-level queries
accounts = db.query(Account).filter(
    Account.tenant_id == tenant_id,
    Account.user_id == user_id
).all()
```

### 2. JWT Secret Management

- **Production**: Use strong secret (32+ characters)
- **Environment variable**: `JWT_SECRET_KEY`
- **Rotation**: Change secret to invalidate all tokens
- **Never hardcode**: Always use environment variables

### 3. Password Hashing

- **Algorithm**: SHA-512 with salt
- **Salt length**: 32 bytes (256 bits)
- **Constant-time comparison**: Prevents timing attacks
- **See**: `src/models/credential.py` for implementation

### 4. CORS Configuration

- **Production**: Specify exact origins (not wildcard)
- **Environment variable**: `CORS_ORIGINS`
- **Example**: `CORS_ORIGINS=app.example.com,admin.example.com`

---

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Bearer token or X-Tenant-ID and X-User-ID headers required"
}
```

**Causes**:
- Missing authorization header or headers
- Invalid JWT token
- Expired JWT token
- Invalid token signature

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions. Required role: admin"
}
```

**Causes**:
- User lacks required role
- Cross-tenant access attempt
- Cross-user resource access attempt

### 400 Bad Request

```json
{
  "error": "Invalid request",
  "message": "Tenant ID must be valid UUID"
}
```

**Causes**:
- Invalid UUID format
- Invalid role value
- Malformed request

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "..."
}
```

**Causes**:
- Unexpected exception during auth
- Database connection error
- Configuration error

---

## Testing

### Running Tests

```bash
cd services/email_service

# Run all auth tests
pytest tests/test_auth_middleware.py -v

# Run specific test class
pytest tests/test_auth_middleware.py::TestJWTTokens -v

# Run with coverage
pytest tests/test_auth_middleware.py --cov=src.middleware.auth

# Run integration tests only
pytest tests/test_auth_middleware.py::TestIntegrationScenarios -v
```

### Test Coverage

The test suite includes:

- **UUID Validation** (5 tests)
- **JWT Token Creation** (6 tests)
- **JWT Token Decoding** (4 tests)
- **Bearer Token Extraction** (4 tests)
- **Tenant Context Extraction** (5 tests)
- **Tenant Context Verification** (5 tests)
- **Role Verification** (5 tests)
- **Context Getters** (4 tests)
- **Resource Access Control** (5 tests)
- **Request Logging** (3 tests)
- **Error Handling** (3 tests)
- **Integration Scenarios** (4 tests)

**Total**: 53 test cases

### Example Test

```python
def test_create_jwt_token_success(self, valid_tenant_id, valid_user_id):
    """Test successful token creation"""
    token = create_jwt_token(valid_tenant_id, valid_user_id, role="user")
    assert isinstance(token, str)
    assert len(token) > 0

def test_verify_role_admin_success(self, app_context, admin_token):
    """Test admin role verification succeeds"""
    @verify_tenant_context
    @verify_role('admin')
    def test_route():
        return {'status': 'ok'}, 200

    with app_context.test_request_context(
        headers={'Authorization': f'Bearer {admin_token}'}
    ):
        response, status = test_route()
        assert status == 200
```

---

## Rate Limiting

### Configuration

```python
from src.middleware.rate_limit import limiter

# Initialize limiter in Flask app
limiter.init_app(app)

# Apply default limit (50/minute) to all API routes
app.config['RATELIMIT_KEY_FUNC'] = lambda: request.headers.get('X-User-ID') or request.remote_addr
```

### Per-Endpoint Limits

```python
from src.middleware.rate_limit import limiter

@app.route('/api/accounts')
@limiter.limit("100 per minute")  # Custom limit for this endpoint
def list_accounts():
    return {'accounts': []}, 200

@app.route('/api/send')
@limiter.limit("10 per minute")  # Strict limit for expensive operation
def send_email():
    return {'status': 'sending'}, 200
```

### Rate Limit Headers

Responses include rate limit info:

```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 49
X-RateLimit-Reset: 1234567890
```

### Rate Limit Exceeded

```
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": "Rate limit exceeded",
  "message": "50 per 1 minute"
}
```

---

## CORS Configuration

### Email Client Frontend

Configured for email client at `http://localhost:3000`:

```python
CORS(app, resources={
    r'/api/*': {
        'origins': os.getenv('CORS_ORIGINS', 'localhost:3000').split(','),
        'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'allow_headers': ['Content-Type', 'Authorization']
    }
})
```

### Preflight Requests

CORS preflight (OPTIONS) requests are automatically handled:

```bash
curl -X OPTIONS http://localhost:5000/api/accounts \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET"

# Response includes:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Logging

### Log Levels

- **INFO**: Successful authentication, token creation, requests
- **WARNING**: Authentication failures, cross-tenant attempts
- **ERROR**: Unexpected exceptions, configuration errors

### Log Format

```
[datetime] [level] [logger] message
2026-01-24 10:30:45,123 INFO src.middleware.auth JWT token created for user 550e8400... in tenant 550e8400...
2026-01-24 10:30:46,456 INFO src.middleware.auth Request: method=GET endpoint=/api/accounts user_id=550e8400... tenant_id=550e8400... role=user ip=127.0.0.1
```

### Configuring Logging

```python
import logging

# Set auth middleware log level
logging.getLogger('src.middleware.auth').setLevel(logging.DEBUG)

# Configure for JSON output (production)
import structlog
structlog.configure(
    processors=[
        structlog.processors.JSONRenderer()
    ],
    logger_factory=structlog.PrintLoggerFactory(),
)
```

---

## Integration with Email Service Routes

### Example: Accounts Route

```python
from flask import Blueprint, request
from src.middleware.auth import verify_tenant_context, get_tenant_context

accounts_bp = Blueprint('accounts', __name__)

@accounts_bp.route('/list', methods=['GET'])
@verify_tenant_context
def list_accounts():
    tenant_id, user_id = get_tenant_context()

    # All queries automatically filtered by tenant_id
    accounts = db.query(EmailAccount).filter(
        EmailAccount.tenant_id == tenant_id,
        EmailAccount.user_id == user_id
    ).all()

    return {
        'accounts': [
            {
                'id': acc.id,
                'email': acc.email,
                'account_type': acc.account_type
            } for acc in accounts
        ]
    }, 200

@accounts_bp.route('/create', methods=['POST'])
@verify_tenant_context
def create_account():
    tenant_id, user_id = get_tenant_context()

    data = request.get_json()

    # Create account for current user/tenant
    account = EmailAccount(
        tenant_id=tenant_id,
        user_id=user_id,
        email=data['email'],
        account_type=data['account_type']
    )
    db.session.add(account)
    db.session.commit()

    return {'account': account.to_dict()}, 201
```

### Example: Admin Route

```python
from src.middleware.auth import verify_tenant_context, verify_role

@accounts_bp.route('/admin/list-all', methods=['GET'])
@verify_tenant_context
@verify_role('admin')
def admin_list_all_accounts():
    tenant_id, _ = get_tenant_context()

    # Admin can see all accounts in their tenant
    accounts = db.query(EmailAccount).filter(
        EmailAccount.tenant_id == tenant_id
    ).all()

    return {'accounts': [a.to_dict() for a in accounts]}, 200
```

---

## Troubleshooting

### "Bearer token or X-Tenant-ID and X-User-ID headers required"

**Problem**: Missing authentication headers
**Solution**: Include one of:
- `Authorization: Bearer <token>` header
- `X-Tenant-ID` and `X-User-ID` headers

### "Token expired"

**Problem**: JWT token has expired
**Solution**: Create a new token with longer expiration or refresh token

### "Insufficient permissions"

**Problem**: User role doesn't match required role
**Solution**: Use admin account or request lower privilege operation

### "Tenant context not initialized"

**Problem**: Called `get_tenant_context()` outside of `@verify_tenant_context` decorated route
**Solution**: Ensure route is decorated with `@verify_tenant_context`

### Rate limiting not working

**Problem**: Redis connection failed
**Solution**: Check `REDIS_URL` environment variable; middleware falls back to in-memory

---

## Production Deployment

### Checklist

- [ ] Set `JWT_SECRET_KEY` to strong random value
- [ ] Set `CORS_ORIGINS` to production domain(s)
- [ ] Use PostgreSQL instead of SQLite
- [ ] Configure Redis for rate limiting
- [ ] Enable HTTPS/TLS
- [ ] Set `FLASK_ENV=production`
- [ ] Configure logging to file or centralized service
- [ ] Monitor rate limit headers
- [ ] Implement token refresh mechanism
- [ ] Set up alerts for authentication failures

### Environment Example

```bash
# Production .env file
JWT_SECRET_KEY=your-secure-random-key-32-chars-min
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=1
REDIS_URL=redis://redis.internal:6379/0
CORS_ORIGINS=app.example.com,api.example.com
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@db.internal/email_service
```

---

## See Also

- [Email Service README](./README.md)
- [Rate Limiting](./src/middleware/rate_limit.py)
- [Credential Management](./src/models/credential.py)
- [DBAL Multi-Tenant Guide](../../docs/MULTI_TENANT_AUDIT.md)
