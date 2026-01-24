# Phase 7: Notification Service Integration

**Status**: Implementation Complete
**Version**: 1.0.0
**Last Updated**: January 24, 2026

## Overview

Phase 7 implements a comprehensive real-time notification system with WebSocket support, notification preferences, digests, and push notifications. All notification operations follow multi-tenant safety patterns with tenant/user/account filtering.

## Architecture

### Components

```
services/email_service/
├── src/
│   ├── models/
│   │   └── notification.py          # Notification entities (models, preferences, digests)
│   ├── handlers/
│   │   ├── websocket.py             # WebSocket connection & manager
│   │   └── notification_events.py    # Event emitter & notification creation
│   ├── routes/
│   │   └── notifications.py          # REST API endpoints
│   └── integrations/
│       └── socketio.py               # Flask-SocketIO integration
├── tests/
│   └── test_notifications.py         # Comprehensive test suite
└── docs/
    └── PHASE_7_NOTIFICATIONS.md      # This file
```

### Models

#### Notification
- **Purpose**: Represents a single notification event
- **Multi-tenant**: Indexed on `tenant_id`, `user_id`, `account_id`
- **Features**:
  - Event types: NEW_MESSAGE, SYNC_COMPLETE, SYNC_FAILED, ERROR_OCCURRED, MESSAGE_SENT, ATTACHMENT_DOWNLOADED, QUOTA_WARNING
  - Read/unread tracking
  - 30-day auto-archival
  - Delivery status per channel (push, email, in-app)
  - Automatic expiration (30 days)

```python
notification = Notification.create(
    user_id="user123",
    account_id="account123",
    tenant_id="tenant123",
    notification_type="new_message",
    title="New email from John",
    message="Subject: Meeting Tomorrow",
    sender_email="john@example.com",
    sender_name="John Doe",
)

# Mark as read
notification.mark_as_read()

# Archive
notification.archive()
```

#### NotificationPreference
- **Purpose**: User notification settings
- **Multi-tenant**: Indexed on `tenant_id`, `user_id`, `account_id`
- **Features**:
  - Per-event-type toggles
  - Digest settings (frequency, time, timezone)
  - Delivery channels (in-app, email, push, webhook)
  - Silenced senders/folders
  - Quiet hours (no notifications during night)
  - Push notification subscriptions

```python
pref = NotificationPreference.get_or_create(user_id, account_id, tenant_id)

# Update settings
pref.notify_new_message = True
pref.digest_frequency = "daily"
pref.digest_time = "09:00"
pref.quiet_hours_enabled = True
pref.quiet_hours_start = "22:00"
pref.quiet_hours_end = "08:00"
db.session.commit()

# Add silenced sender
pref.silenced_senders.append("spam@example.com")
db.session.commit()
```

#### NotificationDigest
- **Purpose**: Email digest summaries
- **Features**:
  - Daily, weekly, monthly frequencies
  - Tracks included notifications
  - Delivery status tracking
  - Period start/end timestamps

```python
digest = NotificationDigest(
    user_id="user123",
    account_id="account123",
    tenant_id="tenant123",
    frequency="daily",
    period_start=start_time,
    period_end=end_time,
    notification_ids=["notif1", "notif2"],
    notification_count=2,
)
db.session.add(digest)
db.session.commit()
```

## REST API

### Base URL
```
POST /api/notifications
GET  /api/notifications?page=1&limit=50
GET  /api/notifications/:id
POST /api/notifications/:id/read
POST /api/notifications/:id/unread
POST /api/notifications/:id/archive
POST /api/notifications/bulk-read
DELETE /api/notifications/cleanup-old

GET  /api/notifications/preferences
PUT  /api/notifications/preferences
POST /api/notifications/preferences/silence
POST /api/notifications/preferences/unsilence

GET  /api/notifications/digests
POST /api/notifications/digests/send

GET  /api/notifications/stats
```

### Headers (Required)
```
X-Tenant-ID: tenant123
X-User-ID: user456
X-Account-ID: account789
```

### Endpoints

#### List Notifications
```bash
GET /api/notifications?page=1&limit=50&unread_only=false&archived=false

Headers:
  X-Tenant-ID: tenant123
  X-User-ID: user456
  X-Account-ID: account789

Response (200):
{
  "data": [
    {
      "id": "notif123",
      "userId": "user456",
      "type": "new_message",
      "title": "New message from John",
      "message": "Subject: Meeting Tomorrow",
      "senderEmail": "john@example.com",
      "senderName": "John Doe",
      "isRead": false,
      "isArchived": false,
      "createdAt": 1705008000000,
      "expiresAt": 1707686400000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3,
    "hasMore": true
  },
  "unreadCount": 5
}
```

#### Get Notification
```bash
GET /api/notifications/notif123

Response (200):
{
  "data": {
    "id": "notif123",
    "userId": "user456",
    "type": "new_message",
    "title": "New message from John",
    "message": "Subject: Meeting Tomorrow",
    "senderEmail": "john@example.com",
    "senderName": "John Doe",
    "isRead": false,
    "isArchived": false,
    "createdAt": 1705008000000
  }
}
```

#### Mark as Read
```bash
POST /api/notifications/notif123/read

Response (200):
{
  "data": {
    "id": "notif123",
    "isRead": true,
    "readAt": 1705008120000
  }
}
```

#### Mark as Unread
```bash
POST /api/notifications/notif123/unread

Response (200):
{
  "data": {
    "id": "notif123",
    "isRead": false,
    "readAt": null
  }
}
```

#### Archive Notification
```bash
POST /api/notifications/notif123/archive

Response (200):
{
  "data": {
    "id": "notif123",
    "isArchived": true,
    "archivedAt": 1705008180000
  }
}
```

#### Bulk Mark Read
```bash
POST /api/notifications/bulk-read
Content-Type: application/json

{
  "notificationIds": ["notif1", "notif2", "notif3"]
}

Response (200):
{
  "data": {
    "updated": 3,
    "total": 3
  }
}
```

#### Cleanup Old Notifications
```bash
DELETE /api/notifications/cleanup-old

Response (200):
{
  "data": {
    "archived": 2,
    "deleted": 45
  }
}
```

#### Get Preferences
```bash
GET /api/notifications/preferences

Response (200):
{
  "data": {
    "id": "pref123",
    "userId": "user456",
    "notifyNewMessage": true,
    "notifySyncComplete": false,
    "notifySyncFailed": true,
    "notifyError": true,
    "digestFrequency": "daily",
    "digestTime": "09:00",
    "digestTimezone": "America/New_York",
    "channels": ["in_app", "push"],
    "silencedSenders": ["spam@example.com"],
    "silencedFolders": ["[Gmail]/Promotions"],
    "pushEnabled": true,
    "quietHoursEnabled": true,
    "quietHoursStart": "22:00",
    "quietHoursEnd": "08:00"
  }
}
```

#### Update Preferences
```bash
PUT /api/notifications/preferences
Content-Type: application/json

{
  "notifyNewMessage": true,
  "notifySyncComplete": false,
  "digestFrequency": "weekly",
  "digestTime": "09:00",
  "digestTimezone": "America/Los_Angeles",
  "channels": ["in_app", "email", "push"],
  "quietHoursEnabled": true,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00"
}

Response (200):
{
  "data": {
    "id": "pref123",
    "digestFrequency": "weekly",
    "channels": ["in_app", "email", "push"],
    ...
  }
}
```

#### Add Silenced Sender
```bash
POST /api/notifications/preferences/silence
Content-Type: application/json

{
  "type": "sender",
  "value": "spam@example.com"
}

Response (200):
{
  "data": {
    "silencedSenders": ["spam@example.com"]
  }
}
```

#### Remove Silenced Sender
```bash
POST /api/notifications/preferences/unsilence
Content-Type: application/json

{
  "type": "sender",
  "value": "spam@example.com"
}

Response (200):
{
  "data": {
    "silencedSenders": []
  }
}
```

#### List Digests
```bash
GET /api/notifications/digests?page=1&limit=20

Response (200):
{
  "data": [
    {
      "id": "digest123",
      "userId": "user456",
      "frequency": "daily",
      "periodStart": 1704921600000,
      "periodEnd": 1705008000000,
      "notificationCount": 12,
      "emailSent": true,
      "emailSentAt": 1705008120000,
      "createdAt": 1705008120000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 30,
    "pages": 2,
    "hasMore": true
  }
}
```

#### Send Digest
```bash
POST /api/notifications/digests/send
Content-Type: application/json

{
  "frequency": "daily"
}

Response (200):
{
  "data": {
    "sent": true,
    "digest": {
      "id": "digest123",
      "frequency": "daily",
      "notificationCount": 12
    },
    "notificationCount": 12
  }
}
```

#### Get Statistics
```bash
GET /api/notifications/stats

Response (200):
{
  "data": {
    "total": 150,
    "unread": 5,
    "archived": 45,
    "byType": {
      "new_message": 100,
      "sync_complete": 30,
      "error_occurred": 20
    }
  }
}
```

## WebSocket API

### Connection

```javascript
// Client-side
const socket = io('http://localhost:5000', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected');

  // Authenticate
  socket.emit('authenticate', {
    userId: 'user456',
    accountId: 'account789',
    tenantId: 'tenant123',
    token: 'jwt_token'  // Optional
  });
});

socket.on('authenticated', (data) => {
  console.log('Authenticated:', data);

  // Subscribe to user notifications
  socket.emit('subscribe', { room: 'user:user456:notifications' });

  // Subscribe to sync events
  socket.emit('subscribe', { room: 'user:user456:sync' });
});

socket.on('error', (error) => {
  console.error('Error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

### Events Emitted from Server

#### new_message
```javascript
socket.on('notification:new_message', (data) => {
  console.log('New message:', {
    notificationId: 'notif123',
    sender: 'John Doe',
    subject: 'Meeting Tomorrow',
    folder: 'Inbox',
    messageId: 'msg123'
  });
});
```

#### sync_complete
```javascript
socket.on('notification:sync_complete', (data) => {
  console.log('Sync completed:', {
    notificationId: 'notif456',
    folder: 'Inbox',
    messagesSynced: 100,
    newMessages: 5
  });
});
```

#### sync_failed
```javascript
socket.on('notification:sync_failed', (data) => {
  console.log('Sync failed:', {
    notificationId: 'notif789',
    folder: 'Inbox',
    error: 'Connection timeout'
  });
});
```

#### error_occurred
```javascript
socket.on('notification:error', (data) => {
  console.log('Error:', {
    notificationId: 'notif999',
    errorType: 'auth_failed',
    errorMessage: 'Invalid credentials'
  });
});
```

#### notification_read
```javascript
socket.on('notification:marked_read', (data) => {
  console.log('Notification read:', {
    notificationId: 'notif123'
  });
});
```

#### notification_archived
```javascript
socket.on('notification:archived', (data) => {
  console.log('Notification archived:', {
    notificationId: 'notif123'
  });
});
```

### Events Sent to Server

#### mark_as_read
```javascript
socket.emit('notification:read', {
  notificationId: 'notif123'
});
```

#### archive
```javascript
socket.emit('notification:archive', {
  notificationId: 'notif123'
});
```

#### subscribe
```javascript
socket.emit('subscribe', {
  room: 'user:user456:notifications'
});
```

#### unsubscribe
```javascript
socket.emit('unsubscribe', {
  room: 'user:user456:notifications'
});
```

#### ping
```javascript
socket.emit('ping', {
  timestamp: Date.now()
});
```

## Event Emitter API

### NotificationEventEmitter

Programmatic interface for emitting notifications from various email service events.

#### emit_new_message

```python
from src.handlers.notification_events import NotificationEventEmitter

NotificationEventEmitter.emit_new_message(
    user_id="user456",
    account_id="account789",
    tenant_id="tenant123",
    sender_email="john@example.com",
    sender_name="John Doe",
    subject="Meeting Tomorrow",
    folder="Inbox",
    message_id="msg123",
    preview="Let's discuss the project..."
)
```

**Features**:
- Checks user preferences before emitting
- Silences notifications if sender is in silenced list
- Sends WebSocket event to connected clients
- Queues message if user offline
- Sends push notification if enabled

#### emit_sync_complete

```python
NotificationEventEmitter.emit_sync_complete(
    user_id="user456",
    account_id="account789",
    tenant_id="tenant123",
    folder="Inbox",
    messages_synced=100,
    new_messages=5
)
```

#### emit_sync_failed

```python
NotificationEventEmitter.emit_sync_failed(
    user_id="user456",
    account_id="account789",
    tenant_id="tenant123",
    folder="Inbox",
    error_message="Connection timeout"
)
```

#### emit_error

```python
NotificationEventEmitter.emit_error(
    user_id="user456",
    account_id="account789",
    tenant_id="tenant123",
    error_type="auth_failed",
    error_message="Invalid credentials"
)
```

#### emit_message_sent

```python
NotificationEventEmitter.emit_message_sent(
    user_id="user456",
    account_id="account789",
    tenant_id="tenant123",
    recipient_email="jane@example.com",
    subject="Project Update"
)
```

#### emit_quota_warning

```python
NotificationEventEmitter.emit_quota_warning(
    user_id="user456",
    account_id="account789",
    tenant_id="tenant123",
    quota_used_percent=85.5
)
```

## Integration Examples

### Emit notification when new message arrives

In `src/routes/sync.py` or sync handler:

```python
from src.handlers.notification_events import NotificationEventEmitter

# When fetching new messages from IMAP
message = fetch_message_from_imap()

NotificationEventEmitter.emit_new_message(
    user_id=user_id,
    account_id=account_id,
    tenant_id=tenant_id,
    sender_email=message.from_email,
    sender_name=message.from_name,
    subject=message.subject,
    folder=folder_name,
    message_id=message.id,
    preview=message.preview
)
```

### Emit notification on sync completion

```python
try:
    sync_folder(folder)
    NotificationEventEmitter.emit_sync_complete(
        user_id=user_id,
        account_id=account_id,
        tenant_id=tenant_id,
        folder=folder.name,
        messages_synced=count,
        new_messages=new_count
    )
except Exception as e:
    NotificationEventEmitter.emit_sync_failed(
        user_id=user_id,
        account_id=account_id,
        tenant_id=tenant_id,
        folder=folder.name,
        error_message=str(e)
    )
```

### Emit notification on auth error

```python
from src.handlers.notification_events import NotificationEventEmitter

try:
    authenticate_account()
except AuthenticationError as e:
    NotificationEventEmitter.emit_error(
        user_id=user_id,
        account_id=account_id,
        tenant_id=tenant_id,
        error_type="auth_failed",
        error_message=str(e)
    )
```

## Multi-Tenant Safety

All endpoints and queries follow multi-tenant safety patterns:

```python
# ✅ CORRECT - Filter by tenant_id and user_id
notifications = Notification.query.filter_by(
    user_id=user_id,
    tenant_id=tenant_id
).all()

# ❌ WRONG - No tenant filtering
notifications = Notification.query.filter_by(user_id=user_id).all()

# All API endpoints require headers
# X-Tenant-ID: tenant123
# X-User-ID: user456
# X-Account-ID: account789
```

## Notification Lifecycle

### Creation
1. Event occurs (new message, sync complete, error)
2. NotificationEventEmitter creates Notification record
3. Set expiration to 30 days from now

### Delivery
1. Check user preferences (enabled?)
2. Check silenced list (sender/folder?)
3. Emit WebSocket event to connected clients
4. Queue for offline users
5. Send push notification if enabled and in-app only

### Read/Unread
1. User receives notification
2. Mark as read via API or WebSocket
3. Update read_at timestamp
4. Emit real-time update to all connections

### Archival
1. User archives notification manually
2. Or auto-archive after 30 days
3. Keep in database (soft delete)

### Cleanup
1. After 30 days, archive unread notifications
2. Delete archived notifications older than 30 days
3. Run daily cleanup job

## Configuration

### Environment Variables
```bash
# Notification service
NOTIFICATION_RETENTION_DAYS=30      # Keep notifications for 30 days
NOTIFICATION_DIGEST_ENABLED=true    # Enable email digests
PUSH_NOTIFICATIONS_ENABLED=true     # Enable push notifications
SOCKETIO_PING_TIMEOUT=60            # WebSocket ping timeout
SOCKETIO_PING_INTERVAL=25           # WebSocket ping interval
```

### SQLAlchemy Models

All models use:
- UUID primary keys (generated automatically)
- Timestamp fields in milliseconds since epoch
- Multi-tenant indexes (tenant_id, user_id, account_id)
- Cascade delete on foreign keys
- Unique constraints where appropriate

## Testing

Run comprehensive test suite:

```bash
pytest tests/test_notifications.py -v

# Test specific class
pytest tests/test_notifications.py::TestNotificationModel -v

# Test with coverage
pytest tests/test_notifications.py --cov=src.models.notification --cov=src.handlers.notification_events
```

### Test Coverage
- Notification CRUD operations
- Read/unread tracking
- Archival and expiration
- Notification preferences
- Silenced senders/folders
- WebSocket connections and subscriptions
- Event emission
- Digest generation

## Performance Considerations

### Indexes
- `idx_notification_user`: Fast user notification queries
- `idx_notification_tenant`: Multi-tenant filtering
- `idx_notification_unread`: Quick unread count
- `idx_notification_created`: Timestamp sorting
- `idx_notification_archived`: Archive queries

### Pagination
- Default limit: 50 items per page
- Maximum limit: 100 items per page
- Always use pagination for user queries

### WebSocket Optimization
- Connection pooling per user
- Message queue for offline users
- Room-based subscriptions
- Automatic reconnection

## Future Enhancements

1. **Email Digest Templates**
   - HTML email formatting
   - Preview rendering
   - Unsubscribe links

2. **Advanced Filtering**
   - Label-based filtering
   - Custom notification rules
   - Smart categorization

3. **Mobile Push Notifications**
   - FCM integration
   - APNs support
   - Deep linking

4. **Notification Analytics**
   - Delivery rates
   - Open rates
   - User engagement

5. **Smart Notifications**
   - Machine learning priority
   - Importance detection
   - Auto-grouping

## Troubleshooting

### WebSocket Connection Issues
- Check CORS configuration
- Verify transports are enabled
- Check ping/pong intervals
- Monitor connection pool

### Notification Not Delivered
- Check user preferences
- Verify tenant/user/account IDs
- Check silenced lists
- Review delivery status in database

### Performance Issues
- Monitor WebSocket connections
- Check database indexes
- Review query performance
- Implement connection pooling

## References

- [WebSocket Protocol (RFC 6455)](https://tools.ietf.org/html/rfc6455)
- [Web Push Protocol (RFC 8030)](https://tools.ietf.org/html/rfc8030)
- [Flask-SocketIO Documentation](https://flask-socketio.readthedocs.io/)
- [SQLAlchemy ORM Guide](https://docs.sqlalchemy.org/en/20/orm/)
