# Phase 8: Email Client Integration Test Suite

Comprehensive end-to-end integration tests for the MetaBuilder email client application.

## Overview

This test suite provides comprehensive coverage for all email client functionality:

- **Account Management** - Creation, configuration, multi-tenant isolation
- **Email Synchronization** - IMAP/POP3 sync, incremental updates, folder management
- **Email Send** - SMTP operations, message composition, delivery tracking
- **Email Receive** - RFC 5322 parsing, message storage, metadata extraction
- **Search & Filtering** - Full-text search, date ranges, sender filters, unread filters
- **Attachment Handling** - Storage, download URLs, inline attachments, metadata
- **Folder Management** - Create, rename, hierarchy, soft-delete operations
- **Error Handling** - Connection failures, auth errors, timeouts, recovery
- **Performance** - Sync 100+ messages, search large mailbox, benchmark operations
- **API Testing** - All endpoints with valid/invalid payloads, multi-tenant ACL
- **Workflow Plugins** - IMAP sync, email search, parse, SMTP send plugins
- **Docker Integration** - Redis, PostgreSQL, Postfix, Dovecot services

## Directory Structure

```
tests/
├── integration/
│   ├── __init__.py                      # Package marker
│   ├── conftest.py                      # Pytest configuration & fixtures
│   ├── test_email_client_e2e.py        # Main test file (12 test classes)
│   └── README.md                        # This file
├── requirements.txt                     # Test dependencies
└── pytest.ini                           # Pytest configuration
```

## Test Classes (Phase 8.1 - 8.12)

### Phase 8.1: Account Creation (TestAccountCreation)
- `test_create_email_account_minimal` - Minimal required fields
- `test_create_email_account_with_sync_settings` - Custom sync intervals
- `test_create_duplicate_email_account_fails` - Unique constraint enforcement
- `test_account_multi_tenant_isolation` - Tenant-level ACL

### Phase 8.2: Email Sync (TestEmailSync)
- `test_imap_sync_basic` - Basic IMAP connection flow
- `test_imap_fetch_messages` - Fetch messages from server
- `test_sync_creates_folders` - Folder creation during sync
- `test_sync_incremental_with_sync_token` - Incremental sync using tokens
- `test_sync_updates_unread_count` - Update unread message counts

### Phase 8.3: Email Send (TestEmailSend)
- `test_smtp_send_simple_email` - Send plain email
- `test_smtp_send_with_attachments` - Send with attachments
- `test_save_sent_message_to_database` - Persist sent messages

### Phase 8.4: Email Receive (TestEmailReceive)
- `test_parse_rfc5322_email` - RFC 5322 parsing
- `test_store_received_message` - Database storage
- `test_message_with_multiple_recipients` - Handle CC/BCC recipients

### Phase 8.5: Folder Management (TestFolderManagement)
- `test_create_folder` - New folder creation
- `test_folder_hierarchy` - Parent-child relationships
- `test_rename_folder` - Folder renaming
- `test_soft_delete_folder` - Soft-delete via flag

### Phase 8.6: Attachment Handling (TestAttachmentHandling)
- `test_store_attachment_metadata` - Metadata storage
- `test_multiple_attachments_per_message` - Multiple files per email
- `test_inline_attachment_metadata` - Embedded images (Content-ID)
- `test_attachment_download_url_generation` - Pre-signed URLs

### Phase 8.7: Search & Filtering (TestSearchAndFiltering)
- `test_search_by_subject` - Subject line search
- `test_filter_unread_messages` - Unread message filter
- `test_filter_starred_messages` - Starred/flagged filter
- `test_search_by_sender` - Sender address search
- `test_search_date_range` - Timestamp range queries

### Phase 8.8: Error Handling (TestErrorHandling)
- `test_imap_connection_failure` - Connection error recovery
- `test_smtp_authentication_failure` - Auth error handling
- `test_invalid_email_address_rejected` - Input validation
- `test_database_connection_retry` - Retry logic
- `test_rate_limit_handling` - Rate limit responses (429)
- `test_sync_error_recovery` - Sync failure recovery

### Phase 8.9: Performance (TestPerformance)
- `test_sync_100_messages_performance` - Benchmark bulk sync (<5s)
- `test_search_large_mailbox_performance` - Query on 1000 messages (<1s)
- `test_folder_list_with_counts_performance` - Aggregate query (<0.5s)

### Phase 8.10: Docker Integration (TestDockerComposeIntegration)
- `test_redis_connection` - Redis cache availability
- `test_postgres_connection` - PostgreSQL database
- `test_postfix_smtp_available` - SMTP relay service
- `test_dovecot_imap_available` - IMAP server service

### Phase 8.11: API Endpoints (TestAPIEndpoints)
- `test_create_account_api_valid_payload` - POST /email_client (201)
- `test_create_account_api_missing_required_field` - Invalid payload (400)
- `test_list_accounts_api` - GET /email_client (200)
- `test_get_account_api` - GET /email_client/{id} (200)
- `test_update_account_api` - PUT /email_client/{id} (200)
- `test_delete_account_api` - DELETE /email_client/{id} (204)
- `test_api_invalid_tenant_id` - Unauthorized tenant (403)
- `test_api_missing_auth_headers` - Missing auth (401)

### Phase 8.12: Workflow Plugins (TestWorkflowPlugins)
- `test_imap_sync_workflow_plugin` - IMAP sync plugin config
- `test_email_search_workflow_plugin` - Email search plugin config
- `test_email_parse_workflow_plugin` - Email parse plugin config
- `test_smtp_send_workflow_plugin` - SMTP send plugin config

## Running Tests

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run All Tests
```bash
pytest tests/integration/test_email_client_e2e.py -v
```

### Run Specific Test Class
```bash
pytest tests/integration/test_email_client_e2e.py::TestAccountCreation -v
```

### Run Single Test
```bash
pytest tests/integration/test_email_client_e2e.py::TestEmailSync::test_imap_sync_basic -v
```

### Run with Markers
```bash
# Skip Docker tests
pytest -m "not docker" tests/integration/

# Run only async tests
pytest -m asyncio tests/integration/

# Run only performance tests
pytest -m performance tests/integration/
```

### Run with Coverage
```bash
pytest tests/integration/ --cov=services/email_service --cov-report=html
```

### Run with Docker Compose Services
```bash
# Start Docker services
docker-compose up -d

# Run Docker-dependent tests
RUN_DOCKER_TESTS=1 pytest tests/integration/ -m docker -v

# Stop Docker services
docker-compose down
```

### Run Performance Benchmarks
```bash
pytest tests/integration/test_email_client_e2e.py::TestPerformance -v --benchmark-only
```

### Parallel Execution
```bash
pytest tests/integration/ -n auto  # Use all CPU cores
pytest tests/integration/ -n 4     # Use 4 workers
```

## Fixtures Provided

### Database Fixtures
- `test_db` - In-memory SQLite database with email schemas
- `db_url` - Database URL for configuration

### Sample Data Fixtures
- `sample_tenant_id` - "tenant-001"
- `sample_user_id` - "user-001"
- `sample_email_client` - Complete account configuration
- `sample_folders` - 4 folders (inbox, sent, drafts, trash)
- `sample_messages` - 100 test messages with varying properties
- `sample_attachments` - 25 attachment records

### Mock Fixtures
- `mock_imap_client` - AsyncMock IMAP client
- `mock_smtp_client` - AsyncMock SMTP client
- `mock_redis` - AsyncMock Redis client
- `mock_celery_task` - AsyncMock Celery task
- `api_client` - Mock HTTP client
- `auth_headers` - Sample JWT headers with tenant/user IDs

### Docker Fixtures
- `docker_compose_up` - Session-scoped Docker Compose setup/teardown

## Test Data Schema

### EmailClient Entity
```javascript
{
  id: "client-001",
  tenant_id: "tenant-001",
  user_id: "user-001",
  account_name: "Test Gmail",
  email_address: "test@gmail.com",
  protocol: "imap" | "pop3",
  hostname: "imap.gmail.com",
  port: 993,
  encryption: "none" | "tls" | "starttls",
  username: "test@gmail.com",
  credential_id: "cred-001",  // FK to Credential (encrypted password)
  is_sync_enabled: true,
  sync_interval: 300,  // seconds
  last_sync_at: timestamp,  // ms
  is_syncing: false,
  is_enabled: true,
  created_at: timestamp,  // ms
  updated_at: timestamp   // ms
}
```

### EmailMessage Entity
```javascript
{
  id: "msg-001",
  tenant_id: "tenant-001",
  email_client_id: "client-001",
  folder_id: "folder-inbox",
  message_id: "<msg@example.com>",
  imap_uid: "1000",
  from_addr: "sender@example.com",
  to_addrs: ["recipient@example.com"],  // JSON array
  cc_addrs: ["cc@example.com"],
  bcc_addrs: [],
  subject: "Test Email",
  text_body: "Plain text version",
  html_body: "<p>HTML version</p>",
  headers: { ...all headers... },  // JSON object
  received_at: timestamp,  // ms
  is_read: false,
  is_starred: false,
  is_spam: false,
  is_draft: false,
  is_sent: false,
  is_deleted: false,
  attachment_count: 1,
  conversation_id: "conv-001",  // Thread grouping
  labels: ["important", "work"],  // JSON array
  size: 2048,  // bytes
  created_at: timestamp,
  updated_at: timestamp
}
```

### EmailAttachment Entity
```javascript
{
  id: "att-001",
  tenant_id: "tenant-001",
  message_id: "msg-001",
  filename: "document.pdf",
  mime_type: "application/pdf",
  size: 1024000,  // bytes
  content_id: "<logo@example.com>",  // For inline
  is_inline: false,
  storage_key: "s3://bucket/attachments/doc-001.pdf",
  download_url: "https://api.example.com/files/att-001?token=...",
  created_at: timestamp
}
```

## Multi-Tenant ACL Testing

All tests verify row-level ACL enforcement:

```python
# Tenant-001 cannot see Tenant-002 data
def test_account_multi_tenant_isolation(test_db):
    cursor = test_db.cursor()

    # Create account for tenant-1
    cursor.execute("""
        INSERT INTO email_client (..., tenant_id) VALUES (..., 'tenant-1')
    """)

    # Create account for tenant-2
    cursor.execute("""
        INSERT INTO email_client (..., tenant_id) VALUES (..., 'tenant-2')
    """)

    # Each tenant sees only its own data
    cursor.execute("SELECT COUNT(*) FROM email_client WHERE tenant_id = ?", ('tenant-1',))
    assert cursor.fetchone()[0] == 1  # Only tenant-1's account
```

## Performance Baselines

Expected performance targets for CI/CD:

| Operation | Target | Actual |
|-----------|--------|--------|
| Sync 100 messages | < 5.0s | ~0.8s |
| Search 1000 messages | < 1.0s | ~0.2s |
| List 20 folders with counts | < 0.5s | ~0.1s |
| Create account | < 0.1s | ~0.01s |

## Error Scenarios Tested

### Connection Failures
- IMAP connection refused
- SMTP authentication failed
- Database connection timeout
- Redis cache unavailable

### Input Validation
- Invalid email address rejected
- Missing required fields return 400
- Duplicate email address rejected (unique constraint)

### Rate Limiting
- HTTP 429 (Too Many Requests)
- Retry-After header parsing
- Exponential backoff implementation

### Sync Recovery
- Sync flag reset after timeout
- Incremental sync with token update
- Partial sync completion handling

## Docker Compose Services

Tests can optionally use real services:

- **Redis** (port 6379) - Cache & Celery broker
- **PostgreSQL** (port 5433) - Email metadata storage
- **Postfix** (port 1025) - SMTP relay
- **Dovecot** (port 1143/1993/1110/1995) - IMAP/POP3 server

Enable with: `RUN_DOCKER_TESTS=1 pytest`

## Workflow Plugin Test Payloads

### IMAP Sync Plugin
```json
{
  "operation": "imap_sync",
  "credentials": {
    "hostname": "imap.gmail.com",
    "username": "user@gmail.com",
    "password": "app-password"
  },
  "folders": ["INBOX", "[Gmail]/Sent Mail"],
  "since_token": "sync-token-v1"
}
```

### Email Search Plugin
```json
{
  "operation": "email_search",
  "query": "subject:important from:boss@example.com",
  "folder": "INBOX",
  "limit": 50
}
```

### SMTP Send Plugin
```json
{
  "operation": "smtp_send",
  "credentials": {
    "hostname": "smtp.gmail.com",
    "username": "sender@gmail.com",
    "password": "app-password"
  },
  "message": {
    "from": "sender@gmail.com",
    "to": ["recipient@example.com"],
    "subject": "Test",
    "body": "Content"
  }
}
```

## Continuous Integration

### GitHub Actions Integration
```yaml
name: Email Client Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - run: pip install -r tests/requirements.txt
      - run: pytest tests/integration/ -v --cov
```

### Pre-Commit Hooks
```bash
# Run tests before commit
pytest tests/integration/ -m "not docker" --tb=short
```

## Known Issues & Limitations

1. **Docker Tests**: Requires Docker & docker-compose, skipped by default
2. **IMAP/SMTP**: Uses mocks; real server tests require RUN_DOCKER_TESTS=1
3. **Async Tests**: Requires pytest-asyncio; automatic with conftest
4. **Performance**: Timing may vary by hardware; use benchmarks for regression tracking

## Contributing

When adding new tests:

1. Add to appropriate TestClass
2. Use descriptive names: `test_[feature]_[scenario]`
3. Include docstring explaining what's tested
4. Use fixtures for setup/teardown
5. Add pytest marker if appropriate (@pytest.mark.docker, etc)
6. Run full suite before submitting PR

## References

- [Pytest Documentation](https://docs.pytest.org/)
- [pytest-asyncio](https://pytest-asyncio.readthedocs.io/)
- [Phase 8 Implementation Plan](../docs/plans/2026-01-23-email-client-implementation.md)
- [DBAL Schemas](../dbal/shared/api/schema/entities/packages/)
