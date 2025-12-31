# JSON Script Docstring Specification

## Overview

JSON scripts support **JSDoc-style docstrings** embedded directly in JSON format. Docstrings provide:
- **Function documentation** - What the function does, parameters, return values
- **Type information** - Parameter types, return types, generic constraints
- **Usage examples** - Code samples showing how to use functions
- **Metadata** - Version, author, deprecation warnings, etc.

## Docstring Format

Docstrings are added to functions, constants, and types using a `docstring` property:

```json
{
  "name": "calculateArea",
  "docstring": {
    "summary": "Calculates the area of a rectangle",
    "description": "Takes width and height and returns the area. Values are clamped to prevent overflow.",
    "params": [
      {
        "name": "width",
        "type": "number",
        "description": "Width of the rectangle in pixels"
      },
      {
        "name": "height",
        "type": "number",
        "description": "Height of the rectangle in pixels"
      }
    ],
    "returns": {
      "type": "number",
      "description": "Area in square pixels, clamped between 0 and 1000"
    },
    "examples": [
      {
        "title": "Basic usage",
        "code": "const area = calculateArea(10, 20); // Returns 200"
      },
      {
        "title": "Large values are clamped",
        "code": "const area = calculateArea(100, 100); // Returns 1000 (clamped)"
      }
    ],
    "throws": [
      {
        "type": "TypeError",
        "description": "If width or height are not numbers"
      }
    ],
    "see": ["multiply", "clamp"],
    "since": "1.0.0",
    "deprecated": false
  },
  "params": [...],
  "body": [...]
}
```

## Docstring Properties

### Required Fields

#### `summary` (string)
**Short one-line description** of what the function does.
- Keep to 80 characters or less
- No period at the end
- Use present tense ("Calculates..." not "Calculate...")

```json
{
  "summary": "Validates user input against a set of rules"
}
```

### Optional Fields

#### `description` (string)
**Detailed multi-line description** providing context, behavior, edge cases.

```json
{
  "description": "Validates form input by checking:\n- Name is not empty\n- Age is between 0 and 120\n- Email matches RFC 5322 format\n\nReturns a ValidationResult with errors keyed by field name."
}
```

#### `params` (array)
**Parameter documentation** - one entry per parameter.

```json
{
  "params": [
    {
      "name": "input",
      "type": "FormInput",
      "description": "Form data to validate",
      "optional": false,
      "default": null
    },
    {
      "name": "strict",
      "type": "boolean",
      "description": "Whether to use strict validation rules",
      "optional": true,
      "default": false
    }
  ]
}
```

**Fields**:
- `name` (string, required) - Parameter name
- `type` (string, optional) - Type annotation
- `description` (string, required) - What the parameter is for
- `optional` (boolean, optional) - Whether parameter is optional
- `default` (any, optional) - Default value if not provided

#### `returns` (object)
**Return value documentation**.

```json
{
  "returns": {
    "type": "ValidationResult",
    "description": "Object with 'valid' boolean and 'errors' object"
  }
}
```

**Fields**:
- `type` (string, optional) - Return type
- `description` (string, required) - What is returned

#### `examples` (array)
**Usage examples** showing how to call the function.

```json
{
  "examples": [
    {
      "title": "Valid input",
      "code": "const result = validateInput({name: 'John', age: 30});\n// result.valid === true"
    },
    {
      "title": "Invalid input",
      "code": "const result = validateInput({name: '', age: -5});\n// result.errors === {name: '...', age: '...'}"
    }
  ]
}
```

**Fields**:
- `title` (string, required) - Short description of the example
- `code` (string, required) - Example code snippet

#### `throws` (array)
**Exceptions that can be thrown**.

```json
{
  "throws": [
    {
      "type": "TypeError",
      "description": "If input is not an object"
    },
    {
      "type": "ValidationError",
      "description": "If validation fails in strict mode"
    }
  ]
}
```

**Fields**:
- `type` (string, required) - Exception type
- `description` (string, required) - When it's thrown

#### `see` (array of strings)
**Related functions or documentation** to reference.

```json
{
  "see": ["isNotEmpty", "validateRange", "FormInput"]
}
```

#### `since` (string)
**Version when function was added**.

```json
{
  "since": "1.2.0"
}
```

#### `deprecated` (boolean | object)
**Whether function is deprecated** and what to use instead.

```json
{
  "deprecated": {
    "version": "2.0.0",
    "reason": "Use validateFormData instead",
    "alternative": "validateFormData"
  }
}
```

Or simply:
```json
{
  "deprecated": true
}
```

#### `author` (string)
**Function author**.

```json
{
  "author": "John Doe <john@example.com>"
}
```

#### `version` (string)
**Current version** of the function.

```json
{
  "version": "1.3.0"
}
```

#### `tags` (array of strings)
**Categorization tags**.

```json
{
  "tags": ["validation", "forms", "user-input"]
}
```

#### `internal` (boolean)
**Whether function is internal-only** (not part of public API).

```json
{
  "internal": true
}
```

## Complete Example

```json
{
  "id": "validate_input_fn",
  "name": "validateInput",
  "exported": true,
  "docstring": {
    "summary": "Validates form input against a set of rules",
    "description": "Validates user input by checking:\n- Name is not empty\n- Age is between 0 and 120\n- Email matches RFC 5322 format\n\nReturns a ValidationResult with errors keyed by field name.",
    "params": [
      {
        "name": "input",
        "type": "FormInput",
        "description": "Form data containing name, age, and email fields"
      },
      {
        "name": "strict",
        "type": "boolean",
        "description": "If true, throws on validation failure instead of returning errors",
        "optional": true,
        "default": false
      }
    ],
    "returns": {
      "type": "ValidationResult",
      "description": "Object with 'valid' boolean and 'errors' object containing field-specific error messages"
    },
    "examples": [
      {
        "title": "Valid input",
        "code": "const result = validateInput({\n  name: 'John Doe',\n  age: 30,\n  email: 'john@example.com'\n});\n// result.valid === true\n// result.errors === {}"
      },
      {
        "title": "Invalid input",
        "code": "const result = validateInput({\n  name: '',\n  age: 200,\n  email: 'not-an-email'\n});\n// result.valid === false\n// result.errors === {\n//   name: 'Name is required',\n//   age: 'Age must be between 0 and 120',\n//   email: 'Invalid email format'\n// }"
      },
      {
        "title": "Strict mode",
        "code": "try {\n  validateInput({name: ''}, true);\n} catch (e) {\n  // Throws ValidationError\n}"
      }
    ],
    "throws": [
      {
        "type": "TypeError",
        "description": "If input is not an object"
      },
      {
        "type": "ValidationError",
        "description": "If validation fails and strict mode is enabled"
      }
    ],
    "see": ["isNotEmpty", "validateRange", "isValidEmail", "FormInput", "ValidationResult"],
    "since": "1.0.0",
    "author": "MetaBuilder Team",
    "tags": ["validation", "forms", "user-input"],
    "version": "1.2.0",
    "deprecated": false
  },
  "params": [
    {
      "name": "input",
      "type": "FormInput"
    },
    {
      "name": "strict",
      "type": "boolean",
      "optional": true,
      "default": false
    }
  ],
  "returnType": "ValidationResult",
  "body": [...]
}
```

## Constant Docstrings

Constants can also have docstrings:

```json
{
  "constants": [
    {
      "id": "max_retries",
      "name": "MAX_RETRIES",
      "value": 3,
      "exported": true,
      "docstring": {
        "summary": "Maximum number of retry attempts for failed requests",
        "description": "After this many retries, the request will fail permanently. Set to 0 to disable retries.",
        "since": "1.0.0",
        "see": ["retryRequest", "RETRY_DELAY"]
      }
    }
  ]
}
```

## Type Docstrings

Types in `types.json` can have docstrings:

```json
{
  "types": [
    {
      "id": "validation_result",
      "name": "ValidationResult",
      "type": "object",
      "exported": true,
      "docstring": {
        "summary": "Result of input validation operation",
        "description": "Contains validation status and error messages for each invalid field.",
        "examples": [
          {
            "title": "Valid result",
            "code": "{ valid: true, errors: {} }"
          },
          {
            "title": "Invalid result",
            "code": "{ valid: false, errors: { name: 'Name is required' } }"
          }
        ],
        "see": ["validateInput", "ValidationErrors"],
        "since": "1.0.0"
      },
      "properties": {
        "valid": {
          "type": "boolean",
          "required": true,
          "description": "Whether input passed validation"
        },
        "errors": {
          "type": "ValidationErrors",
          "description": "Error messages keyed by field name"
        }
      }
    }
  ]
}
```

## Generating Documentation

Docstrings can be extracted to generate:

### 1. Markdown Documentation

```markdown
# validateInput

Validates form input against a set of rules

## Description

Validates user input by checking:
- Name is not empty
- Age is between 0 and 120
- Email matches RFC 5322 format

Returns a ValidationResult with errors keyed by field name.

## Parameters

- **input** (`FormInput`) - Form data containing name, age, and email fields
- **strict** (`boolean`, optional, default: `false`) - If true, throws on validation failure instead of returning errors

## Returns

`ValidationResult` - Object with 'valid' boolean and 'errors' object containing field-specific error messages

## Examples

### Valid input
\`\`\`javascript
const result = validateInput({
  name: 'John Doe',
  age: 30,
  email: 'john@example.com'
});
// result.valid === true
// result.errors === {}
\`\`\`

### Invalid input
\`\`\`javascript
const result = validateInput({
  name: '',
  age: 200,
  email: 'not-an-email'
});
// result.valid === false
\`\`\`

## Throws

- `TypeError` - If input is not an object
- `ValidationError` - If validation fails and strict mode is enabled

## See Also

- isNotEmpty
- validateRange
- isValidEmail
- FormInput
- ValidationResult

## Version

1.2.0 (since 1.0.0)
```

### 2. TypeScript Definitions

```typescript
/**
 * Validates form input against a set of rules
 *
 * Validates user input by checking:
 * - Name is not empty
 * - Age is between 0 and 120
 * - Email matches RFC 5322 format
 *
 * @param input - Form data containing name, age, and email fields
 * @param strict - If true, throws on validation failure instead of returning errors
 * @returns Object with 'valid' boolean and 'errors' object containing field-specific error messages
 * @throws {TypeError} If input is not an object
 * @throws {ValidationError} If validation fails and strict mode is enabled
 * @since 1.0.0
 * @version 1.2.0
 * @see isNotEmpty
 * @see validateRange
 */
export function validateInput(
  input: FormInput,
  strict?: boolean
): ValidationResult;
```

### 3. Storybook Integration

Docstrings can automatically generate Storybook documentation:

```typescript
export const ValidateInputStory: Story = {
  name: 'validateInput',
  parameters: {
    docs: {
      description: {
        story: 'Validates form input against a set of rules\n\n' +
               'Validates user input by checking:\n' +
               '- Name is not empty\n' +
               '- Age is between 0 and 120'
      }
    }
  },
  argTypes: {
    input: {
      description: 'Form data containing name, age, and email fields',
      type: { name: 'object', required: true }
    },
    strict: {
      description: 'If true, throws on validation failure',
      type: { name: 'boolean', required: false },
      defaultValue: false
    }
  }
}
```

## Runtime Integration

### JavaScript/TypeScript

The script executor can expose docstrings via a metadata API:

```javascript
import { getDocstring } from './script_executor.js'

const doc = getDocstring(scriptJson, 'validateInput')
console.log(doc.summary)
console.log(doc.params)
console.log(doc.examples)
```

### Lua

```lua
local executor = require('script_executor')
local doc = executor.get_docstring(script, 'validateInput')
print(doc.summary)
```

## Best Practices

### ✅ DO

- **Write clear summaries** - One line, present tense, under 80 chars
- **Document all parameters** - Even if types are obvious
- **Provide examples** - Show common use cases and edge cases
- **Link related functions** - Use `see` to cross-reference
- **Keep descriptions current** - Update docs when code changes
- **Use proper formatting** - Newlines, bullets, code blocks

### ❌ DON'T

- **Repeat type information** - Types are already in `params`/`returnType`
- **Write obvious docs** - "Gets the name" for `getName()` is useless
- **Use jargon** - Explain acronyms and domain terms
- **Forget examples** - Code samples are worth 1000 words
- **Leave deprecated functions** - Mark with `deprecated` or remove

## Schema Validation

Docstrings should validate against JSON Schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "summary": { "type": "string", "maxLength": 200 },
    "description": { "type": "string" },
    "params": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "description"],
        "properties": {
          "name": { "type": "string" },
          "type": { "type": "string" },
          "description": { "type": "string" },
          "optional": { "type": "boolean" },
          "default": {}
        }
      }
    },
    "returns": {
      "type": "object",
      "required": ["description"],
      "properties": {
        "type": { "type": "string" },
        "description": { "type": "string" }
      }
    },
    "examples": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["title", "code"],
        "properties": {
          "title": { "type": "string" },
          "code": { "type": "string" }
        }
      }
    },
    "throws": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["type", "description"],
        "properties": {
          "type": { "type": "string" },
          "description": { "type": "string" }
        }
      }
    },
    "see": { "type": "array", "items": { "type": "string" } },
    "since": { "type": "string" },
    "deprecated": { "oneOf": [
      { "type": "boolean" },
      {
        "type": "object",
        "properties": {
          "version": { "type": "string" },
          "reason": { "type": "string" },
          "alternative": { "type": "string" }
        }
      }
    ]},
    "author": { "type": "string" },
    "version": { "type": "string" },
    "tags": { "type": "array", "items": { "type": "string" } },
    "internal": { "type": "boolean" }
  },
  "required": ["summary"]
}
```

## See Also

- [JSON Script Specification](SCRIPT_JSON_SPEC_ISSUES.md)
- [Type Definitions Guide](../../json_script_example/TYPES.md)
- [Testing Guide](../../json_script_example/tests/README.md)
