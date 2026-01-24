# Messages API Quick Reference

## Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounts/:id/messages` | List messages with pagination & filtering |
| GET | `/api/accounts/:id/messages/:msgId` | Get full message details |
| POST | `/api/accounts/:id/messages` | Send new message |
| PUT | `/api/accounts/:id/messages/:msgId` | Update message flags |
| DELETE | `/api/accounts/:id/messages/:msgId` | Delete message (soft or hard) |
| GET | `/api/accounts/:id/messages/search` | Full-text search |
| PUT | `/api/accounts/:id/messages/batch/flags` | Update multiple messages |
| GET | `/api/accounts/:id/messages/:msgId/attachments/:attId/download` | Download attachment |

## Authentication

All endpoints require:
```
X-Tenant-ID: {tenant_id}
X-User-ID: {user_id}
```

Or query parameters:
```
?tenant_id={tenant_id}&user_id={user_id}
```

## Common Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 202 | Accepted (async operation) |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing auth) |
| 403 | Forbidden (access denied) |
| 404 | Not found |
| 500 | Server error |

## Pagination

All list endpoints support:
- `page` - Page number (default 1)
- `limit` - Items per page (default 20, max 100)

Response includes:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Filters (List Endpoint)

- `folder=Inbox` - Filter by folder
- `isRead=true` - Filter by read status
- `isStarred=true` - Filter by starred
- `hasAttachments=true` - Filter by attachments
- `dateFrom=1706033200000` - Date range start
- `dateTo=1706033200000` - Date range end
- `from=sender@example.com` - Filter by sender
- `to=recipient@example.com` - Filter by recipient

## Sorting (List Endpoint)

- `sortBy=receivedAt` - Sort field (receivedAt, subject, from, size)
- `sortOrder=desc` - Sort order (asc, desc)

**Example**: Get latest emails first
```
GET /api/accounts/acc-1/messages?sortBy=receivedAt&sortOrder=desc
```

## Search Query (Search Endpoint)

**Required parameter**: `q=search_term`

**Optional**:
- `searchIn=all` - Search scope (all, subject, body, from, to)
- `folder=Inbox` - Limit to folder
- `dateFrom=1706033200000` - Search within date range
- `page=1` - Pagination

**Example**: Search for "Python" in subject
```
GET /api/accounts/acc-1/messages/search?q=python&searchIn=subject
```

## Message Flags

Update with PUT request:
```json
{
  "isRead": true,
  "isStarred": true,
  "isSpam": false,
  "isArchived": false,
  "folder": "Archive"
}
```

**Available flags**:
- `isRead` - Message has been read
- `isStarred` - User starred the message
- `isSpam` - Mark as spam
- `isArchived` - Move to archive
- `folder` - Move to specific folder

## Sending Messages

**Required fields**:
```json
{
  "to": ["recipient@example.com"],
  "subject": "Email subject"
}
```

**Optional fields**:
```json
{
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"],
  "textBody": "Plain text",
  "htmlBody": "<html>HTML</html>",
  "attachments": [
    {
      "filename": "doc.pdf",
      "contentType": "application/pdf",
      "data": "base64...",
      "size": 1024
    }
  ],
  "inReplyTo": "message-uuid",
  "sendAt": 1706033200000
}
```

## Delete Message

**Soft delete** (default, recoverable):
```
DELETE /api/accounts/acc-1/messages/msg-uuid
```

**Hard delete** (permanent):
```
DELETE /api/accounts/acc-1/messages/msg-uuid?permanent=true
```

## Batch Operations

Update multiple messages at once:
```
PUT /api/accounts/acc-1/messages/batch/flags
{
  "messageIds": ["msg-1", "msg-2", "msg-3"],
  "isRead": true,
  "folder": "Archive"
}
```

**Response**:
```json
{
  "updatedCount": 3,
  "failedCount": 0,
  "message": "Updated 3 messages successfully",
  "failed": []
}
```

## Error Response Format

```json
{
  "error": "Error category",
  "message": "Human-readable error message"
}
```

**Common errors**:
- `Unauthorized` - Missing auth headers
- `Forbidden` - Access denied (wrong tenant)
- `Not found` - Message doesn't exist
- `Invalid request` - Validation failed
- `Failed to...` - Server error

## Code Examples

### List Inbox (JavaScript)
```javascript
const response = await fetch(
  '/api/accounts/acc-1/messages?folder=Inbox&page=1&limit=20',
  {
    headers: {
      'X-Tenant-ID': 'tenant-1',
      'X-User-ID': 'user-1'
    }
  }
)
const data = await response.json()
```

### Send Email (JavaScript)
```javascript
const response = await fetch(
  '/api/accounts/acc-1/messages',
  {
    method: 'POST',
    headers: {
      'X-Tenant-ID': 'tenant-1',
      'X-User-ID': 'user-1',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: ['recipient@example.com'],
      subject: 'Hello',
      textBody: 'Test message'
    })
  }
)
const result = await response.json()
```

### Mark as Read (Python)
```python
import requests

response = requests.put(
    'http://localhost:5000/api/accounts/acc-1/messages/msg-uuid',
    headers={
        'X-Tenant-ID': 'tenant-1',
        'X-User-ID': 'user-1'
    },
    json={'isRead': True}
)
print(response.json())
```

### Search Messages (cURL)
```bash
curl -X GET \
  'http://localhost:5000/api/accounts/acc-1/messages/search?q=python' \
  -H 'X-Tenant-ID: tenant-1' \
  -H 'X-User-ID: user-1'
```

## Pagination Examples

**Get first page (default)**:
```
GET /api/accounts/acc-1/messages
```

**Get specific page with custom size**:
```
GET /api/accounts/acc-1/messages?page=2&limit=50
```

**Get last page**:
```
GET /api/accounts/acc-1/messages?page=10&limit=20
```

## Filtering Examples

**Unread messages in Inbox**:
```
GET /api/accounts/acc-1/messages?folder=Inbox&isRead=false
```

**Starred emails from last month**:
```
GET /api/accounts/acc-1/messages?isStarred=true&dateFrom={month_ago}&dateTo={today}
```

**Messages with attachments from alice**:
```
GET /api/accounts/acc-1/messages?hasAttachments=true&from=alice
```

**Sort by sender name ascending**:
```
GET /api/accounts/acc-1/messages?sortBy=from&sortOrder=asc
```

## Search Examples

**Find emails about "project"**:
```
GET /api/accounts/acc-1/messages/search?q=project
```

**Search subject only**:
```
GET /api/accounts/acc-1/messages/search?q=budget&searchIn=subject
```

**Search in specific folder**:
```
GET /api/accounts/acc-1/messages/search?q=invoice&folder=Important
```

**Search within date range**:
```
GET /api/accounts/acc-1/messages/search?q=meeting&dateFrom=1706033200000&dateTo=1706119600000
```

## Batch Operation Examples

**Mark multiple as read**:
```json
PUT /api/accounts/acc-1/messages/batch/flags
{
  "messageIds": ["msg-1", "msg-2", "msg-3"],
  "isRead": true
}
```

**Move multiple to archive**:
```json
PUT /api/accounts/acc-1/messages/batch/flags
{
  "messageIds": ["msg-1", "msg-2", "msg-3"],
  "folder": "Archive"
}
```

**Star multiple messages**:
```json
PUT /api/accounts/acc-1/messages/batch/flags
{
  "messageIds": ["msg-1", "msg-2", "msg-3"],
  "isStarred": true
}
```

## Rate Limits (Recommended - Not Yet Implemented)

- List: 100 requests/minute
- Search: 50 requests/minute
- Send: 20 requests/minute
- Update: 50 requests/minute
- Batch: 20 requests/minute

## Performance Tips

1. **Pagination**: Always use pagination for large result sets
2. **Search**: Use `searchIn` to limit search scope
3. **Filters**: Filter on server (folder, date, flags) before loading messages
4. **Batch operations**: Use batch flags instead of individual updates
5. **Caching**: Client-side caching for frequently accessed messages

## Testing

Run tests:
```bash
pytest tests/test_messages.py -v
```

Run with coverage:
```bash
pytest tests/test_messages.py --cov=src.routes.messages
```

Test specific endpoint:
```bash
pytest tests/test_messages.py::TestListMessages -v
```

## Integration Checklist

- [ ] Register messages_bp in app.py (already done)
- [ ] Implement Celery task for send_email
- [ ] Implement SMTP integration
- [ ] Implement DBAL integration (replace in-memory storage)
- [ ] Add attachment download/upload
- [ ] Add rate limiting
- [ ] Add request validation schemas
- [ ] Add logging
- [ ] Set up monitoring/alerting
- [ ] Implement full-text search index (PostgreSQL or Elasticsearch)

## Troubleshooting

**401 Unauthorized**
- Check X-Tenant-ID and X-User-ID headers are present
- Verify header names are exactly correct (case-sensitive)

**403 Forbidden**
- Verify account_id belongs to your tenant
- Check userId matches authenticated user

**404 Not Found**
- Verify message/account IDs are correct
- Message may have been deleted permanently

**400 Bad Request**
- Check required fields are provided
- Verify JSON is valid
- Check filter values are valid (e.g., isRead=true not isRead=True)

**500 Server Error**
- Check server logs
- Verify database is running
- Try again (may be temporary)
