# Lua Scripting Integration

MetaBuilder now includes a **real Lua interpreter** powered by [Fengari](https://fengari.io/), allowing you to write and execute custom Lua scripts directly in the browser.

## Features

✅ **Real Lua Execution** - Full Lua 5.3 interpreter running in the browser  
✅ **Context API** - Access data, user info, and key-value storage from Lua  
✅ **Parameter System** - Define typed parameters for your scripts  
✅ **Live Testing** - Test scripts with sample data and see immediate results  
✅ **Workflow Integration** - Use Lua scripts as nodes in visual workflows  
✅ **Execution Logs** - Comprehensive logging with `log()` and `print()`  
✅ **Error Handling** - Clear syntax and runtime error messages  

## Context API

Every Lua script has access to a `context` table with the following properties:

### `context.data`
Input data passed to the script. When used in workflows, this is the output from the previous node. When testing, this contains your parameter values.

```lua
local input = context.data or {}
log("Processing: " .. input.name)
```

### `context.user`
Information about the current user:

```lua
if context.user.role == "admin" then
  log("Admin access granted")
end
```

Properties:
- `username` - User's username
- `role` - User role (user, admin, god)
- `email` - User email (if available)

### `context.kv`
Key-value storage interface (future feature):

```lua
-- Future: Access to persistent storage
-- local value = context.kv.get("my-key")
-- context.kv.set("my-key", value)
```

## Built-in Functions

### `log(...)`
Log messages that appear in the execution results:

```lua
log("Starting process")
log("Value:", 42)
log("Multiple", "arguments", "supported")
```

### `print(...)`
Alias for `log()`, works the same way:

```lua
print("Hello from Lua!")
```

## Return Values

Scripts can return any Lua value. Tables are automatically converted to JavaScript objects/arrays:

```lua
-- Return a table
return {
  success = true,
  message = "Process complete",
  count = 42
}

-- Return multiple values
return "result", 123, true

-- Return nil
return nil
```

## Script Examples

### Basic Hello World
```lua
log("Hello from Lua!")
return { message = "Success", timestamp = os.time() }
```

### Data Validation
```lua
local data = context.data or {}

if not data.email then
  return { valid = false, error = "Email is required" }
end

if not string.match(data.email, "@") then
  return { valid = false, error = "Invalid email format" }
end

return { valid = true }
```

### Data Transformation
```lua
local input = context.data or {}

local output = {
  fullName = (input.firstName or "") .. " " .. (input.lastName or ""),
  displayAge = tostring(input.age or 0) .. " years old",
  status = input.isActive and "Active" or "Inactive"
}

return output
```

### Array Processing
```lua
local data = context.data or {}
local numbers = data.numbers or {1, 2, 3, 4, 5}

local sum = 0
local max = numbers[1] or 0

for i, num in ipairs(numbers) do
  sum = sum + num
  if num > max then max = num end
end

return {
  sum = sum,
  average = sum / #numbers,
  max = max
}
```

### Conditional Logic
```lua
local data = context.data or {}

if data.score and data.score >= 80 then
  return { 
    approved = true, 
    reason = "Score requirement met"
  }
end

return { 
  approved = false, 
  reason = "Requirements not satisfied"
}
```

## Using Scripts in Workflows

1. **Create a Script** - Go to the Lua Scripts tab and create a new script
2. **Define Parameters** - Add parameters your script needs (optional)
3. **Write Code** - Access parameters via `context.data`
4. **Test** - Use the test panel to verify your script works
5. **Use in Workflows** - Add a "Lua" node to any workflow and select your script

### Workflow Integration Example

```lua
-- This script filters items based on a threshold
local input = context.data or {}
local threshold = 10

local filtered = {}
if input.items then
  for i, item in ipairs(input.items) do
    if item.value > threshold then
      table.insert(filtered, item)
    end
  end
end

log("Filtered " .. #filtered .. " items")
return { items = filtered, count = #filtered }
```

## Best Practices

### ✅ Do
- Use `local` for all variables to avoid global namespace pollution
- Check for nil values before using them
- Use `log()` to debug and provide execution feedback
- Return structured tables with clear property names
- Handle edge cases (empty arrays, missing properties)

### ❌ Don't
- Rely on global variables (use `local`)
- Create infinite loops (workflows have execution limits)
- Assume data structure - always validate input
- Use blocking operations (not applicable in browser Lua)

## Lua Language Support

Fengari supports Lua 5.3 with the following features:

✅ **Supported:**
- All standard Lua syntax
- Tables (arrays and dictionaries)
- String manipulation (`string.*`)
- Math operations (`math.*`)
- Table operations (`table.*`)
- Control flow (if, for, while, etc.)
- Functions and closures
- Metatables and metamethods
- Coroutines

❌ **Not Supported:**
- File I/O operations (`io.*`)
- OS operations that don't make sense in browser
- Loading external Lua modules
- C extensions

## Type Conversions

### Lua → JavaScript
- `nil` → `null`
- `boolean` → `boolean`
- `number` → `number`
- `string` → `string`
- `table` (array-like) → `Array`
- `table` (object-like) → `Object`
- `function` → not converted

### JavaScript → Lua
- `null`/`undefined` → `nil`
- `boolean` → `boolean`
- `number` → `number`
- `string` → `string`
- `Array` → `table` (1-indexed)
- `Object` → `table`
- `Function` → not converted

## Troubleshooting

### Syntax Errors
Check the error message for line numbers and details. Common issues:
- Missing `end` keywords
- Incorrect use of `=` vs `==`
- Forgetting `local` keyword

### Runtime Errors
- **"attempt to index a nil value"** - Trying to access property of nil/undefined
- **"attempt to call a nil value"** - Function doesn't exist
- **"attempt to perform arithmetic on a nil value"** - Math operation on nil

### Type Mismatches
Remember Lua is 1-indexed for arrays while JavaScript is 0-indexed. The conversion handles this automatically.

## Performance Notes

- Scripts execute in the browser's main thread
- Large loops may block the UI temporarily
- Keep workflows reasonably sized (< 1000 operations)
- Complex calculations are fine, but avoid infinite loops

## Security

- Scripts run in a sandboxed Lua VM
- No access to browser APIs directly
- No file system access
- No network access
- Cannot break out of the sandbox

---

For more Lua language documentation, see the [official Lua manual](https://www.lua.org/manual/5.3/).
