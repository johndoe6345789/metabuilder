# PackageRepo Workflow Issues Matrix

**Date**: 2026-01-22
**Scope**: 8 workflows across backend and frontend
**Format**: Quick reference for identifying and prioritizing fixes

---

## Quick Reference Table

| # | Workflow | Missing Fields | Connection Issues | Node Issues | Priority | Effort |
|---|----------|---|---|---|---|---|
| 1 | auth_login.json | id, version, tenantId | None | None | P1 | 15min |
| 2 | download_artifact.json | id, version, tenantId | None | None | P1 | 15min |
| 3 | list_versions.json | id, version, tenantId | None | None | P1 | 15min |
| 4 | publish_artifact.json | id, version, tenantId | None | None | P1 | 15min |
| 5 | resolve_latest.json | id, version, tenantId | None | None | P1 | 15min |
| 6 | server.json | id, version, tenantId | 6x [object Object] | None | P1 | 30min |
| 7 | fetch_packages.json | id, tenantId | None | Missing typeVersion on 1 node | P2 | 15min |
| 8 | publish_package.json | id, tenantId | None | Missing typeVersion on 1 node | P2 | 15min |

---

## Detailed Issues by Workflow

### 1. auth_login.json

**Status**: 🔴 CRITICAL

| Issue Type | Count | Details | Fix |
|------------|-------|---------|-----|
| Missing `id` | 1 | No workflow identifier | Add: `"id": "auth_login_v1"` |
| Missing `version` | 1 | No version tracking | Add: `"version": "1.0.0"` |
| Missing `tenantId` | 1 | No tenant filtering | Add: `"tenantId": "default"` |
| **Total Issues** | **3** | All critical metadata missing | **Phase 1 Fix: 15 min** |

**Nodes**: 8 (all properly formed)
**Connections**: Empty object {} (acceptable with linear flow)

---

### 2. download_artifact.json

**Status**: 🔴 CRITICAL

| Issue Type | Count | Details | Fix |
|------------|-------|---------|-----|
| Missing `id` | 1 | No workflow identifier | Add: `"id": "download_artifact_v1"` |
| Missing `version` | 1 | No version tracking | Add: `"version": "1.0.0"` |
| Missing `tenantId` | 1 | No tenant filtering | Add: `"tenantId": "default"` |
| **Total Issues** | **3** | All critical metadata missing | **Phase 1 Fix: 15 min** |

**Nodes**: 9 (all properly formed)
**Connections**: Empty object {} (acceptable with linear flow)

---

### 3. list_versions.json

**Status**: 🔴 CRITICAL

| Issue Type | Count | Details | Fix |
|------------|-------|---------|-----|
| Missing `id` | 1 | No workflow identifier | Add: `"id": "list_versions_v1"` |
| Missing `version` | 1 | No version tracking | Add: `"version": "1.0.0"` |
| Missing `tenantId` | 1 | No tenant filtering | Add: `"tenantId": "default"` |
| **Total Issues** | **3** | All critical metadata missing | **Phase 1 Fix: 15 min** |

**Nodes**: 7 (all properly formed)
**Connections**: Empty object {} (acceptable with linear flow)

---

### 4. publish_artifact.json

**Status**: 🔴 CRITICAL

| Issue Type | Count | Details | Fix |
|------------|-------|---------|-----|
| Missing `id` | 1 | No workflow identifier | Add: `"id": "publish_artifact_v1"` |
| Missing `version` | 1 | No version tracking | Add: `"version": "1.0.0"` |
| Missing `tenantId` | 1 | No tenant filtering | Add: `"tenantId": "default"` |
| **Total Issues** | **3** | All critical metadata missing | **Phase 1 Fix: 15 min** |

**Nodes**: 13 (all properly formed)
**Connections**: Empty object {} (acceptable with linear flow)

---

### 5. resolve_latest.json

**Status**: 🔴 CRITICAL

| Issue Type | Count | Details | Fix |
|------------|-------|---------|-----|
| Missing `id` | 1 | No workflow identifier | Add: `"id": "resolve_latest_v1"` |
| Missing `version` | 1 | No version tracking | Add: `"version": "1.0.0"` |
| Missing `tenantId` | 1 | No tenant filtering | Add: `"tenantId": "default"` |
| **Total Issues** | **3** | All critical metadata missing | **Phase 1 Fix: 15 min** |

**Nodes**: 8 (all properly formed)
**Connections**: Empty object {} (acceptable with linear flow)

---

### 6. server.json

**Status**: 🔴 CRITICAL (WORST)

| Issue Type | Count | Details | Fix |
|------------|-------|---------|-----|
| Missing `id` | 1 | No workflow identifier | Add: `"id": "server_v1"` |
| Missing `version` | 1 | No version tracking | Add: `"version": "1.0.0"` |
| Missing `tenantId` | 1 | No tenant filtering | Add: `"tenantId": "default"` |
| Serialized objects | 6 | 6 nodes with `[object Object]` references | Replace with proper node IDs |
| **Total Issues** | **9** | Most problematic workflow | **Phase 1 Fix: 30 min** |

**Nodes**: 7 (properly formed)
**Connections**: 6 entries with broken references:
- Create App → [object Object]
- Register Publish → [object Object]
- Register Download → [object Object]
- Register Latest → [object Object]
- Register Versions → [object Object]
- Register Login → [object Object]

**Critical Impact**: Server cannot initialize; workflow execution will fail

---

### 7. fetch_packages.json

**Status**: 🟠 HIGH

| Issue Type | Count | Details | Fix |
|------------|-------|---------|-----|
| Missing `id` | 1 | No workflow identifier | Add: `"id": "fetch_packages_v1"` |
| Missing `tenantId` | 1 | No tenant filtering | Add: `"tenantId": "default"` |
| Missing typeVersion | 1 | Node "fetch_packages" lacks typeVersion | Add: `"typeVersion": 1` to node |
| ✅ Has `version` | - | Already: "1.0.0" | No action needed |
| **Total Issues** | **3** | Missing metadata + node typeVersion | **Phase 1-2 Fix: 20 min** |

**Nodes**: 3 (1 missing typeVersion)
**Connections**: Properly defined with node names as references (example of correct format)

---

### 8. publish_package.json

**Status**: 🟠 HIGH

| Issue Type | Count | Details | Fix |
|------------|-------|---------|-----|
| Missing `id` | 1 | No workflow identifier | Add: `"id": "publish_package_v1"` |
| Missing `tenantId` | 1 | No tenant filtering | Add: `"tenantId": "default"` |
| Missing typeVersion | 1 | Node "validate_form" lacks typeVersion | Add: `"typeVersion": 1` to node |
| ✅ Has `version` | - | Already: "1.0.0" | No action needed |
| **Total Issues** | **3** | Missing metadata + node typeVersion | **Phase 1-2 Fix: 20 min** |

**Nodes**: 6 (1 missing typeVersion)
**Connections**: Properly defined with node names as references (example of correct format)

---

## Summary by Issue Type

### Missing `id` Field
**Count**: 8/8 workflows (100%)

**Affected**:
1. auth_login.json
2. download_artifact.json
3. list_versions.json
4. publish_artifact.json
5. resolve_latest.json
6. server.json
7. fetch_packages.json
8. publish_package.json

**Fix**: Add root-level `id` field with descriptive identifier
**Effort**: 15 minutes (all workflows)
**Priority**: 🔴 CRITICAL

---

### Missing `version` Field
**Count**: 6/8 workflows (75%)

**Affected**:
1. auth_login.json
2. download_artifact.json
3. list_versions.json
4. publish_artifact.json
5. resolve_latest.json
6. server.json

**Not Affected** (already present):
- fetch_packages.json (has "1.0.0")
- publish_package.json (has "1.0.0")

**Fix**: Add root-level `version` field with value "1.0.0"
**Effort**: 15 minutes (6 workflows)
**Priority**: 🟠 HIGH

---

### Missing `tenantId` Field
**Count**: 8/8 workflows (100%)

**Affected**: ALL 8 workflows

**Fix**: Add root-level `tenantId` field with value "default"
**Effort**: 15 minutes (all workflows)
**Priority**: 🔴 CRITICAL

---

### Connection Serialization Errors
**Count**: 6 broken connections in 1 workflow

**Affected**:
- server.json (6/7 nodes have broken connections)

**Issue**: Connections contain string "[object Object]" instead of node ID references

**Broken Nodes**:
1. create_app
2. register_publish
3. register_download
4. register_latest
5. register_versions
6. register_login

**Fix**: Replace with proper node ID references
**Effort**: 30 minutes
**Priority**: 🔴 CRITICAL

---

### Missing `typeVersion` in Nodes
**Count**: 2 nodes across 2 workflows

**Affected Nodes**:
1. fetch_packages.json → fetch_packages node (type: api.get)
2. publish_package.json → validate_form node (type: validate.required)

**Fix**: Add `"typeVersion": 1` to affected nodes
**Effort**: 15 minutes
**Priority**: 🟠 HIGH

---

## Fix Sequence

### Phase 1: Critical (Do First - 1 hour)
```
1. Add id to all 8 workflows                      [15 min]
2. Add tenantId to all 8 workflows                [15 min]
3. Fix server.json connections                    [30 min]
   Total: 1 hour
```

### Phase 2: High Priority (Do Second - 1.5 hours)
```
1. Add version to 6 workflows                     [15 min]
2. Add typeVersion to 2 nodes                     [15 min]
3. Standardize node types (optional)              [45 min]
   Total: 1.5 hours
```

### Phase 3: Medium Priority (Do Third - 2 hours)
```
1. Add explicit connections to 6 workflows        [45 min]
2. Add descriptions to all workflows              [30 min]
3. Run validation                                 [15 min]
   Total: 1.5 hours
```

**Total Time**: 4-5 hours

---

## Validation Checklist

**Per Workflow, Verify**:
- [ ] Has `id` field
- [ ] Has `version` field (or inherits from phase 2)
- [ ] Has `tenantId` field
- [ ] All nodes have `typeVersion`
- [ ] No [object Object] in connections
- [ ] Connections are properly formed
- [ ] JSON is valid (no syntax errors)

**Global Validation**:
- [ ] Run: `npm run typecheck`
- [ ] Run: `npm run build`
- [ ] Run: `npm run test:e2e`
- [ ] All workflows pass schema validation

---

## File Locations

| Workflow | Path | Type |
|----------|------|------|
| auth_login.json | `/packagerepo/backend/workflows/` | Backend |
| download_artifact.json | `/packagerepo/backend/workflows/` | Backend |
| list_versions.json | `/packagerepo/backend/workflows/` | Backend |
| publish_artifact.json | `/packagerepo/backend/workflows/` | Backend |
| resolve_latest.json | `/packagerepo/backend/workflows/` | Backend |
| server.json | `/packagerepo/backend/workflows/` | Backend |
| fetch_packages.json | `/packagerepo/frontend/src/packages/repo_browse/workflow/` | Frontend |
| publish_package.json | `/packagerepo/frontend/src/packages/repo_publish/workflow/` | Frontend |

---

## Risk Indicators

| Workflow | Risk Level | Blocker | Impact |
|----------|-----------|---------|--------|
| auth_login.json | HIGH | No | Authentication flow broken without id/tenantId |
| download_artifact.json | HIGH | No | Download endpoint broken without id/tenantId |
| list_versions.json | HIGH | No | Version listing broken without id/tenantId |
| publish_artifact.json | HIGH | No | Artifact publish broken without id/tenantId |
| resolve_latest.json | HIGH | No | Latest resolution broken without id/tenantId |
| server.json | CRITICAL | **YES** | **Server fails to start** - 6 broken connections |
| fetch_packages.json | MEDIUM | No | Frontend fetch broken without id/tenantId |
| publish_package.json | MEDIUM | No | Frontend publish broken without id/tenantId |

---

## Recommendation

**Immediate Action Required**:
1. Fix `server.json` first (blocks all other work)
2. Add id/tenantId to all workflows
3. Add version/typeVersion to remaining workflows
4. Run full validation suite
5. Deploy after passing all tests

**Not Blocking**:
- Node type standardization (optional enhancement)
- Explicit connections (improves clarity but not required)
- Descriptions (improves documentation)

---

**Generated**: 2026-01-22
**Location**: `/Users/rmac/Documents/metabuilder/docs/PACKAGEREPO_ISSUES_MATRIX.md`
**Related**: `PACKAGEREPO_WORKFLOW_COMPLIANCE.md` (detailed fixes)
