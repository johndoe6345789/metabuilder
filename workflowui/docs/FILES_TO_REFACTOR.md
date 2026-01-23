# WorkflowUI - Files Over 300 LOC (Refactoring Targets)

## Overview

Found 6 files that are larger than ideal and could be refactored into smaller modules.

---

## 1. **db/schema.ts** (538 LOC) ✅ ACCEPTABLE
**Status**: Keep as-is

**Why**: This is a database schema file, best kept together
- Type definitions (Workspace, Project, ProjectCanvasItem, etc.)
- Dexie database initialization
- CRUD helper methods organized by entity

**Structure**:
```
- Workspace type + CRUD methods (50 LOC)
- Project type + CRUD methods (50 LOC)
- ProjectCanvasItem type + CRUD methods (80 LOC)
- SyncQueueItem type + CRUD methods (60 LOC)
- Database instance (20 LOC)
- Export/helpers (50 LOC)
```

**Keep together** because it's a cohesive schema unit.

---

## 2. **app/project/[id]/page.tsx** (487 LOC) ⚠️ TOO LARGE
**Status**: Just refactored, now 220 LOC with Fakemui

This was recently refactored to use Fakemui and is now much smaller. ✅

---

## 3. **components/Settings/sections/CanvasSettings.tsx** (343 LOC) ⚠️ NEEDS SPLIT

**Problem**: Too many settings in one component

**Suggested Refactoring**:
```
CanvasSettings.tsx (100 LOC)
├── /GridSettings.tsx (60 LOC)
├── /ZoomSettings.tsx (60 LOC)
├── /SnapSettings.tsx (50 LOC)
└── /LayoutSettings.tsx (50 LOC)
```

**Current structure**: 343 lines of form controls

**Refactored structure**:
- Main component just composes 4 smaller components
- Each handles its own setting group
- Easy to test and reuse

---

## 4. **store/slices/projectSlice.ts** (335 LOC) ⚠️ NEEDS SPLIT

**Problem**: Too many Redux reducers in one file

**Suggested Refactoring**:
```
projectSlice.ts
├── /projectSlice.ts (80 LOC) - Project CRUD only
├── /canvasSlice.ts (120 LOC) - Canvas zoom/pan/items
└── /collaborationSlice.ts (100 LOC) - Real-time collab
```

**Why split**:
- Project operations (create, update, delete)
- Canvas state (zoom, pan, selected items)
- Collaboration (connected users, locks)

These are three different concerns bundled together.

---

## 5. **hooks/useProjectCanvas.ts** (322 LOC) ⚠️ NEEDS SPLIT

**Problem**: Too many canvas-related functions in one hook

**Suggested Refactoring**:
```
useProjectCanvas.ts
├── useCanvasZoom.ts (60 LOC)
├── useCanvasPan.ts (60 LOC)
├── useCanvasSelection.ts (80 LOC)
└── useCanvasItems.ts (100 LOC)
```

Then compose in useProjectCanvas:
```typescript
export function useProjectCanvas() {
  const zoom = useCanvasZoom()
  const pan = useCanvasPan()
  const selection = useCanvasSelection()
  const items = useCanvasItems()

  return { zoom, pan, selection, items }
}
```

**Benefits**:
- Each hook does one thing
- Easier to test each piece
- Reusable in other contexts

---

## 6. **components/ProjectCanvas/WorkflowCard.tsx** (320 LOC) ⚠️ NEEDS SPLIT

**Problem**: Card component + preview + actions all bundled

**Suggested Refactoring**:
```
WorkflowCard.tsx (120 LOC) - Main card wrapper
├── /WorkflowCardHeader.tsx (50 LOC) - Title + status badge
├── /WorkflowCardPreview.tsx (70 LOC) - Mini node preview
├── /WorkflowCardFooter.tsx (40 LOC) - Metadata + date
└── /WorkflowCardActions.tsx (40 LOC) - Action buttons
```

**Current nesting**:
```tsx
<Card>
  <Header>
    <Title />
    <StatusBadge />
  </Header>
  <Preview>
    <MiniNodeGrid />
  </Preview>
  <Footer>
    <NodeCount />
    <LastModified />
  </Footer>
  <Actions>
    <EditButton />
    <FavoriteButton />
  </Actions>
</Card>
```

**Refactored**:
```tsx
<WorkflowCard
  workflow={workflow}
  onEdit={handleEdit}
  onFavorite={handleFavorite}
/>
```

---

## Refactoring Plan

### Phase 1 (Immediate)
- ✅ db/schema.ts - Keep as-is (works well)
- ✅ project/[id]/page.tsx - Already done (220 LOC)

### Phase 2 (This Week)
- **components/Settings/sections/CanvasSettings.tsx** → Split into 4 components
- **components/ProjectCanvas/WorkflowCard.tsx** → Split into 5 components

### Phase 3 (Next Week)
- **store/slices/projectSlice.ts** → Split into 3 slices
- **hooks/useProjectCanvas.ts** → Split into 4 hooks

---

## Guidelines for Refactoring

### ✅ Keep Together
- Database schema files (type definitions + CRUD)
- Tightly coupled state (Redux slices with related actions)
- Small hooks under 150 LOC

### ❌ Split When
- Component has multiple JSX sections (use sub-components)
- Hook has 3+ independent concerns (split into smaller hooks)
- Redux slice mixes unrelated state (split into separate slices)
- Settings/form has 20+ controls (group into sections)

### 📏 Target Sizes
- **Components**: 80-150 LOC max
- **Hooks**: 80-150 LOC max
- **Redux slices**: 100-150 LOC max
- **Exceptions**: Schema files, API clients (can be 300-500 LOC)

---

## Refactoring Commands

### Split CanvasSettings into 4 components
```bash
# Create component directory
mkdir -p src/components/Settings/CanvasSettings

# Create sub-components
touch src/components/Settings/CanvasSettings/GridSettings.tsx
touch src/components/Settings/CanvasSettings/ZoomSettings.tsx
touch src/components/Settings/CanvasSettings/SnapSettings.tsx
touch src/components/Settings/CanvasSettings/LayoutSettings.tsx
touch src/components/Settings/CanvasSettings/index.ts
```

### Split WorkflowCard into 5 components
```bash
# Create component directory
mkdir -p src/components/ProjectCanvas/WorkflowCard

# Create sub-components
touch src/components/ProjectCanvas/WorkflowCard/WorkflowCardHeader.tsx
touch src/components/ProjectCanvas/WorkflowCard/WorkflowCardPreview.tsx
touch src/components/ProjectCanvas/WorkflowCard/WorkflowCardFooter.tsx
touch src/components/ProjectCanvas/WorkflowCard/WorkflowCardActions.tsx
touch src/components/ProjectCanvas/WorkflowCard/index.ts
```

### Split useProjectCanvas into 4 hooks
```bash
# Create hooks directory structure
mkdir -p src/hooks/canvas

# Create sub-hooks
touch src/hooks/canvas/useCanvasZoom.ts
touch src/hooks/canvas/useCanvasPan.ts
touch src/hooks/canvas/useCanvasSelection.ts
touch src/hooks/canvas/useCanvasItems.ts
touch src/hooks/canvas/index.ts
```

---

## Benefits of Refactoring

✅ **Testability**: Each component/hook is independently testable
✅ **Reusability**: Sub-components can be used elsewhere
✅ **Maintainability**: Smaller files are easier to understand
✅ **Performance**: Sub-components can be memoized separately
✅ **Composability**: Easy to compose smaller pieces into larger features

---

## Estimated Effort

| File | Current | Effort | Timeline |
|------|---------|--------|----------|
| CanvasSettings.tsx | 343 → 100 + 4×50 | 2 hours | Today |
| WorkflowCard.tsx | 320 → 120 + 4×50 | 2 hours | Today |
| projectSlice.ts | 335 → 3×100 | 3 hours | Tomorrow |
| useProjectCanvas.ts | 322 → 4×80 | 2 hours | Tomorrow |

**Total**: ~9 hours to refactor all large files to <150 LOC each

---

## Summary

**Current State**:
- 6 files over 300 LOC
- 2 files already optimized (✅ db/schema.ts, ✅ project page)
- 4 files need refactoring (2-3 days of work)

**Target State**:
- All components <150 LOC
- All hooks <150 LOC
- All Redux slices <150 LOC
- Clean, composable, testable codebase

---

Want me to start refactoring any of these? Start with CanvasSettings? 🚀
