# WorkflowUI Hooks Quick Reference

## Status Overview

### All 42 Hooks at a Glance

| Hook Name | Status | Used In | Priority | Notes |
|-----------|--------|---------|----------|-------|
| **Authentication** | | | | |
| useAuthForm | ✓ Active | login/page | - | Working |
| useLoginLogic | ✓ Active | login/page | - | Working |
| usePasswordValidation | ✓ Active | register/page | - | Working |
| useRegisterLogic | ✓ Active | register/page | - | Working |
| **UI Hooks** | | | | |
| useUI | ✓ Active | 6 files | - | Composition hook |
| useUIModals | ✓ Active | Via useUI | - | Working |
| useUINotifications | ✓ Active | Via useUI | - | Working |
| useUILoading | ✓ Active | Via useUI | - | Working |
| useUITheme | ✓ Active | Via useUI | - | Working |
| useUISidebar | ✓ Active | Via useUI | - | Working |
| **Layout** | | | | |
| useHeaderLogic | ✓ Active | MainLayout | - | Working |
| useResponsiveSidebar | ✓ Active | MainLayout | - | Working |
| useProjectSidebarLogic | ✓ Active | ProjectSidebar | - | Working |
| useDashboardLogic | ✓ Active | dashboard | - | Working |
| **Data Management** | | | | |
| useWorkspace | ✓ Active | 3 files | - | Working |
| useProject | ⚠️ Partial | 4 files | CRITICAL | Commented notifications (8 lines) |
| useWorkflow | ✓ Active | 2 files | - | Working |
| useExecution | ⚠️ Partial | 1 file | CRITICAL | 5 stub methods with TODOs |
| **Canvas Hooks** | | | | |
| useProjectCanvas | ✓ Active | 5 files | - | Composition hook |
| useCanvasZoom | ✓ Active | Via composition | - | Working |
| useCanvasPan | ✓ Active | Via composition | - | Working |
| useCanvasSelection | ✓ Active | Via composition | - | Working |
| useCanvasItems | ✓ Active | Via composition | - | Working |
| useCanvasSettings | ✓ Active | Via composition | - | Working |
| useCanvasItemsOperations | ✓ Active | Via composition | - | Working |
| useCanvasGridUtils | ✓ Active | Via composition | - | Working |
| useCanvasKeyboard | ✗ Unused | Nowhere | HIGH | Implemented but not attached |
| useCanvasVirtualization | ✗ Unused | Nowhere | HIGH | Perf optimization not used |
| **Editor Hooks** | | | | |
| useEditor | ✓ Active | Exported only | - | Composition hook |
| useEditorZoom | ✗ Never Direct | Via composition | MEDIUM | Exported but never directly imported |
| useEditorPan | ✗ Never Direct | Via composition | MEDIUM | Exported but never directly imported |
| useEditorNodes | ✗ Never Direct | Via composition | MEDIUM | Exported but never directly imported |
| useEditorEdges | ✗ Never Direct | Via composition | MEDIUM | Exported but never directly imported |
| useEditorSelection | ✗ Never Direct | Via composition | MEDIUM | Exported but never directly imported |
| useEditorClipboard | ✗ Never Direct | Via composition | MEDIUM | Exported but never directly imported |
| useEditorHistory | ✗ Never Direct | Via composition | MEDIUM | Exported but never directly imported |
| **Real-time & Keyboard** | | | | |
| useRealtimeService | ✗ Unused | Nowhere | CRITICAL | Real-time collab never integrated |
| **Canvas Utils** | | | | |

---

## Issues by Priority

### CRITICAL (Fix Now)
- [ ] `useProject.ts` - Remove or uncomment 8 commented notification lines
- [ ] `useExecution.ts` - Document 5 stub methods with TODOs
- [ ] `useRealtimeService` - Remove from main exports

### HIGH (This Sprint)
- [ ] `useCanvasKeyboard` - Integrate into canvas or remove
- [ ] `useCanvasVirtualization` - Integrate for performance or remove
- [ ] Editor hooks exports - Document composition pattern

### MEDIUM (Polish)
- [ ] Fix 3 `as any` type assertions
- [ ] Optimize hook dependency arrays
- [ ] Add pre-commit hooks to prevent commented code

---

## Quick Lookup by Feature

### Need to Handle User Authentication?
- `useAuthForm` - Form state management
- `useLoginLogic` - Login business logic
- `usePasswordValidation` - Password strength checking
- `useRegisterLogic` - Registration business logic
- `useHeaderLogic` - Logout functionality

### Need to Show UI Feedback?
- `useUI` - All UI features (recommended)
  - OR use individual hooks:
    - `useUIModals` - Modal dialogs
    - `useUINotifications` - Toast notifications
    - `useUILoading` - Loading overlay
    - `useUITheme` - Dark/light theme
    - `useUISidebar` - Sidebar state

### Need to Manage Workspaces?
- `useDashboardLogic` - Dashboard operations
- `useWorkspace` - Workspace state management

### Need to Manage Projects?
- `useProject` - Project state management (watch for notifications)
- `useProjectSidebarLogic` - Sidebar project operations

### Need to Edit Workflows?
- `useWorkflow` - Workflow operations
- `useExecution` - Workflow execution (mostly stubs)

### Need Canvas Operations?
- `useProjectCanvas` - All canvas operations (recommended)
  - OR use individual hooks:
    - `useCanvasZoom` - Zoom control
    - `useCanvasPan` - Pan/scroll control
    - `useCanvasSelection` - Item selection
    - `useCanvasItems` - Item data management
    - `useCanvasSettings` - Grid/snap settings
    - `useCanvasItemsOperations` - Create/update items
    - `useCanvasGridUtils` - Grid utilities
    - `useCanvasKeyboard` - Keyboard shortcuts (UNUSED - don't use yet)
    - `useCanvasVirtualization` - Performance (UNUSED - integrate if needed)

### Need Responsive Layout?
- `useResponsiveSidebar` - Mobile detection & sidebar collapse
- `useHeaderLogic` - User menu in header

### Need Real-time Collaboration?
- `useRealtimeService` - Real-time features (NOT INTEGRATED)

---

## Component Import Patterns

### Pattern 1: Import from Main Index (Recommended)
```typescript
import { useUI, useProject, useProjectCanvas } from '../../hooks';
```

### Pattern 2: Import from Specific Folder
```typescript
import { useUI } from '../../hooks/ui';
import { useCanvasZoom } from '../../hooks/canvas';
```

### Pattern 3: Use Composition Hooks (Recommended for Simplicity)
```typescript
// DON'T do this - it's verbose:
import { useCanvasZoom, useCanvasPan, useCanvasSelection } from '../../hooks/canvas';

// DO this instead - simpler, same functionality:
import { useProjectCanvas } from '../../hooks/canvas';
const { zoom, pan, selectedItemIds } = useProjectCanvas();
```

---

## Known Issues by File

| File | Issue | Lines | Impact | Fix Time |
|------|-------|-------|--------|----------|
| useProject.ts | Commented showNotification | 30, 61, 83, 88, 106, 111, 129, 133 | Users don't get feedback | 2 min |
| useExecution.ts | 5 stub methods | 16-38 | Never implemented | 3 min |
| useCanvasKeyboard.ts | Never attached + incomplete | 42, 51, 87 | Keyboard shortcuts don't work | 30+ min |
| useCanvasVirtualization.ts | Never integrated | All | Performance issue with 100+ cards | 60+ min |
| useRealtimeService | Unused export | All | Real-time features not available | 1 min |
| useWorkspace.ts | as any assertion | 30 | Type safety ignored | 2 min |
| useCanvasItems.ts | as any assertion | 42 | Type safety ignored | 1 min |
| useCanvasItemsOperations.ts | as any assertion | 36 | Type safety ignored | 1 min |

---

## Performance Notes

### Current Optimization Status
- ✓ Redux selectors properly memoized
- ✓ useCallback dependencies correctly specified
- ✓ useMemo used where appropriate
- ✗ Canvas virtualization NOT implemented (potential bottleneck at 100+ items)
- ✗ Some selectors could be more granular

### Recommended Optimizations
1. **Integrate useCanvasVirtualization** - Render only visible items
2. **Memoize Canvas Selection** - Prevent callback recreation
3. **Consider React.memo** on canvas item components
4. **Lazy load heavy operations** - Pagination for project lists

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-23 | Initial analysis: 42 hooks, 3 unused, 5 issues |

---

## Files in This Analysis

| File | Purpose | Lines |
|------|---------|-------|
| HOOKS_SUMMARY.txt | Executive summary | 194 |
| HOOKS_ANALYSIS.md | Detailed findings | 423 |
| HOOKS_CLEANUP_ACTIONS.md | Step-by-step fixes | 306 |
| HOOKS_QUICK_REFERENCE.md | This file | ??? |

**Total Documentation:** ~930 lines

---

## Contact & Questions

For questions about specific hooks or the analysis:
1. Check HOOKS_ANALYSIS.md for detailed information
2. Check HOOKS_CLEANUP_ACTIONS.md for implementation steps
3. Review the specific hook file in src/hooks/

---

Last Updated: 2026-01-23
Next Review: 2026-02-23
