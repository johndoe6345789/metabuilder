# Package Unit Tests Documentation

This document describes the unit testing structure for all packages in the MetaBuilder platform.

## Overview

Each package in the `/packages` directory has its own `tests/` folder containing unit tests that validate:
- Package metadata structure
- Component definitions
- Configuration validation
- Data integrity

## Test Structure

```
packages/
├── admin_dialog/
│   └── tests/
│       ├── README.md
│       ├── metadata.test.ts
│       └── components.test.ts
├── dashboard/
│   └── tests/
│       ├── README.md
│       ├── metadata.test.ts
│       └── components.test.ts
├── data_table/
│   └── tests/
│       ├── README.md
│       ├── metadata.test.ts
│       └── components.test.ts
├── form_builder/
│   └── tests/
│       ├── README.md
│       ├── metadata.test.ts
│       └── components.test.ts
├── nav_menu/
│   └── tests/
│       ├── README.md
│       ├── metadata.test.ts
│       └── components.test.ts
└── notification_center/
    └── tests/
        ├── README.md
        ├── metadata.test.ts
        └── components.test.ts
```

## Running Tests

### Run all unit tests
```bash
npm run test:unit
```

### Run tests in watch mode
```bash
npm run test:unit:watch
```

### Run tests with UI
```bash
npm run test:unit:ui
```

### Run tests with coverage
```bash
npm run test:unit:coverage
```

### Run all tests (unit + e2e)
```bash
npm run test:all
```

## Test Coverage

### Metadata Tests
Each package includes `metadata.test.ts` that validates:
- Package ID format (lowercase with underscores)
- Semantic versioning format
- Required metadata fields
- Export configurations
- Dependency declarations

### Component Tests
Each package includes `components.test.ts` that validates:
- Component array structure
- Component ID and type fields
- Data integrity

## Testing Framework

- **Framework**: Vitest
- **Environment**: jsdom
- **Configuration**: `vitest.config.ts`

## CI/CD Integration

Unit tests are automatically run in the CI/CD pipeline on:
- Pull requests
- Push to main branch
- Manual workflow dispatch

## Adding New Tests

When creating a new package:

1. Create a `tests/` directory in the package folder
2. Add `metadata.test.ts` for metadata validation
3. Add `components.test.ts` for component validation
4. Add `README.md` documenting the tests
5. Follow the existing test patterns

### Example Test Template

```typescript
import { describe, it, expect } from 'vitest'
import metadata from '../seed/metadata.json'

describe('Package Name Metadata', () => {
  it('should have valid package structure', () => {
    expect(metadata.packageId).toBe('package_id')
    expect(metadata.name).toBeDefined()
    expect(metadata.version).toBeDefined()
  })

  it('should have semantic version', () => {
    expect(metadata.version).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
```

## Best Practices

1. **Keep tests focused**: Each test should validate one specific aspect
2. **Use descriptive names**: Test names should clearly state what is being tested
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Test edge cases**: Include tests for boundary conditions and error states
5. **Maintain independence**: Tests should not depend on execution order

## Troubleshooting

### Tests not found
Ensure the test file pattern matches `**/*.test.ts` or `**/*.test.tsx`

### Import errors
Check that the relative paths to seed data are correct

### Configuration issues
Verify `vitest.config.ts` includes the correct test paths

## Future Enhancements

- [ ] Add integration tests for package loading
- [ ] Add snapshot tests for component rendering
- [ ] Add performance benchmarks
- [ ] Add mutation testing
- [ ] Add visual regression tests
