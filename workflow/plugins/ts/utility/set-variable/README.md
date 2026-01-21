# Set Variable Node Plugin

Set workflow variables for use in subsequent nodes.

## Installation

```bash
npm install @metabuilder/workflow-plugin-set-variable
```

## Usage

```json
{
  "id": "set-vars",
  "type": "operation",
  "nodeType": "set-variable",
  "parameters": {
    "variables": {
      "userId": "{{ $json.id }}",
      "userEmail": "{{ $json.email }}",
      "processDate": "{{ new Date().toISOString() }}"
    },
    "mode": "merge"
  }
}
```

## Operations

### Set Simple Variables
Store string and number values:

```json
{
  "variables": {
    "count": 0,
    "name": "John Doe",
    "active": true
  }
}
```

### Set Variables from Input Data
Reference input data with template expressions:

```json
{
  "variables": {
    "userId": "{{ $json.id }}",
    "userName": "{{ $json.name }}",
    "userStatus": "{{ $json.status }}"
  }
}
```

### Set Computed Variables
Use expressions to compute values:

```json
{
  "variables": {
    "fullName": "{{ $json.firstName + ' ' + $json.lastName }}",
    "isActive": "{{ $json.status === 'active' }}",
    "count": "{{ $json.items.length }}"
  }
}
```

### Set Complex Variables
Store objects and arrays:

```json
{
  "variables": {
    "userData": {
      "id": "{{ $json.id }}",
      "name": "{{ $json.name }}",
      "email": "{{ $json.email }}"
    },
    "tags": ["{{ $json.tag1 }}", "{{ $json.tag2 }}"]
  }
}
```

### Merge vs Replace Mode
Merge adds to existing variables (default):

```json
{
  "variables": { "newVar": "value" },
  "mode": "merge"
}
```

Replace clears all previous variables:

```json
{
  "variables": { "var1": "value" },
  "mode": "replace"
}
```

## Parameters

- `variables` (required): Object with variable definitions
  - Keys must be valid variable names (alphanumeric + underscore)
  - Values can be strings, numbers, booleans, objects, or arrays
  - Supports template expressions in strings
  - Recursively interpolates nested objects
- `mode` (optional): How to handle existing variables
  - `merge` (default): Add new variables to existing set
  - `replace`: Clear existing variables first
  - `append`: Append to existing array variables

## Variable Names

Valid variable names:
- Must start with letter (a-z, A-Z) or underscore (_)
- Can contain letters, numbers (0-9), and underscores
- Are case-sensitive
- Examples: `userId`, `_private`, `tempData123`

Invalid variable names:
- `123var` (starts with number)
- `user-id` (contains hyphen)
- `user.id` (contains dot)
- `user@id` (contains special char)

## Template Expressions

Variable values support template interpolation:

- `{{ $json.fieldName }}` - Access input field
- `{{ $json.field1 + $json.field2 }}` - Concatenate/add
- `{{ $json.price * 1.1 }}` - Calculate
- `{{ $json.items.length }}` - Array length
- `{{ $json.active ? 'yes' : 'no' }}` - Conditionals
- `{{ new Date().toISOString() }}` - Current timestamp
- `{{ $env.API_KEY }}` - Environment variables
- `{{ $context.tenantId }}` - Context values

## Reserved Names

These names conflict with built-in variables and should be avoided:
- `context`
- `state`
- `json`
- `env`
- `utils`
- `$json`
- `$context`
- `$state`
- `$env`

Using reserved names will trigger a validation warning.

## Features

- Template expression interpolation in variable values
- Nested object and array support
- Multiple variable setting in single node
- Mode selection (merge/replace/append)
- Variable name validation
- Reserved name detection
- Type preservation (strings, numbers, booleans, objects)
- Recursive object interpolation

## Examples

### Set User Information

```json
{
  "id": "set-user-vars",
  "nodeType": "set-variable",
  "parameters": {
    "variables": {
      "userId": "{{ $json.id }}",
      "userName": "{{ $json.name }}",
      "userEmail": "{{ $json.email }}",
      "isAdmin": "{{ $json.role === 'admin' }}"
    }
  }
}
```

### Set Computed Values

```json
{
  "id": "set-computed",
  "nodeType": "set-variable",
  "parameters": {
    "variables": {
      "total": "{{ $json.subtotal + $json.tax }}",
      "discount": "{{ $json.total * 0.1 }}",
      "finalPrice": "{{ ($json.subtotal + $json.tax) - ($json.total * 0.1) }}",
      "timestamp": "{{ new Date().toISOString() }}"
    }
  }
}
```

### Set Conditional Variables

```json
{
  "id": "set-conditional",
  "nodeType": "set-variable",
  "parameters": {
    "variables": {
      "status": "{{ $json.amount > 1000 ? 'high' : 'normal' }}",
      "requiresApproval": "{{ $json.amount > 5000 }}",
      "priority": "{{ $json.urgent ? 1 : 3 }}"
    }
  }
}
```

### Set Complex Data Structure

```json
{
  "id": "set-complex",
  "nodeType": "set-variable",
  "parameters": {
    "variables": {
      "order": {
        "id": "{{ $json.id }}",
        "customer": {
          "name": "{{ $json.customerName }}",
          "email": "{{ $json.customerEmail }}"
        },
        "items": "{{ $json.items }}",
        "totals": {
          "subtotal": "{{ $json.subtotal }}",
          "tax": "{{ $json.tax }}",
          "total": "{{ $json.total }}"
        }
      }
    }
  }
}
```

### Replace All Variables

```json
{
  "id": "reset-variables",
  "nodeType": "set-variable",
  "parameters": {
    "variables": {
      "step": 1,
      "status": "processing"
    },
    "mode": "replace"
  }
}
```

### Build from Previous Variable

```json
{
  "id": "build-from-var",
  "nodeType": "set-variable",
  "parameters": {
    "variables": {
      "processedUserId": "{{ $context.variables.userId }}_processed",
      "incrementedCount": "{{ parseInt($context.variables.count) + 1 }}"
    }
  }
}
```

## Accessing Variables in Subsequent Nodes

Once set, variables are available in other nodes:

```json
{
  "id": "next-node",
  "nodeType": "http-request",
  "parameters": {
    "url": "{{ $context.variables.apiUrl }}",
    "method": "POST",
    "body": {
      "userId": "{{ $context.variables.userId }}",
      "email": "{{ $context.variables.userEmail }}"
    }
  }
}
```

## Variable Scope

Variables are scoped to workflow execution:
- Available to all subsequent nodes in same execution
- Not persisted across executions
- Can be overwritten by later Set Variable nodes
- Lost when workflow completes

## License

MIT
