# Package Validator

JSON-based package validator for modern JSON script packages. Validates package structure including metadata, scripts, types, components, and tests.

## Overview

The package_validator has been rewritten to work with JSON-based packages instead of Lua. All validation logic is defined in [seed/validator.json](seed/validator.json) using the JSON script format.

## Architecture

### Package-Centric Design

Following the MetaBuilder principle: **"everything goes in package, everything else is a loader"**

- All validation logic is in `validator.json`
- Validation functions are exported for use by other packages
- External dependencies declared in `metadata.json`
- No external configuration needed

### External Dependencies

The validator declares external dependencies in `metadata.json` under `externalDependencies`:

**Required:**
- **fs** - File system operations (readFile, existsSync, readdir, statSync)
- **path** - Path manipulation utilities (join, resolve, basename, dirname, extname)
- **JSON** - JSON parsing (parse, stringify)

**Optional:**
- **ajv** (v8.0.0+) - JSON Schema validator for validating against *.schema.json files

These external dependencies are imported in validator.json using the `external:` prefix:
```json
"imports": [
  {
    "from": "external:fs",
    "import": ["readFile", "existsSync", "readdir", "statSync"]
  },
  {
    "from": "external:path",
    "import": ["join", "resolve", "basename", "dirname", "extname"]
  }
]
```

### Permissions

The package declares required permissions for accessing external APIs:
- `fs.read` - Read files from the file system
- `fs.list` - List directory contents
- `fs.stat` - Get file metadata
- `external.ajv` - Use AJV JSON Schema validator (optional)

This permission-based approach enables:
- **Security**: Fine-grained control over what packages can access
- **Auditing**: Clear visibility into external API usage
- **Flexibility**: Packages can request different external dependencies (e.g., databases, HTTP clients, parsers)
- **Sandboxing**: Runtime can enforce permission boundaries
- **npm Integration**: External dependencies can reference npm packages with version constraints

**Example Use Cases for External Dependencies**:
```json
{
  "externalDependencies": {
    "axios": {
      "description": "HTTP client for API validation",
      "version": "^1.0.0",
      "functions": ["get", "post"]
    },
    "glob": {
      "description": "File pattern matching",
      "version": "^10.0.0",
      "functions": ["sync"]
    },
    "cheerio": {
      "description": "HTML parsing for documentation validation",
      "version": "^1.0.0",
      "functions": ["load"]
    },
    "pg": {
      "description": "PostgreSQL client for database schema validation",
      "version": "^8.0.0",
      "functions": ["Client"],
      "permissions": ["db.connect", "db.query"]
    }
  }
}
```

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
- Declared external dependencies (fs, path, JSON, ajv) in metadata.json
- Added permission declarations for file system access
- Implemented concrete validation logic in `validate_metadata` function demonstrating:
  - External dependency usage (`$ref:imports.fs.*`, `$ref:imports.path.*`)
  - File existence checking
  - JSON parsing
  - Required field validation
  - Error object creation with structured error format

### ⚠️ Implementation Notes

**Partial Implementation**: The `validate_metadata` function has been fully implemented as a concrete example, showing:
- How to use external dependencies in JSON script format
- Path construction using `$ref:imports.path.join`
- File system operations using `$ref:imports.fs.*`
- JSON parsing using `$ref:imports.JSON.parse`
- Iteration over arrays with `for_of_statement`
- Dynamic property access using `$ref:local.field`
- Template literals for error messages
- Structured error object creation

**Remaining Work**: Other validation functions (`validate_scripts`, `validate_types`, etc.) still contain stub logic with TODO comments.

**Runtime Requirements**:

1. **External Dependency Resolution**: The runtime needs to provide the external dependencies declared in `externalDependencies`. These are imported via the `external:` prefix in the imports section.

2. **Permission Enforcement**: The runtime should check that the package has the required permissions (`fs.read`, `fs.list`, `fs.stat`) before allowing file system access.

3. **Error Handling**: The runtime should handle errors from external dependencies (e.g., file not found, JSON parse errors) and convert them to ValidationError objects.

The architecture is complete - external dependencies are declared in metadata.json, imported in validator.json, and gated by permissions. The `validate_metadata` implementation provides a template for completing the remaining validation functions.

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
