# WorkflowUI Hooks Cleanup Action Plan

**Priority Order for Implementation**

---

## CRITICAL FIXES (Do First)

### 1. Fix useProject.ts Commented Notifications

**File:** `/Users/rmac/Documents/metabuilder/workflowui/src/hooks/useProject.ts`

**Problem:** 8 commented-out `showNotification` calls prevent users from getting feedback on project operations.

**Action:** Choose ONE:

**Option A: Re-enable Notifications (RECOMMENDED)**
```typescript
// Line 30: Uncomment this line
const { showNotification } = useUI() as any;  // Better: use proper type

// Lines 61, 83, 88, 106, 111, 129, 133: Uncomment all showNotification calls
// Change from:
        // showNotification(errorMsg, 'error');
// To:
        showNotification(errorMsg, 'error');
```

**Option B: Remove Commented Code (if notifications will never be added)**
```typescript
// Delete:
// Line 30: // const { showNotification } = useUI() as any;
// Lines 61, 83, 88, 106, 111, 129, 133: All commented showNotification lines
```

**Time to Fix:** 2 minutes

---

### 2. Remove useRealtimeService from Exports

**File:** `/Users/rmac/Documents/metabuilder/workflowui/src/hooks/index.ts`

**Problem:** Hook is never used but still exported from main index.

**Action:**
```typescript
// REMOVE this line (line 25):
export { useRealtimeService } from './useRealtimeService';
```

**Keep:** The hook file itself (may be needed in Phase 3)

**Time to Fix:** 1 minute

---

### 3. Document useExecution.ts TODOs

**File:** `/Users/rmac/Documents/metabuilder/workflowui/src/hooks/useExecution.ts`

**Problem:** 5 stub methods that will never be called but are exported.

**Action:** Add clear JSDoc about future implementation:

```typescript
/**
 * useExecution Hook (Stub)
 * Hook for workflow execution and result management
 *
 * @todo PHASE_2_LATER: Implement execution methods
 * - execute(): Execute workflow
 * - stop(): Stop running workflow
 * - getDetails(): Get execution details
 * - getStats(): Get workflow statistics
 * - getHistory(): Get execution history
 *
 * Current Status: Only currentExecution is used
 */
```

**Time to Fix:** 3 minutes

---

## HIGH PRIORITY FIXES (Next Sprint)

### 4. Integrate or Remove useCanvasKeyboard

**File:** `/Users/rmac/Documents/metabuilder/workflowui/src/hooks/useCanvasKeyboard.ts`

**Problem:** Keyboard shortcuts (Ctrl+A, Delete, etc.) are implemented but never attached to any component.

**Choose ONE action:**

**Option A: Integrate into Canvas (RECOMMENDED)**
1. Add to `InfiniteCanvas.tsx` or editor container
2. Uncomment the dispatch calls (lines 42, 51)
3. Complete the arrow key handling (line 87)
4. Test keyboard shortcuts work

**Option B: Remove Completely**
1. Delete the hook file
2. Remove from `index.ts` exports (line 26)

**Time to Fix:** 30-60 minutes if integrating, 2 minutes if removing

---

### 5. Integrate or Remove useCanvasVirtualization

**File:** `/Users/rmac/Documents/metabuilder/workflowui/src/hooks/useCanvasVirtualization.ts`

**Problem:** Performance optimization (viewport-based rendering) not being used.

**Choose ONE action:**

**Option A: Integrate into InfiniteCanvas (RECOMMENDED)**
```typescript
// In InfiniteCanvas.tsx
import { useCanvasVirtualization } from '../../hooks';

function InfiniteCanvas() {
  const canvas = useProjectCanvas();
  const { visibleItems, stats } = useCanvasVirtualization(
    canvas.canvasItems,
    canvas.pan,
    canvas.zoom,
    { containerWidth: 1200, containerHeight: 800 }
  );

  // Render only visibleItems instead of canvas.canvasItems
  return (
    <div>
      {visibleItems.map(item => <WorkflowCard key={item.id} item={item} />)}
      {/* Debug: Show stats in dev mode */}
      {/* {stats.totalItems} items, {stats.visibleItems} visible */}
    </div>
  );
}
```

**Option B: Remove if Not Needed**
1. Delete the hook file
2. Remove from `index.ts` exports (line 27)
3. Note: Performance may suffer with 100+ cards

**Time to Fix:** 1-2 hours if integrating, 2 minutes if removing

---

### 6. Remove Individual Editor Hook Exports

**Files:**
- `/Users/rmac/Documents/metabuilder/workflowui/src/hooks/editor/index.ts`
- `/Users/rmac/Documents/metabuilder/workflowui/src/hooks/index.ts`

**Problem:** 7 editor hooks exported individually but never imported directly - only accessed via `useEditor()` composition.

**Action:**

1. In `editor/index.ts`, keep exports but add comment:
```typescript
/**
 * Editor Hooks Index
 *
 * Note: Individual hooks are exported for tree-shaking purposes, but most code should
 * use the composition hook useEditor() instead for consistency.
 *
 * These exports are NOT directly imported anywhere in the codebase.
 * If you find yourself using individual hooks, consider whether you should
 * be using useEditor() instead.
 */

// Keep exports but comment them
export { useEditorZoom, type UseEditorZoomReturn } from './useEditorZoom';
// ... etc
```

2. In main `index.ts`, update comment (lines 40-48):
```typescript
// Editor hooks - use composition hook useEditor() instead of individual hooks
export {
  useEditorZoom,
  useEditorPan,
  useEditorNodes,
  useEditorEdges,
  useEditorSelection,
  useEditorClipboard,
  useEditorHistory
} from './editor';
```

**Time to Fix:** 5 minutes

---

## MEDIUM PRIORITY (Nice to Have)

### 7. Fix TypeScript as any Assertions

**Files:**
- `/Users/rmac/Documents/metabuilder/workflowui/src/hooks/useWorkspace.ts` (line 30)
- `/Users/rmac/Documents/metabuilder/workflowui/src/hooks/canvas/useCanvasItems.ts` (line 42)
- `/Users/rmac/Documents/metabuilder/workflowui/src/hooks/canvas/useCanvasItemsOperations.ts` (line 36)

**Problem:** Using `as any` defeats TypeScript type checking

**Fix Pattern:**
```typescript
// BEFORE:
const { showNotification } = useUI() as any;

// AFTER:
const { showNotification } = useUI(); // Already properly typed!
// Or if needed to extract specific properties:
const uiHook = useUI();
const { showNotification } = uiHook;
```

**Time to Fix:** 5 minutes total

---

### 8. Optimize useCanvasKeyboard Hook Dependencies

**File:** `/Users/rmac/Documents/metabuilder/workflowui/src/hooks/useCanvasKeyboard.ts` (line 91)

**Problem:** `handleKeyDown` callback recreated on every render

**Fix:**
```typescript
// Line 26: Update selector to use a stable comparison
const selectedItemIds = useSelector(
  (state: RootState) => selectSelectedItemIds(state),
  // Add shallow equality check
  (a, b) => {
    if (a.size !== b.size) return false;
    for (let item of a) {
      if (!b.has(item)) return false;
    }
    return true;
  }
);
```

**Time to Fix:** 10 minutes

---

## Testing & Verification

After each fix, run:

```bash
# Check for unused exports
npm run typecheck

# Look for other commented code
grep -r "^[[:space:]]*\/\/" src/hooks/ | grep -i "show\|notify\|dispatch\|dispatch"

# Verify hooks still work
npm run test:e2e

# Check bundle size impact
npm run build && wc -c .next/static/chunks/*.js
```

---

## Success Criteria

- [ ] All commented code either uncommented or removed
- [ ] All TODO comments documented with timelines
- [ ] No unused hooks in main exports
- [ ] No `as any` assertions in hook files
- [ ] All 23 actively-used hooks working correctly
- [ ] TypeScript passes without ignoring errors
- [ ] Build completes without warnings

---

## Estimated Time Breakdown

| Task | Time | Priority |
|------|------|----------|
| Fix useProject.ts notifications | 2 min | CRITICAL |
| Remove useRealtimeService export | 1 min | CRITICAL |
| Document useExecution TODOs | 3 min | CRITICAL |
| Integrate/remove useCanvasKeyboard | 30-60 min | HIGH |
| Integrate/remove useCanvasVirtualization | 60-120 min | HIGH |
| Remove individual editor hook exports | 5 min | HIGH |
| Fix as any assertions | 5 min | MEDIUM |
| Optimize hook dependencies | 10 min | MEDIUM |
| **TOTAL** | **116-196 min** | **2-3 hours** |

---

## For Project Management

**Recommendation:** Schedule for 1 sprint = 2 days of work

- Day 1: Critical fixes (6 minutes) + integrate useCanvasKeyboard (2 hours)
- Day 2: Integrate useCanvasVirtualization (2 hours) + medium priority items (30 minutes)

Result: Cleaner hooks architecture, better TypeScript, potential performance improvement from virtualization.
