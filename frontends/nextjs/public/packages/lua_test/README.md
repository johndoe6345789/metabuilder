# Lua Test Package

A unit testing framework for Lua scripts in MetaBuilder packages.

## Features

- **BDD-style syntax**: `describe`/`it` blocks for organizing tests
- **Rich assertions**: `expect()` with chainable matchers
- **Mocks and spies**: Track function calls and replace implementations
- **Lifecycle hooks**: `beforeAll`, `afterAll`, `beforeEach`, `afterEach`
- **Test filtering**: Run specific tests with `.only` or name filters
- **Detailed reporting**: Text and JSON output formats

## Package Integration

To use lua_test in your package, add it as a `devDependency` and declare your test files in `metadata.json`:

```json
{
  "packageId": "my_package",
  "name": "My Package",
  "version": "1.0.0",
  "dependencies": ["ui_permissions"],
  "devDependencies": ["lua_test"],
  "exports": {
    "scripts": ["my_script"]
  },
  "tests": {
    "scripts": [
      "tests/my_script.test.lua"
    ]
  }
}
```

Place your test files in `seed/scripts/tests/`:

```
packages/my_package/
├── seed/
│   ├── metadata.json
│   └── scripts/
│       ├── my_script.lua
│       └── tests/
│           └── my_script.test.lua
```

## Quick Start

```lua
local framework = require("lua_test/framework")
local assertions = require("lua_test/assertions")

local describe = framework.describe
local it = framework.it
local expect = assertions.expect

describe("My Module", function()
  
  it("should do something", function()
    expect(1 + 1).toBe(2)
  end)
  
  it("should handle strings", function()
    expect("hello").toContain("ell")
    expect("hello").toHaveLength(5)
  end)
  
end)
```

## Assertions

### Basic Matchers

```lua
expect(value).toBe(expected)           -- Strict equality (==)
expect(value).toEqual(expected)        -- Deep equality for tables
expect(value).toBeNil()                -- Check for nil
expect(value).toBeTruthy()             -- Truthy check
expect(value).toBeFalsy()              -- Falsy check
expect(value).toBeType("string")       -- Type check
```

### Comparison Matchers

```lua
expect(num).toBeGreaterThan(5)
expect(num).toBeLessThan(10)
expect(3.14159).toBeCloseTo(3.14, 2)   -- Floating point comparison
```

### String Matchers

```lua
expect(str).toContain("substring")
expect(str).toMatch("^pattern")        -- Lua pattern matching
expect(str).toHaveLength(5)
```

### Collection Matchers

```lua
expect(table).toContain(element)
expect(table).toHaveLength(3)
expect(table).toHaveProperty("key")
expect(table).toHaveProperty("key", value)
```

### Error Matchers

```lua
expect(function() error("boom") end).toThrow()
expect(function() error("boom") end).toThrow("boom")
```

### Negation

Use `.never` to negate any matcher:

```lua
expect(5).never.toBe(10)
expect("hello").never.toContain("world")
```

## Mocks

### Mock Functions

```lua
local mocks = require("lua_test/mocks")

local mockFn = mocks.fn(function(x) return x * 2 end)

mockFn(5)
mockFn(10)

mockFn.getCallCount()     -- 2
mockFn.wasCalled()        -- true
mockFn.wasCalledWith(5)   -- true
mockFn.getLastCall()      -- {10}
mockFn.getCalls()         -- {{5}, {10}}
```

### Mock Return Values

```lua
local mockFn = mocks.fn()
mockFn.mockReturnValue(42)

mockFn()  -- 42
mockFn()  -- 42

-- Or return different values
mockFn.mockReturnValueOnce(1)
mockFn.mockReturnValueOnce(2)
mockFn()  -- 1
mockFn()  -- 2
mockFn()  -- nil (or previous mockReturnValue)
```

### Spies

```lua
local myModule = { calculate = function(x) return x * 2 end }

local spy = mocks.spyOn(myModule, "calculate")

myModule.calculate(5)

spy.getCallCount()     -- 1
spy.wasCalledWith(5)   -- true

spy.mockRestore()      -- Restore original function
```

## Lifecycle Hooks

```lua
describe("My Suite", function()
  
  beforeAll(function()
    -- Run once before all tests in this suite
  end)
  
  afterAll(function()
    -- Run once after all tests in this suite
  end)
  
  beforeEach(function()
    -- Run before each test
  end)
  
  afterEach(function()
    -- Run after each test
  end)
  
  it("test 1", function() end)
  it("test 2", function() end)
  
end)
```

## Test Filtering

### Skip Tests

```lua
xit("this test is skipped", function()
  -- Won't run
end)
```

### Focus Tests

```lua
fit("only this test runs", function()
  -- Other tests in the suite are skipped
end)
```

### Filter by Name

```lua
framework.configure({ filter = "validation" })
-- Only tests with "validation" in their name will run
```

## Running Tests

```lua
local runner = require("lua_test/runner")
local framework = require("lua_test/framework")

-- Define your tests with describe/it
-- ...

-- Run all suites
local results = runner.runAll(framework.getSuites())

-- Print report
print(runner.formatReport(results))

-- Or get JSON for programmatic use
local json = runner.formatJSON(results)
```

## Helpers

```lua
local helpers = require("lua_test/helpers")

-- Generate test data
local users = helpers.generateTestData({
  id = "$index",
  name = function(i) return "User " .. i end,
  score = "$random"
}, 10)

-- Table utilities
helpers.table.clone(t)
helpers.table.merge(t1, t2)
helpers.table.keys(t)
helpers.table.values(t)
helpers.table.size(t)

-- String utilities
helpers.string.trim(s)
helpers.string.split(s, delimiter)
helpers.string.startsWith(s, prefix)
helpers.string.endsWith(s, suffix)

-- Create test context
local ctx = helpers.createContext({ user = nil })
ctx.set("user", { name = "Alice" })
ctx.get("user")
ctx.reset()
```

## Example: Testing a Package

```lua
-- tests/validate.test.lua
local framework = require("lua_test/framework")
local assertions = require("lua_test/assertions")
local runner = require("lua_test/runner")

local describe = framework.describe
local it = framework.it
local beforeEach = framework.beforeEach
local expect = assertions.expect

-- Import the module to test
local validate = require("ui_login/validate")

describe("ui_login validation", function()
  
  describe("login", function()
    it("should reject empty username", function()
      local result = validate.login({ username = "", password = "password123" })
      expect(result.valid).toBe(false)
      expect(result.errors[1].field).toBe("username")
    end)
    
    it("should accept valid credentials", function()
      local result = validate.login({ username = "user", password = "password123" })
      expect(result.valid).toBe(true)
    end)
  end)
  
end)

-- Run and report
local results = runner.runAll(framework.getSuites())
print(runner.formatReport(results))
```

## Output Example

```
═══════════════════════════════════════
          TEST RESULTS REPORT          
═══════════════════════════════════════

📦 ui_login validation
  📦 login
    ✅ should reject empty username (0.12ms)
    ✅ should accept valid credentials (0.08ms)
  📦 register
    ✅ should reject invalid email (0.15ms)
    ✅ should accept valid registration (0.10ms)

───────────────────────────────────────
Summary:
  Total:   4 tests
  Passed:  4 ✅
  Failed:  0 ❌
  Skipped: 0 ⏭️
  Duration: 0.45ms

🎉 All tests passed!
═══════════════════════════════════════
```
