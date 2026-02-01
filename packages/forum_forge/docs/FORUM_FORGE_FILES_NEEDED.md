# Forum Forge: Complete File List - What Needs to be Created

**Total files needed**: 20+ files
**Estimated effort**: 40-50 hours

---

## Page Components (5 files)

### 1. forum_home.json
**Path**: `/packages/forum_forge/components/forum_home.json`
**Purpose**: Main forum landing page
**Includes**: Hero section, stats grid, category list, recent threads
**Data bindings**:
- GET `/categories` → categories list
- GET `/threads?limit=5` → recent threads
- GET `/admin/stats` → forum stats

**Status**: ❌ MISSING

---

### 2. forum_category_view.json
**Path**: `/packages/forum_forge/components/forum_category_view.json`
**Purpose**: Single category view with threads
**Includes**: Category header, thread list (paginated), create thread button
**Data bindings**:
- GET `/categories/:categoryId` → category detail
- GET `/categories/:categoryId/threads?page=X` → threads
**Params**: categoryId (route), page (query), limit (query)

**Status**: ❌ MISSING

---

### 3. forum_thread_view.json
**Path**: `/packages/forum_forge/components/forum_thread_view.json`
**Purpose**: Thread discussion page
**Includes**: Thread header, posts (paginated), reply form, moderation buttons
**Data bindings**:
- GET `/threads/:threadId` → thread detail
- GET `/threads/:threadId/posts?page=X` → posts
**Handlers**:
- POST reply
- PUT lock/pin thread (moderator)
- DELETE thread (moderator)

**Status**: ❌ MISSING

---

### 4. forum_create_thread.json
**Path**: `/packages/forum_forge/components/forum_create_thread.json`
**Purpose**: Create thread form
**Includes**: Category dropdown, title input, content textarea, submit button
**Data bindings**:
- GET `/categories` → category options
**Handlers**:
- POST `/threads` (create-thread workflow)

**Status**: ❌ MISSING

---

### 5. forum_moderation_panel.json
**Path**: `/packages/forum_forge/components/forum_moderation_panel.json`
**Purpose**: Admin moderation dashboard
**Includes**: Tabs for flagged posts, statistics, audit log
**Data bindings**:
- GET `/admin/flagged-posts` → flagged posts
- GET `/admin/stats` → statistics
- GET `/admin/audit-log` → audit log
**Handlers**:
- PUT `/admin/flagged-posts/:id` (approve/reject)

**Status**: ❌ MISSING

---

## Sub-Components (3 files)

### 6. post_card.json
**Path**: `/packages/forum_forge/components/post_card.json`
**Purpose**: Display single forum post
**Includes**: Author info, timestamp, content, like button, flag button, edit/delete (if owner)
**Props**: post (object)

**Status**: ❌ MISSING

---

### 7. moderation_queue_item.json
**Path**: `/packages/forum_forge/components/moderation_queue_item.json`
**Purpose**: Flagged post display in moderation queue
**Includes**: Post preview, flag reason, approve/reject buttons
**Props**: flaggedPost (object)

**Status**: ❌ MISSING

---

### 8. reply_form.json
**Path**: `/packages/forum_forge/components/reply_form.json`
**Purpose**: Form for replying to thread
**Includes**: Textarea input, char counter, submit button
**Props**: threadId (required)

**Status**: ❌ MISSING

---

## Core Workflows (6 files)

### 9. update-thread.jsonscript
**Path**: `/packages/forum_forge/workflow/update-thread.jsonscript`
**Trigger**: PUT `/forum/threads/:threadId`
**Body**: `{ title, content }`
**Validation**:
- Owner or moderator only
- Title 3-200 chars
- Content 10-5000 chars
**Actions**:
- Update ForumThread
- Emit thread_updated event
- Return 200

**Status**: ❌ MISSING

---

### 10. update-post.jsonscript
**Path**: `/packages/forum_forge/workflow/update-post.jsonscript`
**Trigger**: PUT `/forum/threads/:threadId/posts/:postId`
**Body**: `{ content }`
**Validation**:
- Owner or moderator only
- Content 3-5000 chars
**Actions**:
- Update ForumPost
- Set isEdited = true
- Emit post_updated event
- Return 200

**Status**: ❌ MISSING

---

### 11. lock-thread.jsonscript
**Path**: `/packages/forum_forge/workflow/lock-thread.jsonscript`
**Trigger**: PUT `/forum/threads/:threadId/lock`
**Body**: `{ locked: boolean }`
**Validation**: Moderator only (level >= 3)
**Actions**:
- Update ForumThread.isLocked
- Emit thread_locked event
- Return 200

**Status**: ❌ MISSING

---

### 12. pin-thread.jsonscript
**Path**: `/packages/forum_forge/workflow/pin-thread.jsonscript`
**Trigger**: PUT `/forum/threads/:threadId/pin`
**Body**: `{ pinned: boolean }`
**Validation**: Moderator only
**Actions**:
- Update ForumThread.isPinned
- Emit thread_pinned event
- Return 200

**Status**: ❌ MISSING

---

### 13. flag-post.jsonscript
**Path**: `/packages/forum_forge/workflow/flag-post.jsonscript`
**Trigger**: POST `/forum/posts/:postId/flag`
**Body**: `{ reason: string }`
**Validation**:
- User authenticated
- Reason 10-500 chars
**Actions**:
- Create PostFlag entity (if doesn't exist)
- Emit post_flagged event
- Return 201

**Status**: ❌ MISSING

---

### 14. list-categories.jsonscript
**Path**: `/packages/forum_forge/workflow/list-categories.jsonscript`
**Trigger**: GET `/forum/categories`
**Query params**: (none required, but could add sort, filter)
**Validation**: Tenant context present
**Actions**:
- Query ForumCategory filtered by tenantId
- Sort by sortOrder ASC
- Return 200 with category array

**Status**: ❌ MISSING

---

## Moderation Workflows (4 files)

### 15. list-flagged-posts.jsonscript
**Path**: `/packages/forum_forge/workflow/list-flagged-posts.jsonscript`
**Trigger**: GET `/forum/admin/flagged-posts`
**Query params**: page, limit
**Validation**: Moderator only (level >= 3)
**Actions**:
- Query PostFlag filtered by tenantId, status='pending'
- Sort by createdAt DESC
- Include post content + author
- Return paginated results

**Status**: ❌ MISSING

---

### 16. approve-flagged-post.jsonscript
**Path**: `/packages/forum_forge/workflow/approve-flagged-post.jsonscript`
**Trigger**: PUT `/forum/admin/flagged-posts/:flagId`
**Body**: `{ action: 'approve' }`
**Validation**: Moderator only
**Actions**:
- Update PostFlag.status = 'approved'
- Emit flag_approved event
- Return 200

**Status**: ❌ MISSING

---

### 17. reject-flagged-post.jsonscript
**Path**: `/packages/forum_forge/workflow/reject-flagged-post.jsonscript`
**Trigger**: PUT `/forum/admin/flagged-posts/:flagId`
**Body**: `{ action: 'reject' }`
**Validation**: Moderator only
**Actions**:
- Delete flagged post (ForumPost)
- Update PostFlag.status = 'rejected'
- Emit flag_rejected event
- Return 200

**Status**: ❌ MISSING

---

### 18. delete-thread.jsonscript
**Path**: `/packages/forum_forge/workflow/delete-thread.jsonscript`
**Trigger**: DELETE `/forum/threads/:threadId`
**Validation**:
- Owner or moderator only
- Thread exists in tenant
**Actions**:
- Delete all ForumPost where threadId = X
- Delete ForumThread
- Emit thread_deleted event
- Return 204

**Status**: ❌ MISSING

---

## Category Management Workflows (3 files)

### 19. create-category.jsonscript
**Path**: `/packages/forum_forge/workflow/create-category.jsonscript`
**Trigger**: POST `/forum/categories`
**Body**:
```json
{
  "name": "string (3-100 chars, unique per tenant)",
  "description": "string (optional, max 500)",
  "icon": "string (optional, max 50)",
  "parentId": "string (optional, cuid of parent category)"
}
```
**Validation**: Admin only (level >= 4)
**Actions**:
- Generate slug from name
- Check unique [tenantId, slug]
- Create ForumCategory
- Emit category_created event
- Return 201

**Status**: ❌ MISSING

---

### 20. update-category.jsonscript
**Path**: `/packages/forum_grove/workflow/update-category.jsonscript`
**Trigger**: PUT `/forum/categories/:categoryId`
**Body**: `{ name?, description?, icon?, sortOrder? }`
**Validation**: Admin only
**Actions**:
- Update ForumCategory
- Emit category_updated event
- Return 200

**Status**: ❌ MISSING

---

### 21. delete-category.jsonscript
**Path**: `/packages/forum_forge/workflow/delete-category.jsonscript`
**Trigger**: DELETE `/forum/categories/:categoryId`
**Validation**:
- Admin only
- Category exists
- No threads in category (or cascade?)
**Actions**:
- Delete ForumCategory
- Emit category_deleted event
- Return 204

**Status**: ❌ MISSING

---

## Analytics/Admin Workflows (2 files)

### 22. get-forum-stats.jsonscript
**Path**: `/packages/forum_forge/workflow/get-forum-stats.jsonscript`
**Trigger**: GET `/forum/admin/stats`
**Validation**: Moderator only (level >= 3)
**Returns**:
```json
{
  "activeThreads": 246,
  "repliesToday": 1092,
  "queuedFlags": 8,
  "totalCategories": 5,
  "totalPosts": 12345,
  "recentActivityCount": 15
}
```

**Status**: ❌ MISSING

---

### 23. get-audit-log.jsonscript
**Path**: `/packages/forum_forge/workflow/get-audit-log.jsonscript`
**Trigger**: GET `/forum/admin/audit-log`
**Query params**: page, limit, action (filter)
**Validation**: Moderator only
**Returns**: Paginated audit log of moderation actions
```json
{
  "logs": [
    {
      "id": "...",
      "action": "thread_locked|post_deleted|user_warned",
      "moderator": "username",
      "targetId": "threadId or postId",
      "timestamp": 1234567890,
      "reason": "optional reason"
    }
  ],
  "pagination": {}
}
```

**Status**: ❌ MISSING

---

## Supporting Files

### 24. Post Flag Schema (if not in core)
**Location**: May need to add PostFlag entity to schema if flagging system requires separate table

**Fields**:
- id: cuid
- tenantId: uuid
- postId: cuid
- threadId: cuid
- flaggedBy: uuid
- reason: string
- status: enum(pending, approved, rejected)
- createdAt: bigint

**Status**: ⚠️ NEEDS SCHEMA (if creating separate flag table)

---

### 25. Seed Data Directory
**Path**: `/packages/forum_forge/seed/`
**Files**:
- `categories.json` - Default categories
- `sample-threads.json` - Sample data for testing
- `init.sql` - Database initialization (optional)

**Status**: ❌ MISSING

---

### 26. Tests/E2E Tests
**Path**: `/packages/forum_forge/tests/`
**Files**:
- `forum.e2e.test.ts` - E2E test suite
- `forum.unit.test.ts` - Unit tests
- `forum.integration.test.ts` - Integration tests

**Status**: ❌ MISSING

---

## Summary Table

| File # | Type | Filename | Status |
|--------|------|----------|--------|
| 1 | Page Component | forum_home.json | ❌ |
| 2 | Page Component | forum_category_view.json | ❌ |
| 3 | Page Component | forum_thread_view.json | ❌ |
| 4 | Page Component | forum_create_thread.json | ❌ |
| 5 | Page Component | forum_moderation_panel.json | ❌ |
| 6 | Sub-Component | post_card.json | ❌ |
| 7 | Sub-Component | moderation_queue_item.json | ❌ |
| 8 | Sub-Component | reply_form.json | ❌ |
| 9 | Workflow | update-thread.jsonscript | ❌ |
| 10 | Workflow | update-post.jsonscript | ❌ |
| 11 | Workflow | lock-thread.jsonscript | ❌ |
| 12 | Workflow | pin-thread.jsonscript | ❌ |
| 13 | Workflow | flag-post.jsonscript | ❌ |
| 14 | Workflow | list-categories.jsonscript | ❌ |
| 15 | Workflow | list-flagged-posts.jsonscript | ❌ |
| 16 | Workflow | approve-flagged-post.jsonscript | ❌ |
| 17 | Workflow | reject-flagged-post.jsonscript | ❌ |
| 18 | Workflow | delete-thread.jsonscript | ❌ |
| 19 | Workflow | create-category.jsonscript | ❌ |
| 20 | Workflow | update-category.jsonscript | ❌ |
| 21 | Workflow | delete-category.jsonscript | ❌ |
| 22 | Workflow | get-forum-stats.jsonscript | ❌ |
| 23 | Workflow | get-audit-log.jsonscript | ❌ |
| 24 | Schema | forum.yaml (POST_FLAG entity) | ⚠️ |
| 25 | Seed Data | seed/categories.json | ❌ |
| 26 | Tests | tests/forum.e2e.test.ts | ❌ |

---

## Creation Priority

### Tier 1: Core Functionality (Must have)
- [ ] forum_home.json
- [ ] forum_category_view.json
- [ ] forum_thread_view.json
- [ ] forum_create_thread.json
- [ ] list-categories.jsonscript
- [ ] post_card.json

**Effort**: 8-10 hours | **Impact**: Users can browse and post

### Tier 2: Moderation (Should have)
- [ ] forum_moderation_panel.json
- [ ] update-thread.jsonscript
- [ ] update-post.jsonscript
- [ ] lock-thread.jsonscript
- [ ] pin-thread.jsonscript
- [ ] flag-post.jsonscript
- [ ] list-flagged-posts.jsonscript
- [ ] approve-flagged-post.jsonscript
- [ ] reject-flagged-post.jsonscript

**Effort**: 12-15 hours | **Impact**: Moderation workflow complete

### Tier 3: Admin Features (Nice to have)
- [ ] create-category.jsonscript
- [ ] update-category.jsonscript
- [ ] delete-category.jsonscript
- [ ] get-forum-stats.jsonscript
- [ ] get-audit-log.jsonscript

**Effort**: 6-8 hours | **Impact**: Full admin control

### Tier 4: Polish (Optional)
- [ ] Seed data
- [ ] E2E tests
- [ ] Real-time subscriptions (Phase 3)

**Effort**: 10-15 hours | **Impact**: Production readiness

---

## Quick Checklist

### Before Creating Files:
- [ ] Review `/FORUM_FORGE_IMPLEMENTATION_TEMPLATES.md` for code examples
- [ ] Ensure all workflows follow JSON Script v2.2.0 spec
- [ ] Verify multi-tenant filtering (tenantId) in all queries
- [ ] Check validation rules match schema constraints

### Per File:
- [ ] File created in correct location
- [ ] Filename follows snake_case for workflows, camelCase for components
- [ ] Schema validation passes (if applicable)
- [ ] Bindings reference correct endpoints
- [ ] Error handlers defined
- [ ] Event channels scoped by tenant

### Integration:
- [ ] Workflow triggers registered
- [ ] Components bind to correct API endpoints
- [ ] Page routes reference component IDs
- [ ] Permissions validated in workflows
- [ ] Rate limiting applied on appropriate endpoints

---

## Testing Each File

### Components:
```bash
# Load in browser
GET /api/v1/{tenant}/ui/components/{componentId}/render
```

### Workflows:
```bash
# Test via API
curl -X POST /api/v1/{tenant}/forum_forge/threads \
  -H "Content-Type: application/json" \
  -d '{"categoryId":"...", "title":"...", "content":"..."}'
```

---

## References

- **Templates**: See `/FORUM_FORGE_IMPLEMENTATION_TEMPLATES.md` for exact code
- **Schema**: `/dbal/shared/api/schema/entities/packages/forum.yaml`
- **JSON Script docs**: v2.2.0 specification
- **CLAUDE.md**: Project principles

---

## Notes

1. **All paths are absolute** - From project root `/packages/forum_forge/`
2. **JSON formatting** - All files must be valid JSON with proper formatting
3. **Multi-tenant** - Every workflow must validate and filter by `tenantId`
4. **Rate limits** - Apply to POST/PUT/DELETE endpoints (see CLAUDE.md)
5. **Events** - Scope all events with tenant prefix: `forum:` or `forum:thread:`

---

Done! This file lists all 26+ files needed to complete Forum Forge from 65% to 100%.
