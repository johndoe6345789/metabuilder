# Audit Log Workflow Update Plan

**Document Type**: Implementation Guide
**Status**: Draft - Ready for Review
**Last Updated**: 2026-01-22
**Target Compliance**: N8N Schema v1.0
**Scope**: 4 audit_log workflows (init, stats, filters, formatting)

---

## Overview

This plan documents the required updates to convert the 4 audit_log workflows to full n8n schema compliance. The workflows are partially compliant but lack critical metadata fields required for production use: `id`, `versionId`, `tenantId`, and `active` state management.

### Current State Summary

| Workflow | File | Nodes | Issues | Priority |
|----------|------|-------|--------|----------|
| Load Audit Logs | `init.json` | 6 | Missing id, versionId, createdAt, updatedAt, tenantId | HIGH |
| Calculate Statistics | `stats.json` | 5 | Missing id, versionId, createdAt, updatedAt, tenantId | HIGH |
| Filter Audit Logs | `filters.json` | 5 | Missing id, versionId, createdAt, updatedAt, tenantId | HIGH |
| Format Entry | `formatting.json` | 5 | Missing id, versionId, createdAt, updatedAt, tenantId | HIGH |

### Target State Summary

All workflows will be updated to include:
- **Metadata fields**: `id`, `versionId`, `createdAt`, `updatedAt`, `tenantId`
- **Schema compliance**: Full n8n workflow schema validation
- **Audit trail**: Timestamps for creation and modification
- **Versioning**: Version identifiers for optimistic concurrency control
- **Multi-tenant safety**: Explicit tenantId tracking at workflow level

---

## Current Structure Analysis

### Existing Workflow Properties

All 4 workflows currently contain:

```json
{
  "name": "Workflow Name",
  "active": false,
  "nodes": [...],
  "connections": {},
  "staticData": {},
  "meta": {},
  "settings": {...}
}
```

**Missing from n8n schema**:
- `id` - Workflow identifier for database storage
- `versionId` - Version tracking for concurrency control
- `createdAt` - Creation timestamp (ISO 8601)
- `updatedAt` - Last modification timestamp (ISO 8601)
- `tenantId` - Multi-tenant identifier (critical for audit safety)
- `tags` - Optional workflow categorization
- `pinData` - Optional development/debugging data
- `credentials` - Optional credential bindings
- `triggers` - Optional trigger declarations
- `variables` - Optional workflow-level variables

---

## Required Changes by Workflow

### 1. Load Audit Logs (`workflow/init.json`)

**Current Size**: 129 lines
**Nodes**: 6 (validate_context, extract_pagination, fetch_logs, fetch_count, format_response, return_success)
**Node Types Used**: metabuilder.* (validate, transform, database, operation, action)

#### Changes Required

**Add top-level metadata**:
```json
{
  "id": "audit_init_wf_001",
  "versionId": "v1.0.0-2026-01-22",
  "tenantId": "${DYNAMIC_TENANT}",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    { "name": "audit" },
    { "name": "data-loading" },
    { "name": "core" }
  ],
  "variables": {
    "maxPageSize": {
      "name": "maxPageSize",
      "type": "number",
      "defaultValue": 500,
      "description": "Maximum records per page",
      "required": false
    },
    "defaultPageSize": {
      "name": "defaultPageSize",
      "type": "number",
      "defaultValue": 100,
      "description": "Default records per page",
      "required": false
    }
  }
}
```

**Enhance node parameters**:
- All database operations must include tenantId in filter
- All nodes should have optional `notes` field for documentation
- Consider adding `retryOnFail: true` for database operations

#### Validation Checklist

- [ ] Workflow ID is unique: `audit_init_wf_001`
- [ ] versionId follows semver pattern: `v1.0.0-YYYY-MM-DD`
- [ ] tenantId is parameterized (not hardcoded)
- [ ] createdAt is ISO 8601 format
- [ ] updatedAt is ISO 8601 format
- [ ] All 6 nodes have `typeVersion: 1`
- [ ] All 6 nodes have `position: [x, y]`
- [ ] Database queries filter by `tenantId`
- [ ] variables section defines workflow parameters
- [ ] tags categorize workflow for discovery

---

### 2. Calculate Statistics (`workflow/stats.json`)

**Current Size**: 135 lines
**Nodes**: 5 (validate_context, get_date_range, count_by_action, count_by_entity, format_response, return_success)
**Node Types Used**: metabuilder.* (validate, transform, operation, action)

#### Changes Required

**Add top-level metadata**:
```json
{
  "id": "audit_stats_wf_001",
  "versionId": "v1.0.0-2026-01-22",
  "tenantId": "${DYNAMIC_TENANT}",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    { "name": "audit" },
    { "name": "analytics" },
    { "name": "core" }
  ],
  "variables": {
    "lookbackDays": {
      "name": "lookbackDays",
      "type": "number",
      "defaultValue": 7,
      "description": "Number of days to include in statistics",
      "required": false,
      "validation": {
        "min": 1,
        "max": 365
      }
    }
  }
}
```

**Enhance node parameters**:
- Replace hardcoded `7 * 24 * 60 * 60 * 1000` with `$workflow.variables.lookbackDays`
- Add aggregation error handling
- Ensure all aggregations include tenantId in filter

#### Validation Checklist

- [ ] Workflow ID is unique: `audit_stats_wf_001`
- [ ] versionId follows semver pattern: `v1.0.0-YYYY-MM-DD`
- [ ] tenantId is parameterized
- [ ] createdAt is ISO 8601 format
- [ ] updatedAt is ISO 8601 format
- [ ] All 5 nodes have `typeVersion: 1`
- [ ] All 5 nodes have `position: [x, y]`
- [ ] Variables section includes lookbackDays configuration
- [ ] All aggregations filter by tenantId
- [ ] Date range calculations use workflow variables

---

### 3. Filter Audit Logs (`workflow/filters.json`)

**Current Size**: 110 lines
**Nodes**: 5 (validate_tenant, build_filter, clean_filter, fetch_filtered, return_success)
**Node Types Used**: metabuilder.* (validate, transform, database, action)

#### Changes Required

**Add top-level metadata**:
```json
{
  "id": "audit_filter_wf_001",
  "versionId": "v1.0.0-2026-01-22",
  "tenantId": "${DYNAMIC_TENANT}",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    { "name": "audit" },
    { "name": "filtering" },
    { "name": "core" }
  ],
  "variables": {
    "maxResults": {
      "name": "maxResults",
      "type": "number",
      "defaultValue": 500,
      "description": "Maximum results to return",
      "required": false
    },
    "defaultLookbackDays": {
      "name": "defaultLookbackDays",
      "type": "number",
      "defaultValue": 30,
      "description": "Default days to look back if no date range specified",
      "required": false
    }
  }
}
```

**Enhance node parameters**:
- Replace hardcoded `30 * 24 * 60 * 60 * 1000` with `$workflow.variables.defaultLookbackDays`
- Replace hardcoded `500` limit with `$workflow.variables.maxResults`
- Add input validation for filter parameters
- Ensure date range filtering is safe and bounded

#### Validation Checklist

- [ ] Workflow ID is unique: `audit_filter_wf_001`
- [ ] versionId follows semver pattern: `v1.0.0-YYYY-MM-DD`
- [ ] tenantId is parameterized
- [ ] createdAt is ISO 8601 format
- [ ] updatedAt is ISO 8601 format
- [ ] All 5 nodes have `typeVersion: 1`
- [ ] All 5 nodes have `position: [x, y]`
- [ ] Variables section includes maxResults and defaultLookbackDays
- [ ] All database queries filter by tenantId
- [ ] Build_filter node includes tenantId in output
- [ ] Clean_filter removes undefined/null values safely

---

### 4. Format Audit Log Entry (`workflow/formatting.json`)

**Current Size**: 112 lines
**Nodes**: 5 (extract_log_id, fetch_user_details, format_timestamp, format_entry, return_formatted)
**Node Types Used**: metabuilder.* (transform, database, action)

#### Changes Required

**Add top-level metadata**:
```json
{
  "id": "audit_format_wf_001",
  "versionId": "v1.0.0-2026-01-22",
  "tenantId": "${DYNAMIC_TENANT}",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    { "name": "audit" },
    { "name": "formatting" },
    { "name": "utility" }
  ],
  "variables": {
    "dateLocale": {
      "name": "dateLocale",
      "type": "string",
      "defaultValue": "en-US",
      "description": "Locale for date formatting",
      "required": false
    }
  }
}
```

**Enhance node parameters**:
- Replace hardcoded `'en-US'` with `$workflow.variables.dateLocale`
- Add safe nullability checks for user details (handle deleted users)
- Ensure all user lookups include tenantId filter

#### Validation Checklist

- [ ] Workflow ID is unique: `audit_format_wf_001`
- [ ] versionId follows semver pattern: `v1.0.0-YYYY-MM-DD`
- [ ] tenantId is parameterized
- [ ] createdAt is ISO 8601 format
- [ ] updatedAt is ISO 8601 format
- [ ] All 5 nodes have `typeVersion: 1`
- [ ] All 5 nodes have `position: [x, y]`
- [ ] Variables section includes dateLocale configuration
- [ ] fetch_user_details includes tenantId filter
- [ ] format_timestamp handles edge cases (invalid timestamps, timezones)
- [ ] format_entry has optional user data (handles missing users)

---

## Updated JSON Examples

### Complete Example: Load Audit Logs (init.json)

```json
{
  "id": "audit_init_wf_001",
  "versionId": "v1.0.0-2026-01-22",
  "tenantId": "${DYNAMIC_TENANT}",
  "name": "Load Audit Logs",
  "active": false,
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    { "name": "audit" },
    { "name": "data-loading" },
    { "name": "core" }
  ],
  "variables": {
    "maxPageSize": {
      "name": "maxPageSize",
      "type": "number",
      "defaultValue": 500,
      "description": "Maximum records per page",
      "required": false,
      "validation": {
        "min": 10,
        "max": 1000
      }
    },
    "defaultPageSize": {
      "name": "defaultPageSize",
      "type": "number",
      "defaultValue": 100,
      "description": "Default records per page",
      "required": false,
      "validation": {
        "min": 10,
        "max": 500
      }
    }
  },
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "notes": "Ensure tenantId is present in context for multi-tenant safety",
      "parameters": {
        "input": "{{ $context.tenantId }}",
        "operation": "validate",
        "validator": "required",
        "errorMessage": "tenantId is required for multi-tenant safety"
      }
    },
    {
      "id": "extract_pagination",
      "name": "Extract Pagination",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 100],
      "notes": "Extract and normalize pagination parameters with limits",
      "parameters": {
        "input": "{{ $json }}",
        "output": {
          "limit": "{{ Math.min($json.limit || $workflow.variables.defaultPageSize, $workflow.variables.maxPageSize) }}",
          "offset": "{{ (($json.page || 1) - 1) * ($json.limit || $workflow.variables.defaultPageSize) }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "fetch_logs",
      "name": "Fetch Logs",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 100],
      "notes": "Fetch paginated audit logs for current tenant",
      "retryOnFail": true,
      "maxTries": 3,
      "waitBetweenTries": 1000,
      "parameters": {
        "filter": {
          "tenantId": "{{ $context.tenantId }}"
        },
        "sort": {
          "timestamp": -1
        },
        "limit": "{{ $steps.extract_pagination.output.limit }}",
        "offset": "{{ $steps.extract_pagination.output.offset }}",
        "output": "logs",
        "operation": "database_read",
        "entity": "AuditLog"
      }
    },
    {
      "id": "fetch_count",
      "name": "Fetch Count",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [100, 300],
      "notes": "Get total count of audit logs for current tenant",
      "retryOnFail": true,
      "maxTries": 3,
      "waitBetweenTries": 1000,
      "parameters": {
        "filter": {
          "tenantId": "{{ $context.tenantId }}"
        },
        "output": "totalCount",
        "operation": "database_count",
        "entity": "AuditLog"
      }
    },
    {
      "id": "format_response",
      "name": "Format Response",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 300],
      "notes": "Format logs and pagination metadata for API response",
      "parameters": {
        "input": "{{ $steps.fetch_logs.output }}",
        "output": {
          "logs": "{{ $steps.fetch_logs.output }}",
          "pagination": {
            "total": "{{ $steps.fetch_count.output }}",
            "limit": "{{ $steps.extract_pagination.output.limit }}",
            "offset": "{{ $steps.extract_pagination.output.offset }}",
            "hasMore": "{{ $steps.fetch_count.output > ($steps.extract_pagination.output.offset + $steps.extract_pagination.output.limit) }}"
          }
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [700, 300],
      "notes": "Return formatted response to caller",
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": "{{ $steps.format_response.output }}"
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "meta": {
    "packageId": "audit_log",
    "workflowType": "data-loading",
    "description": "Loads paginated audit logs for the current tenant with full multi-tenant isolation"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

### Complete Example: Calculate Statistics (stats.json)

```json
{
  "id": "audit_stats_wf_001",
  "versionId": "v1.0.0-2026-01-22",
  "tenantId": "${DYNAMIC_TENANT}",
  "name": "Calculate Audit Statistics",
  "active": false,
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    { "name": "audit" },
    { "name": "analytics" },
    { "name": "core" }
  ],
  "variables": {
    "lookbackDays": {
      "name": "lookbackDays",
      "type": "number",
      "defaultValue": 7,
      "description": "Number of days to include in statistics",
      "required": false,
      "validation": {
        "min": 1,
        "max": 365
      }
    }
  },
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "notes": "Ensure tenantId is present for multi-tenant safety",
      "parameters": {
        "input": "{{ $context.tenantId }}",
        "operation": "validate",
        "validator": "required",
        "errorMessage": "tenantId is required"
      }
    },
    {
      "id": "get_date_range",
      "name": "Get Date Range",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 100],
      "notes": "Calculate start and end dates for statistics window",
      "parameters": {
        "output": {
          "startDate": "{{ new Date(Date.now() - ($workflow.variables.lookbackDays * 24 * 60 * 60 * 1000)).toISOString() }}",
          "endDate": "{{ new Date().toISOString() }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "count_by_action",
      "name": "Count By Action",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [700, 100],
      "notes": "Aggregate logs by action type (create, update, delete, login, etc.)",
      "retryOnFail": true,
      "maxTries": 3,
      "waitBetweenTries": 1000,
      "parameters": {
        "filter": {
          "tenantId": "{{ $context.tenantId }}",
          "timestamp": {
            "$gte": "{{ $steps.get_date_range.output.startDate }}",
            "$lte": "{{ $steps.get_date_range.output.endDate }}"
          }
        },
        "groupBy": "action",
        "aggregations": {
          "count": "count"
        },
        "output": "actionStats",
        "operation": "database_aggregate",
        "entity": "AuditLog"
      }
    },
    {
      "id": "count_by_entity",
      "name": "Count By Entity",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [100, 300],
      "notes": "Aggregate logs by entity type (User, Workflow, Page, etc.)",
      "retryOnFail": true,
      "maxTries": 3,
      "waitBetweenTries": 1000,
      "parameters": {
        "filter": {
          "tenantId": "{{ $context.tenantId }}",
          "timestamp": {
            "$gte": "{{ $steps.get_date_range.output.startDate }}",
            "$lte": "{{ $steps.get_date_range.output.endDate }}"
          }
        },
        "groupBy": "entity",
        "aggregations": {
          "count": "count"
        },
        "output": "entityStats",
        "operation": "database_aggregate",
        "entity": "AuditLog"
      }
    },
    {
      "id": "format_response",
      "name": "Format Response",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 300],
      "notes": "Format statistics for API response with date range and totals",
      "parameters": {
        "output": {
          "dateRange": "{{ $steps.get_date_range.output }}",
          "actionStatistics": "{{ $steps.count_by_action.output }}",
          "entityStatistics": "{{ $steps.count_by_entity.output }}",
          "totalEntries": "{{ $steps.count_by_action.output.reduce((sum, item) => sum + item.count, 0) }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [700, 300],
      "notes": "Return formatted statistics to caller",
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": "{{ $steps.format_response.output }}"
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "meta": {
    "packageId": "audit_log",
    "workflowType": "analytics",
    "description": "Calculates audit log statistics for action and entity types over a configurable time window"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

### Complete Example: Filter Audit Logs (filters.json)

```json
{
  "id": "audit_filter_wf_001",
  "versionId": "v1.0.0-2026-01-22",
  "tenantId": "${DYNAMIC_TENANT}",
  "name": "Filter Audit Logs",
  "active": false,
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    { "name": "audit" },
    { "name": "filtering" },
    { "name": "core" }
  ],
  "variables": {
    "maxResults": {
      "name": "maxResults",
      "type": "number",
      "defaultValue": 500,
      "description": "Maximum results to return",
      "required": false,
      "validation": {
        "min": 10,
        "max": 1000
      }
    },
    "defaultLookbackDays": {
      "name": "defaultLookbackDays",
      "type": "number",
      "defaultValue": 30,
      "description": "Default days to look back if no date range specified",
      "required": false,
      "validation": {
        "min": 1,
        "max": 365
      }
    }
  },
  "nodes": [
    {
      "id": "validate_tenant",
      "name": "Validate Tenant",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "notes": "Ensure tenantId is present for multi-tenant safety",
      "parameters": {
        "input": "{{ $context.tenantId }}",
        "operation": "validate",
        "validator": "required",
        "errorMessage": "tenantId is required"
      }
    },
    {
      "id": "build_filter",
      "name": "Build Filter",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 100],
      "notes": "Build filter object from request parameters",
      "parameters": {
        "input": "{{ $json }}",
        "output": {
          "tenantId": "{{ $context.tenantId }}",
          "action": "{{ $json.action }}",
          "entity": "{{ $json.entity }}",
          "userId": "{{ $json.userId }}",
          "timestamp": {
            "$gte": "{{ $json.startDate || new Date(Date.now() - ($workflow.variables.defaultLookbackDays * 24 * 60 * 60 * 1000)).toISOString() }}",
            "$lte": "{{ $json.endDate || new Date().toISOString() }}"
          }
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "clean_filter",
      "name": "Clean Filter",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [700, 100],
      "notes": "Remove undefined, null, and empty string values from filter",
      "parameters": {
        "input": "{{ $steps.build_filter.output }}",
        "output": "{{ Object.entries($steps.build_filter.output).reduce((acc, [key, value]) => { if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > 0)) acc[key] = value; return acc; }, {}) }}",
        "operation": "transform_data"
      }
    },
    {
      "id": "fetch_filtered",
      "name": "Fetch Filtered",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [100, 300],
      "notes": "Fetch logs matching the cleaned filter with tenantId isolation",
      "retryOnFail": true,
      "maxTries": 3,
      "waitBetweenTries": 1000,
      "parameters": {
        "filter": "{{ $steps.clean_filter.output }}",
        "sort": {
          "timestamp": -1
        },
        "limit": "{{ Math.min($json.limit || 100, $workflow.variables.maxResults) }}",
        "output": "results",
        "operation": "database_read",
        "entity": "AuditLog"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [400, 300],
      "notes": "Return filtered results to caller",
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": {
          "filters": "{{ $json }}",
          "count": "{{ $steps.fetch_filtered.output.length }}",
          "results": "{{ $steps.fetch_filtered.output }}"
        }
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "meta": {
    "packageId": "audit_log",
    "workflowType": "filtering",
    "description": "Filters audit logs by action, entity, user, and date range with full multi-tenant isolation"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

### Complete Example: Format Entry (formatting.json)

```json
{
  "id": "audit_format_wf_001",
  "versionId": "v1.0.0-2026-01-22",
  "tenantId": "${DYNAMIC_TENANT}",
  "name": "Format Audit Log Entry",
  "active": false,
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    { "name": "audit" },
    { "name": "formatting" },
    { "name": "utility" }
  ],
  "variables": {
    "dateLocale": {
      "name": "dateLocale",
      "type": "string",
      "defaultValue": "en-US",
      "description": "Locale for date formatting",
      "required": false
    }
  },
  "nodes": [
    {
      "id": "extract_log_id",
      "name": "Extract Log Id",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [100, 100],
      "notes": "Extract log ID from input",
      "parameters": {
        "input": "{{ $json }}",
        "output": "{{ $json.id }}",
        "operation": "transform_data"
      }
    },
    {
      "id": "fetch_user_details",
      "name": "Fetch User Details",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [400, 100],
      "notes": "Fetch user details for the user who performed the action (with tenantId filter)",
      "continueOnFail": true,
      "parameters": {
        "filter": {
          "id": "{{ $json.userId }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "output": "user",
        "operation": "database_read",
        "entity": "User"
      }
    },
    {
      "id": "format_timestamp",
      "name": "Format Timestamp",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [700, 100],
      "notes": "Format timestamp in multiple formats for display",
      "parameters": {
        "input": "{{ $json.timestamp }}",
        "output": {
          "iso": "{{ new Date($json.timestamp).toISOString() }}",
          "formatted": "{{ new Date($json.timestamp).toLocaleString($workflow.variables.dateLocale) }}",
          "relative": "{{ Math.floor((Date.now() - new Date($json.timestamp).getTime()) / 1000) }} seconds ago"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "format_entry",
      "name": "Format Entry",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [100, 300],
      "notes": "Format complete audit log entry for display with optional user data",
      "parameters": {
        "output": {
          "id": "{{ $json.id }}",
          "user": {
            "id": "{{ $steps.fetch_user_details.output?.id || null }}",
            "email": "{{ $steps.fetch_user_details.output?.email || 'Unknown' }}",
            "displayName": "{{ $steps.fetch_user_details.output?.displayName || 'User Deleted' }}"
          },
          "action": "{{ $json.action }}",
          "entity": "{{ $json.entity }}",
          "entityId": "{{ $json.entityId }}",
          "changes": "{{ $json.changes }}",
          "timestamp": "{{ $steps.format_timestamp.output }}",
          "ipAddress": "{{ $json.ipAddress }}",
          "userAgent": "{{ $json.userAgent }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "return_formatted",
      "name": "Return Formatted",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [400, 300],
      "notes": "Emit formatted entry event for subscribers",
      "parameters": {
        "data": "{{ $steps.format_entry.output }}",
        "action": "emit_event",
        "event": "audit_formatted"
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "meta": {
    "packageId": "audit_log",
    "workflowType": "formatting",
    "description": "Formats audit log entries with user details and multiple timestamp formats for display"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

---

## Validation Checklist

### Master Validation Checklist (All 4 Workflows)

#### Phase 1: Metadata Completeness

**For each workflow:**

- [ ] **audit_init_wf_001** (init.json)
  - [ ] `id` field present and unique
  - [ ] `versionId` follows `v1.0.0-YYYY-MM-DD` format
  - [ ] `tenantId` set to `${DYNAMIC_TENANT}` or parameterized
  - [ ] `createdAt` is ISO 8601 format
  - [ ] `updatedAt` is ISO 8601 format

- [ ] **audit_stats_wf_001** (stats.json)
  - [ ] `id` field present and unique
  - [ ] `versionId` follows `v1.0.0-YYYY-MM-DD` format
  - [ ] `tenantId` set to `${DYNAMIC_TENANT}` or parameterized
  - [ ] `createdAt` is ISO 8601 format
  - [ ] `updatedAt` is ISO 8601 format

- [ ] **audit_filter_wf_001** (filters.json)
  - [ ] `id` field present and unique
  - [ ] `versionId` follows `v1.0.0-YYYY-MM-DD` format
  - [ ] `tenantId` set to `${DYNAMIC_TENANT}` or parameterized
  - [ ] `createdAt` is ISO 8601 format
  - [ ] `updatedAt` is ISO 8601 format

- [ ] **audit_format_wf_001** (formatting.json)
  - [ ] `id` field present and unique
  - [ ] `versionId` follows `v1.0.0-YYYY-MM-DD` format
  - [ ] `tenantId` set to `${DYNAMIC_TENANT}` or parameterized
  - [ ] `createdAt` is ISO 8601 format
  - [ ] `updatedAt` is ISO 8601 format

#### Phase 2: N8N Schema Compliance

**For each workflow, all nodes:**

- [ ] All nodes have `typeVersion` field (should be `1`)
- [ ] All nodes have `position: [x, y]` coordinates
- [ ] All nodes have unique `id` values (no duplicates)
- [ ] All nodes have human-friendly `name` values
- [ ] All nodes have `type` field matching plugin registry
- [ ] All `parameters` are JSON-serializable objects
- [ ] No `@ts-ignore` or compilation errors

#### Phase 3: Variables Section

**For each workflow:**

- [ ] `variables` object exists (even if empty)
- [ ] Each variable has `name`, `type`, `defaultValue`
- [ ] Each variable has human-readable `description`
- [ ] Each variable with constraints has `validation` object
- [ ] Variable types match: string, number, boolean, array, object, date, any
- [ ] Validation rules use correct properties: min, max, pattern, enum

**init.json variables:**
- [ ] `maxPageSize` (number, default 500, min 10, max 1000)
- [ ] `defaultPageSize` (number, default 100, min 10, max 500)

**stats.json variables:**
- [ ] `lookbackDays` (number, default 7, min 1, max 365)

**filters.json variables:**
- [ ] `maxResults` (number, default 500, min 10, max 1000)
- [ ] `defaultLookbackDays` (number, default 30, min 1, max 365)

**formatting.json variables:**
- [ ] `dateLocale` (string, default "en-US")

#### Phase 4: Multi-Tenant Safety

**For each workflow:**

- [ ] All database read operations filter by `tenantId`
- [ ] All database aggregate operations filter by `tenantId`
- [ ] All user lookups include `tenantId` filter
- [ ] `build_filter` node includes `tenantId` in output
- [ ] No hardcoded tenant IDs in parameters
- [ ] Context tenantId validation in first node

**Database operation checks:**

- [ ] `fetch_logs` filters: `{ "tenantId": "{{ $context.tenantId }}" }`
- [ ] `fetch_count` filters: `{ "tenantId": "{{ $context.tenantId }}" }`
- [ ] `count_by_action` filters: `{ "tenantId": "{{ $context.tenantId }}", ... }`
- [ ] `count_by_entity` filters: `{ "tenantId": "{{ $context.tenantId }}", ... }`
- [ ] `fetch_filtered` filters: includes `tenantId`
- [ ] `fetch_user_details` filters: `{ "id": ..., "tenantId": "{{ $context.tenantId }}" }`

#### Phase 5: Error Handling & Resilience

**For database operations:**

- [ ] Critical reads have `retryOnFail: true`
- [ ] `maxTries: 3` for resilience
- [ ] `waitBetweenTries: 1000` (1 second)
- [ ] Optional reads have `continueOnFail: true` (like fetch_user_details)

**For all nodes:**

- [ ] Each node has optional `notes` field documenting purpose
- [ ] Error nodes or handlers documented
- [ ] Timeout values are reasonable (3600 seconds)

#### Phase 6: Configuration Compliance

**Settings validation:**

- [ ] `timezone: "UTC"` for consistency
- [ ] `executionTimeout: 3600` (1 hour for complex operations)
- [ ] `saveExecutionProgress: true` for debugging
- [ ] `saveDataErrorExecution: "all"` for error investigation
- [ ] `saveDataSuccessExecution: "all"` for audit trail

**Meta information:**

- [ ] `packageId: "audit_log"`
- [ ] `workflowType` reflects workflow purpose
- [ ] `description` explains workflow functionality

#### Phase 7: Tag Classification

**Tags for each workflow:**

- [ ] init.json: `["audit", "data-loading", "core"]`
- [ ] stats.json: `["audit", "analytics", "core"]`
- [ ] filters.json: `["audit", "filtering", "core"]`
- [ ] formatting.json: `["audit", "formatting", "utility"]`

Each tag should have `name` property (id is optional).

---

## Implementation Steps

### Step 1: Prepare Environment (5 min)

```bash
# Verify current working directory
cd /Users/rmac/Documents/metabuilder

# Check current workflow files exist
ls -la packages/audit_log/workflow/
# Should show: init.json, stats.json, filters.json, formatting.json

# Backup original files
mkdir -p packages/audit_log/workflow/.backup
cp packages/audit_log/workflow/*.json packages/audit_log/workflow/.backup/
```

### Step 2: Update init.json (15 min)

**File**: `/packages/audit_log/workflow/init.json`

1. Open file in editor
2. Add top-level metadata fields (id, versionId, tenantId, createdAt, updatedAt)
3. Add `tags` array with workflow classification
4. Add `variables` section with maxPageSize and defaultPageSize
5. Add `notes` field to each node for documentation
6. Update parameter references to use `$workflow.variables.*`
7. Add `retryOnFail` and `maxTries` to database operations
8. Update `meta` section with packageId, workflowType, description
9. Verify all 6 nodes have `typeVersion: 1` and `position`

**Verification**:
```bash
# Validate JSON syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('packages/audit_log/workflow/init.json', 'utf8')))" > /dev/null && echo "✓ Valid JSON"

# Count nodes
grep -c '"id":' packages/audit_log/workflow/init.json  # Should show 6+ (metadata + nodes)
```

### Step 3: Update stats.json (15 min)

**File**: `/packages/audit_log/workflow/stats.json`

1. Open file in editor
2. Add top-level metadata fields (id, versionId, tenantId, createdAt, updatedAt)
3. Add `tags` array with workflow classification
4. Add `variables` section with lookbackDays
5. Replace hardcoded `7 * 24 * 60 * 60 * 1000` with `$workflow.variables.lookbackDays * 24 * 60 * 60 * 1000`
6. Add `notes` field to each node for documentation
7. Add `retryOnFail` and `maxTries` to aggregation operations
8. Update `meta` section with packageId, workflowType, description
9. Verify all 5 nodes have `typeVersion: 1` and `position`

**Verification**:
```bash
# Validate JSON syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('packages/audit_log/workflow/stats.json', 'utf8')))" > /dev/null && echo "✓ Valid JSON"

# Check for workflow.variables references
grep -c 'workflow.variables' packages/audit_log/workflow/stats.json  # Should show 1+
```

### Step 4: Update filters.json (15 min)

**File**: `/packages/audit_log/workflow/filters.json`

1. Open file in editor
2. Add top-level metadata fields (id, versionId, tenantId, createdAt, updatedAt)
3. Add `tags` array with workflow classification
4. Add `variables` section with maxResults and defaultLookbackDays
5. Replace hardcoded `30 * 24 * 60 * 60 * 1000` with `$workflow.variables.defaultLookbackDays * 24 * 60 * 60 * 1000`
6. Replace hardcoded `500` limit with `$workflow.variables.maxResults`
7. Add `notes` field to each node for documentation
8. Add `retryOnFail` and `maxTries` to database operations
9. Update `meta` section with packageId, workflowType, description
10. Verify all 5 nodes have `typeVersion: 1` and `position`

**Verification**:
```bash
# Validate JSON syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('packages/audit_log/workflow/filters.json', 'utf8')))" > /dev/null && echo "✓ Valid JSON"

# Check for workflow.variables references
grep -c 'workflow.variables' packages/audit_log/workflow/filters.json  # Should show 2+
```

### Step 5: Update formatting.json (15 min)

**File**: `/packages/audit_log/workflow/formatting.json`

1. Open file in editor
2. Add top-level metadata fields (id, versionId, tenantId, createdAt, updatedAt)
3. Add `tags` array with workflow classification
4. Add `variables` section with dateLocale
5. Replace hardcoded `'en-US'` with `$workflow.variables.dateLocale`
6. Update `fetch_user_details` node to use `continueOnFail: true` (handle deleted users)
7. Add `notes` field to each node for documentation
8. Update `meta` section with packageId, workflowType, description
9. Add null-safety to user data in `format_entry` node (use optional chaining)
10. Verify all 5 nodes have `typeVersion: 1` and `position`

**Verification**:
```bash
# Validate JSON syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('packages/audit_log/workflow/formatting.json', 'utf8')))" > /dev/null && echo "✓ Valid JSON"

# Check for workflow.variables references
grep -c 'workflow.variables' packages/audit_log/workflow/formatting.json  # Should show 1+
```

### Step 6: Comprehensive Validation (20 min)

```bash
# Run all validation checks
echo "=== Validating All Workflows ==="

for workflow in init stats filters formatting; do
  file="packages/audit_log/workflow/${workflow}.json"
  echo ""
  echo "Checking $workflow.json..."

  # JSON validity
  node -e "console.log(JSON.parse(require('fs').readFileSync('${file}', 'utf8')))" > /dev/null && echo "  ✓ Valid JSON" || echo "  ✗ Invalid JSON"

  # Required fields
  grep -q '"id":' "$file" && echo "  ✓ Has id field" || echo "  ✗ Missing id field"
  grep -q '"versionId":' "$file" && echo "  ✓ Has versionId field" || echo "  ✗ Missing versionId field"
  grep -q '"tenantId":' "$file" && echo "  ✓ Has tenantId field" || echo "  ✗ Missing tenantId field"
  grep -q '"createdAt":' "$file" && echo "  ✓ Has createdAt field" || echo "  ✗ Missing createdAt field"
  grep -q '"updatedAt":' "$file" && echo "  ✓ Has updatedAt field" || echo "  ✗ Missing updatedAt field"
  grep -q '"variables":' "$file" && echo "  ✓ Has variables section" || echo "  ✗ Missing variables section"

  # Schema references
  grep -q '"typeVersion": 1' "$file" && echo "  ✓ Has typeVersion fields" || echo "  ✗ Missing typeVersion fields"
  grep -q '"position": \[' "$file" && echo "  ✓ Has position fields" || echo "  ✗ Missing position fields"

  # Multi-tenant safety
  grep -q 'tenantId.*context.tenantId' "$file" && echo "  ✓ Uses context.tenantId" || echo "  ✗ Missing tenantId filter"
done

echo ""
echo "=== Validation Complete ==="
```

### Step 7: Test Execution (Optional - 10 min)

```bash
# If workflow engine is running, test one workflow
curl -X POST http://localhost:3000/api/v1/test-tenant/audit_log/workflows/audit_init_wf_001/execute \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10,
    "page": 1
  }'

# Expected response:
# {
#   "logs": [...],
#   "pagination": {
#     "total": <number>,
#     "limit": 10,
#     "offset": 0,
#     "hasMore": <boolean>
#   }
# }
```

### Step 8: Documentation & Cleanup (5 min)

```bash
# Verify backup is safe
ls -la packages/audit_log/workflow/.backup/

# Remove backup if confident
# rm -rf packages/audit_log/workflow/.backup/

# Commit changes
git add packages/audit_log/workflow/
git commit -m "feat(audit_log): update workflows to n8n schema compliance

- Add metadata fields: id, versionId, tenantId, createdAt, updatedAt
- Add variables section with configurable parameters
- Add tags for workflow discovery
- Add node documentation via notes field
- Add resilience: retryOnFail, maxTries, continueOnFail
- Ensure multi-tenant safety on all database operations
- Replace hardcoded values with workflow variables

Updated workflows:
- audit_init_wf_001 (Load Audit Logs)
- audit_stats_wf_001 (Calculate Statistics)
- audit_filter_wf_001 (Filter Audit Logs)
- audit_format_wf_001 (Format Entry)

Complies with: /schemas/n8n-workflow.schema.json"
```

---

## Testing & Verification

### Unit-Level Testing

**For each workflow, verify:**

```json
{
  "test": "Metadata completeness",
  "checks": [
    "typeof workflow.id === 'string' && workflow.id.length > 0",
    "workflow.versionId matches /^v\\d+\\.\\d+\\.\\d+/",
    "workflow.tenantId !== undefined",
    "new Date(workflow.createdAt) instanceof Date",
    "new Date(workflow.updatedAt) instanceof Date"
  ]
}
```

### Integration-Level Testing

**Test workflow execution with multi-tenant data:**

```bash
# Test 1: Tenant isolation
curl -X POST http://localhost:3000/api/v1/tenant-a/audit_log/workflows/audit_init_wf_001/execute \
  -H "Authorization: Bearer token-a"

# Should ONLY return logs for tenant-a
# Should NOT return logs for tenant-b

# Test 2: Variable usage
curl -X POST http://localhost:3000/api/v1/tenant-a/audit_log/workflows/audit_stats_wf_001/execute \
  -H "Content-Type: application/json" \
  -d '{ "lookbackDays": 14 }'

# Should use custom lookbackDays parameter instead of default 7

# Test 3: Error handling
curl -X POST http://localhost:3000/api/v1/tenant-a/audit_log/workflows/audit_format_wf_001/execute \
  -H "Content-Type: application/json" \
  -d '{ "id": "deleted_user_log" }'

# Should gracefully handle deleted user (continueOnFail: true)
# Should return "User Deleted" instead of crashing
```

### Schema Validation Testing

```bash
# Validate against n8n schema
npm --prefix schemas run validate:workflow \
  packages/audit_log/workflow/init.json \
  packages/audit_log/workflow/stats.json \
  packages/audit_log/workflow/filters.json \
  packages/audit_log/workflow/formatting.json

# Expected output: "✓ All workflows valid"
```

---

## Rollback Plan

If issues are discovered during testing:

```bash
# Restore from backup
cp packages/audit_log/workflow/.backup/*.json packages/audit_log/workflow/

# Or revert specific commits
git revert <commit-hash>

# For specific workflows only
git checkout HEAD -- packages/audit_log/workflow/init.json
```

---

## Success Criteria

**All 4 workflows are considered compliant when:**

1. **Schema Compliance** (100%)
   - All required fields present: id, versionId, tenantId, createdAt, updatedAt
   - Valid against n8n-workflow.schema.json
   - All nodes have typeVersion and position

2. **Variables Section** (100%)
   - Defined for all workflows
   - Used in place of hardcoded values
   - Include validation rules where applicable

3. **Multi-Tenant Safety** (100%)
   - All database operations filter by tenantId
   - No hardcoded tenant references
   - Context validation in first node

4. **Error Handling** (100%)
   - Critical operations have retryOnFail: true
   - Non-critical operations have continueOnFail: true
   - All nodes have notes documenting purpose

5. **Testing** (100%)
   - All 4 workflows execute successfully
   - Multi-tenant isolation verified
   - Variable parameter handling verified
   - Error cases handled gracefully

6. **Documentation** (100%)
   - Each node has `notes` field
   - Workflow meta includes description
   - All parameters documented
   - Update plan completed and committed

---

## Timeline

| Phase | Task | Duration | Owner |
|-------|------|----------|-------|
| 1 | Backup & Preparation | 5 min | - |
| 2 | init.json Update | 15 min | - |
| 3 | stats.json Update | 15 min | - |
| 4 | filters.json Update | 15 min | - |
| 5 | formatting.json Update | 15 min | - |
| 6 | Validation & Testing | 20 min | - |
| 7 | Documentation | 5 min | - |
| **Total** | **Complete Update** | **90 min** | - |

---

## References

- **N8N Workflow Schema**: `/schemas/n8n-workflow.schema.json`
- **Audit Log Entity Schema**: `/dbal/shared/api/schema/entities/packages/audit_log.yaml`
- **Audit Log Package**: `/packages/audit_log/`
- **Workflow Documentation**: `/docs/workflow/`

---

## Questions & Support

If issues arise during implementation:

1. Validate JSON syntax: `node -e "JSON.parse(require('fs').readFileSync('file.json'))"`
2. Check schema compliance: Review n8n-workflow.schema.json definitions
3. Verify tenantId usage: Search for "tenantId" in all database operations
4. Test execution: Run workflow with test data to verify behavior
5. Review backups: Compare with original files in `.backup/` directory

---

**Plan Status**: Ready for Implementation
**Estimated Completion**: 2 hours
**Quality Gate**: 100% compliance with n8n schema + multi-tenant safety verification
