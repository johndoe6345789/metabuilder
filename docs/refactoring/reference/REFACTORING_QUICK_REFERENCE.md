# Refactoring Quick Reference Guide

## TL;DR Summary

**Problem:** 8 React components exceed 150 LOC limit (violates MetaBuilder architecture)
**Solution:** Decompose into smaller components, extract logic to hooks and Lua
**Timeline:** 3 weeks, 103 hours of work
**Impact:** Improved modularity, testability, and data persistence

| Violation | Current | Target | Reduction |
|-----------|---------|--------|-----------|
| GitHubActionsFetcher | 887 LOC | 95 LOC | 89% ↓ |
| NerdModeIDE | 733 LOC | 110 LOC | 85% ↓ |
| LuaEditor | 686 LOC | 120 LOC | 82% ↓ |

---

## Key Architectural Changes

### 1. Component Decomposition Pattern

**Before:**
```
MonolithicComponent.tsx (887 LOC)
  - API fetching
  - State management
  - UI rendering
  - Business logic
  - Error handling
```

**After:**
```
MonolithicComponent.tsx (95 LOC)
├── SubComponent1.tsx (65 LOC) - Handle one thing
├── SubComponent2.tsx (80 LOC) - Handle one thing
├── SubComponent3.tsx (75 LOC) - Handle one thing
└── Hooks & Lua for business logic
```

### 2. State Management Shift

**Before:**
```typescript
const [data, setData] = useState(null)
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState(null)
// ... 8+ more useState
// Lost on page reload, no sharing
```

**After:**
```typescript
// Database (Prisma) - Persistent
model WorkflowRun {
  id: String
  name: String
  status: String
  // ... shared across sessions and users
}

// React State - Ephemeral UI state
const [selectedId, setSelectedId] = useState(null)  // UI only
const { runs } = useWorkflowActions()  // From database
```

### 3. Logic Extraction Pattern

**Before:**
```typescript
// In component, 200+ LOC of async operations
const fetchGitHubActions = async () => {
  // Set loading, call API, handle errors, cache...
}
```

**After:**
```typescript
// Custom hook - 50 LOC, testable, reusable
export function useGitHubActions() {
  // All API logic, caching, error handling
  return { runs, isLoading, error, refetch }
}

// In component - 5 LOC
const { runs, isLoading } = useGitHubActions()
```

### 4. Configuration as Data

**Before:**
```typescript
const getStatusColor = (status: string) => {
  if (status === 'completed') {
    if (conclusion === 'success') return 'text-green-600'
    // ... 50 lines of hardcoded logic
  }
}
```

**After (JSON Config):**
```json
{
  "statusColors": {
    "completed-success": "text-green-600",
    "completed-failure": "text-red-600"
  }
}
```

**Usage:**
```typescript
const config = useUIConfig('GitHubActions')
const color = config.statusColors[status]
```

---

## Implementation Roadmap

### Week 1: Violation #1 (GitHubActionsFetcher)
```
Day 1-2:   Database models + migrations
Day 3-4:   useGitHubActions hook
Day 5:     useWorkflowLogs + useWorkflowAnalysis hooks
Day 6:     Sub-components creation
Day 7:     Main component refactor + tests
```

### Week 2: Violation #2 (NerdModeIDE)
```
Day 1:     Database models (projects, files, git config)
Day 2-4:   useIDEFileTree (3 hours) + other hooks
Day 5:     File tree components
Day 6:     Editor + toolbar components
Day 7:     Main component refactor + tests
```

### Week 3: Violation #3 (LuaEditor)
```
Day 1-2:   Extract Monaco config + create hooks
Day 3-4:   Parameter + execution components
Day 5:     Security + snippet components
Day 6:     Main component refactor
Day 7:     Testing + documentation
```

---

## File Structure After Refactoring

```
src/
├── components/
│   ├── GitHubActionsFetcher.tsx (95 LOC) ← Refactored
│   │   ├── GitHubActionsToolbar.tsx (65 LOC)
│   │   ├── GitHubActionsRunsList.tsx (80 LOC)
│   │   ├── GitHubActionsRunRow.tsx (45 LOC)
│   │   ├── GitHubActionsJobsPanel.tsx (100 LOC)
│   │   ├── GitHubActionsJobStep.tsx (50 LOC)
│   │   └── GitHubActionsAnalysisPanel.tsx (70 LOC)
│   │
│   ├── NerdModeIDE.tsx (110 LOC) ← Refactored
│   │   ├── IDEFileTreePanel.tsx (90 LOC)
│   │   ├── IDEFileTreeNode.tsx (60 LOC)
│   │   ├── IDEEditorPanel.tsx (85 LOC)
│   │   ├── IDEToolbar.tsx (65 LOC)
│   │   ├── IDEConsolePanel.tsx (70 LOC)
│   │   ├── IDEGitDialog.tsx (75 LOC)
│   │   └── IDENewFileDialog.tsx (65 LOC)
│   │
│   ├── LuaEditor.tsx (120 LOC) ← Refactored
│   │   ├── LuaScriptSelector.tsx (70 LOC)
│   │   ├── LuaCodeEditor.tsx (110 LOC)
│   │   ├── LuaMonacoConfig.tsx (120 LOC)
│   │   ├── LuaParametersPanel.tsx (95 LOC)
│   │   ├── LuaParameterItem.tsx (60 LOC)
│   │   ├── LuaExecutionPanel.tsx (100 LOC)
│   │   ├── LuaExecutionResult.tsx (80 LOC)
│   │   ├── LuaSecurityWarningDialog.tsx (75 LOC)
│   │   └── LuaSnippetLibraryPanel.tsx (85 LOC)
│   │
│   └── (existing components...)
│
├── hooks/
│   ├── useGitHubActions.ts (60 LOC)
│   ├── useWorkflowLogs.ts (50 LOC)
│   ├── useWorkflowAnalysis.ts (40 LOC)
│   │
│   ├── useIDEProject.ts (40 LOC)
│   ├── useIDEFileTree.ts (100 LOC)
│   ├── useIDEEditor.ts (40 LOC)
│   ├── useIDEGit.ts (60 LOC)
│   ├── useIDETest.ts (50 LOC)
│   │
│   ├── useLuaScripts.ts (40 LOC)
│   ├── useLuaEditor.ts (40 LOC)
│   ├── useLuaExecution.ts (60 LOC)
│   ├── useLuaSecurity.ts (30 LOC)
│   │
│   └── (existing hooks...)
│
├── lib/
│   ├── github-ui-config.ts (30 LOC)
│   └── (existing libs...)
│
└── seed-data/
    └── lua-scripts/
        ├── filter-workflow-runs.lua
        ├── aggregate-logs.lua
        └── (more scripts...)
```

---

## Database Schema Summary

### New Models (15 total)

**GitHub Feature:**
- `GitHubWorkflowRun` - Workflow execution data
- `GitHubWorkflowJob` - Job details
- `GitHubConfig` - API config

**IDE Feature:**
- `IDEProject` - Project metadata
- `IDEFile` - File tree with content
- `GitConfig` - Git credentials (update)
- `IDETestRun` - Test results

**Lua Feature:**
- `LuaScriptLibrary` - Reusable snippets
- `LuaScriptParameter` - Parameter definitions
- `LuaTestRun` - Execution history

**Updated Models:**
- `LuaScript` - Add description field
- `User` - Track changes

---

## Hook API Patterns

### Pattern 1: Data Fetching Hook
```typescript
export function useGitHubActions() {
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchFromAPI()
      setRuns(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [])

  return { runs, isLoading, error, refetch }
}
```

### Pattern 2: State Management Hook
```typescript
export function useIDEFileTree(projectId: string) {
  const [files, setFiles] = useState<IDEFile[]>([])

  const createFile = useCallback(async (parentId: string, name: string) => {
    const newFile = await db.file.create({ projectId, parentId, name })
    setFiles([...files, newFile])
  }, [files])

  return { files, createFile, deleteFile, updateFile }
}
```

### Pattern 3: Derived State Hook
```typescript
export function useLuaEditor(scripts: LuaScript[]) {
  const [selectedId, setSelectedId] = useState<string | null>(
    scripts.length > 0 ? scripts[0].id : null
  )

  const currentScript = useMemo(
    () => scripts.find(s => s.id === selectedId) || null,
    [scripts, selectedId]
  )

  return { selectedId, setSelectedId, currentScript }
}
```

---

## Testing Strategy

### Unit Test Template
```typescript
describe('useGitHubActions', () => {
  it('should fetch and cache workflow runs', async () => {
    const { result } = renderHook(() => useGitHubActions(), {
      wrapper: MockProviders
    })

    expect(result.current.isLoading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.runs.length).toBeGreaterThan(0)
      expect(result.current.isLoading).toBe(false)
    })
  })
})
```

### Component Test Template
```typescript
describe('GitHubActionsRunRow', () => {
  it('should render workflow run data', () => {
    const mockRun = { id: 1, name: 'Test', status: 'completed' }
    
    render(
      <GitHubActionsRunRow 
        run={mockRun}
        isSelected={false}
        onSelect={jest.fn()}
      />
    )

    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

---

## Migration Path (No Breaking Changes)

### Step 1: Create New Infrastructure
```bash
1. Add new Prisma models
2. Create hooks (side-by-side with old code)
3. Create new sub-components
4. Create wrapper for backward compatibility
```

### Step 2: Gradual Adoption
```bash
1. Tests use new hooks/components
2. Documentation shows new patterns
3. New features use new patterns
4. Old code still works
```

### Step 3: Cleanup (Optional)
```bash
1. Remove old component after 1 release
2. Move any users to new version
3. Clean up deprecated code
```

---

## Common Pitfalls to Avoid

### ❌ Don't: Props Drilling
```typescript
// BAD - passing through 5 levels
<Component1 data={data} onChange={onChange}>
  <Component2 data={data} onChange={onChange}>
    <Component3 data={data} onChange={onChange}>
      <Component4 data={data} onChange={onChange}>
        <Component5 data={data} onChange={onChange} />
```

### ✅ Do: Use Context or Hooks
```typescript
// GOOD - hook provides data
const { data, onChange } = useWorkflowContext()
<Component5 />
```

### ❌ Don't: Mix Data and UI
```typescript
// BAD - API calls in component
export function MyComponent() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/api/data').then(setData)  // Should be in hook!
  }, [])
}
```

### ✅ Do: Separate Concerns
```typescript
// GOOD - hook handles data
export function useMyData() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/api/data').then(setData)
  }, [])
  return data
}

export function MyComponent() {
  const data = useMyData()
}
```

### ❌ Don't: Hardcode UI Configuration
```typescript
// BAD - colors hardcoded
const statusColors = {
  success: '#16a34a',
  failure: '#dc2626'
}
```

### ✅ Do: Load from Database
```typescript
// GOOD - config in database
const config = useUIConfig('GitHubActions')
const color = config.statusColors[status]
```

---

## Success Metrics

### Before Refactoring
- Average component size: 569 LOC
- Components > 150 LOC: 8
- Custom hooks: ~5
- Lua scripts: ~10

### After Refactoring
- Average component size: 73 LOC
- Components > 150 LOC: 0 ✅
- Custom hooks: ~20 ✅
- Lua scripts: ~15 ✅

---

## Next Steps

1. **Review** this strategy with team
2. **Adjust** timeline based on capacity
3. **Start** with Phase 1 (GitHubActionsFetcher)
4. **Track** progress with checklist
5. **Celebrate** each milestone
6. **Repeat** for Violations #2 and #3

---

## Questions to Review

- [ ] Database schema approved?
- [ ] Hook API contracts clear?
- [ ] Component responsibility boundaries defined?
- [ ] Testing approach agreed?
- [ ] Timeline realistic?
- [ ] Team capacity sufficient?
- [ ] Risk mitigation plans ready?

## Contact / Escalation

- **Questions about architecture?** → Review copilot-instructions.md
- **Database schema issues?** → Check prisma/schema.prisma
- **Hook design help?** → Look at existing hooks in src/hooks/
- **Component composition questions?** → Review /packages/ structure

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-25  
**Status:** Ready for implementation  
**Approval:** Pending ⏳
