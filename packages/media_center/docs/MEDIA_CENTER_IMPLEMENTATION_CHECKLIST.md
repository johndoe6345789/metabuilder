# Media Center Workflow Update - Implementation Checklist

**Target Date**: 2026-02-05
**Scope**: 4 workflows in `/packages/media_center/workflow/`
**Success Criteria**: All 4 workflows pass n8n schema validation + multi-tenant audit

---

## Pre-Implementation Verification

### Repository State
- [ ] On clean `main` branch
- [ ] No uncommitted changes
- [ ] All dependencies installed: `npm install`
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm run test:e2e`

### Documentation Review
- [ ] Read `/docs/MULTI_TENANT_AUDIT.md` (multi-tenant patterns)
- [ ] Read `/docs/N8N_COMPLIANCE_AUDIT.md` (schema requirements)
- [ ] Read `/docs/CLAUDE.md` (core principles)
- [ ] Understand workflow node types used

### Archive Current State
- [ ] Create feature branch: `git checkout -b feature/media-center-workflow-update`
- [ ] Archive current workflows:
  ```bash
  mkdir -p /docs/media_center_workflow_archive
  cp /packages/media_center/workflow/*.json /docs/media_center_workflow_archive/
  git add /docs/media_center_workflow_archive/
  git commit -m "archive: backup media_center workflows before update"
  ```

---

## Workflow 1: Extract Image Metadata

**File**: `/packages/media_center/workflow/extract-image-metadata.json`
**Baseline**: 7 nodes, no multi-tenant entry validation

### Step 1: Update Root Schema
- [ ] Add `id`: `"wf_extract_image_metadata_v1"`
- [ ] Add `versionId`: `"1.0.0"`
- [ ] Add `description`: "Extract metadata from image files..."
- [ ] Add `tenantId`: `null`
- [ ] Add `deployedAt`: `null`
- [ ] Add `createdAt`: ISO 8601 timestamp
- [ ] Add `updatedAt`: ISO 8601 timestamp
- [ ] Add `tags`: `["media", "image", "metadata", "extraction"]`
- [ ] Add `meta` object with category, author, source, performance class

### Step 2: Add Tenant Validation Node
- [ ] Insert new node at position [50, 100]: `validate_tenant`
- [ ] Type: `metabuilder.validate`
- [ ] Parameters: validate `$context.tenantId` as required UUID
- [ ] Update subsequent node positions (shift x-coord by +50)

### Step 3: Update All Node Fields
- [ ] For each node:
  - [ ] Add `disabled`: `false`
  - [ ] Add `notes`: Purpose documentation
  - [ ] Add `continueOnFail`: appropriate value (false for critical nodes, true for optional)

### Step 4: Add Asset Existence Check
- [ ] Insert new condition node: `check_asset_exists`
- [ ] Verify asset returned from database
- [ ] Verify asset.tenantId matches $context.tenantId
- [ ] Add error path for "not found" case

### Step 5: Update Settings Object
- [ ] Set `executionTimeout`: `300`
- [ ] Add `errorHandler`: `"log_and_fail"`
- [ ] Add `retryPolicy`: `{ "maxAttempts": 1, "backoffMs": 0 }`
- [ ] Add `dataRetention`: `{ "daysToKeep": 7, "minSizeKb": 100 }`
- [ ] Add `variables`: supported formats, max file size

### Step 6: Update Connections
- [ ] Change from `{}` to explicit node mapping
- [ ] Ensure `validate_tenant` → `validate_input` → `fetch_asset`
- [ ] Ensure `fetch_asset` → `check_asset_exists`
- [ ] Ensure error node path for not-found case

### Step 7: Validation
- [ ] Validate JSON syntax: `jq . extract-image-metadata.json`
- [ ] Verify schema compliance: `npm run validate:workflows -- extract-image-metadata.json`
- [ ] Check DAG: no cycles, all connections valid
- [ ] Count nodes: should be ~9 (up from 7)

### Step 8: Testing
- [ ] Unit test with mock image asset
- [ ] Test with invalid tenantId (should fail at entry)
- [ ] Test with missing assetId (should fail at validation)
- [ ] Test with unauthorized asset (should fail at check_asset_exists)
- [ ] Test success path with valid image

### Step 9: Documentation
- [ ] Update node descriptions in `notes` fields
- [ ] Document performance expectations (1-10s per image)
- [ ] Document supported formats in meta
- [ ] Document max file size (5GB)

---

## Workflow 2: Extract Video Metadata

**File**: `/packages/media_center/workflow/extract-video-metadata.json`
**Baseline**: 7 nodes, no multi-tenant entry validation

### Step 1-9: Repeat same process as Workflow 1
- [ ] Follow steps 1-9 above
- [ ] Adjust timeout: `600` (10 minutes for FFmpeg)
- [ ] Update supported formats: mp4, mkv, avi, mov, flv, webm
- [ ] Update max file size: 50GB
- [ ] Performance class: "heavy" (FFmpeg analysis is resource-intensive)
- [ ] Adjust performance doc: 10-120s per video

### Additional for Video
- [ ] Verify duration formatting logic
- [ ] Verify aspect ratio calculation
- [ ] Verify codec detection

---

## Workflow 3: List User Media

**File**: `/packages/media_center/workflow/list-user-media.json`
**Baseline**: 9 nodes, no multi-tenant entry validation

### Step 1: Update Root Schema
- [ ] Add all root schema fields (same as Workflow 1)
- [ ] Performance class: "fast" (query should be quick)
- [ ] Tags: `["media", "list", "pagination", "query"]`

### Step 2: Add Tenant Validation Node
- [ ] Insert at position [50, 100]: `validate_tenant`
- [ ] Shift subsequent positions

### Step 3: Add User Validation
- [ ] Add second validation node: `validate_user`
- [ ] Verify `$context.user.id` is present

### Step 4: Update Parameter Extraction
- [ ] Normalize pagination: ensure limit is clamped [1, 500]
- [ ] Ensure page >= 1
- [ ] Add search parameter extraction

### Step 5: Update Filter Building
- [ ] Always include tenantId filter
- [ ] Always include uploadedBy filter (user.id)
- [ ] Add optional type filter
- [ ] Add optional search filter

### Step 6: Update Settings
- [ ] Set `executionTimeout`: `30` (fast query)
- [ ] `saveExecutionProgress`: `false` (no need for list operations)
- [ ] `saveDataSuccessExecution`: `"errors_only"` (save space)
- [ ] Variables: MAX_LIMIT=500, DEFAULT_LIMIT=50

### Step 7-9: Validation, Testing, Documentation
- [ ] Verify pagination math
- [ ] Test sort_by and sort_order parameters
- [ ] Test limit clamping (1 ≤ limit ≤ 500)
- [ ] Test multi-tenant isolation
- [ ] Document pagination response format

---

## Workflow 4: Delete Media Asset

**File**: `/packages/media_center/workflow/delete-media.json`
**Baseline**: 6 nodes, no explicit authorization checks

### Step 1: Update Root Schema
- [ ] Add all root schema fields
- [ ] Tags: `["media", "delete", "destructive", "authorization"]`
- [ ] Meta includes: `"destructive": true`, `"auditRequired": true`

### Step 2: Add Tenant and Asset Validation
- [ ] Add `validate_tenant` node
- [ ] Add `validate_asset_id` node
- [ ] Verify assetId is valid UUID

### Step 3: Strengthen Authorization
- [ ] Update `check_authorization` condition
- [ ] Verify: asset exists AND belongs to tenant AND (uploaded by user OR user level >= 3)
- [ ] Return 403 Forbidden if unauthorized

### Step 4: Update File Deletion
- [ ] Verify all file paths are included:
  - Original: `$steps.fetch_asset.output.path`
  - Thumbnail: `$steps.fetch_asset.output.path + '-thumbnail'`
  - Optimized: `$steps.fetch_asset.output.path + '-optimized'`
- [ ] Set `dryRun`: `false`

### Step 5: Enhance Deletion Event
- [ ] Add `deletedBy`: `$context.user.id`
- [ ] Add `deletedAt`: timestamp
- [ ] Track tenant context

### Step 6: Update Settings
- [ ] Set `executionTimeout`: `120` (2 minutes for file deletion)
- [ ] `saveExecutionProgress`: `true` (audit trail important)
- [ ] Add data retention: `{ "daysToKeep": 90 }`
- [ ] Variable: `"AUDIT_DELETE_OPERATIONS": true`

### Step 7: Update Connections
- [ ] Make explicit: tenant → asset_id → fetch → auth check
- [ ] If auth fails → error_unauthorized
- [ ] If auth succeeds → delete_files → delete_record → emit → success

### Step 8-9: Validation, Testing, Documentation
- [ ] Test authorization edge cases
- [ ] Test owner can delete own assets
- [ ] Test admin (level >= 3) can delete others
- [ ] Test non-admin cannot delete others
- [ ] Verify audit events are emitted
- [ ] Verify files are actually deleted

---

## Cross-Workflow Validation

### Schema Compliance
- [ ] All 4 workflows pass JSON schema validation
- [ ] All required root fields present
- [ ] All required node fields present
- [ ] All connections valid

### Multi-Tenant Safety
- [ ] Each workflow validates tenantId at entry point
- [ ] All database filters include tenantId
- [ ] All events include tenantId
- [ ] No cross-tenant data possible
- [ ] User context always checked

### Node Type Registry
- [ ] `metabuilder.validate` - 2+ occurrences ✓
- [ ] `metabuilder.database` - 1-2 occurrences ✓
- [ ] `metabuilder.condition` - 0-1 occurrences ✓
- [ ] `metabuilder.operation` - 0-1 occurrences ✓
- [ ] `metabuilder.transform` - 0-2 occurrences ✓
- [ ] `metabuilder.action` - 1-2 occurrences ✓

### Performance Settings
- [ ] Extract Image: 300s timeout ✓
- [ ] Extract Video: 600s timeout ✓
- [ ] List Media: 30s timeout ✓
- [ ] Delete Media: 120s timeout ✓
- [ ] All have retry policy ✓
- [ ] All have data retention ✓

### Backwards Compatibility
- [ ] No breaking changes to node structure
- [ ] No breaking changes to connections format
- [ ] Existing deployments still work ✓
- [ ] New fields optional during parsing ✓

---

## Code Review Checklist

### Structure & Organization
- [ ] All 4 workflows updated consistently
- [ ] Naming conventions followed (snake_case IDs)
- [ ] Node positions properly spaced
- [ ] Comments/documentation clear

### Multi-Tenant Safety
- [ ] Entry point validates tenantId
- [ ] All DB queries filter by tenantId
- [ ] All events include tenantId
- [ ] No accidental data leakage
- [ ] Authorization checks present

### Error Handling
- [ ] All error paths defined
- [ ] Error responses informative (not too detailed)
- [ ] Continue-on-fail flags appropriate
- [ ] No silent failures

### Performance
- [ ] Timeouts appropriate for operation type
- [ ] No unnecessary retries
- [ ] Data retention reasonable
- [ ] Variables documented

### Documentation
- [ ] Workflow description present
- [ ] Node notes clear and helpful
- [ ] Meta fields complete
- [ ] Performance characteristics documented

---

## Testing Strategy

### Unit Tests (Per Workflow)

**Extract Image Metadata**:
```json
{
  "testName": "Extract image metadata with valid tenant",
  "input": { "assetId": "uuid", "filePath": "/path/to/image.jpg" },
  "context": { "tenantId": "tenant-uuid", "user": { "id": "user-uuid" } },
  "expectedStatus": 200,
  "expectedFields": ["metadata", "dimensions", "format"]
}
```

**Extract Video Metadata**:
```json
{
  "testName": "Extract video metadata with valid tenant",
  "input": { "assetId": "uuid", "filePath": "/path/to/video.mp4" },
  "context": { "tenantId": "tenant-uuid", "user": { "id": "user-uuid" } },
  "expectedStatus": 200,
  "expectedFields": ["metadata", "duration", "resolution", "fps"]
}
```

**List User Media**:
```json
{
  "testName": "List user media with pagination",
  "input": { "page": 1, "limit": 50, "sortBy": "createdAt", "sortOrder": "desc" },
  "context": { "tenantId": "tenant-uuid", "user": { "id": "user-uuid" } },
  "expectedStatus": 200,
  "expectedFields": ["assets", "pagination"]
}
```

**Delete Media Asset**:
```json
{
  "testName": "Delete own media asset",
  "input": { "assetId": "uuid" },
  "context": { "tenantId": "tenant-uuid", "user": { "id": "user-uuid" } },
  "expectedStatus": 200,
  "expectedFields": ["ok", "message"]
}
```

### Integration Tests

- [ ] Test with real database connection
- [ ] Test multi-tenant isolation (tenant A can't see tenant B data)
- [ ] Test authorization boundaries
- [ ] Test event emission
- [ ] Test file operations

### Performance Tests

- [ ] Extract Image: < 10s typical
- [ ] Extract Video: < 120s typical
- [ ] List Media: < 500ms typical
- [ ] Delete Media: < 5s typical
- [ ] No timeout violations

---

## Deployment Checklist

### Pre-Deployment
- [ ] All code reviews completed
- [ ] All tests passing
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] No console.log or debugger statements
- [ ] Git history clean and meaningful

### Deployment Steps
1. [ ] Create PR to main
2. [ ] Request code review
3. [ ] Wait for approval
4. [ ] Merge to main
5. [ ] Verify CI passes
6. [ ] Deploy to staging
7. [ ] Run smoke tests on staging
8. [ ] Deploy to production
9. [ ] Monitor logs for errors

### Post-Deployment
- [ ] Monitor execution metrics
- [ ] Check for error spikes
- [ ] Verify event emission
- [ ] Confirm no data leakage
- [ ] Performance metrics within bounds

---

## Rollback Plan

### If Issues Found

1. **Immediate**: Disable workflows via `active: false`
2. **Short term**: Revert to previous git commit
   ```bash
   git revert <commit-hash>
   git push
   ```
3. **Restore from archive**:
   ```bash
   cp /docs/media_center_workflow_archive/*.json /packages/media_center/workflow/
   git add /packages/media_center/workflow/
   git commit -m "rollback: restore media_center workflows to previous version"
   ```

### Recovery Steps
- [ ] Investigate root cause
- [ ] Fix issue in feature branch
- [ ] Comprehensive testing
- [ ] Create new PR
- [ ] Redeploy

---

## Sign-Off

### Implementation Lead
- [ ] Name: _______________
- [ ] Date: _______________
- [ ] Signature: _______________

### Code Review
- [ ] Reviewer: _______________
- [ ] Date: _______________
- [ ] Status: ☐ Approved ☐ Requested Changes

### QA Sign-Off
- [ ] Tester: _______________
- [ ] Date: _______________
- [ ] Status: ☐ Passed ☐ Failed

### Deployment Authorization
- [ ] Deployer: _______________
- [ ] Date: _______________
- [ ] Environment: ☐ Staging ☐ Production

---

## Timeline

| Phase | Milestone | Target Date | Status |
|-------|-----------|------------|--------|
| **Week 1** | Backup & Review | 2026-01-29 | ⏳ |
| **Week 1-2** | Implement Workflow 1-2 | 2026-02-01 | ⏳ |
| **Week 2** | Implement Workflow 3-4 | 2026-02-02 | ⏳ |
| **Week 2** | Validation & Testing | 2026-02-03 | ⏳ |
| **Week 2-3** | Code Review | 2026-02-04 | ⏳ |
| **Week 3** | Deployment | 2026-02-05 | ⏳ |

---

## Success Metrics

### Quantitative
- [ ] 4/4 workflows updated (100%)
- [ ] All workflows pass schema validation (100%)
- [ ] 0 breaking changes
- [ ] 0 multi-tenant data leaks
- [ ] 0 timeout violations

### Qualitative
- [ ] Code review approved
- [ ] QA signed off
- [ ] Documentation complete
- [ ] No rollbacks needed
- [ ] Team confident in changes

---

**Last Updated**: 2026-01-22
**Status**: Ready for Implementation
**Owner**: [To be assigned]
