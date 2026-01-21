# Test Migration Toolkit

Tools for migrating TypeScript test files (.test.ts) to declarative JSON format for the MetaBuilder unified test runner.

## Overview

The toolkit consists of three main components:

1. **Converter** - Parses TypeScript test files and converts them to JSON
2. **Migrator** - Batch discovers and migrates all test files
3. **Validator** - Validates JSON test files against the schema

## Architecture

```
TypeScript .test.ts files
        ↓
   [Converter]  ← Uses TypeScript AST to parse test structure
        ↓
JSON test definitions
        ↓
   [Validator]  ← Ensures JSON conforms to schema
        ↓
/packages/*/unit-tests/tests.json
        ↓
[Unified Test Runner]  ← Discovers and executes
```

## Usage

### 1. Dry-Run Migration (Safe Preview)

```bash
# Preview what would be converted
npm --prefix scripts/migrate-tests run migrate -- --dry-run --verbose

# Or directly:
npx ts-node scripts/migrate-tests/migrator.ts --dry-run --verbose
```

### 2. Actual Migration

```bash
# Migrate all discovered .test.ts files
npm --prefix scripts/migrate-tests run migrate

# Or directly:
npx ts-node scripts/migrate-tests/migrator.ts
```

### 3. Validate Converted Tests

```bash
# Validate all JSON test files in packages
npm --prefix scripts/migrate-tests run validate

# Or directly:
npx ts-node scripts/migrate-tests/validator.ts packages

# Validate specific directory:
npx ts-node scripts/migrate-tests/validator.ts packages/my_package
```

## How It Works

### Conversion Process

The converter uses TypeScript's AST (Abstract Syntax Tree) to understand test structure:

1. **Parse imports** - Extract all import statements into `imports` array
2. **Extract test suites** - Find all `describe()` blocks
3. **Parse tests** - Extract `it()` blocks within suites
4. **Parse assertions** - Extract `expect()` calls and map matchers to JSON types
5. **Build JSON** - Construct JSON test definition with $schema, package, imports, testSuites

### Matcher Mapping

The converter maps 30+ Vitest/Jest matchers to JSON assertion types:

| TypeScript Matcher | JSON Type | Example |
|-------------------|-----------|---------|
| `toBe()` | `equals` | Strict equality |
| `toEqual()` | `deepEquals` | Deep object equality |
| `toBeGreaterThan()` | `greaterThan` | Numeric comparison |
| `toContain()` | `contains` | String/array contains |
| `toThrow()` | `throws` | Exception handling |
| `toBeVisible()` | `toBeVisible` | DOM assertion |
| `toHaveClass()` | `toHaveClass` | DOM assertion |
| ... and 24 more | ... | ... |

### Package Name Mapping

Tests are placed in the appropriate package directory:

- `frontends/nextjs/*.test.ts` → `packages/nextjs_frontend/unit-tests/tests.json`
- `frontends/cli/*.test.ts` → `packages/cli_frontend/unit-tests/tests.json`
- `frontends/qt6/*.test.ts` → `packages/qt6_frontend/unit-tests/tests.json`
- Others → `packages/[extracted_name]/unit-tests/tests.json`

## JSON Test Format

### Basic Structure

```json
{
  "$schema": "https://metabuilder.dev/schemas/tests.schema.json",
  "schemaVersion": "2.0.0",
  "package": "my_package",
  "imports": [
    { "from": "@/lib/utils", "items": ["validateEmail"] }
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

### Supported Actions (Act Phase)

- `function_call` - Call an imported function
- `render` - Render React component (requires React Testing Library)
- `click` - Simulate click event
- `fill` - Fill form input
- `select` - Select dropdown option
- `hover` - Hover over element
- `focus` - Focus on element
- `blur` - Blur from element
- `waitFor` - Wait for condition

### Supported Assertions

**Basic**: equals, deepEquals, notEquals, truthy, falsy

**Numeric**: greaterThan, lessThan, greaterThanOrEqual, lessThanOrEqual

**Type**: null, notNull, undefined, notUndefined, instanceOf

**Collection**: contains, matches, hasProperty, hasLength

**DOM**: toBeVisible, toBeInTheDocument, toHaveTextContent, toHaveAttribute, toHaveClass, toBeDisabled, toBeEnabled, toHaveValue

**Control**: throws, notThrows, custom

## Configuration

### Converter Options

```typescript
interface ConversionResult {
  success: boolean;
  jsonContent?: any;           // The generated JSON
  warnings: string[];          // Non-fatal issues
  errors: string[];            // Fatal errors
}
```

### Migrator Options

```typescript
interface MigrationConfig {
  dryRun?: boolean;            // Preview only, don't write
  verbose?: boolean;           // Detailed logging
  pattern?: string;            // Glob pattern (default: 'frontends/**/*.test.ts')
  targetDir?: string;          // Output directory (default: 'packages')
}
```

### CLI Flags

```bash
# Dry run (preview)
--dry-run

# Verbose logging
--verbose

# Custom glob pattern
--pattern 'src/**/*.test.ts'

# Custom target directory
--target-dir 'my-packages'
```

## Limitations & Fallbacks

### Known Limitations

1. **Complex Mocking** - Tests with advanced mock setup (spies, call tracking) may not convert perfectly
2. **Custom Hooks** - Tests with custom React hooks require manual adjustment
3. **Snapshots** - Snapshot tests require manual conversion
4. **Dynamic Imports** - Dynamic require() calls may not be captured
5. **Conditional Logic** - Complex conditional test logic may be simplified

### Handling Lossy Conversion

For tests that don't convert perfectly:

1. Run converter with `--verbose` to see warnings
2. Review warnings in output
3. Manually adjust the generated JSON as needed
4. Validate with validator tool

The 80/20 rule applies: ~80% of tests convert cleanly, ~20% need manual adjustment.

## Workflow

### Recommended Workflow

1. **Backup** - Commit current state before migration
   ```bash
   git add .
   git commit -m "backup: before test migration"
   ```

2. **Dry Run** - Preview what will happen
   ```bash
   npx ts-node scripts/migrate-tests/migrator.ts --dry-run --verbose
   ```

3. **Migrate** - Run actual migration
   ```bash
   npx ts-node scripts/migrate-tests/migrator.ts --verbose
   ```

4. **Validate** - Ensure JSON is valid
   ```bash
   npx ts-node scripts/migrate-tests/validator.ts packages
   ```

5. **Test** - Run unified test runner
   ```bash
   npm run test:unified
   ```

6. **Commit** - Save migration results
   ```bash
   git add packages/*/unit-tests/
   git commit -m "feat: migrate TypeScript tests to JSON format"
   ```

## Examples

### Example 1: Simple Function Test

**TypeScript:**
```typescript
describe('Email Validation', () => {
  it('should accept valid email', () => {
    const result = validateEmail('user@example.com');
    expect(result).toBe(true);
  });
});
```

**JSON (Converted):**
```json
{
  "testSuites": [{
    "name": "Email Validation",
    "tests": [{
      "name": "should accept valid email",
      "act": {
        "type": "function_call",
        "target": "validateEmail",
        "input": "user@example.com"
      },
      "assert": {
        "expectations": [{
          "type": "equals",
          "expected": true
        }]
      }
    }]
  }]
}
```

### Example 2: Test with Fixtures

**TypeScript:**
```typescript
it('should validate email from fixture', () => {
  const email = 'test@example.com';
  const result = validateEmail(email);
  expect(result).toBe(true);
});
```

**JSON (Converted):**
```json
{
  "arrange": {
    "fixtures": { "email": "test@example.com" }
  },
  "act": {
    "type": "function_call",
    "target": "validateEmail",
    "input": "$arrange.fixtures.email"
  },
  "assert": {
    "expectations": [{
      "type": "equals",
      "expected": true
    }]
  }
}
```

## Troubleshooting

### Issue: "Schema not found"
**Solution**: Ensure `schemas/package-schemas/tests_schema.json` exists

### Issue: "No test files found"
**Solution**: Check glob pattern matches your test files
```bash
# Verify pattern:
npx ts-node scripts/migrate-tests/migrator.ts --verbose
```

### Issue: "Package directory not created"
**Solution**: Ensure output directory exists and is writable
```bash
mkdir -p packages/my_package/unit-tests
```

### Issue: "Validation errors after conversion"
**Solution**: Review warnings and adjust JSON manually as needed

## Files

- `converter.ts` - Main conversion logic (350+ lines)
- `migrator.ts` - Batch migration orchestration (250+ lines)
- `validator.ts` - JSON validation against schema (300+ lines)
- `index.ts` - Export module
- `README.md` - This file

## Integration with Unified Test Runner

After migration, tests are automatically discovered by the unified test runner:

```typescript
import { UnifiedTestRunner } from '@/e2e/test-runner';

const runner = new UnifiedTestRunner();
const tests = await runner.discoverTests();
// Discovers: unit tests from packages/*/unit-tests/tests.json
```

## Next Steps

1. Run migration on existing TypeScript tests
2. Validate all converted JSON
3. Run unified test runner to execute tests
4. Document any manual adjustments needed
5. Update testing guidelines to use JSON format for new tests
