# MetaBuilder Schema Improvements Summary

## Overview
This document summarizes the improvements made to the MetaBuilder package schemas, with a focus on security, JSON scripting language enhancements for visual programming, and production readiness.

**Version**: 2.0.0
**Date**: 2026-01-01
**Status**: Implementation Ready

---

## 1. Critical Security Fixes ✅ COMPLETED

### 1.1 Input Sanitization Defaults
**File**: `validation_schema.json`

**Changes**:
- Changed `sanitize` default from `false` → `true` (line 226)
- Added comprehensive `sanitizeOptions` configuration (lines 228-263)
- Added new validation patterns: `slug`, `password`, `hexColor`

**Security Features**:
```json
{
  "sanitize": true,  // NOW SECURE BY DEFAULT
  "sanitizeOptions": {
    "allowHtml": false,
    "allowedTags": ["b", "i", "em", "strong", "a"],
    "allowedAttributes": { "a": ["href", "title"] },
    "stripScripts": true,
    "sqlInjectionProtection": true
  }
}
```

**Impact**:
- Prevents XSS attacks by default
- Protects against SQL injection
- Maintains flexibility for trusted HTML content

### 1.2 Removed Deprecated Fields ✅ COMPLETED
**File**: `entities_schema.json`

**Changes**:
- Removed `field.primary` (previously at line 145-148)
- Use `entity.primaryKey` instead for single or composite keys

**Migration Path**:
```json
// OLD (deprecated)
{
  "fields": {
    "id": { "type": "uuid", "primary": true }
  }
}

// NEW (correct)
{
  "primaryKey": "id",  // or ["userId", "roleId"] for composite
  "fields": {
    "id": { "type": "uuid" }
  }
}
```

---

## 2. JSON Scripting Language Enhancements

### 2.1 Visual Programming Features (Recommended Implementation)

The JSON scripting language is designed to be **visual-first** while maintaining full programming capability. Here's how to enhance it:

#### A. Standard Library System

**Create**: `stdlib_schema.json` (NEW FILE NEEDED)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://metabuilder.dev/schemas/stdlib.schema.json",
  "title": "MetaBuilder Standard Library",
  "description": "Built-in functions and utilities for JSON scripts",

  "modules": {
    "string": {
      "functions": [
        {
          "name": "trim",
          "category": "string",
          "icon": "✂️",
          "color": "#3498db",
          "description": "Remove whitespace from both ends",
          "params": [{"name": "str", "type": "string"}],
          "returnType": "string",
          "pure": true,
          "complexity": "O(n)"
        },
        {
          "name": "split",
          "category": "string",
          "icon": "✂️",
          "description": "Split string into array",
          "params": [
            {"name": "str", "type": "string"},
            {"name": "separator", "type": "string", "default": ","}
          ],
          "returnType": "array",
          "pure": true
        },
        {
          "name": "join",
          "category": "array",
          "icon": "🔗",
          "description": "Join array elements into string",
          "params": [
            {"name": "arr", "type": "array"},
            {"name": "separator", "type": "string", "default": ","}
          ],
          "returnType": "string",
          "pure": true
        }
      ]
    },

    "array": {
      "functions": [
        {
          "name": "map",
          "category": "array",
          "icon": "🔄",
          "color": "#2ecc71",
          "description": "Transform each element",
          "params": [
            {"name": "array", "type": "array"},
            {"name": "fn", "type": "function"}
          ],
          "returnType": "array",
          "pure": true,
          "higherOrder": true
        },
        {
          "name": "filter",
          "category": "array",
          "icon": "🔍",
          "description": "Keep elements matching condition",
          "params": [
            {"name": "array", "type": "array"},
            {"name": "predicate", "type": "function"}
          ],
          "returnType": "array",
          "pure": true,
          "higherOrder": true
        },
        {
          "name": "reduce",
          "category": "array",
          "icon": "📊",
          "description": "Reduce array to single value",
          "params": [
            {"name": "array", "type": "array"},
            {"name": "reducer", "type": "function"},
            {"name": "initialValue", "type": "any"}
          ],
          "returnType": "any",
          "pure": true,
          "higherOrder": true
        },
        {
          "name": "find",
          "category": "array",
          "icon": "🎯",
          "description": "Find first matching element",
          "params": [
            {"name": "array", "type": "array"},
            {"name": "predicate", "type": "function"}
          ],
          "returnType": "any",
          "pure": true
        }
      ]
    },

    "math": {
      "functions": [
        {
          "name": "sum",
          "category": "math",
          "icon": "➕",
          "color": "#e74c3c",
          "description": "Sum array of numbers",
          "params": [{"name": "numbers", "type": "array"}],
          "returnType": "number",
          "pure": true
        },
        {
          "name": "average",
          "category": "math",
          "icon": "📈",
          "description": "Calculate average",
          "params": [{"name": "numbers", "type": "array"}],
          "returnType": "number",
          "pure": true
        },
        {
          "name": "max",
          "category": "math",
          "icon": "⬆️",
          "description": "Find maximum value",
          "params": [{"name": "numbers", "type": "array"}],
          "returnType": "number",
          "pure": true
        },
        {
          "name": "min",
          "category": "math",
          "icon": "⬇️",
          "description": "Find minimum value",
          "params": [{"name": "numbers", "type": "array"}],
          "returnType": "number",
          "pure": true
        }
      ]
    },

    "object": {
      "functions": [
        {
          "name": "keys",
          "category": "object",
          "icon": "🔑",
          "color": "#f39c12",
          "description": "Get object keys",
          "params": [{"name": "obj", "type": "object"}],
          "returnType": "array",
          "pure": true
        },
        {
          "name": "values",
          "category": "object",
          "icon": "💎",
          "description": "Get object values",
          "params": [{"name": "obj", "type": "object"}],
          "returnType": "array",
          "pure": true
        },
        {
          "name": "entries",
          "category": "object",
          "icon": "📋",
          "description": "Get [key, value] pairs",
          "params": [{"name": "obj", "type": "object"}],
          "returnType": "array",
          "pure": true
        },
        {
          "name": "merge",
          "category": "object",
          "icon": "🔀",
          "description": "Merge multiple objects",
          "params": [{"name": "objects", "type": "array", "rest": true}],
          "returnType": "object",
          "pure": true
        }
      ]
    },

    "validation": {
      "functions": [
        {
          "name": "isEmail",
          "category": "validation",
          "icon": "📧",
          "color": "#9b59b6",
          "description": "Check if valid email",
          "params": [{"name": "value", "type": "string"}],
          "returnType": "boolean",
          "pure": true
        },
        {
          "name": "isURL",
          "category": "validation",
          "icon": "🔗",
          "description": "Check if valid URL",
          "params": [{"name": "value", "type": "string"}],
          "returnType": "boolean",
          "pure": true
        },
        {
          "name": "isUUID",
          "category": "validation",
          "icon": "🆔",
          "description": "Check if valid UUID",
          "params": [{"name": "value", "type": "string"}],
          "returnType": "boolean",
          "pure": true
        }
      ]
    },

    "date": {
      "functions": [
        {
          "name": "now",
          "category": "date",
          "icon": "🕐",
          "color": "#1abc9c",
          "description": "Current timestamp",
          "params": [],
          "returnType": "number",
          "pure": false
        },
        {
          "name": "formatDate",
          "category": "date",
          "icon": "📅",
          "description": "Format date to string",
          "params": [
            {"name": "timestamp", "type": "number"},
            {"name": "format", "type": "string", "default": "YYYY-MM-DD"}
          ],
          "returnType": "string",
          "pure": true
        },
        {
          "name": "parseDate",
          "category": "date",
          "icon": "📆",
          "description": "Parse date string",
          "params": [{"name": "dateStr", "type": "string"}],
          "returnType": "number",
          "pure": true
        },
        {
          "name": "addDays",
          "category": "date",
          "icon": "➕",
          "description": "Add days to date",
          "params": [
            {"name": "timestamp", "type": "number"},
            {"name": "days", "type": "number"}
          ],
          "returnType": "number",
          "pure": true
        }
      ]
    },

    "http": {
      "functions": [
        {
          "name": "fetch",
          "category": "http",
          "icon": "🌐",
          "color": "#34495e",
          "description": "HTTP request",
          "async": true,
          "params": [
            {"name": "url", "type": "string"},
            {"name": "options", "type": "object", "optional": true}
          ],
          "returnType": "Promise<object>",
          "pure": false,
          "sideEffects": ["network"]
        },
        {
          "name": "get",
          "category": "http",
          "icon": "⬇️",
          "description": "HTTP GET request",
          "async": true,
          "params": [{"name": "url", "type": "string"}],
          "returnType": "Promise<object>",
          "pure": false
        },
        {
          "name": "post",
          "category": "http",
          "icon": "⬆️",
          "description": "HTTP POST request",
          "async": true,
          "params": [
            {"name": "url", "type": "string"},
            {"name": "data", "type": "object"}
          ],
          "returnType": "Promise<object>",
          "pure": false
        }
      ]
    },

    "db": {
      "functions": [
        {
          "name": "query",
          "category": "database",
          "icon": "💾",
          "color": "#16a085",
          "description": "Execute database query",
          "async": true,
          "params": [
            {"name": "entity", "type": "string"},
            {"name": "filter", "type": "object", "optional": true}
          ],
          "returnType": "Promise<array>",
          "pure": false,
          "permissions": ["db:read"]
        },
        {
          "name": "create",
          "category": "database",
          "icon": "➕",
          "description": "Create new record",
          "async": true,
          "params": [
            {"name": "entity", "type": "string"},
            {"name": "data", "type": "object"}
          ],
          "returnType": "Promise<object>",
          "pure": false,
          "permissions": ["db:write"]
        },
        {
          "name": "update",
          "category": "database",
          "icon": "✏️",
          "description": "Update existing record",
          "async": true,
          "params": [
            {"name": "entity", "type": "string"},
            {"name": "id", "type": "string"},
            {"name": "data", "type": "object"}
          ],
          "returnType": "Promise<object>",
          "pure": false,
          "permissions": ["db:write"]
        },
        {
          "name": "delete",
          "category": "database",
          "icon": "🗑️",
          "description": "Delete record",
          "async": true,
          "params": [
            {"name": "entity", "type": "string"},
            {"name": "id", "type": "string"}
          ],
          "returnType": "Promise<boolean>",
          "pure": false,
          "permissions": ["db:delete"]
        }
      ]
    }
  }
}
```

#### B. Visual Node Metadata

Add these properties to `script_schema.json` function definitions:

```json
{
  "functions": [
    {
      "id": "calculate_total",
      "name": "calculateTotal",

      // VISUAL PROGRAMMING METADATA
      "visual": {
        "category": "business-logic",
        "icon": "💰",
        "color": "#27ae60",
        "position": {"x": 100, "y": 200},
        "collapsed": false,
        "description": "Calculate order total with tax",

        // For GUI designer
        "inputPorts": [
          {"name": "items", "type": "array", "color": "#3498db"},
          {"name": "taxRate", "type": "number", "color": "#e74c3c"}
        ],
        "outputPorts": [
          {"name": "total", "type": "number", "color": "#e74c3c"}
        ],

        // Visual hints
        "complexity": "O(n)",
        "performance": "fast",
        "sideEffects": false
      },

      // Existing fields
      "params": [...],
      "body": [...]
    }
  ]
}
```

#### C. Data Flow Connections

Add connection tracking for visual programming:

```json
{
  "functions": [...],

  // NEW: Visual flow connections
  "dataFlow": {
    "connections": [
      {
        "from": {"function": "fetchItems", "port": "items"},
        "to": {"function": "calculateTotal", "port": "items"},
        "type": "array"
      },
      {
        "from": {"function": "getTaxRate", "port": "rate"},
        "to": {"function": "calculateTotal", "port": "taxRate"},
        "type": "number"
      },
      {
        "from": {"function": "calculateTotal", "port": "total"},
        "to": {"function": "displayTotal", "port": "value"},
        "type": "number"
      }
    ],

    "entryPoint": "fetchItems",
    "exitPoints": ["displayTotal"]
  }
}
```

#### D. Expression Builder Support

Enhance expressions with visual hints:

```json
{
  "type": "binary_expression",
  "left": {"type": "identifier", "name": "price"},
  "operator": "*",
  "right": {"type": "identifier", "name": "quantity"},

  // VISUAL METADATA
  "visual": {
    "displayAs": "block",  // or "inline"
    "template": "${left} ${operator} ${right}",
    "color": "#e74c3c"
  }
}
```

### 2.2 Enhanced Type Safety

**Recommendation**: Add runtime type checking:

```json
{
  "functions": [
    {
      "name": "calculateDiscount",
      "params": [
        {
          "name": "price",
          "type": "number",
          "validation": {
            "min": 0,
            "errorMessage": "Price must be positive"
          }
        },
        {
          "name": "discountPercent",
          "type": "number",
          "validation": {
            "min": 0,
            "max": 100,
            "errorMessage": "Discount must be between 0-100%"
          }
        }
      ],
      "returnType": "number",
      "assertions": [
        {
          "type": "ensure",
          "condition": {
            "type": "binary_expression",
            "left": {"type": "identifier", "name": "$return"},
            "operator": ">=",
            "right": {"type": "literal", "value": 0}
          },
          "message": "Discounted price cannot be negative"
        }
      ]
    }
  ]
}
```

### 2.3 Error Handling Patterns

Add structured error handling:

```json
{
  "errorHandling": {
    "strategy": "graceful",  // or "strict", "silent"
    "handlers": {
      "ValidationError": "handleValidationError",
      "NetworkError": "handleNetworkError",
      "DatabaseError": "handleDatabaseError"
    },
    "fallback": "handleGenericError"
  }
}
```

---

## 3. Additional Recommended Improvements

### 3.1 Performance Optimizations

**Add to `script_schema.json`**:

```json
{
  "optimization": {
    "memoize": ["expensiveCalculation", "fetchUserData"],
    "parallel": [
      ["fetchProducts", "fetchCategories", "fetchReviews"]
    ],
    "lazy": ["generateReport", "exportData"],
    "budget": {
      "maxExecutionTime": 5000,
      "maxMemory": "10MB",
      "maxStackDepth": 100
    }
  }
}
```

### 3.2 Testing Support

**Add to `script_schema.json`**:

```json
{
  "tests": [
    {
      "name": "should calculate total correctly",
      "function": "calculateTotal",
      "cases": [
        {
          "input": {
            "items": [
              {"price": 10, "quantity": 2},
              {"price": 5, "quantity": 1}
            ],
            "taxRate": 0.1
          },
          "expected": 27.5,
          "description": "2x$10 + 1x$5 + 10% tax"
        },
        {
          "input": {
            "items": [],
            "taxRate": 0.1
          },
          "expected": 0,
          "description": "Empty cart"
        }
      ]
    }
  ]
}
```

### 3.3 Documentation Generation

Functions automatically generate documentation:

```json
{
  "docstring": {
    "summary": "Calculate order total with tax",
    "description": "Sums item prices and applies tax rate",
    "params": [
      {
        "name": "items",
        "type": "array",
        "description": "Array of {price, quantity} objects"
      },
      {
        "name": "taxRate",
        "type": "number",
        "description": "Tax rate as decimal (0.1 = 10%)"
      }
    ],
    "returns": {
      "type": "number",
      "description": "Total amount including tax"
    },
    "examples": [
      {
        "title": "Simple order",
        "code": "calculateTotal([{price: 10, quantity: 2}], 0.1)",
        "result": 22
      }
    ],
    "tags": ["business-logic", "financial"]
  }
}
```

---

## 4. Migration Guide

### 4.1 Validation Schema (v1.0.0 → v2.0.0)

**Breaking Changes**:
- `sanitize` now defaults to `true`
- New `sanitizeOptions` configuration available

**Migration Steps**:

```bash
# 1. Update schema version
sed -i 's/"schemaVersion": "1.0.0"/"schemaVersion": "2.0.0"/' validation.json

# 2. If you need unsanitized input (rare), explicitly set:
{
  "params": [
    {
      "name": "trustedHtml",
      "type": "string",
      "sanitize": false  // Only for trusted sources!
    }
  ]
}

# 3. Test all validation functions
npm run test:validation
```

### 4.2 Entities Schema

**Breaking Changes**:
- `field.primary` removed
- Use `entity.primaryKey` instead

**Migration Script**:

```javascript
// migrate-entities.js
const fs = require('fs');

function migrateEntitySchema(schema) {
  for (const entity of schema.entities) {
    let primaryKey = null;

    // Find field marked as primary
    for (const [name, field] of Object.entries(entity.fields)) {
      if (field.primary) {
        primaryKey = name;
        delete field.primary;  // Remove deprecated field
      }
    }

    // Set entity-level primaryKey
    if (primaryKey && !entity.primaryKey) {
      entity.primaryKey = primaryKey;
    }
  }

  return schema;
}

// Usage
const schema = JSON.parse(fs.readFileSync('entities.json'));
const migrated = migrateEntitySchema(schema);
fs.writeFileSync('entities.json', JSON.stringify(migrated, null, 2));
```

---

## 5. GUI Designer Implementation Guide

### 5.1 Visual Node System

**Components Needed**:

1. **Node Palette** - Drag-and-drop function library
2. **Canvas** - Visual programming workspace
3. **Properties Panel** - Configure selected nodes
4. **Connection System** - Visual data flow
5. **Code View** - Synced JSON representation

**Technology Stack Recommendation**:
- Canvas: React Flow or Rete.js
- State: JSON schema + visual metadata
- Code Gen: Bidirectional JSON ↔ Visual sync

### 5.2 Example Node Rendering

```typescript
interface VisualNode {
  id: string;
  type: 'function' | 'constant' | 'variable';
  data: {
    name: string;
    icon: string;
    color: string;
    inputs: Port[];
    outputs: Port[];
    config: any;
  };
  position: { x: number; y: number };
}

interface Port {
  id: string;
  name: string;
  type: string;  // number, string, array, object
  color: string;
  connected: boolean;
}

// Render as
<Node>
  <NodeHeader icon={icon} color={color}>{name}</NodeHeader>
  <NodeInputs>
    {inputs.map(port => <InputPort {...port} />)}
  </NodeInputs>
  <NodeOutputs>
    {outputs.map(port => <OutputPort {...port} />)}
  </NodeOutputs>
</Node>
```

### 5.3 Code Generation

```typescript
function generateJSONFromVisual(nodes, connections) {
  const functions = nodes
    .filter(n => n.type === 'function')
    .map(node => ({
      id: node.id,
      name: node.data.name,
      params: node.data.inputs.map(p => ({
        name: p.name,
        type: p.type
      })),
      body: generateBody(node, connections),
      visual: {
        position: node.position,
        icon: node.data.icon,
        color: node.data.color
      }
    }));

  return {
    schemaVersion: "2.2.0",
    package: "visual-script",
    functions
  };
}
```

---

## 6. Testing & Validation

### 6.1 Schema Validation

```bash
# Validate all schemas
./schema_validator.sh api_schema.json
./schema_validator.sh entities_schema.json
./schema_validator.sh script_schema.json
./schema_validator.sh validation_schema.json
```

### 6.2 Security Testing

```javascript
// test/security.test.js
describe('Input Sanitization', () => {
  it('should sanitize XSS by default', () => {
    const input = '<script>alert("xss")</script>';
    const result = sanitize(input);
    expect(result).not.toContain('<script>');
  });

  it('should allow whitelisted HTML', () => {
    const input = '<strong>Bold</strong> text';
    const result = sanitize(input, { allowHtml: true });
    expect(result).toBe('<strong>Bold</strong> text');
  });

  it('should prevent SQL injection', () => {
    const input = "'; DROP TABLE users; --";
    const result = sanitize(input);
    expect(result).not.toContain('DROP');
  });
});
```

---

## 7. Performance Considerations

### 7.1 Schema Compilation

**Recommendation**: Pre-compile schemas for runtime performance

```typescript
// Compile schemas at build time
import Ajv from 'ajv';

const ajv = new Ajv({
  allErrors: true,
  coerceTypes: true,
  useDefaults: true
});

// Compile all schemas
const validators = {
  script: ajv.compile(scriptSchema),
  validation: ajv.compile(validationSchema),
  entities: ajv.compile(entitiesSchema)
};

// Use compiled validators (10-100x faster)
const valid = validators.script(myScriptData);
```

### 7.2 Visual Editor Optimization

- Virtualize large node graphs
- Debounce auto-save (500ms)
- Lazy load function library
- Use Web Workers for code generation

---

## 8. Next Steps

### Immediate (Week 1)
- [ ] Implement security fixes in validation runtime
- [ ] Create migration scripts for deprecated fields
- [ ] Add standard library schema
- [ ] Update documentation

### Short-term (Month 1)
- [ ] Build visual node metadata into existing functions
- [ ] Create proof-of-concept visual editor
- [ ] Add comprehensive testing suite
- [ ] Performance benchmarks

### Long-term (Quarter 1)
- [ ] Full visual programming IDE
- [ ] Template marketplace
- [ ] Live collaboration features
- [ ] AI-powered code suggestions

---

## 9. Community & Support

### Documentation
- Schema Reference: https://metabuilder.dev/schemas
- Visual Programming Guide: (TBD)
- Migration Guides: (TBD)

### Getting Help
- GitHub Issues: https://github.com/metabuilder/schemas/issues
- Discord: (TBD)
- Stack Overflow: `metabuilder` tag

### Contributing
- Submit schema improvements as PRs
- Share visual programming templates
- Report security issues privately

---

**Generated with**: Claude Code
**Last Updated**: 2026-01-01
**Schema Version**: 2.0.0
