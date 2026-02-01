# Projects Framework & State Management Matrix
**Visual Reference Guide** - See which projects use what

---

## COMPLETE MATRIX

### By Framework & Architecture

```
                    │ UI FRAMEWORK        │ STATE MANAGEMENT │ SSR  │ STATUS
────────────────────┼─────────────────────┼──────────────────┼──────┼─────────────
workflowui          │ fakemui (M3)        │ Redux (11 slices)│ No   │ ✅ Complete
codegen             │ Radix UI + TW       │ Redux (16 slices)│ No   │ ✅ Correct
frontends/nextjs    │ fakemui (partial)   │ Core-only (?)    │ Yes  │ ⚠️ 70%
frontends/dbal      │ Tailwind CSS        │ Core-only (?)    │ Yes  │ ❌ Decide
pastebin            │ Custom Radix        │ Redux (4 slices) │ Yes  │ ✅ Correct
────────────────────┼─────────────────────┼──────────────────┼──────┼─────────────
redux/ (shared)     │ N/A (headless)      │ 33+ hooks        │ N/A  │ ✅ Working
packages/ (64)      │ JSON config         │ None             │ N/A  │ ✅ Correct
```

---

## ADOPTION BY FRAMEWORK

### FakeMUI Adoption

```
         100% ▓▓▓ workflowui
          70% ░▒▒ nextjs
           0% ░░░ dbal
           0% ░░░ codegen (intentional)
           0% ░░░ pastebin (intentional)
```

**Status**:
- ✅ workflowui: Complete adoption
- ⚠️ nextjs: Needs completion
- ❌ dbal: Not adopted (needs decision)
- ✅ codegen: Radix UI (correct)
- ✅ pastebin: Custom (correct)

---

### Redux Adoption

```
        16+ ▓▓▓ codegen      (Heavy - IDE)
        11+ ▓▓▓ workflowui   (Full - Editor)
         4  ░▒▒ pastebin     (Light - CRUD)
         0  ░░░ nextjs       (Unclear)
         0  ░░░ dbal         (Unclear)
```

**Status**:
- ✅ codegen: Exemplar implementation
- ✅ workflowui: Good integration
- ✅ pastebin: Appropriate usage
- ⚠️ nextjs: Intent not documented
- ⚠️ dbal: Intent not documented

---

## DECISION TREE

### For New Projects: Which Framework?

```
START
  │
  ├─ Is it a low-code IDE/design tool?
  │  └─ YES → Use Radix UI + Custom (like codegen)
  │
  ├─ Is it a Material Design app?
  │  ├─ YES → Use fakemui
  │  │  └─ Need complex state? → Add Redux
  │  │
  │  └─ NO → Use appropriate framework
  │
  └─ Is it a specialized tool?
     └─ YES → Use custom system (like pastebin)

Redux Decision:
  │
  ├─ Complex distributed state? → Use Heavy Redux (16+ slices)
  ├─ Feature-specific state? → Use Light Redux (4 slices)
  └─ Server-state focused? → Use Core-only + React Query
```

---

## PROJECT PROFILES

### 1. workflowui ✅

```
┌─────────────────────────────────────┐
│ WORKFLOWUI - WORKFLOW EDITOR        │
├─────────────────────────────────────┤
│ Framework:     fakemui              │
│ State Mgmt:    Redux (11 slices)    │
│ SSR:           No                   │
│ Type:          Visual editor        │
│ Architecture:  Client-side SPA      │
├─────────────────────────────────────┤
│ STATUS: ✅ PRODUCTION READY         │
├─────────────────────────────────────┤
│ Components: Box, Stack, Card, Button│
│            AppBar, Grid, Badge      │
│ Theming:   fakemui theming system   │
│ Auth:      Redux authSlice          │
│ Execution: Redux executionSlice     │
└─────────────────────────────────────┘
```

---

### 2. codegen ✅

```
┌─────────────────────────────────────┐
│ CODEGEN - LOW-CODE IDE              │
├─────────────────────────────────────┤
│ Framework:     Radix UI + Tailwind  │
│ State Mgmt:    Redux (16+ slices)   │
│ SSR:           No                   │
│ Type:          Browser IDE          │
│ Architecture:  Client-side SPA      │
├─────────────────────────────────────┤
│ STATUS: ✅ EXEMPLAR IMPLEMENTATION  │
├─────────────────────────────────────┤
│ Why Radix?   IDE needs primitives   │
│ Why Heavy?   Canvas, undo, panels   │
│ Middleware:  3 custom (sync, etc)   │
│ Hooks:       120+ custom hooks      │
│ Performance: Optimized selectors    │
└─────────────────────────────────────┘
```

---

### 3. nextjs ⚠️

```
┌─────────────────────────────────────┐
│ FRONTENDS/NEXTJS - PRIMARY WEB APP  │
├─────────────────────────────────────┤
│ Framework:     fakemui (70%)        │
│ State Mgmt:    Core-only (??)       │
│ SSR:           Yes                  │
│ Type:          Web application      │
│ Architecture:  SSR + Client         │
├─────────────────────────────────────┤
│ STATUS: ⚠️ INCOMPLETE               │
├─────────────────────────────────────┤
│ TODO: Complete fakemui migration    │
│ TODO: Clarify Redux role            │
│ TODO: Add explicit slices if needed │
│                                     │
│ Questions:                          │
│ • Why 70% fakemui?                  │
│ • Does it need Redux slices?        │
│ • Is SSR important?                 │
└─────────────────────────────────────┘
```

---

### 4. dbal ❌

```
┌─────────────────────────────────────┐
│ FRONTENDS/DBAL - DATABASE ADMIN     │
├─────────────────────────────────────┤
│ Framework:     Tailwind CSS         │
│ State Mgmt:    Core-only (??)       │
│ SSR:           Yes                  │
│ Type:          Admin interface      │
│ Architecture:  SSR + Client         │
├─────────────────────────────────────┤
│ STATUS: ❌ INCONSISTENT             │
├─────────────────────────────────────┤
│ Issues:                             │
│ • Not using fakemui (inconsistent)  │
│ • Redux role unclear                │
│ • Tailwind vs Material Design       │
│                                     │
│ Decision Needed:                    │
│ Option A: Migrate to fakemui        │
│ Option B: Document Tailwind choice  │
└─────────────────────────────────────┘
```

---

### 5. pastebin ✅

```
┌─────────────────────────────────────┐
│ PASTEBIN - CODE SNIPPET SHARING     │
├─────────────────────────────────────┤
│ Framework:     Custom (Radix/Lucide)│
│ State Mgmt:    Redux (4 slices)     │
│ SSR:           Yes                  │
│ Type:          Snippet manager      │
│ Architecture:  SSR + Client         │
├─────────────────────────────────────┤
│ STATUS: ✅ CORRECT DESIGN CHOICE    │
├─────────────────────────────────────┤
│ Why Custom?   Specialized UI        │
│ Why Light?    Simple CRUD state     │
│ Slices:       ui, snippets,         │
│              namespaces, persist   │
│ Appropriate:  Yes                   │
└─────────────────────────────────────┘
```

---

### 6. redux/ ✅

```
┌─────────────────────────────────────┐
│ REDUX - SHARED STATE MODULE         │
├─────────────────────────────────────┤
│ Type:          Shared library       │
│ Workspaces:    10                   │
│ Slices:        23 defined           │
│ Hooks:         33+ custom hooks     │
│ Used by:       5 frontends          │
├─────────────────────────────────────┤
│ STATUS: ✅ WELL-ORGANIZED           │
├─────────────────────────────────────┤
│ Exports:                            │
│ • Canvas hooks (6)                  │
│ • Editor hooks (7)                  │
│ • UI hooks (5)                      │
│ • Data hooks (4)                    │
│ • API clients                       │
│ • Core hooks                        │
│ • Auth hooks                        │
└─────────────────────────────────────┘
```

---

## PROBLEM SUMMARY

### Current Issues

```
┌─────────────────────────────────────────────────────┐
│ FAKEMUI USAGE                                       │
├─────────────────────────────────────────────────────┤
│ ✅ workflowui: 100% adoption (15+ components)       │
│ ⚠️ nextjs: 70% adoption (incomplete migration)      │
│ ❌ dbal: 0% adoption (Tailwind CSS)                 │
│ ✅ codegen: N/A (Radix UI - intentional)            │
│ ✅ pastebin: N/A (custom - intentional)             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ REDUX USAGE                                         │
├─────────────────────────────────────────────────────┤
│ ✅ codegen: 16+ slices (Heavy - correct)            │
│ ✅ workflowui: 11+ slices (Full - correct)          │
│ ✅ pastebin: 4 slices (Light - correct)             │
│ ⚠️ nextjs: 0 slices (Intent unclear)                │
│ ⚠️ dbal: 0 slices (Intent unclear)                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ FAKEMUI FOLDER STRUCTURE                            │
├─────────────────────────────────────────────────────┤
│ ❌ Mixed legacy code (QML, Python, SCSS)            │
│ ❌ Duplicate component definitions                  │
│ ❌ Orphaned utilities and folders                   │
│ ❌ ~60% of files are unused legacy code             │
│ ❌ Unclear import patterns                          │
└─────────────────────────────────────────────────────┘
```

---

## ACTION PRIORITY

### CRITICAL (This Week)
```
1. Reorganize fakemui folder
   ├─ Move: TSX/TS files to src/
   ├─ Delete: QML, Python, SCSS
   └─ Update: index.ts exports

2. Complete nextjs fakemui migration
   ├─ Audit: Find remaining components
   ├─ Migrate: Replace with fakemui
   └─ Test: Build passes
```

### HIGH (Next Week)
```
3. Decide on dbal UI framework
   ├─ Option A: Migrate to fakemui
   └─ Option B: Keep Tailwind

4. Clarify Redux in nextjs/dbal
   ├─ Document: Intent and reasoning
   └─ Decide: Add Redux if needed
```

### MEDIUM (Following Week)
```
5. Create Redux style guide
   ├─ Patterns: When to use each
   ├─ Examples: From codegen/workflowui
   └─ Guidelines: Best practices

6. Audit codegen Redux
   ├─ Review: 16+ slices organization
   ├─ Check: 3 middleware purposes
   └─ Verify: 120+ hooks naming
```

---

## SUCCESS CRITERIA

After completion:

### FakeMUI Quality
- [ ] Clean src/ folder structure
- [ ] No legacy files remaining
- [ ] Clear import patterns
- [ ] 100% component adoption in workflowui
- [ ] 100% component adoption in nextjs
- [ ] Build passes with no errors

### Redux Clarity
- [ ] All projects understand their Redux role
- [ ] nextjs intent documented
- [ ] dbal intent documented
- [ ] Style guide created
- [ ] New developers know what to do

### Developer Experience
- [ ] Easy to find components
- [ ] Clear import statements
- [ ] Consistent state management
- [ ] Good documentation

---

## VISUAL SUMMARY

### Before Reorganization
```
fakemui/
├── 🗂️ components/        ← Old JSX (unused)
├── 🗂️ contexts/          ← Old QML
├── 🗂️ core/              ← Old QML
├── 🗂️ fakemui/           ← Main lib (messy)
├── 🗂️ icons/             ← OK
├── 🗂️ qml-components/    ← Old QML duplicates
├── 🗂️ scss/              ← Old SCSS
├── 🗂️ src/               ← Orphaned
├── 🗂️ styles/            ← Conflicting
├── 🗂️ theming/           ← Old QML
└── 🗂️ widgets/           ← Old QML
    👎 Confusing structure, 60% unused
```

### After Reorganization
```
fakemui/
├── 🗂️ src/
│   ├── 🗂️ components/
│   │   ├── atoms/
│   │   ├── data-display/
│   │   ├── feedback/
│   │   ├── inputs/
│   │   ├── layout/
│   │   ├── navigation/
│   │   ├── surfaces/
│   │   ├── utils/
│   │   ├── lab/
│   │   ├── x/
│   │   └── workflows/
│   ├── 🗂️ icons/
│   ├── 🗂️ theming/
│   ├── 🗂️ styles/
│   └── 🗂️ utils/
├── 📄 index.ts
├── 📄 package.json
└── 📄 README.md
    👍 Clean, organized, 100% used
```

---

**Last Updated**: 2026-01-23
**Status**: Analysis Complete ✅
**Next Action**: Start reorganization

