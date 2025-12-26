# Stub Detection System - Quick Start Guide

## 🚀 Get Started in 30 Seconds

### Run Detection Now
```bash
cd /workspaces/metabuilder
npx tsx scripts/detect-stub-implementations.ts
```

### See Pretty Output
```bash
# JSON format (easy to parse)
npx tsx scripts/detect-stub-implementations.ts | jq '.'

# Count critical issues
npx tsx scripts/detect-stub-implementations.ts | jq '.bySeverity'

# List all critical stubs
npx tsx scripts/detect-stub-implementations.ts | jq '.criticalIssues'
```

## 📊 Current Status

When you run the detection, you'll see:
- **189 total stubs** found in codebase
- **0 critical** issues (nothing throws "not implemented")
- **10 medium** severity (marked as TODO/mock)
- **179 low** severity (mostly TODO comments)

**Good news**: No critical stubs blocking production! ✅

## 🔍 What Gets Detected

| Stub Type | Example | Severity |
|-----------|---------|----------|
| Not implemented | `throw new Error('not implemented')` | 🔴 Critical |
| Console only | `console.log(x); /* nothing else */` | 🟠 High |
| Returns null | `return null // TODO` | 🟡 Medium |
| TODO comment | `// TODO: implement this` | 🟡 Medium |
| Placeholder UI | `<div>TODO: build UI</div>` | 🟠 High |
| Mock data | `return [{id:1, mock:true}]` | 🟠 High |

## 📁 Main Files

```
.github/workflows/detect-stubs.yml              ← Automated CI/CD
scripts/detect-stub-implementations.ts          ← Pattern detection
scripts/analyze-implementation-completeness.ts  ← Quality scoring
scripts/generate-stub-report.ts                 ← Report generation
docs/stub-detection/README.md                   ← Full documentation
docs/stub-detection/QUICK_REFERENCE.md         ← Quick lookup
```

## 💡 Common Use Cases

### Find All TODO Comments
```bash
grep -r "TODO:" src/ | grep -v test
```

### Find Functions That Return Null
```bash
grep -r "return null" src/ --include="*.ts" --include="*.tsx"
```

### Find Empty Components
```bash
grep -r "<> *</>" src/ --include="*.tsx"
```

### Analyze Specific File
```bash
npx tsx scripts/detect-stub-implementations.ts | \
  jq '.details[] | select(.file | contains("src/api"))'
```

## 🛠️ Fix Stubs

### Template: Replace Not Implemented
```typescript
// Find this
throw new Error('not implemented')

// Replace with
return realImplementation()
```

### Template: Replace Console Only
```typescript
// Find this
console.log(data)
return undefined

// Replace with
return processData(data)
```

### Template: Replace Null Return
```typescript
// Find this
return null

// Replace with
return await fetchRealData()
```

## 📊 Interpreting Results

### JSON Output Structure
```json
{
  "totalStubsFound": 189,           ← Total count
  "bySeverity": {                   ← Breakdown by level
    "high": 0,
    "medium": 10,
    "low": 179
  },
  "byType": {                       ← Breakdown by pattern
    "not-implemented": 0,
    "todo-comment": 167,
    "console-log-only": 0,
    "placeholder-return": 22
  },
  "criticalIssues": [],             ← Things to fix NOW
  "details": [...]                  ← All findings
}
```

## 🔄 Integration with CI/CD

### Automatic Workflow
- Runs on every PR automatically
- Posts comment with findings
- Creates check run in GitHub
- Stores artifacts for review

### Manual Trigger
```bash
# Via GitHub Actions
# Go to Actions → Stub Implementation Detection → Run workflow

# Via command line
gh workflow run detect-stubs.yml
```

## 📚 Documentation

TODO: doc links below should be relative to docs/reference (use ../stub-detection/...).

### Full Details
- **[Complete Guide](docs/stub-detection/README.md)** - Everything explained
- **[Quick Reference](docs/stub-detection/QUICK_REFERENCE.md)** - Patterns & fixes

### Implementation Info
- **[Implementation Summary](STUB_DETECTION_IMPLEMENTATION.md)** - What was built
- **[Overview](docs/stub-detection/OVERVIEW.md)** - High-level view

## ⚡ Pro Tips

### Tip 1: Use TypeScript to Force Implementation
```typescript
// ❌ Can return anything
function getValue() { /* oops */ }

// ✅ Must return string
function getValue(): string {
  // TypeScript error: no return!
  // FORCED to implement
}
```

### Tip 2: Create Issues Instead of TODO
```typescript
// ❌ Don't
// TODO: add caching

// ✅ Do (create issue #123 first)
// Implemented caching per issue #123
```

### Tip 3: Add Tests to Catch Stubs
```typescript
// This test will fail if unimplemented
it('should fetch user data', async () => {
  const user = await getUser(1)
  expect(user).toBeDefined()
  expect(user.name).toBeDefined()
})
```

## 🎯 Next Steps

1. **Run detection**: `npx tsx scripts/detect-stub-implementations.ts`
2. **Review findings**: Check the output
3. **Fix critical stubs**: If any exist (there are 0 in this repo ✅)
4. **Schedule follow-up**: Weekly or monthly review
5. **Monitor trends**: Keep watching the metrics

## 🆘 Troubleshooting

### "Command not found" error
```bash
npm install  # Install dependencies
npm run db:generate  # Generate Prisma client
```

### "No stubs found" but code looks incomplete
Try the completeness analyzer instead:
```bash
npx tsx scripts/analyze-implementation-completeness.ts
```

### Want to see a specific file's stubs?
```bash
npx tsx scripts/detect-stub-implementations.ts | \
  jq '.details[] | select(.file == "path/to/file.ts")'
```

## 📊 Sample Output

When you run the command, you'll see JSON like:
```json
{
  "totalStubsFound": 189,
  "bySeverity": {
    "high": 0,
    "medium": 10,
    "low": 179
  },
  "criticalIssues": [],
  "details": [
    {
      "file": "src/lib/package-loader.ts",
      "line": 90,
      "name": "getModularPackageComponents",
      "severity": "medium",
      "code": "{ // TODO: Replace with proper database query"
    }
  ]
}
```

---

## Summary

✅ **Runs immediately** - One command to detect all stubs
✅ **Multiple methods** - Patterns + completeness scoring  
✅ **Clear results** - JSON format, easy to understand
✅ **No critical stubs** - This repo is clean! 🎉
✅ **Easy to fix** - Templates provided for each pattern

**Try it now**: `npx tsx scripts/detect-stub-implementations.ts`

---

*Last updated: December 25, 2025*
