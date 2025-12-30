# Visual Architecture Diagrams

## Component Architecture Before & After

### GitHubActionsFetcher: Before (887 LOC)
```
┌─────────────────────────────────────────────┐
│  GitHubActionsFetcher.tsx (887 LOC)        │
├─────────────────────────────────────────────┤
│ ┌─ State (8+ hooks)                        │
│ │  - data: WorkflowRun[]                   │
│ │  - isLoading: boolean                    │
│ │  - error: string | null                  │
│ │  - selectedRunId: number | null          │
│ │  - runJobs: Job[]                        │
│ │  - runLogs: string | null                │
│ │  - analysis: string | null               │
│ │  - autoRefreshEnabled: boolean           │
│ │                                          │
│ ├─ Fetch Logic (100+ LOC)                 │
│ │  - fetchGitHubActions()                  │
│ │  - downloadRunLogs()                     │
│ │  - downloadWorkflowData()                │
│ │  - analyzeWorkflows()                    │
│ │  - analyzeRunLogs()                      │
│ │                                          │
│ ├─ Utilities (50+ LOC)                    │
│ │  - getStatusColor()                      │
│ │  - getStatusIcon()                       │
│ │  - useEffect hooks (polling, etc)       │
│ │                                          │
│ └─ UI Rendering (300+ LOC)                │
│    - Tabs (3)                             │
│    - Cards (10+)                          │
│    - Lists, Buttons, etc.                 │
└─────────────────────────────────────────────┘
```

### GitHubActionsFetcher: After (95 LOC)
```
┌────────────────────────────────────────────────────────────────┐
│  GitHubActionsFetcher.tsx (95 LOC - Orchestrator)             │
├────────────────────────────────────────────────────────────────┤
│  const { runs, isLoading } = useGitHubActions()               │
│  const [selectedRunId, setSelectedRunId] = useState(null)     │
│                                                                │
│  return (                                                      │
│    <Tabs>                                                      │
│      <GitHubActionsToolbar {...props} />                      │
│      <GitHubActionsRunsList {...props} />                     │
│      <GitHubActionsJobsPanel {...props} />                    │
│      <GitHubActionsAnalysisPanel {...props} />                │
│    </Tabs>                                                     │
│  )                                                             │
└────────────────────────────────────────────────────────────────┘
         │                    │                     │
         ▼                    ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ GitHubActions    │  │ GitHubActions    │  │ GitHubActions    │
│ Toolbar          │  │ RunsList         │  │ JobsPanel        │
│ (65 LOC)         │  │ (80 LOC)         │  │ (100 LOC)        │
└──────────────────┘  └──────────────────┘  └──────────────────┘
   │                        │                     │
   └────────────────────────┼─────────────────────┘
                            │
                   Uses: useGitHubActions()
                          useWorkflowLogs()
                          useWorkflowAnalysis()
```

---

## Data Flow Architecture

### Current (Monolithic)
```
┌─────────────────────────────────────┐
│  User Action                        │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Component setState                 │
│  (Lost on reload)                   │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  UI Render                          │
│  (300+ LOC mixed concerns)          │
└─────────────────────────────────────┘
```

### Refactored (Data-Driven)
```
┌─────────────────────────────────┐
│  User Action                    │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│  Custom Hook (useGitHubActions)       │
├────────────────────────────────────────┤
│  - API Call                            │
│  - Error Handling                      │
│  - Cache Management                    │
└────────────┬───────────────────────────┘
             │
     ┌───────┴────────┐
     │                │
     ▼                ▼
┌──────────┐    ┌──────────────┐
│ Database │    │ React State  │
│ (Persist)│    │ (UI only)    │
└──────────┘    └──────────────┘
     │                │
     └───────┬────────┘
             │
             ▼
  ┌──────────────────────┐
  │  Component Render    │
  │  (95 LOC, clean)     │
  └──────────────────────┘
```

---

## Database Schema Relationships

### GitHub Feature
```
┌──────────────────────────┐
│   GitHubConfig           │
│  (API credentials)       │
└──────────────┬───────────┘
               │ (1:N)
               ▼
┌──────────────────────────────┐
│   GitHubWorkflowRun          │
│  - id                        │
│  - name, status, conclusion  │
│  - htmlUrl, headBranch       │
│  - jobsData (JSON)           │
│  - logsData (cached)         │
│  - analysisCache (AI result) │
└──────────────┬───────────────┘
               │ (1:N)
               ▼
┌──────────────────────────────┐
│   GitHubWorkflowJob          │
│  - id, githubJobId           │
│  - name, status, conclusion  │
│  - stepsJson (array)         │
└──────────────────────────────┘
```

### IDE Feature
```
┌──────────────────────────┐
│   IDEProject             │
│  - id, name, ownerId     │
│  - createdAt, updatedAt  │
└──────────────┬───────────┘
     ┌─────────┼─────────┐
     │         │         │
  (1:N)     (1:N)     (1:1)
     │         │         │
     ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│IDEFile │ │IDETest │ │GitConfig
│(tree)  │ │Run     │ │
└────────┘ └────────┘ └────────┘
     │
  (1:N) 
 parent
     │
     ▼
┌────────┐
│IDEFile │ (children)
│(nested)│
└────────┘
```

### Lua Feature
```
┌──────────────────────────────┐
│   LuaScriptLibrary           │
│  - id, name, code            │
│  - category, parameters      │
└──────────────┬───────────────┘
               │ (1:N)
               ▼
┌──────────────────────────────┐
│   LuaScriptParameter         │
│  - name, type, defaultValue  │
└──────────────────────────────┘

┌──────────────────────────────┐
│   LuaScript                  │
│  (from existing model)       │
└──────────────┬───────────────┘
               │ (1:N)
               ▼
┌──────────────────────────────┐
│   LuaTestRun                 │
│  - timestamp, inputsJson     │
│  - outputJson, executionTime │
└──────────────────────────────┘
```

---

## Hook Composition Pattern

### For Complex Features (3+ responsibilities)
```
┌──────────────────────────┐
│ Component (UI only)      │
│ <100 LOC                 │
└────────┬────────┬────────┘
         │        │
         ▼        ▼
   ┌──────────┬──────────┐
   │ Hook 1   │ Hook 2   │
   │ (Logic)  │ (Logic)  │
   └──┬───────┴───┬──────┘
      │           │
      └─────┬─────┘
            ▼
       ┌─────────┐
       │Database │
       │ (State) │
       └─────────┘

Example: GitHubActionsFetcher
    Component (95 LOC)
         │      │      │
         ▼      ▼      ▼
   useGitHubActions
   useWorkflowLogs
   useWorkflowAnalysis
         │      │      │
         └──────┴──────┘
            ▼
       Database
    (Prisma models)
```

---

## Component Hierarchy

### GitHubActionsFetcher Tree
```
GitHubActionsFetcher (95 LOC)
├── GitHubActionsToolbar (65 LOC)
│   ├── Button (Refresh)
│   ├── Button (Download)
│   └── Toggle (Auto-refresh)
│
├── TabsList
│   ├── Tab (Runs)
│   ├── Tab (Logs)
│   └── Tab (Analysis)
│
├── TabsContent (Runs)
│   └── GitHubActionsRunsList (80 LOC)
│       ├── GitHubActionsRunRow (45 LOC)
│       │   ├── Badge (status)
│       │   ├── Text (workflow name)
│       │   └── Button (download logs)
│       └── GitHubActionsRunRow (45 LOC)
│           └── ...
│
├── TabsContent (Logs)
│   └── GitHubActionsJobsPanel (100 LOC)
│       ├── JobsList
│       │   └── GitHubActionsJobStep (50 LOC)
│       │       ├── Icon (status)
│       │       ├── Text (step name)
│       │       └── Badge (duration)
│       └── ScrollArea (logs)
│
└── TabsContent (Analysis)
    └── GitHubActionsAnalysisPanel (70 LOC)
        ├── Button (Analyze)
        └── Card (results)
```

---

## State Management Pattern

### Before: All in Component
```
Component State:
  - data: WorkflowRun[] (from API)
  - isLoading: boolean
  - error: string | null
  - selectedRunId: number | null
  - runJobs: Job[] (from API)
  - runLogs: string | null (from API)
  - analysis: string | null (from LLM)
  - isAnalyzing: boolean
  
Total: 8+ useState calls
All lost on page reload
Can't share with other components
```

### After: Separated Concerns
```
Database (Persistent):
  ✓ WorkflowRun
  ✓ WorkflowJob
  ✓ GitHubConfig
  
React State (Ephemeral UI):
  ✓ selectedRunId (local selection)
  ✓ showDialog (modal open/close)
  
Custom Hooks (Derived):
  ✓ useGitHubActions() → { runs, isLoading, error }
  ✓ useWorkflowLogs() → { logs, isLoading }
  ✓ useWorkflowAnalysis() → { analysis, isAnalyzing }

Total: 3 useState + 3 hooks
Persistent across reloads
Shareable with other components
```

---

## Refactoring Timeline Visualization

```
WEEK 1: GitHubActionsFetcher (28 hours)
│
├─ Mon (8h):   📊 Database + 🪝 API Hook
│  ├─ Create models
│  ├─ Migrations
│  └─ useGitHubActions
│
├─ Tue (4h):   🪝 Logs Hook
│  └─ useWorkflowLogs
│
├─ Wed (4h):   🪝 Analysis Hook
│  └─ useWorkflowAnalysis
│
├─ Thu (8h):   🧩 Components
│  ├─ GitHubActionsToolbar
│  ├─ GitHubActionsRunsList
│  ├─ GitHubActionsRunRow
│  └─ GitHubActionsJobsPanel
│
├─ Fri (4h):   🧩 Final Components + 🔄 Refactor
│  ├─ GitHubActionsJobStep
│  ├─ GitHubActionsAnalysisPanel
│  └─ Refactor main component to 95 LOC
│
└─ Testing: ✅ Unit + Component tests

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WEEK 2: NerdModeIDE (30 hours)
│
├─ Mon (8h):   📊 Database + 🪝 Project Hook
├─ Tue (6h):   🪝 File Tree Hook
├─ Wed (6h):   🪝 Editor + Git + Test Hooks
├─ Thu (8h):   🧩 Components (Tree + Editor)
├─ Fri (2h):   🧩 Final Components + Refactor
│
└─ Testing: ✅ Full integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WEEK 3: LuaEditor (25 hours)
│
├─ Mon (3h):   📊 Database updates
├─ Mon (2h):   🧩 Monaco Config extraction
├─ Tue (4h):   🪝 Hooks (Scripts, Editor, Exec, Security)
├─ Wed (8h):   🧩 Components (6)
├─ Thu (6h):   🧩 Final Components + Refactor
│
└─ Testing: ✅ Security focus

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WEEK 4: Validation & Deploy (20 hours)
│
├─ Mon (4h):   🧪 Unit test fixes
├─ Tue (4h):   🧪 Integration tests
├─ Wed (4h):   🔍 Code review & Optimization
├─ Thu (4h):   📋 Documentation & Deploy prep
│
└─ Fri (4h):   🚀 Production deploy + Monitoring

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Legend:
  📊 Database      🪝 Hooks      🧩 Components
  🧪 Testing      🔍 Review     📋 Docs       🚀 Deploy
```

---

## Metrics Visualization

### Code Size Reduction
```
BEFORE          AFTER
────────────────────────────
887 LOC ██████████████████│ GitHubActionsFetcher
        │95 LOC ██ (89% ↓)
        
733 LOC ███████████████ │ NerdModeIDE
        │110 LOC ██ (85% ↓)
        
686 LOC ███████████████ │ LuaEditor
        │120 LOC ██ (82% ↓)
```

### Component Count
```
BEFORE:  3 large components
AFTER:   25 small components

Distribution:
GitHub Features:  7 components
IDE Features:     8 components
Lua Features:    10 components

Average Size:
Before: 569 LOC
After:  73 LOC   (87% reduction)
```

### Custom Hooks Growth
```
BEFORE:  5 hooks
AFTER:   20+ hooks

By Feature:
GitHub:  3 hooks
IDE:     5 hooks
Lua:     4 hooks
Other:   8+ hooks
```

### Testing Coverage
```
BEFORE:  Limited component testing
AFTER:   Comprehensive testing

Unit Tests:      50+  (hooks, utilities)
Component Tests: 20+  (each component)
Integration:     10+  (workflows)
E2E:              5+  (full features)

Coverage Target: 80%+
```

---

## Risk Mitigation Map

```
RISKS                          MITIGATION
────────────────────────────────────────────

Database Migration        → Backup before
(Data Loss)                 Run in staging
                            Test rollback

Hook API Breaking         → Comprehensive
(Regressions)               testing
                            Backward compat

Performance Degradation   → Benchmarking
(Slow renders)              Profiling
                            Optimization

Token Security Issues     → Encryption
(Breach)                    Environment vars
                            No hardcoding

Scope Creep              → Strict checklist
(Missed deadline)         Weekly reviews
                            Limit changes

Team Capacity            → Parallel work
(Over-commitment)         Clear ownership
                            Time estimation
```

---

## Success Criteria Checklist

```
CODE QUALITY                    │ ARCHITECTURE
├─ All files < 150 LOC       ✓ ├─ Single responsibility       ✓
├─ 80%+ test coverage        ✓ ├─ Logic in hooks/Lua         ✓
├─ No ESLint violations      ✓ ├─ State in DB/React          ✓
├─ No TypeScript errors      ✓ ├─ Clean composition          ✓
└─ Proper error handling     ✓ └─ No prop drilling           ✓

PERFORMANCE                     │ TESTING
├─ Render < 100ms            ✓ ├─ All hooks tested           ✓
├─ DB queries < 50ms         ✓ ├─ All components tested      ✓
├─ No memory leaks           ✓ ├─ Integration tests          ✓
├─ No unnecessary re-renders ✓ ├─ E2E tests passing          ✓
└─ Minimal bundle impact     ✓ └─ No regressions            ✓
```

---

## Documentation Structure

```
docs/
├── REFACTORING_INDEX.md (←You are here)
│   └─ Links to all resources
│
├── REFACTORING_SUMMARY.md
│   └─ Executive overview
│
├── REFACTORING_STRATEGY.md
│   └─ Detailed technical blueprint
│
├── REFACTORING_CHECKLIST.md
│   └─ Implementation tasks
│
└── REFACTORING_QUICK_REFERENCE.md
    └─ Patterns & templates
```

---

**Generated:** December 25, 2025  
**Visual Summary Complete** ✅  
**Ready for Implementation** 🚀
