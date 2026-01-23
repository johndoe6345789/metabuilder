# Stream_Cast Workflows - Technical Issues Report

## Overview
This document provides technical details on each issue found in the stream_cast package workflows.

### Summary Table
| Workflow | Issue Count | Severity | Status |
|----------|-------------|----------|--------|
| scene-transition.json | 3 | 🔴 BLOCKING | Needs fixes |
| viewer-count-update.json | 4 | 🔴 BLOCKING | Needs fixes |
| stream-unsubscribe.json | 2 | 🔴 BLOCKING | Needs fixes |
| stream-subscribe.json | 2 | 🔴 BLOCKING | Needs fixes |
| **TOTAL** | **11** | **🔴** | **ALL BLOCKING** |

---

## Issue Details by Workflow

### 1. scene-transition.json

#### Issue 1.1: Missing Node Names (All 6 nodes)
- **Type**: Schema Violation
- **Severity**: CRITICAL
- **Nodes Affected**: validate_context, check_authorization, fetch_channel, update_active_scene, emit_scene_change, return_success
- **Required By**: n8n executor connection resolution

**Code Example**:
```json
{
  "id": "validate_context",
  "name": "Validate Context",  // ← MISSING
  "type": "metabuilder.validate",
  "typeVersion": 1,
  "position": [100, 100],
  "parameters": { ... }
}
```

**Fix**:
```json
{
  "id": "validate_context",
  "name": "Validate Context",  // ← ADD THIS
  "type": "metabuilder.validate",
  ...
}
```

---

#### Issue 1.2: Empty Connections Object
- **Type**: DAG Structure Missing
- **Severity**: CRITICAL
- **Current**: `"connections": {}`
- **Expected**: n8n adjacency map with flow definition

**Implied Execution Flow** (from node analysis):
```
validate_context 
  → check_authorization (conditional)
  → fetch_channel (parallel on success)
  → update_active_scene
  → emit_scene_change
  → return_success
```

**Fix Required**:
```json
{
  "connections": {
    "Validate Context": {
      "main": {
        "0": [
          {
            "node": "Check Authorization",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Check Authorization": {
      "main": {
        "0": [
          {
            "node": "Fetch Channel",
            "type": "main",
            "index": 0
          }
        ],
        "1": [  // Error path
          {
            "node": "Return Error",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Fetch Channel": {
      "main": {
        "0": [
          {
            "node": "Update Active Scene",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Update Active Scene": {
      "main": {
        "0": [
          {
            "node": "Emit Scene Change",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Emit Scene Change": {
      "main": {
        "0": [
          {
            "node": "Return Success",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  }
}
```

---

#### Issue 1.3: Tenant Filtering Vulnerability
- **Type**: Security - Data Isolation Vulnerability
- **Severity**: CRITICAL
- **Node**: check_authorization
- **Problem**: Authorization check only validates user level, not channel ownership

**Current Code**:
```json
{
  "id": "check_authorization",
  "name": "Check Authorization",
  "type": "metabuilder.condition",
  "parameters": {
    "condition": "{{ $context.user.level >= 2 }}"
  }
}
```

**Issue**: Checks if user is level 2+, but doesn't verify:
- User owns the channel
- Channel belongs to user's tenant
- Scene belongs to the channel

**Attack Scenario**:
1. User A (Tenant A) is level 2 manager
2. User A calls API with Tenant B's channelId
3. Authorization passes (user level check)
4. User A transitions scenes on Tenant B's channel
5. Tenant B's stream is disrupted

**Fix**:
```json
{
  "parameters": {
    "condition": "{{ $context.user.level >= 2 && $json.tenantId === $context.tenantId }}"
  }
}
```

Also ensure `fetch_channel` includes tenantId (✅ already does):
```json
{
  "filter": {
    "id": "{{ $json.channelId }}",
    "tenantId": "{{ $context.tenantId }}"  // ✅ Good
  }
}
```

---

### 2. viewer-count-update.json

#### Issue 2.1: Missing Node Names (All 3 nodes)
- **Type**: Schema Violation
- **Severity**: CRITICAL
- **Nodes Affected**: fetch_active_streams, update_viewer_counts, broadcast_counts
- **Fix**: Add `name` property to all nodes (same pattern as Issue 1.1)

---

#### Issue 2.2: Empty Connections Object
- **Type**: DAG Structure Missing
- **Severity**: CRITICAL
- **Fix**: Define execution flow (same pattern as Issue 1.2)

**Implied Execution Flow**:
```
fetch_active_streams
  → update_viewer_counts (parallel tasks)
    ├── count_viewers
    └── fetch_channel_stats
  → broadcast_counts
```

---

#### Issue 2.3: Missing TenantId Filter (DATA ISOLATION VULNERABILITY)
- **Type**: Security - Multi-Tenant Data Leak
- **Severity**: CRITICAL 🔴
- **Node**: fetch_active_streams
- **Problem**: Fetches streams without tenant filter

**Current Code**:
```json
{
  "id": "fetch_active_streams",
  "parameters": {
    "filter": {
      "isLive": true  // ← Missing tenantId!
    }
  }
}
```

**Issue**: This query returns ALL live streams from ALL tenants!

**Attack Scenario**:
1. Tenant A's viewer count update workflow runs
2. `fetch_active_streams` returns streams from Tenant A, B, C, D...
3. `update_viewer_counts` fetches viewer counts for ALL streams
4. `broadcast_counts` sends updates to ALL customer streams
5. Tenant A's clients receive Tenant B's viewer counts
6. Data isolation breach

**Fix**:
```json
{
  "id": "fetch_active_streams",
  "parameters": {
    "filter": {
      "isLive": true,
      "tenantId": "{{ $context.tenantId }}"  // ← ADD THIS
    }
  }
}
```

---

#### Issue 2.4: Unusual Operation Pattern (NON-STANDARD)
- **Type**: Custom Pattern - Needs Verification
- **Severity**: WARNING
- **Node**: update_viewer_counts
- **Issue**: Uses `"operation": "parallel"` with nested tasks

**Current Code**:
```json
{
  "id": "update_viewer_counts",
  "type": "metabuilder.operation",
  "parameters": {
    "operation": "parallel",
    "tasks": [
      {
        "id": "count_viewers",
        "op": "database_count",
        "entity": "StreamSubscription",
        "params": {
          "filter": {
            "channelId": "{{ $steps.fetch_active_streams.output.id }}"
          }
        }
      },
      {
        "id": "fetch_channel_stats",
        "op": "database_read",
        "entity": "StreamChannel",
        "params": {
          "filter": {
            "id": "{{ $steps.fetch_active_streams.output.id }}"
          }
        }
      }
    ]
  }
}
```

**Issues**:
1. `metabuilder.operation` type is non-standard
2. Nested tasks structure is custom (not n8n standard)
3. No clear error handling within parallel tasks
4. References to `$steps.fetch_active_streams.output.id` - will this work for multiple streams?

**Verification Needed**:
- [ ] Is `metabuilder.operation` registered in plugin registry?
- [ ] Does executor support `"operation": "parallel"`?
- [ ] How does iteration work for multiple streams?
- [ ] What does `output.id` return for multi-item results?

**Recommendation**: This needs careful review by MetaBuilder team. The pattern is unclear:
- If returning multiple streams, how do parallel tasks iterate?
- Should this use a different node type for batch operations?

---

### 3. stream-unsubscribe.json

#### Issue 3.1: Missing Node Names (All 3 nodes)
- **Type**: Schema Violation
- **Severity**: CRITICAL
- **Nodes Affected**: validate_context, delete_subscription, return_success
- **Fix**: Add `name` property (same pattern as Issue 1.1)

---

#### Issue 3.2: Empty Connections Object
- **Type**: DAG Structure Missing
- **Severity**: CRITICAL

**Implied Execution Flow**:
```
validate_context
  → delete_subscription
  → return_success
```

**Fix**: Define connections:
```json
{
  "connections": {
    "Validate Context": {
      "main": {
        "0": [
          {
            "node": "Delete Subscription",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Delete Subscription": {
      "main": {
        "0": [
          {
            "node": "Return Success",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  }
}
```

---

### 4. stream-subscribe.json

#### Issue 4.1: Missing Node Names (All 4 nodes)
- **Type**: Schema Violation
- **Severity**: CRITICAL
- **Nodes Affected**: validate_context, fetch_channel, create_subscription, setup_sse
- **Fix**: Add `name` property (same pattern as Issue 1.1)

---

#### Issue 4.2: Empty Connections Object
- **Type**: DAG Structure Missing
- **Severity**: CRITICAL

**Implied Execution Flow**:
```
validate_context
  → fetch_channel
  → create_subscription
  → setup_sse
```

**Fix**: Define connections:
```json
{
  "connections": {
    "Validate Context": {
      "main": {
        "0": [
          {
            "node": "Fetch Channel",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Fetch Channel": {
      "main": {
        "0": [
          {
            "node": "Create Subscription",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Create Subscription": {
      "main": {
        "0": [
          {
            "node": "Setup Sse",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  }
}
```

---

## Test Cases for Validation

### Test 1: Schema Validation
```bash
npm run validate:n8n-schema -- packages/stream_cast/workflow/*.json
```

Expected: All files pass schema validation

### Test 2: Node Property Completeness
```bash
# Check all nodes have required properties
npm run validate:required-properties -- packages/stream_cast/workflow/*.json
```

Expected: All nodes have id, name, type, typeVersion, position

### Test 3: Connection Validation
```bash
# Verify connections reference valid nodes
npm run validate:connection-targets -- packages/stream_cast/workflow/*.json
```

Expected: All referenced nodes exist in workflow

### Test 4: Multi-Tenant Validation
```bash
# Check all DB queries filter by tenantId
npm run validate:tenant-filtering -- packages/stream_cast/workflow/*.json
```

Expected: All database operations include tenantId filter

### Test 5: Executor Testing
```bash
# Test with Python executor
python -m workflow.executor.python.n8n_executor \
  --workflow packages/stream_cast/workflow/stream-subscribe.json \
  --tenant test-tenant \
  --context '{"user": {"id": "user1", "level": 2}, "tenantId": "test-tenant"}' \
  --input '{"channelId": "ch-123"}'

# Expected: Successful execution without errors
```

---

## Files Needing Updates

```
/packages/stream_cast/workflow/
├── scene-transition.json          (3 issues)
├── viewer-count-update.json       (4 issues)
├── stream-unsubscribe.json        (2 issues)
└── stream-subscribe.json          (2 issues)
```

## Estimated Fix Time

- Adding names to 18 nodes: 30 minutes
- Defining connections for 4 workflows: 40 minutes
- Fixing tenant filtering (2 workflows): 5 minutes
- **Total**: ~75 minutes = 1.25 hours

## Deployment Checklist

Before deploying to production:

- [ ] All missing `name` properties added
- [ ] All `connections` objects populated
- [ ] All tenant filtering vulnerabilities fixed
- [ ] Schema validation passes
- [ ] Connection validation passes
- [ ] Tenant filtering validation passes
- [ ] Executor tests pass
- [ ] Code review completed
- [ ] Re-audit completed
- [ ] Documentation updated

