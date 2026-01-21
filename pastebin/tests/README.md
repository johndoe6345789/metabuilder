# Quality Validator Test Suite

Comprehensive test suite for the Quality Validation CLI Tool with >80% code coverage.

## Overview

This test suite provides production-grade testing covering:

- **Unit Tests**: ~60 tests for individual components and modules
- **Integration Tests**: ~20 tests for multi-component workflows
- **End-to-End Tests**: ~10 tests for complete CLI execution
- **Total Coverage**: >80% code coverage across all modules

## Test Structure

```
tests/
├── setup.ts                          # Jest configuration and setup
├── test-utils.ts                     # Shared test utilities and fixtures
├── unit/                             # Unit tests
│   ├── types.test.ts                # Type definitions
│   ├── analyzers/
│   │   ├── codeQualityAnalyzer.test.ts
│   │   ├── coverageAnalyzer.test.ts
│   │   ├── architectureChecker.test.ts
│   │   └── securityScanner.test.ts
│   ├── scoring/
│   │   └── scoringEngine.test.ts
│   ├── config/
│   │   └── ConfigLoader.test.ts
│   └── utils/
│       └── logger.test.ts
├── integration/
│   └── workflow.test.ts              # End-to-end workflow tests
├── e2e/
│   └── cli-execution.test.ts         # Complete CLI execution tests
└── README.md                         # This file
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test -- tests/unit/analyzers/codeQualityAnalyzer.test.ts
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="Code Quality"
```

### Run Only Unit Tests
```bash
npm test -- tests/unit
```

### Run Only Integration Tests
```bash
npm test -- tests/integration
```

### Run Only E2E Tests
```bash
npm test -- tests/e2e
```

## Test Coverage

Target coverage thresholds:
- **Lines**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Statements**: 80%

Check coverage report:
```bash
npm test -- --coverage
```

HTML coverage report will be generated in `coverage/lcov-report/index.html`

## Test Categories

### Unit Tests

Individual component testing with mocked dependencies.

#### Type Definitions (`types.test.ts`)
- Error class hierarchy
- Exit code enum values
- Type compatibility

#### Analyzers (`analyzers/*.test.ts`)

**Code Quality Analyzer**
- Complexity detection
- Duplication analysis
- Linting violations
- Score calculation
- Finding generation

**Coverage Analyzer**
- Coverage data parsing
- Effectiveness scoring
- Gap identification
- File-level metrics

**Architecture Checker**
- Component classification
- Dependency analysis
- Circular dependency detection
- Pattern compliance
- Component size validation

**Security Scanner**
- Hard-coded secret detection
- XSS vulnerability detection
- Unsafe DOM manipulation
- Performance issues
- Vulnerability scanning

#### Scoring Engine (`scoring/scoringEngine.test.ts`)
- Weighted score calculation
- Grade assignment (A-F)
- Pass/fail status determination
- Component score breakdown
- Recommendation generation

#### Config Loader (`config/ConfigLoader.test.ts`)
- Configuration loading
- File parsing
- Validation rules
- CLI option application
- Default configuration

#### Logger (`utils/logger.test.ts`)
- Log level handling
- Color support
- Context data
- Table formatting

### Integration Tests

Multi-component workflow testing.

#### Workflow Integration (`integration/workflow.test.ts`)
- Complete analysis workflow
- Configuration loading and precedence
- All analyzers working together
- Report generation chain
- Error handling and recovery

### End-to-End Tests

Complete CLI execution with real file systems.

#### CLI Execution (`e2e/cli-execution.test.ts`)
- Complete project validation
- Code quality issue detection
- Security issue detection
- Report generation (JSON, HTML, CSV)
- Configuration file usage
- Option combinations
- Multiple flag handling

## Test Utilities

### Fixture Builders

```typescript
// Create mock metrics
createMockCodeQualityMetrics(overrides)
createMockTestCoverageMetrics(overrides)
createMockArchitectureMetrics(overrides)
createMockSecurityMetrics(overrides)

// Create default configuration
createDefaultConfig()

// Create mock finding
createMockFinding(overrides)

// Create complete analysis result
createCompleteAnalysisResult(category, score)
```

### File System Helpers

```typescript
// Create temporary test directory
tempDir = createTempDir()

// Clean up after tests
cleanupTempDir(tempDir)

// Create test files
createTestFile(dirPath, fileName, content)

// Mock file system operations
mockFs = new MockFileSystem()
mockFs.readFile(path)
mockFs.writeFile(path, content)
mockFs.fileExists(path)
```

### Async Utilities

```typescript
// Wait for async operations
await wait(ms)
```

## Writing New Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Feature Name', () => {
  let component: Component;
  let tempDir: string;

  beforeEach(() => {
    // Setup
    component = new Component();
    tempDir = createTempDir();
  });

  afterEach(() => {
    // Cleanup
    cleanupTempDir(tempDir);
  });

  it('should do something', async () => {
    // Arrange
    const input = 'test';

    // Act
    const result = await component.process(input);

    // Assert
    expect(result).toBeDefined();
  });
});
```

### Testing Async Code

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Errors

```typescript
it('should throw ConfigurationError for invalid config', async () => {
  await expect(loader.loadConfiguration('/invalid')).rejects.toThrow(ConfigurationError);
});
```

### Testing with Fixtures

```typescript
it('should analyze metrics correctly', () => {
  const metrics = createMockCodeQualityMetrics({
    complexity: { distribution: { critical: 5, warning: 10, good: 85 } }
  });

  const score = calculator.calculateScore(metrics);
  expect(score).toBeLessThan(100);
});
```

## Common Testing Patterns

### AAA Pattern (Arrange, Act, Assert)

```typescript
it('should calculate score correctly', () => {
  // Arrange
  const metrics = createMockCodeQualityMetrics();
  const calculator = new ScoringEngine();

  // Act
  const score = calculator.calculateScore(metrics);

  // Assert
  expect(score).toBeGreaterThan(0);
  expect(score).toBeLessThanOrEqual(100);
});
```

### Testing with Temp Directories

```typescript
beforeEach(() => {
  tempDir = createTempDir();
});

afterEach(() => {
  cleanupTempDir(tempDir);
});

it('should read files from directory', () => {
  const filePath = createTestFile(tempDir, 'test.ts', 'const x = 1;');
  // ... test file reading
});
```

### Mocking Dependencies

```typescript
jest.mock('../../../src/lib/quality-validator/utils/logger.js');

it('should log errors', () => {
  analyzer.analyze([]);
  expect(logger.error).toHaveBeenCalled();
});
```

## Debugging Tests

### Run Single Test
```bash
npm test -- tests/unit/types.test.ts
```

### Run with Verbose Output
```bash
npm test -- --verbose
```

### Run with Debug Logging
```bash
DEBUG=* npm test
```

### Use Node Debugger
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Performance Benchmarks

Target test execution times:
- **Unit Tests**: <20 seconds
- **Integration Tests**: <10 seconds
- **E2E Tests**: <10 seconds
- **Total**: <30 seconds

Check timing:
```bash
npm test -- --verbose
```

## CI/CD Integration

Tests are designed for CI/CD pipelines:

```yaml
# GitHub Actions Example
- name: Run Tests
  run: npm test -- --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## Known Limitations

1. **npm audit**: Requires internet connection for vulnerability checks
2. **File System**: Tests use temporary directories that are cleaned up
3. **Concurrency**: Tests run in parallel (configure in jest.config.js if needed)
4. **Environment**: Tests assume Node.js environment

## Troubleshooting

### Tests Timeout
Increase timeout in jest.config.js:
```javascript
testTimeout: 15000  // 15 seconds
```

### Module Not Found
Ensure paths in tsconfig.json match imports:
```typescript
import { logger } from '@/utils/logger';
```

### Cleanup Issues
Check that `afterEach` properly cleans temporary directories:
```typescript
afterEach(() => {
  cleanupTempDir(tempDir);
});
```

### Coverage Not Meeting Threshold
Check coverage report to identify missing lines:
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure >80% coverage for new code
3. Follow existing test patterns
4. Use descriptive test names
5. Add comments for complex test logic
6. Update this README if adding new test categories

## Test Maintenance

- Review and update tests when code changes
- Keep fixtures up-to-date with schema changes
- Monitor coverage reports
- Refactor tests to avoid duplication
- Update documentation as needed

## Related Documentation

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Quality Validator README](../README.md)
