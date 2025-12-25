# Component Refactoring Strategy for MetaBuilder

## Executive Summary

MetaBuilder has 8 React components violating the <150 LOC architectural constraint. This document provides a comprehensive refactoring strategy for the top 3 critical violations, following the project's data-driven philosophy where 95% of functionality is defined through JSON/Lua, not TypeScript.

**Current Violations:**
1. GitHubActionsFetcher.tsx - 887 LOC (Reduction target: 83%)
2. NerdModeIDE.tsx - 733 LOC (Reduction target: 80%)
3. LuaEditor.tsx - 686 LOC (Reduction target: 78%)

**Estimated Total Effort:** 103 hours over 3 weeks
**Key Outcomes:** All components <150 LOC, improved modularity, better persistence, enhanced reusability

---

## Core Refactoring Principles

### 1. Component Decomposition Strategy
- **Target:** Break into small, single-responsibility components
- **Maximum Component Size:** 150 LOC
- **Guidance:** Each component should have ≤ 5 props and ≤ 3 responsibilities

### 2. Data Persistence Strategy
- **Current State:** Ephemeral component state via useState/useKV
- **Target State:** Persistent database storage via Prisma
- **Rationale:** Survive page reloads, enable sharing, support analytics

### 3. Logic Extraction to Hooks
- **Target:** Extract business logic into custom hooks
- **Benefit:** Reusable, testable, easier to mock
- **Pattern:** One hook per major feature (fetch, edit, execute, etc.)

### 4. Configuration as Data
- **Current:** Hardcoded UI configs (colors, columns, tabs)
- **Target:** JSON configurations in database or seed files
- **Benefit:** Runtime changes without code deployment

### 5. Lua Script Integration
- **Target:** Move complex logic to Lua scripts
- **Examples:** Tree operations, log aggregation, pattern analysis
- **Benefit:** Runtime-modifiable, database-driven, sandboxed

---

## VIOLATION #1: GitHubActionsFetcher.tsx (887 LOC)

### Current Architecture Issues

**Component Responsibilities (Should be 1-2):**
- GitHub API integration via Octokit
- Workflow run data fetching and polling
- Auto-refresh timer management (setInterval logic)
- Job/step detail fetching
- Log aggregation and multi-format handling
- AI-powered analysis (LLM integration)
- Multiple tab views (runs, logs, analysis)
- Status visualization and filtering
- File download operations

**State Explosion (8+ useState hooks):**
```typescript
- data (WorkflowRun[])
- isLoading
- error
- lastFetched
- needsAuth
- secondsUntilRefresh
- autoRefreshEnabled
- analysis
- isAnalyzing
- selectedRunId
- runJobs
- runLogs
- isLoadingLogs
```

### Refactoring Plan: Phase-by-Phase

#### Phase 1: Database Models (2 hours)

**New Prisma Models:**

```prisma
model GitHubWorkflowRun {
  id                String    @id
  githubId          BigInt    @unique
  name              String
  status            String
  conclusion        String?
  createdAt         DateTime
  updatedAt         DateTime
  htmlUrl           String
  headBranch        String
  event             String
  jobsData          String    // JSON array
  logsData          String?   // Full aggregated logs
  analysisCache     String?   // Cached AI analysis
  cached            Boolean   @default(true)
  jobs              GitHubWorkflowJob[]
}

model GitHubWorkflowJob {
  id                String    @id
  githubJobId       BigInt    @unique
  runId             String
  name              String
  status            String
  conclusion        String?
  startedAt         DateTime?
  completedAt       DateTime?
  stepsJson         String    // JSON array of steps
  run               GitHubWorkflowRun @relation(fields: [runId], references: [id])
}

model GitHubConfig {
  id                String    @id @default("github-config")
  owner             String
  repo              String
  token             String    // Encrypted
  autoRefreshEnabled Boolean  @default(true)
  refreshIntervalSeconds Int  @default(30)
  maxRunsPerFetch   Int       @default(20)
  tenantId          String?
}
```

**Steps:**
1. Add models to `prisma/schema.prisma`
2. Run `npm run db:generate`
3. Run `npm run db:push`

#### Phase 2: Custom Hooks (7 hours)

**Hook 1: useGitHubActions**
```typescript
// src/hooks/useGitHubActions.ts
export function useGitHubActions() {
  // Returns:
  // {
  //   runs: WorkflowRun[]
  //   isLoading: boolean
  //   error: string | null
  //   lastFetched: Date | null
  //   refetch: () => Promise<void>
  //   setAutoRefresh: (enabled: boolean) => void
  //   secondsUntilRefresh: number
  // }
  
  // Handles:
  // - Fetch from GitHub API via Octokit
  // - Cache results in database
  // - Auto-refresh polling with countdown
  // - Error handling and retry logic
}
```

**Hook 2: useWorkflowLogs**
```typescript
// src/hooks/useWorkflowLogs.ts
export function useWorkflowLogs() {
  // Returns:
  // {
  //   logs: string | null
  //   jobs: Job[]
  //   isLoading: boolean
  //   downloadLogs: (runId: number, name: string) => Promise<void>
  // }
  
  // Handles:
  // - Fetch job details from GitHub API
  // - Aggregate job logs with proper formatting
  // - Handle different log formats (text vs binary)
  // - Download as text file
}
```

**Hook 3: useWorkflowAnalysis**
```typescript
// src/hooks/useWorkflowAnalysis.ts
export function useWorkflowAnalysis() {
  // Returns:
  // {
  //   analysis: string | null
  //   isAnalyzing: boolean
  //   analyzeWorkflows: (runs: WorkflowRun[]) => Promise<void>
  //   analyzeLogs: (logs: string, runId: number) => Promise<void>
  // }
  
  // Handles:
  // - Call LLM API (GPT-4) for analysis
  // - Cache analysis results in database
  // - Format markdown output
}
```

#### Phase 3: Lua Scripts (2 hours)

**Script 1: FilterWorkflowRuns**
```lua
-- Store in database as LuaScript
-- Input: { runs: array, filterStatus: string, filterBranch: string }
-- Output: { filtered: array, stats: object }

local function filterWorkflowRuns(runs, filterStatus, filterBranch)
  local filtered = {}
  local stats = { total = #runs, matched = 0, byStatus = {} }
  
  for _, run in ipairs(runs) do
    local statusMatch = (filterStatus == "" or run.status == filterStatus)
    local branchMatch = (filterBranch == "" or run.head_branch == filterBranch)
    
    if statusMatch and branchMatch then
      table.insert(filtered, run)
      stats.matched = stats.matched + 1
    end
    
    stats.byStatus[run.status] = (stats.byStatus[run.status] or 0) + 1
  end
  
  return { filtered = filtered, stats = stats }
end

return filterWorkflowRuns(context.data.runs, context.data.filterStatus, context.data.filterBranch)
```

**Script 2: AggregateJobLogs**
```lua
-- Input: { jobs: array, runName: string, runId: number }
-- Output: { fullLogs: string }
```

#### Phase 4: Component Decomposition (10 hours)

**New Component Structure:**

```
GitHubActionsFetcher.tsx (95 LOC)
├── GitHubActionsToolbar.tsx (65 LOC)
│   ├── Refresh button
│   ├── Download button
│   └── Auto-refresh toggle
├── GitHubActionsRunsList.tsx (80 LOC)
│   ├── GitHubActionsRunRow.tsx (45 LOC) × N
│   │   ├── Status badge
│   │   ├── Run info
│   │   └── Download logs button
│   └── Empty state
├── GitHubActionsJobsPanel.tsx (100 LOC)
│   ├── GitHubActionsJobStep.tsx (50 LOC) × N
│   │   ├── Step status icon
│   │   ├── Step name
│   │   └── Duration/timestamps
│   └── Logs viewer
└── GitHubActionsAnalysisPanel.tsx (70 LOC)
    ├── Analysis request buttons
    └── Results display
```

**Key Component Breakdown:**

| Component | LOC | Props | Responsibility |
|-----------|-----|-------|-----------------|
| GitHubActionsFetcher | 95 | - | Orchestrator, state management |
| GitHubActionsToolbar | 65 | isLoading, onRefresh, onDownload | Control UI |
| GitHubActionsRunsList | 80 | runs, onSelect, onDownloadLogs | Display runs |
| GitHubActionsRunRow | 45 | run, isSelected, onSelect | Single run item |
| GitHubActionsJobsPanel | 100 | runId, jobs, logs | Job/log display |
| GitHubActionsJobStep | 50 | step, jobName | Single step item |
| GitHubActionsAnalysisPanel | 70 | analysis, onAnalyze | Analysis UI |

#### Phase 5: UI Configuration (1.5 hours)

**Move to database:**

```json
{
  "statusColors": {
    "completed-success": "#16a34a",
    "completed-failure": "#dc2626",
    "completed-cancelled": "#6b7280",
    "in_progress": "#eab308"
  },
  "tabs": [
    { "id": "runs", "label": "Workflow Runs", "icon": "GitBranch" },
    { "id": "logs", "label": "Logs", "icon": "FileText" },
    { "id": "analysis", "label": "Analysis", "icon": "TrendUp" }
  ],
  "columns": [
    { "key": "name", "label": "Workflow", "width": "200px" },
    { "key": "status", "label": "Status", "width": "100px" },
    { "key": "created_at", "label": "Created", "width": "150px" }
  ]
}
```

#### Phase 6: Step-by-Step Refactoring Order

| Step | Task | Hours | Dependencies |
|------|------|-------|--------------|
| 1 | Create Prisma models | 2 | - |
| 2 | Create useGitHubActions hook | 3 | Models |
| 3 | Create useWorkflowLogs hook | 2 | Models |
| 4 | Create useWorkflowAnalysis hook | 2 | - |
| 5 | Create UI config in database | 1.5 | Models |
| 6 | Create GitHubActionsToolbar | 1.5 | useGitHubActions |
| 7 | Create GitHubActionsRunRow | 1 | UI config |
| 8 | Create GitHubActionsRunsList | 1.5 | RunRow |
| 9 | Create GitHubActionsJobStep | 1 | - |
| 10 | Create GitHubActionsJobsPanel | 2 | JobStep, useWorkflowLogs |
| 11 | Create GitHubActionsAnalysisPanel | 1.5 | useWorkflowAnalysis |
| 12 | Refactor main component | 2 | All sub-components |
| 13 | Add Lua scripts | 2 | Database |
| 14 | Testing & validation | 3 | All |
| **Total** | | **28 hours** | |

---

## VIOLATION #2: NerdModeIDE.tsx (733 LOC)

### Current Architecture Issues

**Component Responsibilities:**
- File tree structure management (create, read, update, delete)
- File content editor with Monaco
- Git configuration and operations
- Code execution and test running
- Console output logging
- Dialog management (Git config, new file)

**Critical Problems:**
1. **File tree stored in useKV** (should be database)
2. **Recursive tree operations duplicated** (should be Lua)
3. **Git config in useKV** (should be encrypted in database)
4. **Mock test results** (should integrate with real test runners)
5. **12+ useState hooks** managing different concerns

### Refactoring Plan: Phase-by-Phase

#### Phase 1: Database Models (2 hours)

```prisma
model IDEProject {
  id            String      @id
  name          String
  description   String?
  rootPath      String
  createdAt     DateTime
  updatedAt     DateTime
  ownerId       String
  tenantId      String?
  gitConfig     GitConfig?
  files         IDEFile[]
  testRuns      IDETestRun[]
}

model IDEFile {
  id            String      @id
  projectId     String
  name          String
  path          String
  type          String      // "file" | "folder"
  content       String?     // null for folders
  language      String?
  parentId      String?
  children      IDEFile[]   @relation("FileHierarchy")
  parent        IDEFile?    @relation("FileHierarchy", fields: [parentId], references: [id])
  order         Int
  createdAt     DateTime
  project       IDEProject  @relation(fields: [projectId], references: [id])
}

model GitConfig {
  id            String      @id
  projectId     String      @unique
  provider      String      // "github" | "gitlab"
  repoUrl       String
  branch        String
  tokenHash     String      // Encrypted
  project       IDEProject  @relation(fields: [projectId], references: [id])
}

model IDETestRun {
  id            String      @id
  projectId     String
  timestamp     DateTime
  resultsJson   String      // JSON array of TestResult
  duration      Int
  project       IDEProject  @relation(fields: [projectId], references: [id])
}
```

#### Phase 2: Custom Hooks (8 hours)

**Hook 1: useIDEProject** (1 hour)
- Load/update project metadata
- Handle project settings

**Hook 2: useIDEFileTree** (3 hours)
- All file tree operations (create, delete, update, move)
- Tree traversal and recursive operations
- Persist to database

**Hook 3: useIDEEditor** (1.5 hours)
- Active file selection
- File content state
- Save operations

**Hook 4: useIDEGit** (2 hours)
- Git config management
- Push/pull/commit operations
- Token encryption/decryption

**Hook 5: useIDETest** (1.5 hours)
- Test execution
- Results caching
- History management

#### Phase 3: Lua Scripts (1.5 hours)

**Script 1: FileTreeOperations**
- Create/delete/update nodes recursively
- Move files between folders
- Validate tree structure

**Script 2: LanguageDetection**
- Detect language from filename
- Return appropriate icon

**Script 3: RunCodeAnalysis**
- Basic syntax validation
- Issue detection

#### Phase 4: Component Decomposition (12 hours)

**New Structure:**

```
NerdModeIDE.tsx (110 LOC)
├── IDEFileTreePanel.tsx (90 LOC)
│   ├── IDEFileTreeNode.tsx (60 LOC) × N (tree)
│   │   ├── Expand icon
│   │   ├── File/folder icon
│   │   └── Context menu
│   └── Toolbar
├── IDEEditorPanel.tsx (85 LOC)
│   ├── Monaco editor
│   └── Save button
├── IDEToolbar.tsx (65 LOC)
│   ├── New file button
│   ├── Delete button
│   ├── Save button
│   └── Git config button
├── IDEConsolePanel.tsx (70 LOC)
│   ├── Console output
│   └── Test results display
├── IDEGitDialog.tsx (75 LOC)
│   └── Git config form
└── IDENewFileDialog.tsx (65 LOC)
    └── File creation form
```

#### Phase 5: Step-by-Step Refactoring

| Step | Task | Hours |
|------|------|-------|
| 1 | Create Prisma models | 2 |
| 2 | Create useIDEProject hook | 2 |
| 3 | Create useIDEFileTree hook | 3 |
| 4 | Create useIDEEditor hook | 1.5 |
| 5 | Create useIDEGit hook | 2 |
| 6 | Create useIDETest hook | 1.5 |
| 7 | Create IDEFileTreeNode | 1.5 |
| 8 | Create IDEFileTreePanel | 2 |
| 9 | Create IDEEditorPanel | 2 |
| 10 | Create IDEToolbar | 1.5 |
| 11 | Create IDEConsolePanel | 1.5 |
| 12 | Create IDEGitDialog | 1 |
| 13 | Create IDENewFileDialog | 1 |
| 14 | Refactor main component | 2 |
| 15 | Testing | 3 |
| **Total** | | **30 hours** |

---

## VIOLATION #3: LuaEditor.tsx (686 LOC)

### Current Architecture Issues

**Responsibilities:**
- Lua script list management
- Script editor with Monaco
- Parameter input/output management
- Security scanning
- Test execution
- Autocomplete configuration (60+ LOC!)
- Snippet library

**Main Issues:**
1. **Monaco config hardcoded** (60+ LOC of autocomplete)
2. **Security dialog inline**
3. **Parameter management coupled to script**
4. **Test output formatting in JSX**
5. **Snippet library button opens side panel**

### Refactoring Plan: Phase-by-Phase

#### Phase 1: Database Models (1.5 hours)

```prisma
model LuaScriptLibrary {
  id            String      @id
  name          String      @unique
  description   String?
  code          String
  category      String
  parameters    String      // JSON
  returnType    String?
  createdAt     DateTime
}

model LuaScriptParameter {
  id            String      @id
  scriptId      String
  name          String
  type          String      // "string" | "number" | "boolean" | "table"
  description   String?
  defaultValue  String?
  script        LuaScript   @relation(fields: [scriptId], references: [id])
}

model LuaTestRun {
  id            String      @id
  scriptId      String
  timestamp     DateTime
  inputsJson    String
  outputJson    String
  success       Boolean
  error         String?
  executionTimeMs Int
  script        LuaScript   @relation(fields: [scriptId], references: [id])
}
```

#### Phase 2: Extract Monaco Config (1.5 hours)

**Create: LuaMonacoConfig.tsx**
- Move all 60+ LOC of autocomplete configuration
- Language configuration
- Bracket matching, etc.
- Export reusable functions

#### Phase 3: Custom Hooks (4 hours)

**Hook 1: useLuaScripts** (1 hour)
- Script list CRUD

**Hook 2: useLuaEditor** (1 hour)
- Active script selection
- Code editing state

**Hook 3: useLuaExecution** (1.5 hours)
- Script execution
- Result caching
- History tracking

**Hook 4: useLuaSecurity** (0.5 hours)
- Security scan state
- Warning management

#### Phase 4: Component Decomposition (10 hours)

**New Structure:**

```
LuaEditor.tsx (120 LOC)
├── LuaScriptSelector.tsx (70 LOC)
│   ├── Script list
│   ├── Add button
│   └── Delete button
├── LuaCodeEditor.tsx (110 LOC)
│   ├── Monaco editor
│   ├── Scan button
│   └── Fullscreen button
├── LuaMonacoConfig.tsx (120 LOC)
│   ├── Autocomplete config
│   ├── Language config
│   └── Bracket matching
├── LuaParametersPanel.tsx (95 LOC)
│   ├── Parameter list
│   └── LuaParameterItem.tsx (60 LOC) × N
├── LuaExecutionPanel.tsx (100 LOC)
│   ├── Execute button
│   ├── Test inputs
│   └── LuaExecutionResult.tsx (80 LOC)
│       ├── Success/error display
│       ├── Logs tab
│       └── Return value tab
├── LuaSecurityWarningDialog.tsx (75 LOC)
│   └── Warning display with proceed option
└── LuaSnippetLibraryPanel.tsx (85 LOC)
    └── Snippet browser and insertion
```

#### Phase 5: Step-by-Step Refactoring

| Step | Task | Hours |
|------|------|-------|
| 1 | Update Prisma models | 1.5 |
| 2 | Extract LuaMonacoConfig | 1.5 |
| 3 | Create useLuaScripts | 1 |
| 4 | Create useLuaEditor | 1 |
| 5 | Create useLuaExecution | 1.5 |
| 6 | Create useLuaSecurity | 0.5 |
| 7 | Create LuaScriptSelector | 1.5 |
| 8 | Create LuaCodeEditor | 1.5 |
| 9 | Create LuaParameterItem | 1 |
| 10 | Create LuaParametersPanel | 1.5 |
| 11 | Create LuaExecutionResult | 1.5 |
| 12 | Create LuaExecutionPanel | 2 |
| 13 | Create LuaSecurityWarningDialog | 1 |
| 14 | Create LuaSnippetLibraryPanel | 1.5 |
| 15 | Refactor main component | 2 |
| 16 | Testing | 2.5 |
| **Total** | | **25 hours** |

---

## Cross-Cutting Implementation Patterns

### Error Boundary Pattern
```typescript
// src/components/ErrorBoundary.tsx
export function ErrorBoundary({ children, componentName }) {
  const [error, setError] = useState<Error | null>(null)
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error in {componentName}</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
        <Button onClick={() => setError(null)}>Dismiss</Button>
      </Alert>
    )
  }
  
  return children
}
```

### State Synchronization Pattern
```typescript
// src/hooks/useSync.ts
export function useSync<T>(
  id: string,
  fetchFn: (id: string) => Promise<T>,
  options?: { interval?: number }
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    setIsLoading(true)
    fetchFn(id).then(data => {
      setData(data)
      setIsLoading(false)
    })
  }, [id])
  
  return { data, isLoading }
}
```

### Configuration Loading Pattern
```typescript
// src/lib/config-loader.ts
export async function loadUIConfig(componentName: string) {
  const config = await db.query(
    `SELECT data FROM ComponentConfig WHERE name = ?`,
    [componentName]
  )
  return JSON.parse(config.data)
}
```

---

## Testing Strategy

### Unit Tests
```typescript
// src/hooks/__tests__/useGitHubActions.test.ts
describe('useGitHubActions', () => {
  it('should fetch workflow runs', async () => {
    const { result } = renderHook(() => useGitHubActions())
    await waitFor(() => expect(result.current.runs).toBeDefined())
  })
})
```

### Component Tests
```typescript
// src/components/__tests__/GitHubActionsRunRow.test.tsx
describe('GitHubActionsRunRow', () => {
  it('should render run data', () => {
    render(<GitHubActionsRunRow run={mockRun} />)
    expect(screen.getByText(mockRun.name)).toBeInTheDocument()
  })
})
```

### Integration Tests
```typescript
// e2e/github-actions.spec.ts
test('should fetch and display workflows', async () => {
  await page.goto('/github-actions')
  await page.click('button:has-text("Refresh")')
  await page.waitForSelector('[data-test="workflow-runs"]')
})
```

---

## Rollout Plan

### Phase 1: Preparation (1 week)
- [ ] Review and approve Prisma schema changes
- [ ] Design hook API contracts
- [ ] Plan component composition
- [ ] Set up testing infrastructure

### Phase 2: Implementation (2 weeks)
- **Week 1:**
  - Database models and migrations
  - Hook implementations (parallel)
  - Sub-component creation (sequential)
  
- **Week 2:**
  - Component composition
  - Lua script integration
  - Unit test writing

### Phase 3: Validation (1 week)
- [ ] Integration testing
- [ ] E2E testing
- [ ] Performance testing
- [ ] Security review
- [ ] Documentation

### Phase 4: Deployment (2 days)
- [ ] Backward compatibility check
- [ ] Staging deployment
- [ ] Production deployment
- [ ] Monitoring and hotfixes

---

## Success Criteria

✅ **Code Quality**
- All files under 150 LOC
- 80%+ test coverage
- No ESLint violations
- No TypeScript errors

✅ **Architecture**
- All business logic in hooks or Lua
- All state in database or React hooks
- Clean component composition
- No prop drilling

✅ **Performance**
- Component render < 100ms
- Database queries optimized
- No memory leaks
- No unnecessary re-renders

✅ **Testing**
- All hooks have unit tests
- All components have component tests
- Integration tests passing
- E2E tests passing

✅ **Documentation**
- Hooks documented with examples
- Components documented with props
- Architecture decisions documented
- Lua scripts documented

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Database migration issues | Medium | High | Backup database before migration |
| Hook API breaking changes | Medium | High | Comprehensive testing |
| Regression in functionality | Medium | High | Full test suite before deploy |
| Performance degradation | Low | High | Performance benchmarks |
| Token security issues | Low | Critical | Encrypt in database, use environment vars |

---

## Key Deliverables

1. **Refactored Components**
   - 10+ new sub-components
   - All under 150 LOC
   - Clear responsibility boundaries

2. **Custom Hooks**
   - 12+ new hooks for data and logic
   - Fully typed with TypeScript
   - Comprehensive error handling

3. **Database Models**
   - 15+ new Prisma models
   - Migrations
   - Seed data

4. **Lua Scripts**
   - 6+ business logic scripts
   - Sandboxed execution
   - Comprehensive testing

5. **Tests**
   - 50+ unit tests
   - 20+ component tests
   - 10+ integration tests

6. **Documentation**
   - Hook API documentation
   - Component prop documentation
   - Architecture decision records
   - Migration guide

---

## Total Effort Summary

| Violation | Hours | Target LOC |
|-----------|-------|-----------|
| GitHubActionsFetcher | 28 | 95 |
| NerdModeIDE | 30 | 110 |
| LuaEditor | 25 | 120 |
| Testing | 15 | - |
| Documentation | 5 | - |
| **TOTAL** | **103** | **325** |

**Timeline:** 3 weeks (assuming 2 developers, some parallel work)

**Expected Outcomes:**
- 73 LOC average per component (vs 569 currently)
- 95% reduction in components > 150 LOC
- Improved testability and reusability
- Better data persistence and multi-tenancy support
- Foundation for future modularization
