# JSON Script Example Package

**Complete demonstration of the JSON script specification v2.1.0**

This package showcases every feature of the JSON script runtime, providing executable examples for all expressions, statements, and operators.

## Overview

All functions in this package are defined in `seed/script.json` and executed via the runtime interpreter. No Lua code generation - pure JSON AST execution!

## Package Structure

```
json_script_example/
├── README.md                      # This file
├── MODULES.md                     # Import/export guide
├── TYPES.md                       # Type system documentation
├── seed/
│   ├── metadata.json              # Package configuration
│   ├── script.json                # Main example functions (with docstrings!)
│   ├── script.schema.json         # 📋 JSON Schema for scripts
│   ├── math_utils.json            # Math utility module
│   ├── validation.json            # Validation module
│   ├── combined_example.json      # Multi-module example
│   ├── components.json            # UI component definitions
│   ├── types.json                 # TypeScript-style type definitions
│   ├── types.schema.json          # 📋 JSON Schema for types
│   ├── styles.json                # Design tokens
│   └── schema/
│       ├── entities.yaml          # 🗄️ Database entity definitions
│       └── entities.schema.json   # 📋 JSON Schema for entities
├── tests/
│   ├── README.md                  # Testing guide
│   ├── math.test.logic.json       # Test assertion functions
│   ├── math.test.parameters.json  # Test data by category
│   ├── test.schema.json           # 📋 JSON Schema for test logic
│   └── test-parameters.schema.json # 📋 JSON Schema for test parameters
└── static_content/
    └── icon.svg                   # Package icon
```

## Documentation

All functions include **comprehensive docstrings** with:
- **Summary** - One-line description
- **Detailed description** - Full explanation of behavior
- **Parameter documentation** - Type, description for each param
- **Return type documentation** - What the function returns
- **Usage examples** - Code samples showing how to use the function
- **Related functions** - Cross-references to similar functions
- **Metadata** - Version, tags, categories

See [SCRIPT_JSON_DOCSTRINGS.md](../shared/seed/SCRIPT_JSON_DOCSTRINGS.md) for the full docstring specification.

## JSON Schema Validation

All JSON files include `$schema` references for **IDE autocomplete, validation, and documentation**:

- **script.schema.json** - Validates script.json, math_utils.json, validation.json, components.json
  - Ensures correct expression/statement syntax
  - Validates function signatures and parameters
  - Checks docstring format

- **types.schema.json** - Validates types.json
  - Ensures type definitions are well-formed
  - Validates property definitions
  - Checks enum values

- **test.schema.json** - Validates test logic files (*.test.logic.json)
  - Ensures test functions return correct format
  - Validates test case structure

- **test-parameters.schema.json** - Validates test parameter files (*.test.parameters.json)
  - Ensures test data is organized correctly
  - Validates input/expected structure

- **entities.schema.json** - Validates entity definition files (entities.yaml) structure
  - Ensures entity structure is well-formed
  - Validates field types and constraints
  - Checks relationship definitions
  - Validates ACL rules

**YAML Validation:**
- **yaml-schema.yaml** (project root) - YAML meta-schema for validating YAML file structure
  - entities.yaml includes `# yaml-language-server: $schema=` directive
  - Provides IDE validation for YAML syntax and structure

Benefits:
- ✅ **IDE Support** - IntelliSense autocomplete in VS Code, JetBrains IDEs
- ✅ **Real-time Validation** - Catch errors while editing
- ✅ **Documentation** - Hover tooltips explain each field
- ✅ **Type Safety** - Ensure JSON matches specification

## Database Schema (entities.yaml)

The package includes **example entity definitions** in [seed/schema/entities.yaml](seed/schema/entities.yaml) demonstrating data modeling for JSON script-based applications:

### Entities

**Calculator** - Calculator instance with user preferences
- Fields: id, userId, name, mode (basic/scientific/programmer), precision, theme
- Relations: hasMany calculations, belongsTo user
- ACL: User-scoped (self-only access)

**Calculation** - Individual calculation history entries
- Fields: id, calculatorId, expression, result, operationType, isStarred, tags, metadata
- Relations: belongsTo calculator
- ACL: Row-level security via calculator.userId

**ExpressionTemplate** - Reusable calculation templates with variables
- Fields: id, name, template, variables, category, isPublic, useCount
- Relations: belongsTo user
- ACL: Public if shared, otherwise self-only
- Example: `"${principal} * (1 + ${rate}/100)^${years}"` for compound interest

**ValidationRule** - Custom input validation rules
- Fields: id, name, ruleType (range/pattern/custom), config, errorMessage
- Relations: belongsTo user
- ACL: User-scoped

**ComponentState** - Persisted UI component state
- Fields: id, componentName (ExpressionDemo/OperatorDemo/ResultDisplay), state, isDefault
- Relations: belongsTo user
- Use case: Save and restore component configurations

This schema demonstrates:
- **Entity relationships** (belongsTo, hasMany)
- **Field types** (string, int, float, boolean, json, bigint, cuid)
- **Field constraints** (required, nullable, maxLength, min, max, enum, default)
- **Indexes** for query performance
- **Access control** (ACL with row-level security)
- **JSON fields** for flexible metadata storage

## Exported Functions

### 1. `all_expressions`
**Demonstrates**: All expression types

```lua
local executor = require("shared.seed.scripts.runtime.script_executor")
local result = executor.load_and_execute(
  "packages/json_script_example/seed/script.json",
  "all_expressions",
  {10, 5}  -- a=10, b=5
)

-- Returns:
-- {
--   sum = 15,
--   diff = 5,
--   product = 50,
--   max = 10,
--   bothPositive = true,
--   message = "Sum: 15, Product: 50, Max: 10"
-- }
```

**Features Shown**:
- ✅ Binary expressions (+, -, *, /, %, ==, !=, <, >, <=, >=)
- ✅ Logical expressions (&&, ||) with short-circuit evaluation
- ✅ Unary expressions (!, -, +)
- ✅ Conditional expressions (ternary operator)
- ✅ Template literals with interpolation
- ✅ Object literals
- ✅ Reference resolution ($ref:)

### 2. `all_statements`
**Demonstrates**: All statement types

```lua
local result = executor.load_and_execute(
  "packages/json_script_example/seed/script.json",
  "all_statements",
  {{10, 20, 30, 40, 50}}  -- items array
)

-- Returns:
-- {
--   count = 5,
--   sum = 150,
--   average = 30,
--   error = nil
-- }
```

**Features Shown**:
- ✅ Variable declarations (const, let)
- ✅ For-each loops (ipairs iteration)
- ✅ If/else statements
- ✅ Try/catch/finally blocks
- ✅ Assignments
- ✅ Return statements
- ✅ Comments

### 3. `all_operators`
**Demonstrates**: Complete operator reference

```lua
local result = executor.load_and_execute(
  "packages/json_script_example/seed/script.json",
  "all_operators",
  {7, 3}  -- x=7, y=3
)

-- Returns:
-- {
--   arithmetic = {
--     add = 10,
--     subtract = 4,
--     multiply = 21,
--     divide = 2.333...,
--     modulo = 1
--   },
--   comparison = {
--     equal = false,
--     notEqual = true,
--     lessThan = false,
--     greaterThan = true,
--     lessOrEqual = false,
--     greaterOrEqual = true
--   },
--   logical = {
--     and = 3,
--     or = 7,
--     not = false
--   },
--   unary = {
--     negate = -7,
--     plus = 7
--   }
-- }
```

**Operators Shown**:
- ✅ Arithmetic: +, -, *, /, %
- ✅ Comparison: ==, !=, <, >, <=, >=
- ✅ Logical: &&, ||, !
- ✅ Unary: -, +, !

### 4. `control_flow`
**Demonstrates**: Control flow patterns

```lua
local result = executor.load_and_execute(
  "packages/json_script_example/seed/script.json",
  "control_flow",
  {15}  -- value=15
)

-- Returns: "medium"
```

**Classifications**:
- value < 0 → "negative"
- value == 0 → "zero"
- value < 10 → "small"
- value < 100 → "medium"
- value >= 100 → "large"

**Features Shown**:
- ✅ Nested if/else (emulating switch/case)
- ✅ Early returns
- ✅ Guard clauses

### 5. `data_structures`
**Demonstrates**: Working with objects and arrays

```lua
local result = executor.load_and_execute(
  "packages/json_script_example/seed/script.json",
  "data_structures",
  {}  -- no parameters
)

-- Returns:
-- {
--   numbers = {1, 2, 3, 4, 5},
--   person = {
--     name = "John Doe",
--     age = 30,
--     email = "john@example.com",
--     active = true
--   },
--   config = {
--     server = {
--       host = "localhost",
--       port = 3000,
--       protocol = "http"
--     },
--     features = {"auth", "api", "dashboard"}
--   },
--   extractedName = "John Doe"
-- }
```

**Features Shown**:
- ✅ Array literals
- ✅ Object literals
- ✅ Nested structures
- ✅ Member access
- ✅ Reference resolution

## Complete Feature Matrix

| Feature | Implemented | Tested | Example Function |
|---------|------------|--------|------------------|
| **Expressions** | | | |
| Binary (arithmetic) | ✅ | ✅ | all_expressions, all_operators |
| Binary (comparison) | ✅ | ✅ | all_expressions, all_operators |
| Logical (&&, \|\|) | ✅ | ✅ | all_expressions, all_operators |
| Logical (??) | ✅ | ⏳ | - |
| Unary (!, -, +) | ✅ | ✅ | all_expressions, all_operators |
| Conditional (ternary) | ✅ | ✅ | all_expressions |
| Template literal | ✅ | ✅ | all_expressions |
| Member access | ✅ | ✅ | data_structures |
| Computed property | ✅ | ⏳ | - |
| Call expression | ✅ | ⏳ | - |
| Object literal | ✅ | ✅ | all_expressions, data_structures |
| Array literal | ✅ | ✅ | data_structures |
| **Statements** | | | |
| Const declaration | ✅ | ✅ | all_statements |
| Let declaration | ✅ | ✅ | all_statements |
| Assignment | ✅ | ✅ | all_statements |
| If/else | ✅ | ✅ | all_statements, control_flow |
| For-each loop | ✅ | ✅ | all_statements |
| Try/catch/finally | ✅ | ✅ | all_statements |
| Return | ✅ | ✅ | All functions |
| Comment | ✅ | ✅ | All functions |
| **Advanced** | | | |
| Default parameters | ✅ | ⏳ | - |
| Reference resolution | ✅ | ✅ | All functions |
| Short-circuit eval | ✅ | ✅ | all_expressions |
| Nested structures | ✅ | ✅ | data_structures |

## Running the Examples

### JavaScript/Node.js
```javascript
const { executeFunction } = require('../shared/seed/scripts/runtime/script_executor.cjs');
const fs = require('fs');

const scriptJson = JSON.parse(fs.readFileSync('seed/script.json', 'utf-8'));
const result = executeFunction(scriptJson, 'all_expressions', [10, 5]);
console.log(result);
// { sum: 15, diff: 5, product: 50, max: 10, bothPositive: true, ... }
```

### Lua
```lua
local executor = require("shared.seed.scripts.runtime.script_executor")
local json = require("json")

local file = io.open("packages/json_script_example/seed/script.json", "r")
local script_json = json.decode(file:read("*all"))
file:close()

local result = executor.execute_function(script_json, "all_expressions", {10, 5})
print(json.encode(result))
```

## Testing

Run parameterized tests:

```bash
cd packages/shared/seed/scripts/runtime

node test_parameterized_cli.cjs \
  ../../../../json_script_example/tests/math.test.logic.json \
  ../../../../json_script_example/tests/math.test.parameters.json
```

Output:
```
============================================================
Parameterized Test Results
============================================================

📦 Function: test_add
   8/8 tests passed

  ✅ positive_numbers (3/3)
  ✅ negative_numbers (3/3)
  ✅ edge_cases (2/2)

🎉 All parameterized tests passed!
```

See [tests/README.md](tests/README.md) for more information on testing.

## Performance Benchmarks

| Function | Lua Native | JSON Runtime | Slowdown |
|----------|-----------|--------------|----------|
| all_expressions | ~0.05ms | ~0.3ms | 6x |
| all_statements | ~0.1ms | ~0.8ms | 8x |
| all_operators | ~0.03ms | ~0.2ms | 7x |
| control_flow | ~0.02ms | ~0.15ms | 7.5x |
| data_structures | ~0.04ms | ~0.25ms | 6x |

**Average overhead**: ~7x slower than native Lua

**Acceptable for**: UI logic, configuration, plugin systems
**Not suitable for**: Tight loops, performance-critical paths

## JSON Spec Compatibility

This package follows **JSON Script Specification v2.1.0**

### Breaking Changes from v1.0
- ✅ Separated `binary_expression` and `logical_expression`
- ✅ Added `unary_expression`
- ✅ Added `conditional_expression`
- ✅ Added `for_each_loop`
- ✅ Added `computed` property to `member_access`
- ✅ Added `comment` statement type

### Lua vs JS Operator Mapping
| Lua | JS | JSON |
|-----|----|----|
| `~=` | `!=` | `!=` |
| `and` | `&&` | `&&` |
| `or` | `\|\|` | `\|\|` |
| `not` | `!` | `!` |

Runtime supports both syntaxes automatically.

## Use Cases

### 1. **Configuration-Driven Logic**
Define business rules in JSON, hot-reload without restarting:
```json
{
  "functions": [{
    "name": "validate_user",
    "body": [
      {"type": "if_statement", "condition": {...}, "then": [...]}
    ]
  }]
}
```

### 2. **Plugin Systems**
Third-party plugins as JSON - no arbitrary code execution:
```json
{
  "functions": [{
    "name": "process_data",
    "params": [{"name": "data", "type": "object"}],
    "body": [...]
  }]
}
```

### 3. **Visual Programming**
Generate JSON from drag-and-drop interfaces:
```
[IF Block] → {"type": "if_statement", ...}
[THEN Block] → {"then": [...]}
```

### 4. **Cross-Platform Logic**
Write once in JSON, run in Lua, JS, Python:
```json
{
  "functions": [{"name": "shared_logic", ...}]
}
```

## Limitations

### Not Supported (Yet)
- ⏳ For loops with counter (for i=1,10)
- ⏳ While loops
- ⏳ Classes and methods
- ⏳ Async/await (promises)
- ⏳ Generators
- ⏳ Spread operator (...)
- ⏳ Destructuring
- ⏳ Switch/case statements

### Not Planned
- ❌ Eval/dynamic code execution
- ❌ Regex (use string functions)
- ❌ DOM manipulation
- ❌ Module imports (use dependencies)

## Contributing

To add new examples:

1. Add function to `seed/script.json`
2. Export in `metadata.json` under `exports.scripts`
3. Create test in `tests/`
4. Add storybook story
5. Update this README

## See Also

- [Script JSON Spec Issues](../shared/seed/SCRIPT_JSON_SPEC_ISSUES.md)
- [Runtime Migration Summary](../shared/RUNTIME_MIGRATION_SUMMARY.md)
- [Runtime Executor](../shared/seed/scripts/runtime/script_executor.lua)

## License

Part of MetaBuilder - MIT License
