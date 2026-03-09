# Phase 7: Email Folders API - Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
The email service already has all required dependencies in `requirements.txt`:
- Flask 3.0.0
- SQLAlchemy 2.0.23
- PostgreSQL driver (psycopg2)
- pytest for testing

```bash
pip install -r requirements.txt
```

### 2. Database Setup
```bash
# Create database
createdb email_service

# Initialize tables
python3 -c "from src.db import init_db, db; from app import app; init_db(app); db.create_all()"
```

### 3. Start Service
```bash
python3 app.py
```

Service runs on `http://localhost:5000`

---

## Quick API Examples

### Create an Email Account First
```bash
curl -X POST http://localhost:5000/api/accounts \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-123" \
  -H "X-User-ID: user-456" \
  -d '{
    "accountName": "Work Email",
    "emailAddress": "user@company.com",
    "hostname": "imap.company.com",
    "port": 993,
    "username": "user@company.com",
    "credentialId": "cred-789"
  }'
```

Returns: `{ "id": "acc-123", ... }`

### List All Folders in Account
```bash
curl -X GET "http://localhost:5000/api/accounts/acc-123/folders?tenant_id=tenant-123&user_id=user-456"
```

### Create a Custom Folder
```bash
curl -X POST http://localhost:5000/api/accounts/acc-123/folders \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-123" \
  -H "X-User-ID: user-456" \
  -d '{
    "folderName": "Projects",
    "displayName": "My Projects"
  }'
```

Returns: `{ "id": "folder-123", "folderName": "Projects", ... }`

### Update Folder Message Counts
```bash
curl -X PUT http://localhost:5000/api/accounts/acc-123/folders/folder-123 \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-123" \
  -H "X-User-ID: user-456" \
  -d '{
    "unreadCount": 5,
    "totalCount": 42
  }'
```

### Get Folder Hierarchy
```bash
curl -X GET "http://localhost:5000/api/accounts/acc-123/folders/folder-123/hierarchy?tenant_id=tenant-123&user_id=user-456"
```

### Delete Folder (Soft Delete)
```bash
curl -X DELETE "http://localhost:5000/api/accounts/acc-123/folders/folder-123?tenant_id=tenant-123&user_id=user-456"
```

### Delete Folder (Hard Delete)
```bash
curl -X DELETE "http://localhost:5000/api/accounts/acc-123/folders/folder-123?tenant_id=tenant-123&user_id=user-456&hard_delete=true"
```

---

## Run Tests

### All Tests
```bash
pytest tests/test_folders.py -v
```

### With Coverage
```bash
pytest tests/test_folders.py -v --cov=src/routes/folders --cov=src/models/folder --cov-report=html
```

### Specific Test Class
```bash
pytest tests/test_folders.py::TestCreateFolder -v
```

### Specific Test
```bash
pytest tests/test_folders.py::TestCreateFolder::test_create_folder_success -v
```

---

## File Structure

```
services/email_service/
├── app.py                              # Flask app entry point
├── requirements.txt                    # Python dependencies
├── src/
│   ├── db.py                          # Database configuration
│   ├── models/
│   │   ├── account.py                 # EmailAccount model
│   │   └── folder.py                  # EmailFolder model (NEW)
│   └── routes/
│       ├── accounts.py                # Account endpoints
│       ├── sync.py                    # Sync endpoints
│       ├── compose.py                 # Compose endpoints
│       └── folders.py                 # Folder endpoints (NEW)
├── tests/
│   └── test_folders.py                # Folder API tests (NEW)
├── PHASE7_FOLDERS_API.md              # Full API documentation
├── PHASE7_IMPLEMENTATION_SUMMARY.md   # Implementation details
└── PHASE7_QUICK_START.md              # This file
```

---

## Key Classes & Methods

### EmailFolder Model
```python
# List folders for an account
folders = EmailFolder.list_for_account(account_id, tenant_id, user_id)

# Get single folder
folder = EmailFolder.get_by_id(folder_id, tenant_id, user_id)

# Get system folder (inbox, sent, etc)
inbox = EmailFolder.get_system_folder(account_id, 'inbox', tenant_id, user_id)

# Create folder
folder = EmailFolder.create(data, tenant_id, user_id, account_id)

# Update folder
folder.update({'displayName': 'New Name'})

# Increment message count
folder.increment_message_count(is_unread=True)

# Get child folders
children = folder.get_child_folders()

# Get full hierarchy path
path = folder.get_hierarchy_path()

# Delete (soft)
folder.delete()

# Delete (hard)
folder.hard_delete()
```

### API Response Format
All endpoints return JSON:
```json
{
  "folders": [ { ... } ],    // For list endpoints
  "id": "uuid",              // For single resource
  "message": "...",          // For operations
  "error": "...",            // On error
  "count": 5                 // For collections
}
```

---

## Authentication

### Multi-Tenant Headers
All requests require:
- `X-Tenant-ID` - Organization identifier
- `X-User-ID` - User identifier

### Header vs Query Parameters
- **POST/PUT**: Use headers `X-Tenant-ID`, `X-User-ID`
- **GET/DELETE**: Use query params `?tenant_id=...&user_id=...`

---

## Special Folders

These folders are system-managed:
- **inbox** - Incoming mail (cannot delete/rename)
- **sent** - Sent messages (cannot delete/rename)
- **drafts** - Draft messages (cannot delete/rename)
- **trash** - Trash/deleted messages (cannot delete/rename)
- **spam** - Spam/junk messages (cannot delete/rename)

Custom folders can be freely deleted and renamed.

---

## Common Errors

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "X-Tenant-ID and X-User-ID headers (or tenant_id and user_id query params) required"
}
```
**Solution**: Add auth headers or query params

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Account ... not found or unauthorized"
}
```
**Solution**: Verify account_id, tenant_id, user_id are correct and account belongs to user

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "Folder \"Projects\" already exists"
}
```
**Solution**: Use different folder name or delete existing folder first

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Cannot delete system folders"
}
```
**Solution**: Only custom folders can be deleted. Check `isSystemFolder` flag

---

## Folder Hierarchy Example

Create parent folder:
```bash
curl -X POST http://localhost:5000/api/accounts/acc-123/folders \
  -H "X-Tenant-ID: tenant-123" \
  -H "X-User-ID: user-456" \
  -H "Content-Type: application/json" \
  -d '{"folderName": "Projects"}'
# Returns: {"id": "parent-id", ...}
```

Create child folder:
```bash
curl -X POST http://localhost:5000/api/accounts/acc-123/folders \
  -H "X-Tenant-ID: tenant-123" \
  -H "X-User-ID: user-456" \
  -H "Content-Type: application/json" \
  -d '{
    "folderName": "Q1",
    "parentFolderId": "parent-id",
    "imapName": "Projects/Q1"
  }'
# Returns: {"id": "child-id", "parentFolderId": "parent-id", ...}
```

Get hierarchy:
```bash
curl -X GET "http://localhost:5000/api/accounts/acc-123/folders/child-id/hierarchy?tenant_id=tenant-123&user_id=user-456"
# Returns parent path and children
```

---

## Message Count Tracking

Folders track message counts:
```json
{
  "id": "folder-123",
  "folderName": "INBOX",
  "unreadCount": 5,    // Unread messages
  "totalCount": 42,    // Total messages
  "lastSyncedAt": 1706033200000
}
```

Update counts when syncing:
```bash
curl -X PUT http://localhost:5000/api/accounts/acc-123/folders/folder-123 \
  -H "X-Tenant-ID: tenant-123" \
  -H "X-User-ID: user-456" \
  -H "Content-Type: application/json" \
  -d '{
    "unreadCount": 10,
    "totalCount": 50
  }'
```

Or use model methods:
```python
folder = EmailFolder.get_by_id(folder_id, tenant_id, user_id)
folder.increment_message_count(is_unread=True)   # New unread message
folder.decrement_message_count(is_unread=True)   # Marked as read
```

---

## Next Steps

### Phase 8: Messages API
- Implement EmailMessage model
- Integrate with folder message counts
- Implement `GET /api/accounts/:id/folders/:folderId/messages` fully

### Phase 9: Email Sync
- Implement IMAP folder sync
- Update sync state fields (UIDVALIDITY, UIDNEXT)
- Sync message counts from server

### Phase 10: Search
- Full-text search across folders
- Advanced filtering
- Message search

---

## Troubleshooting

### Database Connection Error
```
error: "database ... does not exist"
```
**Solution**: Create database with `createdb email_service`

### Import Error
```
ModuleNotFoundError: No module named 'src'
```
**Solution**: Run from email_service root directory, not subdirectory

### Test Failures
```
FAILED tests/test_folders.py::...
```
**Solution**: Run `pytest tests/test_folders.py -v` to see full error details

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Check `CORS_ORIGINS` environment variable includes client origin

---

## Development Commands

```bash
# Run app
python3 app.py

# Run tests
pytest tests/test_folders.py -v

# Run with coverage
pytest tests/test_folders.py --cov

# Check syntax
python3 -m py_compile src/routes/folders.py

# Health check
curl http://localhost:5000/health

# List all folders
curl "http://localhost:5000/api/accounts/ACC-ID/folders?tenant_id=TENANT-ID&user_id=USER-ID"
```

---

## Production Checklist

- [ ] Database configured (PostgreSQL in production, SQLite in dev)
- [ ] CORS origins configured for client domain
- [ ] Email tables created and indexed
- [ ] Tests passing
- [ ] API documentation reviewed
- [ ] Auth headers properly validated
- [ ] Error responses tested
- [ ] Multi-tenant isolation verified
- [ ] Rate limiting configured
- [ ] Monitoring/logging enabled
- [ ] Backup strategy in place

---

## Resources

- Full API Docs: `PHASE7_FOLDERS_API.md`
- Implementation Details: `PHASE7_IMPLEMENTATION_SUMMARY.md`
- Tests: `tests/test_folders.py`
- Email Service README: `README.md`

---

**Status**: ✅ Production Ready
**Last Updated**: 2026-01-24
