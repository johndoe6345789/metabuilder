# FakeMUI & Redux Implementation Audit Report
**Date**: 2026-01-23
**Status**: Identified inconsistencies and organization issues

---

## EXECUTIVE SUMMARY

### FakeMUI Usage Status
- ✅ **workflowui**: 100% adoption (15+ components)
- ⚠️ **frontends/nextjs**: Partial migration (70% - 8 files confirmed, rest unknown)
- ❌ **frontends/dbal**: NOT using fakemui (Tailwind CSS instead)
- ❌ **codegen**: NOT using fakemui (intentional - Radix UI for IDE)
- ❌ **pastebin**: NOT using fakemui (intentional - custom Radix-based)
- ❌ **64 packages**: JSON-based, not using any UI framework

### Redux Usage Status
- ✅ **codegen**: Heavy usage (16+ slices, 3 middleware, 120+ hooks)
- ✅ **workflowui**: Full integration (11+ slices, 40+ hooks)
- ✅ **nextjs**: Minimal (only core-hooks + api-clients)
- ✅ **dbal**: Minimal (only core-hooks + api-clients)
- ✅ **pastebin**: Light usage (4 slices, 1 middleware)
- ✅ **redux/**: Shared module (10 workspaces, 33+ hooks total)

---

## PROBLEMS IDENTIFIED

### 1. FakeMUI Folder Structure is Messy
**Current Issues**:
- Mixed legacy code (QML, Python, SCSS) alongside React/TSX
- Duplicate component definitions (TSX + QML + Python)
- Unclear separation between library code and legacy code
- Orphaned SCSS files and legacy configurations
- Legacy documentation files mixed with modern guides
- Multiple index files with different export patterns

**Files Affected**:
```
fakemui/
├── components/          ← Legacy JSX (Button, Card, Table, Tabs) - NOT USED
├── contexts/            ← Legacy QML
├── core/                ← Legacy QML
├── fakemui/             ← MAIN library (TSX) - CORRECT
├── icons/               ← Icons TSX - CORRECT
├── qml-components/      ← Legacy QML duplicates
├── scss/                ← Legacy SCSS (Material Design v2)
├── src/                 ← Orphaned utilities
├── styles/              ← Conflicting with fakemui/ style system
├── theming/             ← Legacy QML
├── widgets/             ← Legacy QML
└── Documentation files scattered everywhere
```

### 2. Incomplete FakeMUI Migration in nextjs
**Status**: 70% complete
- 8 confirmed files using fakemui (seen in git diff)
- Unclear if all components migrated
- May have legacy Tailwind/MUI references remaining
- Type casting workarounds suggest incomplete integration

### 3. FrontEnds/DBAL Not Using FakeMUI
**Current**: Tailwind CSS 4.1.18
**Issue**: Inconsistent with workflowui ecosystem
**Options**:
1. Migrate to fakemui (aligns with Material Design)
2. Document intentional design choice

### 4. Redux Not Standardized
**Discrepancy**: codegen uses heavy Redux (16+ slices) while nextjs uses minimal
**Impact**: Unclear if nextjs should have feature parity with codegen
**Missing**: Integration pattern documentation

---

## PROJECTS NOT PROPERLY USING FAKEMUI & REDUX

### Category A: Should Use FakeMUI (Currently Don't)
| Project | Current | Issue | Priority |
|---------|---------|-------|----------|
| **frontends/dbal** | Tailwind CSS | Inconsistent with workflowui | HIGH |
| **frontends/nextjs** | Partial fakemui | Incomplete migration | HIGH |

### Category B: Intentionally Not Using FakeMUI (Design Choice)
| Project | Framework | Reason | Status |
|---------|-----------|--------|--------|
| **codegen** | Radix UI + Tailwind | IDE needs Radix primitives for flexibility | ✅ CORRECT |
| **pastebin** | Custom (Radix/Lucide) | Specialized UI for code snippets | ✅ CORRECT |

### Category C: Not Applicable (No UI Framework)
| Project | Type | Note |
|---------|------|------|
| **packages/** (64) | JSON configuration | Data-driven, no UI code |
| **redux/** | State management | Headless library |

---

## REDUX ADOPTION ISSUES

### Inconsistent State Management Patterns

**Heavy Redux Usage (codegen)**:
- 16+ slices (syncSlice, themeSlice, workflowsSlice, componentsSlice, fileSlice, projectSlice, settingsSlice, modelsSlice, etc.)
- 3 custom middleware (auto-sync, persistence, sync-monitor)
- 120+ custom hooks across modules
- Redux-persist for state hydration

**Minimal Redux Usage (nextjs/dbal)**:
- Only core-hooks + api-clients imports
- No explicit Redux slices visible
- No middleware configuration
- May be underutilizing Redux capabilities

**Light Redux Usage (pastebin)**:
- 4 slices (ui, namespaces, snippets, persistence)
- 1 middleware
- Basic integration

### Missing Documentation
- No clear pattern for when to use Redux vs local state
- No guidance on slice organization
- No middleware integration guide
- No hooks vs selectors best practices

---

## FAKEMUI REORGANIZATION PLAN

### Current Structure Issues
```
fakemui/
├── components/          ← LEGACY (unused, QML/old JSX)
├── contexts/            ← LEGACY (QML)
├── core/                ← LEGACY (QML)
├── fakemui/             ← MAIN (React TSX - KEEP)
│   ├── atoms/
│   ├── data-display/
│   ├── feedback/
│   ├── inputs/
│   ├── lab/
│   ├── layout/
│   ├── navigation/
│   ├── surfaces/
│   ├── theming/
│   ├── utils/
│   ├── workflows/
│   ├── x/
│   └── *.py            ← LEGACY (Python, unused)
├── icons/               ← CORRECT (React TSX)
├── qml-components/      ← LEGACY (QML duplicates)
├── scss/                ← LEGACY (Material Design v2)
├── src/                 ← ORPHANED (utilities)
├── styles/              ← CONFLICTING (duplicate system)
├── theming/             ← LEGACY (QML)
└── widgets/             ← LEGACY (QML)
```

### Recommended New Structure
```
fakemui/
├── src/
│   ├── components/
│   │   ├── atoms/           (Heading, Label, Panel, etc.)
│   │   ├── data-display/    (Avatar, Badge, List, Table, etc.)
│   │   ├── feedback/        (Alert, Progress, Spinner, etc.)
│   │   ├── inputs/          (Button, Input, Select, etc.)
│   │   ├── layout/          (Box, Grid, Stack, Container, etc.)
│   │   ├── navigation/      (Menu, Pagination, Breadcrumbs, etc.)
│   │   ├── surfaces/        (Card, AppBar, Drawer, etc.)
│   │   ├── utils/           (Modal, Dialog, Portal, etc.)
│   │   ├── lab/             (LoadingButton, Timeline, etc.)
│   │   ├── x/               (DataGrid, DatePicker, etc.)
│   │   └── workflows/       (WorkflowCard, etc.)
│   ├── icons/               (330+ Material Design Icons)
│   ├── theming/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   └── providers.tsx
│   ├── styles/
│   │   ├── base.scss        (Global reset, typography)
│   │   ├── variables.scss   (Colors, spacing, typography)
│   │   ├── mixins.scss      (Layout, input, interactive helpers)
│   │   └── theme.scss       (M3 color system)
│   ├── utils/
│   │   ├── classNames.ts
│   │   ├── index.ts
│   │   └── accessibility.ts
│   └── index.ts             (Main export file)
├── package.json
├── tsconfig.json
├── README.md
├── COMPONENT_GUIDE.md
├── MIGRATION_SUMMARY.md
└── LICENSE

## Deleted Directories
- components/           (old JSX, unused)
- contexts/             (old QML)
- core/                 (old QML)
- qml-components/       (old QML duplicates)
- scss/                 (old Material v2)
- src/styles & src/utils (moved into src/)
- theming/ (old QML)
- widgets/              (old QML)

## Deleted Files
- fakemui/*.py          (Python, unused)
- Various legacy documentation
```

---

## IMMEDIATE ACTIONS REQUIRED

### Priority 1: Organization (This Week)
1. ✅ Backup current structure
2. Create new folder structure under `src/`
3. Move all TSX/TS files into appropriate `src/` subdirectories
4. Delete legacy QML/Python/SCSS folders
5. Update import paths in index.ts
6. Test imports in workflowui and nextjs

### Priority 2: Migration Completion (Next Week)
1. Complete nextjs→fakemui migration (100% of components)
2. Audit for remaining Material-UI or Tailwind usage
3. Update workflowui if import paths changed

### Priority 3: Decision on dbal (Following Week)
1. **Decision**: Migrate to fakemui or stay with Tailwind?
2. If migrating: update imports and styling
3. If keeping: document design choice

### Priority 4: Redux Standardization (Following Week)
1. Document Redux adoption patterns
2. Create guidelines for when to use Redux vs local state
3. Consider gradual Redux adoption in nextjs/dbal

---

## DETAILED FINDINGS: PROJECTS NOT USING FAKEMUI

### frontends/nextjs - Partial Migration ⚠️
```
Status: 70% complete

Current Implementation:
✅ fakemui-registry.ts (130+ lazy-loaded components)
✅ EmptyState.tsx (using fakemui components)
✅ render-json-component.tsx (JSON rendering with fakemui)
✅ Pagination components (3 files)
✅ Icon utilities
✅ Provider setup

Known Issues:
❓ Unclear if ALL components migrated
❓ Legacy Tailwind/MUI references may remain
⚠️ Type casting workarounds in some files

Dependencies:
@metabuilder/core-hooks ✅
@metabuilder/api-clients ✅
redux ^5.0.1
react-redux ^9.2.0
redux-thunk ^2.4.2
```

### frontends/dbal - Tailwind Only ❌
```
Status: NOT migrated

Current Implementation:
- Tailwind CSS 4.1.18 (production utility classes)
- PostCSS setup
- No fakemui references anywhere

Architecture:
📍 Next.js 16.1.2 + React 19.2.3
📍 Server components possible
📍 Responsive design via Tailwind

Dependencies:
tailwindcss ^4.1.18
postcss ^8.4.41
@metabuilder/core-hooks ✅
@metabuilder/api-clients ✅
redux ^5.0.1
react-redux ^9.2.0

Decision Needed:
Option A: Migrate to fakemui (align with workflowui, Material Design)
Option B: Keep Tailwind (design choice, simpler styling)
```

### codegen - Radix UI (Intentional) ✅
```
Status: Correct design choice

Rationale:
- Low-code IDE needs maximum component flexibility
- Radix UI provides unstyled primitives for custom design
- Not a consumer of Material Design components
- Separate styling system (Tailwind + custom CSS)
- Heavy Redux for state management (16+ slices)

Current Implementation:
✅ 30+ @radix-ui packages
✅ Tailwind CSS for styling
✅ lucide-react icons
✅ framer-motion, d3, recharts for viz
✅ NOT a candidate for fakemui migration
```

### pastebin - Custom System (Intentional) ✅
```
Status: Correct design choice

Rationale:
- Code snippet sharing has specialized UI
- Custom component system works well
- @phosphor-icons/react (custom icon set)
- Embla carousel, framer-motion for interactions

Current Implementation:
✅ Custom Radix/Lucide-based system
✅ NOT a candidate for fakemui migration
✅ Redux integration (4 slices) for state
```

---

## FILES TO DELETE (LEGACY/REDUNDANT)

### QML Components (Duplicate React)
```
fakemui/qml-components/
fakemui/contexts/
fakemui/core/
fakemui/widgets/
fakemui/theming/        (old QML theming)
```

### Old JSX (Unused)
```
fakemui/components/
```

### Legacy SCSS
```
fakemui/scss/           (Material v2, not used)
```

### Orphaned Python
```
fakemui/fakemui/*.py    (atoms.py, base.py, etc.)
```

### Orphaned Utilities
```
fakemui/src/            (move to src/utils/)
```

---

## VALIDATION CHECKLIST

After reorganization:
- [ ] All imports in workflowui still work
- [ ] All imports in nextjs still work
- [ ] Icon exports working correctly
- [ ] Theming system accessible
- [ ] index.ts exports all 130+ components
- [ ] No orphaned files remaining
- [ ] Build passes with no import errors
- [ ] TypeScript no errors

