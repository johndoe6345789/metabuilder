# DBAL Read Node Plugin

Query database with filtering, sorting, and pagination support.

## Installation

```bash
npm install @metabuilder/workflow-plugin-dbal-read
```

## Usage

```json
{
  "id": "read-users",
  "type": "operation",
  "nodeType": "dbal-read",
  "parameters": {
    "entity": "User",
    "operation": "read",
    "filter": {
      "tenantId": "{{ $context.tenantId }}",
      "status": "active"
    },
    "sort": { "createdAt": -1 },
    "limit": 50,
    "offset": 0
  }
}
```

## Operations

### read
Query database records with optional filtering and sorting.

### validate
Validate input data against rules.

### aggregate
Perform aggregation queries (group by, count, sum, etc.).

## Parameters

- `entity` (required): Entity name to query
- `operation`: Operation type (read, validate, aggregate)
- `filter`: Filter conditions
- `sort`: Sort order
- `limit`: Max results (default: 100)
- `offset`: Pagination offset (default: 0)

## Features

- Multi-tenant safe (enforces tenantId filtering)
- Template variable interpolation in filters
- Input validation with flexible rules
- Aggregation support
- Automatic pagination

## License

MIT
