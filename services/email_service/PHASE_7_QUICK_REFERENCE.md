# Phase 7: Email Account API - Quick Reference

## Files

**Implementation**: `/services/email_service/src/routes/accounts.py` (748 lines)
**Tests**: `/services/email_service/tests/accounts_api/test_endpoints.py` (650+ lines)
**Documentation**: `/services/email_service/PHASE_7_IMPLEMENTATION.md`

## 6 Endpoints

### 1. Create Account
```bash
POST /api/accounts
X-Tenant-ID: tenant-123
X-User-ID: user-456

{
  "accountName": "Gmail",
  "emailAddress": "user@gmail.com",
  "hostname": "imap.gmail.com",
  "port": 993,
  "username": "user@gmail.com",
  "credentialId": "cred-id"
}

Response: 201 Created
{
  "id": "uuid",
  "accountName": "Gmail",
  ...
  "createdAt": 1706033200000,
  "updatedAt": 1706033200000
}
```

### 2. List Accounts
```bash
GET /api/accounts?tenant_id=123&user_id=456

Response: 200 OK
{
  "accounts": [...],
  "count": 1
}
```

### 3. Get Account
```bash
GET /api/accounts/account-id?tenant_id=123&user_id=456

Response: 200 OK - Account object
```

### 4. Update Account
```bash
PUT /api/accounts/account-id
X-Tenant-ID: tenant-123
X-User-ID: user-456

{
  "accountName": "Updated Name",
  "syncInterval": 600
}

Response: 200 OK - Updated account object
```

### 5. Delete Account
```bash
DELETE /api/accounts/account-id?tenant_id=123&user_id=456

Response: 200 OK
{
  "message": "Account deleted successfully",
  "id": "account-id"
}
```

### 6. Test Connection
```bash
POST /api/accounts/account-id/test
X-Tenant-ID: tenant-123
X-User-ID: user-456

{
  "password": "account-password",
  "timeout": 30
}

Response: 200 OK
{
  "success": true,
  "protocol": "imap",
  "server": "imap.gmail.com:993",
  "folders": 15,
  "folderDetails": [...],
  "timestamp": 1706033200000
}
```

## Validation Rules

| Field | Rules |
|-------|-------|
| accountName | Required, string |
| emailAddress | Required, must contain @ |
| protocol | Optional (default: imap), imap or pop3 |
| hostname | Required, string |
| port | Required, integer 1-65535 |
| encryption | Optional (default: tls), tls/starttls/none |
| username | Required, string |
| credentialId | Required, UUID |
| isSyncEnabled | Optional (default: true), boolean |
| syncInterval | Optional (default: 300), integer 60-3600 |

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT, DELETE) |
| 201 | Created (POST) |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing auth) |
| 403 | Forbidden (wrong tenant/user) |
| 404 | Not found |
| 500 | Server error |

## Key Features

- ✅ Multi-tenant isolation
- ✅ User-level authorization
- ✅ Comprehensive validation
- ✅ IMAP connection testing
- ✅ Folder discovery
- ✅ Error logging

## Testing

```bash
# Run all tests
python3 -m pytest tests/accounts_api/ -v

# Run specific endpoint
python3 -m pytest tests/accounts_api/test_endpoints.py::TestCreateAccount -v

# Run with coverage
python3 -m pytest tests/accounts_api/ --cov=src.routes.accounts
```

**Results**: 28/29 tests passing (96.6%)

## Integration Points

1. **DBAL**: Replace in-memory dict with database queries
2. **Credentials**: Reference credentialId to retrieve encrypted password
3. **Workflow**: Trigger IMAP sync after account creation
4. **WebSocket**: Real-time status updates

## Next Steps

1. Implement DBAL integration (Phase 8)
2. Implement credential service integration
3. Implement workflow triggers
4. Add soft delete support
5. Add rate limiting
6. Add audit logging

## Code Structure

```
accounts.py (748 lines)
├── Imports & Setup (20 lines)
├── Validation Helpers (150 lines)
│   ├── validate_account_creation()
│   ├── validate_account_update()
│   ├── authenticate_request()
│   └── check_account_ownership()
├── Endpoint: POST /api/accounts (100 lines)
├── Endpoint: GET /api/accounts (50 lines)
├── Endpoint: GET /api/accounts/:id (50 lines)
├── Endpoint: PUT /api/accounts/:id (150 lines)
├── Endpoint: DELETE /api/accounts/:id (80 lines)
└── Endpoint: POST /api/accounts/:id/test (150 lines)
```

## Database Schema (for DBAL)

```yaml
EmailAccount:
  id: uuid (primary)
  tenantId: uuid (required, index)
  userId: uuid (required, index)
  accountName: string
  emailAddress: string
  protocol: enum(imap, pop3)
  hostname: string
  port: int
  encryption: enum(tls, starttls, none)
  username: string
  credentialId: uuid (fk to Credential)
  isSyncEnabled: boolean
  syncInterval: int
  lastSyncAt: timestamp
  isSyncing: boolean
  isEnabled: boolean
  isDeleted: boolean (soft delete)
  createdAt: timestamp
  updatedAt: timestamp
```

## Common Requests

**Create Gmail Account**:
```bash
curl -X POST http://localhost:5000/api/accounts \
  -H "X-Tenant-ID: acme" \
  -H "X-User-ID: john" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Gmail",
    "emailAddress": "john@gmail.com",
    "hostname": "imap.gmail.com",
    "port": 993,
    "username": "john@gmail.com",
    "credentialId": "cred-123"
  }'
```

**List All Accounts**:
```bash
curl http://localhost:5000/api/accounts \
  -H "X-Tenant-ID: acme" \
  -H "X-User-ID: john"
```

**Test Connection**:
```bash
curl -X POST http://localhost:5000/api/accounts/account-id/test \
  -H "X-Tenant-ID: acme" \
  -H "X-User-ID: john" \
  -H "Content-Type: application/json" \
  -d '{"password": "gmail-app-password"}'
```

## Logging

All operations are logged:
```
logger.info(f'Created email account {account_id} for tenant {tenant_id}, user {user_id}')
logger.info(f'Updated email account {account_id} for tenant {tenant_id}')
logger.info(f'Deleted email account {account_id} for tenant {tenant_id}')
logger.error(f'Failed to connect to IMAP server: {error}')
```

## Security Notes

- Passwords should be stored in credential service, not in request
- Use credentialId to reference encrypted credentials
- Implement soft delete for audit trail
- Add rate limiting to prevent abuse
- Log all account modifications
