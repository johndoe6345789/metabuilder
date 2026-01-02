# Styles Validation Documentation

## Overview

The package validator now validates both V1 (CSS-syntax) and V2 (abstract system) schema formats for `styles.json`.

## Schema Detection

The validator automatically detects the schema version:

- **V2**: Has `schema_version` or `package` field (object format)
- **V1**: Array format (legacy CSS-syntax)

## V1 Schema Validation

### Required Fields
- `id` (string, unique)
- `type` (enum: global, component, utility, animation)
- `css` (string, non-empty)

### Optional Fields
- `priority` (number)
- `className` (string)
- `description` (string)
- `category` (string)

### Checks
- Duplicate ID detection
- Valid type enum values
- CSS content not empty
- Proper field types

## V2 Schema Validation

### Top-Level Structure

```lua
{
  schema_version: string (semver),
  package: string,
  tokens: object,
  selectors: array,
  effects: array,
  appearance: array,
  layouts: array,
  transitions: array,
  rules: array,
  environments: array
}
```

### 1. Tokens Validation

Validates:
- `tokens.colors` is object
- `tokens.spacing` is object
- `tokens.typography` is object

### 2. Selectors Validation (Selection Layer)

Each selector must have:
- `id` (string, unique)
- `predicate` (object)
  - `targetType` (string, warning if missing)
  - `classes` (array, optional)
  - `states` (array, optional)
  - `relationship` (object, optional)

### 3. Effects Validation (Value System)

Each effect must have:
- `id` (string, unique)
- `properties` (object)

### 4. Appearance Validation (Paint & Effects Layer)

Each appearance must have:
- `id` (string, unique)
- `layers` (array)

Each layer must have:
- `type` (enum: background, foreground, border, shadow, filter)
- `properties` (object)

### 5. Layouts Validation (Constraint Systems)

Each layout must have:
- `id` (string, unique)
- `type` (enum: flow, flex, grid, absolute, sticky)
- `constraints` (object, warning if missing)

### 6. Transitions Validation (State Machines)

Each transition must have:
- `id` (string, unique)
- `trigger` (object, warning if missing)
- `properties` (array, warning if missing)

### 7. Rules Validation (Cascade Layer)

Each rule must have:
- `id` (string, unique)
- `selector` (string reference to selector id)
- `priority` (object, warning if missing)
  - `importance` (string, warning if missing)
  - `specificity` (object)
    - `ids` (number)
    - `classes` (number)
    - `types` (number)
  - `sourceOrder` (number)
- `enabled` (boolean, optional)

### 8. Environments Validation (Context Simulator)

Each environment must have:
- `id` (string, unique)
- `conditions` (object)

## Error vs Warning

### Errors (fail validation)
- Missing required fields
- Invalid types
- Duplicate IDs
- Invalid enum values
- Malformed JSON

### Warnings (pass but flag)
- Missing optional but recommended fields
- Empty CSS content (V1)
- Schema version not semver
- Missing constraints in layouts
- Missing priority in rules

## Usage

```lua
local validate_styles = require("validate_styles")

-- Validate a package
local result = validate_styles("/path/to/package")

if result.success then
  print("Validation passed!")
  for _, msg in ipairs(result.messages) do
    print("  [INFO] " .. msg)
  end
else
  print("Validation failed!")
  for _, err in ipairs(result.messages) do
    print("  [ERROR] " .. err)
  end
end

for _, warn in ipairs(result.warnings) do
  print("  [WARN] " .. warn)
end
```

## Integration

The styles validator is integrated into the main package validator:

```lua
-- In validate_package.lua
local validate_styles = require("validate_styles")

-- 5. Validate styles.json (optional)
if not options.skipStyles then
  local styles_result = validate_styles(package_path)
  -- ... handle results
end
```

## Example Output

### V1 Schema

```
[INFO] V1 schema: Found 11 style entries
[WARN] Style entry #1 has empty CSS content
```

### V2 Schema

```
[INFO] V2 schema validated
[WARN] Selector #1 predicate missing targetType
[WARN] Rule #1 priority missing importance
[WARN] Layout #1 missing constraints
```

## Validation Rules Summary

| Section | Required Fields | Validates |
|---------|----------------|-----------|
| **Tokens** | - | Structure of color/spacing/typography |
| **Selectors** | id, predicate | Predicate structure, no duplicates |
| **Effects** | id, properties | Properties exist, no duplicates |
| **Appearance** | id, layers | Layer types valid, no duplicates |
| **Layouts** | id, type | Type enum, constraints structure |
| **Transitions** | id | Trigger and properties structure |
| **Rules** | id, selector | Priority and specificity structure |
| **Environments** | id, conditions | Conditions exist, no duplicates |

## Extending Validation

To add new validation rules:

1. Add validation function for new section:
   ```lua
   function validate_new_section(section, result)
     -- validation logic
   end
   ```

2. Call from `validate_styles_v2`:
   ```lua
   if styles.new_section then
     validate_new_section(styles.new_section, result)
   end
   ```

3. Update this documentation

## Schema Evolution

The validator is designed to handle schema evolution:

- V1 → V2 migration supported
- Future V3 can be added with `elseif` branch
- Backward compatibility maintained
- Version detected automatically

This ensures packages can gradually migrate from V1 to V2 without breaking validation.
