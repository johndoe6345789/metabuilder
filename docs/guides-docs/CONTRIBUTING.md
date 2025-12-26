# Contributing Guide

How to contribute to MetaBuilder development.

## 📋 Table of Contents

- [Project Workflow (0-kickstart)](#project-workflow-0-kickstart)
- [Getting Started](#getting-started)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)

## Project Workflow (0-kickstart)

This repo follows `../.github/prompts/0-kickstart.md` as the current workflow source of truth. If anything here conflicts, prefer `0-kickstart.md`.

Key rules:
- Start with `../.github/prompts/0-kickstart.md` and other prompts as needed.
- Commit as you go with descriptive messages; default to trunk-based work on `main` unless a PR flow is required.
- Use `act` to diagnose GitHub workflows (`npm run act`, `npm run act:diagnose`).
- Keep unit tests parameterized; create new test files where possible; keep 1:1 source-to-test naming.
- Leave TODO comments for missing functionality.
- Check `./todo/` before starting.
- One lambda per file; classes are containers for related lambdas (see `../.github/prompts/LAMBDA_PROMPT.md`).
- Route data access through DBAL; treat it as the trusted layer.
- Design for flexibility, modularity, and containerization.
- UI work follows `./RADIX_TO_MUI_MIGRATION.md` and `../UI_STANDARDS.md`.

## Getting Started

### Prerequisites

- Node.js 18+
- Git
- npm or yarn

### Setting Up Development Environment

1. **Clone Repository**
   ```bash
   git clone <repo>
   cd metabuilder
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Run Tests**
   ```bash
   npm run test:e2e
   npm run lint
   ```

## Code Style

### TypeScript/React Conventions

1. **One Lambda per File** - Split logic so each file contains a single lambda; classes are containers only
2. **Naming** - Use PascalCase for components, camelCase for functions
3. **Imports** - Use absolute imports with `@/` prefix
4. **Props** - Define prop interfaces, use destructuring

Example:
```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}

// ❌ Bad - No props interface, too many lines
export function Button(props: any) {
  // ... 200 lines of code
}
```

### Styling

- Use Material-UI (`@mui/material`) components and the `sx` prop
- Avoid Tailwind utility classes and Radix UI imports
- Use `.module.scss` for custom component styles when needed
- Follow `../UI_STANDARDS.md` and `./UI_MIGRATION.md`

```typescript
// ✅ Good
import { Button, Box } from '@mui/material'

<Box sx={{ display: 'flex', gap: 2 }}>
  <Button variant="contained">Click me</Button>
</Box>
```

### Hooks & State Management

- Use React hooks (useState, useEffect, useContext)
- Keep hooks in separate hook files in `src/hooks/`
- Export from `src/hooks/index.ts` for easy importing

## Testing

### Running Tests

```bash
# Unit tests
npm run test:unit:watch

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

### Writing Tests

1. **Unit Tests** - Test individual functions in isolation with parameterized cases
   ```typescript
   it.each([
     { input: [1, 2, 3], expected: 6 },
     { input: [], expected: 0 },
   ])('calculates total correctly', ({ input, expected }) => {
     expect(calculateTotal(input)).toBe(expected)
   })
   ```

2. **E2E Tests** - Test complete user flows
   ```typescript
   test('user can create and edit item', async ({ page }) => {
     await page.goto('/');
     await page.fill('[name="title"]', 'Test');
     await page.click('button[type="submit"]');
     await expect(page.locator('text=Test')).toBeVisible();
   });
   ```

3. **Coverage** - Aim for 80%+ coverage on critical paths
4. **File Mapping** - Keep tests next to sources with matching names (`foo.ts` + `foo.test.ts`)

## Documentation

### Adding Documentation

1. **JSDoc Comments** - Document all exported functions and interfaces
   ```typescript
   /**
    * Calculates the sum of numbers
    * @param numbers - Array of numbers to sum
    * @returns The sum of all numbers
    * @example
    * const total = sum([1, 2, 3]); // 6
    */
   export function sum(numbers: number[]): number {
     return numbers.reduce((a, b) => a + b, 0);
   }
   ```

2. **README Files** - Keep README.md in key directories:
   - `/src/` - Source code overview
   - `/src/lib/` - Library utilities
   - `/src/components/` - Component library
   - `/packages/` - Modular packages

3. **Architecture Docs** - Document complex systems in `docs/architecture/`

4. **Examples** - Create `.example.tsx` files showing how to use components
5. **TODOs** - Leave TODO comments for missing functionality

### Running Quality Checker

```bash
# Check documentation quality
./scripts/doc-quality-checker.sh /workspaces/metabuilder

# With verbose output
./scripts/doc-quality-checker.sh /workspaces/metabuilder true
```

Target: **80%+** quality score

## Pull Request Process

Trunk-based work on `main` is the default. Use the PR process below only when a PR/feature branch flow is explicitly required (external contributions, review gates, or automation).

### Before Creating PR

1. **Run Linter**
   ```bash
   npm run lint
   ```

2. **Fix Issues**
   ```bash
   npm run lint:fix
   ```

3. **Run Tests**
   ```bash
   npm run test:e2e
   ```

4. **Update Documentation**
   - Add/update JSDoc comments
   - Update README if needed
   - Update architecture docs if design changes

### PR Template

```markdown
## Description
Briefly describe what this PR does.

## Changes
- Change 1
- Change 2
- Change 3

## Testing
How to test these changes:
1. Step 1
2. Step 2

## Checklist
- [ ] Tests pass
- [ ] Linter passes
- [ ] Documentation updated
- [ ] No breaking changes
```

### PR Review

- Address all review comments
- Keep commits clean and logical
- Update PR description if scope changes
- Ensure CI passes before merge

## 🚫 Common Mistakes

❌ **Don't:**
- Create components larger than 150 LOC
- Use CSS-in-JS or inline styles
- Hardcode values that should be configurable
- Skip tests for "simple" changes
- Forget to update documentation
- Commit without linting

✅ **Do:**
- Keep components focused and testable
- Use Tailwind CSS exclusively
- Make code reusable and configurable
- Test all code paths
- Document as you code
- Run linter before committing

## 🆘 Getting Help

TODO: Links below use ../docs/... from docs/CONTRIBUTING.md and resolve to docs/docs; update to correct relative paths (including security and copilot).

- **Architecture Questions**: See [docs/architecture/](../docs/architecture/)
- **API Questions**: See [API Development Guide](../docs/guides/api-development.md)
TODO: E2E tests guide lives under frontends/nextjs/e2e; update this link.
- **Testing Questions**: See [E2E Tests Guide](../../e2e/README.md)
- **Security Questions**: See [Security Guidelines](../docs/SECURITY.md)

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Playwright Testing](https://playwright.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)

## 🔗 Related

- [Development Guide](../docs/guides/api-development.md)
- [Architecture Overview](../docs/architecture/5-level-system.md)
- [Security Guidelines](../docs/SECURITY.md)
- [Copilot Instructions](./.github/copilot-instructions.md)
