# 📊 Component Size Violation Analysis & Refactoring Guide

**Document Date:** December 25, 2025  
**Total Violations:** 8 components, 4,146 LOC over limit  
**Target State:** 0 violations, 325 LOC total

---

## 📈 Complete Violation List

### Tier 1: Critical (800+ LOC)

| # | Component | Path | Current | Target | Reduction | Priority |
|---|-----------|------|---------|--------|-----------|----------|
| 1 | GitHubActionsFetcher | `src/components/` | 887 | 95 | 89% ↓ | 🔴 P0 |
| 2 | NerdModeIDE | `src/components/` | 733 | 110 | 85% ↓ | 🔴 P0 |
| 3 | LuaEditor | `src/components/` | 686 | 120 | 82% ↓ | 🔴 P0 |

### Tier 2: High (500-700 LOC)

| # | Component | Path | Current | Target | Reduction | Priority |
|---|-----------|------|---------|--------|-----------|----------|
| 4 | SchemaEditor | `src/components/` | 520 | 100 | 80% ↓ | 🟡 P1 |
| 5 | ComponentConfigDialog | `src/components/` | 450 | 90 | 80% ↓ | 🟡 P1 |
| 6 | PropertyInspector | `src/components/` | 380 | 85 | 77% ↓ | 🟡 P1 |

### Tier 3: Medium (200-400 LOC)

| # | Component | Path | Current | Target | Reduction | Priority |
|---|-----------|------|---------|--------|-----------|----------|
| 7 | IRCWebchat | `src/components/` | 290 | 85 | 70% ↓ | 🟢 P2 |
| 8 | AuditLogViewer | `src/components/` | 210 | 70 | 66% ↓ | 🟢 P2 |

**Totals:**
- **Before:** 4,156 LOC across 8 files
- **After:** 755 LOC across 40+ smaller files
- **Expected New Components:** 32+ child components + 8+ hooks
- **Overall Reduction:** 81.8% ↓

---

## 🔴 TIER 1 DETAILED ANALYSIS

### Component 1: GitHubActionsFetcher.tsx (887 LOC)

**Current Architecture:**
```
┌─ GitHubActionsFetcher (887 LOC, monolithic)
├─ useState:
│  ├─ runs (workflow runs)
│  ├─ loading
│  ├─ error
│  ├─ filters (status, branch)
│  ├─ sortBy
│  ├─ autoRefresh
│  ├─ refreshInterval
│  └─ selectedRun
├─ Effects:
│  ├─ Initial fetch
│  ├─ Auto-refresh interval
│  ├─ Local storage sync
│  └─ Search debounce
├─ API Calls:
│  ├─ fetchWorkflowRuns()
│  ├─ downloadRunLogs()
│  ├─ retryFailedRun()
│  └─ analyzeRunLogs()
└─ Render:
   ├─ Filters UI
   ├─ Runs table (200+ LOC)
   ├─ Run details modal
   ├─ Analysis panel
   └─ Download progress
```

**Issues:**
1. **Mixed responsibilities:** API integration + UI rendering + state management
2. **Hardcoded logic:** Analysis features, filtering, sorting all in JSX
3. **No reusability:** Hooks can't be used elsewhere
4. **Hard to test:** Too many moving parts, complex mocking needed
5. **Performance:** Re-renders entire tree on any state change

**Refactoring Strategy:**

```
BEFORE:
GitHubActionsFetcher.tsx (887 LOC)
  ├─ API integration (200 LOC)
  ├─ State management (150 LOC)
  ├─ Analysis logic (100 LOC)
  └─ Rendering (437 LOC)

AFTER:
useGitHubFetcher.ts (65 LOC)          ← API + polling
  ├─ Fetch runs
  ├─ Cache + refetch
  └─ Auto-refresh logic

useAnalyzeRuns.ts (45 LOC)            ← Analysis logic
  ├─ Analyze single run
  ├─ Analyze logs
  └─ Generate insights

WorkflowRunCard.tsx (48 LOC)           ← Single run display
  ├─ Run info
  ├─ Status badge
  └─ Quick actions

WorkflowFilterBar.tsx (42 LOC)         ← Filters
  ├─ Status filter
  ├─ Branch filter
  └─ Sort dropdown

WorkflowRunsTable.tsx (65 LOC)         ← Table view
  ├─ Column headers
  ├─ Row rendering (uses WorkflowRunCard)
  └─ Pagination

WorkflowAnalysisPanel.tsx (52 LOC)     ← Analysis UI
  ├─ Performance insights
  ├─ Job breakdown
  └─ Error summary

GitHubActionsFetcher.tsx (85 LOC)      ← Container
  ├─ Wire hooks
  ├─ Compose components
  └─ Handle interactions
```

**Implementation Checklist:**

**Step 1: Create useGitHubFetcher Hook** (90 min)
```typescript
// src/hooks/useGitHubFetcher.ts
export interface UseGitHubFetcherOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  filters?: WorkflowFilter;
}

export function useGitHubFetcher(options: UseGitHubFetcherOptions) {
  return {
    runs: WorkflowRun[],
    loading: boolean,
    error: Error | null,
    refresh: () => Promise<void>,
    setFilters: (filters: WorkflowFilter) => void,
    setSortBy: (field: string, direction: 'asc' | 'desc') => void,
  }
}
```

**Responsibilities:**
- Fetch runs from GitHub API
- Handle auth and errors
- Manage auto-refresh interval
- Cache results with stale-while-revalidate
- Expose refresh and filter controls

**Tests:**
- Test successful fetch
- Test auth errors
- Test network errors
- Test auto-refresh interval
- Test filter application
- Test cache invalidation

---

**Step 2: Create useAnalyzeRuns Hook** (60 min)
```typescript
// src/hooks/useAnalyzeRuns.ts
export interface AnalysisResult {
  totalRuns: number;
  successRate: number;
  averageDuration: number;
  failureReasons: Map<string, number>;
  slowestJobs: Job[];
}

export function useAnalyzeRuns() {
  return {
    analyze: (runs: WorkflowRun[]) => AnalysisResult,
    analyzeRun: (run: WorkflowRun) => RunAnalysis,
    analyzeLogs: (logs: string) => LogAnalysis,
  }
}
```

**Tests:**
- Test success rate calculation
- Test duration averaging
- Test failure categorization
- Test slowest job detection

---

**Step 3: Create WorkflowRunCard Component** (45 min)
```typescript
// src/components/WorkflowRunCard.tsx (48 LOC)
interface WorkflowRunCardProps {
  run: WorkflowRun;
  onSelect: (run: WorkflowRun) => void;
  onRetry: (run: WorkflowRun) => void;
  onDownloadLogs: (run: WorkflowRun) => void;
}

export function WorkflowRunCard({
  run,
  onSelect,
  onRetry,
  onDownloadLogs,
}: WorkflowRunCardProps) {
  return (
    <div className="run-card">
      <div className="status-badge" data-status={run.status}>
        {run.status}
      </div>
      <div className="info">
        <h3>{run.name}</h3>
        <p>{run.branch} • {formatDate(run.createdAt)}</p>
      </div>
      <div className="duration">
        {formatDuration(run.duration)}
      </div>
      <div className="actions">
        <button onClick={() => onSelect(run)}>Details</button>
        {run.status === 'failed' && (
          <button onClick={() => onRetry(run)}>Retry</button>
        )}
        <button onClick={() => onDownloadLogs(run)}>Logs</button>
      </div>
    </div>
  );
}
```

**Tests:**
- Test card rendering with different statuses
- Test button clicks
- Test conditional rendering (retry button)

---

**Step 4-6: Create Other Components** (2 hours each)
- WorkflowFilterBar: Status/branch filters + sort
- WorkflowRunsTable: List of WorkflowRunCard components
- WorkflowAnalysisPanel: Statistics from useAnalyzeRuns

---

**Step 7: Refactor Container Component** (60 min)
```typescript
// src/components/GitHubActionsFetcher.tsx (85 LOC)
export function GitHubActionsFetcher() {
  const { runs, loading, error, refresh, setFilters, setSortBy } =
    useGitHubFetcher({
      autoRefresh: true,
      refreshInterval: 30000,
    });

  const { analyze } = useAnalyzeRuns();
  const analysis = useMemo(() => analyze(runs), [runs]);

  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner error={error} />;

  return (
    <div className="github-actions">
      <WorkflowFilterBar
        onFilterChange={setFilters}
        onSortChange={setSortBy}
      />
      <WorkflowRunsTable
        runs={runs}
        onSelectRun={setSelectedRun}
        onRetryRun={handleRetry}
        onDownloadLogs={handleDownloadLogs}
      />
      {selectedRun && (
        <WorkflowAnalysisPanel run={selectedRun} analysis={analysis} />
      )}
    </div>
  );
}
```

**Keep API same:** Consumers of GitHubActionsFetcher shouldn't notice any change.

---

**Step 8: Add Tests** (90 min)
```typescript
// src/hooks/useGitHubFetcher.test.ts
describe('useGitHubFetcher', () => {
  it('should fetch workflow runs on mount', async () => {
    // Test setup with mock API
    // Verify hook returns runs
  });

  it('should handle authentication errors', async () => {
    // Mock API error
    // Verify error is returned
  });

  it('should auto-refresh at specified interval', async () => {
    // Mock timer
    // Verify refetch occurs
  });

  // ... 8+ more tests
});

// src/components/WorkflowRunCard.test.tsx
describe('WorkflowRunCard', () => {
  it('should render run information', () => {
    // Render component with mock run
    // Verify all fields displayed
  });

  it('should call onSelect when clicked', () => {
    // Click Details button
    // Verify onSelect called
  });

  // ... 4+ more tests
});
```

---

**Effort Summary:**
| Task | Effort | Cumulative |
|------|--------|-----------|
| useGitHubFetcher hook | 90 min | 90 min |
| useAnalyzeRuns hook | 60 min | 150 min |
| WorkflowRunCard | 45 min | 195 min |
| WorkflowFilterBar | 45 min | 240 min |
| WorkflowRunsTable | 60 min | 300 min |
| WorkflowAnalysisPanel | 55 min | 355 min |
| Container refactor | 60 min | 415 min |
| Tests | 90 min | 505 min |
| **Total:** | | **505 min (8.4 hours)** |

---

### Component 2: NerdModeIDE.tsx (733 LOC)

**Current Issues:**
- File tree navigation + code editor + console + git all combined
- Complex state: expandedNodes, openFiles, activeTab, editorContent, unsavedChanges
- Keyboard shortcuts hardcoded
- Theme/settings not configurable

**Refactoring Plan:**
```
BEFORE: NerdModeIDE.tsx (733 LOC)
  ├─ File tree logic
  ├─ Editor state
  ├─ Console management
  └─ Git integration

AFTER:
useFileTree.ts (85 LOC)               ← Tree operations
useCodeEditor.ts (68 LOC)             ← Editor state
useConsoleOutput.ts (42 LOC)          ← Console management
useGitStatus.ts (38 LOC)              ← Git info

FileTreePanel.tsx (72 LOC)            ← Tree UI
EditorPanel.tsx (80 LOC)              ← Editor UI
ConsoleOutput.tsx (55 LOC)            ← Console UI
GitStatusBar.tsx (35 LOC)             ← Git UI

NerdModeIDE.tsx (110 LOC)             ← Container
```

**Key Hooks:**

```typescript
// src/hooks/useFileTree.ts
interface FileTreeState {
  expandedNodes: Set<string>;
  selectedFile: string | null;
  searchTerm: string;
}

export function useFileTree(projectRoot: string) {
  return {
    tree: FileNode[],
    state: FileTreeState,
    toggleNode: (nodeId: string) => void,
    selectFile: (path: string) => void,
    createFile: (path: string) => Promise<void>,
    deleteFile: (path: string) => Promise<void>,
    renameFile: (oldPath: string, newPath: string) => Promise<void>,
  }
}

// src/hooks/useCodeEditor.ts
export function useCodeEditor(language: string) {
  return {
    content: string,
    setContent: (content: string) => void,
    openTabs: EditorTab[],
    activeTab: EditorTab | null,
    switchTab: (tabId: string) => void,
    closeTab: (tabId: string) => void,
    hasUnsavedChanges: boolean,
    save: () => Promise<void>,
  }
}
```

**Effort:** 25 hours (including all components and tests)

---

### Component 3: LuaEditor.tsx (686 LOC)

**Current Issues:**
- Script editing + preview + console combined
- Hardcoded syntax highlighting
- No script library integration
- Limited error reporting

**Refactoring Plan:**
```
BEFORE: LuaEditor.tsx (686 LOC)
  ├─ Script editing
  ├─ Preview/execution
  └─ Console output

AFTER:
useLuaScript.ts (55 LOC)              ← Script CRUD
useLuaPreview.ts (48 LOC)             ← Execution

ScriptEditor.tsx (65 LOC)             ← Edit UI
ScriptPreview.tsx (48 LOC)            ← Preview UI

LuaEditor.tsx (120 LOC)               ← Container
```

**Key Hooks:**

```typescript
// src/hooks/useLuaScript.ts
export function useLuaScript(scriptId?: string) {
  return {
    content: string,
    setContent: (content: string) => void,
    save: () => Promise<void>,
    metadata: ScriptMetadata,
    updateMetadata: (metadata: Partial<ScriptMetadata>) => void,
  }
}

// src/hooks/useLuaPreview.ts
export function useLuaPreview(script: string) {
  return {
    output: string,
    errors: LuaError[],
    run: (context: Record<string, any>) => Promise<void>,
    clear: () => void,
  }
}
```

**Effort:** 20 hours

---

## 🟡 TIER 2 ANALYSIS (Medium Components)

### Component 4: SchemaEditor.tsx (520 LOC)

**Issues:** Form builder + schema display + validation all combined

**Refactoring:** Extract form builder to hooks, split into:
- SchemaForm.tsx (80 LOC)
- SchemaPreview.tsx (70 LOC)
- useSchemaBuilder.ts (90 LOC)
- Container (60 LOC)

**Effort:** 10 hours

---

### Component 5: ComponentConfigDialog.tsx (450 LOC)

**Issues:** Too many tabs and config sections

**Refactoring:** Each config section as separate tab component
- TabSelector.tsx (40 LOC)
- GeneralTab.tsx (60 LOC)
- StylesTab.tsx (70 LOC)
- PropsTab.tsx (65 LOC)
- Container (90 LOC)

**Effort:** 8 hours

---

### Component 6: PropertyInspector.tsx (380 LOC)

**Issues:** Different prop types rendered in single component

**Refactoring:** Prop type components
- PropertyInput.tsx (45 LOC)
- PropertySelect.tsx (40 LOC)
- PropertyColorPicker.tsx (35 LOC)
- PropertyToggle.tsx (30 LOC)
- Container (75 LOC)

**Effort:** 7 hours

---

## 🟢 TIER 3 ANALYSIS (Smaller Components)

### Component 7: IRCWebchat.tsx (290 LOC)

**Issues:** Chat UI + message rendering + input handling

**Refactoring:**
- MessageList.tsx (65 LOC)
- ChatInput.tsx (45 LOC)
- useChatMessages.ts (50 LOC)
- Container (60 LOC)

**Effort:** 4 hours

---

### Component 8: AuditLogViewer.tsx (210 LOC)

**Issues:** Table view + filtering + search

**Refactoring:**
- AuditLogTable.tsx (85 LOC)
- AuditLogFilter.tsx (50 LOC)
- Container (50 LOC)

**Effort:** 3 hours

---

## 📊 Summary Table

| Component | Current | Target | Components | Hooks | Effort | Start |
|-----------|---------|--------|------------|-------|--------|-------|
| GitHubActionsFetcher | 887 | 85 | 6 | 2 | 8.4h | Week 1 |
| NerdModeIDE | 733 | 110 | 4 | 4 | 25h | Week 1 |
| LuaEditor | 686 | 120 | 2 | 2 | 20h | Week 2 |
| SchemaEditor | 520 | 100 | 3 | 1 | 10h | Week 2 |
| ComponentConfigDialog | 450 | 90 | 5 | 0 | 8h | Week 2 |
| PropertyInspector | 380 | 85 | 4 | 0 | 7h | Week 3 |
| IRCWebchat | 290 | 85 | 2 | 1 | 4h | Week 3 |
| AuditLogViewer | 210 | 70 | 1 | 0 | 3h | Week 3 |
| **TOTALS** | **4,156** | **755** | **32** | **10** | **85.4h** | |

---

## ✅ Testing Strategy

### Unit Tests (Per Component)
- Props validation
- State management
- Event handlers
- Edge cases

### Hook Tests
- Initial state
- State updates
- Side effects
- Error handling

### Integration Tests
- Component composition
- Data flow through hierarchy
- Performance (re-renders)

### E2E Tests
- Full workflows
- Multi-component interactions
- Performance under load

---

## 🎯 Success Criteria

### Per Component
- [ ] All child components < 150 LOC
- [ ] All hooks < 100 LOC
- [ ] Unit test coverage > 90%
- [ ] No console warnings
- [ ] Props fully documented with JSDoc
- [ ] Accessibility compliant (WCAG 2.1 AA)
- [ ] Performance: no regression in metrics

### Overall
- [ ] 0 violations remaining
- [ ] 4,156 → 755 LOC reduction
- [ ] 40+ small components + 10 reusable hooks
- [ ] All tests passing
- [ ] All code reviewed
- [ ] Documentation complete

---

## 📋 Execution Checklist

### Pre-Refactoring (Day 1)
- [ ] Create feature branch
- [ ] Set up test environment
- [ ] Create Storybook stories (optional)
- [ ] Document current API/props

### Refactoring Phase
- [ ] Create hooks
- [ ] Create child components
- [ ] Add unit tests
- [ ] Refactor container
- [ ] Update parent imports
- [ ] Test integration

### Post-Refactoring
- [ ] Code review
- [ ] E2E tests
- [ ] Performance testing
- [ ] Documentation
- [ ] Merge to main

---

## 🚀 Recommended Refactoring Order

1. **GitHubActionsFetcher** (8.4h) - Simpler, good learning example
2. **NerdModeIDE** (25h) - Most complex, but infrastructure ready
3. **LuaEditor** (20h) - Complex but fewer dependencies
4. **SchemaEditor** (10h) - Medium complexity
5. **ComponentConfigDialog** (8h) - Straightforward tab separation
6. **PropertyInspector** (7h) - Similar patterns to PropertyInspector
7. **IRCWebchat** (4h) - Simple message list pattern
8. **AuditLogViewer** (3h) - Simple table pattern

**Total Timeline:** 8.5 weeks (1 developer, sequential)

---

## 🎓 Learning Resources

### Component Decomposition Patterns
- [React docs: Composition vs Inheritance](https://react.dev/learn/thinking-in-react)
- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)

### Hook Development
- [React Hooks API Reference](https://react.dev/reference/react)
- [Separating Concerns with Hooks](https://react.dev/learn/separating-concerns-with-effects)

### Testing
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

**Generated:** December 25, 2025  
**Next Review:** After Phase 1A completion
