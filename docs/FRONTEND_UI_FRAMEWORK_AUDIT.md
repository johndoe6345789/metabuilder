# MetaBuilder Frontend UI Framework & State Management Audit

**Date**: January 23, 2026
**Status**: Comprehensive audit complete
**Priority**: High - Standardization needed

---

## Executive Summary

The MetaBuilder project has **fragmented UI framework adoption** across frontends:
- **FakeMUI**: Only 1 project (workflowui) actively using it despite being the standard
- **Radix UI + Tailwind**: 3 projects using this stack (codegen, frontends/nextjs, pastebin)
- **Material-UI**: postgres dashboard using direct MUI (CONFLICT with FakeMUI)
- **Minimal/None**: 4 projects with no comprehensive UI framework

**Redux Package Status**: 9 separate packages should be consolidated into 1

---

## Part 1: FakeMUI Adoption Status

### Current Usage Matrix

| Project | Framework | FakeMUI | Redux | Status | Priority |
|---------|-----------|---------|-------|--------|----------|
| workflowui | Next.js 15 | ✅ **ACTIVE** | ✅ | Production | - |
| **postgres** | Next.js 16 | ❌ **Direct MUI** | ❌ | **CONFLICT** | **P1** |
| frontends/nextjs | Next.js 16 | ❌ Radix+Tailwind | ✅ | Established | P2 |
| codegen | Vite/React 19 | ❌ Radix+Shadcn | ✅ | Framework layer | P3 |
| pastebin | Next.js 15 | ❌ Radix+CVA | ✅ | Secondary app | P3 |
| frontends/dbal | Next.js 16 | ❌ Tailwind only | ✅ | Minimal | P4 |
| exploded-diagrams | Next.js 15 | ❌ Three.js/R3F | ❌ | Specialized | - |
| dockerterminal | React+Node | ❓ Unknown | ❌ | Unknown | P4 |
| gameengine | C++/bgfx | ❌ SDL3 | ❌ | Native code | - |

### FakeMUI Component Coverage

FakeMUI provides **98 production-ready React components** organized by category:

```
inputs/        30 components  (TextField, Button, Checkbox, Select, etc.)
data-display/  26 components  (Table, List, Avatar, Badge, etc.)
navigation/    22 components  (Tabs, Breadcrumb, Stepper, Drawer, etc.)
surfaces/      15 components  (Card, Panel, Modal, etc.)
utils/         15 components  (Portal, Popover, Tooltip, etc.)
atoms/          9 components  (Spacer, Divider, Typography, etc.)
lab/           11 components  (Experimental features)
x/             11 components  (Advanced components)
feedback/       6 components  (Alert, Snackbar, Progress, etc.)
──────────────────────────────
TOTAL:        145 components
```

**Icons**: 421 SVG icons bundled

---

## Part 2: FakeMUI Structure Analysis

### Current Directory Layout

```
fakemui/
├── fakemui/                      # React TypeScript components (PRIMARY)
│   ├── atoms/                    # Basic building blocks
│   ├── inputs/                   # Form controls & inputs
│   ├── surfaces/                 # Containers (Card, Panel, Modal)
│   ├── layout/                   # Grid, Flex, Box, Stack
│   ├── data-display/             # Tables, Lists, Trees
│   ├── feedback/                 # Alerts, Progress, Snackbars
│   ├── navigation/               # Tabs, Drawers, Breadcrumbs
│   ├── utils/                    # Portals, Popovers, Tooltips
│   ├── lab/                      # Experimental
│   ├── x/                        # Advanced features
│   ├── theming/                  # Material Design 3 theme
│   ├── workflows/                # Workflow-specific components
│   └── *.py                      # UNUSED: Python implementations (DEPRECATED)
├── icons/                        # 421 SVG icons (separate folders)
├── qml-components/               # 104+ QML components (desktop only)
├── components/                   # Legacy QML/components
├── contexts/                     # React Context (theming, etc.)
├── core/                         # Core utilities
├── scss/                         # Legacy SCSS files
├── styles/                       # SCSS modules (SCSS_REVIEW.md indicates this is old)
├── theming/                      # Theme definitions
├── widgets/                      # Legacy widget definitions
├── src/                          # Migration-in-progress
└── index.ts                      # Main barrel export (307 lines)
```

### Issues Identified

| Issue | Severity | Details | Solution |
|-------|----------|---------|----------|
| **Dual implementations** | Medium | Python + React parallel code | Delete unused Python files |
| **QML legacy** | Low | 104 QML components not used by web | Move to separate folder or deprecate |
| **Multiple style dirs** | Medium | `styles/`, `scss/`, `theming/` scattered | Consolidate to `theming/` |
| **No tree-shaking** | Medium | Monolithic barrel export | Split exports by category |
| **Legacy folders** | Low | `components/`, `widgets/`, `contexts/` | Archive or consolidate |
| **Unused migration dirs** | Low | `src/` appears incomplete | Audit and remove if unused |

---

## Part 3: Redux Package Fragmentation

### Current Structure (9 separate packages)

```
redux/
├── core-hooks/              @metabuilder/core-hooks
├── api-clients/             @metabuilder/api-clients
├── hooks/                   @metabuilder/hooks-core
├── hooks-auth/              @metabuilder/hooks-auth
├── hooks-canvas/            @metabuilder/hooks-canvas
├── hooks-data/              @metabuilder/hooks-data
├── slices/                  @metabuilder/redux-slices
├── adapters/                @metabuilder/service-adapters
└── timing-utils/            @metabuilder/timing-utils
```

### Problem

Projects import from multiple packages:
```typescript
import { useCanvasItems } from '@metabuilder/hooks-canvas'
import { useProject } from '@metabuilder/hooks-data'
import { useDBAL } from '@metabuilder/api-clients'
import { useLoginLogic } from '@metabuilder/hooks-auth'
```

**Better approach**: Single unified export:
```typescript
import { useCanvasItems, useProject, useDBAL, useLoginLogic } from '@metabuilder/redux'
```

---

## Part 4: Priority Actions

### 🔴 PRIORITY 1: Fix postgres MUI Conflict

**Current Issue**: postgres dashboard imports from `@mui/material` directly

**Why it's a problem**:
- Violates FakeMUI standardization
- Creates two competing component libraries in the system
- Pulls in extra MUI dependencies
- Makes it harder to maintain consistent theming

**Action Items**:
1. Replace `@mui/material` with FakeMUI imports
2. Replace `@mui/icons-material` with FakeMUI icons
3. Remove MUI dependencies from postgres/package.json
4. Test and verify functionality

**Estimated Effort**: 2-4 hours
**Risk**: Low (postgres is isolated)

---

### 🟠 PRIORITY 2: Consolidate Redux Packages

**Current Issue**: 9 separate Redux packages should be 1

**Action Items**:
1. Create unified entry point: `redux/package.json`
2. Consolidate all exports to `@metabuilder/redux`
3. Keep internal folder structure for organization
4. Update all imports across codebase
5. Maintain backward compatibility with paths

**Estimated Effort**: 4-6 hours
**Risk**: Medium (requires testing all imports)

---

### 🟡 PRIORITY 3: Reorganize FakeMUI Structure

**Current Issue**: Multiple unused folders, Python files, scattered styles

**Action Plan**:
```
NEW STRUCTURE:
fakemui/
├── src/                          # PRIMARY source
│   ├── components/               # React components (organized by category)
│   │   ├── inputs/
│   │   ├── surfaces/
│   │   ├── layout/
│   │   ├── data-display/
│   │   ├── feedback/
│   │   ├── navigation/
│   │   ├── utils/
│   │   ├── atoms/
│   │   ├── lab/
│   │   └── x/
│   ├── icons/                    # 421 SVG icons
│   ├── theming/                  # Material Design 3 theme (consolidated)
│   ├── hooks/                    # Custom hooks
│   └── types/                    # TypeScript definitions
├── docs/                         # Documentation
│   ├── COMPONENT_GUIDE.md
│   ├── THEMING.md
│   └── MIGRATION.md
├── index.ts                      # Main export
├── package.json
└── README.md

DELETED (Deprecated):
- fakemui/fakemui/*.py            # Python implementations (unused)
- fakemui/qml-components/         # Move to separate qml-ui package
- fakemui/components/             # Legacy QML (consolidate)
- fakemui/widgets/                # Legacy QML (consolidate)
- fakemui/contexts/               # Merge into theming/
- fakemui/scss/                   # Consolidate into theming/
- fakemui/src/                    # Incomplete migration (archive)
```

**Estimated Effort**: 6-8 hours
**Risk**: Medium (requires careful moving of files)

---

### 🟢 PRIORITY 4: Tree-Shaking Optimization

**Current Issue**: All exports in single barrel export (no tree-shaking possible)

**Solution**: Enable directory-level imports
```typescript
// Current:
import { Button } from '@metabuilder/fakemui'        // pulls entire library

// Future:
import { Button } from '@metabuilder/fakemui/inputs' // tree-shakeable
import Button from '@metabuilder/fakemui/inputs/Button' // direct import
```

**Impact**: ~15-20% bundle size reduction
**Estimated Effort**: 4-6 hours
**Risk**: Low (backward compatible)

---

## Part 5: Implementation Roadmap

### Week 1: Stabilization
- [ ] **Day 1**: Migrate postgres from MUI to FakeMUI (P1)
- [ ] **Day 2**: Consolidate Redux packages into single @metabuilder/redux (P2)
- [ ] **Day 3**: Reorganize FakeMUI folder structure (P3)
- [ ] **Day 4**: Test all frontends with new structure
- [ ] **Day 5**: Update documentation and fix broken imports

### Week 2: Optimization
- [ ] Enable tree-shaking for FakeMUI exports (P4)
- [ ] Add bundle size monitoring
- [ ] Generate import graphs for each project

### Week 3: Optional Enhancements
- [ ] Create FakeMUI adoption guide for new projects
- [ ] Auto-generate component catalog
- [ ] Add Storybook integration for FakeMUI

---

## Part 6: Subproject Checklist

### Must Use FakeMUI (No Exceptions)
- [ ] postgres - MIGRATE from @mui/material

### Should Consider FakeMUI
- [ ] frontends/nextjs - Create adapter layer (or keep Radix)
- [ ] codegen - Framework layer established, no change needed
- [ ] pastebin - Optional migration

### Specialized (No Change Needed)
- [ ] exploded-diagrams - Three.js focused
- [ ] gameengine - C++ native code
- [ ] dockerterminal - Minimal web UI

---

## Part 7: FakeMUI & Redux Usage Guide

### For New Frontends

Use this stack:
```json
{
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "@metabuilder/fakemui": "file:../../fakemui",
    "@metabuilder/redux": "file:../../redux",
    "socket.io-client": "^4.8.2"
  }
}
```

### For Existing Radix/Tailwind Projects

Keep Radix but consider:
- Using FakeMUI icons instead of custom icons
- Using FakeMUI theming for consistency
- Creating component adapters where both exist

### Redux Hook Pattern

```typescript
// Use the unified import
import {
  useProject,
  useWorkflow,
  useDBAL,
  useLoginLogic
} from '@metabuilder/redux'

// Instead of scattered imports from multiple packages
```

---

## Part 8: Testing Checklist

After implementing changes:

- [ ] workflowui builds and runs
- [ ] frontends/nextjs builds successfully
- [ ] codegen builds and functions
- [ ] postgres builds and functions (after MUI → FakeMUI)
- [ ] pastebin builds successfully
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Bundle size maintained or improved

---

## Part 9: Success Criteria

✅ **Achieved when**:
1. All React frontends use either FakeMUI or explicit framework choice (Radix)
2. No direct @mui/material imports in production code
3. Redux packages consolidated to single entry point
4. FakeMUI structure clean and organized
5. Tree-shaking enabled (optional exports)
6. Documentation updated
7. All tests passing
8. Bundle size optimized

---

## References

- **FakeMUI**: `/Users/rmac/Documents/metabuilder/fakemui/`
- **Redux packages**: `/Users/rmac/Documents/metabuilder/redux/`
- **Frontends**: `/Users/rmac/Documents/metabuilder/frontends/`
- **Previous docs**: COMPONENT_GUIDE.md, MIGRATION_SUMMARY.md in fakemui/

---

**Next Step**: Execute Priority 1-3 changes in sequence
