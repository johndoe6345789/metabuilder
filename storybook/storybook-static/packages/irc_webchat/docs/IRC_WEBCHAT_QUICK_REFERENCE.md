# IRC Webchat Workflows - Quick Reference

**Fast lookup for the 4 workflows needing updates.**

## Overview

| Workflow | File | Nodes | Status | Complexity |
|----------|------|-------|--------|-----------|
| Send Message | `send-message.json` | 5 | Ready | Low |
| Handle Commands | `handle-command.json` | 7 | Ready | Medium |
| Join Channel | `join-channel.json` | 5 | Ready | Medium |
| List Channels | `list-channels.json` | 5 | Ready | Medium |

---

## New Fields Required (All Workflows)

```json
{
  "id": "wf_irc_{name}_{random}",
  "versionId": "v1.0.0",
  "description": "50-200 word description",
  "category": "notification|business-logic|data-transformation",
  "tags": ["tag1", "tag2", "tag3"],
  "tenantId": "{{ $context.tenantId }}",
  "meta": {
    "package": "irc_webchat",
    "endpoint": "...",
    "requiresAuth": true
  }
}
```

---

## 1. send-message.json

**What it does**: Posts message with rate limiting (1 msg/2s)

**Nodes**:
- `validate_context` - Check user authenticated
- `apply_slowmode` - Enforce 2s rate limit per user+channel
- `validate_input` - Verify message 1-500 chars
- `create_message` - Store in database with tenantId
- `emit_message` - Broadcast via WebSocket

**Key Points**:
- ⚠️ Rate limiting key: `irc:{user_id}:{channel_id}`
- ✅ Database write includes `tenantId`
- 📡 Broadcasts to channel `irc:{channelId}` with event `message_sent`

**Updated Example in**: [IRC_WEBCHAT_WORKFLOW_UPDATE_PLAN.md](./IRC_WEBCHAT_WORKFLOW_UPDATE_PLAN.md#example-1-send-messagejson-updated)

---

## 2. handle-command.json

**What it does**: Routes IRC commands based on permission level

**Commands**:
- `/help` - Show available commands (anyone)
- `/users` - List online users (anyone)
- `/me` - Action message (anyone)
- `/kick` - Remove user (level 2+)
- `/ban` - Permanent ban (level 3+)

**Nodes**:
- `validate_context` - Check user authenticated
- `parse_command` - Extract command + args
- 5x condition nodes - Route to handlers

**Key Points**:
- ✅ Conditions check `$context.user.level >= X`
- ✅ All branches merge back (fan-in pattern)
- 📋 Document all commands in meta.commandList

**Updated Example in**: [IRC_WEBCHAT_WORKFLOW_UPDATE_PLAN.md](./IRC_WEBCHAT_WORKFLOW_UPDATE_PLAN.md#example-2-handle-commandjson-updated)

---

## 3. join-channel.json

**What it does**: Add user to channel with mode-based access control

**Channel Modes**:
- `public` - Anyone can join
- `private` - Level 2+ required
- `secret` - Level 3+ required

**Nodes**:
- `validate_context` - Check user authenticated
- `fetch_channel` - Get channel details (with tenantId filter)
- `check_channel_mode` - Enforce access control
- `create_membership` - Record join with tenantId
- `emit_join` - Broadcast user_joined event

**Key Points**:
- ✅ Fetch includes `tenantId` filter
- ✅ Create includes `tenantId` in data
- 🔒 Mode check: `public || (private && level>=2) || (secret && level>=3)`

**Updated Example in**: [IRC_WEBCHAT_WORKFLOW_UPDATE_PLAN.md](./IRC_WEBCHAT_WORKFLOW_UPDATE_PLAN.md#example-3-join-channeljson-updated)

---

## 4. list-channels.json

**What it does**: Return filtered channel list by permission level

**Visibility Rules**:
- Level 0: Only public channels
- Level 2+: Public + private channels
- Level 3+: Public + private + secret channels

**Nodes**:
- `validate_context` - Check tenantId present
- `extract_params` - Determine visibility flags from level
- `build_filter` - Create MongoDB $in filter
- `fetch_channels` - Query with filter (tenantId scoped)
- `return_success` - HTTP 200 response

**Key Points**:
- ✅ Always includes tenantId in filter
- ✅ Uses MongoDB `$in` operator for mode list
- ✅ Sorts by `createdAt: -1` (newest first)

**Updated Example in**: [IRC_WEBCHAT_WORKFLOW_UPDATE_PLAN.md](./IRC_WEBCHAT_WORKFLOW_UPDATE_PLAN.md#example-4-list-channelsjson-updated)

---

## Validation Checklist (Per Workflow)

### Root Level
- [ ] `id`: `wf_irc_{name}_{8_hex_chars}`
- [ ] `versionId`: `v1.0.0`
- [ ] `name`: Human-readable (50 chars max)
- [ ] `description`: 50-200 words
- [ ] `active`: `false`
- [ ] `tenantId`: Present
- [ ] `category`: Correct enum
- [ ] `tags`: 3-5 relevant tags
- [ ] `meta`: Package, endpoint, auth info
- [ ] `settings`: Timezone, timeout, error handling

### Nodes
- [ ] Each has `id`, `name`, `type`, `typeVersion`, `position`
- [ ] Each has `notes` field (20-150 words)
- [ ] All parameters use `{{ ... }}` syntax
- [ ] All database ops include `tenantId` filter/data

### Connections
- [ ] No circular references (DAG)
- [ ] All target nodes exist
- [ ] Proper n8n format: `NodeName → main → 0 → [targets]`

### Multi-Tenant
- [ ] Top-level `tenantId` field
- [ ] All database reads filter by `tenantId`
- [ ] All database writes include `tenantId`
- [ ] No cross-tenant data leaks

---

## File Paths

```
packages/irc_webchat/workflow/
├── send-message.json       ← Update #1
├── handle-command.json     ← Update #2
├── join-channel.json       ← Update #3
└── list-channels.json      ← Update #4
```

---

## Related Schemas

- **N8N Workflow Schema**: `/schemas/n8n-workflow.schema.json`
- **MetaBuilder v3 Schema**: `/dbal/shared/api/schema/workflow/metabuilder-workflow-v3.schema.json`
- **IRC Entity Schema**: `/dbal/shared/api/schema/entities/packages/irc.yaml`

---

## Testing Commands

```bash
# Validate all workflows against schemas
npx ajv validate -s schemas/metabuilder-workflow-v3.schema.json \
  -d packages/irc_webchat/workflow/*.json --verbose

# Run IRC webchat tests
npm run test:package irc_webchat

# Full E2E test
npm run test:e2e packages/irc_webchat
```

---

## Common Mistakes to Avoid

❌ **Missing tenantId**
```json
// WRONG
{ "filter": { "id": "..." } }

// RIGHT
{ "filter": { "id": "...", "tenantId": "{{ $context.tenantId }}" } }
```

❌ **Wrong field syntax**
```json
// WRONG
{ "parameters": { "input": "$context.user.id" } }

// RIGHT
{ "parameters": { "input": "{{ $context.user.id }}" } }
```

❌ **Incomplete node references**
```json
// WRONG
{ "node": "Validate", "type": "main" }

// RIGHT
{ "node": "Validate Context", "type": "main", "index": 0 }
```

❌ **Circular connections**
```
A → B → C → A  // ❌ CYCLE!
A → B → C      // ✅ LINEAR DAG
```

---

## Quick Copy-Paste ID Generator

Generate new workflow IDs using this pattern:

```
wf_irc_send_message_7a8f9e1b
wf_irc_handle_command_b2c3d4e5
wf_irc_join_channel_c3d4e5f6
wf_irc_list_channels_d4e5f6g7
```

Format: `wf_irc_{workflow_name}_{random_8_hex}`

---

## Full Implementation Plan

See: **[IRC_WEBCHAT_WORKFLOW_UPDATE_PLAN.md](./IRC_WEBCHAT_WORKFLOW_UPDATE_PLAN.md)**

Contains:
- Detailed current state analysis
- 7 required changes with examples
- Complete updated JSON for all 4 workflows
- Validation checklist
- Testing strategy
- Success criteria

---

**Last Updated**: 2026-01-22
**Document**: Quick Reference
**Status**: Ready for Implementation
