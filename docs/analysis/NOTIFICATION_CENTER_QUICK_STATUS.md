# Notification Center - Quick Status & Implementation Checklist

**Last Updated**: 2026-01-21
**Overall Status**: 68% Complete
**Blocking Issues**: 3 Critical, 2 High Priority

---

## Status Overview

```
████████░░░░░░░░░░░░░░░░░░░░░░ 68%

✅ Implemented (68%)
- Schema definitions (Notification entity)
- 4 Core workflows (dispatch, mark-read, list-unread, cleanup)
- 3 UI components (toast, list, summary)
- 2 Page routes (inbox, settings)
- Event handlers & permissions

❌ Missing (32%)
- API route handlers (BLOCKING)
- NotificationPreference entity (BLOCKING)
- Rate limiting configuration
- Multi-tenant orchestration
- Page component implementations
```

---

## Implemented Components Matrix

| Component | File | Status | Issues |
|-----------|------|--------|--------|
| **Schema: Notification** | `/dbal/shared/api/schema/entities/packages/notification.yaml` | ✅ 100% | None |
| **Entity Definition** | `/packages/notification_center/entities/schema.json` | ✅ 100% | None |
| **Workflow: Dispatch** | `/packages/notification_center/workflow/dispatch.jsonscript` | ⚠️ 90% | FCM creds needed, push limit missing |
| **Workflow: Mark Read** | `/packages/notification_center/workflow/mark-as-read.jsonscript` | ✅ 100% | None |
| **Workflow: List Unread** | `/packages/notification_center/workflow/list-unread.jsonscript` | ✅ 100% | None |
| **Workflow: Cleanup** | `/packages/notification_center/workflow/cleanup-expired.jsonscript` | ⚠️ 70% | **Missing tenantId filter (data leak!)** |
| **UI: Toast** | `/packages/notification_center/components/ui.json` | ✅ 100% | None |
| **UI: List** | `/packages/notification_center/components/ui.json` | ✅ 100% | None |
| **UI: Summary** | `/packages/notification_center/components/ui.json` | ✅ 100% | None |
| **Page: Inbox** | `/packages/notification_center/page-config/page-config.json` | ⚠️ 50% | Component implementation missing |
| **Page: Settings** | `/packages/notification_center/page-config/page-config.json` | ⚠️ 50% | Component implementation missing |
| **Events** | `/packages/notification_center/events/handlers.json` | ✅ 100% | None |
| **Permissions** | `/packages/notification_center/permissions/roles.json` | ✅ 100% | None |

---

## Critical Blockers

### 🔴 BLOCKER #1: No API Routes
**Severity**: CRITICAL (System non-functional)
**Impact**: Workflows cannot be triggered
**Status**: 0% Complete

**Missing**:
```
POST   /api/v1/{tenant}/notification_center/notifications
GET    /api/v1/{tenant}/notification_center/notifications
GET    /api/v1/{tenant}/notification_center/notifications/{id}
PUT    /api/v1/{tenant}/notification_center/notifications/{id}
DELETE /api/v1/{tenant}/notification_center/notifications/{id}
POST   /api/v1/{tenant}/notification_center/notifications/dispatch
POST   /api/v1/{tenant}/notification_center/notifications/mark-read
```

**Location**: Need to create in `/frontends/nextjs/src/app/api/v1/[tenant]/notification_center/`

**Timeline**: 4-6 hours

---

### 🔴 BLOCKER #2: NotificationPreference Entity Undefined
**Severity**: CRITICAL (Dispatch workflow crashes)
**Impact**: Cannot filter channels based on user preferences
**Status**: 0% Complete

**Missing Schema**:
```yaml
entity: NotificationPreference
fields:
  userId: uuid
  tenantId: uuid
  enableInApp: boolean (default: true)
  enableEmail: boolean (default: true)
  enablePush: boolean (default: false)
  emailFrequency: enum [immediate, daily, weekly]
  dndStart: time
  dndEnd: time
```

**Workflow Reference**: `/packages/notification_center/workflow/dispatch.jsonscript` line 32-41

**Timeline**: 2-3 hours

---

### 🔴 BLOCKER #3: Multi-Tenant Data Leak in Cleanup
**Severity**: CRITICAL (Security risk)
**Impact**: Cleanup workflow deletes notifications from ALL tenants
**Status**: Confirmed bug

**Bug Location**: `/packages/notification_center/workflow/cleanup-expired.jsonscript` lines 17-27

**Current Code**:
```jsonscript
"filter": {
  "expiresAt": { "$lt": "{{ $steps.get_current_time.output }}" }
  // ← Missing: "tenantId": "{{ $context.tenantId }}"
}
```

**Fix**: Add tenantId to all filter objects in cleanup workflow

**Timeline**: 30 minutes

---

## High Priority Issues

### 🟠 ISSUE #1: Push Rate Limit Missing
**Severity**: HIGH (DDoS vulnerability)
**Impact**: No rate limit on push notifications
**Status**: 0% Complete

**Current**:
- Email: 10/hour (defined in workflow)
- Push: ∞ (unlimited)
- In-app: ∞ (unlimited)

**Recommendation**:
- Push: 20/hour/user
- In-app: 100/hour/user
- Dispatch endpoint: 50/minute/tenant

**Timeline**: 3-4 hours

---

### 🟠 ISSUE #2: Page Components Not Implemented
**Severity**: HIGH (UI non-functional)
**Impact**: Routes exist but components don't
**Status**: 0% Complete

**Missing Components**:
- `notifications_inbox` - Full notification list page
- `notification_settings` - Preference management page

**Required UI**:
- Filter unread/read
- Mark as read (single & bulk)
- Delete notifications
- Clear all
- Preference toggles (email, push, in-app)
- DND time selector

**Timeline**: 8-10 hours

---

## Working Components

### ✅ Schema Design
- Notification entity complete with indexes
- Proper multi-tenant filtering (tenantId)
- Flexible JSON data field
- Expiration support
- Row-level security ACLs

### ✅ Workflows Functional
- Dispatch: Multi-channel with preferences (missing push limit)
- Mark Read: Bulk & single operations
- List Unread: Paginated, user-scoped
- Cleanup: Scheduled (has tenant bug)

### ✅ UI Components Defined
- Toast notifications (5s auto-dismiss)
- Notification list (read/unread badges)
- Summary cards (count by severity)

### ✅ Event System
- notification.created event
- notification.read event
- notification.dismissed event
- Subscribers for toast & count updates

---

## Implementation Roadmap

### Week 1: Critical Blockers
- [ ] Create API route handlers (6h)
- [ ] Define NotificationPreference entity (2h)
- [ ] Fix cleanup workflow tenant filter (0.5h)
- [ ] Seed default preferences (1h)

### Week 2: Rate Limiting & Configuration
- [ ] Add rate limiters (4h)
- [ ] Email service integration (3h)
- [ ] FCM configuration (2h)
- [ ] WebSocket bridge (4h)

### Week 3: UI & Components
- [ ] NotificationSettings page (5h)
- [ ] NotificationInbox page (6h)
- [ ] Preference management (3h)
- [ ] Testing & fixes (2h)

### Week 4: Testing & Polish
- [ ] E2E tests (6h)
- [ ] Multi-tenant tests (4h)
- [ ] Rate limit tests (3h)
- [ ] Performance optimization (2h)

**Total Estimated**: 40-45 hours (1 week of full-time work)

---

## Rate Limiting Requirements

### Email Notifications
```
Per-user: 10/hour
Per-user: 50/day
Per-tenant: 100/hour
```

### Push Notifications
```
Per-user: 20/hour
Per-user: 100/day
Per-tenant: 500/hour
```

### In-App Notifications
```
Per-user: 100/hour
Per-user: 1000/day
Per-tenant: No hard limit (use expiration)
```

### Dispatch Endpoint
```
Per-tenant: 50/minute
Per-tenant: 500/hour
Per-tenant: 5000/day
```

---

## Multi-Tenant Workflow Checklist

### Dispatch Workflow
- ✅ Context validation (tenantId)
- ✅ Preference fetch (userId + tenantId)
- ✅ Notification creation (tenantId included)
- ✅ Event emission (user channel)
- ⚠️ Email rate limit (uses userId key)
- ❌ Push rate limit (missing)
- ❌ Aggregate rate limit (missing)

### Mark as Read Workflow
- ✅ User validation (tenantId)
- ✅ Filter by tenantId + userId
- ✅ Event emission (user channel)

### List Unread Workflow
- ✅ User validation (tenantId)
- ✅ Filter by tenantId + userId
- ✅ Unread count scoped to tenant

### Cleanup Workflow
- ❌ **NO tenantId filter** (CRITICAL BUG)
- ✅ Scheduled trigger
- ✅ Event logging

---

## External Dependencies

### Required Services
- **Email**: SendGrid, Mailgun, AWS SES (Choose 1)
- **Push**: Firebase Cloud Messaging (FCM)
- **Storage**: PostgreSQL (or SQLite for dev)
- **Cache**: Redis (for distributed rate limiting)
- **WebSocket**: Socket.io or native (for real-time)

### Environment Variables Needed
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxx

FCM_PROJECT_ID=your-project-id
FCM_PRIVATE_KEY=your-private-key
FCM_CLIENT_EMAIL=firebase@your-project.iam.gserviceaccount.com

REDIS_URL=redis://localhost:6379
```

---

## Testing Checklist

### Unit Tests
- [ ] Notification entity validation
- [ ] Rate limit calculations
- [ ] Preference filtering logic

### Integration Tests
- [ ] Dispatch workflow execution
- [ ] Mark-read workflow execution
- [ ] Email delivery (mock)
- [ ] Push delivery (mock)
- [ ] Event emission

### E2E Tests
- [ ] Create notification via API
- [ ] List unread notifications
- [ ] Mark as read (single & bulk)
- [ ] Receive real-time notification (WebSocket)
- [ ] Rate limit enforcement

### Multi-Tenant Tests
- [ ] User A cannot see User B's notifications
- [ ] Cleanup doesn't affect other tenants
- [ ] Rate limits isolated per tenant

### Security Tests
- [ ] Unauthorized users blocked
- [ ] Row-level security enforced
- [ ] SQL injection prevented
- [ ] XSS in notification content prevented
- [ ] CSRF tokens validated

---

## Files to Create/Modify

### Create (New Files)
1. `/frontends/nextjs/src/app/api/v1/[tenant]/notification_center/route.ts`
2. `/packages/notification_center/actions/dispatch.ts`
3. `/packages/notification_center/actions/mark-read.ts`
4. `/packages/notification_center/actions/list-unread.ts`
5. `/dbal/shared/api/schema/entities/packages/notification-preference.yaml`
6. `/packages/notification_center/workflow/broadcast.jsonscript`
7. `/packages/notification_center/components/notifications-inbox.json`
8. `/packages/notification_center/components/notification-settings.json`

### Modify (Existing Files)
1. `/packages/notification_center/workflow/cleanup-expired.jsonscript` (add tenantId filter)
2. `/packages/notification_center/workflow/dispatch.jsonscript` (add push rate limit)
3. `/frontends/nextjs/src/lib/middleware/rate-limit.ts` (add notification limits)
4. `/dbal/shared/api/schema/entities/core/user.yaml` (add fcmToken field)

---

## Success Criteria

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| API endpoints working | 8/8 | 0/8 | ❌ |
| Workflows executable | 4/4 | 0/4 | ❌ |
| Rate limits enforced | 6/6 | 1/6 | ⚠️ |
| UI components rendered | 5/5 | 3/5 | ⚠️ |
| Multi-tenant safety | 100% | 75% | ⚠️ |
| E2E tests passing | 95%+ | 0% | ❌ |

---

## Next Steps

1. **Today**: Review this analysis with team
2. **Tomorrow**: Start on BLOCKER #1 (API routes) and BLOCKER #3 (cleanup bug fix)
3. **This week**: Complete all blockers and high-priority issues
4. **Next week**: Rate limiting, UI components, testing

**Estimated Ship Date**: 4 weeks to production readiness (95%+ health)

