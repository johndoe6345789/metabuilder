# Unified Test Runner

A JSON interpreter-based test runner that coordinates all test types across MetaBuilder:

- **Unit Tests** (JSON) - Discover and run from `packages/*/unit-tests/tests.json`
- **E2E Tests** (Playwright JSON) - Discover from `packages/*/playwright/tests.json`
- **Storybook Stories** (JSON) - Discover and validate from `packages/*/storybook/stories.json`

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Unified Test Runner                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Discovery Phase                                     │
│     ├─ Scan packages/*/unit-tests/tests.json           │
│     ├─ Scan packages/*/playwright/tests.json           │
│     └─ Scan packages/*/storybook/stories.json          │
│                                                         │
│  2. Registration Phase                                  │
│     ├─ JSON Test Interpreter (unit tests)              │
│     ├─ E2E Test Coordinator (playwright)               │
│     └─ Story Validator (storybook)                     │
│                                                         │
│  3. Execution Phase                                     │
│     ├─ Vitest (unit tests)                             │
│     ├─ Playwright (E2E tests)                          │
│     └─ Storybook Build (stories)                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Usage

### Register and Run All Tests

```typescript
import { runTests } from '@/e2e/test-runner';

await runTests();
```

### With Configuration

```typescript
await runTests({
  verbose: true,
  packages: ['ui_home', 'ui_auth'],  // Filter by package
  tags: ['@smoke', '@critical'],      // Filter by tags
});
```

### Get Statistics

```typescript
import { UnifiedTestRunner } from '@/e2e/test-runner';

const runner = new UnifiedTestRunner();
const stats = await runner.getStatistics();

console.log(`Total test files: ${stats.totalFiles}`);
console.log(`Unit tests: ${stats.unitTests}`);
console.log(`E2E tests: ${stats.e2eTests}`);
console.log(`Storybook stories: ${stats.storybookStories}`);
```

## JSON Test Interpreter

The `JSONTestInterpreter` class converts JSON test definitions to Vitest test suites at runtime:

```typescript
import { JSONTestInterpreter } from '@/e2e/test-runner/json-interpreter';

const interpreter = new JSONTestInterpreter();

// Load imports
await interpreter.loadImports([
  { from: '@/components/Button', import: ['Button'] },
  { from: '@testing-library/react', import: ['render'] }
]);

// Register test suite
interpreter.registerTestSuite(jsonTestDefinition);
```

## Supported Actions (Act Phase)

- `function_call` - Call a function with fixtures
- `render` - Render React component (requires Testing Library setup)
- `click` - Simulate click event
- `fill` - Fill form input
- `select` - Select dropdown option
- `hover` - Hover over element
- `focus` - Focus on element
- `blur` - Blur from element
- `waitFor` - Wait for condition

## Supported Assertions

### Basic Assertions
- `equals` - Strict equality (===)
- `deepEquals` - Deep object equality
- `notEquals` - Inequality
- `truthy` / `falsy` - Truthiness checks

### Numeric Assertions
- `greaterThan` - > comparison
- `lessThan` - < comparison
- `greaterThanOrEqual` - >= comparison
- `lessThanOrEqual` - <= comparison

### Type Assertions
- `null` / `notNull` - Null checks
- `undefined` / `notUndefined` - Undefined checks
- `instanceOf` - Instance checking

### String/Collection Assertions
- `contains` - String/array contains
- `matches` - Regex matching
- `hasProperty` - Property exists
- `hasLength` - Collection length

### DOM Assertions (React Testing Library)
- `toBeVisible` - Element visible
- `toBeInTheDocument` - Element in DOM
- `toHaveTextContent` - Element text match
- `toHaveAttribute` - Element attribute
- `toHaveClass` - Element CSS class
- `toBeDisabled` / `toBeEnabled` - Disabled state
- `toHaveValue` - Input value

### Control Flow
- `throws` / `notThrows` - Exception handling
- `custom` - Custom assertion logic

## Example: Unit Test in JSON

```json
{
  "$schema": "https://metabuilder.dev/schemas/tests.schema.json",
  "schemaVersion": "2.0.0",
  "package": "example_package",
  "imports": [
    { "from": "@/lib/utils", "import": ["validateEmail"] }
  ],
  "testSuites": [
    {
      "id": "suite_validate",
      "name": "Email Validation",
      "tests": [
        {
          "id": "test_valid_email",
          "name": "should accept valid email",
          "arrange": {
            "fixtures": { "email": "user@example.com" }
          },
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
                "message": "Should return true for valid email"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

## Configuration

Place JSON test files in package directories:

```
packages/
├── my_package/
│   ├── unit-tests/
│   │   └── tests.json          ← Unit tests (new)
│   ├── playwright/
│   │   └── tests.json          ← E2E tests (existing)
│   └── storybook/
│       └── stories.json        ← Component stories (existing)
```

## Implementation Notes

- **Minimal Dependencies**: JSONTestInterpreter only depends on Vitest core
- **Progressive Enhancement**: DOM actions (click, render, etc.) warn if browser context missing
- **Fixture Interpolation**: Use `$arrange.fixtures.key` to reference fixture values
- **Mock Support**: Integrated with Vitest's `vi.fn()` for mocking

## Files

- `index.ts` - Main runner and orchestrator
- `json-interpreter.ts` - JSON → Vitest converter
- `types.ts` - TypeScript type definitions
- `README.md` - This file
