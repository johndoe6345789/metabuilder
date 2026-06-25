# Playwright Test Schema

This schema defines declarative Playwright E2E tests for MetaBuilder packages, following the data-driven architecture principle.

## Purpose

Enable packages to define end-to-end tests as JSON data rather than TypeScript code, making tests:
- **Data-driven**: Tests are configuration
- **Package-scoped**: Each package owns its test definitions
- **Auto-discoverable**: Test loaders can find all `playwright/tests.json` files
- **Schema-validated**: Tests conform to JSON schema
- **Maintainable**: Update tests without touching code

## Schema Location

- **File**: `schemas/package-schemas/playwright.schema.json`
- **$id**: `https://metabuilder.dev/schemas/package-playwright.schema.json`

## Package Structure

```
packages/{package_name}/
├── playwright/
│   ├── tests.json          # Main test definitions (required)
│   ├── metadata.json       # Test suite metadata (optional)
│   └── README.md          # Package-specific test docs (optional)
```

## Test Definition Format

```json
{
  "$schema": "https://metabuilder.dev/schemas/package-playwright.schema.json",
  "package": "ui_home",
  "version": "1.0.0",
  "description": "E2E tests for ui_home package",
  "tests": [
    {
      "name": "should load home page successfully",
      "tags": ["@smoke", "@critical"],
      "steps": [
        {
          "action": "navigate",
          "url": "/"
        },
        {
          "action": "waitForLoadState",
          "state": "domcontentloaded"
        },
        {
          "action": "expect",
          "selector": "body",
          "assertion": {
            "matcher": "toContainText",
            "expected": "MetaBuilder"
          }
        }
      ]
    }
  ]
}
```

## Supported Actions

### Navigation
- `navigate` - Navigate to URL
- `waitForNavigation` - Wait for navigation event
- `waitForLoadState` - Wait for load/domcontentloaded/networkidle

### Interactions
- `click` - Click element
- `dblclick` - Double-click element
- `fill` - Fill input field
- `type` - Type text (simulates keyboard)
- `select` - Select dropdown option
- `check` / `uncheck` - Toggle checkboxes
- `hover` - Hover over element
- `focus` - Focus element
- `press` - Press keyboard key

### Assertions
- `expect` - Make assertion with Playwright matchers

### Utilities
- `wait` - Wait for timeout
- `waitForSelector` - Wait for element
- `screenshot` - Capture screenshot
- `evaluate` - Run JavaScript in browser

## Selector Strategies

Multiple selector types supported:

```json
{
  "selector": ".hero-title"           // CSS selector
}
```

```json
{
  "role": "button",                    // ARIA role
  "text": "Get Started"
}
```

```json
{
  "text": "Build Anything"             // Text content
}
```

```json
{
  "label": "Email"                     // Form label
}
```

```json
{
  "testId": "submit-button"            // data-testid attribute
}
```

## Assertion Matchers

All Playwright expect matchers supported:

- **Visibility**: `toBeVisible`, `toBeHidden`
- **State**: `toBeEnabled`, `toBeDisabled`, `toBeChecked`, `toBeFocused`
- **Content**: `toHaveText`, `toContainText`, `toBeEmpty`
- **Values**: `toHaveValue`, `toHaveAttribute`, `toHaveClass`, `toHaveCSS`
- **Count**: `toHaveCount`
- **URL/Title**: `toHaveURL`, `toHaveTitle`
- **Comparison**: `toEqual`, `toContain`, `toBeGreaterThan`, `toBeLessThan`

Use `not: true` to negate assertions:

```json
{
  "action": "expect",
  "selector": ".error-message",
  "assertion": {
    "matcher": "toBeVisible",
    "not": true
  }
}
```

## Test Tags

Use tags to organize and filter tests:

- `@smoke` - Critical smoke tests
- `@critical` - High-priority tests
- `@ui` - UI interaction tests
- `@navigation` - Navigation tests
- `@form` - Form interaction tests
- `@crud` - Create/Read/Update/Delete tests
- `@admin` - Admin-only tests
- `@slow` - Slower-running tests

Run tests by tag:
```bash
npm run test:e2e -- --grep @smoke
npm run test:e2e -- --grep @ui
```

## Setup Hooks

Define setup/teardown at test suite level:

```json
{
  "setup": {
    "beforeAll": [
      { "action": "seed", "description": "Seed database" }
    ],
    "beforeEach": [
      { "action": "navigate", "url": "/" }
    ],
    "afterEach": [
      { "action": "screenshot", "path": "test-results/{test-name}.png" }
    ],
    "afterAll": [
      { "action": "custom", "script": "cleanup" }
    ]
  }
}
```

## Fixtures

Define reusable test data:

```json
{
  "fixtures": {
    "testUser": {
      "username": "testuser",
      "email": "test@example.com",
      "password": "test123"
    },
    "heroTitle": "Build Anything, Visually"
  }
}
```

Reference fixtures in tests:
```json
{
  "action": "fill",
  "selector": "input[name='username']",
  "value": "{{fixtures.testUser.username}}"
}
```

## Test Configuration

Per-test configuration:

```json
{
  "name": "slow integration test",
  "timeout": 30000,           // 30 second timeout
  "retries": 2,               // Retry twice on failure
  "skip": false,              // Skip this test
  "only": false               // Run only this test
}
```

## Example: Complete Test Suite

See `packages/ui_home/playwright/tests.json` for a complete example with:
- 8 declarative tests
- Multiple selector strategies
- Various assertion types
- Smoke, UI, and interaction tests
- Navigation and form testing

## Future Enhancements

1. **Test Generator**: Auto-generate `.spec.ts` from `tests.json`
2. **Visual Regression**: Screenshot comparison tests
3. **Performance**: Lighthouse/web vitals assertions
4. **Accessibility**: WCAG/ARIA validation
5. **API Mocking**: Declarative API mock definitions
6. **Cross-browser**: Multi-browser matrix from single JSON

## Related Schemas

- `storybook_schema.json` - Storybook story definitions
- `tests_schema.json` - Unit test definitions
- `component.schema.json` - Component definitions

## Validation

Validate test files:
```bash
cd schemas/package-schemas
./schema_validator.sh playwright.schema.json ../../packages/ui_home/playwright/tests.json
```

## Benefits of Data-Driven Tests

1. **95% Configuration Rule**: Tests are data, not code
2. **Package Ownership**: Each package defines its own tests
3. **Schema Validation**: Catch errors before runtime
4. **Auto-Discovery**: Test runners can find all package tests
5. **Consistency**: Same structure across all packages
6. **Maintainability**: Change tests without TypeScript knowledge
7. **Meta Architecture**: Tests themselves are abstract/declarative
