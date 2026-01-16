# E2E Test Generators

This folder contains tools for generating Playwright tests from declarative JSON definitions in packages.

## Structure

```
e2e/
├── generators/
│   ├── playwright-generator.ts    # Core generator logic
│   └── generate.ts                # CLI script
├── generated/                     # Generated .spec.ts files (gitignored)
├── smoke.spec.ts                  # Manual smoke tests
└── *.config.ts                    # Playwright configurations
```

## Usage

### Generate All Package Tests

```bash
# From project root
npm run test:generate

# Or with watch mode
npm run test:generate:watch
```

### Generate Specific Package Tests

```bash
npm run test:generate ui_home
```

### Run Generated Tests

```bash
npm run test:e2e -- e2e/generated/ui_home.spec.ts
```

## How It Works

1. **Discovery**: Scans `packages/*/playwright/tests.json` files
2. **Parsing**: Reads JSON test definitions
3. **Generation**: Converts to TypeScript `.spec.ts` files
4. **Output**: Writes to `e2e/generated/`

## Package Test Definitions

Packages define tests in `playwright/tests.json`:

```json
{
  "$schema": "https://metabuilder.dev/schemas/package-playwright.schema.json",
  "package": "ui_home",
  "tests": [
    {
      "name": "should load home page",
      "steps": [
        { "action": "navigate", "url": "/" },
        { 
          "action": "expect",
          "selector": "body",
          "assertion": { "matcher": "toBeVisible" }
        }
      ]
    }
  ]
}
```

## Generated Output Example

```typescript
/**
 * Auto-generated Playwright tests for ui_home package
 * Generated from: packages/ui_home/playwright/tests.json
 * DO NOT EDIT - This file is auto-generated
 */

import { test, expect } from '@playwright/test'

test.describe('ui_home Package Tests', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })
})
```

## Benefits

- **Data-Driven**: Tests are JSON configuration, not code
- **Package-Scoped**: Each package owns its test definitions
- **Auto-Generated**: No manual TypeScript test writing
- **Schema-Validated**: Tests conform to JSON schema
- **Meta Architecture**: Tests themselves are declarative

## See Also

- `schemas/package-schemas/playwright.schema.json` - JSON Schema
- `schemas/package-schemas/PLAYWRIGHT_SCHEMA_README.md` - Schema docs
- `packages/*/playwright/` - Package test definitions
