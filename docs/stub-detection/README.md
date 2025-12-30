# Stub Implementation Detection Guide

## Overview

Stub detection automatically identifies incomplete, placeholder, or mock implementations in the codebase. This prevents accidental deployment of unfinished code and helps teams track what still needs to be completed.

## What is a Stub?

A stub is a function or component that:
- Throws "not implemented" errors
- Returns placeholder values (null, empty objects, mock data)
- Contains TODO/FIXME comments indicating incomplete work
- Only logs to console without doing real work
- Has minimal/empty implementation
- Contains placeholder text in UI

## Detection Methods

### 1. Pattern-Based Detection

Scans code for specific patterns that indicate stubs:

#### Error Throwing
```typescript
// ❌ Detected as stub
export function processData(data) {
  throw new Error('not implemented')
}
```

#### Console Logging Only
```typescript
// ❌ Detected as stub
export function validateEmail(email) {
  console.log('validating:', email) // Nothing else
}
```

#### Null/Undefined Returns
```typescript
// ❌ Detected as stub
export function fetchData() {
  return null
}
```

#### Placeholder Text
```typescript
// ❌ Detected as stub
function Dashboard() {
  return <div>TODO: Build dashboard</div>
}
```

#### Mock Data with Markers
```typescript
// ❌ Detected as stub
export function getUsers() {
  return [ // stub data
    { id: 1, name: 'John' }
  ]
}
```

### 2. Completeness Analysis

Analyzes implementation quality:

- **Logical Lines**: Actual code (excluding returns and comments)
- **Return Lines**: How many return statements
- **JSX Lines**: For components, how much actual UI
- **Completeness Score**: 0-100% based on implementation density

**Scoring**:
- **0%**: Throws not implemented error
- **0-30%**: Critical (only logging, returning null, no real logic)
- **30-60%**: Medium (minimal implementation, mostly mock data)
- **60-80%**: Low (mostly complete, some placeholders)
- **80-100%**: Good (real implementation)

### 3. Code Indicators

Detects special markers:

| Indicator | Severity | Meaning |
|-----------|----------|---------|
| `throw new Error('not implemented')` | Critical | Explicitly unimplemented |
| `// TODO:` or `// FIXME:` | Medium | Known issue, incomplete |
| `console.log()` only | High | Debug logging, not real code |
| `// mock`, `// stub` | Medium | Explicitly marked placeholder |
| `return null` | Low | Empty return value |
| `<> </>` | High | Empty component fragment |

## Workflow Integration

### Automatic Detection

The `detect-stubs.yml` workflow runs:

- On every PR (to flag new stubs)
- On every push to main/master
- Weekly scheduled (Monday midnight)

### PR Comments

Posts a summary comment showing:
- Total stubs found
- Severity breakdown
- Critical issues with file/line/function
- Recommendations for fixes

Example:
```
## 🔍 Stub Implementation Detection Report

### Summary
- Pattern-Based Stubs: 5
- Low Completeness Items: 3
- Average Completeness: 72%

### Severity Breakdown
- 🔴 Critical: 2
- 🟠 Medium: 2
- 🟡 Low: 1

### 🔴 Critical Issues Found
| File | Line | Function | Type |
|------|------|----------|------|
| src/api/users.ts | 42 | fetchUsers | throws-not-implemented |
| src/components/Dashboard.tsx | 15 | Dashboard | empty-fragment |
```

## Local Usage

### Run Detection Locally

```bash
# Pattern-based stub detection
npx tsx scripts/detect-stub-implementations.ts

# Completeness analysis
npx tsx scripts/analyze-implementation-completeness.ts

# Generate detailed report
npx tsx scripts/generate-stub-report.ts

# All three
npm run detect-stubs
```

### Output Formats

All scripts output JSON for programmatic access:

#### Pattern Detection Output
```json
{
  "totalStubsFound": 5,
  "bySeverity": {
    "high": 2,
    "medium": 2,
    "low": 1
  },
  "byType": {
    "not-implemented": 2,
    "todo-comment": 1,
    "console-log-only": 1,
    "returns-empty-value": 1
  },
  "criticalIssues": [
    {
      "file": "src/api/users.ts",
      "line": 42,
      "function": "fetchUsers",
      "type": "not-implemented"
    }
  ]
}
```

#### Completeness Analysis Output
```json
{
  "totalAnalyzed": 45,
  "bySeverity": {
    "critical": 2,
    "high": 5,
    "medium": 8,
    "low": 12
  },
  "flagTypes": {
    "has-todo-comments": 5,
    "throws-not-implemented": 2,
    "only-console-log": 1
  },
  "averageCompleteness": 72.4,
  "criticalStubs": [
    {
      "file": "src/api/users.ts",
      "line": 42,
      "name": "fetchUsers",
      "type": "function",
      "flags": ["throws-not-implemented"],
      "summary": "Potential stub: throws-not-implemented"
    }
  ]
}
```

## Common Stub Patterns & Fixes

### Pattern 1: Not Implemented Error

**Problem**: Function explicitly throws unimplemented error
**Severity**: 🔴 Critical
**Fix**: Implement the function

```typescript
// ❌ Before
export async function fetchUserData(id: string) {
  throw new Error('not implemented')
}

// ✅ After
export async function fetchUserData(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) throw new Error(`Failed to fetch user ${id}`)
  return response.json()
}
```

### Pattern 2: Console Logging Only

**Problem**: Function only logs without doing real work
**Severity**: 🟠 High
**Fix**: Replace logging with actual implementation

```typescript
// ❌ Before
export function calculateTotal(items: Item[]): number {
  console.log('calculating total for:', items)
  // nothing else
}

// ✅ After
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

### Pattern 3: Return Null/Undefined

**Problem**: Function returns null or undefined
**Severity**: 🟡 Medium
**Fix**: Return actual data or use types to force implementation

```typescript
// ❌ Before
export function getConfig() {
  return null // TODO: load config
}

// ✅ After
export function getConfig(): Config {
  return configLoader.load()
}
```

### Pattern 4: Placeholder Component

**Problem**: Component renders placeholder text instead of UI
**Severity**: 🟠 High
**Fix**: Implement the component properly

```typescript
// ❌ Before
export function Dashboard() {
  return <div>TODO: Build dashboard</div>
}

// ✅ After
export function Dashboard() {
  return (
    <div className="dashboard">
      <Header />
      <Sidebar />
      <MainContent />
    </div>
  )
}
```

### Pattern 5: Mock Data

**Problem**: Function returns hardcoded mock data
**Severity**: 🟠 Medium
**Fix**: Replace with real data source

```typescript
// ❌ Before
export function getUsers(): User[] {
  return [ // mock data
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' }
  ]
}

// ✅ After
export async function getUsers(): Promise<User[]> {
  const data = await Database.query('SELECT * FROM users')
  return data.map(row => new User(row))
}
```

### Pattern 6: TODO Comments

**Problem**: Code has TODO/FIXME comments indicating incomplete work
**Severity**: 🟡 Medium/Low
**Fix**: Create GitHub issue and remove TODO from code

```typescript
// ❌ Before
export function validateEmail(email: string): boolean {
  // TODO: Add real email validation
  return true
}

// ✅ After (create issue #123 first)
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

### Pattern 7: Empty Component

**Problem**: Component has minimal or empty JSX
**Severity**: 🟠 High
**Fix**: Implement the component's UI

```typescript
// ❌ Before
export function UserList() {
  return <div></div>
}

// ✅ After
export function UserList() {
  const users = useQuery('users')
  return (
    <div className="user-list">
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

## Best Practices

### 1. Never Leave Stubs in Main Branch

```bash
# Before merging, ensure no stubs in changed files
git diff HEAD~1 -- 'src/**/*.ts' | grep -i 'todo\|not implemented'
```

### 2. Use Types to Force Implementation

```typescript
// ❌ Function can return anything
function getValue() {
  // oops, forgot to implement
}

// ✅ Type forces implementation
function getValue(): string {
  // TypeScript error: missing return
  // MUST implement
}
```

### 3. Create Issues Instead of TODOs

```typescript
// ❌ Don't do this
function processData(data) {
  // TODO: add caching (#TBD)
  return compute(data)
}

// ✅ Do this
// Implemented cache per issue #456
const cache = new LRUCache()
function processData(data) {
  return cache.getOrCompute(data, () => compute(data))
}
```

### 4. Test Stubs Explicitly

```typescript
// Make stubs fail tests explicitly
describe('getUsers', () => {
  it('should fetch users from API', async () => {
    // This WILL fail if implementation is missing
    const users = await getUsers()
    expect(users).toBeDefined()
    expect(users.length).toBeGreaterThan(0)
    expect(users[0].name).toBeDefined()
  })
})
```

### 5. Use Linting to Prevent Stubs

Add ESLint rules to `.eslintrc.json`:

```json
{
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "no-throw-literal": "error",
    "no-empty-function": ["error", { "allow": ["arrowFunctions"] }]
  }
}
```

## Interpreting the Report

### Severity Levels

- **🔴 Critical** (Completeness: 0%)
  - Blocks production
  - Must fix immediately
  - Examples: `throw new Error('not implemented')`

- **🟠 High** (Completeness: 10-30%)
  - Should fix before merge
  - Likely causes bugs
  - Examples: Console logging only, empty components

- **🟡 Medium** (Completeness: 40-70%)
  - Should fix soon
  - Partial implementation
  - Examples: Mock data, basic structure

- **🟢 Low** (Completeness: 80-99%)
  - Nice to fix
  - Mostly complete
  - Examples: Minor TODOs, edge cases

### Metrics Explained

| Metric | Meaning |
|--------|---------|
| Logical Lines | Lines that do actual work (not returns/comments) |
| Return Lines | Number of return statements |
| JSX Lines | For components, lines rendering UI |
| Completeness | Estimated % of implementation done |
| Flags | Detected stub indicators |

## Artifacts

The workflow uploads three artifacts:

1. **stub-patterns.json** - Raw pattern detection data
2. **implementation-analysis.json** - Completeness scoring
3. **stub-report.md** - Formatted markdown report
4. **changed-stubs.txt** - Stubs in changed files (PRs only)

Available for 30 days after workflow run.

## CI/CD Integration

### Failing Builds

The workflow runs with `continue-on-error: true`, so stubs don't block merging. However, you can:

1. Enable stricter linting to fail on TODOs
2. Require test coverage (which fails with stubs)
3. Use branch protection rules to require review of detected stubs

### GitHub Checks

- Posts check run with stub detection results
- Shows in PR checks section
- Includes summary of critical issues

## Troubleshooting

### "No stubs found" but code looks incomplete

- Patterns may not match your specific style
- Check individual function with completeness analyzer
- Consider adding custom patterns to detection script

### Too many false positives

- Edit `STUB_PATTERNS` in `detect-stub-implementations.ts`
- Adjust completeness thresholds in `analyze-implementation-completeness.ts`
- Add file/function exclusions

### Stubs not showing in PR comment

- Check workflow permissions (needs `pull-requests: write`)
- Verify GitHub API isn't rate limited
- Check workflow logs for errors

## Extension Points

### Add Custom Patterns

Edit `scripts/detect-stub-implementations.ts`:

```typescript
const STUB_PATTERNS = [
  // ... existing patterns
  {
    name: 'Your custom pattern',
    pattern: /your regex here/,
    type: 'custom-stub',
    severity: 'high',
    description: 'Your description'
  }
]
```

### Add Custom Analysis

Create new script in `scripts/`:

```bash
npx tsx scripts/my-custom-analysis.ts > my-report.json
```

Then add to workflow in `.github/workflows/detect-stubs.yml`.

## References

- [Workflow Definition](.github/workflows/detect-stubs.yml)
- [Detection Script](scripts/detect-stub-implementations.ts)
- [Completeness Analyzer](scripts/analyze-implementation-completeness.ts)
- [Report Generator](scripts/generate-stub-report.ts)

---

**Last updated**: December 25, 2025
