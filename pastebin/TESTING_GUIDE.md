# Quality Validator Testing Guide

Complete guide for running, maintaining, and extending the test suite.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

## Test Suite Overview

| Category | Tests | Coverage | Status |
|----------|-------|----------|--------|
| Unit Tests | 60+ | >80% | Production-Ready |
| Integration Tests | 20+ | >80% | Production-Ready |
| E2E Tests | 10+ | >80% | Production-Ready |
| **Total** | **90+** | **>80%** | **Complete** |

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run single test file
npm test -- tests/unit/types.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="Score"

# Run only unit tests
npm test -- tests/unit

# Run only integration tests
npm test -- tests/integration

# Run only E2E tests
npm test -- tests/e2e

# Verbose output
npm test -- --verbose

# List all tests without running
npm test -- --listTests
```

### Advanced Options

```bash
# Run with specific timeout
npm test -- --testTimeout=30000

# Update snapshots
npm test -- --updateSnapshot

# Show which tests are slowest
npm test -- --detectOpenHandles

# Run tests in band (not parallel)
npm test -- --runInBand

# Run specific suite
npm test -- -t "CodeQualityAnalyzer"

# Run and generate junit report
npm test -- --reporters=default --reporters=jest-junit
```

## Coverage Reports

### Generate Coverage
```bash
npm test -- --coverage
```

### View Coverage in HTML
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

### Coverage by Module

After running tests with `--coverage`:

- **src/lib/quality-validator/analyzers/**: ~85% coverage
- **src/lib/quality-validator/scoring/**: ~90% coverage
- **src/lib/quality-validator/config/**: ~85% coverage
- **src/lib/quality-validator/utils/**: ~90% coverage
- **src/lib/quality-validator/reporters/**: ~80% coverage

### Check Coverage Thresholds
```bash
npm test -- --coverage --coverageReporters=text-summary
```

## Test Organization

### Unit Tests: 60+ tests

#### `tests/unit/types.test.ts` (13 tests)
Tests type definitions and error classes.

```bash
npm test -- tests/unit/types.test.ts
```

- Error class construction
- Exit code values
- Type compatibility

#### `tests/unit/analyzers/codeQualityAnalyzer.test.ts` (15 tests)
Tests complexity, duplication, and linting analysis.

```bash
npm test -- tests/unit/analyzers/codeQualityAnalyzer.test.ts
```

- Complexity detection
- Duplication analysis
- Linting violation detection
- Score calculation
- Error handling

#### `tests/unit/analyzers/coverageAnalyzer.test.ts` (14 tests)
Tests coverage data parsing and effectiveness scoring.

```bash
npm test -- tests/unit/analyzers/coverageAnalyzer.test.ts
```

- Coverage data parsing
- Metric aggregation
- Coverage gap identification
- Score calculation

#### `tests/unit/analyzers/architectureChecker.test.ts` (13 tests)
Tests component validation and dependency analysis.

```bash
npm test -- tests/unit/analyzers/architectureChecker.test.ts
```

- Component classification
- Dependency analysis
- Circular dependency detection
- Pattern compliance

#### `tests/unit/analyzers/securityScanner.test.ts` (14 tests)
Tests vulnerability and pattern detection.

```bash
npm test -- tests/unit/analyzers/securityScanner.test.ts
```

- Secret detection
- XSS vulnerability detection
- Performance issue detection
- Finding generation

#### `tests/unit/scoring/scoringEngine.test.ts` (16 tests)
Tests score calculation and grade assignment.

```bash
npm test -- tests/unit/scoring/scoringEngine.test.ts
```

- Overall score calculation
- Grade assignment (A-F)
- Component scores
- Recommendation generation

#### `tests/unit/config/ConfigLoader.test.ts` (14 tests)
Tests configuration loading and validation.

```bash
npm test -- tests/unit/config/ConfigLoader.test.ts
```

- File loading
- Configuration validation
- CLI option application
- Default configuration

#### `tests/unit/utils/logger.test.ts` (20 tests)
Tests logging functionality.

```bash
npm test -- tests/unit/utils/logger.test.ts
```

- Log levels
- Color support
- Table formatting
- Log retrieval and clearing

### Integration Tests: 20+ tests

#### `tests/integration/workflow.test.ts` (10 tests)
Tests complete analysis workflow.

```bash
npm test -- tests/integration/workflow.test.ts
```

- All analyzers together
- Configuration loading
- Report generation
- Error handling

#### `tests/integration/reporting.test.ts` (25 tests)
Tests all report formats.

```bash
npm test -- tests/integration/reporting.test.ts
```

- Console reporter
- JSON reporter
- HTML reporter
- CSV reporter
- Report consistency
- Performance

### End-to-End Tests: 10+ tests

#### `tests/e2e/cli-execution.test.ts` (15 tests)
Tests complete CLI execution.

```bash
npm test -- tests/e2e/cli-execution.test.ts
```

- Project validation
- Code quality detection
- Security detection
- Report generation
- Configuration files
- Option combinations

## Writing New Tests

### Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Feature } from '../src/feature';

describe('Feature', () => {
  let feature: Feature;

  beforeEach(() => {
    feature = new Feature();
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Method', () => {
    it('should do something', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = feature.method(input);

      // Assert
      expect(result).toBeDefined();
    });
  });
});
```

### Using Test Fixtures

```typescript
import {
  createMockCodeQualityMetrics,
  createDefaultConfig,
  createTempDir,
  cleanupTempDir,
} from '../test-utils';

it('should analyze with fixtures', async () => {
  const metrics = createMockCodeQualityMetrics();
  const config = createDefaultConfig();
  const tempDir = createTempDir();

  try {
    // Your test
  } finally {
    cleanupTempDir(tempDir);
  }
});
```

### Async Testing

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

it('should handle rejected promises', async () => {
  await expect(asyncFunction()).rejects.toThrow();
});
```

## Test Patterns

### AAA Pattern
```typescript
it('should calculate score', () => {
  // Arrange
  const metrics = createMockCodeQualityMetrics();

  // Act
  const score = calculateScore(metrics);

  // Assert
  expect(score).toBeGreaterThan(0);
});
```

### Mock Functions
```typescript
jest.mock('../logger');
import { logger } from '../logger';

it('should log errors', () => {
  feature.doSomething();
  expect(logger.error).toHaveBeenCalled();
});
```

### Error Testing
```typescript
it('should throw on invalid input', async () => {
  await expect(feature.process(null)).rejects.toThrow(Error);
});
```

## Debugging Tests

### Run Single Test
```bash
npm test -- tests/unit/types.test.ts -t "should throw ConfigurationError"
```

### Debug with Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Print Debug Info
```typescript
it('should work', () => {
  const result = feature.method();
  console.log('Result:', result);  // Will appear with --verbose
  expect(result).toBeDefined();
});
```

### Verbose Output
```bash
npm test -- --verbose
```

## Performance Testing

### Check Test Duration
```bash
npm test -- --listTests --verbose
```

### Identify Slow Tests
```bash
npm test -- --verbose 2>&1 | grep "ms"
```

### Profile Tests
```bash
npm test -- --detectOpenHandles
```

## Continuous Integration

### Pre-commit Hook
```bash
#!/bin/bash
npm test -- --coverage
exit $?
```

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

### GitLab CI
```yaml
test:
  script:
    - npm ci
    - npm test -- --coverage
  coverage: '/Lines\s+:\s+(\d+\.\d+)%/'
```

## Test Maintenance

### Update Tests When Code Changes
```bash
npm test -- --updateSnapshot
```

### Monitor Coverage Trends
```bash
npm test -- --coverage --coverageReporters=json
```

### Refactor Duplicated Tests
Look for repeated setup code and extract to helpers.

### Review Slow Tests
```bash
npm test -- --verbose
```

## Troubleshooting

### Tests Fail with Timeout
```bash
npm test -- --testTimeout=30000
```

### Module Not Found
Check `jest.config.js` moduleNameMapper settings.

### Coverage Below Threshold
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

### Tests Are Flaky
- Check for timing assumptions
- Ensure proper cleanup in afterEach
- Avoid hardcoded file paths

## Environment Variables

### Set in Tests
```typescript
beforeEach(() => {
  process.env.NODE_ENV = 'test';
  process.env.DEBUG = 'quality-validator:*';
});

afterEach(() => {
  delete process.env.DEBUG;
});
```

### From Command Line
```bash
DEBUG=* npm test
NODE_ENV=test npm test
```

## Test Reporting

### Generate Test Report
```bash
npm test -- --json --outputFile=test-results.json
```

### Pretty Print Results
```bash
npm test -- --verbose 2>&1 | tee test-results.txt
```

### Coverage Summary
```bash
npm test -- --coverage --coverageReporters=text-summary
```

## Best Practices

1. **Clear Test Names**: Describe what is being tested
   ```typescript
   it('should return score between 0 and 100', () => {})
   ```

2. **One Assertion Per Test**: Generally keep tests focused
   ```typescript
   it('should return positive number', () => {
     expect(result).toBeGreaterThan(0);
   });
   ```

3. **Use Descriptive Variable Names**
   ```typescript
   const validConfig = createDefaultConfig();
   const corruptedMetrics = { ...metrics, overall: null };
   ```

4. **Test Behavior, Not Implementation**
   ```typescript
   // Good
   expect(result.score).toBeGreaterThan(80);

   // Bad
   expect(result.score).toBe(calculateScore(input));
   ```

5. **DRY Up Test Code**: Extract common patterns
   ```typescript
   function createTestContext() {
     return {
       metrics: createMockCodeQualityMetrics(),
       config: createDefaultConfig(),
     };
   }
   ```

## Documentation

- **Detailed Guide**: `tests/README.md`
- **Test Summary**: `TEST_SUMMARY.md`
- **Sample Data**: `tests/fixtures/sampleData.ts`
- **Jest Docs**: https://jestjs.io/

## Support

For questions or issues:

1. Check `tests/README.md` for detailed documentation
2. Review test examples in each test file
3. Check Jest documentation
4. Run tests with `--verbose` for more details

---

**Last Updated**: 2025-01-20
**Test Suite Version**: 1.0.0
**Target Coverage**: 80%+
