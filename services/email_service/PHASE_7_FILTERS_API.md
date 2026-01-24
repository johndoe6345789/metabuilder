# Phase 7: Email Filters and Labels API

## Overview

Comprehensive email filtering and labeling system for automatic email organization. Supports rule-based filtering with execution order management, multiple filter criteria, and label-based categorization.

**Status**: Complete implementation with comprehensive tests

## Architecture

### Core Components

1. **Filter Model** (`EmailFilter`)
   - Rule-based email filtering with execution order
   - Multiple criteria types: from, to, subject, contains, date_range
   - Multiple action types: move_to_folder, mark_read, apply_labels, delete
   - Enable/disable flags
   - Apply to new and/or existing messages

2. **Label Model** (`EmailLabel`)
   - User-defined labels for email categorization
   - Color coding for visual organization
   - Display ordering
   - Unique per account

3. **Filter Execution**
   - Automatic application on new messages
   - Retroactive application to existing messages
   - Dry-run capability for testing
   - Batch processing support

## Database Schema

### EmailFilter Table
```sql
CREATE TABLE email_filters (
    id VARCHAR(50) PRIMARY KEY,
    account_id VARCHAR(50) NOT NULL REFERENCES email_accounts(id),
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    criteria JSON NOT NULL,      -- {from, to, subject, contains, date_range}
    actions JSON NOT NULL,       -- {move_to_folder, mark_read, apply_labels, delete}
    order INTEGER NOT NULL DEFAULT 0,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    apply_to_new BOOLEAN NOT NULL DEFAULT TRUE,
    apply_to_existing BOOLEAN NOT NULL DEFAULT FALSE,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    UNIQUE(account_id, name)
)
```

### EmailLabel Table
```sql
CREATE TABLE email_labels (
    id VARCHAR(50) PRIMARY KEY,
    account_id VARCHAR(50) NOT NULL REFERENCES email_accounts(id),
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7),            -- HEX color #RRGGBB
    description TEXT,
    order INTEGER NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    UNIQUE(account_id, name)
)
```

### EmailFilterLabel Association Table
```sql
CREATE TABLE email_filter_labels (
    filter_id VARCHAR(50) PRIMARY KEY REFERENCES email_filters(id),
    label_id VARCHAR(50) PRIMARY KEY REFERENCES email_labels(id)
)
```

## API Endpoints

### Filter Management

#### Create Filter
```
POST /api/v1/accounts/{accountId}/filters
```

**Request Body**:
```json
{
    "name": "Work Emails",
    "description": "Filter emails from work domain",
    "criteria": {
        "from": "@company.com",
        "subject": "important"
    },
    "actions": {
        "move_to_folder": "folder-id-123",
        "apply_labels": ["label-id-1", "label-id-2"],
        "mark_read": false
    },
    "order": 0,
    "isEnabled": true,
    "applyToNew": true,
    "applyToExisting": false
}
```

**Response** (201 Created):
```json
{
    "id": "filter-uuid",
    "accountId": "account-uuid",
    "tenantId": "tenant-uuid",
    "name": "Work Emails",
    "description": "Filter emails from work domain",
    "criteria": { "from": "@company.com", "subject": "important" },
    "actions": { ... },
    "order": 0,
    "isEnabled": true,
    "applyToNew": true,
    "applyToExisting": false,
    "createdAt": 1704067200000,
    "updatedAt": 1704067200000
}
```

#### List Filters
```
GET /api/v1/accounts/{accountId}/filters?enabled=true
```

**Query Parameters**:
- `enabled` (optional): Filter by enabled status (true/false)

**Response** (200 OK):
```json
{
    "filters": [
        { "id": "...", "name": "..." },
        { "id": "...", "name": "..." }
    ],
    "total": 2
}
```

#### Get Filter
```
GET /api/v1/accounts/{accountId}/filters/{filterId}
```

**Response** (200 OK):
```json
{
    "id": "filter-uuid",
    "name": "Work Emails",
    ...
}
```

#### Update Filter
```
PUT /api/v1/accounts/{accountId}/filters/{filterId}
```

**Request Body** (all fields optional):
```json
{
    "name": "Updated Filter Name",
    "criteria": { ... },
    "actions": { ... },
    "isEnabled": false,
    "order": 1
}
```

**Response** (200 OK):
```json
{
    "id": "filter-uuid",
    "name": "Updated Filter Name",
    ...
}
```

#### Delete Filter
```
DELETE /api/v1/accounts/{accountId}/filters/{filterId}
```

**Response** (204 No Content)

#### Execute Filter
```
POST /api/v1/accounts/{accountId}/filters/{filterId}/execute
```

**Request Body**:
```json
{
    "folderIds": ["folder-id-1", "folder-id-2"],  // Optional
    "dryRun": true
}
```

**Response** (200 OK):
```json
{
    "filterId": "filter-uuid",
    "matchedCount": 5,
    "appliedCount": 5,
    "dryRun": true
}
```

### Label Management

#### Create Label
```
POST /api/v1/accounts/{accountId}/labels
```

**Request Body**:
```json
{
    "name": "Important",
    "color": "#FF0000",
    "description": "Important emails",
    "order": 0
}
```

**Response** (201 Created):
```json
{
    "id": "label-uuid",
    "accountId": "account-uuid",
    "tenantId": "tenant-uuid",
    "name": "Important",
    "color": "#FF0000",
    "description": "Important emails",
    "order": 0,
    "createdAt": 1704067200000,
    "updatedAt": 1704067200000
}
```

#### List Labels
```
GET /api/v1/accounts/{accountId}/labels
```

**Response** (200 OK):
```json
{
    "labels": [
        { "id": "...", "name": "..." },
        { "id": "...", "name": "..." }
    ],
    "total": 2
}
```

#### Get Label
```
GET /api/v1/accounts/{accountId}/labels/{labelId}
```

**Response** (200 OK):
```json
{
    "id": "label-uuid",
    "name": "Important",
    ...
}
```

#### Update Label
```
PUT /api/v1/accounts/{accountId}/labels/{labelId}
```

**Request Body** (all fields optional):
```json
{
    "name": "Critical",
    "color": "#FF5500",
    "order": 1
}
```

**Response** (200 OK):
```json
{
    "id": "label-uuid",
    "name": "Critical",
    ...
}
```

#### Delete Label
```
DELETE /api/v1/accounts/{accountId}/labels/{labelId}
```

**Response** (204 No Content)

## Filter Criteria

### from
Match emails from a specific sender or domain
```json
{ "from": "@company.com" }
{ "from": "user@example.com" }
```

### to
Match emails to specific recipient or domain
```json
{ "to": "@company.com" }
{ "to": "user@example.com" }
```

### subject
Match emails with specific subject text (case-insensitive substring)
```json
{ "subject": "urgent" }
{ "subject": "meeting" }
```

### contains
Match emails with specific text in body (case-insensitive substring)
```json
{ "contains": "important" }
{ "contains": "review needed" }
```

### date_range
Match emails received within date range (milliseconds since epoch)
```json
{
    "date_range": {
        "start": 1704067200000,
        "end": 1704153600000
    }
}
```

## Filter Actions

### mark_read
Automatically mark matched emails as read
```json
{ "mark_read": true }
```

### delete
Automatically soft-delete (mark as deleted) matched emails
```json
{ "delete": true }
```

### move_to_folder
Move matched emails to specific folder
```json
{ "move_to_folder": "folder-id-123" }
```

### apply_labels
Apply one or more labels to matched emails
```json
{ "apply_labels": ["label-id-1", "label-id-2"] }
```

## Execution Order

Filters are executed in order of their `order` field (lowest first). This allows:
- Sequential filtering
- Hierarchical organization
- Predictable behavior

**Example**:
```
Filter 1 (order: 0) -> Match from @company.com, apply "Work" label
Filter 2 (order: 1) -> Match subject "urgent", move to important folder
Filter 3 (order: 2) -> Match date last 7 days, mark as read
```

## Multi-Tenant Safety

All endpoints enforce multi-tenant isolation:
- Filters belong to specific accounts (FK constraint)
- Accounts belong to specific tenants
- All queries filter by `tenant_id` and `user_id`
- Row-level access control enforced

**Auth Headers Required**:
```
X-Tenant-ID: <tenant-uuid>
X-User-ID: <user-uuid>
```

## Validation Rules

### Filter Creation
- `name`: Required, non-empty string
- `criteria`: Required, at least one criterion must be specified
- `actions`: Required, at least one action must be specified
- `order`: Optional, must be non-negative integer
- Criteria keys: from, to, subject, contains, date_range
- Action keys: move_to_folder, mark_read, apply_labels, delete

### Label Creation
- `name`: Required, non-empty string, unique per account
- `color`: Optional, hex color format (#RRGGBB)
- `order`: Optional, non-negative integer
- Default color: #4285F4 (Google Blue)

## Error Responses

### 400 Bad Request
```json
{
    "error": "Bad request",
    "message": "Missing required fields: criteria, actions"
}
```

### 401 Unauthorized
```json
{
    "error": "Unauthorized",
    "message": "X-Tenant-ID or X-User-ID header missing"
}
```

### 404 Not Found
```json
{
    "error": "Not found",
    "message": "Filter not found"
}
```

### 500 Internal Server Error
```json
{
    "error": "Internal server error",
    "message": "Database connection failed"
}
```

## Usage Examples

### Create a Work Email Filter
```bash
curl -X POST http://localhost:5000/api/v1/accounts/acc-123/filters \
  -H "X-Tenant-ID: tenant-123" \
  -H "X-User-ID: user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Work Emails",
    "criteria": {"from": "@company.com"},
    "actions": {"move_to_folder": "work-folder-id"},
    "order": 0
  }'
```

### Create Important Label
```bash
curl -X POST http://localhost:5000/api/v1/accounts/acc-123/labels \
  -H "X-Tenant-ID: tenant-123" \
  -H "X-User-ID: user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Important",
    "color": "#FF0000"
  }'
```

### Execute Filter on Existing Messages
```bash
curl -X POST http://localhost:5000/api/v1/accounts/acc-123/filters/filter-123/execute \
  -H "X-Tenant-ID: tenant-123" \
  -H "X-User-ID: user-123" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false}'
```

### Update Filter Order
```bash
curl -X PUT http://localhost:5000/api/v1/accounts/acc-123/filters/filter-123 \
  -H "X-Tenant-ID: tenant-123" \
  -H "X-User-ID: user-123" \
  -H "Content-Type: application/json" \
  -d '{"order": 1}'
```

## Testing

Comprehensive test suite in `tests/test_filters_api.py`:

### Test Coverage
- Filter CRUD operations (create, list, get, update, delete)
- Label CRUD operations (create, list, get, update, delete)
- Filter execution (dry-run and actual)
- Validation and error handling
- Multi-tenant safety
- Input validation (criteria, actions, color format, etc.)
- Duplicate name handling
- Execution order verification

### Running Tests
```bash
# Run all filter tests
pytest tests/test_filters_api.py -v

# Run specific test class
pytest tests/test_filters_api.py::TestCreateFilter -v

# Run specific test
pytest tests/test_filters_api.py::TestCreateFilter::test_create_filter_success -v

# Run with coverage
pytest tests/test_filters_api.py --cov=src.routes.filters
```

## Integration Points

### With Email Sync
- Apply filters automatically on incoming messages
- Support retroactive filtering via execute endpoint
- Respect filter execution order

### With Email Compose
- Pre-apply labels based on recipient criteria
- Suggest relevant filters for draft messages

### With Email Messages
- Display applied labels on message cards
- Show filter stats (matched/applied counts)

### With Folders
- Move emails between folders via filter actions
- Validate folder existence before applying moves

## Performance Considerations

### Indexing
- `(account_id, tenant_id)` index for account lookups
- `(is_enabled)` index for enabled filter queries
- `(order)` index for execution order

### Query Optimization
- Batch processing for retroactive filtering (10,000 message limit)
- Lazy loading for relationships
- Filter caching for new message processing

### Scaling
- Support thousands of filters per account
- Support millions of labels across system
- Dry-run mode for testing without I/O

## Future Enhancements

1. **Advanced Criteria**
   - Regex pattern matching
   - Attachment presence/type
   - Size range matching
   - Header matching

2. **Complex Actions**
   - Forward to another address
   - Generate auto-reply
   - Webhook notifications
   - Spam score thresholds

3. **Performance**
   - Async filter execution via Celery
   - Filter compilation to native code
   - Machine learning-based suggestions

4. **UX**
   - Visual filter builder
   - Filter suggestions based on user behavior
   - Conflict detection
   - Filter analytics/stats

## Files

- **Models**: `/src/models.py` (EmailFilter, EmailLabel, EmailFilterLabel classes)
- **Routes**: `/src/routes/filters.py` (API endpoints)
- **Tests**: `/tests/test_filters_api.py` (comprehensive test suite)

## Code Statistics

- **Models**: 3 new database models
- **Routes**: 1 blueprint with 11 endpoints
- **Tests**: 40+ test cases covering all scenarios
- **Lines of Code**: ~1,200 (implementation + tests)

## Security Considerations

- Multi-tenant row-level filtering on all queries
- Input validation on all parameters
- SQL injection protection via SQLAlchemy ORM
- XSS protection in label names/descriptions
- Authorization checks before any action
- Soft delete support for compliance

## Monitoring

### Key Metrics
- Filter execution count per account
- Label usage statistics
- Filter error rates
- Criteria match rates
- Average execution time

### Logging
- Filter creation/update/deletion
- Execution statistics
- Error tracking
- Performance metrics

## Support

For issues, enhancements, or questions:
1. Check existing test cases for usage examples
2. Review validation rules in route handlers
3. Verify multi-tenant headers are set correctly
4. Check database connectivity and permissions
