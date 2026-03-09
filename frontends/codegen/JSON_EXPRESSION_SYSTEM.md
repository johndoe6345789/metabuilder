# JSON Expression System

This document describes the supported JSON expression patterns used across JSON UI schemas.
Legacy compute functions have been removed in favor of expression strings and value templates.

## Core Concepts

### Expressions

Expressions are string values that resolve against a data + event context:

```json
{
  "expression": "event.target.value"
}
```

Supported expression patterns:

- `data` or `event`
- Dot access: `data.user.name`, `event.target.value`
- Literals: numbers, booleans, `null`, `undefined`, quoted strings
- Time: `Date.now()`
- Array filtering:
  - `data.todos.filter(completed === true)`
  - `data.users.filter(status === 'active').length`

### Value Templates

Value templates are JSON objects whose string values are evaluated as expressions:

```json
{
  "valueTemplate": {
    "id": "Date.now()",
    "text": "data.newTodo",
    "completed": false
  }
}
```

### Conditions

Conditions use expression strings that are evaluated against the data context:

```json
{
  "condition": "data.newTodo.length > 0"
}
```

Supported condition patterns:

- `data.field > 0`
- `data.field.length > 0`
- `data.field === 'value'`
- `data.field != null`

## Legacy Compute Functions (Removed)

Schemas should no longer reference function names in `compute`, `transform`, or string-based
condition fields. Use `expression` and `valueTemplate` instead.
