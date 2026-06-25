# System Critical Flows Package

**Purpose**: System-wide end-to-end tests proving all essential MetaBuilder functionality works.

## Overview

This package contains 24 critical user flow tests organized into 10 categories:

- **Flow 1**: Public discovery & login (3 tests)
- **Flow 2**: Authentication & session management (4 tests)
- **Flow 3**: User dashboard (3 tests)
- **Flow 4**: Admin user management (3 tests)
- **Flow 5**: Package management (3 tests)
- **Flow 6**: Navigation & discovery (3 tests)
- **Flow 7**: Error handling (2 tests)
- **Total**: 24 tests

## Test Organization

```
packages/system_critical_flows/
├── package.json              ← Package metadata
├── README.md                 ← This file
└── playwright/
    ├── metadata.json         ← Test entity metadata
    ├── tests.json            ← Declarative JSON test definitions (24 tests)
    └── README.md             ← Playwright tests documentation
```

## Running Tests

All tests are declarative JSON and executed by the unified test runner:

```bash
# Run all critical flows
npm run test:e2e

# Run only smoke tests
npm run test:e2e -- --grep "@smoke"

# Run only critical tests
npm run test:e2e -- --grep "@critical"

# Run specific flow category
npm run test:e2e -- --grep "Flow 2"
```

## Test Tags

Tests are tagged for filtering:

- `@smoke` - Quick sanity tests
- `@critical` - Business-critical flows
- `@public` - Public (unauthenticated) flows
- `@auth` - Authentication tests
- `@user` - Authenticated user flows
- `@admin` - Admin-only flows
- `@packages` - Package management tests
- `@navigation` - Navigation flows
- `@error-handling` - Error scenarios
- `@performance` - Performance tests
- `@responsive` - Mobile/responsive tests
- `@validation` - Input validation tests

## Test Format

All tests follow `playwright.schema.json` declarative format:

```json
{
  "name": "Test name",
  "tags": ["@smoke", "@critical"],
  "description": "What this test validates",
  "timeout": 10000,
  "steps": [
    {
      "action": "navigate|click|fill|expect|etc",
      "url": "...",
      "selector": "...",
      "assertion": { "matcher": "toBeVisible", "expected": "..." }
    }
  ]
}
```

## Actions Supported

- Navigation: `navigate`, `waitForNavigation`, `waitForLoadState`
- Interaction: `click`, `fill`, `select`, `hover`, `focus`, `press`, `dblclick`
- Assertion: `expect` (with matchers)
- Evaluation: `evaluate` (custom JavaScript)
- Advanced: `screenshot`, `wait`, custom

## Assertions Supported

- Visibility: `toBeVisible`, `toBeHidden`, `toBeEmpty`
- State: `toBeEnabled`, `toBeDisabled`, `toBeChecked`, `toBeFocused`
- Content: `toHaveText`, `toContainText`, `toHaveValue`
- DOM: `toHaveAttribute`, `toHaveClass`, `toHaveCSS`
- URL/Title: `toHaveURL`, `toHaveTitle`, `toHaveCount`
- Comparison: `toEqual`, `toContain`, `toBeGreaterThan`, `toBeLessThan`

## Fixtures

Test-specific data:

```json
{
  "testUser": {
    "email": "testuser@metabuilder.dev",
    "password": "TestPassword123!"
  },
  "adminUser": {
    "email": "admin@metabuilder.dev",
    "password": "AdminPassword123!"
  }
}
```

## Adding New Tests

1. Edit `playwright/tests.json`
2. Add test object to `tests` array
3. Use existing patterns as templates
4. Add appropriate tags
5. Tests auto-discover on next run

## Integration with Unified Runner

The unified test runner (`e2e/test-runner/`) automatically:

1. Discovers this package's `playwright/tests.json`
2. Routes to Playwright JSON runner
3. Executes with `global.setup.ts` (database seeding)
4. Reports results

## Reference

- **Schema**: `schemas/package-schemas/playwright.schema.json`
- **Runner**: `e2e/test-runner/`
- **Executor**: `e2e/json-runner/`
- **Setup**: `e2e/global.setup.ts`

## Architecture Alignment

✓ 100% declarative JSON (no hardcoded code)
✓ Follows unified test infrastructure pattern
✓ Tests as data, not code
✓ Integrated with unified runner
✓ 95% config, 5% code principle
