# Stream Cast Workflow - Technical Deep Dive

**Purpose**: Comprehensive technical specifications for workflow implementation
**Audience**: Senior developers, architects, code reviewers
**Level**: Advanced

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Complete Workflow Specifications](#complete-workflow-specifications)
3. [Multi-Tenant Implementation Details](#multi-tenant-implementation-details)
4. [Connection Graph Analysis](#connection-graph-analysis)
5. [Node Type Registry](#node-type-registry)
6. [Parameter Specifications](#parameter-specifications)
7. [Edge Cases & Error Handling](#edge-cases--error-handling)
8. [Performance Considerations](#performance-considerations)

---

## Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Stream Cast Workflows                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐   ┌──────────────────┐                     │
│  │ Stream Subscribe │   │ Stream Unsubscribe│                     │
│  │  (4 nodes)       │   │   (3 nodes)      │                     │
│  └────────┬─────────┘   └────────┬─────────┘                     │
│           │                      │                               │
│           └──────────────────────┘                               │
│                  ↓                                                │
│         ┌────────────────────┐                                   │
│         │ User Subscriptions │                                   │
│         │   (Database)       │                                   │
│         └────────────────────┘                                   │
│                  ↑                                                │
│           ┌──────┴─────┐                                          │
│           │             │                                         │
│     ┌─────▼──────┐ ┌───▼─────────┐                               │
│     │Scene Change│ │Viewer Count  │                              │
│     │   (6 nodes)│ │  (3 nodes)   │                              │
│     └────────────┘ └──────────────┘                              │
│                                                                   │
│  Public Events (Real-time Updates via Event Bus):                │
│  - scene_changed → Broadcasted to subscribers                    │
│  - viewer_count_updated → Broadcasted to subscribers             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Client Request
     ↓
┌────────────────────────────────────┐
│  Validation                        │
│  - Context (user, tenant)          │
│  - Required fields (channelId)     │
└────────┬───────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  Authorization (if needed)         │
│  - User level >= 2 for scenes      │
│  - Tenant scope verification       │
└────────┬───────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  Database Operations               │
│  - Fetch channel/subscription      │
│  - Create/update/delete records    │
│  - All filtered by tenantId        │
└────────┬───────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  Event Broadcasting                │
│  - Emit to WebSocket channel       │
│  - Tenant-scoped event stream      │
└────────┬───────────────────────────┘
         ↓
Client Response (HTTP + Real-time Updates)
```

---

## Complete Workflow Specifications

### Workflow 1: Stream Subscribe

#### Full JSON with All Fields

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
    "user-action",
    "websocket"
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
      },
      "notes": "Ensures user context is available and valid"
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
      },
      "notes": "Verify channel exists and is accessible in tenant context"
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
      },
      "notes": "Create subscription record with tenant isolation"
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
        "onConnect": "{{ { subscriptionId: $steps.create_subscription.output.id, userId: $context.user.id } }}"
      },
      "notes": "Establish Server-Sent Events connection for real-time updates"
    }
  ],
  "connections": {
    "validate_context": {
      "main": [
        [
          {
            "node": "fetch_channel",
            "index": 0
          }
        ]
      ]
    },
    "fetch_channel": {
      "main": [
        [
          {
            "node": "create_subscription",
            "index": 0
          }
        ]
      ]
    },
    "create_subscription": {
      "main": [
        [
          {
            "node": "setup_sse",
            "index": 0
          }
        ]
      ]
    }
  },
  "staticData": {
    "subscriptionTimeout": 86400000,
    "maxSubscriptionsPerUser": 100,
    "reconnectInterval": 5000
  },
  "meta": {
    "description": "Subscribe a user to a live stream and establish SSE connection for real-time updates",
    "author": "MetaBuilder Team",
    "domain": "streaming",
    "triggers": ["POST /api/v1/{tenant}/stream_cast/subscribe"],
    "inputs": {
      "channelId": "UUID of the stream channel to subscribe to"
    },
    "outputs": {
      "subscriptionId": "Unique ID of the subscription",
      "sse_connection": "Server-Sent Events stream for updates"
    }
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "errorHandler": "throw"
  }
}
```

#### Key Implementation Points

**Context Validation** (Node 1):
- Ensures `$context.user.id` is present
- Fails fast if user not authenticated
- Required for all subsequent operations

**Channel Fetch** (Node 2):
- Verifies channel exists: `"id": "{{ $json.channelId }}"`
- **Critical**: Includes tenant filter: `"tenantId": "{{ $context.tenantId }}"`
- Prevents cross-tenant data access
- Returns channel metadata for SSE setup

**Subscription Creation** (Node 3):
- Records user subscription in database
- **Critical**: Includes `tenantId` in data payload
- Timestamps subscription: `subscribedAt: ISO-8601`
- Enables viewer count tracking
- Returns `subscriptionId` for SSE connection

**SSE Stream Setup** (Node 4):
- Establishes WebSocket connection
- Channel: `stream:{channelId}` for isolation
- Passes subscription metadata for server tracking
- Client receives real-time updates (scenes, viewer counts)

---

### Workflow 2: Stream Unsubscribe

#### Full JSON with All Fields

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
      },
      "notes": "Verify user is authenticated"
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
      },
      "notes": "Remove subscription with triple-key filter: channel + user + tenant"
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
          "ok": true,
          "message": "Unsubscribed successfully",
          "timestamp": "{{ new Date().toISOString() }}"
        }
      },
      "notes": "Return success response to client"
    }
  ],
  "connections": {
    "validate_context": {
      "main": [
        [
          {
            "node": "delete_subscription",
            "index": 0
          }
        ]
      ]
    },
    "delete_subscription": {
      "main": [
        [
          {
            "node": "return_success",
            "index": 0
          }
        ]
      ]
    }
  },
  "staticData": {},
  "meta": {
    "description": "Unsubscribe a user from a live stream and close real-time connection",
    "author": "MetaBuilder Team",
    "domain": "streaming",
    "triggers": ["POST /api/v1/{tenant}/stream_cast/unsubscribe"],
    "inputs": {
      "channelId": "UUID of the stream channel to unsubscribe from"
    },
    "outputs": {
      "ok": "Boolean indicating success",
      "timestamp": "When unsubscription occurred"
    }
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "errorHandler": "throw"
  }
}
```

#### Key Implementation Points

**Triple-Key Delete Filter** (Node 2):
```json
"filter": {
  "channelId": "{{ $json.channelId }}",
  "userId": "{{ $context.user.id }}",
  "tenantId": "{{ $context.tenantId }}"
}
```
- Ensures user can only delete own subscriptions
- Prevents cross-user access
- **Critical**: Tenant filter prevents cross-tenant deletion
- Database constraint: unique(channelId, userId, tenantId)

---

### Workflow 3: Scene Transition

#### Full JSON with All Fields

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
    "privileged",
    "broadcast"
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
      },
      "notes": "Verify user is authenticated"
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
      },
      "notes": "Only users with level >= 2 can change scenes. Must be in tenant context."
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
      },
      "notes": "Verify channel exists and belongs to tenant"
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
      },
      "notes": "Update channel with new active scene. Records who made the change."
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
          "channelId": "{{ $json.channelId }}",
          "transitionTime": "{{ new Date().toISOString() }}",
          "changedBy": "{{ $context.user.id }}",
          "changedByName": "{{ $context.user.name }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "action": "emit_event",
        "event": "scene_changed",
        "channel": "{{ 'stream:' + $json.channelId }}"
      },
      "notes": "Broadcast scene change to all subscribers via WebSocket"
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
          "ok": true,
          "message": "Scene updated successfully",
          "sceneId": "{{ $json.sceneId }}",
          "timestamp": "{{ new Date().toISOString() }}"
        }
      },
      "notes": "Return success response to client"
    }
  ],
  "connections": {
    "validate_context": {
      "main": [
        [
          {
            "node": "check_authorization",
            "index": 0
          }
        ]
      ]
    },
    "check_authorization": {
      "main": [
        [
          {
            "node": "fetch_channel",
            "index": 0
          }
        ]
      ]
    },
    "fetch_channel": {
      "main": [
        [
          {
            "node": "update_active_scene",
            "index": 0
          }
        ]
      ]
    },
    "update_active_scene": {
      "main": [
        [
          {
            "node": "emit_scene_change",
            "index": 0
          }
        ]
      ]
    },
    "emit_scene_change": {
      "main": [
        [
          {
            "node": "return_success",
            "index": 0
          }
        ]
      ]
    }
  },
  "staticData": {},
  "meta": {
    "description": "Handle scene transition during active stream with authorization and event broadcast to all subscribers",
    "author": "MetaBuilder Team",
    "domain": "streaming",
    "triggers": ["POST /api/v1/{tenant}/stream_cast/scenes/{channelId}/transition"],
    "inputs": {
      "channelId": "UUID of the stream channel",
      "sceneId": "UUID of the scene to activate"
    },
    "outputs": {
      "ok": "Boolean indicating success",
      "sceneId": "The new active scene ID",
      "timestamp": "When transition occurred"
    },
    "permissions": {
      "required": "stream_cast:scenes:manage",
      "minimumUserLevel": 2
    }
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "errorHandler": "throw"
  }
}
```

#### Key Implementation Points

**Authorization Check** (Node 2):
```json
"condition": "{{ $context.user.level >= 2 && $context.tenantId }}"
```
- Level >= 2: Moderator or higher
- Tenant context: Must be in valid tenant
- Prevents unauthorized scene changes

**Audit Trail** (Node 4):
```json
"changedBy": "{{ $context.user.id }}"
```
- Records who made scene change
- Supports audit logging
- Useful for moderation review

**Event Broadcast** (Node 5):
```json
"channel": "{{ 'stream:' + $json.channelId }}"
```
- Broadcasts to all subscribers of channel
- Real-time scene updates
- Uses WebSocket for low-latency delivery

---

### Workflow 4: Viewer Count Update

#### Full JSON with All Fields

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
    "broadcast",
    "metrics"
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
        "entity": "StreamChannel",
        "limit": 1000
      },
      "notes": "Get all active streams for this tenant"
    },
    {
      "id": "update_viewer_counts",
      "name": "Update Viewer Counts (Parallel)",
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
      },
      "notes": "Parallel execution: count subscribers + fetch channel stats"
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
      },
      "notes": "Broadcast viewer count update to all subscribers"
    }
  ],
  "connections": {
    "fetch_active_streams": {
      "main": [
        [
          {
            "node": "update_viewer_counts",
            "index": 0
          }
        ]
      ]
    },
    "update_viewer_counts": {
      "main": [
        [
          {
            "node": "broadcast_counts",
            "index": 0
          }
        ]
      ]
    }
  },
  "staticData": {
    "updateInterval": 5000,
    "maxChannels": 1000
  },
  "meta": {
    "description": "Periodically fetch active streams and broadcast updated viewer counts to subscribers",
    "author": "MetaBuilder Team",
    "domain": "streaming",
    "schedule": "*/5 * * * *",
    "triggers": [
      "SCHEDULED:every_5_seconds",
      "POST /api/v1/{tenant}/stream_cast/update-counts"
    ],
    "inputs": {
      "optional": "Can be triggered via API or scheduled"
    },
    "outputs": {
      "viewerCount": "Updated count of active subscribers",
      "liveTime": "How long the stream has been live",
      "timestamp": "When the update occurred"
    }
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "errorHandler": "log"
  }
}
```

#### Key Implementation Points

**Fetch Active Streams** (Node 1):
```json
"filter": {
  "isLive": true,
  "tenantId": "{{ $context.tenantId }}"
}
```
- Only streams that are currently live
- **Critical**: Filtered by tenantId
- Limits to 1000 streams per tenant

**Parallel Operations** (Node 2):
- Count viewers: `database_count` against StreamSubscription
- Fetch stats: `database_read` to get live timing info
- Both operations use same tenantId filter
- Results: `$steps.update_viewer_counts.tasks.{count_viewers|fetch_channel_stats}.output`

**Broadcast Event** (Node 3):
- Emits `viewer_count_updated` event
- Channel: `stream:{channelId}` for isolation
- Includes metrics for client display
- Scheduled every 5 seconds (configurable)

---

## Multi-Tenant Implementation Details

### Tenant Safety Matrix

| Workflow | Context | Filter Operations | Broadcast Scope |
|----------|---------|-------------------|-----------------|
| **Subscribe** | fetch_channel | ✅ tenantId | stream:{channelId} |
| | create_subscription | ✅ tenantId | SSE channel |
| **Unsubscribe** | delete_subscription | ✅ tenantId + userId | HTTP response |
| **Scene** | check_authorization | ✅ tenantId check | stream:{channelId} |
| | fetch_channel | ✅ tenantId | emit_event |
| | update_active_scene | ✅ tenantId | emit_event |
| **Viewer Count** | fetch_active_streams | ✅ tenantId | stream:{channelId} |
| | parallel tasks | ✅ tenantId | emit_event |

### Tenant Filter Pattern

**All Database Operations MUST Follow**:
```json
"filter": {
  "primaryKey": "{{ $json.id }}",
  "tenantId": "{{ $context.tenantId }}"
}
```

**Never**:
```json
"filter": {
  "primaryKey": "{{ $json.id }}"
}
```

### Example: Subscribe Workflow Multi-Tenant Flow

```
┌─────────────────────────────────────────────────┐
│ Request: POST /api/v1/acme/stream_cast/subscribe│
│ Context: { tenantId: "acme", user: {...} }     │
└────────────────┬────────────────────────────────┘
                 ↓
        ┌────────────────────┐
        │ Node 1: Validate   │
        │ $context.user.id   │ ✅ acme tenant context
        └────────┬───────────┘
                 ↓
        ┌────────────────────────────────┐
        │ Node 2: Fetch Channel          │
        │ Filter:                        │
        │ - id: $json.channelId          │
        │ - tenantId: "acme" ← CRITICAL! │
        └────────┬───────────────────────┘
                 ↓
        ┌────────────────────────────────┐
        │ Node 3: Create Subscription    │
        │ Data:                          │
        │ - channelId: ...               │
        │ - userId: ...                  │
        │ - tenantId: "acme" ← CRITICAL! │
        └────────┬───────────────────────┘
                 ↓
        ┌────────────────────────────────┐
        │ Node 4: Setup SSE              │
        │ Channel: "stream:{channelId}"  │
        │ Scoped to acme tenant          │
        └────────┬───────────────────────┘
                 ↓
        Client Connected to: stream:{channelId}
        Receives only acme tenant events
```

---

## Connection Graph Analysis

### Subscribe Workflow Graph

```
┌─────────────────┐
│ validate_context│
└────────┬────────┘
         │ main[0]
         ↓
┌─────────────────┐
│  fetch_channel  │
└────────┬────────┘
         │ main[0]
         ↓
┌──────────────────────┐
│ create_subscription  │
└────────┬─────────────┘
         │ main[0]
         ↓
┌──────────────────┐
│   setup_sse      │
└──────────────────┘
```

**Adjacency Map Structure**:
```json
"connections": {
  "sourceNode": {
    "main": [
      [{ "node": "targetNode", "index": 0 }]
    ]
  }
}
```

**DAG Verification**:
- ✅ No cycles detected
- ✅ All targets exist
- ✅ Linear execution path
- ✅ Single exit point (setup_sse)

### Scene Transition Workflow Graph

```
┌─────────────────┐
│ validate_context│
└────────┬────────┘
         │
         ↓
┌────────────────────┐
│check_authorization │
└────────┬───────────┘
         │
         ↓
┌─────────────────┐
│  fetch_channel  │
└────────┬────────┘
         │
         ↓
┌────────────────────────┐
│ update_active_scene    │
└────────┬───────────────┘
         │
         ↓
┌────────────────────────┐
│ emit_scene_change      │
└────────┬───────────────┘
         │
         ↓
┌─────────────────┐
│ return_success  │
└─────────────────┘
```

**DAG Verification**:
- ✅ Linear chain (6 nodes)
- ✅ No branching or loops
- ✅ All connections valid
- ✅ Single execution path

---

## Node Type Registry

### Supported Node Types

| Node Type | Version | Purpose | Example |
|-----------|---------|---------|---------|
| `metabuilder.validate` | 1 | Input validation | Validate required fields |
| `metabuilder.database` | 1 | CRUD operations | Fetch, create, update, delete |
| `metabuilder.condition` | 1 | Conditional logic | Authorization checks |
| `metabuilder.action` | 1 | Side effects | HTTP response, emit events |
| `metabuilder.operation` | 1 | Batch operations | Parallel execution |

### Node Type Specifications

#### metabuilder.validate (v1)

```json
{
  "type": "metabuilder.validate",
  "typeVersion": 1,
  "parameters": {
    "input": "{{ expression }}",
    "operation": "validate",
    "validator": "required|email|uuid|...",
    "errorMessage": "optional custom error"
  }
}
```

#### metabuilder.database (v1)

```json
{
  "type": "metabuilder.database",
  "typeVersion": 1,
  "parameters": {
    "operation": "database_read|database_create|database_update|database_delete|database_count",
    "entity": "EntityName",
    "filter": { "field": "value" },
    "data": { "field": "value" },
    "limit": 1000,
    "skip": 0
  }
}
```

#### metabuilder.condition (v1)

```json
{
  "type": "metabuilder.condition",
  "typeVersion": 1,
  "parameters": {
    "condition": "{{ boolean expression }}",
    "operation": "condition"
  }
}
```

#### metabuilder.action (v1)

```json
{
  "type": "metabuilder.action",
  "typeVersion": 1,
  "parameters": {
    "action": "http_response|sse_stream|emit_event|log|...",
    "status": 200,
    "body": { "key": "value" },
    "data": { "key": "value" },
    "event": "event_name",
    "channel": "channel_name"
  }
}
```

#### metabuilder.operation (v1)

```json
{
  "type": "metabuilder.operation",
  "typeVersion": 1,
  "parameters": {
    "operation": "parallel|sequential|conditional",
    "tasks": [
      {
        "id": "task1",
        "op": "database_count",
        "entity": "Entity",
        "params": {}
      }
    ]
  }
}
```

---

## Parameter Specifications

### Context Object (Always Available)

```typescript
$context: {
  tenantId: string          // Tenant identifier
  user: {
    id: string              // User ID
    name: string            // User name
    level: number           // 0=guest, 1=user, 2=moderator, 3=admin
    email: string           // User email
    roles: string[]         // User roles
    scopes: string[]        // OAuth scopes
  }
  request: {
    method: string          // HTTP method
    headers: object         // Request headers
    path: string            // Request path
  }
}
```

### JSON Object (Request Payload)

```typescript
$json: {
  channelId?: string        // Stream channel ID (if in body)
  sceneId?: string          // Scene ID (if in body)
  [key: string]: any        // Other request data
}
```

### Steps Object (Previous Node Outputs)

```typescript
$steps: {
  [nodeId: string]: {
    output: any            // Node output
    output_index: number   // Output index
  }
}
```

---

## Edge Cases & Error Handling

### Scenario: User Not Authenticated

**Trigger**: `$context.user.id` is undefined
**Node**: validate_context
**Behavior**: Validation fails, error thrown
**Response**: 401 Unauthorized

```json
{
  "error": "User authentication required",
  "code": "AUTH_REQUIRED"
}
```

### Scenario: Channel Not Found

**Trigger**: Channel with given ID doesn't exist
**Node**: fetch_channel
**Behavior**: Query returns null
**Response**: 404 Not Found

```json
{
  "error": "Channel not found",
  "code": "CHANNEL_NOT_FOUND"
}
```

### Scenario: User Not Authorized for Scene Change

**Trigger**: `$context.user.level < 2`
**Node**: check_authorization
**Behavior**: Condition fails, authorization denied
**Response**: 403 Forbidden

```json
{
  "error": "Insufficient permissions to change scenes",
  "code": "AUTH_INSUFFICIENT_LEVEL",
  "requiredLevel": 2,
  "userLevel": 1
}
```

### Scenario: Cross-Tenant Access Attempt

**Trigger**: User from tenant A tries to access channel in tenant B
**Node**: fetch_channel (tenantId mismatch)
**Behavior**: Query returns null (filtered out)
**Response**: 404 Not Found (indistinguishable from non-existent)

```json
{
  "error": "Channel not found",
  "code": "CHANNEL_NOT_FOUND"
}
```

**Benefit**: Attackers can't enumerate channels in other tenants

### Scenario: Parallel Operation Partial Failure

**Trigger**: One task in parallel operation fails
**Node**: update_viewer_counts
**Behavior**: Dependent on error handler (throw or log)
**Response**: 500 Internal Server Error or success with partial data

---

## Performance Considerations

### Execution Time Estimates

| Workflow | Network | Database | Event | Total |
|----------|---------|----------|-------|-------|
| **Subscribe** | 10ms | 50ms | 20ms | ~80ms |
| **Unsubscribe** | 10ms | 50ms | - | ~60ms |
| **Scene** | 10ms | 100ms | 20ms | ~130ms |
| **Viewer Count** | 10ms | 200ms (parallel) | 20ms | ~230ms |

### Optimization Strategies

#### 1. Parallel Operations
```json
"operation": "parallel",
"tasks": [
  { "id": "count", "op": "database_count", ... },
  { "id": "stats", "op": "database_read", ... }
]
```
- Reduces sequential overhead
- Both DB operations run simultaneously
- Effective for viewer count workflow

#### 2. Caching
- Cache channel metadata for frequently accessed streams
- Cache user roles/levels
- Cache subscription counts (update periodically)

#### 3. Batch Operations
- Combine multiple subscriptions into single DB operation
- Reduces network round trips
- Improves throughput for bulk operations

#### 4. Connection Pooling
- Database connection pool: 10-20 connections
- WebSocket connection pool: 1000+ concurrent
- Reuse connections across workflow executions

### Database Indexes

**Essential Indexes for Multi-Tenant Safety**:
```sql
-- Stream subscriptions
CREATE INDEX idx_stream_subscription_channel_tenant
  ON StreamSubscription(channelId, tenantId);

CREATE INDEX idx_stream_subscription_user_tenant
  ON StreamSubscription(userId, tenantId);

CREATE INDEX idx_stream_subscription_unique
  ON StreamSubscription(channelId, userId, tenantId);

-- Stream channels
CREATE INDEX idx_stream_channel_tenant
  ON StreamChannel(tenantId, isLive);
```

---

**Technical Specifications Document Version**: 1.0
**Created**: 2026-01-22
**Audience**: Senior developers, architects
**Next Update**: Post-implementation review
