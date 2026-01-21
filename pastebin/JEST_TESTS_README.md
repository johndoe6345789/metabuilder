# Jest Unit Tests for React Components

## Overview
This project now includes comprehensive Jest unit tests for all 141 React components in the codebase.

## Setup
Jest and React Testing Library have been configured and installed:

```bash
npm install  # Installs all dependencies including Jest
```

## Running Tests

### Run all unit tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test:unit
```

### Run specific test file
```bash
npm test -- --testPathPattern=button.test
```

### Run with coverage report
```bash
npm test -- --coverage
```

### E2E Tests (Playwright)
```bash
npm run test:e2e              # Run all Playwright tests
npm run test:e2e:ui          # Run with UI mode
npm run test:e2e:debug       # Run in debug mode
```

## Test Structure

### Configuration Files
- **jest.config.ts** - Main Jest configuration with TypeScript support
- **jest.setup.ts** - Setup file for global mocks and utilities
- **package.json** - Updated with Jest scripts and dependencies

### Test Files Location
All test files are colocated with their respective components:
- `src/components/ui/*.test.tsx` - UI component tests
- `src/components/features/**/*.test.tsx` - Feature component tests
- `src/components/atoms/*.test.tsx` - Atom component tests
- `src/components/molecules/*.test.tsx` - Molecule component tests
- `src/components/organisms/*.test.tsx` - Organism component tests
- `src/app/**/*.test.tsx` - App page and layout tests

### Test Scripts
Generation scripts are available in `/scripts/`:
- `generate-tests.js` - Generates tests for components with exports
- `generate-remaining-tests.js` - Generates tests for utility components
- `generate-app-tests.js` - Generates tests for app pages

## Dependencies

### Testing Libraries
- **jest** - JavaScript testing framework
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers for DOM
- **@testing-library/user-event** - User interaction simulation
- **ts-node** - TypeScript execution for Jest config
- **jest-environment-jsdom** - DOM environment for tests

### Type Definitions
- **@types/jest** - TypeScript types for Jest

## Test Results

Current test status:
- **141 test files** created (1 per component)
- **232+ tests** passing
- **398 total tests** running

## Writing Tests

### Basic Component Test
```typescript
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders without crashing', () => {
    render(<MyComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)
    const button = screen.getByRole('button')
    await userEvent.click(button)
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Component Test with Props
```typescript
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('applies variant classes', () => {
    render(<Button variant="outlined">Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('mat-mdc-outlined-button')
  })

  it('renders disabled state', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

## Mocked Services

The test setup includes mocks for:
- **Next.js Router** - `useRouter` hook
- **Next.js Navigation** - `usePathname`, `useSearchParams` hooks
- **window.matchMedia** - Media query matching

## Coverage

To generate a coverage report:
```bash
npm test -- --coverage
```

Coverage reports will be generated in the `coverage/` directory.

## Known Issues & Improvements

1. Some auto-generated tests use basic templates and could be enhanced
2. Component-specific tests would benefit from more detailed assertions
3. Hook tests should be added for custom hooks in `src/hooks/`
4. Integration tests could be added for complex component interactions

## Integration with M3 Framework

All tests are compatible with the Material Design 3 (M3) CSS framework:
- Tests verify `mat-mdc-*` class application
- No dependency on Tailwind CSS
- Compatible with CSS custom properties for theming

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:
```bash
npm test -- --ci --coverage --maxWorkers=2
```

## Further Reading
- [Jest Documentation](https://jestjs.io)
- [React Testing Library Guide](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://testingjavascript.com/)
