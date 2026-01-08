# MetaBuilder Schemas

This directory contains schema files used across the MetaBuilder project for validation and IDE support.

## Schema Files

### YAML Schemas

**[yaml-schema.yaml](yaml-schema.yaml)** - YAML meta-schema (Draft 2025-11)
- Source: https://github.com/johndoe6345789/yaml-schema
- Purpose: Validates YAML file structure and syntax
- Used by: All `.yaml` files in the project

**Usage in YAML files:**
```yaml
# yaml-language-server: $schema=../../../../../schemas/yaml-schema.yaml
```

**Files using this schema:**
- `packages/*/seed/schema/entities.yaml` - Database entity definitions
- Other YAML configuration files

### JSON Schemas

JSON Schema files are located within individual packages:
- `packages/json_script_example/seed/script.schema.json` - JSON script validation
- `packages/json_script_example/seed/types.schema.json` - Type definitions
- `packages/json_script_example/seed/schema/entities.schema.json` - Entity structure validation
- `packages/json_script_example/tests/test.schema.json` - Test logic validation
- `packages/json_script_example/tests/test-parameters.schema.json` - Test parameters validation

## Adding New Schemas

### For YAML Files

1. Place the schema in this `schemas/` directory
2. Add documentation in this README
3. Reference the schema in YAML files using the `yaml-language-server` directive

### For JSON Files

1. Place the schema alongside the files it validates (in the package directory)
2. Add a `$schema` property to JSON files pointing to the schema
3. Document the schema in the package README

## IDE Support

### VS Code

Install the **YAML extension** by Red Hat for YAML schema validation:
- Extension ID: `redhat.vscode-yaml`
- Provides autocomplete, validation, and hover documentation

JSON schema support is built-in to VS Code.

### JetBrains IDEs

YAML and JSON schema validation is built-in to WebStorm, IntelliJ IDEA, and other JetBrains IDEs.

## Schema Validation Benefits

- ✅ **Real-time validation** - Catch errors while editing
- ✅ **IDE autocomplete** - IntelliSense for properties and values
- ✅ **Documentation** - Hover tooltips explain each field
- ✅ **Type safety** - Ensure files match their specifications
- ✅ **Consistency** - Enforce structure across all files
