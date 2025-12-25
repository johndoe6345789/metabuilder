# Testing Documentation

Comprehensive guides for testing MetaBuilder applications using Vitest, React Testing Library, and Playwright.

## Documentation

- **[TESTING_GUIDELINES.md](./TESTING_GUIDELINES.md)** - Best practices and testing standards
- **[UNIT_TESTS_IMPLEMENTATION.md](./UNIT_TESTS_IMPLEMENTATION.md)** - Unit test implementation guide
- **[Quick Reference](./quick-reference.md)** - Common testing patterns and examples

## Quick Start

### Run Tests

```bash
# Watch mode (recommended during development)
npm test

# Run once
npm test -- --run

# With coverage report
npm run test:coverage

# Generate coverage report in markdown
npm run test:coverage:report
```

### Write a Test

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFunction', () => {
  it.each([
    { input: 1, expected: 2 },
    { input: 2, expected: 4 },
  ])('should return $expected for input $input', ({ input, expected }) => {
    expect(myFunction(input)).toBe(expected);
  });
});
```

## Test Types

### Unit Tests
- Single function/component in isolation
- Mock external dependencies
- Fast execution
- Located alongside source code (`.test.ts`)

### Integration Tests
- Multiple components working together
- Test real interactions
- May use test database
- Located in `e2e/` directory

### E2E Tests
- Full user workflows
- Test in real browser
- Use Playwright
- Located in `e2e/` directory

## Testing Standards

All tests should:
- ✅ Use parameterized testing with `it.each()`
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Have descriptive names
- ✅ Cover happy path + edge cases
- ✅ Be isolated and independent
- ✅ Run in < 1 second (unit tests)

## Key Principles

1. **Parameterized Tests** - Use `it.each()` to reduce code duplication
2. **Meaningful Names** - Describe what is being tested and expected
3. **One Assertion** - Each test should verify one behavior (usually)
4. **Isolation** - Tests should not depend on other tests
5. **Speed** - Unit tests should be fast
6. **Coverage** - Aim for > 80% coverage

## Common Patterns

### Testing Pure Functions
```typescript
it.each([
  { input: 'hello', expected: 'HELLO' },
  { input: '', expected: '' },
  { input: null, expected: null },
])('should convert $input correctly', ({ input, expected }) => {
  expect(toUpperCase(input)).toBe(expected);
});
```

### Testing Async Functions
```typescript
it.each([
  { userId: 1, shouldSucceed: true },
  { userId: 999, shouldSucceed: false },
])('should handle user $userId correctly', async ({ userId, shouldSucceed }) => {
  if (shouldSucceed) {
    const user = await fetchUser(userId);
    expect(user).toBeDefined();
  } else {
    await expect(fetchUser(userId)).rejects.toThrow();
  }
});
```

### Testing React Components
```typescript
it.each([
  { props: { disabled: true }, label: 'disabled' },
  { props: { disabled: false }, label: 'enabled' },
])('should render $label button', ({ props }) => {
  render(<Button {...props}>Click me</Button>);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

## File Structure

```
src/
├── lib/
│   ├── utils.ts           # Utility functions
│   ├── utils.test.ts      # Tests for utils
│   ├── schema-utils.ts    # Schema utilities
│   └── schema-utils.test.ts # Tests for schema-utils
│
├── hooks/
│   ├── useKV.ts           # Custom hook
│   └── useKV.test.ts      # Tests for hook
│
└── components/
    ├── Button.tsx         # Component
    └── Button.test.tsx    # Tests for component

e2e/
├── smoke.spec.ts          # Basic functionality
├── login.spec.ts          # Login flows
└── crud.spec.ts           # CRUD operations
```

## Tools Used

- **[Vitest](https://vitest.dev/)** - Unit testing framework
- **[React Testing Library](https://testing-library.com/react)** - Component testing
- **[Playwright](https://playwright.dev/)** - E2E testing
- **[Vite](https://vitejs.dev/)** - Build tool

## Coverage Goals

| Type | Target | Notes |
|------|--------|-------|
| Unit tests | > 80% | Core business logic |
| Integration tests | > 60% | Feature integration |
| E2E tests | > 40% | Critical user paths |

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Our Testing Guide](./TESTING_GUIDELINES.md)

## Next Steps

1. Read [TESTING_GUIDELINES.md](./TESTING_GUIDELINES.md)
2. Review [Quick Reference](./quick-reference.md)
3. Look at [example test files](#)
4. Start writing tests!

---

**Have questions?** Check the [full documentation index](../INDEX.md).
