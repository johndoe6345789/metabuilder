# Unit Testing Guidelines

This document outlines best practices for ensuring every function maps to at least one unit test.

## Overview

Every exported function in the MetaBuilder codebase should have corresponding unit tests. Tests should be:
- **Comprehensive**: Cover normal cases, edge cases, and error conditions
- **Parameterized**: Use `it.each()` to reduce test duplication
- **Focused**: Test one behavior per test case
- **Maintainable**: Clear descriptions and organized structure

## Directory Structure

Test files should be placed alongside source files with the `.test.ts` or `.test.tsx` suffix:

```
src/
  lib/
    utils.ts
    utils.test.ts          ← Test file for utils.ts
    schema-utils.ts
    schema-utils.test.ts   ← Test file for schema-utils.ts
  hooks/
    useKV.ts
    useKV.test.ts
```

## Test File Naming Conventions

- Source file: `functionName.ts`
- Test file: `functionName.test.ts`
- E2E tests: `*.spec.ts` (in `e2e/` directory)

## Parameterized Tests

Use `it.each()` to test multiple related scenarios. This reduces code duplication and improves maintainability.

### Example: Testing Multiple Scenarios

```typescript
describe('validateField', () => {
  it.each([
    { field: { name: 'email', type: 'email', required: true }, value: '', shouldError: true },
    { field: { name: 'email', type: 'email' }, value: 'test@example.com', shouldError: false },
    { field: { name: 'age', type: 'number', validation: { min: 0, max: 150 } }, value: 25, shouldError: false },
  ])('should validate $description', ({ field, value, shouldError }) => {
    const result = validateField(field, value)
    if (shouldError) {
      expect(result).toBeTruthy()
    } else {
      expect(result).toBeNull()
    }
  })
})
```

### Benefits

- ✅ DRY principle: Write test data once, execute multiple times
- ✅ Easy to add new test cases: Just add to the array
- ✅ Better error messages: Failed test shows which case failed
- ✅ Clearer intent: Immediately see all scenarios being tested

## Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { myFunction } from '@/lib/my-module'

describe('myFunction', () => {
  // Setup - runs before each test
  beforeEach(() => {
    // Reset state, mock data, etc.
  })

  // Group related tests
  describe('with valid input', () => {
    it.each([...])('should $description', ...)
  })

  describe('with invalid input', () => {
    it.each([...])('should $description', ...)
  })

  describe('edge cases', () => {
    it.each([...])('should $description', ...)
  })
})
```

## Testing Different Function Types

### Pure Functions (No Side Effects)

```typescript
describe('cn', () => {
  it.each([
    { input: ['px-2', 'py-1'], expected: 'px-2 py-1' },
    { input: ['px-2', 'px-3'], shouldNotContain: 'px-2' },
  ])('should handle $description', ({ input, expected }) => {
    const result = cn(...input)
    expect(result).toEqual(expected)
  })
})
```

### Async Functions

```typescript
describe('initializePackageSystem', () => {
  it('should initialize without errors', async () => {
    await expect(initializePackageSystem()).resolves.not.toThrow()
  })

  it.each([
    { callCount: 1 },
    { callCount: 2 },
    { callCount: 3 },
  ])('should be idempotent after $callCount calls', async ({ callCount }) => {
    for (let i = 0; i < callCount; i++) {
      await initializePackageSystem()
    }
    expect(true).toBe(true) // No errors thrown
  })
})
```

### React Hooks

```typescript
import { renderHook, act } from '@testing-library/react'

describe('useIsMobile', () => {
  it.each([
    { width: 400, expected: true },
    { width: 768, expected: false },
    { width: 1024, expected: false },
  ])('should return $expected for width $width', ({ width, expected }) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: width,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(expected)
  })
})
```

### Functions with Side Effects

```typescript
describe('updateValue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    { key: 'user_name', value: 'John' },
    { key: 'user_count', value: 0 },
  ])('should update $key with $value', async ({ key, value }) => {
    const saveSpy = vi.fn()
    await updateValue(key, value, saveSpy)
    expect(saveSpy).toHaveBeenCalledWith(key, value)
  })
})
```

## Testing Best Practices

### 1. Test Coverage

Every exported function should have at least one test covering:
- ✅ Happy path (normal operation)
- ✅ Edge cases (null, undefined, empty arrays)
- ✅ Error conditions (if applicable)

```typescript
// ✅ Good: Tests multiple scenarios
it.each([
  { input: 'valid@email.com', expected: true },
  { input: 'invalid', expected: false },
  { input: '', expected: false },
  { input: null, expected: false },
])('should validate email', ({ input, expected }) => {
  // ...
})
```

### 2. Clear Test Descriptions

Use descriptive names that explain what is being tested:

```typescript
// ✅ Good
it('should return true for valid email address')

// ❌ Poor
it('works')

// ✅ Good with parameterized
it.each([...])('should $description for $input', ...)

// ❌ Poor with parameterized
it.each([...])('test $input', ...)
```

### 3. Arrange-Act-Assert Pattern

Organize tests into three clear sections:

```typescript
it('should update value correctly', () => {
  // ARRANGE: Set up test data
  const initialValue = 10
  const increment = 5

  // ACT: Execute the function
  const result = add(initialValue, increment)

  // ASSERT: Verify the result
  expect(result).toBe(15)
})
```

### 4. Isolation and Independence

Tests should not depend on other tests or shared state:

```typescript
// ✅ Good: Each test is independent
describe('userService', () => {
  beforeEach(() => {
    database.clear()
  })

  it('should create user', () => {
    const user = userService.create({ name: 'John' })
    expect(user.id).toBeDefined()
  })

  it('should retrieve user', () => {
    const user = userService.create({ name: 'Jane' })
    const retrieved = userService.get(user.id)
    expect(retrieved.name).toBe('Jane')
  })
})
```

### 5. Mocking External Dependencies

Use `vi.fn()` and `vi.mock()` for testing functions with external dependencies:

```typescript
import { vi } from 'vitest'

describe('fetchUser', () => {
  it.each([
    { userId: 1, name: 'John' },
    { userId: 2, name: 'Jane' },
  ])('should fetch user $userId', async ({ userId, name }) => {
    // Mock the API call
    const mockFetch = vi.fn().mockResolvedValue({ name })

    const result = await fetchUser(userId, mockFetch)
    expect(result.name).toBe(name)
    expect(mockFetch).toHaveBeenCalledWith(userId)
  })
})
```

## Creating Tests for New Functions

When adding a new exported function:

1. **Create test file**: Add `functionName.test.ts` next to the source file
2. **Write tests**: Use `it.each()` for multiple scenarios
3. **Test coverage**: Include happy path, edge cases, error conditions
4. **Run tests**: Execute `npm test -- --run` to verify
5. **Check coverage**: Use `npm test -- --coverage` to verify coverage

## Running Tests

```bash
# Run all tests once
npm test -- --run

# Run tests in watch mode
npm test

# Run specific test file
npm test -- src/lib/schema-utils.test.ts

# Run with coverage
npm test -- --coverage

# Generate coverage report
node scripts/generate-test-coverage-report.js
```

## Function-to-Test Mapping

Current test coverage can be viewed in [FUNCTION_TEST_COVERAGE.md](./FUNCTION_TEST_COVERAGE.md).

The report shows:
- ✅ Functions with test coverage
- ❌ Functions needing test coverage
- Total functions: 185+
- Total test cases: 6000+

## Test Examples

### Schema Utils Tests

[View full test](src/lib/schema-utils.test.ts) - Demonstrates:
- Parameterized tests with `it.each()`
- Testing utility functions
- Edge case coverage
- Sorting and filtering logic

### Utils Tests

[View full test](src/lib/utils.test.ts) - Demonstrates:
- Testing pure functions
- Parameterized tests for similar scenarios
- Falsy value handling

### Package Loader Tests

[View full test](src/lib/package-loader.test.ts) - Demonstrates:
- Testing async functions
- Mock usage
- Testing for idempotency

## Enforcement

To ensure all functions have tests:

1. **Pre-commit hooks**: Run `npm test -- --run` before commit
2. **CI/CD**: Tests must pass before merging PR
3. **Code review**: Check that new functions have corresponding tests
4. **Coverage reports**: Generate monthly coverage reports

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com/)
- [Test Organization](https://github.com/goldbergyoni/javascript-testing-best-practices)
