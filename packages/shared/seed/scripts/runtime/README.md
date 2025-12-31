# JSON Script Runtime Executor

A Lua runtime interpreter that executes TypeScript/JavaScript functions defined in JSON format (script.json) without code generation.

## Overview

Instead of compiling `script.json` to TypeScript/JavaScript, this runtime executes the JSON AST directly, allowing dynamic function execution from declarative JSON definitions.

## Architecture

```
script.json (JSON AST) → script_executor.lua → Lua Runtime
```

### Supported Features

- ✅ **Constants** - Global constant definitions
- ✅ **Variables** - `const`, `let` declarations
- ✅ **Functions** - Regular and async functions
- ✅ **Expressions**
  - Literals (string, number, boolean, null)
  - Template literals with interpolation
  - Binary expressions (+, -, *, /, ==, <, >, &&, ||)
  - Member access (object.property)
  - Call expressions
  - Object/Array literals
- ✅ **Statements**
  - Variable declarations
  - Assignments
  - If/else conditionals
  - Return statements
  - Try/catch/finally
  - Function calls
- ✅ **Reference Resolution** - `$ref:path.to.value` syntax

### Not Yet Implemented

- ⏳ For loops
- ⏳ While loops
- ⏳ Classes and methods
- ⏳ Async/await (returns Promise placeholders)
- ⏳ Generators
- ⏳ React hooks
- ⏳ Import resolution

## Usage

### Basic Function Execution

```lua
local script_executor = require("runtime.script_executor")

-- Execute a function from script.json
local result = script_executor.load_and_execute(
  "packages/shared/seed/script.json",
  "delay",           -- function name
  {1000}             -- arguments array
)
```

### Direct Execution

```lua
local json = require("json")
local script_json = json.decode(file_content)

local result = script_executor.execute_function(
  script_json,
  "fetchUserData",
  {"user123", {timeout = 5000}}
)
```

## Example: Delay Function

Given this JSON definition:

```json
{
  "functions": [
    {
      "id": "delay_fn",
      "name": "delay",
      "params": [{"name": "ms", "type": "number"}],
      "returnType": "Promise<void>",
      "body": [
        {
          "type": "return",
          "value": {
            "type": "new_expression",
            "callee": "Promise",
            "args": [...]
          }
        }
      ]
    }
  ]
}
```

Execute with:

```lua
local promise = script_executor.execute_function(script_json, "delay", {1000})
```

## Reference Resolution

The `$ref:` syntax allows referencing other values in the context:

- `$ref:params.userId` - Function parameter
- `$ref:local.cacheKey` - Local variable
- `$ref:constants.api_base_url` - Global constant
- `$ref:imports.axios.get` - Imported function

## Context Structure

```lua
{
  params = {userId = "123", options = {}},
  local_vars = {cacheKey = "user_123", response = {...}},
  constants = {API_BASE_URL = "https://api.example.com"},
  imports = {axios = {get = function(...) end}},
  functions = {delay = function(...) end}
}
```

## Testing

Run the example:

```bash
lua packages/shared/seed/scripts/runtime/example_usage.lua
```

## Future Enhancements

1. **Async/Await Support** - Integrate with Lua coroutines
2. **Class Execution** - Constructor and method invocation
3. **Import Resolution** - Load actual modules from imports
4. **Loop Constructs** - For/while loop execution
5. **Generator Support** - Yield and iteration
6. **React Hook Emulation** - useState, useEffect in Lua
7. **Performance Optimization** - Cache compiled expressions

## Integration with MetaBuilder

This executor allows packages to define their logic in portable JSON format:

```json
{
  "packageId": "shared",
  "exports": {
    "scripts": ["permissions.check_access"]
  },
  "script": "seed/script.json"  // References this JSON runtime
}
```

The runtime can be extended to support the full MetaBuilder package ecosystem.

## Comparison: Compiled vs Runtime

| Aspect | Compiled Approach | Runtime Approach |
|--------|------------------|-----------------|
| Speed | Fast (native code) | Slower (interpreted) |
| Debugging | Harder (generated code) | Easier (JSON visible) |
| Flexibility | Static (recompile needed) | Dynamic (hot reload) |
| Bundle Size | Larger (generated JS) | Smaller (just JSON) |
| Type Safety | TypeScript types | Runtime checks |

**Recommendation**: Use runtime execution for:
- Development and debugging
- Hot module reloading
- Dynamic plugin systems
- Configuration-driven logic

Use compilation for:
- Production builds
- Performance-critical code
- Static type checking
- Tree shaking optimization
