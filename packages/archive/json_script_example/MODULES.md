# JSON Script Modules & Import/Export System

## Overview

JSON scripts support modular organization through:
1. **Multiple script files** - Split code into logical modules
2. **Import/Export** - Share functions and constants between modules
3. **Metadata configuration** - Define which scripts belong to a package

## Package Structure

```
json_script_example/
├── seed/
│   ├── metadata.json          # Package configuration
│   ├── script.json            # Main script (examples)
│   ├── math_utils.json        # Math utility module
│   ├── validation.json        # Validation module
│   └── combined_example.json  # Uses imports from other modules
```

## 1. Configuring Multiple Scripts

In `metadata.json`:

```json
{
  "runtime": {
    "scripts": [
      "seed/script.json",           // Main script
      "seed/math_utils.json",       // Math utilities
      "seed/validation.json"        // Validation utilities
    ],
    "main": "seed/script.json",
    "executor": {
      "lua": "../shared/seed/scripts/runtime/script_executor.lua",
      "javascript": "../shared/seed/scripts/runtime/script_executor.cjs"
    }
  }
}
```

- **`scripts`** - Array of all script files in the package
- **`main`** - Entry point script (default for execution)
- **`executor`** - Runtime executors for different platforms

## 2. Exporting from a Module

### `math_utils.json` - Exporting Functions and Constants

```json
{
  "schema_version": "2.1.0",
  "package": "json_script_example",

  "exports": {
    "functions": ["add", "multiply", "clamp"],
    "constants": ["PI", "E"]
  },

  "constants": [
    {
      "id": "pi_const",
      "name": "PI",
      "value": 3.14159265359,
      "exported": true
    }
  ],

  "functions": [
    {
      "id": "add_fn",
      "name": "add",
      "exported": true,
      "params": [
        {"name": "a", "type": "number"},
        {"name": "b", "type": "number"}
      ],
      "body": [
        {
          "type": "return",
          "value": {
            "type": "binary_expression",
            "left": "$ref:params.a",
            "operator": "+",
            "right": "$ref:params.b"
          }
        }
      ]
    }
  ]
}
```

**Key Points**:
- ✅ Set `"exported": true` on functions/constants you want to share
- ✅ List exported items in `exports` object
- ✅ Use clear, descriptive names (will be imported by name)

## 3. Importing into Another Module

### `combined_example.json` - Using Imports

```json
{
  "schema_version": "2.1.0",
  "package": "json_script_example",

  "imports": [
    {
      "from": "math_utils",
      "import": ["add", "multiply", "clamp", "PI"]
    },
    {
      "from": "validation",
      "import": ["validateRange", "isNotEmpty"]
    }
  ],

  "functions": [
    {
      "name": "calculateArea",
      "params": [
        {"name": "width", "type": "number"},
        {"name": "height", "type": "number"}
      ],
      "body": [
        {
          "type": "const_declaration",
          "name": "area",
          "value": {
            "type": "call_expression",
            "callee": "$ref:imports.math_utils.multiply",
            "args": ["$ref:params.width", "$ref:params.height"]
          }
        },
        {
          "type": "return",
          "value": {
            "type": "call_expression",
            "callee": "$ref:imports.math_utils.clamp",
            "args": ["$ref:local.area", 0, 1000]
          }
        }
      ]
    }
  ]
}
```

**Import Syntax**:
- `from` - Name of the module (file name without `.json`)
- `import` - Array of function/constant names to import

**Usage**:
- Access via `$ref:imports.module_name.function_name`
- Example: `$ref:imports.math_utils.multiply`

## 4. Import/Export Patterns

### Pattern 1: Utility Module

**math_utils.json** - Pure utility functions
```json
{
  "exports": {
    "functions": ["add", "subtract", "multiply", "divide"]
  }
}
```

**Usage in other modules**:
```json
{
  "imports": [{"from": "math_utils", "import": ["add", "multiply"]}],
  "functions": [{
    "body": [
      {
        "type": "call_expression",
        "callee": "$ref:imports.math_utils.add",
        "args": [5, 3]
      }
    ]
  }]
}
```

### Pattern 2: Constants Module

**constants.json** - Shared configuration
```json
{
  "exports": {
    "constants": ["API_URL", "MAX_RETRIES", "TIMEOUT"]
  },
  "constants": [
    {"name": "API_URL", "value": "https://api.example.com", "exported": true},
    {"name": "MAX_RETRIES", "value": 3, "exported": true},
    {"name": "TIMEOUT", "value": 5000, "exported": true}
  ]
}
```

**Usage**:
```json
{
  "imports": [{"from": "constants", "import": ["API_URL", "TIMEOUT"]}],
  "functions": [{
    "body": [
      {
        "type": "const_declaration",
        "name": "url",
        "value": "$ref:imports.constants.API_URL"
      }
    ]
  }]
}
```

### Pattern 3: Feature Module

**user_auth.json** - Related functionality grouped together
```json
{
  "exports": {
    "functions": ["login", "logout", "checkAuth", "refreshToken"]
  }
}
```

### Pattern 4: Type Definitions

**types.json** - Shared type constants and validators
```json
{
  "exports": {
    "constants": ["USER_ROLES", "PERMISSION_LEVELS"],
    "functions": ["isValidRole", "hasPermission"]
  }
}
```

## 5. Module Resolution

### Intra-Package Imports

Import from modules in the same package:

```json
{
  "imports": [
    {"from": "math_utils", "import": ["add"]}
  ]
}
```

Resolves to: `<package>/seed/math_utils.json`

### Cross-Package Imports (Future)

Import from other packages:

```json
{
  "imports": [
    {
      "from": "@shared/permissions",
      "import": ["check_access"]
    }
  ]
}
```

Resolves to: `packages/shared/seed/permissions.json`

## 6. Execution Context

When a function is called from an imported module, the runtime:

1. Loads all script files defined in `metadata.json`
2. Builds import map based on `imports` declarations
3. Resolves `$ref:imports.module.function` references
4. Executes the function in the imported module's context

```javascript
const { executeFunction } = require('./script_executor.cjs');

// Load all modules
const modules = {
  main: JSON.parse(fs.readFileSync('seed/script.json')),
  math_utils: JSON.parse(fs.readFileSync('seed/math_utils.json')),
  validation: JSON.parse(fs.readFileSync('seed/validation.json'))
};

// Execute function from main, which imports from other modules
const result = executeFunction(modules.main, 'myFunction', [args]);
```

## 7. Best Practices

### ✅ DO

- **Group related functions** - Keep related functionality in the same module
- **Use clear names** - Module and function names should be descriptive
- **Export intentionally** - Only export what others need to use
- **Document exports** - Add descriptions to exported functions
- **Keep modules focused** - Each module should have a single responsibility

### ❌ DON'T

- **Circular imports** - Avoid Module A importing Module B which imports Module A
- **Too many imports** - If you need to import 10+ items, consider refactoring
- **Deep nesting** - Keep module hierarchy flat (2-3 levels max)
- **Implicit dependencies** - Always declare imports explicitly

## 8. Example: Form Validation System

### Structure

```
packages/form_builder/seed/
├── validation/
│   ├── rules.json           # Validation rule functions
│   ├── formatters.json      # Input formatters
│   └── messages.json        # Error message constants
├── forms/
│   ├── contact_form.json    # Contact form logic
│   └── user_form.json       # User registration form logic
└── metadata.json            # Lists all modules
```

### metadata.json

```json
{
  "runtime": {
    "scripts": [
      "seed/validation/rules.json",
      "seed/validation/formatters.json",
      "seed/validation/messages.json",
      "seed/forms/contact_form.json",
      "seed/forms/user_form.json"
    ],
    "main": "seed/forms/contact_form.json"
  }
}
```

### validation/rules.json

```json
{
  "exports": {
    "functions": ["isEmail", "isNotEmpty", "minLength", "maxLength"]
  }
}
```

### forms/contact_form.json

```json
{
  "imports": [
    {"from": "validation/rules", "import": ["isEmail", "isNotEmpty"]},
    {"from": "validation/messages", "import": ["ERROR_MESSAGES"]}
  ],

  "functions": [{
    "name": "validateContactForm",
    "body": [
      {
        "type": "call_expression",
        "callee": "$ref:imports.validation/rules.isEmail",
        "args": ["$ref:params.email"]
      }
    ]
  }]
}
```

## 9. Runtime Support

### Current Status

- ✅ Multiple script files in metadata
- ⏳ Import/export resolution (needs runtime implementation)
- ⏳ Cross-package imports
- ⏳ Circular dependency detection

### Roadmap

1. **Phase 1**: Basic import/export within package
2. **Phase 2**: Cross-package imports with `@package/module` syntax
3. **Phase 3**: Tree shaking (only load what's used)
4. **Phase 4**: Hot module reload (reload changed modules only)

## 10. Testing Modular Scripts

Test modules independently:

```bash
# Test math_utils module
node test_cli.cjs math_utils.json math_utils.test.json

# Test combined_example (with imports)
node test_cli.cjs combined_example.json combined.test.json
```

## See Also

- [JSON Script Runtime README](../../shared/seed/scripts/runtime/README.md)
- [Testing Guide](tests/README.md)
- [Package README](README.md)
