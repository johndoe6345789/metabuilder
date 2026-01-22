# Data Table Workflows - Complete JSON Examples with Annotations

**Purpose**: Reference guide showing full corrected workflows with detailed explanations
**Status**: Use these as templates for updating actual workflow files
**Created**: 2026-01-22

---

## Table of Contents

1. [sorting.json - Complete Example](#sortingjson---complete-example)
2. [filtering.json - Complete Example](#filteringjson---complete-example)
3. [fetch-data.json - Complete Example](#fetch-datajson---complete-example)
4. [pagination.json - Complete Example](#paginationjson---complete-example)
5. [Connections Format Deep Dive](#connections-format-deep-dive)
6. [Testing the JSON](#testing-the-json)

---

## sorting.json - Complete Example

### What This Workflow Does
Sorts data table by a specified column in ascending or descending order.

### Node Flow
```
1. Extract Sort Params      → Extract sortBy and sortOrder from input
2. Validate Sort Fields     → Check that sortBy is in allowed fields list
3. Apply Sort               → Sort the data array
4. Return Sorted            → Return sorted data and metadata
```

### Complete JSON (Ready to Use)

```json
{
  "name": "Handle Data Table Sorting",
  "active": false,
  "nodes": [
    {
      "id": "extract_sort_params",
      "name": "Extract Sort Params",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "{{ $json }}",
        "output": {
          "sortBy": "{{ $json.sortBy || 'createdAt' }}",
          "sortOrder": "{{ $json.sortOrder || 'desc' }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "validate_sort_fields",
      "name": "Validate Sort Fields",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "condition": "{{ ['id', 'name', 'email', 'createdAt', 'updatedAt', 'status'].includes($steps.extract_sort_params.output.sortBy) }}",
        "operation": "condition"
      }
    },
    {
      "id": "apply_sort",
      "name": "Apply Sort",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "input": "{{ $json.data }}",
        "output": "{{ $json.data.sort((a, b) => { const aVal = a[$steps.extract_sort_params.output.sortBy]; const bVal = b[$steps.extract_sort_params.output.sortBy]; if ($steps.extract_sort_params.output.sortOrder === 'asc') return aVal > bVal ? 1 : -1; return aVal < bVal ? 1 : -1; }) }}",
        "operation": "transform_data"
      }
    },
    {
      "id": "return_sorted",
      "name": "Return Sorted",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "data": {
          "sortBy": "{{ $steps.extract_sort_params.output.sortBy }}",
          "sortOrder": "{{ $steps.extract_sort_params.output.sortOrder }}",
          "data": "{{ $steps.apply_sort.output }}"
        },
        "action": "emit_event",
        "event": "data_sorted"
      }
    }
  ],
  "connections": {
    "Extract Sort Params": {
      "main": {
        "0": [
          {
            "node": "Validate Sort Fields",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Validate Sort Fields": {
      "main": {
        "0": [
          {
            "node": "Apply Sort",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Apply Sort",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Apply Sort": {
      "main": {
        "0": [
          {
            "node": "Return Sorted",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  },
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

### Key Changes From Original
- ✅ `name` properties added to all 4 nodes
- ✅ `typeVersion: 1` already present
- ✅ Connections object populated (was empty `{}`)

### Example Input/Output

**Input:**
```json
{
  "sortBy": "email",
  "sortOrder": "asc",
  "data": [
    {"id": 1, "name": "Alice", "email": "alice@example.com", "createdAt": "2026-01-01"},
    {"id": 2, "name": "Bob", "email": "bob@example.com", "createdAt": "2026-01-02"}
  ]
}
```

**Output:**
```json
{
  "sortBy": "email",
  "sortOrder": "asc",
  "data": [
    {"id": 1, "name": "Alice", "email": "alice@example.com", "createdAt": "2026-01-01"},
    {"id": 2, "name": "Bob", "email": "bob@example.com", "createdAt": "2026-01-02"}
  ]
}
```

---

## filtering.json - Complete Example

### What This Workflow Does
Filters data table by status, search term, and date range. Multiple filter conditions can be applied simultaneously.

### Node Flow
```
1. Validate Context         → Check that tenantId exists
2. Extract Filters          → Extract filter parameters (status, search, dateFrom, dateTo)
3. Apply Status Filter      → Condition: is status filter applied?
4. Apply Search Filter      → Condition: is search filter applied?
5. Apply Date Filter        → Condition: is date filter applied?
6. Filter Data              → Apply all active filters to data array
7. Return Filtered          → Return filtered data and filter metadata
```

### Complete JSON (Ready to Use)

```json
{
  "name": "Handle Data Table Filtering",
  "active": false,
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "{{ $context.tenantId }}",
        "operation": "validate",
        "validator": "required"
      }
    },
    {
      "id": "extract_filters",
      "name": "Extract Filters",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "input": "{{ $json }}",
        "output": {
          "status": "{{ $json.filters.status || null }}",
          "searchTerm": "{{ $json.filters.search || '' }}",
          "dateFrom": "{{ $json.filters.dateFrom || null }}",
          "dateTo": "{{ $json.filters.dateTo || null }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "apply_status_filter",
      "name": "Apply Status Filter",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "condition": "{{ $steps.extract_filters.output.status !== null }}",
        "operation": "condition"
      }
    },
    {
      "id": "apply_search_filter",
      "name": "Apply Search Filter",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "condition": "{{ $steps.extract_filters.output.searchTerm.length > 0 }}",
        "operation": "condition"
      }
    },
    {
      "id": "apply_date_filter",
      "name": "Apply Date Filter",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "condition": "{{ $steps.extract_filters.output.dateFrom !== null || $steps.extract_filters.output.dateTo !== null }}",
        "operation": "condition"
      }
    },
    {
      "id": "filter_data",
      "name": "Filter Data",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "input": "{{ $json.data }}",
        "output": "{{ $json.data.filter(item => { let match = true; if ($steps.extract_filters.output.status && item.status !== $steps.extract_filters.output.status) match = false; if ($steps.extract_filters.output.searchTerm && !JSON.stringify(item).toLowerCase().includes($steps.extract_filters.output.searchTerm.toLowerCase())) match = false; if ($steps.extract_filters.output.dateFrom && new Date(item.createdAt) < new Date($steps.extract_filters.output.dateFrom)) match = false; if ($steps.extract_filters.output.dateTo && new Date(item.createdAt) > new Date($steps.extract_filters.output.dateTo)) match = false; return match; }) }}",
        "operation": "transform_data"
      }
    },
    {
      "id": "return_filtered",
      "name": "Return Filtered",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [100, 500],
      "parameters": {
        "data": {
          "filters": "{{ $steps.extract_filters.output }}",
          "data": "{{ $steps.filter_data.output }}"
        },
        "action": "emit_event",
        "event": "data_filtered"
      }
    }
  ],
  "connections": {
    "Validate Context": {
      "main": {
        "0": [
          {
            "node": "Extract Filters",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Extract Filters",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Extract Filters": {
      "main": {
        "0": [
          {
            "node": "Apply Status Filter",
            "type": "main",
            "index": 0
          },
          {
            "node": "Apply Search Filter",
            "type": "main",
            "index": 0
          },
          {
            "node": "Apply Date Filter",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Apply Status Filter": {
      "main": {
        "0": [
          {
            "node": "Filter Data",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Filter Data",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Apply Search Filter": {
      "main": {
        "0": [
          {
            "node": "Filter Data",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Filter Data",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Apply Date Filter": {
      "main": {
        "0": [
          {
            "node": "Filter Data",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Filter Data",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Filter Data": {
      "main": {
        "0": [
          {
            "node": "Return Filtered",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  },
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

### Key Changes From Original
- ✅ `name` properties already present on all 7 nodes
- ✅ `typeVersion: 1` already present
- ✅ Connections object populated (was empty `{}`)

### Example Input/Output

**Input (with all filters):**
```json
{
  "filters": {
    "status": "active",
    "search": "alice",
    "dateFrom": "2026-01-01",
    "dateTo": "2026-12-31"
  },
  "data": [
    {"id": 1, "name": "Alice", "status": "active", "createdAt": "2026-01-15"},
    {"id": 2, "name": "Bob", "status": "inactive", "createdAt": "2026-02-01"},
    {"id": 3, "name": "Alice Smith", "status": "active", "createdAt": "2026-03-01"}
  ]
}
```

**Output:**
```json
{
  "filters": {
    "status": "active",
    "searchTerm": "alice",
    "dateFrom": "2026-01-01",
    "dateTo": "2026-12-31"
  },
  "data": [
    {"id": 1, "name": "Alice", "status": "active", "createdAt": "2026-01-15"},
    {"id": 3, "name": "Alice Smith", "status": "active", "createdAt": "2026-03-01"}
  ]
}
```

---

## fetch-data.json - Complete Example

### What This Workflow Does
Fetches data from an API with multi-tenant safety, user ACL validation, filtering, pagination, and sorting. This is the most complex workflow.

### Node Flow
```
1. Validate Tenant Critical → Verify tenantId exists (data leak prevention)
2. Validate User Critical   → Verify userId exists (ACL requirement)
3. Validate Input           → Validate request parameters
4. Extract Params           → Extract and normalize pagination/sorting params
5. Calculate Offset         → Calculate array offset from page number
6. Build Filter             → Build filter object with tenant isolation
7. Apply User ACL           → Check if user has permission to see this data
8. Fetch Data               → HTTP request to get data from API
9. Validate Response        → Check HTTP response status is 200
10. Parse Response          → Extract data and total from response body
11. Format Response         → Format with pagination and sorting metadata
12. Return Success          → Return formatted response
```

### Complete JSON (Ready to Use)

```json
{
  "name": "Fetch Data for Table",
  "active": false,
  "nodes": [
    {
      "id": "validate_tenant_critical",
      "name": "Validate Tenant Critical",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "{{ $context.tenantId }}",
        "operation": "validate",
        "validator": "required",
        "errorMessage": "tenantId is REQUIRED for multi-tenant safety - data leak prevention"
      }
    },
    {
      "id": "validate_user_critical",
      "name": "Validate User Critical",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "input": "{{ $context.user.id }}",
        "operation": "validate",
        "validator": "required",
        "errorMessage": "userId is REQUIRED for row-level ACL"
      }
    },
    {
      "id": "validate_input",
      "name": "Validate Input",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "input": "{{ $json }}",
        "operation": "validate",
        "rules": {
          "entity": "required|string",
          "sortBy": "string",
          "sortOrder": "string",
          "limit": "number|max:500",
          "page": "number|min:1"
        }
      }
    },
    {
      "id": "extract_params",
      "name": "Extract Params",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "output": {
          "entity": "{{ $json.entity }}",
          "sortBy": "{{ $json.sortBy || 'createdAt' }}",
          "sortOrder": "{{ $json.sortOrder === 'asc' ? 1 : -1 }}",
          "limit": "{{ Math.min($json.limit || 50, 500) }}",
          "page": "{{ $json.page || 1 }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "calculate_offset",
      "name": "Calculate Offset",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "output": "{{ ($steps.extract_params.output.page - 1) * $steps.extract_params.output.limit }}",
        "operation": "transform_data"
      }
    },
    {
      "id": "build_filter",
      "name": "Build Filter",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "output": {
          "tenantId": "{{ $context.tenantId }}",
          "searchTerm": "{{ $json.search || null }}",
          "filters": "{{ $json.filters || {} }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "apply_user_acl",
      "name": "Apply User Acl",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [100, 500],
      "parameters": {
        "condition": "{{ $context.user.level >= 3 || $steps.build_filter.output.filters.userId === $context.user.id }}",
        "operation": "condition"
      }
    },
    {
      "id": "fetch_data",
      "name": "Fetch Data",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [400, 500],
      "parameters": {
        "operation": "http_request",
        "url": "{{ '/api/v1/' + $context.tenantId + '/' + $steps.extract_params.output.entity }}",
        "method": "GET",
        "queryParameters": {
          "tenantId": "{{ $context.tenantId }}",
          "sortBy": "{{ $steps.extract_params.output.sortBy }}",
          "sortOrder": "{{ $steps.extract_params.output.sortOrder }}",
          "limit": "{{ $steps.extract_params.output.limit }}",
          "offset": "{{ $steps.calculate_offset.output }}",
          "filters": "{{ JSON.stringify($steps.build_filter.output.filters) }}"
        },
        "headers": {
          "Authorization": "{{ 'Bearer ' + $context.token }}"
        }
      }
    },
    {
      "id": "validate_response",
      "name": "Validate Response",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [700, 500],
      "parameters": {
        "condition": "{{ $steps.fetch_data.output.status === 200 }}",
        "operation": "condition"
      }
    },
    {
      "id": "parse_response",
      "name": "Parse Response",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [100, 700],
      "parameters": {
        "input": "{{ $steps.fetch_data.output.body }}",
        "output": {
          "data": "{{ $steps.fetch_data.output.body.data }}",
          "total": "{{ $steps.fetch_data.output.body.total }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "format_response",
      "name": "Format Response",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 700],
      "parameters": {
        "output": {
          "data": "{{ $steps.parse_response.output.data }}",
          "pagination": {
            "total": "{{ $steps.parse_response.output.total }}",
            "page": "{{ $steps.extract_params.output.page }}",
            "limit": "{{ $steps.extract_params.output.limit }}",
            "totalPages": "{{ Math.ceil($steps.parse_response.output.total / $steps.extract_params.output.limit) }}"
          },
          "sorting": {
            "sortBy": "{{ $steps.extract_params.output.sortBy }}",
            "sortOrder": "{{ $steps.extract_params.output.sortOrder === 1 ? 'asc' : 'desc' }}"
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
      "position": [700, 700],
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": "{{ $steps.format_response.output }}"
      }
    }
  ],
  "connections": {
    "Validate Tenant Critical": {
      "main": {
        "0": [
          {
            "node": "Validate User Critical",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Validate User Critical",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Validate User Critical": {
      "main": {
        "0": [
          {
            "node": "Validate Input",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
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
            "node": "Extract Params",
            "type": "main",
            "index": 0
          },
          {
            "node": "Calculate Offset",
            "type": "main",
            "index": 0
          },
          {
            "node": "Build Filter",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Extract Params",
            "type": "main",
            "index": 0
          },
          {
            "node": "Calculate Offset",
            "type": "main",
            "index": 0
          },
          {
            "node": "Build Filter",
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
            "node": "Apply User ACL",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Calculate Offset": {
      "main": {
        "0": [
          {
            "node": "Apply User ACL",
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
            "node": "Apply User ACL",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Apply User ACL": {
      "main": {
        "0": [
          {
            "node": "Fetch Data",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Fetch Data",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Fetch Data": {
      "main": {
        "0": [
          {
            "node": "Validate Response",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Validate Response": {
      "main": {
        "0": [
          {
            "node": "Parse Response",
            "type": "main",
            "index": 0
          },
          {
            "node": "Parse Response",
            "type": "main",
            "index": 0
          }
        ],
        "1": [
          {
            "node": "Parse Response",
            "type": "main",
            "index": 0
          },
          {
            "node": "Parse Response",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Parse Response": {
      "main": {
        "0": [
          {
            "node": "Format Response",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Format Response": {
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

### Key Changes From Original
- ✅ `name` properties already present on all 12 nodes
- ✅ `typeVersion: 1` already present
- ⚠️ Line 120: FIX `$build_filter` → `$steps.build_filter` in apply_user_acl condition
- ✅ Connections object populated (was empty `{}`)

### Example Input/Output

**Input (HTTP Request):**
```
GET /api/v1/acme/users
Query Parameters:
  tenantId: "acme"
  sortBy: "email"
  sortOrder: 1
  limit: 50
  offset: 0
  filters: {"status":"active"}

Headers:
  Authorization: "Bearer <token>"
```

**Response:**
```json
{
  "data": [
    {"id": 1, "name": "Alice", "email": "alice@example.com", "status": "active"},
    {"id": 2, "name": "Bob", "email": "bob@example.com", "status": "active"}
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  },
  "sorting": {
    "sortBy": "email",
    "sortOrder": "asc"
  }
}
```

---

## pagination.json - Complete Example

### What This Workflow Does
Implements pagination logic: extracts pagination parameters, calculates offset, slices data, and returns paginated response with metadata.

### Node Flow
```
1. Extract Pagination Params → Extract page and limit, set defaults and boundaries
2. Calculate Offset          → Convert page number to array offset
3. Slice Data                → Slice data array based on offset and limit
4. Calculate Total Pages     → Calculate how many pages exist
5. Return Paginated          → Return sliced data with pagination metadata
```

### Complete JSON (Ready to Use)

```json
{
  "name": "Handle Data Table Pagination",
  "active": false,
  "nodes": [
    {
      "id": "extract_pagination_params",
      "name": "Extract Pagination Params",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "{{ $json }}",
        "output": {
          "page": "{{ Math.max($json.page || 1, 1) }}",
          "limit": "{{ Math.min($json.limit || 50, 500) }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "calculate_offset",
      "name": "Calculate Offset",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "output": "{{ ($steps.extract_pagination_params.output.page - 1) * $steps.extract_pagination_params.output.limit }}",
        "operation": "transform_data"
      }
    },
    {
      "id": "slice_data",
      "name": "Slice Data",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "input": "{{ $json.data }}",
        "output": "{{ $json.data.slice($steps.calculate_offset.output, $steps.calculate_offset.output + $steps.extract_pagination_params.output.limit) }}",
        "operation": "transform_data"
      }
    },
    {
      "id": "calculate_total_pages",
      "name": "Calculate Total Pages",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "output": "{{ Math.ceil($json.data.length / $steps.extract_pagination_params.output.limit) }}",
        "operation": "transform_data"
      }
    },
    {
      "id": "return_paginated",
      "name": "Return Paginated",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "data": {
          "data": "{{ $steps.slice_data.output }}",
          "pagination": {
            "page": "{{ $steps.extract_pagination_params.output.page }}",
            "limit": "{{ $steps.extract_pagination_params.output.limit }}",
            "total": "{{ $json.data.length }}",
            "totalPages": "{{ $steps.calculate_total_pages.output }}",
            "hasMore": "{{ $steps.extract_pagination_params.output.page < $steps.calculate_total_pages.output }}"
          }
        },
        "action": "emit_event",
        "event": "data_paginated"
      }
    }
  ],
  "connections": {
    "Extract Pagination Params": {
      "main": {
        "0": [
          {
            "node": "Calculate Offset",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Calculate Offset": {
      "main": {
        "0": [
          {
            "node": "Slice Data",
            "type": "main",
            "index": 0
          },
          {
            "node": "Calculate Total Pages",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Slice Data": {
      "main": {
        "0": [
          {
            "node": "Return Paginated",
            "type": "main",
            "index": 0
          }
        ]
      }
    },
    "Calculate Total Pages": {
      "main": {
        "0": [
          {
            "node": "Return Paginated",
            "type": "main",
            "index": 0
          }
        ]
      }
    }
  },
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

### Key Changes From Original
- ✅ `name` properties already present on all 5 nodes
- ✅ `typeVersion: 1` already present
- ✅ Connections object populated (was empty `{}`)

### Example Input/Output

**Input:**
```json
{
  "page": 2,
  "limit": 10,
  "data": [
    {"id": 1, "name": "Item 1"},
    {"id": 2, "name": "Item 2"},
    ... (100 items total)
  ]
}
```

**Output:**
```json
{
  "data": [
    {"id": 11, "name": "Item 11"},
    {"id": 12, "name": "Item 12"},
    ... (10 items for page 2)
  ],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasMore": true
  }
}
```

---

## Connections Format Deep Dive

### Understanding N8N Connections Structure

Every workflow node can have multiple outputs (indexed 0, 1, 2, etc.). For condition nodes:
- **Output 0**: True branch
- **Output 1**: False branch (or error)

### Basic Linear Flow (sorting.json)

```
Node A → Node B → Node C → Node D
```

```json
"connections": {
  "NodeA": {
    "main": {
      "0": [{"node": "NodeB", "type": "main", "index": 0}]
    }
  },
  "NodeB": {
    "main": {
      "0": [{"node": "NodeC", "type": "main", "index": 0}]
    }
  },
  "NodeC": {
    "main": {
      "0": [{"node": "NodeD", "type": "main", "index": 0}]
    }
  }
}
```

### Branching Flow (filtering.json)

```
NodeA → NodeB → (NodeC | NodeD | NodeE) → NodeF → NodeG
```

```json
"connections": {
  "NodeA": {
    "main": {
      "0": [{"node": "NodeB", "type": "main", "index": 0}]
    }
  },
  "NodeB": {
    "main": {
      "0": [
        {"node": "NodeC", "type": "main", "index": 0},
        {"node": "NodeD", "type": "main", "index": 0},
        {"node": "NodeE", "type": "main", "index": 0}
      ]
    }
  },
  "NodeC": {
    "main": {
      "0": [{"node": "NodeF", "type": "main", "index": 0}]
    }
  },
  "NodeD": {
    "main": {
      "0": [{"node": "NodeF", "type": "main", "index": 0}]
    }
  },
  "NodeE": {
    "main": {
      "0": [{"node": "NodeF", "type": "main", "index": 0}]
    }
  },
  "NodeF": {
    "main": {
      "0": [{"node": "NodeG", "type": "main", "index": 0}]
    }
  }
}
```

### Conditional Flow with True/False Branches

For condition nodes with multiple outputs:

```json
"NodeCondition": {
  "main": {
    "0": [{"node": "SuccessNode", "type": "main", "index": 0}],
    "1": [{"node": "ErrorNode", "type": "main", "index": 0}]
  }
}
```

Where:
- Output `0` = Condition was TRUE
- Output `1` = Condition was FALSE

---

## Testing the JSON

### 1. Syntax Validation

```bash
# Test each file for valid JSON
cat packages/data_table/workflow/sorting.json | python3 -m json.tool > /dev/null && echo "✅ sorting.json valid"
cat packages/data_table/workflow/filtering.json | python3 -m json.tool > /dev/null && echo "✅ filtering.json valid"
cat packages/data_table/workflow/fetch-data.json | python3 -m json.tool > /dev/null && echo "✅ fetch-data.json valid"
cat packages/data_table/workflow/pagination.json | python3 -m json.tool > /dev/null && echo "✅ pagination.json valid"
```

### 2. Node Property Validation

```python
import json

def validate_workflow(filepath):
    with open(filepath) as f:
        workflow = json.load(f)

    required_props = ["id", "name", "type", "typeVersion", "position"]

    for node in workflow['nodes']:
        for prop in required_props:
            if prop not in node:
                print(f"❌ Node {node['id']} missing {prop}")
                return False

    print(f"✅ {filepath} - All nodes have required properties")
    return True

# Test all files
for file in [
    'packages/data_table/workflow/sorting.json',
    'packages/data_table/workflow/filtering.json',
    'packages/data_table/workflow/fetch-data.json',
    'packages/data_table/workflow/pagination.json'
]:
    validate_workflow(file)
```

### 3. Connections Validation

```python
def validate_connections(filepath):
    with open(filepath) as f:
        workflow = json.load(f)

    # Check connections not empty
    if not workflow['connections']:
        print(f"❌ {filepath} - connections object is empty")
        return False

    # Check all connected nodes exist
    node_ids = {node['name'] for node in workflow['nodes']}

    for from_node, connections in workflow['connections'].items():
        if from_node not in node_ids:
            print(f"❌ {filepath} - connection from unknown node: {from_node}")
            return False

        for to_conn in connections.get('main', {}).get('0', []):
            if to_conn['node'] not in node_ids:
                print(f"❌ {filepath} - connection to unknown node: {to_conn['node']}")
                return False

    print(f"✅ {filepath} - All connections valid")
    return True

# Test all files
for file in [
    'packages/data_table/workflow/sorting.json',
    'packages/data_table/workflow/filtering.json',
    'packages/data_table/workflow/fetch-data.json',
    'packages/data_table/workflow/pagination.json'
]:
    validate_connections(file)
```

### 4. Python Executor Validation

```python
from workflow.executor.python.n8n_schema import N8NWorkflow
import json

for file in [
    'packages/data_table/workflow/sorting.json',
    'packages/data_table/workflow/filtering.json',
    'packages/data_table/workflow/fetch-data.json',
    'packages/data_table/workflow/pagination.json'
]:
    with open(file) as f:
        workflow = json.load(f)

    try:
        is_valid = N8NWorkflow.validate(workflow)
        if is_valid:
            print(f"✅ {file} - Passes N8N validation")
        else:
            print(f"❌ {file} - Fails N8N validation")
    except Exception as e:
        print(f"❌ {file} - Validation error: {e}")
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-22
**Status**: Ready for Reference
**Use Case**: Template for updating actual workflow files

