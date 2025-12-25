# Source Unit Tests

This directory contains integration tests for the MetaBuilder platform.

## Test Files

- `package-integration.test.ts` - Tests package system integration and validation

## Package Integration Tests

The integration tests validate:
- Unique package IDs across all packages
- Semantic versioning compliance
- Complete metadata for all packages
- Valid category assignments
- Export configurations
- Dependency declarations
- No circular dependencies
- All dependencies reference valid packages

## Running Tests

```bash
npm run test:unit
```

## Adding New Tests

When adding new integration tests:
1. Create test files with `.test.ts` extension
2. Import from `vitest`
3. Use descriptive test names
4. Follow existing patterns
