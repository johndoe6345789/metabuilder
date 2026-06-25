# IRC Webchat - Schema Update Matrix

**Quick reference for all required field updates across 4 workflows.**

---

## Field Update Summary

| Field | Current | Required | All 4 Workflows | Notes |
|-------|---------|----------|-----------------|-------|
| `id` | ❌ Missing | ✅ UUID string | Same pattern | `wf_irc_{name}_{random}` |
| `versionId` | ❌ Missing | ✅ Semantic version | `v1.0.0` | For all workflows initially |
| `name` | ✅ Present | ✅ Unchanged | Yes | Keep existing names |
| `description` | ❌ Missing | ✅ Text (2000 chars max) | Custom per workflow | See examples below |
| `active` | ✅ Present | ✅ Keep as `false` | Yes | Package workflows inactive |
| `tenantId` | ⚠️ Partial (nodes only) | ✅ Top-level field | `{{ $context.tenantId }}` | Add at root level |
| `category` | ❌ Missing | ✅ Enum | Varies | See mapping below |
| `tags` | ❌ Missing | ✅ Array[string] | 3-5 tags each | Workflow-specific |
| `createdAt` | ❌ Missing | ✅ ISO-8601 | `2026-01-22T00:00:00Z` | Use current timestamp |
| `updatedAt` | ❌ Missing | ✅ ISO-8601 | `2026-01-22T00:00:00Z` | Use current timestamp |
| `createdBy` | ❌ Missing | ✅ UUID/string | `"system"` | Package workflows created by system |
| `locked` | ❌ Missing | ✅ Boolean | `false` | Allow future edits |
| `meta` | ⚠️ Present (empty) | ✅ Filled with metadata | Custom per workflow | See meta schema below |
| `notes` (per node) | ❌ Missing | ✅ Per-node doc | All nodes | 20-150 words each |

---

## Workflow-Specific Updates

### 1. send-message.json

**IDs & Versions**:
```json
{
  "id": "wf_irc_send_message_7a8f9e1b",
  "versionId": "v1.0.0",
  "tenantId": "{{ $context.tenantId }}"
}
```

**Metadata**:
```json
{
  "name": "Send IRC Message",
  "description": "Sends a message to an IRC channel with rate limiting (2s cooldown). Validates user context, applies slowmode, stores message in database, and broadcasts via WebSocket.",
  "category": "notification",
  "tags": ["irc", "messaging", "realtime", "rate-limit"],
  "meta": {
    "package": "irc_webchat",
    "endpoint": "POST /api/v1/{tenant}/irc_webchat/messages",
    "triggerType": "webhook",
    "rateLimit": "1 message per 2 seconds per (user + channel)",
    "auditLog": true,
    "requiresAuth": true
  }
}
```

**Node Updates**:
| Node | Current Notes | New Notes |
|------|---------------|-----------|
| validate_context | ❌ None | "Ensures user is authenticated. Throws error if $context.user.id is missing or null." |
| apply_slowmode | ❌ None | "Enforces 2-second cooldown per user per channel. Key: irc:{user_id}:{channel_id}. Returns 429 if limit exceeded." |
| validate_input | ❌ None | "Validates message content: must be non-empty string, 1-500 characters. Prevents empty/oversized messages." |
| create_message | ❌ None | "Creates IRCMessage entity in database with tenant scoping. Automatically timestamps message creation." |
| emit_message | ❌ None | "Broadcasts message_sent event to all WebSocket clients subscribed to the channel. Includes message ID and sender info." |

---

### 2. handle-command.json

**IDs & Versions**:
```json
{
  "id": "wf_irc_handle_command_b2c3d4e5",
  "versionId": "v1.0.0",
  "tenantId": "{{ $context.tenantId }}"
}
```

**Metadata**:
```json
{
  "name": "Handle IRC Commands",
  "description": "Parses IRC commands (/help, /users, /me, /kick, /ban) and routes to appropriate handlers. Enforces permission levels: /kick requires level 2 (moderator), /ban requires level 3 (admin).",
  "category": "business-logic",
  "tags": ["irc", "commands", "admin", "authorization"],
  "meta": {
    "package": "irc_webchat",
    "triggerType": "webhook",
    "commandList": {
      "/help": { "minLevel": 0, "args": "none" },
      "/users": { "minLevel": 0, "args": "none" },
      "/me": { "minLevel": 0, "args": "action text" },
      "/kick": { "minLevel": 2, "args": "username" },
      "/ban": { "minLevel": 3, "args": "username" }
    },
    "requiresAuth": true
  }
}
```

**Node Updates**:
| Node | Current Notes | New Notes |
|------|---------------|-----------|
| validate_context | ❌ None | "Ensures user context is available. Required for all command processing." |
| parse_command | ❌ None | "Extracts command name (first word after /) and remaining args. Normalizes command to lowercase." |
| handle_help | ❌ None | "Routes /help command. Shows list of available commands based on user permission level." |
| handle_users | ❌ None | "Routes /users command. Lists all online users in current channel." |
| handle_me | ❌ None | "Routes /me command. Sends action-style message (e.g., '* user waves')." |
| handle_kick | ❌ None | "Routes /kick command. Requires moderator level (2+). Removes user from channel temporarily." |
| handle_ban | ❌ None | "Routes /ban command. Requires admin level (3+). Permanently bans user from channel." |

---

### 3. join-channel.json

**IDs & Versions**:
```json
{
  "id": "wf_irc_join_channel_c3d4e5f6",
  "versionId": "v1.0.0",
  "tenantId": "{{ $context.tenantId }}"
}
```

**Metadata**:
```json
{
  "name": "Join IRC Channel",
  "description": "Adds a user to an IRC channel after verifying permissions based on channel mode. Public channels allow any user; private channels require level 2+; secret channels require level 3+.",
  "category": "business-logic",
  "tags": ["irc", "channels", "membership", "access-control"],
  "meta": {
    "package": "irc_webchat",
    "endpoint": "POST /api/v1/{tenant}/irc_webchat/channels/{channelId}/join",
    "triggerType": "webhook",
    "channelModes": {
      "public": "Any authenticated user can join",
      "private": "Requires user level 2+ (moderator)",
      "secret": "Requires user level 3+ (admin)"
    },
    "requiresAuth": true,
    "creates": "IRCMembership entity",
    "broadcasts": { "channel": "irc:{channelId}", "event": "user_joined" }
  }
}
```

**Node Updates**:
| Node | Current Notes | New Notes |
|------|---------------|-----------|
| validate_context | ❌ None | "Ensures user is authenticated. Throws error if $context.user.id is missing." |
| fetch_channel | ❌ None | "Retrieves channel details including mode (public/private/secret). Filters by tenantId for isolation. Returns 404 if channel not found." |
| check_channel_mode | ❌ None | "Enforces access control: public always allowed, private requires level 2+, secret requires level 3+. Returns 403 Forbidden if user lacks permission." |
| create_membership | ❌ None | "Creates IRCMembership entity linking user to channel. Records join timestamp. Includes tenantId for multi-tenant isolation." |
| emit_join | ❌ None | "Broadcasts user_joined event to all WebSocket clients subscribed to the channel. Notifies other users of new arrival." |

---

### 4. list-channels.json

**IDs & Versions**:
```json
{
  "id": "wf_irc_list_channels_d4e5f6g7",
  "versionId": "v1.0.0",
  "tenantId": "{{ $context.tenantId }}"
}
```

**Metadata**:
```json
{
  "name": "List IRC Channels",
  "description": "Returns filtered list of IRC channels visible to the requesting user based on permission level. Level 0 sees only public; level 2+ also see private; level 3+ see secret.",
  "category": "data-transformation",
  "tags": ["irc", "channels", "list", "filtering"],
  "meta": {
    "package": "irc_webchat",
    "endpoint": "GET /api/v1/{tenant}/irc_webchat/channels",
    "triggerType": "webhook",
    "permissionRules": {
      "level_0": ["public"],
      "level_2": ["public", "private"],
      "level_3": ["public", "private", "secret"]
    },
    "sortOrder": "createdAt DESC",
    "requiresAuth": true
  }
}
```

**Node Updates**:
| Node | Current Notes | New Notes |
|------|---------------|-----------|
| validate_context | ❌ None | "Ensures tenantId is available in context. Multi-tenant isolation requirement." |
| extract_params | ❌ None | "Determines visibility flags based on user level. Level 2+ can see private; level 3+ can see secret." |
| build_filter | ❌ None | "Constructs MongoDB-style filter with $in operator for dynamic mode list. Always includes tenantId filter." |
| fetch_channels | ❌ None | "Queries database for channels matching filter. Sorted by creation date (newest first). Returns array of channel objects." |
| return_success | ❌ None | "Returns HTTP 200 response with channels array. Frontend processes for UI display." |

---

## Complete Field Mapping

### Category Enum Values

All 4 workflows should use one of these categories:

```
- "automation"          → Use for automated actions/triggers
- "integration"         → Use for external service integration
- "business-logic"      → Use for command routing, channel logic ← Most IRC workflows
- "data-transformation" → Use for filtering, sorting ← list-channels
- "notification"        → Use for message sending ← send-message
- "approval"           → Use for permission-gated actions
- "other"              → Use if none above fit
```

**Mapping for IRC workflows**:
- `send-message.json` → `notification`
- `handle-command.json` → `business-logic`
- `join-channel.json` → `business-logic`
- `list-channels.json` → `data-transformation`

---

### Multi-Tenant Pattern

**Current State** (in nodes only):
```json
{
  "nodes": [
    {
      "parameters": {
        "tenantId": "{{ $context.tenantId }}"
      }
    }
  ]
}
```

**Required State** (add at root):
```json
{
  "tenantId": "{{ $context.tenantId }}",  // ← ADD THIS
  "nodes": [
    {
      "parameters": {
        "tenantId": "{{ $context.tenantId }}"
        // Still here, but also at root level
      }
    }
  ]
}
```

---

## Version Strategy

### Current Approach
All 4 workflows start at **v1.0.0**:
```json
{
  "versionId": "v1.0.0"
}
```

### Future Updates
When making changes:
- **Bug fix**: v1.0.1 (patch)
- **New feature**: v1.1.0 (minor)
- **Breaking change**: v2.0.0 (major)

---

## Validation JSON (Copy-Paste Template)

Use this as a starting point for each workflow:

```json
{
  "id": "wf_irc_{name}_{random_hex}",
  "versionId": "v1.0.0",
  "name": "... existing name ...",
  "description": "... add 50-200 word description ...",
  "active": false,
  "tenantId": "{{ $context.tenantId }}",
  "category": "notification|business-logic|data-transformation",
  "tags": ["tag1", "tag2", "tag3"],
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "createdBy": "system",
  "locked": false,
  "meta": {
    "package": "irc_webchat",
    "endpoint": "...",
    "triggerType": "webhook",
    "requiresAuth": true,
    "requiredContext": ["user.id", "tenantId"]
  },
  "nodes": [
    {
      "id": "...",
      "name": "...",
      "type": "...",
      "typeVersion": 1,
      "position": [...],
      "notes": "... add meaningful description ...",
      "parameters": { ... }
    }
  ],
  "connections": { ... },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "maxWorkers": 1,
    "errorStrategy": "stop"
  },
  "variables": {},
  "errorHandling": {
    "strategy": "stop",
    "retryAttempts": 0
  },
  "staticData": {},
  "triggers": [],
  "credentials": []
}
```

---

## Quick ID Reference

**Generated IDs for all 4 workflows**:

```
Send Message     → wf_irc_send_message_7a8f9e1b
Handle Command   → wf_irc_handle_command_b2c3d4e5
Join Channel     → wf_irc_join_channel_c3d4e5f6
List Channels    → wf_irc_list_channels_d4e5f6g7
```

These match the examples in the full update plan.

---

## Validation Checklist per Workflow

```
□ Workflow: send-message.json
  □ id: wf_irc_send_message_7a8f9e1b
  □ versionId: v1.0.0
  □ tenantId: {{ $context.tenantId }}
  □ category: notification
  □ tags present (3-5 tags)
  □ meta.package: irc_webchat
  □ All 5 nodes have notes
  □ Connections validated

□ Workflow: handle-command.json
  □ id: wf_irc_handle_command_b2c3d4e5
  □ versionId: v1.0.0
  □ tenantId: {{ $context.tenantId }}
  □ category: business-logic
  □ tags present
  □ meta.commandList populated
  □ All 7 nodes have notes
  □ Connections validated

□ Workflow: join-channel.json
  □ id: wf_irc_join_channel_c3d4e5f6
  □ versionId: v1.0.0
  □ tenantId: {{ $context.tenantId }}
  □ category: business-logic
  □ tags present
  □ meta.channelModes documented
  □ All 5 nodes have notes
  □ fetch_channel includes tenantId filter
  □ create_membership includes tenantId

□ Workflow: list-channels.json
  □ id: wf_irc_list_channels_d4e5f6g7
  □ versionId: v1.0.0
  □ tenantId: {{ $context.tenantId }}
  □ category: data-transformation
  □ tags present
  □ meta.permissionRules documented
  □ All 5 nodes have notes
  □ build_filter includes tenantId
  □ fetch_channels includes tenantId filter
```

---

## References

- **Full Plan**: [IRC_WEBCHAT_WORKFLOW_UPDATE_PLAN.md](./IRC_WEBCHAT_WORKFLOW_UPDATE_PLAN.md)
- **Quick Ref**: [IRC_WEBCHAT_QUICK_REFERENCE.md](./IRC_WEBCHAT_QUICK_REFERENCE.md)
- **N8N Schema**: `/schemas/n8n-workflow.schema.json`
- **MetaBuilder v3**: `/dbal/shared/api/schema/workflow/metabuilder-workflow-v3.schema.json`

---

**Last Updated**: 2026-01-22
**Document**: Schema Update Matrix
**Status**: Ready for Implementation
