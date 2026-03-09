# Phase 7 User Preferences API

## Overview

Complete user preferences/settings management system for email client. Enables users to customize:
- Theme (light/dark mode, accent colors, density)
- Localization (timezone, locale, date/time formats)
- Sync frequency and background sync options
- Notification preferences (new mail alerts, quiet hours)
- Privacy settings (read receipts, signature, vacation mode)
- Default folders and auto-filing rules
- Signature and template management
- Storage quota and auto-cleanup policies
- Accessibility options (screen reader, high contrast)
- Advanced features (AI, threading, telemetry)

## Architecture

### Database Model

**Table**: `user_preferences`

```python
UserPreferences(
    id: str                         # UUID primary key
    tenant_id: str                  # Multi-tenant isolation
    user_id: str                    # User identification

    # Theme & UI
    theme: str                      # 'light', 'dark', 'auto'
    accent_color: str               # Hex color #RRGGBB
    compact_mode: bool
    show_preview_pane: bool
    message_density: str            # 'compact', 'normal', 'spacious'
    high_contrast_mode: bool
    font_size_percent: int          # 80-150
    reduce_animations: bool

    # Localization
    timezone: str                   # IANA timezone (e.g., America/New_York)
    locale: str                     # BCP 47 locale (e.g., en_US)
    date_format: str                # e.g., MMM d, yyyy
    time_format: str                # e.g., h:mm a
    use_12hr_clock: bool

    # Sync Settings
    sync_enabled: bool
    sync_frequency_minutes: int     # 1-1440
    background_sync: bool
    offline_mode_enabled: bool
    sync_scope: str                 # 'all', 'last_30', 'last_90', 'last_180'
    sync_days_back: int             # 1-365

    # Notifications
    notifications_enabled: bool
    notify_new_mail: bool
    notify_on_error: bool
    notify_sound: bool
    notify_desktop_alerts: bool
    smart_notifications: bool
    quiet_hours_enabled: bool
    quiet_hours_start: str          # HH:MM format
    quiet_hours_end: str            # HH:MM format
    notification_categories: dict   # {promotions, newsletters, social, important}

    # Privacy & Security
    read_receipts_enabled: bool
    send_read_receipts: bool
    mark_as_read_delay_ms: int
    pgp_enabled: bool
    pgp_key_id: str (nullable)
    s_mime_enabled: bool
    s_mime_cert_id: str (nullable)

    # Signature
    use_signature: bool
    signature_text: str (nullable)
    signature_html: str (nullable)
    signature_include_in_replies: bool
    signature_include_in_forwards: bool

    # Vacation Mode
    vacation_mode_enabled: bool
    vacation_message: str (nullable)
    vacation_start_date: BigInt (nullable)  # Unix milliseconds
    vacation_end_date: BigInt (nullable)    # Unix milliseconds
    vacation_notify_sender: bool

    # Folders & Templates
    default_inbox_folder_id: str (nullable)
    default_sent_folder_id: str (nullable)
    default_drafts_folder_id: str (nullable)
    default_trash_folder_id: str (nullable)
    auto_file_rules: list                   # [{sender, folder_id}, ...]
    signature_templates: dict               # {account_id: {name, text, html}}
    quick_reply_templates: list             # [{name, text}, ...]
    forwarding_rules: list                  # [{from, to}, ...]

    # Storage
    storage_quota_bytes: BigInt (nullable)
    storage_warning_percent: int            # 1-99
    auto_delete_spam_days: int (nullable)
    auto_delete_trash_days: int (nullable)
    compress_attachments: bool

    # Accessibility
    screen_reader_enabled: bool

    # Advanced
    enable_ai_features: bool
    enable_threaded_view: bool
    enable_conversation_mode: bool
    conversation_threading_strategy: str    # 'auto', 'refs', 'subjects'
    debug_mode: bool
    enable_telemetry: bool
    custom_settings: dict                   # Extensible key-value pairs

    # Metadata
    is_deleted: bool
    version: int                            # Optimistic locking
    created_at: BigInt                      # Unix milliseconds
    updated_at: BigInt                      # Unix milliseconds
)
```

### API Endpoints

#### 1. Get User Preferences

```
GET /api/v1/users/:id/preferences
```

**Authentication**: Required
- `X-Tenant-ID` header
- `X-User-ID` header (must match :id)

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "id": "pref-uuid-123",
    "tenantId": "tenant-uuid",
    "userId": "user-uuid",
    "version": 1,
    "theme": {
      "mode": "light",
      "accentColor": "#1976d2",
      "compactMode": false,
      "messageDensity": "normal",
      "showPreviewPane": true,
      "highContrastMode": false,
      "fontSizePercent": 100,
      "reduceAnimations": false
    },
    "localization": {
      "timezone": "UTC",
      "locale": "en_US",
      "dateFormat": "MMM d, yyyy",
      "timeFormat": "h:mm a",
      "use12hrClock": true
    },
    "sync": {
      "enabled": true,
      "frequencyMinutes": 5,
      "backgroundSyncEnabled": true,
      "offlineModeEnabled": false,
      "scope": "all",
      "daysBack": 30
    },
    "notifications": {
      "enabled": true,
      "newMail": true,
      "onError": true,
      "soundEnabled": true,
      "desktopAlertsEnabled": true,
      "smartNotifications": false,
      "quietHoursEnabled": false,
      "quietHoursStart": null,
      "quietHoursEnd": null,
      "categories": {
        "promotions": false,
        "newsletters": false,
        "social": true,
        "important": true
      }
    },
    "privacy": {
      "readReceiptsEnabled": false,
      "sendReadReceipts": false,
      "markAsReadDelayMs": 2000,
      "pgpEnabled": false,
      "pgpKeyId": null,
      "smimeEnabled": false,
      "smimeCertId": null,
      "vacationModeEnabled": false,
      "vacationMessage": null,
      "vacationStartDate": null,
      "vacationEndDate": null,
      "vacationNotifySender": true
    },
    "signature": {
      "enabled": false,
      "text": null,
      "html": null,
      "includeInReplies": true,
      "includeInForwards": false
    },
    "folders": {
      "defaultInboxFolderId": null,
      "defaultSentFolderId": null,
      "defaultDraftsFolderId": null,
      "defaultTrashFolderId": null,
      "autoFileRules": []
    },
    "templates": {
      "signatureTemplates": {},
      "quickReplyTemplates": [],
      "forwardingRules": []
    },
    "storage": {
      "quotaBytes": null,
      "warningPercent": 80,
      "autoDeleteSpamDays": null,
      "autoDeleteTrashDays": null,
      "compressAttachments": false
    },
    "accessibility": {
      "screenReaderEnabled": false
    },
    "advanced": {
      "enableAiFeatures": true,
      "enableThreadedView": true,
      "enableConversationMode": true,
      "conversationThreadingStrategy": "auto",
      "debugMode": false,
      "enableTelemetry": true,
      "customSettings": {}
    },
    "isDeleted": false,
    "createdAt": 1706049000000,
    "updatedAt": 1706049000000
  }
}
```

**Errors**:
- `401 Unauthorized`: Missing/invalid authentication headers
- `403 Forbidden`: Accessing another user's preferences
- `500 Internal Server Error`: Server error

**Behavior**:
- Creates preferences with defaults if they don't exist
- Returns existing preferences on subsequent calls
- Isolates by tenant_id (multi-tenant)

---

#### 2. Update User Preferences

```
PUT /api/v1/users/:id/preferences
```

**Authentication**: Required
- `X-Tenant-ID` header
- `X-User-ID` header (must match :id)
- `Content-Type: application/json`

**Request Body** (all fields optional, partial updates supported):

```json
{
  "version": 1,
  "theme": {
    "mode": "dark",
    "accentColor": "#2196f3",
    "compactMode": true,
    "messageDensity": "compact",
    "fontSizePercent": 110
  },
  "localization": {
    "timezone": "America/New_York",
    "locale": "fr_FR",
    "dateFormat": "d/MM/yyyy",
    "timeFormat": "HH:mm",
    "use12hrClock": false
  },
  "sync": {
    "enabled": false,
    "frequencyMinutes": 30,
    "backgroundSyncEnabled": false,
    "scope": "last_90",
    "daysBack": 90
  },
  "notifications": {
    "enabled": false,
    "newMail": false,
    "soundEnabled": false,
    "smartNotifications": true,
    "quietHoursEnabled": true,
    "quietHoursStart": "22:00",
    "quietHoursEnd": "07:00",
    "categories": {
      "promotions": true,
      "newsletters": false,
      "social": true,
      "important": true
    }
  },
  "privacy": {
    "readReceiptsEnabled": true,
    "sendReadReceipts": true,
    "vacationModeEnabled": true,
    "vacationMessage": "I'm out until Jan 25.",
    "vacationStartDate": 1706049000000,
    "vacationEndDate": 1706135400000
  },
  "signature": {
    "enabled": true,
    "text": "Best regards,\nJohn Doe",
    "html": "<p>Best regards,<br>John Doe</p>",
    "includeInReplies": true,
    "includeInForwards": false
  },
  "folders": {
    "defaultInboxFolderId": "folder-123",
    "autoFileRules": [
      {"sender": "noreply@company.com", "folder_id": "folder-456"}
    ]
  },
  "templates": {
    "quickReplyTemplates": [
      {"name": "thanks", "text": "Thanks!"},
      {"name": "meeting", "text": "Let's schedule a meeting."}
    ]
  },
  "storage": {
    "quotaBytes": 16000000000,
    "warningPercent": 75,
    "autoDeleteSpamDays": 30,
    "autoDeleteTrashDays": 7,
    "compressAttachments": true
  },
  "advanced": {
    "enableAiFeatures": false,
    "conversationThreadingStrategy": "refs",
    "enableTelemetry": false
  }
}
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "id": "pref-uuid-123",
    "version": 2,
    "theme": { ... },
    ...
  }
}
```

**Errors**:
- `400 Bad Request`: Invalid request payload or validation failed
- `401 Unauthorized`: Missing/invalid authentication headers
- `403 Forbidden`: Accessing another user's preferences
- `404 Not Found`: User not found
- `409 Conflict`: Version mismatch (optimistic locking)
- `500 Internal Server Error`: Server error

**Validation Rules**:

| Field | Rule | Example |
|-------|------|---------|
| `theme.mode` | 'light' \| 'dark' \| 'auto' | `"dark"` |
| `theme.accentColor` | Hex color format | `"#2196f3"` |
| `theme.messageDensity` | 'compact' \| 'normal' \| 'spacious' | `"compact"` |
| `theme.fontSizePercent` | Integer 80-150 | `110` |
| `localization.timezone` | IANA timezone string | `"America/New_York"` |
| `localization.locale` | BCP 47 locale | `"en_US"` |
| `sync.frequencyMinutes` | Integer 1-1440 | `15` |
| `sync.scope` | 'all' \| 'last_30' \| 'last_90' \| 'last_180' | `"last_90"` |
| `sync.daysBack` | Integer 1-365 | `90` |
| `notifications.quietHoursEnabled` | Boolean | `true` |
| `notifications.quietHoursStart` | HH:MM format string | `"22:00"` |
| `notifications.quietHoursEnd` | HH:MM format string | `"07:00"` |
| `signature.enabled` | If true, text or html required | `true` |
| `privacy.vacationModeEnabled` | If true, message + dates required | `true` |
| `privacy.vacationStartDate` | Unix milliseconds | `1706049000000` |
| `privacy.vacationEndDate` | Unix ms (must be > start) | `1706135400000` |
| `storage.warningPercent` | Integer 1-99 | `75` |
| `storage.autoDeleteSpamDays` | Positive integer or null | `30` |
| `advanced.conversationThreadingStrategy` | 'auto' \| 'refs' \| 'subjects' | `"refs"` |

**Features**:
- Partial updates supported (only send changed fields)
- Optimistic locking with version field
- Increments version automatically on save
- Soft delete support (is_deleted flag)

---

#### 3. Reset Preferences to Defaults

```
POST /api/v1/users/:id/preferences/reset
```

**Authentication**: Required
- `X-Tenant-ID` header
- `X-User-ID` header (must match :id)

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "id": "pref-uuid-new",
    "version": 1,
    "theme": {
      "mode": "light",
      ...
    },
    ...
  },
  "message": "Preferences reset to defaults"
}
```

**Behavior**:
- Soft-deletes existing preferences
- Creates new preferences with defaults
- New ID and version = 1

---

#### 4. Validate Preferences Payload

```
POST /api/v1/users/:id/preferences/validate
```

**Purpose**: Validate preferences update without saving

**Authentication**: Required
- `X-Tenant-ID` header
- `X-User-ID` header (must match :id)

**Request Body**: Same as PUT /preferences

**Response** (200 - valid):
```json
{
  "status": "success",
  "valid": true,
  "message": "Preferences payload is valid"
}
```

**Response** (200 - invalid):
```json
{
  "status": "success",
  "valid": false,
  "error": "theme.accentColor must be hex color (e.g., #1976d2)"
}
```

**Use Cases**:
- Client-side validation before submit
- Batch validation of multiple payloads
- Testing validation rules

---

## Multi-Tenant Isolation

All endpoints enforce multi-tenant isolation:

1. **Header-based tenant identification**: `X-Tenant-ID` required on all requests
2. **User scope limitation**: Users can only access/modify their own preferences
3. **Database isolation**: Unique constraint `(tenant_id, user_id, is_deleted)`
4. **Query filtering**: All DB queries filter by `tenant_id` and `user_id`

Example:
```python
# This will only return preferences for the authenticated user in their tenant
preferences = UserPreferences.get_by_user(user_id, tenant_id)
```

---

## Optimistic Locking

Prevents lost updates in concurrent scenarios:

1. Client retrieves preferences with `version: 1`
2. Client modifies and sends update with `version: 1`
3. Server checks: if actual version != 1, return 409 Conflict
4. Server increments version on successful update (1 → 2)
5. Client handles conflict and retries with new version

```python
if preferences.version != data['version']:
    return {
        'error': 'Conflict',
        'message': f'Version mismatch: expected {preferences.version}, got {data["version"]}'
    }, 409
```

---

## Soft Delete & Recovery

Preferences can be recovered after "deletion":

1. Reset endpoint marks old preferences as `is_deleted: true`
2. Queries filter out deleted preferences
3. Deleted preferences can be recovered by database admin if needed
4. No permanent data loss (complies with GDPR requirements)

---

## Authentication & Authorization

### Multi-Level Security

```
Request → Authentication Check → Authorization Check → Business Logic
                ↓                        ↓
        Check headers exist      Check user_id matches
        X-Tenant-ID              authenticated user_id
        X-User-ID
```

### Error Responses

| Status | Scenario | Example |
|--------|----------|---------|
| 401 | Missing `X-Tenant-ID` or `X-User-ID` | User not authenticated |
| 403 | `X-User-ID` != URL user_id | User accessing other's preferences |
| 404 | User/preferences not found | Unusual (should have defaults) |

---

## Database Indexes

Optimized for common queries:

```sql
CREATE INDEX idx_user_preferences_tenant ON user_preferences(tenant_id);
CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_tenant_user ON user_preferences(tenant_id, user_id);
CREATE UNIQUE INDEX uq_user_preferences_tenant_user
    ON user_preferences(tenant_id, user_id, is_deleted);
```

---

## Testing

### Test Coverage

**Files**: `tests/test_preferences.py`

**Test Classes**:
1. `TestGetPreferences` (9 tests)
   - Default creation
   - Retrieval of existing
   - Missing headers
   - Forbidden access
   - Multi-tenant isolation

2. `TestUpdatePreferences` (24 tests)
   - Theme, localization, sync, notifications
   - Signature, privacy, storage, templates
   - Advanced settings
   - Validation errors
   - Version conflicts
   - Partial updates

3. `TestResetPreferences` (2 tests)
   - Reset to defaults
   - Forbidden access

4. `TestValidatePreferences` (4 tests)
   - Valid payloads
   - Invalid payloads
   - Missing body
   - Forbidden access

5. `TestPreferencesMultiTenant` (1 test)
   - Tenant isolation

6. `TestPreferencesValidationRules` (13 parametrized tests)
   - Theme modes, colors
   - Sync frequencies, scopes
   - All validation rules

**Total**: 53+ test cases

### Running Tests

```bash
# All preference tests
pytest tests/test_preferences.py -v

# Specific test class
pytest tests/test_preferences.py::TestGetPreferences -v

# Specific test
pytest tests/test_preferences.py::TestGetPreferences::test_get_preferences_creates_defaults -v

# With coverage
pytest tests/test_preferences.py --cov=src.routes.preferences --cov=src.models.preferences

# Show coverage report
pytest tests/test_preferences.py --cov --cov-report=html
```

---

## Integration Examples

### JavaScript/React Example

```javascript
// Get preferences
const response = await fetch('/api/v1/users/user-123/preferences', {
  headers: {
    'X-Tenant-ID': tenantId,
    'X-User-ID': userId,
  }
});
const { data: preferences } = await response.json();

// Update theme
const update = {
  theme: {
    mode: 'dark',
    accentColor: '#2196f3',
  }
};

const updateResponse = await fetch('/api/v1/users/user-123/preferences', {
  method: 'PUT',
  headers: {
    'X-Tenant-ID': tenantId,
    'X-User-ID': userId,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(update)
});

// Handle version conflict
if (updateResponse.status === 409) {
  const { data: latest } = await updateResponse.json();
  // Retry with new version
}

// Validate before submit
const validateResponse = await fetch('/api/v1/users/user-123/preferences/validate', {
  method: 'POST',
  headers: {
    'X-Tenant-ID': tenantId,
    'X-User-ID': userId,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(update)
});
const { valid, error } = await validateResponse.json();
if (!valid) {
  console.error('Validation failed:', error);
}
```

### Python Example

```python
import requests

tenant_id = 'tenant-123'
user_id = 'user-123'

# Get preferences
response = requests.get(
    f'http://localhost:5000/api/v1/users/{user_id}/preferences',
    headers={
        'X-Tenant-ID': tenant_id,
        'X-User-ID': user_id,
    }
)
preferences = response.json()['data']

# Update preferences
update = {
    'theme': {
        'mode': 'dark',
    },
    'sync': {
        'frequencyMinutes': 15,
    }
}

response = requests.put(
    f'http://localhost:5000/api/v1/users/{user_id}/preferences',
    json=update,
    headers={
        'X-Tenant-ID': tenant_id,
        'X-User-ID': user_id,
    }
)

if response.status_code == 409:
    # Version conflict - retry with new version
    latest = response.json()['data']
    print(f"Conflict: version {latest['version']}")
```

---

## Future Enhancements

1. **Preferences Profiles**: Save multiple settings profiles
2. **Sync across devices**: Cloud-based preferences sync
3. **Admin overrides**: Tenant admins override user settings
4. **Audit logging**: Track preference changes
5. **AI recommendations**: Suggest settings based on usage
6. **Backup/export**: Allow users to export settings
7. **Template sharing**: Share templates with colleagues
8. **Group policies**: IT policies enforce certain settings

---

## Performance Considerations

### Query Performance
- Indexed lookups: O(1) by `(tenant_id, user_id)`
- No full table scans
- Soft delete handled by unique constraint

### Storage
- ~2KB per user preferences record
- Negligible database bloat even with millions of users

### Caching (Future)
```python
# Cache invalidation on update
cache.delete(f'prefs:{tenant_id}:{user_id}')
```

---

## Deployment Checklist

- [ ] Database migration: `UserPreferences` table created
- [ ] Flask blueprint registered in `app.py`
- [ ] Environment variables configured
- [ ] Tests passing: `pytest tests/test_preferences.py`
- [ ] Documentation reviewed
- [ ] Authentication headers validated
- [ ] Multi-tenant isolation verified
- [ ] Validation rules tested
- [ ] Rate limiting configured (if needed)
- [ ] Monitoring/alerting configured

---

## Files

| File | Purpose |
|------|---------|
| `src/models/preferences.py` | SQLAlchemy model definition |
| `src/routes/preferences.py` | Flask route handlers |
| `tests/test_preferences.py` | 53+ comprehensive test cases |
| `PHASE_7_PREFERENCES_API.md` | This documentation |

---

**Status**: Phase 7 Implementation Complete
**Created**: 2026-01-24
**Last Updated**: 2026-01-24
