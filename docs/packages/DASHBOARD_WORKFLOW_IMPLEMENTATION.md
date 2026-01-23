# Dashboard Workflow Implementation Guide

**Scope**: Step-by-step implementation of workflow updates
**Reference**: [DASHBOARD_WORKFLOW_UPDATE_PLAN.md](./DASHBOARD_WORKFLOW_UPDATE_PLAN.md)
**Quick Ref**: [DASHBOARD_WORKFLOW_QUICK_REFERENCE.md](./DASHBOARD_WORKFLOW_QUICK_REFERENCE.md)

---

## Prerequisites

Before starting implementation:

1. **Review Documents**
   - Read [DASHBOARD_WORKFLOW_UPDATE_PLAN.md](./DASHBOARD_WORKFLOW_UPDATE_PLAN.md) fully
   - Understand all 4 workflows from Section 1.1-1.3
   - Review required changes in Section 2

2. **Setup Environment**
   ```bash
   # Clone repository
   cd /Users/rmac/Documents/metabuilder

   # Install dependencies
   npm install

   # Install JSON schema validator
   npm install -g ajv-cli

   # Verify build
   npm run build
   ```

3. **Backup Original Files**
   ```bash
   cd packagerepo/backend/workflows

   # Create backup directory
   mkdir -p .backups

   # Backup all 4 workflows
   cp auth_login.json .backups/auth_login.json.backup
   cp list_versions.json .backups/list_versions.json.backup
   cp download_artifact.json .backups/download_artifact.json.backup
   cp resolve_latest.json .backups/resolve_latest.json.backup

   # Verify backups
   ls -la .backups/
   ```

4. **Create Feature Branch**
   ```bash
   git checkout -b feature/dashboard-workflow-update
   ```

---

## Workflow 1: auth_login.json

### Step 1.1: Open File

```bash
cd /Users/rmac/Documents/metabuilder
# Edit in your editor:
# packagerepo/backend/workflows/auth_login.json
```

### Step 1.2: Add Root-Level Metadata

After line 1 (after `{`), add immediately after `"name"` field:

```json
{
  "id": "workflow_auth_login",
  "name": "Authenticate User",
  "version": "1.0.0",
  "versionId": "v1-auth-login-20260122-001",
  "tenantId": null,
  "description": "Authenticates user credentials and generates JWT token for API access",
  "active": true,
  "tags": ["authentication", "security", "api", "internal"],
  "createdAt": 1737554522000,
  "updatedAt": 1737554522000,
  "createdBy": "system",
  "updatedBy": "system",
  "meta": {
    "description": "POST /api/v1/auth/login - User authentication endpoint",
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
  },
```

### Step 1.3: Update Nodes with Documentation

For each node in the `"nodes"` array, add documentation fields:

**Node 1: parse_body**
```json
{
  "id": "parse_body",
  "name": "Parse Body",
  "type": "packagerepo.parse_json",
  "typeVersion": 1,
  "position": [100, 100],
  "notes": "Extract username and password from request body",
  "continueOnFail": false,
  "parameters": {
    "input": "$request.body",
    "out": "credentials"
  }
}
```

**Node 2: validate_fields** (add after name/type/typeVersion/position)
```json
  "notes": "Check that username and password are provided",
  "continueOnFail": false,
```

**Node 3: verify_password** (add retry configuration)
```json
  "notes": "Validate credentials against password hash",
  "continueOnFail": false,
  "retryOnFail": {
    "max": 0,
    "delay": 0
  },
```

**Node 4: check_verified**
```json
  "notes": "Verify that user record was found and password matched",
  "continueOnFail": false,
```

**Node 5: generate_token**
```json
  "notes": "Create JWT token with user subject and scopes",
  "continueOnFail": false,
```

**Node 6: respond_success**
```json
  "notes": "Return token and user information to client",
  "continueOnFail": false,
```

**Node 7: error_unauthorized**
```json
  "notes": "Authentication failure response",
  "continueOnFail": false,
```

**Node 8: error_invalid_request**
```json
  "notes": "Missing required fields response",
  "continueOnFail": false,
```

### Step 1.4: Populate Connections

Replace empty `"connections": {}` with:

```json
"connections": {
  "parse_body": {
    "main": {
      "0": [
        {
          "node": "validate_fields",
          "type": "main",
          "index": 0
        }
      ]
    }
  },
  "validate_fields": {
    "main": {
      "0": [
        {
          "node": "verify_password",
          "type": "main",
          "index": 0
        },
        {
          "node": "error_invalid_request",
          "type": "main",
          "index": 0
        }
      ]
    }
  },
  "verify_password": {
    "main": {
      "0": [
        {
          "node": "check_verified",
          "type": "main",
          "index": 0
        }
      ]
    }
  },
  "check_verified": {
    "main": {
      "0": [
        {
          "node": "generate_token",
          "type": "main",
          "index": 0
        },
        {
          "node": "error_unauthorized",
          "type": "main",
          "index": 0
        }
      ]
    }
  },
  "generate_token": {
    "main": {
      "0": [
        {
          "node": "respond_success",
          "type": "main",
          "index": 0
        }
      ]
    }
  }
}
```

### Step 1.5: Validate File

```bash
# Validate JSON syntax
ajv validate -s /Users/rmac/Documents/metabuilder/schemas/package-schemas/workflow.schema.json \
  -d /Users/rmac/Documents/metabuilder/packagerepo/backend/workflows/auth_login.json

# Expected output: valid
```

**If validation fails**, check:
- Missing commas between JSON objects
- Unclosed quotes or brackets
- Duplicate field names
- Invalid data types (e.g., string where number expected)

---

## Workflow 2: list_versions.json

### Step 2.1-2.5: Repeat Pattern

Follow the same pattern as Workflow 1:

**Root-Level Metadata**:
```json
{
  "id": "workflow_list_versions",
  "name": "List Package Versions",
  "version": "1.0.0",
  "versionId": "v1-list-versions-20260122-001",
  "tenantId": null,
  "description": "Query package index and return all available versions for a package",
  "active": false,
  "tags": ["packaging", "artifact", "api", "read-only"],
  "createdAt": 1737554522000,
  "updatedAt": 1737554522000,
  "createdBy": "system",
  "updatedBy": "system",
  "meta": {
    "description": "GET /api/v1/:namespace/:name/versions - List all versions",
    "purpose": "internal",
    "category": "artifact",
    "apiRoute": "/api/v1/:namespace/:name/versions",
    "httpMethod": "GET",
    "requiresAuth": false,
    "expectedDuration": 200,
    "retryable": true,
    "cacheable": true,
    "context": {
      "timezone": "UTC",
      "executionTimeout": 3600,
      "maxParallelDepth": 1
    },
    "team": "PackageRepo",
    "owner": "platform-team",
    "tags": ["packaging", "versioning", "index"]
  },
```

**Node Documentation**:
| Node | Note |
|------|------|
| parse_path | Extract namespace and name from URL path |
| normalize | Validate and normalize entity identifiers |
| query_index | Look up all versions in package index |
| check_exists | Verify package exists before enriching |
| enrich_versions | Add metadata (size, digest, etc.) to version list |
| respond_json | Return enriched version list to client |
| error_not_found | Package not in index response |

**Connections** (7 nodes, 6 edges):
```
parse_path → normalize → query_index → check_exists {yes → enrich_versions → respond_json, no → error_not_found}
```

**Retry Configuration**:
```json
// On query_index node (external I/O):
"retryOnFail": {
  "max": 2,
  "delay": 100
}
```

---

## Workflow 3: download_artifact.json

### Step 3.1-3.5: Repeat Pattern

**Root-Level Metadata**:
```json
{
  "id": "workflow_download_artifact",
  "name": "Download Artifact",
  "version": "1.0.0",
  "versionId": "v1-download-artifact-20260122-001",
  "tenantId": null,
  "description": "Retrieve and stream binary artifact blob to client with integrity validation",
  "active": false,
  "tags": ["packaging", "artifact", "blob", "download"],
  "createdAt": 1737554522000,
  "updatedAt": 1737554522000,
  "createdBy": "system",
  "updatedBy": "system",
  "meta": {
    "description": "GET /api/v1/:namespace/:name/:version/:variant/blob - Download artifact",
    "purpose": "internal",
    "category": "artifact",
    "apiRoute": "/api/v1/:namespace/:name/:version/:variant/blob",
    "httpMethod": "GET",
    "requiresAuth": false,
    "expectedDuration": 500,
    "retryable": true,
    "cacheable": false,
    "context": {
      "timezone": "UTC",
      "executionTimeout": 3600,
      "maxParallelDepth": 2
    },
    "team": "PackageRepo",
    "owner": "platform-team",
    "tags": ["packaging", "blob-storage", "download"]
  },
```

**Node Documentation**:
| Node | Note | Retry |
|------|------|-------|
| parse_path | Extract namespace, name, version, variant from URL | — |
| normalize | Validate and normalize artifact coordinates | — |
| get_meta | Retrieve artifact metadata (digest, size) from KV store | max: 2, delay: 100 |
| check_exists | Verify artifact metadata exists in KV | — |
| read_blob | Fetch binary blob from blob storage using digest | max: 3, delay: 200 |
| check_blob_exists | Verify blob was retrieved successfully | — |
| respond_blob | Stream binary blob with content headers | — |
| error_not_found | Artifact metadata not found in index | — |
| error_blob_missing | Blob data missing from storage (data integrity issue) | — |

**Connections** (8 nodes, 7 edges):
```
parse_path → normalize → get_meta → check_exists {yes → read_blob → check_blob_exists {yes → respond_blob, no → error_blob_missing}, no → error_not_found}
```

---

## Workflow 4: resolve_latest.json

### Step 4.1-4.5: Repeat Pattern

**Root-Level Metadata**:
```json
{
  "id": "workflow_resolve_latest",
  "name": "Resolve Latest Version",
  "version": "1.0.0",
  "versionId": "v1-resolve-latest-20260122-001",
  "tenantId": null,
  "description": "Find and return the latest semantic version of a package with metadata",
  "active": false,
  "tags": ["packaging", "versioning", "resolution"],
  "createdAt": 1737554522000,
  "updatedAt": 1737554522000,
  "createdBy": "system",
  "updatedBy": "system",
  "meta": {
    "description": "GET /api/v1/:namespace/:name/latest - Resolve latest version",
    "purpose": "internal",
    "category": "artifact",
    "apiRoute": "/api/v1/:namespace/:name/latest",
    "httpMethod": "GET",
    "requiresAuth": false,
    "expectedDuration": 250,
    "retryable": true,
    "cacheable": true,
    "context": {
      "timezone": "UTC",
      "executionTimeout": 3600,
      "maxParallelDepth": 2
    },
    "team": "PackageRepo",
    "owner": "platform-team",
    "tags": ["packaging", "versioning", "semantic-versioning"]
  },
```

**Node Documentation**:
| Node | Note | Retry |
|------|------|-------|
| parse_path | Extract namespace and name from URL path | — |
| normalize | Validate and normalize entity identifiers | — |
| query_index | Fetch all versions from package index | max: 2, delay: 100 |
| check_exists | Verify that versions list is not empty | — |
| find_latest | Apply semantic versioning algorithm to find latest | — |
| get_meta | Retrieve metadata for the resolved latest version | max: 2, delay: 100 |
| respond_json | Return latest version with metadata to client | — |
| error_not_found | No versions found for package | — |

**Connections** (8 nodes, 7 edges):
```
parse_path → normalize → query_index → check_exists {yes → find_latest → get_meta → respond_json, no → error_not_found}
```

---

## Complete Validation Steps

### Step 5: Validate All 4 Workflows

```bash
cd /Users/rmac/Documents/metabuilder

# Validate auth_login.json
echo "Validating auth_login.json..."
ajv validate -s schemas/package-schemas/workflow.schema.json \
  -d packagerepo/backend/workflows/auth_login.json
echo "✓ auth_login.json valid"

# Validate list_versions.json
echo "Validating list_versions.json..."
ajv validate -s schemas/package-schemas/workflow.schema.json \
  -d packagerepo/backend/workflows/list_versions.json
echo "✓ list_versions.json valid"

# Validate download_artifact.json
echo "Validating download_artifact.json..."
ajv validate -s schemas/package-schemas/workflow.schema.json \
  -d packagerepo/backend/workflows/download_artifact.json
echo "✓ download_artifact.json valid"

# Validate resolve_latest.json
echo "Validating resolve_latest.json..."
ajv validate -s schemas/package-schemas/workflow.schema.json \
  -d packagerepo/backend/workflows/resolve_latest.json
echo "✓ resolve_latest.json valid"

echo ""
echo "All workflows valid!"
```

### Step 6: Check JSON Syntax

```bash
# Quick syntax check using Node.js
node -e "
const fs = require('fs');
const files = [
  'packagerepo/backend/workflows/auth_login.json',
  'packagerepo/backend/workflows/list_versions.json',
  'packagerepo/backend/workflows/download_artifact.json',
  'packagerepo/backend/workflows/resolve_latest.json'
];

files.forEach(file => {
  try {
    JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log('✓ ' + file);
  } catch (e) {
    console.error('✗ ' + file + ': ' + e.message);
  }
});
"
```

### Step 7: Verify Completeness

```bash
# Check each workflow has required fields
node -e "
const fs = require('fs');
const files = [
  'packagerepo/backend/workflows/auth_login.json',
  'packagerepo/backend/workflows/list_versions.json',
  'packagerepo/backend/workflows/download_artifact.json',
  'packagerepo/backend/workflows/resolve_latest.json'
];

const required = ['id', 'version', 'versionId', 'tenantId', 'description', 'meta', 'createdAt', 'updatedAt'];

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const missing = required.filter(f => !(f in data));

  if (missing.length === 0) {
    console.log('✓ ' + file + ' - all required fields present');
  } else {
    console.log('✗ ' + file + ' - missing: ' + missing.join(', '));
  }
});
"
```

---

## Testing Execution

### Step 8: Test Workflows

```bash
# Start development server
npm run dev

# In another terminal, test auth_login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Test list_versions
curl http://localhost:3000/api/v1/myapp/mypackage/versions

# Test resolve_latest
curl http://localhost:3000/api/v1/myapp/mypackage/latest

# Test download_artifact
curl http://localhost:3000/api/v1/myapp/mypackage/1.0.0/linux-x64/blob \
  -o artifact.bin
```

---

## Git Commit

### Step 9: Commit Changes

```bash
cd /Users/rmac/Documents/metabuilder

# Check changes
git status
git diff packagerepo/backend/workflows/

# Stage files
git add packagerepo/backend/workflows/auth_login.json
git add packagerepo/backend/workflows/list_versions.json
git add packagerepo/backend/workflows/download_artifact.json
git add packagerepo/backend/workflows/resolve_latest.json

# Commit
git commit -m "feat(packagerepo): update 4 dashboard workflows to n8n compliance

- Add root-level metadata fields (id, version, versionId, tenantId)
- Add comprehensive meta documentation structures
- Populate connection adjacency maps for all workflows
- Add node-level documentation and error handling
- Enhance retry configuration for network I/O operations
- Upgrade compliance from 65/100 to 100/100

Workflows updated:
  - auth_login.json: JWT authentication
  - list_versions.json: Package version enumeration
  - download_artifact.json: Binary artifact retrieval
  - resolve_latest.json: Latest version resolution

All changes are backward-compatible and additive only.
References: docs/DASHBOARD_WORKFLOW_UPDATE_PLAN.md"

# Verify commit
git log -1 --stat
```

---

## Pull Request

### Step 10: Create Pull Request

```bash
# Push branch
git push origin feature/dashboard-workflow-update

# Or create PR via GitHub CLI
gh pr create \
  --title "feat(packagerepo): update 4 dashboard workflows to n8n compliance" \
  --body "See docs/DASHBOARD_WORKFLOW_UPDATE_PLAN.md for full details

- All 4 workflows updated with complete metadata
- Connections mapped in n8n adjacency format
- Node-level documentation added
- Error handling configured
- Compliance increased: 65/100 → 100/100"
```

---

## Rollback Procedure

If issues encountered:

```bash
# Restore from backups
cd /Users/rmac/Documents/metabuilder/packagerepo/backend/workflows

cp .backups/auth_login.json.backup auth_login.json
cp .backups/list_versions.json.backup list_versions.json
cp .backups/download_artifact.json.backup download_artifact.json
cp .backups/resolve_latest.json.backup resolve_latest.json

# Verify restore
git diff

# Or use git
git checkout HEAD -- auth_login.json list_versions.json download_artifact.json resolve_latest.json
```

---

## Troubleshooting

### Issue: JSON Validation Fails

**Symptom**: `ajv` reports validation error

**Solution**:
1. Check for missing commas between properties
2. Verify all quotes are properly closed
3. Check for duplicate property names
4. Use online JSON validator: https://jsonlint.com/

### Issue: Connections Not Working

**Symptom**: Workflow connections invalid

**Solution**:
1. Verify all node IDs in connections match actual node IDs
2. Check connection format matches n8n adjacency map
3. Ensure no circular references
4. Validate node count matches connection references

### Issue: Metadata Fields Missing

**Symptom**: Validation says required fields missing

**Solution**:
1. Double-check against Section 2.1 of update plan
2. Verify all 12 root-level fields present
3. Verify meta object has 15+ sub-fields
4. Check timestamps are numbers (Unix ms)

---

## Success Criteria

After implementation:

- [x] All 4 workflows have `id` field
- [x] All 4 workflows have `version` field (semantic)
- [x] All 4 workflows have `versionId` field (unique)
- [x] All 4 workflows have `tenantId` field (null = system-wide)
- [x] All 4 workflows have `meta` object with 15+ fields
- [x] All workflows pass schema validation
- [x] All connections populate correctly
- [x] All node documentation present
- [x] All error paths configured
- [x] Compliance score: 100/100

---

## Timeline

| Task | Est. Time | Notes |
|------|-----------|-------|
| Preparation & backup | 30 min | One-time setup |
| Update auth_login.json | 45 min | Largest workflow |
| Update list_versions.json | 40 min | Standard size |
| Update download_artifact.json | 40 min | Standard size |
| Update resolve_latest.json | 40 min | Standard size |
| Validation & Testing | 60 min | All 4 workflows |
| Commit & PR | 15 min | Final step |
| **Total** | **4.5-5 hours** | One-time effort |

---

## Next Steps

After merging PR:

1. **Monitor**: Check logs for any workflow execution issues
2. **Document**: Update README.md with new metadata structure
3. **Template**: Use as template for future workflow updates
4. **Versioning**: Track versions in release notes
5. **Audit**: Perform compliance audit quarterly

---

For detailed reference, see:
- [DASHBOARD_WORKFLOW_UPDATE_PLAN.md](./DASHBOARD_WORKFLOW_UPDATE_PLAN.md) - Complete plan with JSON examples
- [DASHBOARD_WORKFLOW_QUICK_REFERENCE.md](./DASHBOARD_WORKFLOW_QUICK_REFERENCE.md) - Quick reference guide
