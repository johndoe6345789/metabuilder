# 🎯 MetaBuilder Priority Action Plan
## Comprehensive Improvement Roadmap for Components, State, & Packages

**Document Date:** December 25, 2025  
**Status:** Active - Ready for Implementation  
**Total Effort:** ~180 hours over 8-10 weeks  
**Priority:** Critical path blocking production readiness

TODO: This file uses ./docs/... links which are broken from docs/reference/; update to correct relative paths.

---

## 📊 Executive Summary

MetaBuilder faces three critical improvement areas that impact maintainability, testability, and feature completeness:

| Area | Issue | Impact | Effort |
|------|-------|--------|--------|
| **Components** | 8 files exceeding 150 LOC (4,146 LOC over) | Code quality, testability, reuse | 65 hours |
| **State Management** | Scattered across React/Context/Database | Consistency, debugging, scalability | 45 hours |
| **Package System** | Incomplete asset handling & import/export | Feature delivery, user experience | 40 hours |
| **Documentation** | 4,935+ LOC scattered across 50+ files | Onboarding, team velocity, maintenance | 30 hours |

---

## 🔴 PHASE 1: CRITICAL PATH (Weeks 1-2, 35 hours)

### Priority 1A: Component Refactoring - Top 3 Violations
**Status:** Strategy complete, implementation ready  
**Effort:** 28 hours | **Timeline:** 1.5 weeks | **Outcome:** 89% LOC reduction

#### 1. GitHubActionsFetcher.tsx (887 LOC → 95 LOC)
**Current Issues:**
- API integration + UI rendering + state management combined
- Polling logic mixed with component lifecycle
- Analysis features hardcoded
- No hook-based reusability

**Refactoring Plan:**
```
┌─ useGitHubFetcher.ts (65 LOC)        [API & polling logic]
│  ├─ Fetch workflow runs
│  ├─ Handle auth/errors
│  └─ Auto-refresh management
├─ useAnalyzeWorkflows.ts (45 LOC)    [Analysis logic]
│  ├─ Parse workflow structures
│  └─ Generate insights
├─ WorkflowRunCard.tsx (48 LOC)        [Card display]
├─ WorkflowAnalysisPanel.tsx (52 LOC)  [Analysis UI]
└─ GitHubActionsFetcher.tsx (85 LOC)   [Container]
```

**Implementation Steps:**
1. Create `src/hooks/useGitHubFetcher.ts` (90 min)
   - Extract API calls and polling logic
   - Return: `{ runs, loading, error, refresh }`
2. Create `src/hooks/useAnalyzeWorkflows.ts` (60 min)
   - Analysis functions from component
   - Return: `{ insights, analyzeRun, analyzeLog }`
3. Create `src/components/WorkflowRunCard.tsx` (45 min)
   - Pure UI component for single run
4. Create `src/components/WorkflowAnalysisPanel.tsx` (45 min)
   - Analysis visualization
5. Refactor `GitHubActionsFetcher.tsx` to container (60 min)
   - Wire hooks + components, maintain same API
6. Add unit tests (90 min)
   - Hook: 8 test cases (auth, errors, retry)
   - Components: 6 test cases (rendering, interactions)

**Dependencies:** None (can start immediately)

---

#### 2. NerdModeIDE.tsx (733 LOC → 110 LOC)
**Current Issues:**
- File tree + editor + console + git all in one component
- Complex state: expandedNodes, openFiles, activeTab, editorContent
- Hardcoded layout and styling
- No Lua script integration

**Refactoring Plan:**
```
┌─ useFileTree.ts (85 LOC)             [File operations]
├─ useCodeEditor.ts (68 LOC)           [Editor state]
├─ useConsoleOutput.ts (42 LOC)        [Console management]
├─ FileTreePanel.tsx (72 LOC)
├─ EditorPanel.tsx (80 LOC)
├─ ConsoleOutput.tsx (55 LOC)
└─ NerdModeIDE.tsx (110 LOC)           [Container]
```

**Implementation Steps:**
1. Create hooks (4 hours total)
   - `useFileTree.ts`: tree navigation, expand/collapse
   - `useCodeEditor.ts`: tabs, active file, content
   - `useConsoleOutput.ts`: logs, clear, scroll
2. Create UI components (3 hours total)
   - FileTreePanel, EditorPanel, ConsoleOutput
3. Refactor container (1.5 hours)
4. Add integration tests (1.5 hours)

**Dependencies:** None (can start after GitHubActionsFetcher)

---

#### 3. LuaEditor.tsx (686 LOC → 120 LOC)
**Current Issues:**
- Script editor + preview + console all combined
- State: editorContent, selectedScript, previewOutput, errors
- Syntax highlighting hardcoded
- No persistence or script library integration

**Refactoring Plan:**
```
┌─ useLuaScript.ts (55 LOC)            [Script management]
├─ useLuaPreview.ts (48 LOC)           [Preview/execution]
├─ ScriptEditor.tsx (65 LOC)           [Edit UI]
├─ ScriptPreview.tsx (48 LOC)          [Preview UI]
└─ LuaEditor.tsx (120 LOC)             [Container]
```

**Implementation Steps:**
1. Create `useLuaScript.ts` (1.5 hours)
2. Create `useLuaPreview.ts` (1.5 hours)
3. Create UI components (2 hours)
4. Refactor container (1 hour)
5. Add tests (1 hour)

**Dependencies:** After GitHubActionsFetcher completion

---

### Priority 1B: Quick Wins - Medium Components
**Effort:** 7 hours | **Aim:** Remove 3 more violations while momentum is high

| Component | Current | Target | Effort | Notes |
|-----------|---------|--------|--------|-------|
| SchemaEditor | 520 LOC | 100 LOC | 2.5h | Extract form builder logic |
| ComponentConfigDialog | 450 LOC | 90 LOC | 2h | Break into config tabs |
| PropertyInspector | 380 LOC | 85 LOC | 1.5h | Split prop types |
| IRCWebchat | 290 LOC | 85 LOC | 1h | Move chat logic to hook |

---

## 🟡 PHASE 2: STATE MANAGEMENT (Weeks 3-4, 45 hours)

### Priority 2A: Audit Current State Patterns
**Effort:** 5 hours | **Deliverable:** State architecture document

**Scan all components for:**
1. useState usage patterns (30-50 likely candidates)
2. useContext usage (providers, themes, auth)
3. Prisma Database calls (create/read/update/delete)
4. Local vs. persistent data

**Create registry of:**
```typescript
interface StateAnalysis {
  component: string;
  useState: { [key: string]: 'local' | 'persistent' | 'cache' }
  useContext: string[];
  dbCalls: string[];
  recommendations: string[];
}
```

**Output:** `/docs/STATE_MANAGEMENT_AUDIT.md`

---

### Priority 2B: Define Unified State Strategy
**Effort:** 8 hours | **Deliverable:** State management specification

**Key Decisions:**
1. **Local State** (useState)
   - Ephemeral UI state (expanded, focused, hover)
   - Form inputs before submission
   - Modals/dialogs open/closed
   - → Max 1-2 items per component

2. **Database State** (Prisma)
   - Persistent user preferences
   - Feature configurations
   - Shared data across sessions
   - → Via `Database` helper class

3. **React Context** (Context API)
   - Auth/user context (global)
   - Theme/settings (global)
   - Notification system (global)
   - → Max 3-4 providers

4. **Cache State** (React Query / SWR)
   - API responses
   - Database queries with automatic sync
   - Optimistic updates
   - → For high-frequency updates

**Create:**
- Decision matrix: when to use each pattern
- Code templates for each pattern
- Migration checklist for existing state

---

### Priority 2C: Implement State Consolidation
**Effort:** 32 hours | **Deliverable:** Migrated state patterns

**Target Components (by impact):**
1. `Level5.tsx` - Convert context to database + hooks (4h)
2. `ComponentHierarchyEditor.tsx` - Local state → DB + Context (3h)
3. `PackageManager.tsx` - useState consolidation (3h)
4. `WorkflowEditor.tsx` - Query state separation (3h)
5. Create shared context providers (4h)
6. Create database state wrappers (5h)
7. Migrate 10 remaining components (7h)

**Metrics:**
- [ ] Reduce useState instances by 60%
- [ ] Standardize all database reads to `Database` class
- [ ] Consolidate to 3-4 global context providers
- [ ] Add caching layer for expensive queries

---

## 🔵 PHASE 3: PACKAGE SYSTEM (Weeks 4-6, 40 hours)

### Priority 3A: Analyze Current Package System
**Effort:** 4 hours | **Deliverable:** Gap analysis

**Current State:**
- ✅ Basic package structure exists
- ✅ Seed data in packages
- ✅ Package loader (initializePackageSystem)
- ❌ Asset handling incomplete
- ❌ Import/export missing UI
- ❌ No pre-built packages

**Read:** `/dbal/docs/AGENTS.md` for package architecture guidance

---

### Priority 3B: Complete Asset System
**Effort:** 12 hours | **Deliverable:** Asset management feature

**Features to Add:**
1. Asset storage in database
   ```prisma
   model Asset {
     id          String @id @default(cuid())
     packageId   String
     name        String
     type        String  // 'image' | 'icon' | 'font' | 'config'
     mimeType    String
     content     Bytes   // Base64 encoded
     metadata    Json
     tenantId    String
     createdAt   DateTime @default(now())
   }
   ```

2. Asset upload handler
   - `/api/packages/[packageId]/assets` POST
   - Max 10MB per asset
   - Scan for malicious content

3. Asset reference system
   - Component config: `{ icon: "@package/icon-name" }`
   - Runtime resolution: lookup in Asset table
   - Fallback to static_content/

4. Asset gallery UI component
   - Browse package assets
   - Upload/delete
   - Tag and organize

**Implementation:**
- Add Prisma model (30 min)
- Create API handler (1.5h)
- Create asset resolver utility (1h)
- Create React component (2h)
- Add unit tests (1h)
- Documentation (1h)

---

### Priority 3C: Implement Import/Export UI
**Effort:** 14 hours | **Deliverable:** User-friendly package management

**Features:**
1. Export Package Dialog
   ```
   ┌─ Package Selection
   ├─ Include Components ☑️
   ├─ Include Scripts ☑️
   ├─ Include Assets ☑️
   ├─ Include Schema ☑️
   └─ [Export as ZIP]
   ```

2. Import Package Dialog
   ```
   ┌─ [Upload .zip file]
   ├─ Preview Contents
   │  ├─ 5 Components
   │  ├─ 3 Scripts
   │  ├─ 12 Assets
   │  └─ 2 Schema Definitions
   ├─ Conflict Resolution ⚠️
   └─ [Import]
   ```

3. Package Marketplace UI
   - Browse pre-built packages
   - One-click install
   - Version management
   - Ratings/reviews

**Components to Create:**
- `PackageExportDialog.tsx` (80 LOC)
- `PackageImportDialog.tsx` (85 LOC)
- `PackageMarketplace.tsx` (95 LOC)
- `usePackageExport.ts` (50 LOC)
- `usePackageImport.ts` (55 LOC)

**Implementation:**
- Create hooks (3h)
- Create components (3h)
- Create API handlers (2h)
- Add validation/error handling (1.5h)
- Add tests (1.5h)
- Integration testing (2h)
- Documentation (1h)

---

### Priority 3D: Pre-built Packages Library
**Effort:** 10 hours | **Deliverable:** 5 ready-to-use packages

**Packages to Create:**
1. **DataGrid Package** (analytics dashboard)
   - Pre-built columns
   - Sorting/filtering
   - Export to CSV

2. **FormBuilder Package** (create forms)
   - 10 field types
   - Validation rules
   - Conditional fields

3. **ChartPackage** (visualizations)
   - Bar, line, pie charts
   - Real-time data binding
   - Themes

4. **AuthPackage** (login/signup)
   - Login page
   - Signup form
   - Password reset

5. **NotificationPackage** (alerts)
   - Toast notifications
   - Notification center
   - Email integration

**Each Package:** ~2 hours
- Define seed data structure
- Create components
- Add example scripts
- Package metadata
- Documentation

---

## 🟢 PHASE 4: DOCUMENTATION (Weeks 6-8, 30 hours)

### Priority 4A: Consolidate Scattered Documentation
**Effort:** 10 hours | **Deliverable:** Unified reference

**Current State:** 4,935+ LOC across 50+ files
- ✅ Architecture guides
- ✅ Implementation docs
- ✅ Quick references
- ❌ Fragmented and duplicated
- ❌ No clear hierarchy
- ❌ Hard to find information

**Create Master Index:**
```
/docs/INDEX.md (single entry point)
├── Quick Start (5 min)
├── Architecture (30 min)
│   ├── 5-Level System
│   ├── Packages
│   ├── State Management
│   └── DBAL
├── Implementation (2 hours)
│   ├── Component Refactoring
│   ├── State Management
│   ├── Package Development
│   └── Testing
├── Reference (lookup)
│   ├── API Documentation
│   ├── Component Library
│   ├── Lua Scripts
│   └── Configuration
└── Troubleshooting (FAQ)
```

**Steps:**
1. Audit all 50+ docs (2h)
2. Identify duplicates and gaps (1h)
3. Create master outline (1.5h)
4. Reorganize files (2h)
5. Create redirects/links (1.5h)
6. Update INDEX.md (2h)

---

### Priority 4B: Create Implementation Guide
**Effort:** 10 hours | **Deliverable:** Step-by-step execution manual

**Chapters:**
1. **Setup** (30 min)
   - Dev environment
   - Database initialization
   - Running tests

2. **Component Refactoring** (2 hours)
   - Checklist from Phase 1
   - Code templates
   - Common pitfalls
   - Success metrics

3. **State Management** (2 hours)
   - Decision tree
   - Pattern templates
   - Migration guide
   - Examples

4. **Package Development** (1.5 hours)
   - Package structure
   - Seed data format
   - Asset management
   - Publishing

5. **Testing** (1 hour)
   - Unit test templates
   - Integration tests
   - E2E tests

6. **Deployment** (1 hour)
   - Build process
   - Environment setup
   - Health checks

---

### Priority 4C: Create Developer Playbooks
**Effort:** 5 hours | **Deliverable:** Quick decision guides

**Playbooks:**
1. "I'm adding a new feature" (2 pages)
   - Checklist
   - File locations
   - Key files to modify

2. "I'm fixing a bug" (2 pages)
   - Debug strategy
   - Common issues
   - Test approach

3. "I'm refactoring a component" (2 pages)
   - Phase 1 checklist
   - Hook extraction
   - Testing

4. "I'm creating a package" (2 pages)
   - Package structure
   - Seed data format
   - Publishing

---

## 📈 PHASE 5: QUALITY & LAUNCH (Weeks 8-10, 30 hours)

### Priority 5A: Comprehensive Testing
**Effort:** 15 hours

**Coverage Goals:**
- [ ] All refactored components: 90%+ coverage
- [ ] All new hooks: 100% coverage
- [ ] E2E workflows: 100% passing
- [ ] Package system: 85%+ coverage

**Testing Strategy:**
1. Unit tests for hooks (5h)
2. Component tests (4h)
3. Integration tests (3h)
4. E2E smoke tests (2h)
5. Performance tests (1h)

---

### Priority 5B: Code Quality Review
**Effort:** 8 hours

- [ ] ESLint: all violations fixed
- [ ] TypeScript: no `any` types
- [ ] Size limits: all files <150 LOC
- [ ] Naming conventions: consistent
- [ ] Documentation: JSDoc on all exports
- [ ] Accessibility: WCAG 2.1 AA compliance

---

### Priority 5C: Production Readiness
**Effort:** 7 hours

**Checklist:**
- [ ] Security audit: no secrets in code
- [ ] Performance: Lighthouse scores >90
- [ ] Accessibility: all interactive elements keyboard-accessible
- [ ] Multi-tenancy: all queries include tenantId
- [ ] Error handling: graceful fallbacks
- [ ] Monitoring: logging in critical paths
- [ ] Documentation: updated

---

## 🎯 Success Metrics & Milestones

### PHASE 1 Completion (End of Week 2)
```
✅ 6 components refactored to <150 LOC
✅ 2,200 LOC moved to hooks/components
✅ All 6 covered by unit tests (>90%)
✅ GitHubActionsFetcher.tsx verified in production
```

### PHASE 2 Completion (End of Week 4)
```
✅ State management audit documented
✅ Unified state strategy defined
✅ 10 components migrated to new patterns
✅ 60% reduction in useState instances
✅ All state operations tested
```

### PHASE 3 Completion (End of Week 6)
```
✅ Asset system fully implemented
✅ Import/export UI complete
✅ 5 pre-built packages available
✅ Package marketplace functional
✅ All package operations tested
```

### PHASE 4 Completion (End of Week 8)
```
✅ Documentation consolidated
✅ Implementation guide published
✅ Developer playbooks available
✅ All docs indexed and linkable
✅ New developers can onboard in <2 hours
```

### PHASE 5 Completion (End of Week 10)
```
✅ 90%+ test coverage across refactored code
✅ All size limits enforced
✅ Zero security issues
✅ Performance >90% Lighthouse
✅ Production ready for launch
```

---

## 📋 Dependencies & Sequencing

```
┌─ PHASE 1: Components (Week 1-2)
│   ├─ GitHubActionsFetcher
│   ├─ NerdModeIDE
│   └─ LuaEditor + Medium Components
│
├─ PHASE 2: State Management (Week 3-4)
│   ├─ Audit (requires Phase 1 complete)
│   └─ Implementation (depends on audit)
│
├─ PHASE 3: Package System (Week 4-6)
│   ├─ Asset system (independent)
│   ├─ Import/export UI (depends on assets)
│   └─ Pre-built packages (independent)
│
├─ PHASE 4: Documentation (Week 6-8)
│   └─ Can run in parallel with Phase 3
│
└─ PHASE 5: Quality (Week 8-10)
    └─ Testing of all Phase 1-3 changes
```

---

## 💰 Resource Allocation

**Recommended Team:**
- **Developer 1 (60%):** Components + State Management
- **Developer 2 (40%):** Package System + Documentation
- **QA (50%):** Testing + Code Review
- **Tech Lead (20%):** Architecture + Planning + Review

**Alternative (Single Developer):**
- Phase 1: 2 weeks (components)
- Phase 2: 2 weeks (state)
- Phase 3: 2 weeks (packages)
- Phase 4: 1 week (docs)
- Phase 5: 1.5 weeks (testing)
- **Total:** 8.5 weeks at full-time

---

## ⚠️ Risk Mitigation

### Risk 1: Refactoring breaks existing features
**Mitigation:**
- Keep component API unchanged during refactoring
- Use feature flags for new state patterns
- Comprehensive E2E tests before/after
- Staged rollout to internal users first

### Risk 2: Team unfamiliar with new patterns
**Mitigation:**
- Early documentation (Phase 4B starts Week 1)
- Pairing/code review on first refactors
- Developer playbooks with clear examples
- Team training session (1 hour)

### Risk 3: Package system complexity
**Mitigation:**
- Start with simple pre-built packages
- Progressive enhancement (export first, then import)
- Fallback to manual package management
- Extensive testing of import/export

### Risk 4: Documentation becomes outdated
**Mitigation:**
- Single source of truth (INDEX.md)
- Automated doc generation where possible
- Monthly review cycle
- Version control for docs

---

## 📅 Week-by-Week Execution Plan

### Week 1: Foundation
- [ ] Day 1-2: GitHubActionsFetcher refactoring (hooks)
- [ ] Day 3-4: GitHubActionsFetcher refactoring (components)
- [ ] Day 5: NerdModeIDE planning + hook creation

### Week 2: Components Phase 1 Complete
- [ ] Day 1-2: NerdModeIDE refactoring
- [ ] Day 3-4: LuaEditor refactoring
- [ ] Day 5: Medium components + code review

### Week 3: State Audit & Strategy
- [ ] Day 1-2: Audit all components for state patterns
- [ ] Day 3-4: Define unified strategy
- [ ] Day 5: Team review + adjustments

### Week 4: State Migration Begins
- [ ] Days 1-5: Implement state consolidation for 5 components

### Week 5: Package System Assets
- [ ] Days 1-3: Asset system implementation
- [ ] Days 4-5: Asset tests + documentation

### Week 6: Package Import/Export
- [ ] Days 1-4: Import/export UI components
- [ ] Day 5: Integration testing

### Week 7: Pre-built Packages + Docs
- [ ] Days 1-3: Create 3 pre-built packages
- [ ] Days 4-5: Begin documentation consolidation

### Week 8: Docs + Packages Complete
- [ ] Days 1-3: Finish pre-built packages + docs
- [ ] Days 4-5: Complete documentation + playbooks

### Week 9: Quality & Testing
- [ ] Days 1-4: Comprehensive testing across all phases
- [ ] Day 5: Code quality review + fixes

### Week 10: Launch Prep
- [ ] Days 1-4: Final testing + bug fixes
- [ ] Day 5: Documentation review + launch checklist

---

## 🚀 Getting Started

### Immediate Actions (This Week)
1. [ ] Review this plan with team
2. [ ] Assign PHASE 1A components to developers
3. [ ] Set up test infrastructure if not done
4. [ ] Create branch for refactoring work
5. [ ] Schedule daily standup (15 min)

### First Sprint Tasks
```bash
# Create feature branch
git checkout -b refactor/phase1-components

# Start with GitHubActionsFetcher
cd src/hooks
# Create useGitHubFetcher.ts

# Run tests
npm test -- useGitHubFetcher.test.ts

# Check component size
npx tsx scripts/enforce-size-limits.ts
```

---

## 📞 Questions & Escalation

**During implementation, escalate if:**
1. Component doesn't fit into 150 LOC even after decomposition
2. State pattern doesn't fit one of 4 categories
3. Package system conflicts with existing data
4. Documentation gaps block development

**Contact:** Tech lead or architecture team

---

## ✅ Completion Checklist

### Before Declaring Phase Complete
- [ ] All acceptance criteria met
- [ ] Unit tests passing (>90% coverage)
- [ ] Code review approved
- [ ] No new bugs introduced
- [ ] Documentation updated
- [ ] Performance impact assessed

---

## 📎 Appendix: Reference Links

**Component Refactoring:**
- [REFACTORING_STRATEGY.md](./docs/refactoring/REFACTORING_STRATEGY.md)
- [REFACTORING_QUICK_REFERENCE.md](./REFACTORING_QUICK_START.md)
- [TEAM_CHECKLIST.md](./TEAM_CHECKLIST.md)

**State Management:**
- [NEXTJS_MIGRATION.md](./docs/implementation/NEXTJS_MIGRATION.md) - State section

**Package System:**
- [packages/README.md](./packages/README.md)
- [docs/architecture/packages.md](./docs/architecture/packages.md)
- [dbal/docs/AGENTS.md](./dbal/docs/AGENTS.md) - Package guidance

**DBAL:**
- [dbal/docs/README.md](./dbal/docs/README.md)
- [dbal/QUICK_START.md](./dbal/QUICK_START.md)

---

## 📝 Document History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-25 | 1.0 | Initial comprehensive action plan | Architecture Team |

---

**Generated:** 2025-12-25  
**Next Review:** After PHASE 1 Completion  
**Owner:** Tech Lead / Architecture Team
