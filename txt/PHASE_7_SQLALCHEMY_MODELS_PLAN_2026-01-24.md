# Phase 7: SQLAlchemy Data Models Implementation Plan

**Date**: 2026-01-24
**Objective**: Create Phase 7 SQLAlchemy data models for email service
**Status**: Implementation Ready

## Files to Create

### 1. `services/email_service/src/models.py` (Main Models)
- **EmailAccount**: tenantId, userId, email, provider (imap/smtp/pop3), credentials
- **EmailFolder**: accountId, name, unread_count, message_count
- **EmailMessage**: folderId, from, to, cc, bcc, subject, body, received_at, flags
- **EmailAttachment**: messageId, filename, mime_type, size, blob_url
- Relationships, cascading deletes, and database indexes

### 2. `services/email_service/src/config.py` (Database Config)
- SQLAlchemy engine and session management
- Multi-environment support (dev/prod)

### 3. `services/email_service/tests/test_models.py` (Unit Tests)
- Test all model creation, relationships, and constraints
- Test cascading deletes
- Test index creation
- Test encryption/decryption (if applicable)

## Implementation Details

### Model Structure

#### EmailAccount
- **Columns**: id (UUID), tenantId (UUID, indexed), userId (UUID, indexed), email (str, unique),
  provider (enum: imap/pop3), hostname, port, encryption (enum), username, credentialId (FK),
  isSyncEnabled (bool), syncInterval (int), lastSyncAt (datetime), createdAt, updatedAt
- **Relationships**:
  - emailFolders (one-to-many)
  - credentials (one-to-one via credentialId)
- **Indexes**: (tenantId, userId), (email), (hostname, port)

#### EmailFolder
- **Columns**: id (UUID), accountId (UUID, FK), tenantId (UUID, indexed), name (str),
  folderPath (str), unreadCount (int), messageCount (int), flags (list), createdAt, updatedAt
- **Relationships**:
  - emailAccount (many-to-one)
  - emailMessages (one-to-many, cascade delete)
- **Indexes**: (accountId), (tenantId)

#### EmailMessage
- **Columns**: id (UUID), folderId (UUID, FK), tenantId (UUID, indexed), messageId (str, unique),
  from (str), to (str), cc (str), bcc (str), subject (str), body (text),
  received_at (datetime, indexed), is_read (bool), is_starred (bool), is_deleted (bool),
  flags (list), headers (JSON), createdAt, updatedAt
- **Relationships**:
  - emailFolder (many-to-one)
  - emailAttachments (one-to-many, cascade delete)
- **Indexes**: (folderId), (tenantId), (messageId), (received_at)

#### EmailAttachment
- **Columns**: id (UUID), messageId (UUID, FK), tenantId (UUID, indexed), filename (str),
  mimeType (str), size (int), blobUrl (str), uploadedAt (datetime), createdAt, updatedAt
- **Relationships**:
  - emailMessage (many-to-one)
- **Indexes**: (messageId), (tenantId)

### Key Features

1. **Multi-Tenant Safety**: All models have `tenantId` with indexes and filtering in queries
2. **Cascading Deletes**: Folders cascade to messages, messages cascade to attachments
3. **Soft Deletes**: Messages have `is_deleted` flag (not hard deleted)
4. **Comprehensive Indexes**: On frequently-queried columns
5. **Relationships**: All FK relationships with proper cascading
6. **Timestamps**: Created/updated tracking on all entities
7. **Type Safety**: Proper column types and constraints

## Testing Coverage

- Model instantiation with valid data
- Constraint enforcement (unique, required fields)
- Relationship creation and traversal
- Cascading deletes
- Index creation verification
- Multi-tenant isolation verification

## Files Modified

- `app.py`: Add database initialization
- `requirements.txt`: Already has sqlalchemy, flask-sqlalchemy
- `.env.example`: Already has DATABASE_URL

## Deliverables

1. ✅ `models.py` - 4 models with full relationships and indexes
2. ✅ `config.py` - Database configuration
3. ✅ `test_models.py` - Comprehensive test suite
4. ✅ This plan document
