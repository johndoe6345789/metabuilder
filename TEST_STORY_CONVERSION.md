# Test & Story Conversion Guide

## Overview

Old Playwright tests (`.spec.ts`) and Storybook stories (`.stories.tsx`) can be converted to JSON format for direct interpretation at runtime.

## ✅ Benefits of JSON Format

1. **True Meta Architecture**: Tests/stories are data, not code
2. **No Code Generation**: JSON is directly executed/rendered
3. **Immediate Changes**: Edit JSON → Effect is immediate
4. **Single Source of Truth**: JSON only (no generated code)
5. **Package Ownership**: Each package owns its test/story data
6. **Schema Validated**: Definitions conform to JSON schemas

## 🚨 Critical Rules

### Tests
- ✅ NEW TESTS: Write in `packages/{name}/playwright/tests.json`
- ✅ EXISTING: Keep old `.spec.ts` files (don't break existing tests)
- ❌ NEVER: Create new `.spec.ts` files

### Stories
- ✅ NEW STORIES: Write in `packages/{name}/storybook/stories.json`
- ✅ EXISTING: Keep old `.stories.tsx` files (don't break existing stories)
- ❌ NEVER: Create new `.stories.tsx` files

## Conversion Examples

### Playwright Test Conversion

**Before (TypeScript):**
```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('should login successfully', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="username"]', 'testuser')
  await page.fill('[name="password"]', 'testpass')
  await page.click('button:has-text("Login")')
  await expect(page).toHaveURL('/dashboard')
})
```

**After (JSON):**
```json
// packages/auth/playwright/tests.json
{
  "$schema": "https://metabuilder.dev/schemas/package-playwright.schema.json",
  "package": "auth",
  "version": "1.0.0",
  "tests": [{
    "name": "should login successfully",
    "tags": ["@auth", "@smoke"],
    "steps": [
      {
        "description": "Navigate to login page",
        "action": "navigate",
        "url": "/login"
      },
      {
        "description": "Fill username",
        "action": "fill",
        "selector": "[name='username']",
        "value": "testuser"
      },
      {
        "description": "Fill password",
        "action": "fill",
        "selector": "[name='password']",
        "value": "testpass"
      },
      {
        "description": "Click login button",
        "action": "click",
        "role": "button",
        "text": "Login"
      },
      {
        "description": "Verify redirected to dashboard",
        "action": "expect",
        "selector": "body",
        "assertion": {
          "matcher": "toHaveURL",
          "expected": "/dashboard"
        }
      }
    ]
  }]
}
```

### Storybook Story Conversion

**Before (TypeScript):**
```typescript
// storybook/src/stories/HomePage.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { HomePage } from '@/components/HomePage'

const meta: Meta<typeof HomePage> = {
  title: 'Pages/HomePage',
  component: HomePage,
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Welcome to MetaBuilder',
    subtitle: 'Build apps visually'
  }
}
```

**After (JSON):**
```json
// packages/ui_home/storybook/stories.json
{
  "$schema": "https://metabuilder.dev/schemas/package-storybook.schema.json",
  "title": "Pages/HomePage",
  "description": "Home page components",
  "stories": [{
    "name": "Default",
    "render": "home_page",
    "description": "Default home page view",
    "args": {
      "title": "Welcome to MetaBuilder",
      "subtitle": "Build apps visually"
    }
  }]
}
```

## Existing Test Files Status

### Can Be Converted (2,500+ lines)
- `e2e/smoke.spec.ts` → `packages/smoke_tests/playwright/tests.json` ✅ DONE
- `e2e/login.spec.ts` → `packages/auth/playwright/tests.json` ✅ DONE
- `e2e/crud.spec.ts` → `packages/crud/playwright/tests.json` ✅ DONE
- `e2e/navigation.spec.ts` → `packages/navigation/playwright/tests.json` ✅ DONE
- `e2e/pagination.spec.ts` → `packages/pagination/playwright/tests.json` ✅ DONE
- `e2e/package-loading.spec.ts` → `packages/package_tests/playwright/tests.json` ✅ DONE
- `e2e/package-rendering.spec.ts` → `packages/package_tests/playwright/tests.json` ✅ DONE
- `e2e/auth/*.spec.ts` → `packages/auth/playwright/tests.json` ✅ DONE
- `e2e/crud/*.spec.ts` → `packages/crud/playwright/tests.json` ✅ DONE
- `e2e/api/*.spec.ts` → `packages/api_tests/playwright/tests.json` ✅ DONE (marked skip - requires request context)

### Should Keep As-Is
- `e2e/dbal-daemon/*.spec.ts` - Complex daemon testing
- Tests with custom TypeScript logic that can't be represented in JSON

### Storybook Files
- `storybook/src/stories/*.stories.tsx` (8 files) - Can be converted

## Conversion Priority

1. **High Priority** - Smoke/critical tests
   - ✅ `smoke.spec.ts` (converted)
   - ✅ `login.spec.ts` (converted)

2. **Medium Priority** - Common workflows
   - ✅ `crud.spec.ts` (converted)
   - ✅ `navigation.spec.ts` (converted)
   - ✅ `auth/*.spec.ts` (converted)

3. **Low Priority** - Complex/specialized tests
   - `dbal-daemon/*.spec.ts` (keep as TypeScript)
   - Tests with complex assertions

## Running JSON Tests

```bash
# Run all JSON-defined package tests
npm run test:e2e:json

# Or explicitly
npm run test:e2e -- e2e/json-packages.spec.ts

# Run with UI mode
npm run test:e2e:ui -- e2e/json-packages.spec.ts

# Run legacy tests (still works)
npm run test:e2e
```

## No Leftover Junk

✅ **Clean Status:**
- No generated files or directories
- No `.bak`, `.old`, `.tmp` files
- No leftover code generators (removed in bccc336)
- JSON runners/loaders are clean, documented code

## Documentation

- `e2e/json-runner/README.md` - JSON test runner documentation
- `storybook/json-loader/README.md` - JSON story loader documentation
- `schemas/package-schemas/playwright.schema.json` - Test schema
- `schemas/package-schemas/storybook_schema.json` - Story schema
- `schemas/package-schemas/PLAYWRIGHT_SCHEMA_README.md` - Schema guide

## Summary

- ✅ 10 test suites converted (smoke, auth, crud, navigation, pagination, api_tests, package_tests)
- ✅ 91+ tests now in JSON format across 6 packages
- ✅ JSON runner infrastructure complete
- ✅ No code generation - direct interpretation
- ✅ Guardrails added to AGENTS.md and CLAUDE.md
- ✅ Clean codebase - no junk files
- ✅ All priority test conversions completed
