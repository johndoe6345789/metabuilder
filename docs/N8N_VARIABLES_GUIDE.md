# N8N Workflow Variables Guide

**Last Updated**: 2026-01-22
**Status**: Schema Enhanced with First-Class Variable Support
**Version**: 1.0.0

---

## Overview

Workflow variables are **first-class citizens** in the enhanced n8n workflow schema. They provide:

- ✅ **Type Safety**: Enforce string, number, boolean, array, object, date types
- ✅ **Validation**: Min/max values, patterns, enum constraints
- ✅ **Documentation**: Self-documenting workflows with descriptions
- ✅ **DRY Principle**: Define once, use everywhere
- ✅ **Scope Control**: Workflow, execution, or global scope
- ✅ **Default Values**: Fallback values when not provided

---

## Quick Start

### Basic Variable Declaration

```json
{
  "name": "My Workflow",
  "variables": {
    "apiUrl": {
      "name": "apiUrl",
      "type": "string",
      "description": "API base URL",
      "defaultValue": "https://api.example.com",
      "required": true,
      "scope": "workflow"
    }
  },
  "nodes": [
    {
      "id": "fetch",
      "parameters": {
        "url": "{{ $workflow.variables.apiUrl }}/users"
      }
    }
  ]
}
```

### Accessing Variables

Use template expressions to access variables:

```javascript
// In node parameters:
"{{ $workflow.variables.variableName }}"

// String interpolation:
"{{ $workflow.variables.apiUrl }}/endpoint"

// Conditional logic:
"{{ $workflow.variables.enableDebug ? 'verbose' : 'normal' }}"

// Array methods:
"{{ $workflow.variables.allowedRoles.includes($json.role) }}"

// Object access:
"{{ $workflow.variables.config.timeout }}"
```

---

## Variable Properties

### Required Properties

#### `name` (string, required)
Variable identifier - must be valid JavaScript identifier.

```json
{
  "name": "maxRetries"  // ✅ Valid
}
```

```json
{
  "name": "max-retries"  // ❌ Invalid (contains dash)
}
```

**Pattern**: `^[a-zA-Z_][a-zA-Z0-9_]*$` (starts with letter or underscore, contains alphanumerics and underscores)

---

#### `type` (enum, required)
Variable data type for validation.

**Options**:
- `"string"` - Text values
- `"number"` - Numeric values (integer or float)
- `"boolean"` - true/false
- `"array"` - Array of values
- `"object"` - Key-value object
- `"date"` - ISO 8601 date string
- `"any"` - No type validation

**Examples**:

```json
{
  "timeout": {
    "type": "number"
  },
  "enableFeature": {
    "type": "boolean"
  },
  "allowedRoles": {
    "type": "array"
  },
  "config": {
    "type": "object"
  }
}
```

---

### Optional Properties

#### `description` (string, optional, max 500 chars)
Human-readable documentation.

```json
{
  "name": "retryBackoff",
  "type": "number",
  "description": "Delay in milliseconds between retry attempts using exponential backoff"
}
```

---

#### `defaultValue` (any, optional)
Fallback value if not provided at execution time.

```json
{
  "name": "timeout",
  "type": "number",
  "defaultValue": 5000
}
```

**Type Matching**: Must match declared `type`:
```json
// ✅ Correct
{ "type": "number", "defaultValue": 5000 }
{ "type": "string", "defaultValue": "default" }
{ "type": "boolean", "defaultValue": false }
{ "type": "array", "defaultValue": ["item1", "item2"] }
{ "type": "object", "defaultValue": { "key": "value" } }

// ❌ Incorrect
{ "type": "number", "defaultValue": "5000" }  // Wrong type
```

---

#### `required` (boolean, optional, default: false)
Whether the variable must be provided.

```json
{
  "name": "apiKey",
  "type": "string",
  "required": true  // Execution fails if not provided and no defaultValue
}
```

**Validation Logic**:
```
if (required && !provided && !defaultValue) {
  throw new Error("Required variable 'apiKey' not provided")
}
```

---

#### `scope` (enum, optional, default: "workflow")
Variable lifetime and visibility.

**Options**:

| Scope | Lifetime | Use Case | Example |
|-------|----------|----------|---------|
| `workflow` | Defined in workflow definition | Configuration constants | API URLs, timeouts, feature flags |
| `execution` | Per workflow execution | Runtime values | Batch ID, execution timestamp, debug mode |
| `global` | System-wide | Environment config | Environment name, system limits, global settings |

**Examples**:

```json
// Workflow scope - never changes
{
  "name": "apiUrl",
  "type": "string",
  "defaultValue": "https://api.example.com",
  "scope": "workflow"
}

// Execution scope - changes per run
{
  "name": "executionId",
  "type": "string",
  "description": "Unique ID for this workflow execution",
  "scope": "execution"
}

// Global scope - system-wide
{
  "name": "environment",
  "type": "string",
  "description": "Current environment (dev/staging/prod)",
  "scope": "global"
}
```

---

#### `validation` (object, optional)
Advanced validation rules.

**Properties**:

##### `min` (number)
Minimum value (numbers) or length (strings/arrays).

```json
{
  "name": "pageSize",
  "type": "number",
  "validation": {
    "min": 1,
    "max": 100
  }
}
```

```json
{
  "name": "username",
  "type": "string",
  "validation": {
    "min": 3,    // Min 3 characters
    "max": 50    // Max 50 characters
  }
}
```

---

##### `max` (number)
Maximum value (numbers) or length (strings/arrays).

```json
{
  "name": "retryAttempts",
  "type": "number",
  "validation": {
    "min": 0,
    "max": 10
  }
}
```

---

##### `pattern` (string, regex)
Regular expression pattern for string validation.

```json
{
  "name": "email",
  "type": "string",
  "validation": {
    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  }
}
```

```json
{
  "name": "apiUrl",
  "type": "string",
  "validation": {
    "pattern": "^https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  }
}
```

---

##### `enum` (array)
Whitelist of allowed values.

```json
{
  "name": "environment",
  "type": "string",
  "validation": {
    "enum": ["development", "staging", "production"]
  }
}
```

```json
{
  "name": "logLevel",
  "type": "string",
  "validation": {
    "enum": ["debug", "info", "warn", "error"]
  }
}
```

---

## Complete Examples

### Example 1: API Configuration Variables

```json
{
  "variables": {
    "apiBaseUrl": {
      "name": "apiBaseUrl",
      "type": "string",
      "description": "Base URL for all API requests",
      "defaultValue": "https://api.production.com",
      "required": true,
      "scope": "workflow",
      "validation": {
        "pattern": "^https?://"
      }
    },
    "apiTimeout": {
      "name": "apiTimeout",
      "type": "number",
      "description": "Request timeout in milliseconds",
      "defaultValue": 30000,
      "required": false,
      "scope": "workflow",
      "validation": {
        "min": 1000,
        "max": 60000
      }
    },
    "apiKey": {
      "name": "apiKey",
      "type": "string",
      "description": "API authentication key",
      "required": true,
      "scope": "workflow",
      "validation": {
        "min": 32,
        "pattern": "^[a-zA-Z0-9]+$"
      }
    }
  }
}
```

**Usage**:
```json
{
  "parameters": {
    "url": "{{ $workflow.variables.apiBaseUrl }}/users",
    "timeout": "{{ $workflow.variables.apiTimeout }}",
    "headers": {
      "Authorization": "Bearer {{ $workflow.variables.apiKey }}"
    }
  }
}
```

---

### Example 2: Feature Flags

```json
{
  "variables": {
    "enableEmailNotifications": {
      "name": "enableEmailNotifications",
      "type": "boolean",
      "description": "Send email notifications on completion",
      "defaultValue": true,
      "scope": "workflow"
    },
    "enableSlackIntegration": {
      "name": "enableSlackIntegration",
      "type": "boolean",
      "description": "Post updates to Slack",
      "defaultValue": false,
      "scope": "workflow"
    },
    "enableDebugMode": {
      "name": "enableDebugMode",
      "type": "boolean",
      "description": "Enable verbose logging",
      "defaultValue": false,
      "scope": "execution"
    }
  }
}
```

**Usage**:
```json
{
  "id": "send_email",
  "parameters": {
    "enabled": "{{ $workflow.variables.enableEmailNotifications }}",
    "to": "admin@example.com",
    "subject": "Workflow Complete"
  }
}
```

---

### Example 3: Multi-Environment Configuration

```json
{
  "variables": {
    "environment": {
      "name": "environment",
      "type": "string",
      "description": "Deployment environment",
      "defaultValue": "production",
      "required": true,
      "scope": "global",
      "validation": {
        "enum": ["development", "staging", "production"]
      }
    },
    "databaseUrl": {
      "name": "databaseUrl",
      "type": "string",
      "description": "Database connection string",
      "required": true,
      "scope": "workflow"
    },
    "logLevel": {
      "name": "logLevel",
      "type": "string",
      "description": "Logging verbosity",
      "defaultValue": "info",
      "scope": "execution",
      "validation": {
        "enum": ["debug", "info", "warn", "error"]
      }
    }
  }
}
```

---

### Example 4: Retry & Timeout Configuration

```json
{
  "variables": {
    "maxRetries": {
      "name": "maxRetries",
      "type": "number",
      "description": "Maximum retry attempts",
      "defaultValue": 3,
      "scope": "workflow",
      "validation": {
        "min": 0,
        "max": 10
      }
    },
    "retryBackoff": {
      "name": "retryBackoff",
      "type": "number",
      "description": "Initial retry delay (ms)",
      "defaultValue": 1000,
      "scope": "workflow",
      "validation": {
        "min": 100,
        "max": 10000
      }
    },
    "httpTimeout": {
      "name": "httpTimeout",
      "type": "number",
      "description": "HTTP request timeout (ms)",
      "defaultValue": 30000,
      "scope": "workflow",
      "validation": {
        "min": 1000,
        "max": 120000
      }
    }
  }
}
```

**Usage**:
```json
{
  "retryOnFail": true,
  "maxTries": "{{ $workflow.variables.maxRetries }}",
  "waitBetweenTries": "{{ $workflow.variables.retryBackoff }}",
  "parameters": {
    "timeout": "{{ $workflow.variables.httpTimeout }}"
  }
}
```

---

### Example 5: Complex Object Configuration

```json
{
  "variables": {
    "notificationConfig": {
      "name": "notificationConfig",
      "type": "object",
      "description": "Notification settings for all channels",
      "defaultValue": {
        "email": {
          "enabled": true,
          "recipients": ["admin@example.com"]
        },
        "slack": {
          "enabled": true,
          "channel": "#alerts",
          "webhookUrl": "https://hooks.slack.com/..."
        },
        "sms": {
          "enabled": false
        }
      },
      "scope": "workflow"
    }
  }
}
```

**Usage**:
```json
{
  "id": "send_slack",
  "parameters": {
    "enabled": "{{ $workflow.variables.notificationConfig.slack.enabled }}",
    "channel": "{{ $workflow.variables.notificationConfig.slack.channel }}",
    "webhookUrl": "{{ $workflow.variables.notificationConfig.slack.webhookUrl }}"
  }
}
```

---

## Variable Expression Syntax

### Basic Access

```javascript
{{ $workflow.variables.variableName }}
```

### String Interpolation

```javascript
"{{ $workflow.variables.baseUrl }}/api/v1/users"
```

### Conditional Expressions

```javascript
{{ $workflow.variables.enableDebug ? 'debug' : 'info' }}
```

### Array Methods

```javascript
{{ $workflow.variables.allowedRoles.includes($json.role) }}
{{ $workflow.variables.tags.length > 0 }}
{{ $workflow.variables.items[0] }}
```

### Object Access

```javascript
{{ $workflow.variables.config.timeout }}
{{ $workflow.variables.settings['retry-count'] }}
```

### Mathematical Operations

```javascript
{{ $workflow.variables.timeout * 2 }}
{{ $workflow.variables.maxItems + 10 }}
```

### Comparisons

```javascript
{{ $workflow.variables.maxRetries > 5 }}
{{ $workflow.variables.environment === 'production' }}
```

---

## Best Practices

### 1. Use Descriptive Names

```json
// ✅ Good
{
  "name": "maxRetryAttempts",
  "name": "databaseConnectionTimeout",
  "name": "enableEmailNotifications"
}

// ❌ Bad
{
  "name": "max",
  "name": "timeout",
  "name": "flag1"
}
```

---

### 2. Always Provide Descriptions

```json
// ✅ Good
{
  "name": "apiTimeout",
  "type": "number",
  "description": "HTTP request timeout in milliseconds. Increase for slow connections.",
  "defaultValue": 5000
}

// ❌ Bad
{
  "name": "apiTimeout",
  "type": "number",
  "defaultValue": 5000
}
```

---

### 3. Use Validation for Critical Values

```json
// ✅ Good - prevents invalid values
{
  "name": "environment",
  "type": "string",
  "validation": {
    "enum": ["dev", "staging", "prod"]
  }
}

// ❌ Bad - any string accepted
{
  "name": "environment",
  "type": "string"
}
```

---

### 4. Choose Appropriate Scope

```json
// ✅ Good - correct scopes
{
  "apiUrl": {
    "scope": "workflow"  // Never changes per workflow
  },
  "executionId": {
    "scope": "execution"  // Unique per run
  },
  "systemMaxMemory": {
    "scope": "global"  // System-wide constant
  }
}
```

---

### 5. Provide Sensible Defaults

```json
// ✅ Good
{
  "name": "pageSize",
  "type": "number",
  "defaultValue": 20,
  "validation": {
    "min": 1,
    "max": 100
  }
}

// ⚠️ Okay but risky
{
  "name": "pageSize",
  "type": "number",
  "required": true  // No default, must be provided
}
```

---

## Migration from Meta to Variables

### Before (Using Meta)

```json
{
  "meta": {
    "config": {
      "apiUrl": "https://api.example.com",
      "timeout": 5000,
      "retries": 3
    }
  },
  "nodes": [
    {
      "parameters": {
        "url": "{{ $meta.config.apiUrl }}",
        "timeout": "{{ $meta.config.timeout }}"
      }
    }
  ]
}
```

### After (Using Variables)

```json
{
  "variables": {
    "apiUrl": {
      "name": "apiUrl",
      "type": "string",
      "defaultValue": "https://api.example.com",
      "scope": "workflow"
    },
    "timeout": {
      "name": "timeout",
      "type": "number",
      "defaultValue": 5000,
      "scope": "workflow"
    },
    "retries": {
      "name": "retries",
      "type": "number",
      "defaultValue": 3,
      "scope": "workflow"
    }
  },
  "nodes": [
    {
      "parameters": {
        "url": "{{ $workflow.variables.apiUrl }}",
        "timeout": "{{ $workflow.variables.timeout }}"
      }
    }
  ]
}
```

**Benefits**: Type safety, validation, schema compliance, better documentation

---

## Summary

**Workflow Variables** provide:
- ✅ First-class schema support
- ✅ Type safety and validation
- ✅ Self-documenting workflows
- ✅ DRY principle enforcement
- ✅ Environment-specific deployments
- ✅ Feature flag management
- ✅ Configuration centralization

**Access Pattern**: `{{ $workflow.variables.variableName }}`

**See Also**:
- Example workflow: [docs/N8N_VARIABLES_EXAMPLE.json](./N8N_VARIABLES_EXAMPLE.json)
- Full schema: [schemas/n8n-workflow.schema.json](../schemas/n8n-workflow.schema.json)
- Gap analysis: [docs/N8N_SCHEMA_GAPS.md](./N8N_SCHEMA_GAPS.md)

---

**Status**: Production Ready
**Version**: 1.0.0
**Last Updated**: 2026-01-22
