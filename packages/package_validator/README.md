# Package Validator

JSON-based package validator for modern JSON script packages. Validates package structure including metadata, scripts, types, components, and tests.

## Overview

The package_validator has been rewritten to work with JSON-based packages instead of Lua. All validation logic is defined in [seed/validator.json](seed/validator.json) using the JSON script format.

## Architecture

### Package-Centric Design

Following the MetaBuilder principle: **"everything goes in package, everything else is a loader"**

- All validation logic is in `validator.json`
- Validation functions are exported for use by other packages
- Runtime environment provides file system APIs
- No external configuration needed

### Validation Functions

All functions exported from [seed/validator.json](seed/validator.json):

- **validate_package** - Validates entire package structure
- **validate_metadata** - Validates metadata.json
- **validate_scripts** - Validates JSON script files
- **validate_types** - Validates types.json
- **validate_components** - Validates components.json
- **validate_tests** - Validates test files
- **validate_storybook** - Validates storybook configuration

## Current Status

### ✅ Completed

- Created validator.json with all validation function signatures
- Added comprehensive docstrings to all functions
- Defined ValidationResult, ValidationError, and ValidationWarning types in types.json
- Updated metadata.json to export new JSON-based validators
- Added Storybook integration for testing validators

### ⚠️ Implementation Notes

The current implementation contains stub logic with TODO comments. Full implementation requires:

1. **Runtime File System APIs**: The JSON script runtime needs to provide:
   - `fs.readFile(path)` - Read file contents
   - `fs.existsSync(path)` - Check if file exists
   - `fs.readdir(path)` - List directory contents
   - `path.join(...paths)` - Join path segments
   - `JSON.parse(content)` - Parse JSON strings

2. **JSON Schema Validation**: Integration with JSON schema validator for validating against *.schema.json files

3. **Reference Resolution**: Cross-file validation (e.g., exports match actual exported items, imports reference valid modules)

## Type Definitions

See [seed/types.json](seed/types.json) for all validation-related types:

- `ValidationResult` - Result structure with valid/errors/warnings/details
- `ValidationError` - Error with file/line/code/message/severity
- `ValidationWarning` - Warning with file/code/message
- `PackageMetadata` - Structure of metadata.json
- `ScriptFile` - Structure of script.json files
- `TypeDefinition` - Structure of type definitions
- `ComponentDefinition` - Structure of component definitions

## Usage

```javascript
// Validate entire package
const result = validate_package('packages/json_script_example');
if (result.valid) {
  console.log('✓ Package is valid');
} else {
  result.errors.forEach(err => {
    console.error(`${err.file}: ${err.message}`);
  });
}

// Validate specific aspects
const metadataResult = validate_metadata('packages/json_script_example');
const scriptsResult = validate_scripts('packages/json_script_example');
const typesResult = validate_types('packages/json_script_example');
```

## Storybook

The package includes Storybook stories for testing validation functions interactively. See the "Storybook" tab in the MetaBuilder UI.

Stories:
- **Validate Package** - Test full package validation
- **Validate Metadata** - Test metadata.json validation
- **Validate Scripts** - Test script file validation

## Migration from Lua

This package previously used Lua-based validation. The Lua files have been replaced with JSON script equivalents:

| Old (Lua) | New (JSON Script) |
|-----------|-------------------|
| validate.lua | validate_package function |
| metadata_schema.lua | validate_metadata function |
| lua_validator.lua | *(removed - JSON only)* |
| structure_validator.lua | *(integrated into validate_package)* |
| component_schema.lua | validate_components function |

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

### Package Validator

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

### Lua Test Framework

Many packages also use `lua_test` as a devDependency for testing:

```json
{
  "packageId": "your_package",
  "name": "Your Package",
  "version": "1.0.0",
  "dependencies": [],
  "devDependencies": [
    "lua_test",
    "package_validator"
  ]
}
```

When `lua_test` is detected as a devDependency, the validator will:
- Expect test files in `seed/scripts/tests/`
- Recommend standard test files (`metadata.test.lua`, `components.test.lua`)
- Validate test file structure and patterns

**Note:** Packages without `lua_test` won't receive warnings about missing test files.

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
