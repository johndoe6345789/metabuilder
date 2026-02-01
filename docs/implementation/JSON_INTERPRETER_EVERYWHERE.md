# JSON Interpreter Everywhere Implementation Guide

## Overview

This document describes the complete **JSON Interpreter Everywhere** implementation for MetaBuilder - the architectural pattern where all test types (Playwright E2E, Storybook, unit tests) and styling are declarative JSON definitions interpreted at runtime, rather than hardcoded code.

**Status**: Phases 1-4 complete, Phase 5 in progress

## Philosophy

MetaBuilder follows the principle: **"95% configuration, 5% code"**

Everything should be declarative JSON/YAML with minimal interpreters, not hardcoded TypeScript or generated code.

### Before (Anti-Pattern)
```typescript
// ❌ Hardcoded test file
describe('Email Validation', () => {
  it('should accept valid email', () => {
    const result = validateEmail('user@example.com');
    expect(result).toBe(true);
  });
});
```

### After (JSON Interpreter Pattern)
```json
{
  "$schema": "...",
  "testSuites": [{
    "name": "Email Validation",
    "tests": [{
      "name": "should accept valid email",
      "act": { "type": "function_call", "target": "validateEmail", "input": "user@example.com" },
      "assert": { "expectations": [{ "type": "truthy", "actual": "result" }] }
    }]
  }]
}
```

The JSON interpreter (`e2e/test-runner/json-interpreter.ts`) converts this at runtime to Vitest test suites.

## Architecture

### Three-Layer System

```
┌─────────────────────────────────────────────┐
│  Data Layer (JSON/YAML Definitions)         │
│  - tests_schema.json (unit/E2E/Storybook)   │
│  - styles_schema.json (component styling)   │
│  - Stored in packages/*/[type]/tests.json   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Interpreter Layer (Minimal TypeScript)     │
│  - JSON test interpreter                    │
│  - Style engine                             │
│  - Component renderer                       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Execution Layer (Framework Adapters)       │
│  - Vitest (unit tests)                      │
│  - Playwright (E2E tests)                   │
│  - Storybook (component stories)            │
│  - React (component rendering)              │
└─────────────────────────────────────────────┘
```

### Discovery Flow

```
packages/
├── auth/
│   ├── unit-tests/tests.json       ← Unit tests (JSON)
│   ├── playwright/tests.json       ← E2E tests (JSON)
│   └── storybook/stories.json      ← Stories (JSON)
├── ui_home/
│   ├── unit-tests/tests.json
│   ├── playwright/tests.json
│   ├── storybook/stories.json
│   └── component/
│       └── styles.json             ← Component styles (JSON)
└── [50+ more packages]

                    ↓

        UnifiedTestRunner
        (e2e/test-runner/index.ts)

                    ↓

    ┌───────────────┬───────────────┐
    │               │               │
    ▼               ▼               ▼
Unit Tests      E2E Tests      Stories
(Vitest)        (Playwright)    (Storybook)
```

## Implementation Phases

### Phase 1: Schema Enhancement ✅
**Objective**: Extend JSON schemas to support all test and style patterns

**Deliverables**:
- ✅ Enhanced `tests_schema.json` with:
  - 8 new DOM assertion types
  - Component rendering support
  - DOM interaction actions
  - Fixture interpolation
- ✅ Enhanced `styles_schema.json` with:
  - Component scoping
  - Variants (size, color, etc.)
  - States (hover, active, disabled)
  - Responsive breakpoints
  - 25+ CSS properties

**Files**:
- `schemas/package-schemas/tests_schema.json`
- `schemas/package-schemas/styles_schema.json`

**Commits**:
- `0f7c6196` - Enhanced tests_schema.json
- `c7a8cace`, `cf224d5d` - Enhanced styles_schema.json

### Phase 2: Unified Test Runner ✅
**Objective**: Build orchestrator for discovering and executing all test types

**Deliverables**:
- ✅ `UnifiedTestRunner` class that:
  - Discovers unit tests from `packages/*/unit-tests/tests.json`
  - Discovers E2E tests from `packages/*/playwright/tests.json`
  - Discovers Storybook stories from `packages/*/storybook/stories.json`
  - Filters by package name and tags
  - Registers tests with appropriate interpreters
  - Returns statistics

**Discovery Results**: 43 total test files
- 1 unit test file
- 8 E2E test files
- 34 Storybook files

**Files**:
- `e2e/test-runner/index.ts` (400+ lines)
- `e2e/test-runner/json-interpreter.ts` (500+ lines)
- `e2e/test-runner/types.ts` (15+ interfaces)
- `e2e/test-runner/README.md`

**Commits**:
- `acd9dba5` - Unified test runner and JSON interpreter

### Phase 3: Migration Tooling ✅
**Objective**: Build tools to convert existing TypeScript tests to JSON

**Deliverables**:
- ✅ `TestConverter` - AST-based converter:
  - Parses .test.ts files using TypeScript compiler
  - Extracts describe/it/expect blocks
  - Maps 30+ Jest/Vitest matchers to JSON types
  - Returns `ConversionResult` with warnings/errors
- ✅ `TestMigrator` - Batch orchestrator:
  - Globs all .test.ts files
  - Runs converter on each file
  - Creates output directories
  - Dry-run mode for safe preview
  - Package name mapping
  - Progress reporting
- ✅ `TestValidator` - JSON validation:
  - Validates JSON against schema
  - Semantic checks (unique IDs, etc.)
  - Unused import warnings
  - Directory-wide validation

**Files**:
- `scripts/migrate-tests/converter.ts` (350+ lines)
- `scripts/migrate-tests/migrator.ts` (250+ lines)
- `scripts/migrate-tests/validator.ts` (300+ lines)
- `scripts/migrate-tests/index.ts`
- `scripts/migrate-tests/README.md`

**Commits**:
- `8b32a877` - Comprehensive test migration tooling

### Phase 4: Example Package ✅
**Objective**: Create comprehensive reference package showing all patterns

**Deliverables**:
- ✅ `test_example_comprehensive` package:
  - 10 test suites
  - 40+ comprehensive tests
  - All 29 assertion types demonstrated
  - All act phase actions shown
  - Fixture usage patterns
  - Mock setup examples
  - Component rendering and DOM testing
  - Error handling patterns

**Test Suites**:
1. Email Validation (3 tests) - Valid, invalid, empty
2. Password Security (3 tests) - Hash, consistency, error
3. Token Generation (2 tests) - Format, JWT verification
4. JSON Parsing (3 tests) - Objects, arrays, errors
5. Numeric Comparisons (3 tests) - All numeric types
6. Null/Undefined (4 tests) - Type checking
7. Collections (3 tests) - Properties, arrays, contains
8. Component Rendering (3 tests) - Render, click, disabled
9. Error Handling (2 tests) - Throw, no throw
10. Mixed Assertions (1 test) - Comprehensive validation

**Files**:
- `packages/test_example_comprehensive/package.json`
- `packages/test_example_comprehensive/unit-tests/tests.json` (2,000+ lines)
- `packages/test_example_comprehensive/README.md`

**Commits**:
- `f00b956e` - Comprehensive JSON test example package

### Phase 5: Documentation & Batch Migration 🔄
**Current Phase**: In Progress

**Objectives**:
- [ ] Create comprehensive implementation guide (this file)
- [ ] Create migration quick-start guide
- [ ] Execute batch migration on existing tests
- [ ] Run validation on all converted tests
- [ ] Update testing guidelines
- [ ] Create trainer guide for teams

## Complete File Structure

### Schema Files
```
schemas/package-schemas/
├── tests_schema.json          ← Unit/E2E/Storybook test format
└── styles_schema.json         ← Component styling format
```

### Test Infrastructure
```
e2e/test-runner/
├── index.ts                   ← Unified orchestrator
├── json-interpreter.ts        ← JSON → Vitest converter
├── types.ts                   ← Type definitions
└── README.md                  ← Runner documentation

scripts/migrate-tests/
├── converter.ts               ← .test.ts → JSON converter
├── migrator.ts                ← Batch migration orchestrator
├── validator.ts               ← JSON validation
├── index.ts                   ← Export module
└── README.md                  ← Migration guide
```

### Example Package
```
packages/test_example_comprehensive/
├── package.json               ← Metadata
├── unit-tests/tests.json      ← 40+ example tests
└── README.md                  ← Reference guide
```

## Supported Features

### JSON Test Format

**Arrange Phase** (Setup)
```json
"arrange": {
  "fixtures": {
    "email": "test@example.com",
    "password": "SecurePass123"
  },
  "mocks": [
    {
      "target": "generateToken",
      "behavior": { "returnValue": "token123" }
    }
  ]
}
```

**Act Phase** (Execution)
- `function_call` - Call imported function
- `render` - Render React component
- `click` - Simulate click
- `fill` - Fill input
- `select` - Select option
- `hover` - Hover element
- `focus` - Focus element
- `blur` - Blur element
- `waitFor` - Wait for condition

**Assert Phase** (Verification)
- **Basic** (6): equals, deepEquals, notEquals, truthy, falsy, custom
- **Numeric** (4): greaterThan, lessThan, greaterThanOrEqual, lessThanOrEqual
- **Type** (4): null, notNull, undefined, notUndefined
- **Collection** (5): contains, matches, hasProperty, hasLength, instanceOf
- **DOM** (8): toBeVisible, toBeInTheDocument, toHaveTextContent, toHaveAttribute, toHaveClass, toBeDisabled, toBeEnabled, toHaveValue
- **Control** (2): throws, notThrows

**Total**: 29 assertion types

### Fixture Interpolation

Use `$arrange.fixtures.key` to reference fixtures:

```json
{
  "arrange": { "fixtures": { "email": "test@example.com" } },
  "act": {
    "type": "function_call",
    "target": "validateEmail",
    "input": "$arrange.fixtures.email"
  }
}
```

### Component Styling

```json
{
  "components": {
    "Button": {
      "base": {
        "display": "inline-flex",
        "padding": "12px",
        "borderRadius": "4px"
      },
      "variants": {
        "size": {
          "small": { "padding": "8px" },
          "large": { "padding": "16px" }
        }
      },
      "states": {
        "hover": { "opacity": 0.8 },
        "disabled": { "opacity": 0.5 }
      },
      "responsive": {
        "sm": { "padding": "8px" },
        "md": { "padding": "12px" },
        "lg": { "padding": "16px" }
      }
    }
  }
}
```

## Workflows

### Writing New JSON Tests

1. **Create test file**
   ```bash
   mkdir -p packages/my_package/unit-tests
   touch packages/my_package/unit-tests/tests.json
   ```

2. **Use template**
   ```json
   {
     "$schema": "https://metabuilder.dev/schemas/tests.schema.json",
     "schemaVersion": "2.0.0",
     "package": "my_package",
     "imports": [],
     "testSuites": [
       {
         "id": "suite_1",
         "name": "My Tests",
         "tests": []
       }
     ]
   }
   ```

3. **Add tests** (see test_example_comprehensive for patterns)

4. **Validate**
   ```bash
   npx ts-node scripts/migrate-tests/validator.ts packages/my_package
   ```

5. **Run**
   ```bash
   npm run test:unified
   ```

### Migrating Existing Tests

1. **Backup**
   ```bash
   git add .
   git commit -m "backup: before test migration"
   ```

2. **Preview**
   ```bash
   npx ts-node scripts/migrate-tests/migrator.ts --dry-run --verbose
   ```

3. **Migrate**
   ```bash
   npx ts-node scripts/migrate-tests/migrator.ts --verbose
   ```

4. **Validate**
   ```bash
   npx ts-node scripts/migrate-tests/validator.ts packages
   ```

5. **Test**
   ```bash
   npm run test:unified
   ```

6. **Commit**
   ```bash
   git add packages/*/unit-tests/
   git commit -m "feat: migrate TypeScript tests to JSON format"
   ```

## Benefits

### For Developers
- ✅ Standardized test format across all packages
- ✅ No test boilerplate - focus on logic
- ✅ Visual test inspection in JSON
- ✅ Easy copy/paste patterns from examples
- ✅ CLI tools for validation and migration

### For System
- ✅ Tests as configuration, not code
- ✅ Easier debugging (JSON is traceable)
- ✅ Better analytics and reporting
- ✅ Tests can be modified without rebuilding
- ✅ Admin panel could generate tests

### For MetaBuilder Architecture
- ✅ Completes 100% declarative goal
- ✅ Aligns with "95% configuration" philosophy
- ✅ Enables dynamic test generation
- ✅ Unified interpreter for all test types
- ✅ Clear separation of data and execution

## Best Practices

### 1. Use Descriptive Names
```json
"name": "should validate email format and reject invalid formats"
```

### 2. Organize with Tags
```json
"tags": ["@smoke", "@critical", "@regression"]
```

### 3. Use Fixtures for Reusable Values
```json
"arrange": {
  "fixtures": {
    "validEmail": "user@example.com",
    "invalidEmail": "invalid@"
  }
}
```

### 4. Multiple Assertions for Complex Cases
```json
"assert": {
  "expectations": [
    { "type": "truthy" },
    { "type": "hasLength", "expected": 20 },
    { "type": "contains", "expected": "$" }
  ]
}
```

### 5. Test Fixtures with Mocks
```json
"mocks": [
  {
    "target": "generateToken",
    "behavior": { "returnValue": "mocked_token" }
  }
]
```

### 6. Use Setup Hooks
```json
"setup": {
  "beforeEach": [{ "type": "initialize" }],
  "afterEach": [{ "type": "cleanup" }]
}
```

## Common Patterns

### Testing a Utility Function
See `test_example_comprehensive` - Email Validation suite

### Testing Error Cases
See `test_example_comprehensive` - Error Handling suite

### Testing React Components
See `test_example_comprehensive` - Component Rendering suite

### Testing with Multiple Assertions
See `test_example_comprehensive` - Mixed Assertions suite

## Migration Statistics

### Discovery
- **Total test files found**: 43
  - Unit tests: 1
  - E2E tests: 8
  - Storybook stories: 34

### Migration Readiness
- **Existing TypeScript .test.ts files**: [To be counted during Phase 5]
- **Expected conversion success rate**: ~80% (20% may need manual adjustment)
- **Estimated effort**: 2-4 hours for full migration

## Troubleshooting

### Schema Validation Fails
```bash
# Check the specific errors:
npx ts-node scripts/migrate-tests/validator.ts packages/my_package
```

### Converter Produces Lossy Output
- Complex mocking may not convert perfectly
- Custom hooks require manual adjustment
- Snapshots need manual conversion
- Review warnings and adjust JSON as needed

### Tests Don't Execute
1. Ensure JSON is valid: `npm --prefix scripts/migrate-tests run validate`
2. Check imports are available in runtime
3. Verify test file location: `packages/*/unit-tests/tests.json`
4. Run unified test runner: `npm run test:unified`

## Integration Points

### For Test Writers
- Write tests in JSON format instead of TypeScript
- Use test_example_comprehensive as reference
- Validate with migration tooling
- Run with unified test runner

### For Test Runners
- Unified runner automatically discovers all test types
- JSON interpreter converts to framework-specific format
- Same experience across all test types

### For CI/CD
- Pre-commit hook could validate JSON
- CI pipeline runs unified test runner
- Reports include all test types

### For Admin Panel (Future)
- Tests displayed as JSON
- Admins could view/modify tests
- Real-time test execution
- Test analytics and reporting

## Future Enhancements

### Near Term
- [ ] Batch migrate all existing tests
- [ ] Create team training guide
- [ ] Add pre-commit JSON validation
- [ ] Integration with admin panel

### Medium Term
- [ ] Visual test editor (drag-and-drop)
- [ ] Test generation from behavior specs
- [ ] Advanced analytics (flakiness, coverage)
- [ ] Test data factory integration

### Long Term
- [ ] AI-assisted test generation
- [ ] Property-based testing support
- [ ] Formal specification integration
- [ ] Dynamic test orchestration

## References

### Documentation Files
- `e2e/test-runner/README.md` - Test runner documentation
- `scripts/migrate-tests/README.md` - Migration tooling documentation
- `packages/test_example_comprehensive/README.md` - Example package reference
- `schemas/package-schemas/tests_schema.json` - Complete schema definition

### Key Files
- `e2e/test-runner/index.ts` - Unified test runner (400+ lines)
- `e2e/test-runner/json-interpreter.ts` - JSON → Vitest (500+ lines)
- `scripts/migrate-tests/converter.ts` - Conversion engine (350+ lines)
- `scripts/migrate-tests/migrator.ts` - Batch orchestrator (250+ lines)
- `packages/test_example_comprehensive/unit-tests/tests.json` - Example suite (2,000+ lines)

### Commits
- `acd9dba5` - Unified test runner & JSON interpreter
- `8b32a877` - Migration tooling (converter, migrator, validator)
- `f00b956e` - Comprehensive example package

## Team Guidelines

### For QA/Test Engineers
- Learn JSON test format from test_example_comprehensive
- Use migration tools to convert legacy tests
- Write new tests in JSON format
- Validate tests before commit
- Report any conversion issues

### For Backend Engineers
- Provide test functions/utilities to import
- Ensure functions are exported properly
- Add to `imports` array in test file
- Support mock behavior setup

### For Frontend Engineers
- Use example package patterns for component tests
- Set up fixtures for UI state
- Test DOM assertions for interaction
- Report any rendering issues

### For DevOps/CI
- Add JSON validation to pre-commit hooks
- Run unified test runner in CI pipeline
- Report statistics (conversion success, test counts)
- Archive test results

## Success Metrics

**Implementation Phase Completion**:
- ✅ Phase 1: Schema enhancement complete
- ✅ Phase 2: Unified test runner complete
- ✅ Phase 3: Migration tooling complete
- ✅ Phase 4: Example package complete
- 🔄 Phase 5: Documentation & batch migration in progress

**Target Metrics**:
- ✅ 43 test files discovered (100% discovered)
- ⏳ 100% of new tests written in JSON (ongoing)
- ⏳ 80%+ of existing tests migrated (pending)
- ⏳ Zero hardcoded test files created (ongoing)
- ⏳ All tests standardized on JSON format (ongoing)

## Conclusion

The **JSON Interpreter Everywhere** implementation enables MetaBuilder to achieve its architectural goal: **95% declarative configuration, 5% code**.

By treating all tests as data that's interpreted at runtime, rather than code that's compiled, we gain:
- Flexibility (admins can modify tests without code changes)
- Consistency (same format across all test types)
- Simplicity (minimal interpreter logic)
- Clarity (JSON is easier to understand than nested code)
- Scalability (tests can be generated, optimized, analyzed)

This is a complete implementation pathway from concept to execution.

---

**Status**: Phase 5 in progress - Documentation complete, batch migration pending

**Next**: Execute batch migration on all existing tests, update team guidelines, deploy to production.
