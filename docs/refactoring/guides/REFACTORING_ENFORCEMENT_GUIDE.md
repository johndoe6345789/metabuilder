# Code Size Limit Enforcement & Refactoring Guide

## 🎯 Overview

This document outlines the code size limit enforcement strategy and refactoring approach for the MetaBuilder codebase.

## 📏 Size Limits

Based on the project's architectural principles, the following limits are enforced:

### TypeScript/React Files (`.ts`, `.tsx`)
| Metric | Limit | Severity |
|--------|-------|----------|
| Lines of Code (LOC) | 150 | ❌ Error |
| Total Lines | 200 | ⚠️ Warning |
| Max Nesting Depth | 3 | ⚠️ Warning |
| Exports per File | 5 (components), 10 (utilities) | ⚠️ Warning |
| Function Parameters | 5 | ⚠️ Warning |

### JavaScript Files (`.js`, `.jsx`)
Same limits as TypeScript files.

## 🛠️ Enforcement Tool

### Location
```bash
scripts/enforce-size-limits.ts
```

### Usage
```bash
# Run the size limit checker
npx tsx scripts/enforce-size-limits.ts

# Output
# - Console report with violations
# - JSON report (size-limits-report.json) for CI/CD
```

### Features
- Scans all TypeScript/JavaScript files (excludes node_modules, build, .next, etc.)
- Counts actual lines of code (excludes comments and blank lines)
- Detects nesting depth issues
- Identifies function parameter count violations
- Generates both human-readable and machine-readable reports

## ♻️ Refactoring Strategy

### Core Principles

1. **Separation of Concerns**
   - Each component should have ONE primary responsibility
   - Extract business logic into custom hooks
   - Move persistent state to database

2. **Hook-Based Architecture**
   - `useGitHubFetcher`: API integration and data fetching
   - `useAutoRefresh`: Polling and timer management
   - `useFileTree`: Tree data structure operations
   - `useCodeEditor`: Editor state and operations
   - Custom hooks for domain-specific logic

3. **Component Hierarchy**
   - Small, reusable UI components (<100 LOC)
   - Container components that use hooks (<150 LOC)
   - Avoid deeply nested JSX

4. **Data Flow**
   ```
   Persistent Database
           ↓
      Custom Hooks (logic)
           ↓
      Container Components (state management)
           ↓
      UI Components (rendering)
   ```

## 📂 Refactoring Artifacts

### New Hooks Created
```
src/hooks/
├── useGitHubFetcher.ts      # GitHub API integration
├── useAutoRefresh.ts        # Auto-refresh polling
├── useCodeEditor.ts         # Editor state management
├── useFileTree.ts           # File tree operations
└── index.ts                 # Barrel export
```

### New Components Created
```
src/components/
├── WorkflowRunCard.tsx      # Extracted from GitHubActionsFetcher
├── GitHubActionsFetcher.refactored.tsx  # Refactored version
└── ... (more to follow)
```

## 📋 Refactoring Checklist

### Phase 1: Foundation (Week 1)
- [x] Create size limit enforcement tool
- [x] Create custom hooks for common patterns
- [x] Create small, reusable UI components
- [ ] Replace original GitHubActionsFetcher with refactored version
- [ ] Add unit tests for hooks

### Phase 2: Large Components (Weeks 2-3)
- [ ] Refactor NerdModeIDE.tsx (733 LOC)
- [ ] Refactor LuaEditor.tsx (686 LOC)
- [ ] Refactor PackageImportExport.tsx (638 LOC)

### Phase 3: Medium Components (Week 4)
- [ ] Refactor PackageManager.tsx (558 LOC)
- [ ] Refactor WorkflowEditor.tsx (498 LOC)
- [ ] Refactor ComponentHierarchyEditor.tsx (477 LOC)

### Phase 4: Verification & Tooling (Ongoing)
- [ ] Run size limit checker on all files
- [ ] Set up pre-commit hook to prevent new violations
- [ ] Add CI/CD check for size limits
- [ ] Document refactored components

## 🔗 Hook Usage Examples

### useGitHubFetcher
```tsx
function MyComponent() {
  const { data, isLoading, error, fetch } = useGitHubFetcher()
  
  useEffect(() => {
    fetch()
  }, [])
  
  return <div>{data ? 'Loaded' : 'Loading...'}</div>
}
```

### useAutoRefresh
```tsx
function MyComponent() {
  const { isAutoRefreshing, toggleAutoRefresh } = useAutoRefresh({
    intervalMs: 30000,
    onRefresh: () => fetchData(),
  })
  
  return <button onClick={toggleAutoRefresh}>
    {isAutoRefreshing ? 'Stop' : 'Start'}
  </button>
}
```

### useFileTree
```tsx
function FileExplorer() {
  const { files, addChild, deleteNode, toggleFolder } = useFileTree()
  
  return files.map(file => (
    <div key={file.id} onClick={() => toggleFolder(file.id)}>
      {file.name}
    </div>
  ))
}
```

### useCodeEditor
```tsx
function CodeEditor() {
  const { activeFile, openFile, updateContent, saveFile } = useCodeEditor()
  
  return (
    <>
      <Editor value={activeFile?.content} onChange={updateContent} />
      <button onClick={() => saveFile()}>Save</button>
    </>
  )
}
```

## 🧪 Testing Strategy

### Unit Tests
- Test each hook with various inputs
- Mock external APIs
- Verify state transitions

### Component Tests
- Test refactored components in isolation
- Verify props are passed correctly
- Test user interactions

### Integration Tests
- Test hooks working together
- Verify data flows through component hierarchy

### E2E Tests
- Test complete workflows
- Verify UI behavior end-to-end

## 🚀 Deployment Steps

1. **Create Feature Branch**
   ```bash
   git checkout -b refactor/enforce-size-limits
   ```

2. **Add Tests**
   - Create tests for new hooks
   - Create tests for new components

3. **Run Checks**
   ```bash
   npm run lint
   npm run test
   npm run test:e2e
   npx tsx scripts/enforce-size-limits.ts
   ```

4. **Create Pull Request**
   - Link to issue
   - Describe refactoring strategy
   - List breaking changes (if any)

5. **Deploy**
   - Merge when approved
   - Monitor for errors
   - Update documentation

## 📊 Current Violations

Run `npx tsx scripts/enforce-size-limits.ts` to see current violations.

As of the initial scan:
- ❌ Configuration files have deep nesting (max 3 required)
- ✅ No source files exceed size limits yet

## 🔧 Next Steps

1. Add pre-commit hook to enforce limits automatically
2. Add GitHub Actions workflow for CI/CD checks
3. Create migration guide for large components
4. Document best practices for staying under limits

---

**Last Updated**: December 25, 2025
**Status**: 🟢 In Progress
