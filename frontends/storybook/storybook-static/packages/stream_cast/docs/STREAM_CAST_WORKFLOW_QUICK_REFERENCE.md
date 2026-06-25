# Stream Cast Workflow - Quick Reference Guide

**Purpose**: Fast lookup reference for stream_cast workflow updates
**Document Type**: Quick Reference (1-page)
**Audience**: Developers implementing the updates

---

## The 4 Workflows At a Glance

| Workflow | File | Nodes | Status | Update Scope |
|----------|------|-------|--------|--------------|
| **Subscribe** | `stream-subscribe.json` | 4 | Partial ❌ | Add id, versionId, tenantId, tags, connections |
| **Unsubscribe** | `stream-unsubscribe.json` | 3 | Partial ❌ | Add id, versionId, tenantId, tags, connections |
| **Scene Transition** | `scene-transition.json` | 6 | Partial ❌ | Add id, versionId, tenantId, tags, enhance auth |
| **Viewer Count** | `viewer-count-update.json` | 3 | Partial ❌ | Add id, versionId, tenantId, tags, fix parallel ops |

---

## Mandatory Fields (Add to ALL 4 Workflows)

```json
{
  "id": "stream_cast_{workflow_name}_{version}",
  "versionId": "v1.0.0",
  "tenantId": "{{ $context.tenantId }}",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    "streaming",
    "category_from_name",
    "other_relevant_tag"
  ]
}
```

---

## Workflow-Specific IDs

```
stream_cast_subscribe_001
stream_cast_unsubscribe_001
stream_cast_scene_transition_001
stream_cast_viewer_count_001
```

---

## Workflow-Specific Tags

**Subscribe/Unsubscribe**:
```json
["streaming", "subscription", "realtime", "user-action"]
```

**Scene Transition**:
```json
["streaming", "scenes", "moderator-action", "privileged"]
```

**Viewer Count**:
```json
["streaming", "analytics", "scheduled", "broadcast"]
```

---

## Connection Format (Copy & Paste)

### 4-Node Linear Flow (Subscribe)
```json
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
}
```

### 3-Node Linear Flow (Unsubscribe)
```json
"connections": {
  "validate_context": {
    "main": [[{ "node": "delete_subscription", "index": 0 }]]
  },
  "delete_subscription": {
    "main": [[{ "node": "return_success", "index": 0 }]]
  }
}
```

### 6-Node Linear Flow (Scene Transition)
```json
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
}
```

### 3-Node Linear Flow (Viewer Count)
```json
"connections": {
  "fetch_active_streams": {
    "main": [[{ "node": "update_viewer_counts", "index": 0 }]]
  },
  "update_viewer_counts": {
    "main": [[{ "node": "broadcast_counts", "index": 0 }]]
  }
}
```

---

## Critical Multi-Tenant Checks

### For ALL Database Operations

**BEFORE** (❌ Missing tenantId):
```json
"filter": {
  "id": "{{ $json.channelId }}"
}
```

**AFTER** (✅ With tenantId):
```json
"filter": {
  "id": "{{ $json.channelId }}",
  "tenantId": "{{ $context.tenantId }}"
}
```

### All 4 Workflows Must Have:
- [ ] `fetch_channel` filters by tenantId ✅
- [ ] `delete_subscription` filters by tenantId ✅
- [ ] `create_subscription` includes tenantId ✅
- [ ] `update_active_scene` filters by tenantId ✅
- [ ] `fetch_active_streams` filters by tenantId ✅
- [ ] All parallel tasks filter by tenantId ✅

---

## Meta Field Template

```json
"meta": {
  "description": "One sentence explaining what this workflow does",
  "author": "MetaBuilder Team",
  "domain": "streaming"
}
```

### Per-Workflow Descriptions

**Subscribe**:
```json
"description": "Subscribe a user to a live stream and establish SSE connection"
```

**Unsubscribe**:
```json
"description": "Unsubscribe a user from a live stream"
```

**Scene Transition**:
```json
"description": "Handle scene transition during active stream with authorization and event broadcast"
```

**Viewer Count**:
```json
"description": "Periodically fetch active streams and broadcast updated viewer counts"
```

---

## Validation Checklist

For EACH workflow before commit:

### Required Fields Present
- [ ] `id` field added
- [ ] `versionId` field added
- [ ] `tenantId` field added
- [ ] `createdAt` field added
- [ ] `updatedAt` field added
- [ ] `tags` array added
- [ ] `meta` object populated
- [ ] `connections` properly mapped

### Multi-Tenant Safety
- [ ] All DB filters include tenantId
- [ ] No cross-tenant data possible
- [ ] Auth checks scoped to tenant

### JSON Validity
- [ ] Valid JSON (no syntax errors)
- [ ] All node IDs exist
- [ ] All references resolve
- [ ] No circular connections

### Testing
- [ ] Manual execution tested
- [ ] Schema validation passes
- [ ] TypeScript check passes
- [ ] Lint check passes

---

## File Locations

```
packages/stream_cast/workflow/
├── stream-subscribe.json              ← UPDATE THIS
├── stream-unsubscribe.json            ← UPDATE THIS
├── scene-transition.json              ← UPDATE THIS
└── viewer-count-update.json           ← UPDATE THIS
```

---

## Commands to Use

```bash
# Validate JSON schema
npx ajv validate -s schemas/n8n-workflow.schema.json \
  packages/stream_cast/workflow/stream-subscribe.json

# Format all workflow files
npx prettier --write packages/stream_cast/workflow/*.json

# Type check
npm run typecheck

# Build
npm run build

# Test
npm run test:e2e
```

---

## Common Mistakes to Avoid

| Mistake | Fix |
|---------|-----|
| `tenantId` missing from filters | Add `"tenantId": "{{ $context.tenantId }}"` to ALL filter objects |
| `connections` object empty | Copy connection template and fill in actual node IDs |
| Node ID references wrong | Double-check spelling and case sensitivity |
| Missing `id` field | Use pattern: `stream_cast_{workflow_name}_001` |
| `meta` object incomplete | Include description, author, and domain |
| Timestamps formatted wrong | Use ISO 8601: `2026-01-22T00:00:00Z` |

---

## Before/After Example

### BEFORE (Incomplete)
```json
{
  "name": "Subscribe to Stream",
  "active": false,
  "nodes": [ ... ],
  "connections": {},
  "staticData": {},
  "meta": {},
  "settings": { ... }
}
```

### AFTER (Compliant)
```json
{
  "id": "stream_cast_subscribe_001",
  "name": "Subscribe to Stream",
  "active": false,
  "versionId": "v1.0.0",
  "tenantId": "{{ $context.tenantId }}",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": ["streaming", "subscription", "realtime", "user-action"],
  "nodes": [ ... ],
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
  "settings": { ... }
}
```

---

## Success Criteria

✅ All 4 workflows have `id`, `versionId`, `tenantId`, `createdAt`, `updatedAt`, `tags`
✅ All database operations filter by `tenantId`
✅ All `connections` objects populated with proper node mapping
✅ All `meta` objects have description, author, domain
✅ JSON validation passes for all 4 files
✅ TypeScript check passes
✅ Build succeeds
✅ E2E tests pass (99%+ coverage)

---

**Quick Reference Version**: 1.0
**Created**: 2026-01-22
**Related Full Plan**: [STREAM_CAST_WORKFLOW_UPDATE_PLAN.md](./STREAM_CAST_WORKFLOW_UPDATE_PLAN.md)
