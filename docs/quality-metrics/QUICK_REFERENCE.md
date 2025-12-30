# Quality Metrics Quick Reference

## At a Glance

| Metric | Tool | Threshold | Artifact |
|--------|------|-----------|----------|
| **Code Complexity** | AST analysis | Complexity ≤ 10 | `complexity-report.json` |
| **Test Coverage** | Vitest | ≥ 80% lines | `coverage-metrics.json` |
| **Security Issues** | Pattern scan | 0 critical | `security-report.json` |
| **JSDoc Coverage** | AST scan | ≥ 80% functions | `jsdoc-report.json` |
| **Bundle Size** | Webpack | ≤ 500KB | `bundle-analysis.json` |
| **File Size** | Line count | Components ≤ 300 lines | `file-sizes-report.json` |
| **Dependencies** | npm audit | 0 vulnerabilities | `npm-audit.json` |
| **Type Safety** | TypeScript | 0 errors | `ts-strict-report.json` |
| **ESLint Issues** | ESLint | 0 critical errors | `eslint-report.json` |
| **Circular Deps** | Import analysis | 0 cycles | `circular-deps.json` |

## Workflow Status Icons

- ✅ **Pass** - Metric meets or exceeds target
- ⚠️ **Warning** - Metric is borderline, needs attention
- ❌ **Fail** - Metric critically misses target
- ℹ️ **Info** - Metric for visibility (informational only)

## Common Issues & Fixes

### High Complexity

```typescript
// ❌ Complex function
function processData(data, filter, sort, format, validate) {
  if (validate) {
    if (data.length > 0) {
      if (filter) {
        // ...nested logic
      } else if (sort) {
        // ...more nesting
      }
    }
  }
}

// ✅ Break into smaller functions
function processData(data) {
  if (!validate(data)) return null
  data = filter(data)
  data = sort(data)
  return format(data)
}

function validate(data) { /* ... */ }
function filter(data) { /* ... */ }
function sort(data) { /* ... */ }
function format(data) { /* ... */ }
```

### Low Test Coverage

```typescript
// ❌ Function with no test
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ✅ Add tests
describe('calculateTotal', () => {
  it.each([
    { items: [], expected: 0 },
    { items: [{ price: 10 }], expected: 10 },
    { items: [{ price: 10 }, { price: 20 }], expected: 30 }
  ])('should return correct total', ({ items, expected }) => {
    expect(calculateTotal(items)).toBe(expected)
  })
})
```

### Security Issues

```typescript
// ❌ Dangerous code
const userContent = req.query.content
document.getElementById('output').innerHTML = userContent

// ✅ Safe alternatives
import DOMPurify from 'dompurify'
const sanitized = DOMPurify.sanitize(userContent)
document.getElementById('output').textContent = sanitized // or innerHTML with sanitized content
```

### Missing Documentation

```typescript
// ❌ No JSDoc
export function formatDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale).format(date)
}

// ✅ Add JSDoc
/**
 * Format a date according to locale-specific conventions
 * @param date - The date to format
 * @param locale - BCP 47 language tag (e.g., 'en-US')
 * @returns Formatted date string
 * @example
 * formatDate(new Date(), 'en-US') // "12/25/2025"
 */
export function formatDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale).format(date)
}
```

### Large Component

```typescript
// ❌ Component > 300 lines
export function Dashboard() {
  // 500 lines of JSX...
}

// ✅ Split into smaller components
export function Dashboard() {
  return (
    <div>
      <Header />
      <Sidebar />
      <MainContent />
      <Footer />
    </div>
  )
}
```

### Large Bundle

```typescript
// ❌ Import entire library
import moment from 'moment' // 67KB

// ✅ Import only what you need
import { format } from 'date-fns' // 2KB
// or use native Date API
const formatted = new Intl.DateTimeFormat('en-US').format(date)
```

## Metrics Details

### Code Complexity Calculation

Complexity counts decision points:
- `if`, `else if`, `else` → +1 each
- `for`, `while`, `do...while` → +1 each
- `case` in switch → +1 each
- `catch` → +1
- `&&`, `||` → +0.1 each (cumulative operators)

```typescript
// Complexity = 3
function example(x, y) {
  if (x > 0) {        // +1 = 2
    if (y > 0) {      // +1 = 3
      return x + y
    }
  }
  return 0
}
```

### Coverage Metrics

- **Line coverage**: % of lines executed
- **Statement coverage**: % of statements executed
- **Function coverage**: % of functions called
- **Branch coverage**: % of if/else branches taken

Target: ≥80% on lines, statements, functions; ≥75% on branches

### Security Severity Levels

- 🔴 **Critical** - Can cause data breach or RCE (Remote Code Execution)
- 🟠 **High** - Can cause significant damage if exploited
- 🟡 **Medium** - Needs specific conditions to exploit
- 🟢 **Low** - Theoretical risk or requires advanced exploitation

## Scripts Reference

```bash
# Run all metrics (local)
npm run test:unit:coverage            # Coverage
npm run lint                          # ESLint
npx tsc --noEmit                     # TypeScript
npx tsx scripts/check-code-complexity.ts
npx tsx scripts/security-scanner.ts
npx tsx scripts/check-file-sizes.ts

# View coverage report
open coverage/index.html

# Check specific metrics
npm run test:check-functions          # Function coverage
npm run size-limits                   # File size check
```

## CI/CD Integration

Metrics run automatically on:
- Every PR to `main`, `master`, `develop`
- Every push to `main`, `master`
- Manually via `workflow_dispatch`

Results posted as:
1. PR comment with summary table
2. Check run with detailed report
3. Artifacts (30-day retention)

## Setting Thresholds

Edit `.github/workflows/quality-metrics.yml` to change thresholds:

```yaml
# Example: Lower complexity threshold
- name: Check code complexity
  run: |
    npx tsx scripts/check-code-complexity.ts --max-complexity 8
```

Edit scripts directly to change hardcoded limits:

```typescript
// In scripts/check-file-sizes.ts
const MAX_FILE_SIZE = 500 // lines - change this
const MAX_COMPONENT_SIZE = 300 // lines - change this
```

## Recommendations by Team Role

### For Developers
- ✅ Run metrics locally before pushing
- ✅ Fix warnings, don't ignore them
- ✅ Add tests for new functions (target: 80%+)
- ✅ Keep functions < 50 lines
- ✅ Document public APIs with JSDoc

### For Reviewers
- ✅ Check PR metrics comment
- ✅ Request test coverage improvements
- ✅ Catch security issues early
- ✅ Flag complexity concerns

### For DevOps/Platform Teams
- ✅ Monitor trend over time
- ✅ Adjust thresholds as codebase matures
- ✅ Add new metrics as needs change
- ✅ Keep dependencies updated

## Links

- [Full Quality Metrics Documentation](./README.md)
- [GitHub Workflow Definition](../../.github/workflows/quality-metrics.yml)
- [Scripts Directory](../../scripts/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)

---

*Last updated: December 25, 2025*
