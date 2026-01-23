# Dashboard Workflow Update - Quick Reference

**Status**: Complete Update Plan Ready
**Location**: [DASHBOARD_WORKFLOW_UPDATE_PLAN.md](./DASHBOARD_WORKFLOW_UPDATE_PLAN.md)
**Date**: 2026-01-22

---

## Overview

4 PackageRepo dashboard workflows require updates for full n8n compliance and MetaBuilder multi-tenant safety.

**Current**: 65/100 compliance
**Target**: 100/100 compliance
**Time**: 4-6 hours implementation + 1-2 hours testing

---

## Workflows Affected

1. **auth_login.json** - User authentication (JWT token generation)
2. **list_versions.json** - Package version enumeration
3. **download_artifact.json** - Binary artifact retrieval
4. **resolve_latest.json** - Latest version resolution

---

## Critical Changes Required

### Root-Level Metadata (New Fields)

```json
{
  "id": "workflow_auth_login",
  "version": "1.0.0",
  "versionId": "v1-auth-login-20260122-001",
  "tenantId": null,
  "description": "Authenticates user credentials and generates JWT token",
  "tags": ["authentication", "security", "api"],
  "createdAt": 1737554522000,
  "updatedAt": 1737554522000,
  "createdBy": "system",
  "updatedBy": "system",
  "meta": { /* 15 fields documenting purpose, api route, performance, team */ }
}
```

### Enhanced Meta Structure

```json
{
  "meta": {
    "description": "POST /api/v1/auth/login - User authentication",
    "purpose": "internal",
    "category": "authentication",
    "apiRoute": "/api/v1/auth/login",
    "httpMethod": "POST",
    "requiresAuth": false,
    "expectedDuration": 150,
    "retryable": false,
    "cacheable": false,
    "context": {
      "timezone": "UTC",
      "executionTimeout": 3600,
      "maxParallelDepth": 2
    },
    "team": "PackageRepo",
    "owner": "platform-team",
    "tags": ["authentication", "security", "jwt"]
  }
}
```

### Node Enhancements

Add documentation and error handling:

```json
{
  "id": "verify_password",
  "name": "Verify Password",
  "type": "packagerepo.auth_verify_password",
  "typeVersion": 1,
  "position": [700, 100],
  "notes": "Validate credentials against password hash",  // NEW
  "continueOnFail": false,                               // NEW
  "retryOnFail": { "max": 0, "delay": 0 },               // NEW
  "parameters": { /* ... */ }
}
```

### Connection Mapping

Populate empty connections object with n8n adjacency map:

```json
{
  "connections": {
    "parse_body": {
      "main": {
        "0": [
          { "node": "validate_fields", "type": "main", "index": 0 }
        ]
      }
    },
    "validate_fields": {
      "main": {
        "0": [
          { "node": "verify_password", "type": "main", "index": 0 },
          { "node": "error_invalid_request", "type": "main", "index": 0 }
        ]
      }
    }
    /* ... rest of connections ... */
  }
}
```

---

## Validation Checklist

### Must Have (Critical)
- [x] `id` field (format: `workflow_[name]`)
- [x] `version` field (semantic: "1.0.0")
- [x] `versionId` field (unique identifier)
- [x] `tenantId` field (null for system-wide)
- [x] `description` field (workflow purpose)
- [x] `meta` object with 15+ fields
- [x] Populated `connections` object (n8n format)
- [x] Node-level `notes` on complex nodes
- [x] `createdAt` and `updatedAt` timestamps

### Should Have (High Priority)
- [x] `tags` array for categorization
- [x] `createdBy` and `updatedBy` fields
- [x] `continueOnFail` on error nodes
- [x] `retryOnFail` on network I/O nodes
- [x] All node types defined in executor registry

### Nice to Have (Recommended)
- [x] Performance tuning notes in meta
- [x] Security considerations documented
- [x] Team/owner information in meta
- [x] Cache settings metadata

---

## Field Summary by Workflow

### auth_login.json
- **Purpose**: JWT token generation
- **API Route**: POST /api/v1/auth/login
- **Duration**: ~150ms
- **Cacheable**: No
- **Nodes**: 7 (parse, validate, verify, generate, respond, errors)

### list_versions.json
- **Purpose**: List all package versions
- **API Route**: GET /api/v1/:namespace/:name/versions
- **Duration**: ~200ms
- **Cacheable**: Yes
- **Nodes**: 7 (parse, normalize, query, check, enrich, respond, error)

### download_artifact.json
- **Purpose**: Stream binary artifact to client
- **API Route**: GET /api/v1/:namespace/:name/:version/:variant/blob
- **Duration**: ~500ms
- **Cacheable**: No
- **Nodes**: 8 (parse, normalize, get_meta, check, read, verify, respond, errors)

### resolve_latest.json
- **Purpose**: Find latest semantic version
- **API Route**: GET /api/v1/:namespace/:name/latest
- **Duration**: ~250ms
- **Cacheable**: Yes
- **Nodes**: 8 (parse, normalize, query, check, find, get_meta, respond, error)

---

## Implementation Checklist

### Phase 1: Preparation
- [ ] Back up all 4 workflow files
- [ ] Create feature branch: `feature/dashboard-workflow-update`
- [ ] Review plan with team
- [ ] Set up test environment

### Phase 2-5: Update Each Workflow
- [ ] Add root-level metadata fields
- [ ] Create meta structure (15+ fields)
- [ ] Add node-level documentation (notes)
- [ ] Populate connections adjacency map
- [ ] Add error handling configuration
- [ ] Validate against JSON schema

### Phase 6: Testing
- [ ] Schema validation (ajv)
- [ ] Execution tests
- [ ] Integration tests
- [ ] Multi-tenant safety checks
- [ ] Security review

### Phase 7: Deployment
- [ ] Code review approval
- [ ] Merge to main branch
- [ ] Deploy to staging
- [ ] Monitor execution logs
- [ ] Deploy to production

---

## Key File Locations

**Plan Document**:
```
/Users/rmac/Documents/metabuilder/docs/DASHBOARD_WORKFLOW_UPDATE_PLAN.md
```

**Workflow Files**:
```
/Users/rmac/Documents/metabuilder/packagerepo/backend/workflows/
  ├── auth_login.json
  ├── list_versions.json
  ├── download_artifact.json
  └── resolve_latest.json
```

**Schema Validators**:
```
/Users/rmac/Documents/metabuilder/schemas/package-schemas/
  ├── workflow.schema.json (main workflow schema)
  └── credential.schema.json (credential validation)
```

**Related Documentation**:
```
/Users/rmac/Documents/metabuilder/docs/
  ├── N8N_COMPLIANCE_AUDIT.md
  ├── CLAUDE.md
  ├── MULTI_TENANT_AUDIT.md
  └── RATE_LIMITING_GUIDE.md
```

---

## Example: Full Updated Workflow (auth_login.json)

See **Section 3.1** of [DASHBOARD_WORKFLOW_UPDATE_PLAN.md](./DASHBOARD_WORKFLOW_UPDATE_PLAN.md) for complete JSON example with:
- All metadata fields
- Connections adjacency map (7 nodes, 6 edges)
- Node-level documentation
- Error handling configuration
- Multi-tenant safety notes

---

## JSON Schema Validation Commands

```bash
# Install validator
npm install -g ajv-cli

# Validate each workflow
ajv validate -s /Users/rmac/Documents/metabuilder/schemas/package-schemas/workflow.schema.json \
  -d /Users/rmac/Documents/metabuilder/packagerepo/backend/workflows/auth_login.json

ajv validate -s /Users/rmac/Documents/metabuilder/schemas/package-schemas/workflow.schema.json \
  -d /Users/rmac/Documents/metabuilder/packagerepo/backend/workflows/list_versions.json

ajv validate -s /Users/rmac/Documents/metabuilder/schemas/package-schemas/workflow.schema.json \
  -d /Users/rmac/Documents/metabuilder/packagerepo/backend/workflows/download_artifact.json

ajv validate -s /Users/rmac/Documents/metabuilder/schemas/package-schemas/workflow.schema.json \
  -d /Users/rmac/Documents/metabuilder/packagerepo/backend/workflows/resolve_latest.json
```

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| **Compliance Score** | 100/100 | Achievable |
| **Critical Issues** | 0 | Expected |
| **Node Documentation** | 100% | Achievable |
| **Connection Mapping** | 100% | Achievable |
| **Schema Validation** | 100% | Expected |
| **Execution Tests Pass** | 100% | Expected |

---

## Notes

1. **No Breaking Changes**: All updates are additive; existing workflows remain compatible
2. **Backward Compatible**: Only adding metadata, not removing or changing existing fields
3. **Git History**: Preserves original workflows in commit history
4. **Testable**: Each workflow can be validated independently before deployment
5. **Reusable**: Metadata structure serves as template for future workflows

---

## Timeline Estimate

| Phase | Task | Duration | Cumulative |
|-------|------|----------|-----------|
| 1 | Preparation | 30 min | 30 min |
| 2 | auth_login | 45 min | 75 min |
| 3 | list_versions | 45 min | 120 min |
| 4 | download_artifact | 45 min | 165 min |
| 5 | resolve_latest | 45 min | 210 min |
| 6 | Validation & Testing | 60 min | 270 min |
| 7 | Deployment | 30 min | 300 min |

**Total**: ~5 hours (4-6 depending on review feedback)

---

For detailed implementation guide, see [DASHBOARD_WORKFLOW_UPDATE_PLAN.md](./DASHBOARD_WORKFLOW_UPDATE_PLAN.md)
