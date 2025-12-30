# Package Validator

A comprehensive Lua-based validation system for MetaBuilder packages. Validates JSON schemas, Lua files, folder structure, and naming conventions.

## Features

- **Metadata Validation**: Validates `metadata.json` files for correct structure and required fields
- **Component Validation**: Validates `components.json` files with nested layout structures
- **Lua File Validation**: Checks Lua syntax, module patterns, and code quality
- **Folder Structure Validation**: Ensures proper package organization and file placement
- **Naming Convention Validation**: Validates package, script, and component naming
- **Comprehensive Error Reporting**: Provides detailed error messages and warnings
- **Test Coverage**: Includes comprehensive test suite for all validation rules

## Package Structure

```
package_validator/
├── seed/
│   ├── metadata.json          # Package metadata
│   ├── components.json        # Component definitions (empty for this package)
│   └── scripts/
│       ├── init.lua                  # Main entry point
│       ├── validate.lua              # Validation orchestrator
│       ├── metadata_schema.lua       # Metadata validation rules
│       ├── component_schema.lua      # Component validation rules
│       ├── lua_validator.lua         # Lua file validation
│       ├── structure_validator.lua   # Folder structure validation
│       └── tests/
│           ├── metadata.test.lua
│           ├── component.test.lua
│           ├── validate.test.lua
│           ├── lua_validator.test.lua
│           └── structure_validator.test.lua
├── static_content/
│   └── icon.svg
└── examples/
    └── validate_audit_log.lua
```

## Usage

### Validate a Complete Package

```lua
local package_validator = require("init")

-- Validate a package by ID (runs all validators)
local results = package_validator.validate_package("audit_log")

-- Check if validation passed
if results.valid then
  print("Package is valid!")
else
  print("Validation failed:")
  for _, error in ipairs(results.errors) do
    print("  - " .. error)
  end
end
```

### Validate with Options

```lua
local package_validator = require("init")

-- Skip specific validators
local results = package_validator.validate_package("audit_log", {
  skipStructure = true,  -- Skip folder structure validation
  skipLua = true         -- Skip Lua file validation
})
```

### Validate Metadata Only

```lua
local package_validator = require("init")

local metadata = {
  packageId = "my_package",
  name = "My Package",
  version = "1.0.0",
  description = "A test package",
  author = "MetaBuilder",
  category = "ui"
}

local valid, errors = package_validator.validate_metadata(metadata)
```

### Validate Components Only

```lua
local package_validator = require("init")

local components = {
  {
    id = "my_component",
    type = "MyComponent",
    layout = {
      type = "Box",
      children = {}
    }
  }
}

local valid, errors = package_validator.validate_components(components)
```

### Validate Lua Files

```lua
local lua_validator = require("lua_validator")

-- Check syntax
local lua_code = [[
  local M = {}
  function M.test()
    return true
  end
  return M
]]

local valid, errors = lua_validator.validate_lua_syntax("test.lua", lua_code)

-- Check structure and patterns
local warnings = lua_validator.validate_lua_structure("test.lua", lua_code)

-- Check code quality
local quality_warnings = lua_validator.check_lua_quality("test.lua", lua_code)
```

## Validation Rules

### Metadata (metadata.json)

**Required Fields:**
- `packageId` (string, lowercase and underscores only)
- `name` (string)
- `version` (string, semantic versioning: X.Y.Z)
- `description` (string)
- `author` (string)
- `category` (string)

**Optional Fields:**
- `dependencies` (array of strings)
- `devDependencies` (array of strings) - Development-only dependencies like `package_validator`
- `exports` (object with `components`, `scripts`, `pages` arrays)
- `minLevel` (number, 1-6)
- `bindings` (object with `dbal`, `browser` booleans)
- `icon` (string)
- `tags` (array)
- `requiredHooks` (array)

### Components (components.json)

Must be an array of component objects.

**Required Fields per Component:**
- `id` (string)
- `type` (string)

**Optional Fields:**
- `name` (string)
- `description` (string)
- `props` (object)
- `layout` (object with recursive structure)
- `scripts` (object)
- `bindings` (object)
- `requiredHooks` (array)

**Layout Structure:**
- `type` (string, required)
- `props` (object)
- `children` (array of nested layouts)

### Folder Structure

**Required Files:**
- `seed/metadata.json`
- `seed/components.json`

**Recommended Files:**
- `seed/scripts/` (directory)
- `seed/scripts/init.lua` (if exports.scripts is defined)
- `seed/scripts/tests/` (directory - required if `lua_test` is a devDependency)
- `static_content/icon.svg`
- `README.md`
- `examples/` (directory)

**Test Files (when using lua_test):**

If your package includes `lua_test` as a devDependency, the following test files are recommended:
- `seed/scripts/tests/metadata.test.lua` - Tests for metadata validation
- `seed/scripts/tests/components.test.lua` - Tests for component validation
- Additional `*.test.lua` files for your package's functionality

### Lua Files

**Module Pattern:**
```lua
local M = {}
-- Your code here
return M
```

**Test File Pattern:**
```lua
describe("Test Suite", function()
  it("should pass", function()
    expect(value).toBe(expected)
  end)
end)
```

**Quality Checks:**
- Avoid global functions (use `local function`)
- Minimize print statements
- Clean up TODO/FIXME comments before release
- Use proper module patterns

### Naming Conventions

- **Package ID**: lowercase with underscores (e.g., `package_validator`)
- **Directory name**: Must match packageId
- **Script names**: lowercase with underscores (e.g., `validate.lua`)
- **Component names**: PascalCase or snake_case (e.g., `TestComponent` or `test_component`)

## Testing

The package includes comprehensive test coverage:

```bash
# Run all tests
lua test_runner.lua packages/package_validator/seed/scripts/tests/

# Run specific test file
lua test_runner.lua packages/package_validator/seed/scripts/tests/metadata.test.lua
```

## Error Messages

The validator provides clear, categorized error messages:

```
✗ Validation failed

Errors:
  • metadata.json: packageId must contain only lowercase letters and underscores
  • metadata.json: version must follow semantic versioning (e.g., 1.0.0)
  • Structure: Package directory name 'wrong_name' does not match packageId 'test_package'
  • Lua: Exported script not found: init.lua
  • components.json: components[0]: Missing required field 'type'

Warnings:
  • Structure: Recommended file missing: README.md
  • Structure: scripts/tests/ directory recommended for test files
  • Lua: test.lua: Contains 3 print() statements
  • Lua: validate.lua: Contains TODO/FIXME comments
```

## Using as a Dev Dependency

Add `package_validator` to your package's `devDependencies` to enable validation during development:

```json
{
  "packageId": "your_package",
  "name": "Your Package",
  "version": "1.0.0",
  "dependencies": [],
  "devDependencies": [
    "package_validator"
  ]
}
```

### CLI Usage

Run validation from the command line:

```bash
# Basic validation
lua packages/package_validator/seed/scripts/cli.lua your_package

# Verbose output
lua packages/package_validator/seed/scripts/cli.lua your_package --verbose

# Skip specific validators
lua packages/package_validator/seed/scripts/cli.lua your_package --skip-structure --skip-lua

# JSON output (for CI/CD)
lua packages/package_validator/seed/scripts/cli.lua your_package --json
```

**CLI Exit Codes:**
- `0` - Validation passed
- `1` - Validation failed
- `2` - Invalid arguments or package not found

### Pre-commit Hook

Install the pre-commit hook to validate packages before committing:

```bash
# Copy the example hook
cp packages/package_validator/examples/pre-commit-hook.sh .git/hooks/pre-commit

# Make it executable
chmod +x .git/hooks/pre-commit
```

### GitHub Actions

Add automated validation to your CI/CD pipeline:

```yaml
# .github/workflows/validate-packages.yml
name: Validate Packages

on:
  push:
    paths: ['packages/**']
  pull_request:
    paths: ['packages/**']

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: leafo/gh-actions-lua@v10
      - run: lua packages/package_validator/seed/scripts/cli.lua your_package
```

See [examples/github-actions.yml](examples/github-actions.yml) for a complete workflow.

### NPM Scripts

Integrate with your package.json scripts:

```json
{
  "scripts": {
    "validate": "lua packages/package_validator/seed/scripts/cli.lua your_package",
    "precommit": "npm run validate",
    "test": "npm run validate && npm run test:unit"
  }
}
```

See [examples/package.json.example](examples/package.json.example) for more integration patterns.

## Integration

This package can be integrated into:
- **Build pipelines** for pre-deployment validation
- **Development tools** for real-time validation
- **Package generators** for ensuring correct output
- **Documentation generators** for validating examples
- **CI/CD workflows** for automated quality checks
- **Pre-commit hooks** for preventing invalid commits
- **NPM scripts** for validation during development

## Example Output

Running the validator on a package:

```lua
local package_validator = require("init")
local validate = require("validate")

local results = package_validator.validate_package("audit_log")
print(validate.format_results(results))
```

Output:
```
✓ Validation passed

Warnings:
  • Structure: Recommended file missing: examples/
```

## License

Part of the MetaBuilder system.
