# Email Service

Python Flask-based email service providing IMAP/SMTP operations via RESTful API.

## Features

- **Email Account Management**: Create, list, update, and delete email accounts
- **IMAP Sync**: Incremental sync of emails with UID tracking
- **SMTP Send**: Send emails with HTML/plain text and attachments
- **Draft Management**: Create and manage email drafts
- **Async Operations**: Celery-based async sync and send tasks
- **Multi-Tenant**: Full tenant isolation with ACL

## Architecture

```
app.py                      # Flask app entry point
src/
├── routes/
│   ├── accounts.py        # Account management API
│   ├── sync.py            # Sync status and control API
│   └── compose.py         # Send and draft API
├── imap_sync.py           # IMAP sync logic
└── smtp_send.py           # SMTP send logic
```

## Setup

### Requirements
- Python 3.9+
- Redis (for Celery)
- PostgreSQL (production)

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

### Running Locally

```bash
# Start Flask development server
python app.py

# In another terminal, start Celery worker (for async tasks)
celery -A src.tasks worker --loglevel=info
```

### Docker

```bash
# Build image
docker build -t metabuilder/email-service .

# Run container
docker run -p 5000:5000 \
  -e FLASK_ENV=production \
  -e DATABASE_URL=postgresql://... \
  metabuilder/email-service
```

## API Endpoints

### Accounts

#### List Email Accounts
```
GET /api/accounts?tenant_id=TENANT&user_id=USER
```

Response:
```json
{
  "accounts": [
    {
      "id": "cuid",
      "accountName": "Work Email",
      "emailAddress": "user@company.com",
      "protocol": "imap",
      "hostname": "imap.company.com",
      "port": 993,
      "encryption": "tls",
      "isSyncEnabled": true,
      "syncInterval": 300,
      "lastSyncAt": 1706033200000,
      "isSyncing": false,
      "isEnabled": true,
      "createdAt": 1706033200000,
      "updatedAt": 1706033200000
    }
  ]
}
```

#### Create Email Account
```
POST /api/accounts
Header: X-Tenant-ID: TENANT
Header: X-User-ID: USER

{
  "accountName": "Work Email",
  "emailAddress": "user@company.com",
  "protocol": "imap",
  "hostname": "imap.company.com",
  "port": 993,
  "encryption": "tls",
  "username": "user@company.com",
  "credentialId": "uuid",
  "isSyncEnabled": true,
  "syncInterval": 300
}
```

#### Get Account Details
```
GET /api/accounts/{accountId}?tenant_id=TENANT&user_id=USER
```

#### Delete Account
```
DELETE /api/accounts/{accountId}?tenant_id=TENANT&user_id=USER
```

### Sync

#### Trigger Sync
```
POST /api/sync/{accountId}
Header: X-Tenant-ID: TENANT
Header: X-User-ID: USER

{
  "forceFullSync": false,
  "folderIds": ["inbox", "sent"]  # optional
}
```

Response:
```json
{
  "syncId": "uuid",
  "accountId": "account_id",
  "status": "started",
  "startedAt": 1706033200000,
  "estimatedCompletionAt": 1706033300000,
  "progressMessage": "Starting sync..."
}
```

#### Get Sync Status
```
GET /api/sync/{accountId}/status?tenant_id=TENANT&user_id=USER&syncId=SYNC_ID
```

#### Cancel Sync
```
POST /api/sync/{accountId}/cancel?tenant_id=TENANT&user_id=USER&syncId=SYNC_ID
```

### Compose

#### Send Email
```
POST /api/compose
Header: X-Tenant-ID: TENANT
Header: X-User-ID: USER

{
  "accountId": "uuid",
  "to": ["recipient@example.com"],
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"],
  "subject": "Email Subject",
  "textBody": "Plain text body",
  "htmlBody": "<html>HTML body</html>",
  "attachments": [
    {
      "filename": "file.pdf",
      "contentType": "application/pdf",
      "data": "base64-encoded-data"
    }
  ],
  "sendAt": 1706033200000  # optional - schedule for later
}
```

#### List Drafts
```
GET /api/compose/drafts?tenant_id=TENANT&user_id=USER&accountId=ACCOUNT_ID
```

#### Create Draft
```
POST /api/compose/drafts
Header: X-Tenant-ID: TENANT
Header: X-User-ID: USER

{
  "accountId": "uuid",
  "to": ["recipient@example.com"],
  "subject": "Draft Subject",
  "textBody": "Draft body",
  "attachments": []
}
```

#### Update Draft
```
PUT /api/compose/drafts/{draftId}
Header: X-Tenant-ID: TENANT
Header: X-User-ID: USER

{
  "subject": "Updated Subject",
  "textBody": "Updated body"
}
```

## Security

- **Multi-Tenant**: All queries filtered by `tenantId` and `userId`
- **Row-Level ACL**: Email accounts and drafts require ownership verification
- **Encrypted Credentials**: Passwords stored encrypted in DBAL via credential entity
- **CORS**: Configurable CORS origins via environment variables
- **Input Validation**: All inputs validated before processing

## Integration with DBAL

Email entities are defined in:
- `dbal/shared/api/schema/entities/packages/email_client.yaml`
- `dbal/shared/api/schema/entities/packages/email_folder.yaml`
- `dbal/shared/api/schema/entities/packages/email_message.yaml`
- `dbal/shared/api/schema/entities/packages/email_attachment.yaml`

In production, this service will use DBAL TypeScript client instead of in-memory storage.

## Error Handling

All endpoints return structured error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common error codes:
- 400: Bad request (missing fields, invalid data)
- 401: Unauthorized (missing auth headers)
- 403: Forbidden (insufficient permissions)
- 404: Not found (entity not found)
- 500: Internal server error

## Logging

Logs are written to stdout. Configure log level via `EMAIL_SERVICE_LOG_LEVEL` environment variable.

Production log format:
```
[2026-01-23 10:30:45] [email_service] INFO: Connected to IMAP server
```

## Testing

```bash
# Run unit tests
pytest tests/

# Run integration tests
pytest tests/integration/

# Check code coverage
pytest --cov=src tests/
```

## Future Enhancements

- [ ] POP3 support
- [ ] Calendar sync (CalDAV)
- [ ] Contact sync (CardDAV)
- [ ] Full-text search
- [ ] Spam filtering ML
- [ ] Email encryption (PGP/S/MIME)
- [ ] Delegation support
- [ ] Calendar availability sync
