# IRC Webchat Package - Workflow Schema Update Plan

**Document Status**: Planning Phase
**Date**: 2026-01-22
**Package**: `irc_webchat` (packages/irc_webchat)
**Scope**: 4 Workflows Requiring N8N Schema Compliance
**Target Format**: N8N Workflow Standard + MetaBuilder Extensions
**Overall Task Complexity**: Medium

---

## Executive Summary

The IRC webchat package has 4 workflows (`send-message`, `handle-command`, `join-channel`, `list-channels`) that need schema updates to comply with n8n standards and MetaBuilder workflow conventions. Current files use a minimal baseline structure; this plan outlines required additions, validation requirements, and provides updated JSON examples following both n8n and MetaBuilder v3 specifications.

**Key Updates**:
- Add top-level `id`, `versionId`, `tenantId`, and `active` fields
- Enhance metadata with tags, categories, and descriptions
- Add workflow settings (timezone, execution timeout, data save preferences)
- Validate all node connections and parameter structures
- Apply multi-tenant filtering patterns
- Document parameter schemas and examples

---

## Current State Analysis

### File Locations
```
packages/irc_webchat/workflow/
├── send-message.json       (105 lines, 2.7 KB)
├── handle-command.json     (118 lines, 2.9 KB)
├── join-channel.json       (101 lines, 2.4 KB)
└── list-channels.json      (102 lines, 2.5 KB)
```

### Current Structure (All 4 Workflows)
```json
{
  "name": "...",
  "active": false,
  "nodes": [ ... ],
  "connections": {},
  "staticData": {},
  "meta": {},
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

### Gaps Identified

| Field | Current | Required | Impact |
|-------|---------|----------|--------|
| **id** | Missing | UUID string | No unique identification or versioning |
| **versionId** | Missing | String | No optimistic locking or audit trail |
| **tenantId** | Partially (in create data) | Top-level field | No workflow-level tenant scoping |
| **description** | Missing | Text (max 2000 chars) | No usage documentation |
| **tags** | Missing | Array of strings | No categorization/discoverability |
| **category** | Missing | Enum value | No classification |
| **createdAt/updatedAt** | Missing | ISO-8601 timestamps | No audit trail |
| **createdBy** | Missing | UUID | No creator tracking |
| **locked** | Missing | Boolean | No protection against editing |
| **meta** | Empty object | Can contain UI/canvas metadata | Workflow documentation lost |
| **pinData** | Missing | Object (dev-only) | No pinned execution data |
| **errorHandling** | Missing | Policy object | No error strategy definition |
| **Node-level descriptions** | Missing | Per-node documentation | Nodes undocumented on canvas |

---

## Required Changes

### Change 1: Add Workflow-Level Identifiers

All 4 workflows need unique IDs and version tracking.

**Pattern**:
```json
{
  "id": "wf_irc_{name}_{random}",  // e.g., "wf_irc_send_message_a1b2c3d4"
  "versionId": "v1.0.0",           // Follows semantic versioning
  "name": "...",
  "active": false
}
```

**Why**: Enables versioning, audit trails, and concurrent modification detection in DBAL.

---

### Change 2: Add Multi-Tenant Field

All workflows operate in a tenant context; needs explicit declaration.

**Current State** (partial - only in node parameters):
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

**Required State** (top-level + nodes):
```json
{
  "id": "wf_irc_send_message_...",
  "tenantId": "{{ $context.tenantId }}",  // Dynamic or static
  "nodes": [...]
}
```

**If using dynamic tenantId**: Treat as a workflow variable that must be resolved at runtime.

---

### Change 3: Add Descriptive Metadata

Each workflow needs documentation for canvas display and API discoverability.

**Pattern**:
```json
{
  "id": "...",
  "name": "Send IRC Message",
  "description": "Sends a message to an IRC channel with rate limiting (2s cooldown). Validates user context, applies slowmode, stores message in database, and broadcasts via WebSocket.",
  "category": "notification",
  "tags": ["irc", "messaging", "realtime", "rate-limit"],
  "meta": {
    "package": "irc_webchat",
    "endpoint": "POST /api/v1/{tenant}/irc_webchat/send-message",
    "triggerType": "webhook",
    "rateLimit": "1 message per 2 seconds per user+channel",
    "auditLog": true,
    "notes": "Requires authenticated user context"
  }
}
```

---

### Change 4: Enforce Proper Settings Block

Current settings are good; need to ensure consistency across all 4 workflows.

**Required Settings Block**:
```json
{
  "settings": {
    "timezone": "UTC",                    // Workflow timezone for cron/scheduling
    "executionTimeout": 3600,             // 1 hour default
    "saveExecutionProgress": true,        // Track partial execution
    "saveDataErrorExecution": "all",      // Save all data when error occurs
    "saveDataSuccessExecution": "all",    // Save all data on success
    "maxWorkers": 1,                      // Parallelization (added)
    "errorStrategy": "stop"               // stop|continue|retry (added)
  }
}
```

---

### Change 5: Add Comprehensive Node Documentation

Each node should have `notes` field for canvas tooltips.

**Pattern**:
```json
{
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "notes": "Ensures user is authenticated. Throws error if $context.user.id is undefined.",
      "parameters": { ... }
    }
  ]
}
```

---

### Change 6: Validate Connection Structure

All connections must follow n8n adjacency format with valid node references.

**Current Format** (n8n standard):
```json
{
  "connections": {
    "Validate Context": {
      "main": {
        "0": [
          { "node": "Apply Slowmode", "type": "main", "index": 0 }
        ]
      }
    }
  }
}
```

**Status**: ✅ Already correct (using n8n format). Verify all references exist.

---

### Change 7: Add Node Parameter Validation

Each node's parameters should match its type's schema.

**Example - Validate Node**:
```json
{
  "id": "validate_context",
  "parameters": {
    "input": "{{ $context.user.id }}",
    "operation": "validate",
    "validator": "required"
  }
}
```

**Validation Rules**:
- Input field must be valid expression (`{{ ... }}`)
- Operation must be one of: `validate`, `transform_data`, `database_read`, etc.
- Validator enum: `required`, `string`, `minLength`, `maxLength`, etc.

---

## Workflows Requiring Updates

### 1. **send-message.json** - Send IRC Message

**Purpose**: Post a message to an IRC channel with rate limiting
**Nodes**: 5 (validate → rateLimit → validate input → create message → emit)
**Current Active Status**: `false`
**Estimated Changes**: 7 (id + versionId + tenantId + description + tags + meta + node notes)

**Current Node Flow**:
```
validate_context
    ↓
apply_slowmode (rate limit 1 msg / 2s)
    ↓
validate_input (string, 1-500 chars)
    ↓
create_message (database write with tenantId)
    ↓
emit_message (WebSocket broadcast)
```

**Update Checklist**:
- [ ] Add `id`: `"wf_irc_send_message_..."`
- [ ] Add `versionId`: `"v1.0.0"`
- [ ] Add top-level `tenantId`
- [ ] Add `description` (50-100 words)
- [ ] Add `tags`: `["irc", "messaging", "realtime", "rate-limit"]`
- [ ] Add `category`: `"notification"`
- [ ] Add `meta` with package, endpoint, triggerType info
- [ ] Add `notes` to each node
- [ ] Verify all parameter types match node type spec
- [ ] Validate connection graph (no cycles, all references valid)

---

### 2. **handle-command.json** - Handle IRC Commands

**Purpose**: Parse and route IRC commands (/help, /users, /me, /kick, /ban)
**Nodes**: 6 (validate → parse → condition branches x4)
**Current Active Status**: `false`
**Estimated Changes**: 7 (same as above)

**Current Node Flow**:
```
validate_context
    ↓
parse_command (extract command + args)
    ├→ handle_help
    ├→ handle_users
    ├→ handle_me
    ├→ handle_kick (level >= 2)
    └→ handle_ban (level >= 3)
```

**Update Checklist**:
- [ ] Add `id`: `"wf_irc_handle_command_..."`
- [ ] Add `versionId`: `"v1.0.0"`
- [ ] Add top-level `tenantId`
- [ ] Add `description` (focus on permission levels)
- [ ] Add `tags`: `["irc", "commands", "admin", "authorization"]`
- [ ] Add `category`: `"business-logic"`
- [ ] Add `meta` with command list and permission requirements
- [ ] Add `notes` to condition nodes explaining permission checks
- [ ] Verify permission level checks (`$context.user.level >= X`)
- [ ] Validate all branch conditions

---

### 3. **join-channel.json** - Join IRC Channel

**Purpose**: Add user to channel with mode permission checks
**Nodes**: 5 (validate → fetch → condition → create membership → emit)
**Current Active Status**: `false`
**Estimated Changes**: 7 (same as above)

**Current Node Flow**:
```
validate_context (user exists)
    ↓
fetch_channel (database read)
    ↓
check_channel_mode (public || (private && level >= 2))
    ↓
create_membership (add user to channel)
    ↓
emit_join (broadcast event)
```

**Update Checklist**:
- [ ] Add `id`: `"wf_irc_join_channel_..."`
- [ ] Add `versionId`: `"v1.0.0"`
- [ ] Add top-level `tenantId`
- [ ] Add `description` (document mode types: public, private, secret)
- [ ] Add `tags`: `["irc", "channels", "membership", "access-control"]`
- [ ] Add `category`: `"business-logic"`
- [ ] Add `meta` with channel modes and access rules
- [ ] Add `notes` explaining channel mode logic
- [ ] Verify mode enum exists in channel entity schema
- [ ] Validate tenantId filtering in fetch_channel

---

### 4. **list-channels.json** - List IRC Channels

**Purpose**: Return filtered channel list based on user permission level
**Nodes**: 5 (validate → extract → build filter → fetch → response)
**Current Active Status**: `false`
**Estimated Changes**: 7 (same as above)

**Current Node Flow**:
```
validate_context (tenant required)
    ↓
extract_params (resolve user level permissions)
    ↓
build_filter (construct mode filter)
    ↓
fetch_channels (database list with filter)
    ↓
return_success (HTTP 200 response)
```

**Update Checklist**:
- [ ] Add `id`: `"wf_irc_list_channels_..."`
- [ ] Add `versionId`: `"v1.0.0"`
- [ ] Add top-level `tenantId`
- [ ] Add `description` (focus on permission-based filtering)
- [ ] Add `tags`: `["irc", "channels", "list", "filtering"]`
- [ ] Add `category`: `"data-transformation"`
- [ ] Add `meta` with visibility rules
- [ ] Add `notes` to filter construction nodes
- [ ] Verify filter $in operator syntax is correct
- [ ] Ensure response structure matches API contract

---

## Updated JSON Examples

### Example 1: send-message.json (UPDATED)

```json
{
  "id": "wf_irc_send_message_7a8f9e1b",
  "versionId": "v1.0.0",
  "name": "Send IRC Message",
  "description": "Posts a message to an IRC channel with rate limiting (1 message per 2 seconds per user+channel). Validates user authentication, enforces slowmode, stores message in database with tenant isolation, and broadcasts the message to connected WebSocket clients in real-time.",
  "active": false,
  "tenantId": "{{ $context.tenantId }}",
  "category": "notification",
  "tags": ["irc", "messaging", "realtime", "rate-limit", "websocket"],
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "createdBy": "system",
  "locked": false,
  "meta": {
    "package": "irc_webchat",
    "endpoint": "POST /api/v1/{tenant}/irc_webchat/messages",
    "triggerType": "webhook",
    "rateLimit": "1 message per 2 seconds per (user + channel)",
    "auditLog": true,
    "requiresAuth": true,
    "requiredContext": ["user.id", "tenantId"],
    "broadcast": {
      "channel": "irc:{channelId}",
      "event": "message_sent"
    },
    "notes": "Uses rate limiting to prevent spam. Requires authenticated user context. Creates IRCMessage entity and broadcasts via WebSocket."
  },
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "notes": "Ensures user is authenticated. Throws error if $context.user.id is missing or null.",
      "parameters": {
        "input": "{{ $context.user.id }}",
        "operation": "validate",
        "validator": "required"
      }
    },
    {
      "id": "apply_slowmode",
      "name": "Apply Slowmode",
      "type": "metabuilder.rateLimit",
      "typeVersion": 1,
      "position": [400, 100],
      "notes": "Enforces 2-second cooldown per user per channel. Key: irc:{user_id}:{channel_id}. Returns 429 if limit exceeded.",
      "parameters": {
        "operation": "rate_limit",
        "key": "{{ 'irc:' + $context.user.id + ':' + $json.channelId }}",
        "limit": 1,
        "window": 2000
      }
    },
    {
      "id": "validate_input",
      "name": "Validate Input",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [700, 100],
      "notes": "Validates message content: must be non-empty string, 1-500 characters. Prevents empty/oversized messages.",
      "parameters": {
        "input": "{{ $json }}",
        "operation": "validate",
        "rules": {
          "message": "required|string|minLength:1|maxLength:500"
        }
      }
    },
    {
      "id": "create_message",
      "name": "Create Message",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [100, 300],
      "notes": "Creates IRCMessage entity in database with tenant scoping. Automatically timestamps message creation.",
      "parameters": {
        "data": {
          "channelId": "{{ $json.channelId }}",
          "userId": "{{ $context.user.id }}",
          "tenantId": "{{ $context.tenantId }}",
          "message": "{{ $json.message }}",
          "createdAt": "{{ new Date().toISOString() }}"
        },
        "operation": "database_create",
        "entity": "IRCMessage"
      }
    },
    {
      "id": "emit_message",
      "name": "Emit Message",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [400, 300],
      "notes": "Broadcasts message_sent event to all WebSocket clients subscribed to the channel. Includes message ID and sender info.",
      "parameters": {
        "data": {
          "messageId": "{{ $steps.create_message.output.id }}",
          "userId": "{{ $context.user.id }}",
          "message": "{{ $json.message }}"
        },
        "action": "emit_event",
        "event": "message_sent",
        "channel": "{{ 'irc:' + $json.channelId }}"
      }
    }
  ],
  "connections": {
    "Validate Context": {
      "main": {
        "0": [
          {
            "node": "Apply Slowmode",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Apply Slowmode": {
      "main": {
        "0": [
          {
            "node": "Validate Input",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Validate Input": {
      "main": {
        "0": [
          {
            "node": "Create Message",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Create Message": {
      "main": {
        "0": [
          {
            "node": "Emit Message",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  },
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

### Example 2: handle-command.json (UPDATED)

```json
{
  "id": "wf_irc_handle_command_b2c3d4e5",
  "versionId": "v1.0.0",
  "name": "Handle IRC Commands",
  "description": "Parses IRC commands (!/help, /users, /me, /kick, /ban) from message text and routes to appropriate handlers. Enforces permission levels: /kick requires level 2 (moderator), /ban requires level 3 (admin). Other commands available to all authenticated users.",
  "active": false,
  "tenantId": "{{ $context.tenantId }}",
  "category": "business-logic",
  "tags": ["irc", "commands", "admin", "authorization", "routing"],
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "createdBy": "system",
  "locked": false,
  "meta": {
    "package": "irc_webchat",
    "triggerType": "webhook",
    "commandList": {
      "/help": {
        "description": "Display available commands",
        "minLevel": 0,
        "args": "none"
      },
      "/users": {
        "description": "List online users in channel",
        "minLevel": 0,
        "args": "none"
      },
      "/me": {
        "description": "Action message (e.g., /me waves)",
        "minLevel": 0,
        "args": "action text"
      },
      "/kick": {
        "description": "Remove user from channel",
        "minLevel": 2,
        "args": "username"
      },
      "/ban": {
        "description": "Ban user permanently",
        "minLevel": 3,
        "args": "username"
      }
    },
    "requiresAuth": true,
    "requiredContext": ["user.id", "user.level", "tenantId"]
  },
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "notes": "Ensures user context is available. Required for all command processing.",
      "parameters": {
        "input": "{{ $context.user.id }}",
        "operation": "validate",
        "validator": "required"
      }
    },
    {
      "id": "parse_command",
      "name": "Parse Command",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 100],
      "notes": "Extracts command name (first word after /) and remaining args. Normalizes command to lowercase.",
      "parameters": {
        "output": {
          "command": "{{ $json.message.split(' ')[0].substring(1).toLowerCase() }}",
          "args": "{{ $json.message.split(' ').slice(1) }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "handle_help",
      "name": "Handle Help",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [700, 100],
      "notes": "Routes /help command. Shows list of available commands based on user permission level.",
      "parameters": {
        "condition": "{{ $steps.parse_command.output.command === 'help' }}",
        "operation": "condition"
      }
    },
    {
      "id": "handle_users",
      "name": "Handle Users",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [100, 300],
      "notes": "Routes /users command. Lists all online users in current channel.",
      "parameters": {
        "condition": "{{ $steps.parse_command.output.command === 'users' }}",
        "operation": "condition"
      }
    },
    {
      "id": "handle_me",
      "name": "Handle Me",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [400, 300],
      "notes": "Routes /me command. Sends action-style message (e.g., '* user waves').",
      "parameters": {
        "condition": "{{ $steps.parse_command.output.command === 'me' }}",
        "operation": "condition"
      }
    },
    {
      "id": "handle_kick",
      "name": "Handle Kick",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [700, 300],
      "notes": "Routes /kick command. Requires moderator level (2+). Removes user from channel temporarily.",
      "parameters": {
        "condition": "{{ $steps.parse_command.output.command === 'kick' && $context.user.level >= 2 }}",
        "operation": "condition"
      }
    },
    {
      "id": "handle_ban",
      "name": "Handle Ban",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [100, 500],
      "notes": "Routes /ban command. Requires admin level (3+). Permanently bans user from channel.",
      "parameters": {
        "condition": "{{ $steps.parse_command.output.command === 'ban' && $context.user.level >= 3 }}",
        "operation": "condition"
      }
    }
  ],
  "connections": {
    "Validate Context": {
      "main": {
        "0": [
          {
            "node": "Parse Command",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Parse Command": {
      "main": {
        "0": [
          { "node": "Handle Help", "type": "main", "index": 0 },
          { "node": "Handle Users", "type": "main", "index": 0 },
          { "node": "Handle Me", "type": "main", "index": 0 },
          { "node": "Handle Kick", "type": "main", "index": 0 },
          { "node": "Handle Ban", "type": "main", "index": 0 }
        ]
      }
    }
  },
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

### Example 3: join-channel.json (UPDATED)

```json
{
  "id": "wf_irc_join_channel_c3d4e5f6",
  "versionId": "v1.0.0",
  "name": "Join IRC Channel",
  "description": "Adds a user to an IRC channel after verifying channel access permissions based on channel mode (public/private/secret). Public channels allow any user; private channels require user level 2+; secret channels require level 3+. Creates membership record and broadcasts join event.",
  "active": false,
  "tenantId": "{{ $context.tenantId }}",
  "category": "business-logic",
  "tags": ["irc", "channels", "membership", "access-control", "authorization"],
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "createdBy": "system",
  "locked": false,
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
    "requiredContext": ["user.id", "user.level", "tenantId"],
    "creates": "IRCMembership entity",
    "broadcasts": {
      "channel": "irc:{channelId}",
      "event": "user_joined"
    }
  },
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "notes": "Ensures user is authenticated. Throws error if $context.user.id is missing.",
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
      "notes": "Retrieves channel details including mode (public/private/secret). Filters by tenantId for isolation. Returns 404 if channel not found.",
      "parameters": {
        "filter": {
          "id": "{{ $json.channelId }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "operation": "database_read",
        "entity": "IRCChannel"
      }
    },
    {
      "id": "check_channel_mode",
      "name": "Check Channel Mode",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [700, 100],
      "notes": "Enforces access control: public always allowed, private requires level 2+, secret requires level 3+. Returns 403 Forbidden if user lacks permission.",
      "parameters": {
        "condition": "{{ $steps.fetch_channel.output.mode === 'public' || ($context.user.level >= 2 && $steps.fetch_channel.output.mode === 'private') || ($context.user.level >= 3 && $steps.fetch_channel.output.mode === 'secret') }}",
        "operation": "condition"
      }
    },
    {
      "id": "create_membership",
      "name": "Create Membership",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [100, 300],
      "notes": "Creates IRCMembership entity linking user to channel. Records join timestamp. Includes tenantId for multi-tenant isolation.",
      "parameters": {
        "data": {
          "channelId": "{{ $json.channelId }}",
          "userId": "{{ $context.user.id }}",
          "tenantId": "{{ $context.tenantId }}",
          "joinedAt": "{{ new Date().toISOString() }}"
        },
        "operation": "database_create",
        "entity": "IRCMembership"
      }
    },
    {
      "id": "emit_join",
      "name": "Emit Join",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [400, 300],
      "notes": "Broadcasts user_joined event to all WebSocket clients subscribed to the channel. Notifies other users of new arrival.",
      "parameters": {
        "data": {
          "userId": "{{ $context.user.id }}",
          "channelId": "{{ $json.channelId }}"
        },
        "action": "emit_event",
        "event": "user_joined",
        "channel": "{{ 'irc:' + $json.channelId }}"
      }
    }
  ],
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
            "node": "Check Channel Mode",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Check Channel Mode": {
      "main": {
        "0": [
          {
            "node": "Create Membership",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Create Membership": {
      "main": {
        "0": [
          {
            "node": "Emit Join",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  },
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

### Example 4: list-channels.json (UPDATED)

```json
{
  "id": "wf_irc_list_channels_d4e5f6g7",
  "versionId": "v1.0.0",
  "name": "List IRC Channels",
  "description": "Returns filtered list of IRC channels visible to the requesting user based on permission level. User level 0 sees only public channels; level 2+ also see private channels; level 3+ see secret channels. Results sorted by creation date (newest first) and scoped to requesting user's tenant.",
  "active": false,
  "tenantId": "{{ $context.tenantId }}",
  "category": "data-transformation",
  "tags": ["irc", "channels", "list", "filtering", "permission-based"],
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "createdBy": "system",
  "locked": false,
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
    "requiresAuth": true,
    "requiredContext": ["user.level", "tenantId"],
    "returnType": "HTTP 200 JSON",
    "responseSchema": {
      "channels": [
        { "id": "string", "name": "string", "mode": "string", "createdAt": "ISO-8601" }
      ]
    }
  },
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "notes": "Ensures tenantId is available in context. Multi-tenant isolation requirement.",
      "parameters": {
        "input": "{{ $context.tenantId }}",
        "operation": "validate",
        "validator": "required"
      }
    },
    {
      "id": "extract_params",
      "name": "Extract Params",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 100],
      "notes": "Determines visibility flags based on user level. Level 2+ can see private; level 3+ can see secret.",
      "parameters": {
        "output": {
          "includePrivate": "{{ $context.user.level >= 2 }}",
          "includeSecret": "{{ $context.user.level >= 3 }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "build_filter",
      "name": "Build Filter",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [700, 100],
      "notes": "Constructs MongoDB-style filter with $in operator for dynamic mode list. Always includes tenantId filter.",
      "parameters": {
        "output": {
          "tenantId": "{{ $context.tenantId }}",
          "mode": {
            "$in": "{{ [$steps.extract_params.output.includeSecret ? 'secret' : null, $steps.extract_params.output.includePrivate ? 'private' : null, 'public'].filter(x => x) }}"
          }
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "fetch_channels",
      "name": "Fetch Channels",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [100, 300],
      "notes": "Queries database for channels matching filter. Sorted by creation date (newest first). Returns array of channel objects.",
      "parameters": {
        "filter": "{{ $steps.build_filter.output }}",
        "sort": {
          "createdAt": -1
        },
        "operation": "database_read",
        "entity": "IRCChannel"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [400, 300],
      "notes": "Returns HTTP 200 response with channels array. Frontend processes for UI display.",
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": {
          "channels": "{{ $steps.fetch_channels.output }}"
        }
      }
    }
  ],
  "connections": {
    "Validate Context": {
      "main": {
        "0": [
          {
            "node": "Extract Params",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Extract Params": {
      "main": {
        "0": [
          {
            "node": "Build Filter",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Build Filter": {
      "main": {
        "0": [
          {
            "node": "Fetch Channels",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Fetch Channels": {
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
  },
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

## Validation Checklist

Use this checklist to validate each workflow before committing.

### Root-Level Fields

- [ ] **id**: Present, format `wf_irc_{name}_{random_hex}` (16 chars min)
- [ ] **versionId**: Present, format `v{major}.{minor}.{patch}` (e.g., `v1.0.0`)
- [ ] **name**: Non-empty string, human-readable (50 chars max)
- [ ] **description**: 50-200 words, explains purpose and key features
- [ ] **active**: Boolean (should be `false` for package workflows)
- [ ] **tenantId**: Present, either static UUID or `{{ $context.tenantId }}`
- [ ] **category**: One of: automation, integration, business-logic, data-transformation, notification, approval, other
- [ ] **tags**: Array of 3-5 relevant strings (lowercase)
- [ ] **createdAt/updatedAt**: ISO-8601 timestamps
- [ ] **createdBy**: UUID or "system"
- [ ] **locked**: Boolean (should be `false`)
- [ ] **meta**: Object with package, endpoint, triggerType, and domain-specific fields
- [ ] **nodes**: Array with 2+ nodes
- [ ] **connections**: Object with valid node references
- [ ] **settings**: Contains timezone, executionTimeout, error handling
- [ ] **variables**: Object (can be empty)
- [ ] **errorHandling**: Strategy and retry config
- [ ] **staticData**: Empty object `{}`
- [ ] **triggers**: Array (empty `[]` for non-triggered workflows)
- [ ] **credentials**: Array (empty `[]` if no credentials needed)

### Node-Level Fields

For each node in `nodes` array:

- [ ] **id**: Unique string, snake_case, 3-30 chars
- [ ] **name**: Human-readable string, 20-50 chars
- [ ] **type**: Valid node type identifier (e.g., `metabuilder.validate`)
- [ ] **typeVersion**: Positive integer (usually `1`)
- [ ] **position**: Array of 2 integers `[x, y]` where x,y >= 0
- [ ] **notes**: Descriptive comment, 20-150 words
- [ ] **parameters**: Object with proper structure (if applicable)
  - All template expressions use `{{ ... }}` syntax
  - All field references exist in data model
  - Condition nodes use valid boolean expressions
  - Database operations specify correct entity names

### Connection Validation

For each entry in `connections`:

- [ ] Source node name exists in `nodes` array
- [ ] All target nodes referenced exist in `nodes` array
- [ ] No circular references (DAG property)
- [ ] All use `type: "main"` (standard output) or `type: "error"` (error handling)
- [ ] Index values are non-negative integers
- [ ] Proper n8n adjacency format:
  ```json
  {
    "NodeName": {
      "main": {
        "0": [{ "node": "NextNode", "type": "main", "index": 0 }]
      }
    }
  }
  ```

### Multi-Tenant Safety

For each workflow:

- [ ] Top-level `tenantId` field present
- [ ] All database reads include `tenantId` filter
- [ ] All database writes include `tenantId` in data
- [ ] No cross-tenant data leaks possible
- [ ] Context uses `{{ $context.tenantId }}`

### Schema Compliance

- [ ] Validates against `n8n-workflow.schema.json`
- [ ] Validates against `metabuilder-workflow-v3.schema.json`
- [ ] No extra properties outside schema definition
- [ ] All enum values match allowed options
- [ ] All string lengths within limits (name: 255, description: 2000)

### Parameter Type Validation

| Node Type | Required Parameters | Validation |
|-----------|-------------------|------------|
| `metabuilder.validate` | input, operation, validator/rules | ✓ |
| `metabuilder.transform` | output, operation | ✓ |
| `metabuilder.database` | operation, entity, (data/filter) | ✓ |
| `metabuilder.action` | action, (data/body/etc) | ✓ |
| `metabuilder.condition` | condition, operation | ✓ |
| `metabuilder.rateLimit` | operation, key, limit, window | ✓ |

---

## Implementation Strategy

### Step 1: Update send-message.json (First)
1. Copy the updated example above
2. Run validation checks
3. Test workflow execution
4. Commit with message: `feat(irc_webchat): upgrade send-message workflow to N8N schema v3`

### Step 2: Update handle-command.json
1. Copy the updated example above
2. Add command routing logic if missing
3. Run validation checks
4. Commit: `feat(irc_webchat): upgrade handle-command workflow to N8N schema v3`

### Step 3: Update join-channel.json
1. Copy the updated example above
2. Verify IRCChannel entity schema matches
3. Run validation checks
4. Commit: `feat(irc_webchat): upgrade join-channel workflow to N8N schema v3`

### Step 4: Update list-channels.json
1. Copy the updated example above
2. Verify MongoDB filter syntax ($in operator)
3. Run validation checks
4. Commit: `feat(irc_webchat): upgrade list-channels workflow to N8N schema v3`

### Step 5: Update package.json
Ensure workflows section lists correct file extensions:
```json
{
  "files": {
    "byType": {
      "workflows": [
        "workflow/send-message.json",
        "workflow/handle-command.json",
        "workflow/join-channel.json",
        "workflow/list-channels.json"
      ]
    }
  }
}
```

### Step 6: Validation & Testing
```bash
# Validate against JSON schemas
npm run validate:workflows

# Run package tests
npm run test:package irc_webchat

# Check E2E tests
npm run test:e2e packages/irc_webchat
```

### Step 7: Code Review & Merge
- Review parameter validation
- Verify multi-tenant filtering
- Check error handling consistency
- Merge to main with PR

---

## Related Files & References

### Schema Files
- N8N Schema: `/schemas/n8n-workflow.schema.json`
- MetaBuilder v3 Schema: `/dbal/shared/api/schema/workflow/metabuilder-workflow-v3.schema.json`
- Package Schema: `/schemas/package-schemas/workflow.schema.json`

### IRC Webchat Package
- Package Root: `/packages/irc_webchat/`
- Workflow Directory: `/packages/irc_webchat/workflow/`
- Package Metadata: `/packages/irc_webchat/package.json`
- Permissions: `/packages/irc_webchat/permissions/roles.json`

### Documentation
- N8N Compliance Audit: `/docs/N8N_COMPLIANCE_AUDIT.md`
- Rate Limiting Guide: `/docs/RATE_LIMITING_GUIDE.md`
- Multi-Tenant Audit: `/docs/MULTI_TENANT_AUDIT.md`
- CLAUDE.md: `/docs/CLAUDE.md`

### Entity Schemas
- IRCChannel: `/dbal/shared/api/schema/entities/packages/irc.yaml`
- IRCMessage: (check irc.yaml for definition)
- IRCMembership: (check irc.yaml for definition)

---

## Testing & Validation

### Unit Testing Workflows

```typescript
// Example test for send-message workflow
import { executeWorkflow } from '@/lib/workflow-executor'

describe('send-message workflow', () => {
  it('validates context before processing', async () => {
    const result = await executeWorkflow('wf_irc_send_message_7a8f9e1b', {
      context: { /* missing user.id */ },
      json: { channelId: 'ch1', message: 'hello' }
    })
    expect(result.error).toBeDefined()
    expect(result.error.message).toContain('user.id')
  })

  it('enforces rate limiting', async () => {
    // First message - should succeed
    const result1 = await executeWorkflow(...)
    expect(result1.success).toBe(true)

    // Immediate second message - should fail rate limit
    const result2 = await executeWorkflow(...)
    expect(result2.error).toContain('rate limit')
  })

  it('validates message length', async () => {
    const result = await executeWorkflow(..., {
      json: { message: '' } // empty message
    })
    expect(result.error).toContain('minLength')
  })

  it('includes tenantId in database write', async () => {
    // Verify create_message node includes tenantId
    const mockDb = jest.fn()
    const result = await executeWorkflow(..., { db: mockDb })
    expect(mockDb).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'tenant123' })
    )
  })
})
```

### JSON Schema Validation

```bash
# Validate single workflow
npx ajv validate -s schemas/n8n-workflow.schema.json \
  -d packages/irc_webchat/workflow/send-message.json

# Validate all workflows
npx ajv validate -s schemas/metabuilder-workflow-v3.schema.json \
  -d packages/irc_webchat/workflow/*.json --verbose
```

---

## Estimated Effort

| Task | Time | Complexity |
|------|------|-----------|
| Review current structure | 15 min | Low |
| Update send-message.json | 20 min | Low |
| Update handle-command.json | 20 min | Low |
| Update join-channel.json | 25 min | Medium |
| Update list-channels.json | 25 min | Medium |
| Validation & testing | 30 min | Medium |
| Documentation & PR | 15 min | Low |
| **Total** | **2.5 hours** | **Low-Medium** |

---

## Success Criteria

A workflow update is **complete** when:

1. ✅ All required root-level fields present (id, versionId, tenantId, etc.)
2. ✅ All nodes have `notes` field with meaningful descriptions
3. ✅ All connections validated (no cycles, all references exist)
4. ✅ All parameters type-checked against node type schema
5. ✅ Multi-tenant filtering verified in all database operations
6. ✅ Passes `n8n-workflow.schema.json` validation
7. ✅ Passes `metabuilder-workflow-v3.schema.json` validation
8. ✅ All 4 workflows updated consistently
9. ✅ package.json `files.byType.workflows` updated
10. ✅ E2E tests passing (or marked as manual verification)
11. ✅ Code review approved
12. ✅ Merged to main branch

---

## Appendix: Field Reference

### Root-Level Field Definitions

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string (UUID) | Yes | Unique workflow identifier | `wf_irc_send_message_7a8f9e1b` |
| `versionId` | string | Yes | Semantic version for tracking | `v1.0.0` |
| `name` | string | Yes | Human-readable name (1-255 chars) | `Send IRC Message` |
| `description` | string | No | Detailed explanation (max 2000 chars) | `Posts a message with rate limiting...` |
| `active` | boolean | No | Can workflow be triggered? (default: false) | `false` |
| `tenantId` | string (UUID or template) | Yes | Multi-tenant scope | `{{ $context.tenantId }}` |
| `category` | string (enum) | No | Workflow classification | `notification` |
| `tags` | array[string] | No | Categorization tags | `["irc", "messaging", "realtime"]` |
| `createdAt` | string (ISO-8601) | No | Creation timestamp | `2026-01-22T00:00:00Z` |
| `updatedAt` | string (ISO-8601) | No | Last modification timestamp | `2026-01-22T00:00:00Z` |
| `createdBy` | string (UUID) | No | Creator user ID | `system` |
| `locked` | boolean | No | Prevent editing? (default: false) | `false` |
| `meta` | object | No | Custom metadata (preserve keys for tooling) | `{ "package": "irc_webchat", ... }` |
| `nodes` | array[Node] | Yes | Workflow steps (min: 1, max: 500) | `[{ id: "...", name: "...", ... }]` |
| `connections` | object | Yes | DAG edges (n8n adjacency format) | `{ "NodeName": { main: { 0: [...] } } }` |
| `settings` | object | No | Execution configuration | `{ timezone: "UTC", executionTimeout: 3600 }` |
| `variables` | object | No | Workflow-level variables | `{ "varName": { type: "string", value: "..." } }` |
| `errorHandling` | object | No | Error strategy config | `{ strategy: "stop", retryAttempts: 0 }` |
| `staticData` | object | No | Engine-managed state (reserved) | `{}` |
| `triggers` | array[Trigger] | No | Event trigger declarations | `[]` |
| `credentials` | array[Credential] | No | Credential bindings | `[]` |

### Node Field Definitions

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | Yes | Unique node identifier (snake_case, 3-30 chars) | `validate_context` |
| `name` | string | Yes | Human-readable name (20-50 chars) | `Validate Context` |
| `type` | string | Yes | Node type identifier with namespace | `metabuilder.validate` |
| `typeVersion` | integer | Yes | Node type version (usually 1) | `1` |
| `position` | array[2] | Yes | Canvas position [x, y] (both >= 0) | `[100, 100]` |
| `notes` | string | No | Canvas tooltip/documentation (20-150 words) | `Ensures user is authenticated...` |
| `parameters` | object | No | Node-specific configuration | `{ input: "{{ $context.user.id }}", ... }` |
| `disabled` | boolean | No | Skip execution? (default: false) | `false` |
| `continueOnFail` | boolean | No | Continue flow on error? (default: false) | `false` |
| `retryOnFail` | boolean | No | Retry on failure? (default: false) | `false` |
| `credentials` | object | No | Node-specific credentials | `{}` |

---

**Document Version**: 1.0
**Last Updated**: 2026-01-22
**Author**: MetaBuilder AI Assistant
**Status**: Ready for Implementation
