# Test Schema Examples

This directory contains comprehensive examples of MetaBuilder's test schemas for parameterized unit testing.

## Overview

MetaBuilder provides two schemas for defining tests:

1. **[test-parameters_schema.json](../../test-parameters_schema.json)** - Defines reusable parameter sets for tests
2. **[tests_schema.json](../../tests_schema.json)** - Defines test suites, cases, and assertions

## Files in This Directory

### Parameter Files

- **[basic-params.json](basic-params.json)** - Simple parameter examples
  - Addition test parameters
  - String validation parameters
  - Edge case parameters

### Test Files

- **[comprehensive.test.json](comprehensive.test.json)** - Complete feature demonstration
  - All assertion types
  - Mock configurations
  - Inline parameterized tests
  - Setup/teardown hooks
  - Skip, only, and retry features

## Quick Start

### 1. Simple Inline Parameterized Test

```json
{
  "$schema": "https://metabuilder.dev/schemas/tests.schema.json",
  "schemaVersion": "2.0.0",
  "package": "my-package",
  "testSuites": [
    {
      "id": "math-tests",
      "name": "Math Tests",
      "tests": [
        {
          "id": "test-add",
          "name": "should add numbers",
          "parameterized": true,
          "parameters": [
            { "case": "2+3", "input": {"a": 2, "b": 3}, "expected": 5 },
            { "case": "5+5", "input": {"a": 5, "b": 5}, "expected": 10 }
          ],
          "act": {
            "type": "function_call",
            "target": "add",
            "input": "{{input}}"
          },
          "assert": {
            "expectations": [
              {
                "type": "equals",
                "actual": "result",
                "expected": "{{expected}}"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### 2. External Parameter Set

**parameters.json:**
```json
{
  "$schema": "https://metabuilder.dev/schemas/test-parameters.schema.json",
  "schemaVersion": "2.0.0",
  "package": "my-package",
  "parameters": [
    {
      "id": "email-params",
      "name": "Email Validation Parameters",
      "params": {
        "email": { "type": "string" },
        "expected": { "type": "boolean" }
      }
    }
  ]
}
```

**test.json:**
```json
{
  "tests": [
    {
      "id": "test-emails",
      "name": "should validate emails",
      "parameterized": true,
      "parameters": "email-params",
      "act": {
        "type": "function_call",
        "target": "validateEmail",
        "input": "{{email}}"
      },
      "assert": {
        "expectations": [
          {
            "type": "equals",
            "actual": "result",
            "expected": "{{expected}}"
          }
        ]
      }
    }
  ]
}
```

## Test Structure

### Arrange-Act-Assert Pattern

Tests follow the AAA pattern:

```json
{
  "id": "test-user-creation",
  "name": "should create user",
  "arrange": {
    "given": "valid user data",
    "fixtures": {
      "userData": { "name": "John", "email": "john@example.com" }
    },
    "mocks": [
      {
        "target": "database.save",
        "behavior": { "returnValue": { "id": "user-123" } }
      }
    ]
  },
  "act": {
    "when": "creating the user",
    "type": "function_call",
    "target": "createUser",
    "input": "{{userData}}"
  },
  "assert": {
    "then": "user should be created with ID",
    "expectations": [
      {
        "type": "hasProperty",
        "actual": "result",
        "expected": "id"
      }
    ]
  }
}
```

## Assertion Types

All available assertion types:

| Type | Description | Example |
|------|-------------|---------|
| `equals` | Basic equality | `actual: "result", expected: 5` |
| `deepEquals` | Deep object equality | Compare objects/arrays |
| `strictEquals` | Strict equality (===) | Type + value check |
| `notEquals` | Not equal | Value should differ |
| `greaterThan` | Numeric comparison | `actual > expected` |
| `lessThan` | Numeric comparison | `actual < expected` |
| `greaterThanOrEqual` | Numeric comparison | `actual >= expected` |
| `lessThanOrEqual` | Numeric comparison | `actual <= expected` |
| `contains` | String/array contains | Check substring/element |
| `matches` | Regex pattern | String pattern matching |
| `throws` | Error thrown | Function throws error |
| `notThrows` | No error | Function doesn't throw |
| `truthy` | Truthy value | `!!value === true` |
| `falsy` | Falsy value | `!!value === false` |
| `null` | Is null | `value === null` |
| `notNull` | Not null | `value !== null` |
| `undefined` | Is undefined | `value === undefined` |
| `notUndefined` | Not undefined | `value !== undefined` |
| `instanceOf` | Type check | `value instanceof Type` |
| `hasProperty` | Object property | Object has property |
| `hasLength` | Array/string length | Check length |
| `custom` | Custom assertion | Custom logic |

### Negated Assertions

Any assertion can be negated:

```json
{
  "type": "null",
  "actual": "result",
  "negate": true,
  "description": "Should not be null"
}
```

## Mocking

### Return Value Mock

```json
{
  "target": "api.fetch",
  "type": "function",
  "behavior": {
    "returnValue": { "data": "mock data" }
  }
}
```

### Throw Error Mock

```json
{
  "target": "api.fetch",
  "type": "function",
  "behavior": {
    "throwError": "Network timeout"
  }
}
```

### Sequential Calls Mock

```json
{
  "target": "random.next",
  "type": "function",
  "behavior": {
    "calls": [1, 2, 3, 4, 5]
  }
}
```

## Setup and Teardown

### Global Setup

```json
{
  "setup": {
    "beforeAll": [
      { "type": "database", "config": { "action": "reset" } }
    ],
    "beforeEach": [
      { "type": "cleanup", "config": { "tables": ["users"] } }
    ],
    "afterEach": [
      { "type": "cleanup" }
    ],
    "afterAll": [
      { "type": "cleanup", "config": { "action": "disconnect" } }
    ]
  }
}
```

### Suite-Level Setup

```json
{
  "testSuites": [
    {
      "id": "my-suite",
      "setup": {
        "beforeAll": [
          { "type": "fixture", "config": { "load": "test-data" } }
        ]
      }
    }
  ]
}
```

## Test Control

### Skip Tests

```json
{
  "id": "wip-test",
  "name": "Work in progress",
  "skip": true
}
```

### Only Run Specific Tests

```json
{
  "id": "focus-test",
  "name": "Run only this test",
  "only": true
}
```

### Retry Flaky Tests

```json
{
  "id": "flaky-test",
  "name": "Sometimes fails",
  "retry": 3
}
```

### Custom Timeout

```json
{
  "id": "slow-test",
  "name": "Takes a while",
  "timeout": 30000
}
```

## Parameterized Tests

### Inline Parameters

```json
{
  "parameterized": true,
  "parameters": [
    { "case": "test 1", "input": "a", "expected": "A" },
    { "case": "test 2", "input": "b", "expected": "B" }
  ]
}
```

### External Parameters

```json
{
  "parameterized": true,
  "parameters": "my-parameter-set-id"
}
```

### Parameter Fixtures

```json
{
  "parameters": [
    {
      "id": "user-params",
      "params": {
        "userData": { "type": "object" }
      },
      "fixtures": {
        "validUser": {
          "name": "John",
          "email": "john@example.com"
        }
      }
    }
  ]
}
```

## BDD-Style Tests

```json
{
  "id": "bdd-test",
  "name": "User can update profile",
  "arrange": {
    "given": "a logged-in user with existing profile data"
  },
  "act": {
    "when": "the user updates their profile information"
  },
  "assert": {
    "then": "the profile should be updated successfully"
  }
}
```

## Tags and Filtering

```json
{
  "testSuites": [
    {
      "id": "integration-tests",
      "tags": ["integration", "database", "slow"],
      "tests": [
        {
          "id": "test-1",
          "tags": ["auth", "critical"]
        }
      ]
    }
  ]
}
```

## Parameter Generators

```json
{
  "params": {
    "randomEmail": {
      "type": "string",
      "generator": {
        "type": "faker",
        "config": { "method": "internet.email" }
      }
    },
    "randomAge": {
      "type": "integer",
      "generator": {
        "type": "random",
        "config": { "min": 18, "max": 65 }
      }
    },
    "sequentialId": {
      "type": "integer",
      "generator": {
        "type": "sequential",
        "config": { "start": 1, "step": 1 }
      }
    }
  }
}
```

## Complete Examples

See the example files in this directory and the complete-package examples:

- [complete-package/tests/user.test.json](../complete-package/tests/user.test.json) - Full user management tests
- [complete-package/tests/validation.test.json](../complete-package/tests/validation.test.json) - Parameterized validation tests
- [complete-package/tests/validation.params.json](../complete-package/tests/validation.params.json) - Validation parameter sets
- [minimal-package/tests/simple.test.json](../minimal-package/tests/simple.test.json) - Minimal examples

## Storybook Integration

Tests can be visualized in Storybook! See:

- [complete-package/tests/storybook.json](../complete-package/tests/storybook.json) - Test visualization stories

## Best Practices

1. **Use descriptive test names** - Make it clear what's being tested
2. **Group related tests** - Use test suites to organize tests
3. **Use tags** - Enable filtering and selective execution
4. **Leverage parameterization** - Reduce duplication for similar test cases
5. **Use BDD style** - Make tests readable with given/when/then
6. **Mock external dependencies** - Keep tests fast and isolated
7. **Use fixtures** - Share common test data
8. **Set appropriate timeouts** - Allow enough time but fail fast
9. **Use setup/teardown** - Keep tests isolated and clean

## Schema Validation

Validate your test files:

```bash
jsonschema-cli ../../tests_schema.json your-test.json
jsonschema-cli ../../test-parameters_schema.json your-params.json
```

## Contributing

When adding new test examples:
1. Follow the existing structure
2. Add comments for clarity
3. Include both positive and negative test cases
4. Demonstrate edge cases
5. Keep examples realistic and practical

---

**Last Updated:** 2026-01-02
**Schema Version:** 2.0.0

🤖 Generated with [Claude Code](https://claude.com/claude-code)
