# 🚀 Quick Start Guide: Size Limits & Refactoring

## What Was Done?

A **code size limit enforcement system** was created for MetaBuilder to maintain code quality and architectural standards.

## 📏 The Rules

Each TypeScript/React file must stay under:
- **150 lines of code** (actual code, not comments/blanks)
- **200 total lines** (including comments)
- **3 levels of nesting** max
- **5-10 exports** per file
- **5 function parameters** max

## 🛠️ How to Check

Run this command to check if your code violates any limits:

```bash
npx tsx /workspaces/metabuilder/scripts/enforce-size-limits.ts
```

**Success output:**
```
✅ All files comply with size limits!
```

**Failure output:**
```
❌ ERRORS (3):
  📄 src/components/MyComponent.tsx
     Lines of Code (LOC): 187 / 150
```

## 📋 How to Refactor (Step by Step)

### Step 1: Identify the Problem
```bash
# Check which files are too large
npx tsx /workspaces/metabuilder/scripts/enforce-size-limits.ts
```

### Step 2: Extract Business Logic
Create a custom hook in `src/hooks/`:

```typescript
// src/hooks/useMyFeature.ts
import { useState, useCallback } from 'react'

export function useMyFeature() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      // Your logic here
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { data, isLoading, fetch }
}
```

### Step 3: Create Small UI Components
Break rendering into focused components:

```typescript
// src/components/MyItem.tsx
export function MyItem({ item, onSelect }) {
  return (
    <div onClick={() => onSelect(item)}>
      <h3>{item.title}</h3>
    </div>
  )
}
```

### Step 4: Connect with Container
Create a small container that glues everything together:

```typescript
// src/components/MyFeature.tsx
import { useMyFeature } from '@/hooks/useMyFeature'
import { MyItem } from './MyItem'

export function MyFeature() {
  const { data, isLoading, fetch } = useMyFeature()

  return (
    <div>
      {isLoading ? <p>Loading...</p> : null}
      {data?.map(item => (
        <MyItem key={item.id} item={item} />
      ))}
    </div>
  )
}
```

### Step 5: Verify
```bash
# Check your changes pass the limit
npx tsx /workspaces/metabuilder/scripts/enforce-size-limits.ts
```

## 🎯 Available Hooks

Pre-made hooks you can use:

### `useGitHubFetcher`
Fetch GitHub workflow runs:
```typescript
const { data, isLoading, error, fetch } = useGitHubFetcher()
```

### `useAutoRefresh`
Auto-refresh at intervals:
```typescript
const { isAutoRefreshing, toggleAutoRefresh } = useAutoRefresh({
  intervalMs: 30000,
  onRefresh: () => fetch(),
})
```

### `useFileTree`
Manage file tree structure:
```typescript
const { files, addChild, deleteNode } = useFileTree(initialFiles)
```

### `useCodeEditor`
Manage code editor state:
```typescript
const { activeFile, openFile, saveFile } = useCodeEditor()
```

See `src/hooks/index.ts` for all available hooks.

## 📚 Detailed Resources

- **Full Guide**: `docs/REFACTORING_ENFORCEMENT_GUIDE.md`
- **Quick Reference**: `docs/REFACTORING_QUICK_REFERENCE.md`
- **Strategy**: `docs/REFACTORING_STRATEGY.md`
- **Examples**: Look at `src/components/GitHubActionsFetcher.refactored.tsx`

## 🔄 Automated Checks

### On Each Commit (Local)
The pre-commit hook automatically runs checks before you commit:
```
git commit -m "my changes"
# → Pre-commit hook checks size limits
# → If violations found, commit is blocked
```

### On Each PR (GitHub)
The GitHub Actions workflow checks your PR:
- Scans changed files
- Posts violations as comments
- Blocks merge if errors found

## ✅ Dos and Don'ts

**DO:**
- ✅ Extract logic to custom hooks
- ✅ Create small, focused components
- ✅ Use composition over large components
- ✅ Test hooks in isolation
- ✅ Document your hooks

**DON'T:**
- ❌ Put all logic in a component
- ❌ Create massive render methods
- ❌ Duplicate logic across files
- ❌ Nest JSX deeply
- ❌ Add too many props

## 🆘 Help & FAQ

**Q: How do I know what to extract?**
A: If your component has multiple responsibilities (fetching, rendering, state management), extract the non-rendering parts to hooks.

**Q: Can I exceed the limits?**
A: Not recommended. If you absolutely must, discuss with team. The limits exist for good reasons.

**Q: What if my hook exceeds 100 LOC?**
A: Break it into smaller hooks. Each hook should do one thing well.

**Q: How do I test hooks?**
A: Use React Testing Library's `renderHook` function. See docs for examples.

## 📞 Contact

Questions? Check these resources in order:
1. `docs/REFACTORING_QUICK_REFERENCE.md` (code examples)
2. `docs/REFACTORING_ENFORCEMENT_GUIDE.md` (full guide)
3. `docs/REFACTORING_STRATEGY.md` (deep dive)
4. Look at example in `src/components/GitHubActionsFetcher.refactored.tsx`

---

**Ready to refactor?** Start with the [Full Guide](docs/REFACTORING_ENFORCEMENT_GUIDE.md) →
