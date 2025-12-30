# MetaBuilder Component Refactoring Strategy - Complete Guide

> **Status:** ✅ Strategy Complete - Ready for Implementation  
> **Generated:** December 25, 2025  
> **Estimated Effort:** 103 hours over 4 weeks

## 📖 Documentation Index

This guide addresses React component size violations in MetaBuilder. The project enforces a <150 LOC limit per component to maintain modularity and follow the data-driven architecture philosophy.

### 📑 Documents in This Series

| Document | Purpose | Audience | Length |
|----------|---------|----------|--------|
| **[REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)** | Executive overview and quick stats | Managers, Tech Leads | 300 lines |
| **[REFACTORING_STRATEGY.md](REFACTORING_STRATEGY.md)** | Detailed technical blueprint | Developers, Architects | 1,673 lines |
| **[REFACTORING_CHECKLIST.md](REFACTORING_CHECKLIST.md)** | Implementation task list | Project Managers | 484 lines |
| **[REFACTORING_QUICK_REFERENCE.md](REFACTORING_QUICK_REFERENCE.md)** | Patterns, templates, pitfalls | Developers | 857 lines |

---

## 🎯 Quick Start

### For Managers
1. Read **REFACTORING_SUMMARY.md** (5 min)
2. Review timeline and effort estimates
3. Allocate team resources for 4-week sprint
4. Approve database schema changes

### For Tech Leads
1. Read **REFACTORING_STRATEGY.md** (30 min)
2. Review architecture decisions
3. Approve hook and component designs
4. Plan code review process

### For Developers
1. Start with **REFACTORING_QUICK_REFERENCE.md** (15 min)
2. Deep dive into **REFACTORING_STRATEGY.md** for your assigned violation
3. Use **REFACTORING_CHECKLIST.md** as you implement
4. Reference patterns for similar components

### For Architects
1. Review entire **REFACTORING_STRATEGY.md** 
2. Evaluate database schema design
3. Validate hook API contracts
4. Assess multi-tenant implications

---

## 📊 At a Glance

### The Problem
- **8 components** exceed 150 LOC architectural limit
- **Largest:** GitHubActionsFetcher (887 LOC)
- **Average:** 569 LOC per violation
- **Impact:** Hard to test, maintain, and reuse

### The Solution
- **Component decomposition** into focused, small components
- **Custom hooks** for business logic and data management
- **Database persistence** for state that survives reloads
- **Lua scripts** for complex, reusable operations
- **Configuration as data** instead of hardcoded values

### The Outcome
```
BEFORE                      AFTER
────────────────────────────────────────
8 monoliths             →   40+ small components
569 LOC average         →   73 LOC average
5 custom hooks          →   20+ custom hooks
~10 Lua scripts         →   ~15 Lua scripts
Ephemeral state         →   Persistent database
Hardcoded config        →   JSON in database
```

---

## 🔍 Violations by Priority

### Violation #1: GitHubActionsFetcher.tsx (887 LOC)
**Target:** 95 LOC | **Effort:** 28 hours | **Timeline:** Week 1

**Responsibilities to split:**
- GitHub API integration → useGitHubActions hook
- Log fetching → useWorkflowLogs hook  
- Analysis → useWorkflowAnalysis hook
- UI rendering → 6 sub-components

**Database models:** 3 (WorkflowRun, Job, Config)

**See:** [REFACTORING_STRATEGY.md - Violation #1](REFACTORING_STRATEGY.md#violation-1-githubactionsfetchertsx-887-loc)

---

### Violation #2: NerdModeIDE.tsx (733 LOC)
**Target:** 110 LOC | **Effort:** 30 hours | **Timeline:** Week 2

**Responsibilities to split:**
- File tree operations → useIDEFileTree hook
- Project management → useIDEProject hook
- File editing → useIDEEditor hook
- Git operations → useIDEGit hook
- Test execution → useIDETest hook
- UI rendering → 7 sub-components

**Database models:** 4 (Project, File, GitConfig, TestRun)

**See:** [REFACTORING_STRATEGY.md - Violation #2](REFACTORING_STRATEGY.md#violation-2-nerdmodeidetsx-733-loc)

---

### Violation #3: LuaEditor.tsx (686 LOC)
**Target:** 120 LOC | **Effort:** 25 hours | **Timeline:** Week 3

**Responsibilities to split:**
- Monaco config (60+ LOC) → LuaMonacoConfig component
- Script management → useLuaScripts hook
- Editor state → useLuaEditor hook
- Execution → useLuaExecution hook
- Security → useLuaSecurity hook
- UI rendering → 8 sub-components

**Database models:** 3 (Library, Parameter, TestRun)

**See:** [REFACTORING_STRATEGY.md - Violation #3](REFACTORING_STRATEGY.md#violation-3-luaeditortsx-686-loc)

---

## 🏗️ Architecture Pattern

### Before (Monolithic)
```
Component.tsx (800+ LOC)
├── useState for everything (15+ hooks)
├── API calls inline
├── Business logic mixed with UI
├── Hardcoded configs
└── Lost on page reload
```

### After (Modular, Data-Driven)
```
Component.tsx (100 LOC) - UI only
├── Sub1.tsx (60 LOC) - Sub-feature 1
├── Sub2.tsx (70 LOC) - Sub-feature 2
├── Sub3.tsx (50 LOC) - Sub-feature 3
│
Hooks (extracted)
├── useFeature1.ts - Data + logic
├── useFeature2.ts - Data + logic
└── useFeature3.ts - Data + logic
│
Database (persistent)
├── Model1 - Feature 1 state
├── Model2 - Feature 2 state
└── Model3 - Feature 3 state
│
Lua (reusable)
├── ComplexOperation1.lua
└── ComplexOperation2.lua
```

---

## 📈 Effort & Timeline

```
WEEK 1: GitHubActionsFetcher (28 hours)
├─ Mon: Database + API hook
├─ Tue-Wed: Log + Analysis hooks  
├─ Thu: Components (toolbar, list, jobs)
└─ Fri: Panel + Main component

WEEK 2: NerdModeIDE (30 hours)
├─ Mon: Database + Project hook
├─ Tue-Wed: Tree + Editor hooks
├─ Thu: File Tree + Panels
└─ Fri: Dialogs + Main component

WEEK 3: LuaEditor (25 hours)
├─ Mon: Config extraction + Hooks
├─ Tue: Parameter + Execution
├─ Wed: Security + Snippets
└─ Thu-Fri: Main component + Tests

WEEK 4: Validation (20 hours)
├─ Mon-Tue: Unit & Integration tests
├─ Wed: Code review & Optimization
├─ Thu: Staging & Documentation
└─ Fri: Production deploy

────────────────────────────────
TOTAL: 103 hours over 4 weeks
```

---

## 💾 Database Design Summary

### New Models: 15 total

**GitHub Feature (3):**
- GitHubWorkflowRun - Workflow runs with cached data
- GitHubWorkflowJob - Job details and steps
- GitHubConfig - API credentials and settings

**IDE Feature (4):**
- IDEProject - Project metadata
- IDEFile - File tree with content
- GitConfig - Git repository config (shared)
- IDETestRun - Test execution results

**Lua Feature (3):**
- LuaScriptLibrary - Reusable code snippets
- LuaScriptParameter - Parameter definitions
- LuaTestRun - Execution history

**Updated (1):**
- LuaScript - Add description field

**System (2):**
- Tenant - Multi-tenant support
- User - Owner tracking

---

## 🪝 Custom Hooks Design

### Data Fetching Hooks (3)
```typescript
useGitHubActions()
useWorkflowLogs()
useWorkflowAnalysis()
```

### File Management Hooks (5)
```typescript
useIDEProject()
useIDEFileTree()
useIDEEditor()
useIDEGit()
useIDETest()
```

### Lua Management Hooks (4)
```typescript
useLuaScripts()
useLuaEditor()
useLuaExecution()
useLuaSecurity()
```

---

## 🧩 New Components: 25 total

### GitHubActions (7)
1. GitHubActionsToolbar - Refresh, download controls
2. GitHubActionsRunsList - Workflow runs display
3. GitHubActionsRunRow - Single run item
4. GitHubActionsJobsPanel - Job and log display
5. GitHubActionsJobStep - Single step item
6. GitHubActionsAnalysisPanel - AI analysis results
7. GitHubActionsFetcher - Refactored orchestrator

### NerdModeIDE (8)
1. IDEFileTreePanel - File tree with nodes
2. IDEFileTreeNode - Single file/folder item
3. IDEEditorPanel - Monaco editor with toolbar
4. IDEToolbar - File/project operations
5. IDEConsolePanel - Output and test results
6. IDEGitDialog - Git configuration
7. IDENewFileDialog - Create file dialog
8. NerdModeIDE - Refactored orchestrator

### LuaEditor (10)
1. LuaScriptSelector - Script list
2. LuaCodeEditor - Monaco editor
3. LuaMonacoConfig - Editor configuration (60+ LOC extracted)
4. LuaParameterItem - Single parameter editor
5. LuaParametersPanel - Parameter list
6. LuaExecutionResult - Results display
7. LuaExecutionPanel - Execute script UI
8. LuaSecurityWarningDialog - Security warnings
9. LuaSnippetLibraryPanel - Code snippets
10. LuaEditor - Refactored orchestrator

---

## 🧪 Testing Strategy

### Unit Tests
- Each custom hook with mocked database/API
- Isolated component testing with mocked props
- 80%+ code coverage

### Component Tests
- Props validation
- User interactions (click, type)
- State changes
- Error handling

### Integration Tests
- Hook + Component interaction
- Database persistence
- Multiple component composition

### E2E Tests
- Full feature workflows
- Real API calls
- Complete user journeys

---

## ✅ Success Criteria

- [ ] All components < 150 LOC
- [ ] 80%+ test coverage
- [ ] Zero ESLint violations
- [ ] All database migrations completed
- [ ] All hooks fully typed
- [ ] All Lua scripts tested
- [ ] No performance regressions
- [ ] All E2E tests passing
- [ ] Complete documentation

---

## 🚀 Getting Started

### Step 1: Preparation
1. Review REFACTORING_STRATEGY.md with team
2. Approve database schema
3. Set up testing environment
4. Create GitHub issues from checklist

### Step 2: Implementation (Week 1-3)
1. Follow the 3-week implementation plan
2. Use REFACTORING_CHECKLIST.md for tracking
3. Reference REFACTORING_QUICK_REFERENCE.md for patterns
4. Complete weekly code reviews

### Step 3: Validation (Week 4)
1. Run full test suite
2. Performance benchmarking
3. Code review and optimization
4. Documentation finalization

### Step 4: Deployment
1. Staging environment testing
2. Team sign-off
3. Production deployment
4. Monitoring and support

---

## 📚 Related Resources

TODO: Paths below are wrong from docs/refactoring; update copilot/PRD and schema/src references to valid locations.
- **[copilot-instructions.md](../.github/copilot-instructions.md)** - MetaBuilder architecture guide
- **[PRD.md](./PRD.md)** - Product requirements
- **[prisma/schema.prisma](../prisma/schema.prisma)** - Current database schema
- **[src/hooks/](../src/hooks/)** - Existing hook examples
- **[src/components/](../src/components/)** - Component examples

---

## 🤝 Contributing

When implementing this strategy:

1. **Follow the checklist** - Don't skip steps
2. **Write tests first** - TDD approach
3. **Document as you go** - Don't wait until the end
4. **Ask questions** - If unclear about design
5. **Communicate progress** - Weekly status updates
6. **Code review thoroughly** - Multiple eyes on changes

---

## 📞 Questions?

| Question | Document | Section |
|----------|----------|---------|
| "What's the total effort?" | REFACTORING_SUMMARY.md | Effort Breakdown |
| "How do I structure hooks?" | REFACTORING_QUICK_REFERENCE.md | Hook API Patterns |
| "What are the pitfalls?" | REFACTORING_QUICK_REFERENCE.md | Common Pitfalls |
| "What's my task?" | REFACTORING_CHECKLIST.md | Your Violation |
| "Full technical details?" | REFACTORING_STRATEGY.md | Full Document |

---

## 🎓 Key Principles

The strategy follows MetaBuilder's core philosophy:

1. **Data-Driven** - Configuration in database/JSON, not code
2. **Modular** - Small, focused components with clear boundaries
3. **Reusable** - Hooks for logic, Lua for runtime-modifiable operations
4. **Testable** - Each piece independently testable
5. **Persistent** - State survives page reloads via database
6. **Multi-tenant** - Database schema supports multiple tenants

---

## 📋 Document Checklist

- [x] Summary of violations identified
- [x] Detailed refactoring plan for each violation
- [x] Database schema design
- [x] Hook API specifications
- [x] Component decomposition plan
- [x] Lua script definitions
- [x] Testing strategy
- [x] Implementation checklist
- [x] Quick reference guide
- [x] Timeline and effort estimates
- [x] Risk mitigation strategies
- [x] Success criteria

---

**Version:** 1.0  
**Status:** Ready for Implementation ✅  
**Last Updated:** December 25, 2025  
**Total Documentation:** 3,600+ lines  

**Next Step:** Discuss with team and begin Week 1 implementation! 🚀
