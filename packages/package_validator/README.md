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

## Development

### Adding New Validations

1. Add validation logic to the appropriate function in [seed/validator.json](seed/validator.json)
2. Update types in [seed/types.json](seed/types.json) if needed
3. Add test cases to demonstrate the validation
4. Update Storybook stories if the API changes

### Testing

Currently uses TODO placeholders. When runtime APIs are available:

1. Create test packages in `tests/fixtures/`
2. Add parameterized tests in `tests/` directory
3. Run tests to verify validation logic

## Future Enhancements

- [ ] Implement actual validation logic (requires runtime file system APIs)
- [ ] Add JSON schema validation integration
- [ ] Add cross-reference validation (imports/exports)
- [ ] Add customizable validation rules
- [ ] Add validation caching for performance
- [ ] Add auto-fix suggestions for common issues
- [ ] Add CI/CD integration examples
