# Comprehensive JSON Test Example Package

This package demonstrates all JSON test patterns and best practices for the MetaBuilder declarative testing system.

## Purpose

This example package serves as a **complete reference** for writing tests in JSON format instead of TypeScript. It shows:

- All supported assertion types (29 different types)
- All act phase actions (function calls, rendering, DOM interactions)
- Fixture usage and interpolation
- Mock setup patterns
- Multi-assertion tests
- Error handling patterns
- Component rendering and DOM testing
- Tag-based test organization

## Package Structure

```
test_example_comprehensive/
├── package.json                    Package metadata
└── unit-tests/
    └── tests.json                  Comprehensive test suite (10 suites, 40+ tests)
```

## Test Organization

The comprehensive test suite includes 10 test suites covering:

### 1. Email Validation (3 tests)
Tests the `validateEmail()` utility with valid emails, invalid emails, and empty strings.
- **Patterns**: Basic function calls, fixture usage, truthy/falsy assertions

### 2. Password Security (3 tests)
Tests password hashing with success case, consistency verification, and error handling.
- **Patterns**: Complex function calls, error throwing, mock setup

### 3. Token Generation (2 tests)
Tests JWT token generation and format validation.
- **Patterns**: Mock functions, regex matching, token verification

### 4. JSON Parsing (3 tests)
Tests JSON parsing for objects, arrays, and error cases.
- **Patterns**: Deep equality checks, array handling, error cases

### 5. Numeric Comparisons (3 tests)
Tests all numeric comparison assertion types.
- **Patterns**: Greater than, less than, greater-than-or-equal, less-than-or-equal

### 6. Null/Undefined Checks (4 tests)
Tests null detection, undefined detection, not-null, and defined assertions.
- **Patterns**: Null value assertions, property access on missing values

### 7. Collections (3 tests)
Tests array and object property checking.
- **Patterns**: Has property, array length, array contains

### 8. Component Rendering (3 tests)
Tests React component rendering and DOM interactions.
- **Patterns**: Component rendering, DOM queries, button click events, disabled states

### 9. Error Handling (2 tests)
Tests error throwing and non-throwing assertions.
- **Patterns**: Error boundaries, exception handling

### 10. Mixed Assertions (1 test)
Comprehensive test combining multiple assertion types.
- **Patterns**: Multiple expectations in single test, complex object validation

## JSON Test Format

### Basic Structure

```json
{
  "$schema": "https://metabuilder.dev/schemas/tests.schema.json",
  "schemaVersion": "2.0.0",
  "package": "test_example_comprehensive",
  "imports": [
    {
      "from": "@/lib/utils",
      "import": ["validateEmail"]
    }
  ],
  "testSuites": [
    {
      "id": "suite_validation",
      "name": "Email Validation",
      "tags": ["@utils", "@validation"],
      "tests": [
        {
          "id": "test_valid_email",
          "name": "should accept valid email addresses",
          "arrange": { "fixtures": { "email": "user@example.com" } },
          "act": {
            "type": "function_call",
            "target": "validateEmail",
            "input": "$arrange.fixtures.email"
          },
          "assert": {
            "expectations": [
              {
                "type": "truthy",
                "actual": "result",
                "message": "Should return true"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

## Supported Features

### Arrange Phase (Setup)
```json
"arrange": {
  "fixtures": {
    "email": "test@example.com",
    "password": "SecurePass123"
  },
  "mocks": [
    {
      "target": "generateToken",
      "behavior": {
        "returnValue": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  ]
}
```

### Act Phase (Execution)

**Function Calls:**
```json
"act": {
  "type": "function_call",
  "target": "validateEmail",
  "input": "$arrange.fixtures.email"
}
```

**Component Rendering:**
```json
"act": {
  "type": "render",
  "component": "Button",
  "props": {
    "label": "Click Me",
    "variant": "primary"
  }
}
```

**DOM Interactions:**
```json
"act": {
  "type": "click",
  "selector": "button",
  "role": "button"
}
```

Other actions: `fill`, `select`, `hover`, `focus`, `blur`, `waitFor`

### Assert Phase (Verification)

**Basic Assertions:**
- `equals` - Strict equality
- `deepEquals` - Deep object equality
- `truthy` / `falsy` - Truthiness checks
- `notEquals` - Inequality

**Numeric Assertions:**
- `greaterThan`, `lessThan`, `greaterThanOrEqual`, `lessThanOrEqual`

**Type Assertions:**
- `null`, `notNull`, `undefined`, `notUndefined`, `instanceOf`

**Collection Assertions:**
- `contains`, `matches`, `hasProperty`, `hasLength`

**DOM Assertions:**
- `toBeVisible`, `toBeInTheDocument`, `toHaveTextContent`, `toHaveAttribute`, `toHaveClass`, `toBeDisabled`, `toBeEnabled`, `toHaveValue`

**Control Flow:**
- `throws`, `notThrows`, `custom`

## Fixture Interpolation

Use `$arrange.fixtures.key` syntax to reference fixtures in act and assert phases:

```json
{
  "arrange": {
    "fixtures": {
      "email": "user@example.com"
    }
  },
  "act": {
    "type": "function_call",
    "target": "validateEmail",
    "input": "$arrange.fixtures.email"  // ← Interpolated
  }
}
```

## Comprehensive Example: Multiple Assertions

```json
{
  "id": "test_user_validation",
  "name": "should validate user object completely",
  "arrange": {
    "fixtures": {
      "user": {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com",
        "roles": ["admin", "user"],
        "active": true,
        "age": 30
      }
    }
  },
  "act": {
    "type": "function_call",
    "target": "parseJSON",
    "input": "$arrange.fixtures.user"
  },
  "assert": {
    "expectations": [
      {
        "type": "truthy",
        "actual": "$arrange.fixtures.user",
        "message": "User should be truthy"
      },
      {
        "type": "hasProperty",
        "actual": "$arrange.fixtures.user",
        "expected": "email",
        "message": "User should have email"
      },
      {
        "type": "equals",
        "actual": "$arrange.fixtures.user.name",
        "expected": "John Doe",
        "message": "Name should match"
      },
      {
        "type": "hasLength",
        "actual": "$arrange.fixtures.user.roles",
        "expected": 2,
        "message": "Should have 2 roles"
      },
      {
        "type": "greaterThan",
        "actual": "$arrange.fixtures.user.age",
        "expected": 18,
        "message": "Age should be > 18"
      }
    ]
  }
}
```

## Running Tests

### Validate JSON Against Schema
```bash
npm --prefix scripts/migrate-tests run validate packages/test_example_comprehensive
```

### Run with Unified Test Runner
```bash
npm run test:unified
```

### Discover Tests
```bash
import { UnifiedTestRunner } from '@/e2e/test-runner'

const runner = new UnifiedTestRunner()
const tests = await runner.discoverTests()
console.log(tests.unit)  // Includes test_example_comprehensive
```

## Best Practices

### 1. Use Descriptive Test Names
```json
"name": "should validate user email format and reject invalid formats"
```

### 2. Use Fixtures for Repeated Values
```json
"arrange": {
  "fixtures": {
    "validEmail": "user@example.com",
    "invalidEmail": "invalid@"
  }
}
```

### 3. Multiple Assertions in Complex Cases
```json
"assert": {
  "expectations": [
    { "type": "truthy", "actual": "result" },
    { "type": "hasLength", "actual": "result", "expected": 20 },
    { "type": "contains", "actual": "result", "expected": "$" }
  ]
}
```

### 4. Use Tags for Organization
```json
"tags": ["@smoke", "@critical", "@regression"]
```

### 5. Add Timeout for Slow Tests
```json
"timeout": 10000
```

### 6. Include Setup/Teardown Hooks
```json
"setup": {
  "beforeEach": [{ "type": "initialize" }],
  "afterEach": [{ "type": "cleanup" }]
}
```

## Common Patterns

### Testing a Utility Function
```json
{
  "arrange": { "fixtures": { "input": "test@example.com" } },
  "act": {
    "type": "function_call",
    "target": "validateEmail",
    "input": "$arrange.fixtures.input"
  },
  "assert": {
    "expectations": [
      { "type": "truthy", "actual": "result" }
    ]
  }
}
```

### Testing Error Handling
```json
{
  "arrange": { "fixtures": { "input": null } },
  "act": {
    "type": "function_call",
    "target": "validateEmail",
    "input": "$arrange.fixtures.input"
  },
  "assert": {
    "expectations": [
      { "type": "throws", "actual": "result" }
    ]
  }
}
```

### Testing React Components
```json
{
  "act": {
    "type": "render",
    "component": "Button",
    "props": { "label": "Click Me" }
  },
  "assert": {
    "expectations": [
      { "type": "toBeInTheDocument", "selector": "button" },
      { "type": "toHaveTextContent", "selector": "button", "expected": "Click Me" }
    ]
  }
}
```

### Testing User Interactions
```json
{
  "act": { "type": "click", "selector": "button" },
  "assert": {
    "expectations": [
      { "type": "toBeInTheDocument", "selector": "button" }
    ]
  }
}
```

## Files

- `package.json` - Package metadata (packageId: test_example_comprehensive)
- `unit-tests/tests.json` - 10 comprehensive test suites (40+ tests demonstrating all patterns)
- `README.md` - This file

## Integration

This package is automatically discovered by the Unified Test Runner:

```typescript
import { UnifiedTestRunner } from '@/e2e/test-runner'

const runner = new UnifiedTestRunner()
await runner.discoverTests()  // Finds all 40+ tests
```

## Learning Resources

For detailed information about JSON test format and patterns:

- `schemas/package-schemas/tests_schema.json` - Complete schema definition
- `scripts/migrate-tests/README.md` - Migration tooling documentation
- `e2e/test-runner/README.md` - Unified test runner documentation
- `/AGENTS.md` - Testing best practices and patterns

## Next Steps

1. **Learn** from this package's patterns
2. **Create** similar packages with your own test suites
3. **Migrate** existing TypeScript tests using migration tooling
4. **Validate** your tests against the schema
5. **Execute** tests with the unified test runner

This is a **living example** - refer to it when writing new declarative tests!
