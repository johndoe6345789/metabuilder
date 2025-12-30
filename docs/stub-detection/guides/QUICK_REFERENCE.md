# Stub Detection Quick Reference

## Key Stub Indicators

| Indicator | Severity | Example | Fix |
|-----------|----------|---------|-----|
| `throw new Error('not implemented')` | 🔴 Critical | See Pattern 1 | Implement function |
| `console.log()` only | 🟠 High | See Pattern 2 | Add real logic |
| `return null` | 🟡 Medium | See Pattern 3 | Return actual data |
| `<div>TODO</div>` | 🟠 High | See Pattern 4 | Implement component |
| Hard-coded mock data | 🟠 High | See Pattern 5 | Use real data source |
| `// TODO:` comment | 🟡 Medium | See Pattern 6 | Create issue, implement |
| Empty `<> </>` | 🟠 High | See Pattern 7 | Add component content |

## Run Locally

```bash
# Detect patterns
npx tsx scripts/detect-stub-implementations.ts

# Analyze completeness
npx tsx scripts/analyze-implementation-completeness.ts

# Generate report
npx tsx scripts/generate-stub-report.ts

# View JSON output
npx tsx scripts/detect-stub-implementations.ts | jq '.criticalIssues'
```

## Severity Breakdown

| Level | Completeness | Impact | Action |
|-------|--------------|--------|--------|
| 🔴 Critical | 0% | Breaks in production | Fix immediately |
| 🟠 High | 10-30% | Likely causes bugs | Fix before merge |
| 🟡 Medium | 40-70% | Partial implementation | Fix this sprint |
| 🟢 Low | 80-99% | Mostly complete | Fix this quarter |

## Common Fixes (Copy-Paste)

### Replace "Not Implemented" Error
```typescript
// Find this
throw new Error('not implemented')

// Replace with actual implementation
return implementation()
```

### Replace Console Logging
```typescript
// Find this
console.log(value)
return undefined

// Replace with
return processValue(value)
```

### Replace Mock Data
```typescript
// Find this
return [{ id: 1, name: 'Mock' }]

// Replace with
const data = await fetchRealData()
return data
```

### Replace TODO Comments
```typescript
// Find this
// TODO: implement feature

// Replace with issue and implementation:
// Implemented per issue #123
return implementation()
```

## Files to Check

Check these patterns first:

```bash
# Functions that throw
grep -r "throw new Error.*not implemented" src/

# Console logging only
grep -r "console\.log" src/ | grep -v "error\|warn"

# TODO comments
grep -r "TODO\|FIXME" src/

# Empty components
grep -r "<>\s*</>" src/

# Returning null
grep -r "return null" src/
```

## Workflow Output

### PR Comment Sections

- **Summary**: Total stubs and average completeness
- **Severity Breakdown**: Count by level
- **Issue Types**: Count by stub type
- **Critical Issues**: Files that need immediate fixes
- **Recommendations**: Next steps

### Artifacts

1. `stub-patterns.json` - Detailed pattern matches
2. `implementation-analysis.json` - Completeness scores
3. `stub-report.md` - Full markdown report
4. `changed-stubs.txt` - Stubs in changed files (PRs only)

## GitHub Actions Integration

Workflow runs:
- ✅ Every PR (to main/develop)
- ✅ Every push to main/master
- ✅ Weekly Monday check
- ✅ Manual trigger: `workflow_dispatch`

Creates:
- ✅ PR comment with summary
- ✅ GitHub check run
- ✅ Artifact uploads (30 days)

## Type Safety Trick

Use TypeScript types to force implementation:

```typescript
// ❌ Can return anything
function getValue() {
  // No implementation, no error!
}

// ✅ Must return string
function getValue(): string {
  // TypeScript error: missing return
  // FORCED to implement!
}
```

## Best Practices

```typescript
// ❌ DON'T
export function process(data) {
  // TODO: implement
  console.log('processing')
  return null
}

// ✅ DO
/**
 * Process incoming data
 * @param data - Data to process
 * @returns Processed result
 */
export function process(data: InputData): OutputData {
  return transform(data)
}
```

## Metrics Reference

| Metric | Score | Meaning |
|--------|-------|---------|
| Completeness | 0-100% | Est. % of implementation done |
| Logical Lines | Integer | Lines doing actual work |
| Return Lines | Integer | Number of return statements |
| JSX Lines | Integer | For components, UI rendering lines |

## Links

- [Full Documentation](README.md)
- [Detection Workflow](.github/workflows/detect-stubs.yml)
- [Detection Script](scripts/detect-stub-implementations.ts)
- [Pattern Examples](README.md#common-stub-patterns--fixes)

---

*Last updated: December 25, 2025*
