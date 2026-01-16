# JSON Playwright Test Runner

**No code generation - tests are interpreted directly from JSON at runtime.**

This is the true meta/abstract approach: the JSON itself is executable, not just a template for code generation.

## Philosophy

Instead of generating `.spec.ts` files from JSON, we **directly execute** the JSON test definitions. This keeps tests as pure data that's interpreted at runtime, staying true to the 95% configuration rule.

## How It Works

1. **Discovery**: Scans `packages/*/playwright/tests.json` files
2. **Loading**: Reads JSON test definitions at runtime  
3. **Interpretation**: Executes test steps directly from JSON
4. **No Intermediate**: No code generation step - JSON → Execution

## Usage

### Run JSON-Defined Package Tests

```bash
# Run all JSON-defined package tests
npm run test:e2e:json

# Or run directly
npm run test:e2e -- e2e/json-packages.spec.ts

# With UI mode
npm run test:e2e:ui -- e2e/json-packages.spec.ts
```

### How Tests Are Loaded

The `json-packages.spec.ts` file automatically discovers and loads all tests:

```typescript
import { loadAllPackageTests } from './json-runner/playwright-json-runner'

// Discovers packages/*/playwright/tests.json and registers tests
await loadAllPackageTests(packagesDir, test)
```

## Example: JSON Test Definition

`packages/ui_home/playwright/tests.json`:

```json
{
  "$schema": "https://metabuilder.dev/schemas/package-playwright.schema.json",
  "package": "ui_home",
  "tests": [{
    "name": "should display hero section",
    "tags": ["@smoke", "@ui"],
    "steps": [
      {
        "description": "Navigate to home page",
        "action": "navigate",
        "url": "/"
      },
      {
        "description": "Wait for page load",
        "action": "waitForLoadState",
        "state": "domcontentloaded"
      },
      {
        "description": "Verify hero title visible",
        "action": "expect",
        "selector": ".hero-title",
        "assertion": {
          "matcher": "toBeVisible"
        }
      }
    ]
  }]
}
```

**Executed directly - no intermediate code generation!**

## Supported Actions

- **Navigation**: `navigate`, `waitForNavigation`, `waitForLoadState`
- **Interactions**: `click`, `dblclick`, `fill`, `type`, `select`, `check`, `uncheck`, `hover`, `focus`, `press`
- **Assertions**: `expect` with all Playwright matchers
- **Utilities**: `wait`, `waitForSelector`, `screenshot`, `evaluate`

## Supported Selectors

- `selector` - CSS selector
- `role` - ARIA role with optional text
- `text` - Text content
- `label` - Form label
- `placeholder` - Input placeholder
- `testId` - data-testid attribute

## Supported Assertion Matchers

All standard Playwright matchers:
- Visibility: `toBeVisible`, `toBeHidden`
- State: `toBeEnabled`, `toBeDisabled`, `toBeChecked`, `toBeFocused`, `toBeEmpty`
- Content: `toHaveText`, `toContainText`, `toHaveValue`
- Count: `toHaveCount`
- Attributes: `toHaveAttribute`, `toHaveClass`, `toHaveCSS`
- Page: `toHaveURL`, `toHaveTitle`

## Benefits of JSON Execution

1. **True Meta Architecture**: Tests are data, not code
2. **No Build Step**: JSON is directly executable
3. **Runtime Interpretation**: Changes take effect immediately
4. **Single Source of Truth**: JSON is the only definition
5. **Package Ownership**: Each package owns its test data
6. **Schema Validated**: Tests conform to JSON schema

## File Structure

```
e2e/
├── json-runner/
│   └── playwright-json-runner.ts    # JSON test interpreter
├── json-packages.spec.ts            # Auto-loads all package tests
└── smoke.spec.ts                    # Manual smoke tests
```

## vs Code Generation

| Approach | Source of Truth | Runtime | Changes |
|----------|----------------|---------|---------|
| **Code Generation** | JSON → Generate `.spec.ts` | Executes TypeScript | Requires regeneration |
| **JSON Execution** ✅ | JSON (only) | Interprets JSON | Immediate effect |

JSON execution is more meta/abstract - the configuration itself is executable!

## See Also

- `schemas/package-schemas/playwright.schema.json` - JSON Schema
- `schemas/package-schemas/PLAYWRIGHT_SCHEMA_README.md` - Schema documentation
- `packages/*/playwright/tests.json` - Test definitions
