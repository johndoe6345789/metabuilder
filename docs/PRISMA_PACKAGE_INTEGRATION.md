# Prisma Schema Package Integration Plan

**Created:** 2025-12-30
**Goal:** Wire existing Lua packages to Prisma schema and expand schema for new features

---

## Current Schema Analysis

Your Prisma schema is **excellent** and covers:
- ✅ Core identity & auth (User, Credential, Session)
- ✅ Multi-tenancy (Tenant)
- ✅ Routing & Pages (PageConfig)
- ✅ Workflows & Scripting (Workflow, LuaScript)
- ✅ Data schemas (ModelSchema, DynamicData)
- ✅ App configuration (SystemConfig, FeatureFlag, KeyValue)
- ✅ Components & UI (ComponentNode, ComponentConfig)
- ✅ Packages (InstalledPackage, PackageData)
- ✅ Content (Comment, Forum models)
- ✅ Media (MediaAsset, MediaJob)
- ✅ Notifications
- ✅ Audit & logging
- ✅ Generic entities (Tag, Tagging, EntityRelation, Task, Webhook, etc.)

---

## Package Integration Recommendations

### 1. **audit_log** Package → AuditLog Model ✅ Ready

**Schema:** Already perfect!
```prisma
model AuditLog {
  id        String  @id @default(cuid())
  tenantId  String
  userId    String?
  username  String?
  action    String  // create, update, delete, login, logout
  entity    String  // User, Workflow, Page
  entityId  String?
  oldValue  String? // JSON
  newValue  String? // JSON
  ipAddress String?
  userAgent String?
  details   String? // JSON
  timestamp BigInt
}
```

**Lua Package Operations:**
- `createAuditLog(tenantId, userId, action, entity, entityId, changes)`
- `listAuditLogs(tenantId, filters)`
- `getAuditLogsByEntity(tenantId, entity, entityId)`
- `getAuditLogsByUser(tenantId, userId)`

---

### 2. **notification_center** Package → Notification Model ✅ Ready

**Schema:** Already excellent!
```prisma
model Notification {
  id        String  @id @default(cuid())
  tenantId  String
  userId    String
  type      String  // info, warning, success, error, mention, reply
  title     String
  message   String
  icon      String?
  read      Boolean @default(false)
  data      String? // JSON
  createdAt BigInt
  expiresAt BigInt?
}
```

**Lua Package Operations:**
- `createNotification(userId, type, title, message, data?)`
- `listNotifications(userId, unreadOnly?)`
- `markAsRead(notificationId)`
- `markAllAsRead(userId)`
- `deleteNotification(notificationId)`

---

### 3. **forum_forge** Package → Forum Models ✅ Ready

**Schema:** Perfect forum structure!
```prisma
model ForumCategory {
  id          String @id @default(cuid())
  tenantId    String
  name        String
  description String?
  slug        String
  sortOrder   Int @default(0)
  parentId    String? // Nested categories
  threads     ForumThread[]
}

model ForumThread {
  id           String @id @default(cuid())
  categoryId   String
  authorId     String
  title        String
  slug         String
  isPinned     Boolean @default(false)
  isLocked     Boolean @default(false)
  viewCount    Int @default(0)
  replyCount   Int @default(0)
  posts        ForumPost[]
}

model ForumPost {
  id        String @id @default(cuid())
  threadId  String
  authorId  String
  content   String
  likes     Int @default(0)
}
```

**Lua Package Operations:**
- `listCategories(tenantId)`
- `createThread(categoryId, authorId, title, content)`
- `listThreads(categoryId, filters)`
- `getThread(threadId)`
- `createPost(threadId, authorId, content)`
- `listPosts(threadId, pagination)`
- `likePost(postId, userId)`

---

### 4. **media_center** Package → MediaAsset & MediaJob Models ✅ Ready

**Schema:** Great media handling!
```prisma
model MediaAsset {
  id            String @id @default(cuid())
  tenantId      String
  filename      String
  mimeType      String
  size          BigInt
  width         Int?
  height        Int?
  duration      Int?
  metadata      String? // JSON: EXIF, tags
}

model MediaJob {
  id          String @id @default(cuid())
  type        String  // transcode, thumbnail, convert
  status      String  // pending, processing, completed, failed
  progress    Int @default(0)
  params      String // JSON
}
```

**Lua Package Operations:**
- `uploadMedia(tenantId, userId, file)`
- `listMedia(tenantId, filters)`
- `getMedia(mediaId)`
- `deleteMedia(mediaId)`
- `createMediaJob(type, inputPath, params)`
- `listMediaJobs(tenantId, status?)`
- `updateJobProgress(jobId, progress)`

---

### 5. **data_table** Package → DynamicData Model ✅ Ready

**Schema:** Generic data storage!
```prisma
model DynamicData {
  id        String @id @default(cuid())
  tenantId  String
  schemaId  String  // Reference to ModelSchema
  data      String  // JSON: actual record data
  createdAt BigInt
  updatedAt BigInt?
}
```

**Lua Package Operations:**
- `createRecord(schemaId, data)`
- `listRecords(schemaId, filters, pagination)`
- `getRecord(recordId)`
- `updateRecord(recordId, data)`
- `deleteRecord(recordId)`
- `searchRecords(schemaId, query)`

---

### 6. **workflow_editor** Package → Workflow Model ✅ Ready

**Schema:** Perfect for visual workflows!
```prisma
model Workflow {
  id          String @id
  name        String
  description String?
  nodes       String  // JSON: WorkflowNode[]
  edges       String  // JSON: WorkflowEdge[]
  enabled     Boolean
  version     Int @default(1)
}
```

**Lua Package Operations:**
- `createWorkflow(tenantId, name, description)`
- `listWorkflows(tenantId, enabledOnly?)`
- `getWorkflow(workflowId)`
- `updateWorkflow(workflowId, nodes, edges)`
- `enableWorkflow(workflowId)`
- `disableWorkflow(workflowId)`
- `executeWorkflow(workflowId, input)`

---

### 7. **form_builder** Package → Template Model ✅ Ready

**Recommendation:** Use Template model for form templates
```prisma
model Template {
  id          String @id @default(cuid())
  category    String  // Use 'form' for form templates
  content     String  // JSON: form schema
  variables   String? // JSON: field definitions
}
```

**Lua Package Operations:**
- `createFormTemplate(name, fields)`
- `listFormTemplates(tenantId)`
- `getFormTemplate(templateId)`
- `renderForm(templateId, data?)`
- `validateFormData(templateId, data)`

---

### 8. **code_editor** Package → LuaScript Model ✅ Ready

**Schema:** Perfect for code editing!
```prisma
model LuaScript {
  id             String @id
  name           String
  code           String
  parameters     String  // JSON
  isSandboxed    Boolean @default(true)
  timeoutMs      Int @default(5000)
}
```

**Lua Package Operations:**
- `createScript(name, code, parameters)`
- `listScripts(tenantId)`
- `getScript(scriptId)`
- `updateScript(scriptId, code)`
- `executeScript(scriptId, args)`
- `validateScript(code)`

---

### 9. **irc_webchat** Package → Message Model ✅ Ready

**Schema:** Generic messaging!
```prisma
model Message {
  id           String @id @default(cuid())
  senderId     String?
  recipientId  String
  threadId     String? // IRC channel
  body         String
  isRead       Boolean @default(false)
}
```

**Lua Package Operations:**
- `sendMessage(channelId, userId, body)`
- `listMessages(channelId, limit?)`
- `joinChannel(userId, channelId)`
- `leaveChannel(userId, channelId)`

---

## Schema Expansions Needed

### 1. **Package Metadata** → Add to InstalledPackage

**Current:**
```prisma
model InstalledPackage {
  packageId   String  @id
  tenantId    String?
  version     String
  enabled     Boolean
  config      String? // JSON
}
```

**Enhancement:** Perfect as-is! Just wire up the Lua packages

---

### 2. **GitHub Integration** (github_tools package)

**Add New Model:**
```prisma
model GitHubRepository {
  id          String  @id @default(cuid())
  tenantId    String
  name        String
  owner       String
  fullName    String  // "owner/repo"
  url         String
  description String?
  isPrivate   Boolean @default(false)
  lastSync    BigInt?
  metadata    String? // JSON: stars, forks, etc.
  createdAt   BigInt
}

model GitHubAction {
  id           String  @id @default(cuid())
  repositoryId String
  workflowName String
  runNumber    Int
  status       String  // queued, in_progress, completed, failed
  conclusion   String? // success, failure, cancelled
  url          String
  triggeredBy  String?
  startedAt    BigInt?
  completedAt  BigInt?
  createdAt    BigInt
}
```

---

### 3. **Arcade/Gaming** (arcade_lobby package)

**Add New Models:**
```prisma
model Game {
  id          String  @id @default(cuid())
  tenantId    String
  name        String
  slug        String
  description String?
  thumbnail   String?
  category    String  // platformer, puzzle, arcade, etc.
  core        String  // RetroArch core name
  romPath     String?
  metadata    String? // JSON: controls, cheats, etc.
  enabled     Boolean @default(true)
  playCount   Int     @default(0)
  createdAt   BigInt

  @@unique([tenantId, slug])
}

model GameSession {
  id          String  @id @default(cuid())
  gameId      String
  userId      String
  startedAt   BigInt
  endedAt     BigInt?
  duration    Int?    // seconds
  saveState   String? // Path to save state
  achievements String? // JSON array
}

model GameHighScore {
  id        String @id @default(cuid())
  gameId    String
  userId    String
  score     BigInt
  metadata  String? // JSON: level, character, etc.
  createdAt BigInt

  @@index([gameId, score])
}
```

---

### 4. **CSS Designer** (css_designer package)

**Add New Model:**
```prisma
model CSSTheme {
  id          String  @id @default(cuid())
  tenantId    String
  name        String
  description String?
  variables   String  // JSON: CSS custom properties
  overrides   String? // JSON: component-specific styles
  isDefault   Boolean @default(false)
  isPublic    Boolean @default(false)
  createdAt   BigInt
  updatedAt   BigInt?
  createdBy   String?

  @@unique([tenantId, name])
}
```

---

### 5. **Dashboard** (dashboard package)

**Add New Models:**
```prisma
model DashboardWidget {
  id          String  @id @default(cuid())
  tenantId    String
  userId      String
  type        String  // chart, stats, list, calendar, etc.
  title       String
  config      String  // JSON: data source, refresh rate, etc.
  position    String  // JSON: {x, y, width, height}
  sortOrder   Int     @default(0)
  createdAt   BigInt
  updatedAt   BigInt?
}

model Dashboard {
  id          String @id @default(cuid())
  tenantId    String
  userId      String?
  name        String
  description String?
  layout      String  // JSON: grid layout
  widgets     String  // JSON: array of widget IDs
  isDefault   Boolean @default(false)
  isShared    Boolean @default(false)
  createdAt   BigInt
  updatedAt   BigInt?

  @@unique([tenantId, userId, name])
}
```

---

### 6. **Config Summary** (config_summary package)

**Use Existing:**
- SystemConfig for key-value config
- KeyValue for namespaced config

---

### 7. **Quick Guide** (quick_guide package)

**Add New Model:**
```prisma
model Guide {
  id          String  @id @default(cuid())
  tenantId    String
  title       String
  slug        String
  content     String  // Markdown
  category    String? // getting-started, tutorials, reference
  tags        String? // JSON array
  order       Int     @default(0)
  isPublished Boolean @default(true)
  views       Int     @default(0)
  createdAt   BigInt
  updatedAt   BigInt?
  createdBy   String?

  @@unique([tenantId, slug])
}

model GuideStep {
  id          String  @id @default(cuid())
  guideId     String
  title       String
  content     String  // Markdown
  order       Int
  actionType  String? // click, input, navigate, etc.
  actionData  String? // JSON: element selector, etc.
  createdAt   BigInt
}
```

---

## Implementation Priority

### Phase 1: Wire Existing Packages (High Priority)
1. ✅ **audit_log** → AuditLog operations
2. ✅ **notification_center** → Notification CRUD
3. ✅ **forum_forge** → Forum categories, threads, posts
4. ✅ **media_center** → MediaAsset & MediaJob management
5. ✅ **workflow_editor** → Workflow CRUD

### Phase 2: Add Schema Extensions (Medium Priority)
1. Add GitHub models for **github_tools**
2. Add Game models for **arcade_lobby**
3. Add CSSTheme for **css_designer**
4. Add Dashboard models
5. Add Guide models for **quick_guide**

### Phase 3: Create Lua Operations (Medium Priority)
For each package, create Lua operations in `packages/{name}/seed/scripts/db/`:
- `create.lua` - Create operations
- `read.lua` - List and get operations
- `update.lua` - Update operations
- `delete.lua` - Delete operations
- `queries.lua` - Complex queries

### Phase 4: Create TypeScript Integration (Low Priority)
For each package, create TypeScript helpers in `frontends/nextjs/src/lib/packages/{name}/`:
- `operations.ts` - DB operations
- `types.ts` - TypeScript types matching Prisma
- `hooks.ts` - React hooks (usePackageData, etc.)

---

## Example Implementation: audit_log Package

### 1. Lua Operations

**File:** `packages/audit_log/seed/scripts/db/create.lua`
```lua
---@param tenantId string
---@param userId string|nil
---@param action string
---@param entity string
---@param entityId string|nil
---@param changes table
---@return table
function M.createAuditLog(tenantId, userId, action, entity, entityId, changes)
  local db = require('db')

  return db.auditLog.create({
    data = {
      tenantId = tenantId,
      userId = userId,
      action = action,
      entity = entity,
      entityId = entityId,
      oldValue = changes.old and json.encode(changes.old) or nil,
      newValue = changes.new and json.encode(changes.new) or nil,
      timestamp = os.time() * 1000,
    }
  })
end
```

**File:** `packages/audit_log/seed/scripts/db/queries.lua`
```lua
---@param tenantId string
---@param filters table
---@return table[]
function M.listAuditLogs(tenantId, filters)
  local db = require('db')

  local where = { tenantId = tenantId }
  if filters.userId then where.userId = filters.userId end
  if filters.entity then where.entity = filters.entity end
  if filters.action then where.action = filters.action end

  return db.auditLog.findMany({
    where = where,
    orderBy = { timestamp = 'desc' },
    take = filters.limit or 50,
    skip = filters.offset or 0,
  })
end
```

### 2. Component Integration

**File:** `packages/audit_log/seed/components.json`
```json
[
  {
    "name": "AuditLogViewer",
    "type": "page",
    "props": {
      "tenantId": "string",
      "filters": "object"
    },
    "script": "ui/audit_log_viewer.lua"
  },
  {
    "name": "AuditLogTable",
    "type": "organism",
    "props": {
      "logs": "array",
      "onFilter": "function"
    },
    "script": "ui/audit_log_table.lua"
  }
]
```

---

## Next Steps

1. **Choose a package** to start with (I recommend `audit_log` or `notification_center`)
2. **Create Lua DB operations** in the package's `scripts/db/` folder
3. **Wire up components** to use the DB operations
4. **Test with real data** using the Prisma client
5. **Repeat** for other packages

Would you like me to:
- Implement the audit_log package wiring?
- Add the new schema models for gaming/GitHub/etc.?
- Create a template structure for package DB operations?
- All of the above?
