# WorkflowLoaderV2 API Integration - Implementation Guide

**Status**: Phase 3 Week 4 | **Updated**: 2026-01-23 | **Scope**: 6 endpoint updates + 110 LOC

## Overview

This document guides the integration of WorkflowLoaderV2 into the Next.js workflow API endpoints. All 6 primary endpoints require updates to use the new validation layer, plugin registry, and multi-tenant safety enforcement.

---

## Task Summary

| Task | Endpoint | Changes | Status |
|------|----------|---------|--------|
| Task 8 | `GET /workflows` | Add registry validation, pagination, multi-tenant filtering | Pending |
| Task 9 | `POST /workflows` | Add creation validation with PluginValidator | Pending |
| Task 10 | `GET /workflows/:id` | Add permission check, registry lookup | Pending |
| Task 11 | `PUT /workflows/:id` | Add update validation, connection integrity check | Pending |
| Task 12 | `POST /workflows/:id/execute` | Add pre-execution validation, error recovery | Pending |
| Task 13 | `POST /workflows/validate` | New validation endpoint with full suite | Pending |

---

## Endpoint Details

### Task 8: GET /workflows - List Workflows

**Required Changes**:
1. Add `getWorkflows()` method to WorkflowService
2. Add pagination (limit, offset)
3. Add filtering (category, status)
4. Add metadata enrichment from registry

**Files to Modify**:
- `frontends/nextjs/src/app/api/v1/workflows/route.ts` (+25 lines)
- `frontends/nextjs/src/lib/workflow-service.ts` (+40 lines)

---

### Task 9: POST /workflows - Create Workflow

**Required Changes**:
1. Add PluginValidator pre-validation
2. Add node type validation from registry
3. Add connection validation
4. Add metadata auto-generation

**Files to Modify**:
- `frontends/nextjs/src/app/api/v1/workflows/route.ts` (+35 lines)
- `frontends/nextjs/src/lib/workflow-service.ts` (+45 lines)

---

### Task 10: GET /workflows/:id - Get Single Workflow

**Required Changes**:
1. Add permission check (tenant isolation)
2. Add registry lookup
3. Add error handling
4. Add validation status

**Files to Modify**:
- `frontends/nextjs/src/app/api/v1/workflows/[workflowId]/route.ts` (+30 lines)

---

### Task 11: PUT /workflows/:id - Update Workflow

**Required Changes**:
1. Add full validation before update
2. Add connection integrity check
3. Add version tracking
4. Add change auditing

**Files to Modify**:
- `frontends/nextjs/src/app/api/v1/workflows/[workflowId]/route.ts` (+50 lines)
- `frontends/nextjs/src/lib/workflow-service.ts` (+25 lines)

---

### Task 12: POST /workflows/:id/execute - Execute Workflow

**Required Changes**:
1. Add pre-execution validation
2. Add ErrorRecoveryManager integration
3. Add TenantSafetyManager enforcement
4. Add execution tracking

**Files to Modify**:
- `frontends/nextjs/src/app/api/v1/workflows/[workflowId]/execute/route.ts` (+60 lines, new)

---

### Task 13: POST /workflows/validate - New Validation Endpoint

**Required Changes**:
1. Create validation-only endpoint
2. Validate without persisting
3. Return detailed report
4. Support partial validation

**Files to Modify**:
- `frontends/nextjs/src/app/api/v1/workflows/validate/route.ts` (+55 lines, new)

---

## Files Created/Modified

| File | Change | Lines |
|------|--------|-------|
| `route.ts` (GET) | Modified | +25 |
| `route.ts` (POST) | Modified | +35 |
| `[workflowId]/route.ts` (GET) | Modified | +30 |
| `[workflowId]/route.ts` (PUT) | Modified | +50 |
| `[workflowId]/execute/route.ts` | New | +60 |
| `validate/route.ts` | New | +55 |
| `workflow-service.ts` | Modified | +110 |

**Total**: 365 new/modified lines

---

## Integration Checklist

### Task 8: List Workflows
- [ ] Update GET handler with pagination
- [ ] Add PluginRegistry enrichment
- [ ] Add filtering support
- [ ] Test multi-tenant isolation

### Task 9: Create Workflow
- [ ] Update POST handler
- [ ] Integrate PluginValidator
- [ ] Add validation error responses
- [ ] Test metadata generation

### Task 10: Get Single Workflow
- [ ] Add tenant check
- [ ] Add 404 handling
- [ ] Enrich with metadata

### Task 11: Update Workflow
- [ ] Add validation
- [ ] Implement versioning
- [ ] Add audit logging

### Task 12: Execute Workflow
- [ ] Create execute handler
- [ ] Add error recovery
- [ ] Add tenant safety
- [ ] Implement retry logic

### Task 13: Validate Workflow
- [ ] Create validate endpoint
- [ ] Add structure validation
- [ ] Add connection validation
- [ ] Return detailed report

### Final Verification
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run test:e2e` passes
- [ ] Multi-tenant isolation verified
- [ ] Error recovery tested

---

## Next Steps

1. **Task 19-23**: DBAL workflow entity and validation adapter
2. **Task 24-30**: Comprehensive E2E testing
3. **Task 31+**: Production readiness and monitoring

