# MetaBuilder Schemas - Quick Start Guide

> **Version 2.0.0** | Secure by Default | Visual Programming Ready

## What Changed?

### ✅ Security Improvements
- **Input sanitization enabled by default** - XSS and SQL injection protection out of the box
- Password validation patterns included
- Removed deprecated insecure fields

### ✅ Visual Programming Support
- Standard library with 50+ built-in functions
- Visual metadata for GUI designers (icons, colors, categories)
- Data flow connection tracking
- Performance and complexity hints

### ✅ Cross-Schema Validation
- 12 built-in validation rules
- Automatic detection of broken references
- Circular dependency detection
- Performance warnings

---

## 30-Second Start

```bash
# 1. Create package structure
mkdir my-package && cd my-package
mkdir -p {entities,scripts,api,components}

# 2. Create package.json (metadata schema)
cat > package.json << 'EOF'
{
  "$schema": "https://metabuilder.dev/schemas/package-metadata.schema.json",
  "packageId": "my-package",
  "name": "My Package",
  "version": "1.0.0",
  "description": "My first MetaBuilder package"
}
EOF

# 3. Validate
./schemas/package-schemas/schema_validator.sh package.json

# 4. You're ready! Add more schemas as needed.
```

---

## Common Patterns

### 1. Create a Function (JSON Script)

```json
{
  "$schema": "https://metabuilder.dev/schemas/json-script.schema.json",
  "schemaVersion": "2.2.0",
  "package": "my-package",

  "functions": [
    {
      "id": "greet_user",
      "name": "greetUser",
      "params": [
        {
          "name": "name",
          "type": "string",
          "sanitize": true
        }
      ],
      "returnType": "string",

      "body": [
        {
          "type": "return",
          "value": {
            "type": "template_literal",
            "parts": [
              "Hello, ",
              {"type": "identifier", "name": "name"},
              "!"
            ]
          }
        }
      ],

      "visual": {
        "icon": "👋",
        "color": "#3498db",
        "category": "user-interaction"
      }
    }
  ]
}
```

### 2. Create an API Route

```json
{
  "$schema": "https://metabuilder.dev/schemas/api.schema.json",
  "schemaVersion": "1.0.0",
  "package": "my-package",
  "basePath": "/api/v1",

  "routes": [
    {
      "path": "/users/:id",
      "method": "GET",
      "handler": "getUser",
      "auth": {
        "type": "bearer",
        "required": true
      },
      "rateLimit": {
        "max": 100,
        "windowMs": 60000
      },
      "response": {
        "200": {
          "description": "User found",
          "schema": "User"
        },
        "404": {
          "description": "User not found"
        }
      }
    }
  ]
}
```

### 3. Define an Entity

```json
{
  "$schema": "https://metabuilder.dev/schemas/entities.schema.json",
  "entities": [
    {
      "name": "User",
      "version": "1.0",
      "primaryKey": "id",
      "timestamps": true,
      "softDelete": true,

      "fields": {
        "id": {
          "type": "uuid",
          "generated": true
        },
        "email": {
          "type": "string",
          "unique": true,
          "required": true,
          "maxLength": 255
        },
        "name": {
          "type": "string",
          "required": true
        }
      },

      "indexes": [
        {
          "fields": ["email"],
          "unique": true
        }
      ]
    }
  ]
}
```

### 4. Create a Form

```json
{
  "$schema": "https://metabuilder.dev/schemas/forms.schema.json",
  "schemaVersion": "1.0.0",
  "package": "my-package",

  "forms": [
    {
      "id": "login_form",
      "name": "Login Form",

      "fields": [
        {
          "name": "email",
          "type": "email",
          "label": "Email Address",
          "required": true,
          "validation": {
            "email": true
          }
        },
        {
          "name": "password",
          "type": "password",
          "label": "Password",
          "required": true,
          "validation": {
            "minLength": 8,
            "pattern": "password"
          }
        }
      ],

      "onSubmit": "handleLogin"
    }
  ]
}
```

---

## Using the Standard Library

The standard library provides 50+ built-in functions:

```json
{
  "functions": [
    {
      "name": "processItems",
      "params": [{"name": "items", "type": "array"}],
      "body": [
        {
          "type": "const_declaration",
          "name": "filtered",
          "value": {
            "type": "call_expression",
            "callee": "array.filter",
            "args": [
              {"type": "identifier", "name": "items"},
              {"type": "arrow_function", "params": ["item"], "body": {...}}
            ]
          }
        },
        {
          "type": "const_declaration",
          "name": "total",
          "value": {
            "type": "call_expression",
            "callee": "math.sum",
            "args": [{"type": "identifier", "name": "filtered"}]
          }
        },
        {
          "type": "return",
          "value": {"type": "identifier", "name": "total"}
        }
      ]
    }
  ]
}
```

**Available modules**:
- `string.*` - String manipulation (trim, split, join, replace)
- `array.*` - Array operations (map, filter, reduce, find)
- `object.*` - Object utilities (keys, values, entries, merge)
- `math.*` - Mathematical functions (sum, average, max, min)
- `date.*` - Date/time handling (now, formatDate, addDays)
- `validation.*` - Validators (isEmail, isURL, isUUID)
- `http.*` - HTTP requests (fetch, get, post)
- `db.*` - Database operations (query, create, update, delete)

---

## Visual Programming

### Add Visual Metadata to Functions

```json
{
  "functions": [
    {
      "id": "calculate_total",
      "name": "calculateTotal",

      "visual": {
        "category": "business-logic",
        "icon": "💰",
        "color": "#27ae60",
        "position": {"x": 100, "y": 200},

        "inputPorts": [
          {"name": "items", "type": "array", "color": "#3498db"},
          {"name": "taxRate", "type": "number", "color": "#e74c3c"}
        ],
        "outputPorts": [
          {"name": "total", "type": "number", "color": "#e74c3c"}
        ],

        "complexity": "O(n)",
        "performance": "fast",
        "sideEffects": false
      }
    }
  ]
}
```

### Track Data Flow

```json
{
  "dataFlow": {
    "connections": [
      {
        "from": {"function": "fetchItems", "port": "items"},
        "to": {"function": "calculateTotal", "port": "items"},
        "type": "array"
      }
    ],
    "entryPoint": "fetchItems"
  }
}
```

---

## Validation

### Run Schema Validation

```bash
# Validate single file
./schema_validator.sh api/routes.json

# Validate all files
find . -name "*.json" -exec ./schema_validator.sh {} \;
```

### Cross-Schema Validation

The index schema provides 12 automatic validation rules:

1. **function-handler-exists** - API handlers must exist
2. **component-handler-exists** - Component handlers must exist
3. **type-reference-exists** - Type references must be valid
4. **entity-reference-exists** - Entity references must exist
5. **permission-reference-exists** - Permissions must be defined
6. **circular-dependencies** - Detect circular package deps
7. **event-handler-exists** - Event handlers must exist
8. **job-handler-exists** - Job handlers must exist
9. **form-validator-exists** - Form validators must exist
10. **migration-entity-matches** - Migrations must match entities
11. **max-function-complexity** - Warn on complex functions
12. **secure-password-validation** - Enforce password security

---

## Security Best Practices

### ✅ DO

```json
{
  "params": [
    {
      "name": "userInput",
      "type": "string",
      "sanitize": true,
      "sanitizeOptions": {
        "stripScripts": true,
        "sqlInjectionProtection": true
      }
    }
  ]
}
```

### ❌ DON'T

```json
{
  "params": [
    {
      "name": "userInput",
      "type": "string",
      "sanitize": false  // DANGEROUS!
    }
  ]
}
```

### Password Validation

```json
{
  "fields": [
    {
      "name": "password",
      "type": "password",
      "validation": {
        "minLength": 8,
        "pattern": "password"  // Uses built-in strong password regex
      }
    }
  ]
}
```

---

## Troubleshooting

### "Handler not found" Error

**Problem**: `Handler 'myFunction' not found in scripts`

**Solution**: Ensure the function exists in your scripts schema:

```json
{
  "functions": [
    {
      "id": "my_function",
      "name": "myFunction",  // This name must match!
      "exported": true,       // Must be exported
      "body": [...]
    }
  ]
}
```

### "Type reference invalid" Error

**Problem**: `Type 'MyType' not found in types schema`

**Solution**: Define the type:

```json
{
  "types": [
    {
      "id": "my_type",
      "name": "MyType",  // This name must match!
      "kind": "object",
      "exported": true,
      "properties": {...}
    }
  ]
}
```

### Schema Validation Fails

**Problem**: JSON doesn't match schema

**Solution**: Check these common issues:
1. Missing required fields
2. Wrong data types
3. Invalid enum values
4. Pattern mismatches (especially IDs)

```bash
# Get detailed error output
./schema_validator.sh --verbose my-file.json
```

---

## Performance Tips

### 1. Mark Pure Functions

```json
{
  "functions": [
    {
      "name": "calculate",
      "pure": true,  // Enables memoization
      "body": [...]
    }
  ]
}
```

### 2. Use Parallel Execution

```json
{
  "optimization": {
    "parallel": [
      ["fetchProducts", "fetchCategories", "fetchReviews"]
    ]
  }
}
```

### 3. Lazy Load Heavy Operations

```json
{
  "optimization": {
    "lazy": ["generateReport", "exportData"]
  }
}
```

---

## Migration from v1.0.0

### Breaking Changes

1. **Validation Schema**: `sanitize` now defaults to `true`
2. **Entities Schema**: Removed `field.primary` (use `entity.primaryKey`)

### Migration Script

```bash
# Run migration
node scripts/migrate-v1-to-v2.js

# Or manually:
# 1. Update schemaVersion to "2.0.0"
# 2. Move primary key definitions to entity level
# 3. Review sanitization settings
```

---

## Next Steps

1. **Read the Full Documentation**: [IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md)
2. **Explore Standard Library**: [stdlib_schema.json](./stdlib_schema.json)
3. **Set Up Visual Designer**: See GUI implementation guide
4. **Join Community**: Discord, GitHub Discussions

---

## Getting Help

- 📖 **Docs**: https://metabuilder.dev/schemas
- 💬 **Discord**: (link TBD)
- 🐛 **Issues**: https://github.com/metabuilder/schemas/issues
- 📧 **Email**: support@metabuilder.dev

---

**Happy Building! 🚀**

*Generated with Claude Code | Last Updated: 2026-01-01 | Version 2.0.0*
