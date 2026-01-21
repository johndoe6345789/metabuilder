# @metabuilder/workflow-plugin-dbal-read

DBAL Read node executor - Query database with filtering and pagination support.

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

- **read**: Query database records
- **validate**: Validate input data against rules
- **aggregate**: Perform aggregation queries

## Features

- Multi-tenant safe (enforces tenantId)
- Template variable interpolation
- Input validation with flexible rules
- Aggregation support
- Automatic pagination

## License

MIT
