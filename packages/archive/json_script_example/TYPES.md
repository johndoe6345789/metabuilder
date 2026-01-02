# Type Definitions Guide

The `seed/types.json` file contains TypeScript-style type definitions for all data structures used in the json_script_example package.

## Purpose

- 📝 **Documentation** - Clearly defines expected data structures
- ✅ **Validation** - Can be used to validate inputs/outputs
- 🔍 **IDE Support** - Enables autocomplete and type checking
- 🔄 **Reusability** - Types can be imported by other packages

## Type Categories

### 1. Operator Results

#### `ArithmeticResult`
Result of arithmetic operations (+, -, *, /, %)

```typescript
{
  add: number,
  subtract: number,
  multiply: number,
  divide: number,
  modulo: number
}
```

#### `ComparisonResult`
Result of comparison operations (==, !=, <, >, <=, >=)

```typescript
{
  equal: boolean,
  notEqual: boolean,
  lessThan: boolean,
  greaterThan: boolean,
  lessOrEqual: boolean,
  greaterOrEqual: boolean
}
```

#### `LogicalResult`
Result of logical operations (&&, ||, !)

```typescript
{
  and: any,    // Returns last truthy or first falsy
  or: any,     // Returns first truthy or last falsy
  not: boolean // Logical negation
}
```

#### `UnaryResult`
Result of unary operations (-, +)

```typescript
{
  negate: number,  // -x
  plus: number     // +x
}
```

### 2. Demo Function Results

#### `ExpressionsDemoResult`
Return type of `all_expressions` function

```typescript
{
  sum: number,
  diff: number,
  product: number,
  max: number,
  bothPositive: boolean,
  message: string
}
```

#### `StatementsDemoResult`
Return type of `all_statements` function

```typescript
{
  count: number,
  sum: number,
  average: number,
  error: string | null
}
```

#### `DataStructuresResult`
Return type of `data_structures` function

```typescript
{
  numbers: number[],
  person: Person,
  config: AppConfig,
  extractedName: string
}
```

### 3. Data Structures

#### `Person`
Person object structure

```typescript
{
  name: string,      // required
  age: number,       // required
  email: string,     // required
  active: boolean    // required
}
```

#### `ServerConfig`
Server configuration

```typescript
{
  host: string,      // Server hostname
  port: number,      // Server port
  protocol: string   // Protocol (http/https)
}
```

#### `AppConfig`
Application configuration

```typescript
{
  server: ServerConfig,
  features: string[]  // Enabled feature flags
}
```

### 4. Test Types

#### `TestCaseInput`
Generic test case with expected result

```typescript
{
  a: number,         // First operand
  b: number,         // Second operand
  expected: any      // Expected result
}
```

#### `TestResult`
Test execution result

```typescript
{
  passed: boolean,   // required - Whether test passed
  actual: any,       // Actual result
  expected: any,     // Expected result
  error: string | null  // Error message if test failed
}
```

### 5. Validation Types

#### `ValidationErrors`
Validation error messages by field

```typescript
{
  [fieldName: string]: string  // Error message for each field
}

// Example:
{
  "name": "Name is required",
  "email": "Invalid email format",
  "age": "Age must be between 0 and 120"
}
```

#### `ValidationResult`
Result of validation operation

```typescript
{
  valid: boolean,              // required - Whether input is valid
  errors: ValidationErrors     // Validation errors if any
}
```

#### `FormInput`
Generic form input data

```typescript
{
  name: string,
  age: number,
  email: string
}
```

### 6. Enums

#### `Classification`
Value classification categories

```typescript
type Classification =
  | "negative"  // value < 0
  | "zero"      // value == 0
  | "small"     // 0 < value < 10
  | "medium"    // 10 <= value < 100
  | "large"     // value >= 100
```

## Using Types in Functions

### Declaring Return Types

In `script.json`:

```json
{
  "functions": [{
    "name": "all_operators",
    "returnType": "OperatorsDemoResult",
    "body": [...]
  }]
}
```

### Declaring Parameter Types

```json
{
  "functions": [{
    "name": "validateInput",
    "params": [
      {
        "name": "input",
        "type": "FormInput",
        "description": "Form data to validate"
      }
    ],
    "returnType": "ValidationResult",
    "body": [...]
  }]
}
```

### Using Custom Types

```json
{
  "functions": [{
    "name": "processUser",
    "params": [
      {
        "name": "person",
        "type": "Person"
      }
    ],
    "body": [
      {
        "type": "const_declaration",
        "name": "isActive",
        "value": {
          "type": "member_access",
          "object": "$ref:params.person",
          "property": "active"
        }
      }
    ]
  }]
}
```

## Importing Types

Types can be imported by other packages:

### In metadata.json

```json
{
  "dependencies": ["json_script_example"],
  "imports": {
    "types": [
      "@json_script_example/ValidationResult",
      "@json_script_example/TestResult"
    ]
  }
}
```

### In script.json

```json
{
  "functions": [{
    "name": "runCustomTest",
    "returnType": "@json_script_example/TestResult",
    "body": [...]
  }]
}
```

## Type Definition Structure

Each type in `types.json` has:

```json
{
  "id": "unique_identifier",
  "name": "TypeName",
  "type": "object | string | number | boolean | array",
  "exported": true,
  "description": "What this type represents",
  "properties": {
    "fieldName": {
      "type": "fieldType",
      "required": true,
      "description": "Field description"
    }
  }
}
```

### Field Types

- **Primitives**: `string`, `number`, `boolean`, `null`, `any`
- **Arrays**: `string[]`, `number[]`, `any[]`
- **Objects**: `ObjectTypeName`
- **Unions**: `string | null`, `number | boolean`
- **Custom**: Any type defined in this or imported packages

### Properties

- `id` - Unique identifier for the type
- `name` - TypeScript-style name (PascalCase)
- `type` - Base type (object, string, etc.)
- `exported` - Whether other packages can import this type
- `description` - What this type represents
- `properties` - Object fields (for object types)
- `enum` - Allowed values (for enum types)
- `additionalProperties` - Schema for dynamic keys

## Benefits

### Documentation
- Types serve as inline documentation
- Clear contracts for function inputs/outputs
- Easy to understand data structures

### Validation
- Runtime validation can use type definitions
- Test frameworks can validate against types
- Error messages can reference type expectations

### IDE Integration
- Autocomplete for object properties
- Type checking in editors
- Jump to definition support

### Code Generation
- Generate TypeScript interfaces from types.json
- Generate validation functions
- Generate documentation automatically

## Future Enhancements

- 🔄 **Runtime Validation** - Validate inputs against type schemas
- 📝 **Auto-Documentation** - Generate docs from types
- 🔍 **Type Checking** - Static analysis of script.json
- 🎨 **Visual Editor** - Form builders based on types
- 🔗 **Cross-Package Types** - Import types from dependencies

## See Also

- [JSON Script Specification](../../shared/seed/SCRIPT_JSON_SPEC_ISSUES.md)
- [Package README](README.md)
- [Modules Guide](MODULES.md)
