# Playwright Tests for ui_home Package

This folder contains declarative Playwright test definitions for the `ui_home` package, following MetaBuilder's data-driven architecture.

## Structure

- **tests.json** - Main test suite with JSON-defined E2E tests
- **metadata.json** - Test suite metadata and coverage information

## Test Coverage

The test suite validates:

- ✅ Home page loads successfully (HTTP 200)
- ✅ Hero section with title and CTAs
- ✅ Six Levels of Power feature cards
- ✅ Navigation bar with Sign In/Admin buttons
- ✅ About MetaBuilder section
- ✅ Contact form with all fields
- ✅ No critical console errors
- ✅ Anchor link navigation

## Running Tests

### From Package Test Definition
```bash
# Generate .spec.ts from tests.json (future implementation)
npm run test:generate -- --package ui_home

# Run generated tests
npm run test:e2e -- --grep @ui_home
```

### Run Existing E2E Tests
```bash
cd /path/to/metabuilder
npm run test:e2e -- e2e/smoke.spec.ts
```

## Test Schema

Tests follow the `playwright.schema.json` schema:
- **Declarative steps**: All test actions defined in JSON
- **Selector strategies**: Support for CSS, role-based, text, and test-id selectors
- **Assertions**: Playwright expect matchers as data
- **Fixtures**: Reusable test data
- **Tags**: Filter tests by categories (@smoke, @critical, etc.)

## Example Test

```json
{
  "name": "should display hero section with title and CTAs",
  "tags": ["@smoke", "@ui"],
  "steps": [
    {
      "action": "navigate",
      "url": "/"
    },
    {
      "action": "expect",
      "selector": ".hero-title",
      "assertion": {
        "matcher": "toBeVisible"
      }
    }
  ]
}
```

## Meta Architecture Benefits

- **Data-driven**: Tests are configuration, not code
- **Package-scoped**: Each package owns its test definitions
- **Schema-validated**: Tests conform to JSON schema
- **Auto-discoverable**: Test loader can find all `playwright/tests.json` files
- **Maintainable**: Update tests without touching TypeScript

## Future Enhancements

1. **Test Generator**: Convert `tests.json` → `.spec.ts` automatically
2. **Visual Testing**: Add screenshot comparison tests
3. **Performance**: Add lighthouse/performance assertions
4. **Accessibility**: WCAG/aria validation tests
5. **Cross-browser**: Multi-browser test matrix from single JSON
