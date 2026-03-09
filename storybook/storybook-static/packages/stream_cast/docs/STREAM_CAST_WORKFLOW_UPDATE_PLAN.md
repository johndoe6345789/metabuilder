# Stream Cast Workflow Update Plan

**Created**: 2026-01-22
**Package**: `stream_cast` (Live streaming control room)
**Scope**: Update 4 workflows to n8n compliance standard
**Status**: Ready for Implementation
**Overall Compliance Target**: 100/100

---

## Executive Summary

The `stream_cast` package contains 4 JSON workflow files that require standardization to match the n8n workflow specification. Current workflows are missing critical metadata fields (id, versionId, tenantId, active state tracking) and need structural enhancements for production deployment.

| Workflow | Current State | Target State | Priority |
|----------|---------------|--------------|----------|
| `stream-subscribe.json` | Partial (6 nodes) | Full compliance | HIGH |
| `stream-unsubscribe.json` | Partial (3 nodes) | Full compliance | HIGH |
| `scene-transition.json` | Partial (6 nodes) | Full compliance | HIGH |
| `viewer-count-update.json` | Partial (3 nodes) | Full compliance | HIGH |

---

## Current State Assessment

### Package Location
```
/Users/rmac/Documents/metabuilder/packages/stream_cast/
├── package.json (metadata with file inventory)
├── workflow/
│   ├── stream-subscribe.json        (19 active workflows tracking)
│   ├── stream-unsubscribe.json      (3 active workflows tracking)
│   ├── scene-transition.json        (6 active workflows tracking)
│   └── viewer-count-update.json     (3 active workflows tracking)
├── components/ui.json
├── page-config/page-config.json
├── permissions/roles.json
├── styles/tokens.json
└── tests/
```

### Current Structure (Baseline)

Each workflow currently has:
```json
{
  "name": "Workflow Name",
  "active": false,
  "nodes": [ ... ],
  "connections": {},
  "staticData": {},
  "meta": {},
  "settings": { ... }
}
```

**Missing Fields:**
- ❌ `id` - Unique workflow identifier
- ❌ `versionId` - Version tracking for optimistic locking
- ❌ `tenantId` - Multi-tenant safety
- ❌ `createdAt` - Workflow creation timestamp
- ❌ `updatedAt` - Last modification timestamp
- ❌ `tags` - Workflow categorization

---

## Workflow Specifications

### 1. Stream Subscribe Workflow

**File**: `/packages/stream_cast/workflow/stream-subscribe.json`
**Purpose**: Handle client subscription to live stream
**Current Node Count**: 4
**Execution Flow**: Linear (validation → fetch → create → setup)

#### Current Implementation
```json
{
  "name": "Subscribe to Stream",
  "active": false,
  "nodes": [
    {
      "id": "validate_context",
      "type": "metabuilder.validate",
      "parameters": { "input": "{{ $context.user.id }}", ... }
    },
    {
      "id": "fetch_channel",
      "type": "metabuilder.database",
      "parameters": { "entity": "StreamChannel", ... }
    },
    {
      "id": "create_subscription",
      "type": "metabuilder.database",
      "parameters": { "entity": "StreamSubscription", ... }
    },
    {
      "id": "setup_sse",
      "type": "metabuilder.action",
      "parameters": { "action": "sse_stream", ... }
    }
  ]
}
```

#### Required Changes
1. **Add Workflow-Level Metadata**
   - Unique `id`: `stream_cast_subscribe_001`
   - Version tracking: `versionId`
   - Timestamps: `createdAt`, `updatedAt`
   - Tags: `["streaming", "subscription", "realtime"]`

2. **Add Tenant Safety**
   - Ensure all database nodes filter by `tenantId`
   - Verify context includes tenant information
   - Document tenant isolation boundary

3. **Enhance Node Validation**
   - Add error handling for missing `channelId`
   - Add retry logic for database operations
   - Add timeout handling for SSE setup

#### Updated JSON Example
```json
{
  "id": "stream_cast_subscribe_001",
  "name": "Subscribe to Stream",
  "active": false,
  "versionId": "v1.0.0",
  "tenantId": "{{ $context.tenantId }}",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    "streaming",
    "subscription",
    "realtime",
    "user-action"
  ],
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "{{ $context.user.id }}",
        "operation": "validate",
        "validator": "required"
      }
    },
    {
      "id": "fetch_channel",
      "name": "Fetch Channel",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "filter": {
          "id": "{{ $json.channelId }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "operation": "database_read",
        "entity": "StreamChannel"
      }
    },
    {
      "id": "create_subscription",
      "name": "Create Subscription",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "data": {
          "channelId": "{{ $json.channelId }}",
          "userId": "{{ $context.user.id }}",
          "tenantId": "{{ $context.tenantId }}",
          "subscribedAt": "{{ new Date().toISOString() }}"
        },
        "operation": "database_create",
        "entity": "StreamSubscription"
      }
    },
    {
      "id": "setup_sse",
      "name": "Setup SSE Stream",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "action": "sse_stream",
        "channel": "{{ 'stream:' + $json.channelId }}",
        "onConnect": "{{ { subscriptionId: $steps.create_subscription.output.id } }}"
      }
    }
  ],
  "connections": {
    "validate_context": {
      "main": [[{ "node": "fetch_channel", "index": 0 }]]
    },
    "fetch_channel": {
      "main": [[{ "node": "create_subscription", "index": 0 }]]
    },
    "create_subscription": {
      "main": [[{ "node": "setup_sse", "index": 0 }]]
    }
  },
  "staticData": {},
  "meta": {
    "description": "Subscribe a user to a live stream and establish SSE connection",
    "author": "MetaBuilder Team",
    "domain": "streaming"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

---

### 2. Stream Unsubscribe Workflow

**File**: `/packages/stream_cast/workflow/stream-unsubscribe.json`
**Purpose**: Handle client unsubscription from stream
**Current Node Count**: 3
**Execution Flow**: Linear (validation → delete → respond)

#### Current Implementation
```json
{
  "name": "Unsubscribe from Stream",
  "active": false,
  "nodes": [
    { "id": "validate_context", ... },
    { "id": "delete_subscription", ... },
    { "id": "return_success", ... }
  ]
}
```

#### Required Changes
1. **Add Workflow-Level Metadata**
   - Unique `id`: `stream_cast_unsubscribe_001`
   - Version: `versionId`
   - Timestamps: `createdAt`, `updatedAt`
   - Tags: `["streaming", "subscription", "cleanup"]`

2. **Add Multi-Tenant Safety**
   - Verify delete operation filters by tenantId
   - Ensure user can only delete own subscriptions
   - Add authorization check

3. **Add Response Validation**
   - Confirm subscription was deleted
   - Return proper HTTP response
   - Handle edge case: subscription not found

#### Updated JSON Example
```json
{
  "id": "stream_cast_unsubscribe_001",
  "name": "Unsubscribe from Stream",
  "active": false,
  "versionId": "v1.0.0",
  "tenantId": "{{ $context.tenantId }}",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    "streaming",
    "subscription",
    "cleanup",
    "user-action"
  ],
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "{{ $context.user.id }}",
        "operation": "validate",
        "validator": "required"
      }
    },
    {
      "id": "delete_subscription",
      "name": "Delete Subscription",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "filter": {
          "channelId": "{{ $json.channelId }}",
          "userId": "{{ $context.user.id }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "operation": "database_delete",
        "entity": "StreamSubscription"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": {
          "message": "Unsubscribed successfully",
          "timestamp": "{{ new Date().toISOString() }}"
        }
      }
    }
  ],
  "connections": {
    "validate_context": {
      "main": [[{ "node": "delete_subscription", "index": 0 }]]
    },
    "delete_subscription": {
      "main": [[{ "node": "return_success", "index": 0 }]]
    }
  },
  "staticData": {},
  "meta": {
    "description": "Unsubscribe a user from a live stream",
    "author": "MetaBuilder Team",
    "domain": "streaming"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

---

### 3. Scene Transition Workflow

**File**: `/packages/stream_cast/workflow/scene-transition.json`
**Purpose**: Handle scene changes in active stream
**Current Node Count**: 6
**Execution Flow**: Branched (validate → authorize → fetch → update + emit → respond)

#### Current Implementation
```json
{
  "name": "Handle Scene Transition",
  "active": false,
  "nodes": [
    { "id": "validate_context", ... },
    { "id": "check_authorization", ... },
    { "id": "fetch_channel", ... },
    { "id": "update_active_scene", ... },
    { "id": "emit_scene_change", ... },
    { "id": "return_success", ... }
  ]
}
```

#### Required Changes
1. **Add Workflow-Level Metadata**
   - Unique `id`: `stream_cast_scene_transition_001`
   - Version: `versionId`
   - Timestamps: `createdAt`, `updatedAt`
   - Tags: `["streaming", "scenes", "moderator-action"]`

2. **Add Multi-Tenant Safety**
   - Filter all operations by tenantId
   - Verify authorization check includes tenantId
   - Ensure scoped broadcast to correct tenant

3. **Enhance Authorization**
   - Verify user has level >= 2 for scene management
   - Add ownership verification
   - Add audit logging for scene changes

4. **Add Event Broadcasting**
   - Emit event with proper channel scoping
   - Include change metadata (user, timestamp, etc.)
   - Broadcast only to subscribers

#### Updated JSON Example
```json
{
  "id": "stream_cast_scene_transition_001",
  "name": "Handle Scene Transition",
  "active": false,
  "versionId": "v1.0.0",
  "tenantId": "{{ $context.tenantId }}",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    "streaming",
    "scenes",
    "moderator-action",
    "privileged"
  ],
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "{{ $context.user.id }}",
        "operation": "validate",
        "validator": "required"
      }
    },
    {
      "id": "check_authorization",
      "name": "Check Authorization",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "condition": "{{ $context.user.level >= 2 && $context.tenantId }}",
        "operation": "condition"
      }
    },
    {
      "id": "fetch_channel",
      "name": "Fetch Channel",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "filter": {
          "id": "{{ $json.channelId }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "operation": "database_read",
        "entity": "StreamChannel"
      }
    },
    {
      "id": "update_active_scene",
      "name": "Update Active Scene",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "filter": {
          "id": "{{ $json.channelId }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "data": {
          "activeSceneId": "{{ $json.sceneId }}",
          "sceneChangedAt": "{{ new Date().toISOString() }}",
          "changedBy": "{{ $context.user.id }}"
        },
        "operation": "database_update",
        "entity": "StreamChannel"
      }
    },
    {
      "id": "emit_scene_change",
      "name": "Emit Scene Change Event",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "data": {
          "sceneId": "{{ $json.sceneId }}",
          "transitionTime": "{{ new Date().toISOString() }}",
          "changedBy": "{{ $context.user.id }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "action": "emit_event",
        "event": "scene_changed",
        "channel": "{{ 'stream:' + $json.channelId }}"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": {
          "message": "Scene updated successfully",
          "sceneId": "{{ $json.sceneId }}",
          "timestamp": "{{ new Date().toISOString() }}"
        }
      }
    }
  ],
  "connections": {
    "validate_context": {
      "main": [[{ "node": "check_authorization", "index": 0 }]]
    },
    "check_authorization": {
      "main": [[{ "node": "fetch_channel", "index": 0 }]]
    },
    "fetch_channel": {
      "main": [[{ "node": "update_active_scene", "index": 0 }]]
    },
    "update_active_scene": {
      "main": [[{ "node": "emit_scene_change", "index": 0 }]]
    },
    "emit_scene_change": {
      "main": [[{ "node": "return_success", "index": 0 }]]
    }
  },
  "staticData": {},
  "meta": {
    "description": "Handle scene transition during active stream with authorization and event broadcast",
    "author": "MetaBuilder Team",
    "domain": "streaming"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

---

### 4. Viewer Count Update Workflow

**File**: `/packages/stream_cast/workflow/viewer-count-update.json`
**Purpose**: Update and broadcast viewer count for active streams
**Current Node Count**: 3
**Execution Flow**: Sequential with parallel operations (fetch → parallel count → broadcast)

#### Current Implementation
```json
{
  "name": "Update Viewer Count",
  "active": false,
  "nodes": [
    { "id": "fetch_active_streams", ... },
    { "id": "update_viewer_counts", ... },
    { "id": "broadcast_counts", ... }
  ]
}
```

#### Required Changes
1. **Add Workflow-Level Metadata**
   - Unique `id`: `stream_cast_viewer_count_001`
   - Version: `versionId`
   - Timestamps: `createdAt`, `updatedAt`
   - Tags: `["streaming", "analytics", "scheduled"]`

2. **Add Multi-Tenant Safety**
   - Filter fetch by tenantId (if known)
   - Ensure counts are tenant-scoped
   - Verify broadcast respects tenant boundaries

3. **Fix Parallel Operation**
   - Correct references in parallel tasks
   - Ensure both tasks execute correctly
   - Handle results properly

4. **Add Performance Metrics**
   - Calculate live time accuracy
   - Track viewer count changes
   - Include timing information

#### Updated JSON Example
```json
{
  "id": "stream_cast_viewer_count_001",
  "name": "Update Viewer Count",
  "active": false,
  "versionId": "v1.0.0",
  "tenantId": "{{ $context.tenantId }}",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    "streaming",
    "analytics",
    "scheduled",
    "broadcast"
  ],
  "nodes": [
    {
      "id": "fetch_active_streams",
      "name": "Fetch Active Streams",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "filter": {
          "isLive": true,
          "tenantId": "{{ $context.tenantId }}"
        },
        "operation": "database_read",
        "entity": "StreamChannel"
      }
    },
    {
      "id": "update_viewer_counts",
      "name": "Update Viewer Counts",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "operation": "parallel",
        "tasks": [
          {
            "id": "count_viewers",
            "op": "database_count",
            "entity": "StreamSubscription",
            "params": {
              "filter": {
                "channelId": "{{ $steps.fetch_active_streams.output.id }}",
                "tenantId": "{{ $context.tenantId }}"
              }
            }
          },
          {
            "id": "fetch_channel_stats",
            "op": "database_read",
            "entity": "StreamChannel",
            "params": {
              "filter": {
                "id": "{{ $steps.fetch_active_streams.output.id }}",
                "tenantId": "{{ $context.tenantId }}"
              }
            }
          }
        ]
      }
    },
    {
      "id": "broadcast_counts",
      "name": "Broadcast Counts",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "data": {
          "viewerCount": "{{ $steps.update_viewer_counts.tasks.count_viewers.output }}",
          "liveTime": "{{ new Date() - new Date($steps.update_viewer_counts.tasks.fetch_channel_stats.output.startedAt) }}",
          "timestamp": "{{ new Date().toISOString() }}",
          "channelId": "{{ $steps.fetch_active_streams.output.id }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "action": "emit_event",
        "event": "viewer_count_updated",
        "channel": "{{ 'stream:' + $steps.fetch_active_streams.output.id }}"
      }
    }
  ],
  "connections": {
    "fetch_active_streams": {
      "main": [[{ "node": "update_viewer_counts", "index": 0 }]]
    },
    "update_viewer_counts": {
      "main": [[{ "node": "broadcast_counts", "index": 0 }]]
    }
  },
  "staticData": {},
  "meta": {
    "description": "Periodically fetch active streams and broadcast updated viewer counts",
    "author": "MetaBuilder Team",
    "domain": "streaming",
    "schedule": "*/5 * * * *"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

---

## Schema Compliance Framework

### N8N Workflow Schema Requirements

All workflows must comply with the n8n workflow specification. Key fields:

#### Workflow Level (Root)
```json
{
  "id": "string",                    // ✅ REQUIRED: Unique workflow identifier
  "name": "string",                  // ✅ REQUIRED: Human-readable name
  "active": "boolean",               // ✅ REQUIRED: Activation state
  "versionId": "string",             // ⚠️  RECOMMENDED: Version tracking
  "tenantId": "string",              // ⚠️  RECOMMENDED: Multi-tenant safety
  "createdAt": "string (ISO 8601)",  // ⚠️  RECOMMENDED: Creation timestamp
  "updatedAt": "string (ISO 8601)",  // ⚠️  RECOMMENDED: Update timestamp
  "tags": ["string"],                // ⚠️  OPTIONAL: Categorization tags
  "meta": "object",                  // ✅ REQUIRED: Metadata container
  "nodes": [                         // ✅ REQUIRED: Node array
    { "id", "name", "type", "typeVersion", "position", "parameters" }
  ],
  "connections": "object",           // ✅ REQUIRED: Connection adjacency map
  "staticData": "object",            // ⚠️  OPTIONAL: Static workflow data
  "settings": "object"               // ⚠️  OPTIONAL: Execution settings
}
```

#### Node Level
```json
{
  "id": "string",              // ✅ REQUIRED: Unique node id (snake_case)
  "name": "string",            // ✅ REQUIRED: Human-readable name
  "type": "string",            // ✅ REQUIRED: Node type identifier
  "typeVersion": "number",     // ✅ REQUIRED: Version (integer ≥ 1)
  "position": [number, number],// ✅ REQUIRED: Canvas position [x, y]
  "parameters": "object",      // ⚠️  OPTIONAL: Node parameters
  "disabled": "boolean",       // ⚠️  OPTIONAL: Disabled state
  "notes": "string"            // ⚠️  OPTIONAL: Documentation
}
```

#### Connection Format (N8N Adjacency Map)
```json
{
  "sourceNodeId": {
    "main": [
      [
        { "node": "targetNodeId", "index": 0 }
      ]
    ]
  }
}
```

---

## Validation Checklist

### Pre-Implementation Checklist

- [ ] All 4 workflow files identified and reviewed
- [ ] Current state documented with node counts
- [ ] N8N schema specification understood
- [ ] Multi-tenant filtering requirements understood
- [ ] Team approval obtained for changes

### Per-Workflow Implementation Checklist

#### Workflow ID & Versioning
- [ ] Assign unique `id` following pattern: `stream_cast_{workflow_name}_{version}`
- [ ] Set initial `versionId` to `v1.0.0`
- [ ] Add `createdAt` timestamp (current date)
- [ ] Add `updatedAt` timestamp (current date)
- [ ] Add descriptive `tags` array with domain tags

#### Multi-Tenant Safety
- [ ] Verify all database operations filter by `tenantId`
- [ ] Verify `tenantId` comes from `$context.tenantId`
- [ ] Verify broadcasts are tenant-scoped
- [ ] Verify no cross-tenant data leakage possible

#### Node Structure
- [ ] All nodes have unique `id` (snake_case)
- [ ] All nodes have descriptive `name` (Title Case)
- [ ] All nodes have `type` identifier
- [ ] All nodes have `typeVersion` (integer ≥ 1)
- [ ] All nodes have `position` array [x, y]
- [ ] Parameters are well-formed objects

#### Connection Graph
- [ ] Adjacency map uses correct format
- [ ] All target nodes exist in workflow
- [ ] No circular dependencies detected
- [ ] No dangling references
- [ ] Flow matches expected execution order

#### Metadata & Documentation
- [ ] `meta.description` explains workflow purpose
- [ ] `meta.author` set to "MetaBuilder Team"
- [ ] `meta.domain` set appropriately
- [ ] Tags accurately describe workflow
- [ ] Settings configured for production use

#### Error Handling
- [ ] Missing required fields produce meaningful errors
- [ ] Unauthorized operations are rejected
- [ ] Database failures handled gracefully
- [ ] Timeout settings reasonable (3600s)
- [ ] Error execution data saved for debugging

#### Test Coverage
- [ ] Happy path tested manually
- [ ] Error cases tested
- [ ] Multi-tenant boundaries verified
- [ ] Performance acceptable
- [ ] No console errors or warnings

### Final Validation

#### JSON Schema Validation
```bash
# Validate against n8n schema
npx ajv validate -s schemas/n8n-workflow.schema.json \
  packages/stream_cast/workflow/stream-subscribe.json

# Expected result: data is valid
```

#### TypeScript Compilation
```bash
npm run typecheck
# Expected: No errors in workflow type definitions
```

#### Linting
```bash
npm run lint
# Expected: No warnings in workflow files
```

#### Build Verification
```bash
npm run build
# Expected: Successful build with workflows included
```

---

## Required Changes Summary

### Change Matrix

| Aspect | Current | Target | Impact |
|--------|---------|--------|--------|
| **Workflow ID** | None | `stream_cast_{name}_{version}` | HIGH |
| **Version Tracking** | None | `versionId: v1.0.0` | MEDIUM |
| **Timestamps** | None | `createdAt`, `updatedAt` | MEDIUM |
| **Tenant Safety** | Partial | Full tenant filtering | HIGH |
| **Tags** | None | Domain-specific tags | LOW |
| **Meta** | Empty | Populated with description | MEDIUM |
| **Connections** | Implicit | Explicit adjacency map | HIGH |
| **Documentation** | Minimal | Comprehensive | LOW |

### File Structure After Update

```
packages/stream_cast/workflow/
├── stream-subscribe.json              [UPDATED]
│   ├── id: stream_cast_subscribe_001
│   ├── versionId: v1.0.0
│   ├── tenantId: {{ $context.tenantId }}
│   └── tags: ["streaming", "subscription", ...]
│
├── stream-unsubscribe.json            [UPDATED]
│   ├── id: stream_cast_unsubscribe_001
│   ├── versionId: v1.0.0
│   ├── tenantId: {{ $context.tenantId }}
│   └── tags: ["streaming", "subscription", ...]
│
├── scene-transition.json              [UPDATED]
│   ├── id: stream_cast_scene_transition_001
│   ├── versionId: v1.0.0
│   ├── tenantId: {{ $context.tenantId }}
│   └── tags: ["streaming", "scenes", ...]
│
└── viewer-count-update.json           [UPDATED]
    ├── id: stream_cast_viewer_count_001
    ├── versionId: v1.0.0
    ├── tenantId: {{ $context.tenantId }}
    └── tags: ["streaming", "analytics", ...]
```

---

## Implementation Steps

### Step 1: Backup Current State (Day 1)
```bash
# Create backup branch
git checkout -b backup/stream_cast_workflows_2026-01-22

# Backup all workflow files
cp packages/stream_cast/workflow/*.json backup/

# Push backup
git add backup/
git commit -m "backup: stream_cast workflows before n8n compliance update"
git push origin backup/stream_cast_workflows_2026-01-22
```

### Step 2: Update stream-subscribe.json (Day 1)
1. Add workflow-level metadata fields
2. Update node connections with explicit adjacency map
3. Add tenantId filtering to all database operations
4. Update meta documentation
5. Verify JSON validity

### Step 3: Update stream-unsubscribe.json (Day 1)
1. Add workflow-level metadata fields
2. Update node connections
3. Add tenantId filtering
4. Update meta documentation
5. Verify JSON validity

### Step 4: Update scene-transition.json (Day 2)
1. Add workflow-level metadata fields
2. Update node connections with branching
3. Enhance authorization check to include tenantId
4. Update all database filters
5. Verify JSON validity

### Step 5: Update viewer-count-update.json (Day 2)
1. Add workflow-level metadata fields
2. Fix parallel operation task references
3. Add tenantId filtering to all tasks
4. Update meta documentation
5. Verify JSON validity

### Step 6: Validate & Test (Day 2)
```bash
# Run validation against n8n schema
npm run validate:workflows

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build project
npm run build

# Run e2e tests
npm run test:e2e
```

### Step 7: Create Pull Request (Day 3)
```bash
# Create feature branch
git checkout -b feat/stream-cast-n8n-compliance

# Commit all changes
git add packages/stream_cast/workflow/
git commit -m "feat(stream_cast): update workflows to n8n compliance standard"

# Push and create PR
git push origin feat/stream-cast-n8n-compliance
```

---

## Rollback Plan

If issues arise during implementation:

### Immediate Rollback (< 1 hour)
```bash
# Restore from local backup
git checkout backup/stream_cast_workflows_2026-01-22 -- packages/stream_cast/workflow/

# Verify restoration
git diff packages/stream_cast/workflow/

# Discard feature branch
git branch -D feat/stream-cast-n8n-compliance
```

### Staged Rollback (> 1 hour)
```bash
# Revert specific workflow
git revert <commit-hash> -n

# Verify changes
git diff HEAD

# Commit revert
git commit -m "revert: rollback stream_cast workflow updates"
```

---

## Testing Strategy

### Unit Tests
- Validate JSON schema compliance
- Verify node structure integrity
- Check connection graph validity

### Integration Tests
- Test workflow execution flow
- Verify database operations
- Test SSE stream setup
- Verify event broadcasting

### Multi-Tenant Tests
- Verify tenantId filtering
- Test cross-tenant isolation
- Verify authorization boundaries

### Performance Tests
- Measure workflow execution time
- Check parallel operation performance
- Verify timeout handling

---

## Success Criteria

✅ **All 4 workflows updated to n8n standard**
- Compliance score: 100/100
- All required fields present
- All optional recommended fields included

✅ **Multi-tenant safety verified**
- All database operations filter by tenantId
- No cross-tenant data leakage possible
- Authorization checks properly scoped

✅ **Documentation complete**
- Workflow descriptions documented
- Tags accurately reflect purpose
- Meta information properly populated

✅ **Testing passed**
- JSON schema validation: PASS
- TypeScript compilation: PASS
- Linting: PASS
- Build: PASS
- E2E tests: PASS (99%+ coverage)

✅ **Code review approved**
- Technical review completed
- Security review passed
- Multi-tenant review confirmed
- Documentation review approved

---

## Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1: Exploration** | 1 day | Analysis complete, plan approved |
| **Phase 2: Subscribe/Unsubscribe** | 1 day | 2 workflows updated & tested |
| **Phase 3: Scene/Viewer** | 1 day | 2 workflows updated & tested |
| **Phase 4: Validation** | 0.5 day | All validation checks passed |
| **Phase 5: Review & Merge** | 0.5 day | PR approved & merged |
| **TOTAL** | 3.5 days | All workflows production-ready |

---

## References

### Internal Documentation
- `/docs/N8N_COMPLIANCE_AUDIT.md` - Compliance audit framework
- `/schemas/n8n-workflow.schema.json` - N8N workflow schema specification
- `/docs/CLAUDE.md` - Development guide (multi-tenant, JSON-first)
- `/docs/AGENTS.md` - Domain-specific rules

### Schema Files
- **Workflow Schema**: `/schemas/n8n-workflow.schema.json`
- **Validation Rules**: `/schemas/n8n-workflow-validation.schema.json`
- **Package Schema**: `/schemas/package-schemas/workflow.schema.json`

### Related Workflows (for reference)
- PackageRepo workflows: `/packagerepo/backend/workflows/`
- GameEngine workflows: `/gameengine/workflows/` (if any)

---

## Sign-Off

**Status**: Ready for Implementation
**Owner**: MetaBuilder Team
**Last Updated**: 2026-01-22
**Target Completion**: 2026-01-25

---

## Appendix A: Field Descriptions

### Workflow-Level Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | string | ✅ | - | Unique workflow identifier (e.g., `stream_cast_subscribe_001`) |
| `name` | string | ✅ | - | Human-readable workflow name |
| `active` | boolean | ✅ | false | Workflow activation state |
| `versionId` | string | ⚠️ | - | Version identifier for optimistic locking (e.g., `v1.0.0`) |
| `tenantId` | string | ⚠️ | - | Multi-tenant scoping (use `{{ $context.tenantId }}`) |
| `createdAt` | string | ⚠️ | - | ISO 8601 creation timestamp |
| `updatedAt` | string | ⚠️ | - | ISO 8601 last update timestamp |
| `tags` | array | ⚠️ | [] | Categorization tags (e.g., `["streaming", "realtime"]`) |
| `meta` | object | ✅ | {} | Metadata container (description, author, domain, etc.) |
| `nodes` | array | ✅ | - | Array of workflow nodes |
| `connections` | object | ✅ | {} | N8N-style adjacency map of connections |
| `staticData` | object | ⚠️ | {} | Static data for workflow execution |
| `settings` | object | ⚠️ | {} | Execution settings (timeout, error handling, etc.) |

### Node-Level Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | string | ✅ | - | Unique node identifier (snake_case) |
| `name` | string | ✅ | - | Human-readable node name |
| `type` | string | ✅ | - | Node type identifier (e.g., `metabuilder.database`) |
| `typeVersion` | number | ✅ | 1 | Node type version (integer ≥ 1) |
| `position` | array | ✅ | - | Canvas position [x, y] coordinates |
| `parameters` | object | ⚠️ | {} | Node-specific parameters |
| `disabled` | boolean | ⚠️ | false | Disabled state |
| `notes` | string | ⚠️ | - | Documentation notes |

---

## Appendix B: Example Workflow Commands

### Validation Command
```bash
npx ajv validate \
  --schema schemas/n8n-workflow.schema.json \
  --data packages/stream_cast/workflow/stream-subscribe.json
```

### Formatting Command
```bash
npx prettier --write packages/stream_cast/workflow/*.json
```

### Type Checking Command
```bash
npm run typecheck -- packages/stream_cast/workflow/
```

---

**Document Version**: 1.0
**Created**: 2026-01-22
**Status**: Ready for Implementation
**Next Review**: After implementation completion
