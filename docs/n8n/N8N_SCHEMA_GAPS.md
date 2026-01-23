# N8N Schema Gaps Analysis

**Date**: 2026-01-22
**Status**: Schema Comparison Complete
**Purpose**: Document what's missing in the n8n schema compared to MetaBuilder's enterprise requirements

---

## Executive Summary

The n8n workflow schema from AutoMetabuilder is **simpler and more minimal** than MetaBuilder's comprehensive v3 schema. While n8n covers the basics, it's missing several enterprise-grade features that MetaBuilder v3 provides.

**Risk Level**: 🟡 MEDIUM - Core functionality preserved, but losing advanced features

---

## Missing High-Priority Features

### 1. Multi-Tenancy Support ❌

**MetaBuilder v3 Has**:
```yaml
tenantId:
  description: Multi-tenant scoping
  type: string
  format: uuid

multiTenancy:
  enforced: true
  tenantIdField: "tenantId"
  restrictNodeTypes: ["raw-sql", "eval", "shell-exec"]
  allowCrossTenantAccess: false
  auditLogging: true
```

**N8N Schema**: ❌ **MISSING ENTIRELY**

**Impact**: 🔴 **CRITICAL**
- No first-class multi-tenant support
- Must manually add `tenantId` to every node's parameters
- No schema-level enforcement of tenant isolation
- Security risk if not manually added everywhere

**Workaround**: Store `tenantId` in workflow `meta` and node `parameters`

---

### 2. Workflow Variables ❌

**MetaBuilder v3 Has**:
```yaml
variables:
  description: Workflow-level variables for reuse and templating
  type: object
  additionalProperties:
    $ref: "#/$defs/workflowVariable"
  default: {}

workflowVariable:
  name: string
  type: enum[string, number, boolean, array, object, date, any]
  defaultValue: any
  required: boolean
  scope: enum[workflow, execution, global]
```

**N8N Schema**: ❌ **MISSING ENTIRELY**

**Impact**: 🟠 **MEDIUM**
- Can't define reusable workflow variables
- Must hardcode values or use parameters
- No type safety for variables
- Less maintainable workflows

**Workaround**: Use workflow `meta` field or node parameters

---

### 3. Enhanced Error Handling ❌

**MetaBuilder v3 Has**:
```yaml
errorHandling:
  default: "stopWorkflow"
  nodeOverrides: { "nodeId": "continueRegularOutput" }
  errorLogger: "nodeId"
  errorNotification: true
  notifyChannels: ["email", "slack"]

retryPolicy:
  enabled: true
  maxAttempts: 3
  backoffType: enum[linear, exponential, fibonacci]
  initialDelay: 1000
  maxDelay: 60000
  retryableErrors: ["TIMEOUT", "RATE_LIMIT"]
  retryableStatusCodes: [408, 429, 500, 502, 503, 504]
```

**N8N Schema Has** (Partial):
```json
{
  "retryOnFail": "boolean",
  "maxTries": "integer",
  "waitBetweenTries": "integer (ms)",
  "continueOnFail": "boolean",
  "onError": "enum[stopWorkflow, continueRegularOutput, continueErrorOutput]"
}
```

**Impact**: 🟠 **MEDIUM**
- Node-level retry exists but limited (no backoff strategies)
- No workflow-level error handling policy
- No error notification system
- No selective retryable error types

**Missing in N8N**:
- Workflow-level error policy
- Advanced backoff strategies (exponential, fibonacci)
- Retryable error type filtering
- Retryable HTTP status code lists
- Error notification channels
- Error logger node reference

---

### 4. Rate Limiting ❌

**MetaBuilder v3 Has**:
```yaml
rateLimiting:
  enabled: true
  requestsPerWindow: 100
  windowSeconds: 60
  key: enum[global, tenant, user, ip, custom]
  customKeyTemplate: string
  onLimitExceeded: enum[queue, reject, skip]
```

**N8N Schema**: ❌ **MISSING ENTIRELY**

**Impact**: 🟠 **MEDIUM**
- No built-in rate limiting for workflows
- Must implement in custom nodes
- No protection against workflow abuse
- No tenant/user-specific rate limits

**Workaround**: Implement in custom nodes or external middleware

---

### 5. Execution Limits ❌

**MetaBuilder v3 Has**:
```yaml
executionLimits:
  maxExecutionTime: 3600
  maxMemoryMb: 512
  maxNodeExecutions: 1000
  maxDataSizeMb: 50
  maxArrayItems: 10000
```

**N8N Schema Has** (Partial):
```json
{
  "settings": {
    "executionTimeout": "integer (seconds)"
  }
}
```

**Impact**: 🟢 **LOW**
- Has basic execution timeout
- Missing memory, node count, data size limits
- No array item truncation limits

**Missing in N8N**:
- Memory limits
- Max node execution count
- Max data size per node
- Array item limits

---

### 6. Input/Output Port Definitions ❌

**MetaBuilder v3 Has**:
```yaml
inputs:
  - name: "main"
    type: "main"
    index: 0
    maxConnections: -1
    dataTypes: ["any"]
    required: false

outputs:
  - name: "main"
    type: "main"
    index: 0
    maxConnections: -1
    dataTypes: ["any"]
```

**N8N Schema**: ❌ **MISSING ENTIRELY**

**Impact**: 🟠 **MEDIUM**
- Connections are implicit, not explicitly defined
- Can't enforce port connection requirements
- No port-level metadata or documentation
- Can't specify expected data types per port

**Workaround**: Document in node `notes` field

---

### 7. Workflow Categories & Organization ❌

**MetaBuilder v3 Has**:
```yaml
category: enum[
  automation,
  integration,
  business-logic,
  data-transformation,
  notification,
  approval,
  other
]
locked: boolean
createdBy: uuid
```

**N8N Schema Has** (Partial):
```json
{
  "tags": [{"id": "string", "name": "string"}],
  "active": "boolean"
}
```

**Impact**: 🟢 **LOW**
- Has tags for categorization
- Missing predefined category enum
- No workflow locking mechanism
- No creator tracking

**Missing in N8N**:
- Predefined category system
- Workflow lock status (prevent editing)
- Creator user ID tracking

---

### 8. Version History Tracking ❌

**MetaBuilder v3 Has**:
```yaml
versionHistory:
  - versionId: string
    createdAt: date-time
    createdBy: uuid
    message: string
    changesSummary: string
```

**N8N Schema Has** (Partial):
```json
{
  "versionId": "string",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

**Impact**: 🟢 **LOW**
- Has single version ID
- Missing version history array
- No change messages or summaries
- Can't track who made each version

**Missing in N8N**:
- Version history array
- Change messages per version
- Creator tracking per version

---

### 9. Enhanced Node Properties ❌

**MetaBuilder v3 Has**:
```yaml
description: string (1000 chars)
nodeType: string (detailed classification)
size: [width, height]
parameterSchema: object (JSON Schema for validation)
skipOnFail: boolean
timeout: integer (node-specific timeout)
errorOutput: string (route errors to specific port)
color: string (hex or named color)
icon: string (node icon identifier)
metadata: object (custom node metadata)
```

**N8N Schema Has** (Partial):
```json
{
  "notes": "string",
  "position": "[x, y]"
}
```

**Impact**: 🟢 **LOW**
- Has basic notes and position
- Missing detailed description field
- No node sizing
- No parameter schema validation
- No visual customization (color, icon)

**Missing in N8N**:
- Node description (separate from notes)
- Node type classification
- Node dimensions (width, height)
- Parameter JSON Schema validation
- Skip on fail option
- Node-specific timeout
- Error output routing
- Visual customization (color, icon)
- Custom metadata

---

### 10. Advanced Trigger Features ❌

**MetaBuilder v3 Has**:
```yaml
triggers:
  - nodeId: string
    kind: enum[webhook, schedule, manual, event, email, message-queue, webhook-listen, polling, custom]
    webhookUrl: uri (generated)
    webhookMethods: [GET, POST, PUT, DELETE, PATCH]
    schedule: string (cron expression)
    timezone: string
    eventType: string
    eventFilters: object
    rateLimiting: $ref
```

**N8N Schema Has** (Partial):
```json
{
  "triggers": [
    {
      "nodeId": "string",
      "kind": "enum[webhook, schedule, queue, email, poll, manual, other]",
      "enabled": "boolean",
      "meta": "object"
    }
  ],
  "settings": {
    "timezone": "string"
  }
}
```

**Impact**: 🟢 **LOW**
- Has basic trigger support
- Missing webhook-specific fields
- No event filtering
- No trigger-level rate limiting

**Missing in N8N**:
- Webhook URL (generated)
- Webhook HTTP methods
- Cron schedule expression
- Event type and filters
- Trigger-specific rate limiting

---

## Feature Comparison Matrix

| Feature | MetaBuilder v3 | N8N Schema | Gap Severity |
|---------|----------------|------------|--------------|
| **Multi-Tenancy** | ✅ Full support | ❌ None | 🔴 CRITICAL |
| **Workflow Variables** | ✅ Full support | ❌ None | 🟠 MEDIUM |
| **Error Handling** | ✅ Advanced | ⚠️ Basic | 🟠 MEDIUM |
| **Rate Limiting** | ✅ Full support | ❌ None | 🟠 MEDIUM |
| **Execution Limits** | ✅ Full support | ⚠️ Timeout only | 🟢 LOW |
| **Port Definitions** | ✅ Explicit | ❌ Implicit | 🟠 MEDIUM |
| **Categories** | ✅ Enum + tags | ⚠️ Tags only | 🟢 LOW |
| **Version History** | ✅ Full history | ⚠️ Single version | 🟢 LOW |
| **Node Properties** | ✅ Rich metadata | ⚠️ Basic | 🟢 LOW |
| **Trigger Features** | ✅ Advanced | ⚠️ Basic | 🟢 LOW |

---

## Recommended Approach

### Option 1: Use N8N Schema + Custom Extensions (RECOMMENDED)

**Strategy**: Adopt n8n schema as base, add MetaBuilder-specific extensions in `meta` field

**Pros**:
- Compatible with n8n ecosystem
- Python executor works immediately
- Can add custom fields without breaking n8n
- Gradual enhancement path

**Cons**:
- No schema validation for custom fields
- Must manually preserve multi-tenancy
- Advanced features in unstructured `meta`

**Implementation**:
```json
{
  "name": "My Workflow",
  "nodes": [...],
  "connections": {...},
  "meta": {
    "metabuilder": {
      "tenantId": "uuid",
      "category": "automation",
      "variables": {...},
      "rateLimiting": {...},
      "executionLimits": {...}
    }
  }
}
```

---

### Option 2: Extend N8N Schema (HYBRID)

**Strategy**: Create `metabuilder-workflow-n8n-extended.schema.json` that extends n8n with additional fields

**Pros**:
- Full schema validation
- Type safety for all features
- Best of both worlds
- Can validate with JSON Schema

**Cons**:
- Not pure n8n schema
- May not work with n8n tooling
- More complex maintenance

**Implementation**: Merge n8n schema + MetaBuilder v3 schema, use `allOf` composition

---

### Option 3: Dual Schema Support (COMPLEX)

**Strategy**: Support both schemas, convert at runtime

**Pros**:
- Maximum flexibility
- Can use either format
- Future-proof

**Cons**:
- High complexity
- Runtime conversion overhead
- Testing burden doubled

---

## Migration Impact Analysis

### Critical Losses (Must Address)

1. **Multi-Tenancy** 🔴
   - **Solution**: Always add `tenantId` to workflow `meta` and node `parameters`
   - **Code**: Update migration script to inject tenantId everywhere
   - **Validation**: Create linter to check all workflows have tenantId

2. **Workflow Variables** 🟠
   - **Solution**: Store in workflow `meta.metabuilder.variables`
   - **Code**: Executor must load variables from meta
   - **Impact**: Minor - workflows still work, just less elegant

3. **Error Handling** 🟠
   - **Solution**: Use n8n's node-level retry, add policy to meta
   - **Code**: Executor interprets meta.errorHandling
   - **Impact**: Minor - basic retry exists, advanced features in meta

4. **Rate Limiting** 🟠
   - **Solution**: Implement in node executors, config in meta
   - **Code**: Rate limiter middleware reads meta.rateLimiting
   - **Impact**: Moderate - must implement in executor

### Acceptable Losses (Can Defer)

5. **Port Definitions** - Document in notes
6. **Version History** - Store in external database
7. **Advanced Node Metadata** - Use meta field
8. **Execution Limits** - Implement in executor
9. **Categories** - Use tags + meta
10. **Enhanced Triggers** - Store details in meta

---

## Action Items

### Immediate (Before Migration)

- [x] Document schema gaps
- [ ] Update migration script to preserve tenantId in meta
- [ ] Add metabuilder section to meta for extensions
- [ ] Create validation script for tenantId presence

### Short-Term (Post Migration)

- [ ] Update executor to read meta.metabuilder extensions
- [ ] Implement rate limiting from meta
- [ ] Add variable support from meta
- [ ] Enhanced error handling from meta

### Long-Term (Future Enhancement)

- [ ] Create extended schema (Option 2)
- [ ] Build schema validator
- [ ] Add visual workflow editor with extended features
- [ ] Contribute enhancements back to n8n schema

---

## Conclusion

The n8n schema is **functional but minimal**. MetaBuilder v3's enterprise features must be preserved through the `meta` field or by creating an extended schema.

**Recommendation**: Use **Option 1** (N8N + Custom Extensions) for immediate compatibility, then consider **Option 2** (Extended Schema) for long-term type safety.

**Critical Action**: Ensure `tenantId` is preserved in all migrated workflows - this is a **security requirement**.

---

**Status**: Analysis Complete
**Risk**: 🟡 MEDIUM (manageable with proper migration)
**Next Step**: Update migration script to preserve MetaBuilder-specific fields in `meta`
