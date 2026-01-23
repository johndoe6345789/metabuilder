# WorkflowUI - Small React Components & Custom Hooks (<150 LOC)

**Status**: ✅ Ready to Use
**Total Custom Hooks**: 10 (8 under 250 LOC)
**Small Components (<150 LOC)**: 6
**Small Hooks (<150 LOC)**: 3

---

## Small React Components (<150 LOC)

### 1. **LoadingOverlay** (29 LOC)
```tsx
// src/components/UI/LoadingOverlay.tsx
// Full-screen loading overlay with spinner
<LoadingOverlay />
```
**Features:**
- Uses `useUI()` hook to get loading state
- Displays spinner + optional message
- ARIA attributes for accessibility
- Conditionally renders (null if not loading)

**Usage:**
```tsx
import { LoadingOverlay } from '@/components'

export function App() {
  return <LoadingOverlay /> // Shows globally when loading
}
```

---

### 2. **RootLayoutClient** (31 LOC)
```tsx
// src/components/Layout/RootLayoutClient.tsx
// Wrapper for client-side layout initialization
```
**Features:**
- Initializes auth state on app startup
- Sets up theme provider
- Renders children with context providers

**Usage:**
```tsx
'use client'
import RootLayoutClient from '@/components/Layout/RootLayoutClient'

export default function RootLayout({ children }) {
  return <RootLayoutClient>{children}</RootLayoutClient>
}
```

---

### 3. **AuthInitializer** (37 LOC)
```tsx
// src/components/Auth/AuthInitializer.tsx
// Initializes authentication on mount
```
**Features:**
- Restores user session from storage
- Handles auth state initialization
- Loading state management
- No UI - pure logic component

**Usage:**
```tsx
import { AuthInitializer } from '@/components'

export function App() {
  return (
    <>
      <AuthInitializer />
      <AppContent />
    </>
  )
}
```

---

### 4. **Breadcrumbs** (43 LOC)
```tsx
// src/components/Navigation/Breadcrumbs.tsx
// Navigation breadcrumbs showing hierarchy
```
**Props:**
```typescript
interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

interface BreadcrumbItem {
  label: string
  href?: string
}
```

**Usage:**
```tsx
import { Breadcrumbs } from '@/components'

export function Page() {
  return (
    <Breadcrumbs
      items={[
        { label: '🏠 Home', href: '/' },
        { label: 'Projects', href: '/projects' },
        { label: 'My Project' } // Last item (no link)
      ]}
    />
  )
}
```

---

### 5. **PresenceIndicators** (59 LOC)
```tsx
// src/components/ProjectCanvas/PresenceIndicators.tsx
// Shows active users on project canvas
```
**Features:**
- Displays avatars of connected users
- Shows who's editing/viewing
- Real-time presence updates
- Hover to see user names

**Usage:**
```tsx
import { PresenceIndicators } from '@/components'

export function ProjectCanvas() {
  const { connectedUsers } = useRealtimeService()

  return (
    <>
      <PresenceIndicators users={connectedUsers} />
      <Canvas />
    </>
  )
}
```

---

### 6. **CollaborativeCursors** (72 LOC)
```tsx
// src/components/ProjectCanvas/CollaborativeCursors.tsx
// Shows other users' cursor positions
```
**Features:**
- Renders collaborative cursors for all users
- Color-coded by user
- Shows user name on hover
- Real-time position updates

**Usage:**
```tsx
import { CollaborativeCursors } from '@/components'

export function ProjectCanvas() {
  const { connectedUsers } = useRealtimeService()

  return (
    <>
      <CollaborativeCursors users={connectedUsers} />
      <Canvas />
    </>
  )
}
```

---

## Small Custom Hooks (<150 LOC)

### 1. **useExecution** (54 LOC)
```tsx
// src/hooks/useExecution.ts
// Hook for workflow execution management
const {
  currentExecution,
  executionHistory,
  execute,
  stop,
  getDetails,
  getStats,
  getHistory
} = useExecution()
```

**Features:**
- Access current execution state
- Execute workflows
- Stop running executions
- Get execution history and statistics

**Usage:**
```tsx
import { useExecution } from '@/hooks'

export function WorkflowExecutor() {
  const { currentExecution, execute } = useExecution()

  return (
    <button onClick={() => execute('workflow-123')}>
      {currentExecution ? 'Running...' : 'Start Workflow'}
    </button>
  )
}
```

---

### 2. **useCanvasVirtualization** (74 LOC)
```tsx
// src/hooks/useCanvasVirtualization.ts
// Virtual rendering for large canvases
const {
  visibleItems,
  scrollPosition,
  isDragging,
  handleScroll,
  handleDragStart,
  handleDragEnd
} = useCanvasVirtualization(items, viewportSize)
```

**Features:**
- Only renders visible items (performance)
- Handles scroll events
- Tracks drag state
- Updates viewport dynamically

**Usage:**
```tsx
import { useCanvasVirtualization } from '@/hooks'

export function LargeCanvas({ items }) {
  const { visibleItems, handleScroll } = useCanvasVirtualization(
    items,
    { width: 800, height: 600 }
  )

  return (
    <div onScroll={handleScroll}>
      {visibleItems.map(item => <Item key={item.id} {...item} />)}
    </div>
  )
}
```

---

### 3. **useCanvasKeyboard** (98 LOC)
```tsx
// src/hooks/useCanvasKeyboard.ts
// Keyboard shortcuts for canvas
const {
  handleKeyDown,
  handleKeyUp,
  isKeyPressed,
  registerShortcut,
  unregisterShortcut
} = useCanvasKeyboard()
```

**Features:**
- Handle keyboard shortcuts
- Register custom shortcuts
- Track key press state
- Prevent default behavior

**Predefined Shortcuts:**
- `Space + Drag`: Pan canvas
- `Ctrl/Cmd + Scroll`: Zoom
- `Ctrl/Cmd + 0`: Reset zoom
- `Delete`: Delete selected items
- `Ctrl/Cmd + A`: Select all

**Usage:**
```tsx
import { useCanvasKeyboard } from '@/hooks'

export function Canvas() {
  const { handleKeyDown, isKeyPressed } = useCanvasKeyboard()

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <canvas onMouseMove={() => {
      if (isKeyPressed('Space')) {
        // Pan mode
      }
    }} />
  )
}
```

---

## Medium Custom Hooks (150-250 LOC)

### 4. **useUI** (246 LOC) ⭐ Most Used
```tsx
// src/hooks/useUI.ts
// Global UI state management
const {
  // Modals
  openModal,
  closeModal,
  toggleModal,
  isModalOpen,

  // Notifications
  success,
  error,
  warning,
  info,

  // Loading
  setLoading,
  loading,
  loadingMessage,

  // Theme
  theme,
  setTheme
} = useUI()
```

**Usage:**
```tsx
import { useUI } from '@/hooks'

export function MyComponent() {
  const { success, error, openModal } = useUI()

  const handleSave = async () => {
    try {
      await saveData()
      success('Data saved!')
    } catch (err) {
      error('Failed to save')
    }
  }

  return (
    <>
      <button onClick={() => openModal('settings')}>
        Settings
      </button>
      <button onClick={handleSave}>
        Save
      </button>
    </>
  )
}
```

---

### 5. **useEditor** (251 LOC)
```tsx
// src/hooks/useEditor.ts
// Workflow editor state management
const {
  // State
  nodes,
  edges,
  selectedNode,
  clipboard,
  history,

  // Actions
  addNode,
  removeNode,
  updateNode,
  addEdge,
  removeEdge,
  copy,
  paste,
  undo,
  redo
} = useEditor()
```

**Usage:**
```tsx
import { useEditor } from '@/hooks'

export function WorkflowEditor() {
  const { nodes, edges, addNode, updateNode } = useEditor()

  return (
    <Flow nodes={nodes} edges={edges}>
      <button onClick={() => addNode({ type: 'trigger' })}>
        Add Trigger
      </button>
    </Flow>
  )
}
```

---

### 6. **useWorkflow** (213 LOC)
```tsx
// src/hooks/useWorkflow.ts
// Workflow CRUD operations
const {
  currentWorkflow,
  workflows,
  loading,
  error,

  // Actions
  loadWorkflow,
  loadAll,
  create,
  update,
  delete,
  duplicate,
  export,
  import
} = useWorkflow()
```

---

### 7. **useProject** (172 LOC)
```tsx
// src/hooks/useProject.ts
// Project management
const {
  currentProject,
  projects,

  // Actions
  loadProject,
  createProject,
  updateProject,
  deleteProject
} = useProject()
```

---

### 8. **useWorkspace** (183 LOC)
```tsx
// src/hooks/useWorkspace.ts
// Workspace management
const {
  currentWorkspace,
  workspaces,

  // Actions
  createWorkspace,
  switchWorkspace,
  deleteWorkspace
} = useWorkspace()
```

---

### 9. **useProjectCanvas** (322 LOC)
```tsx
// src/hooks/useProjectCanvas.ts
// Project canvas state (zoom, pan, items)
const {
  // State
  zoom,
  pan,
  canvasItems,
  selectedItems,

  // Actions
  updateCanvasItem,
  updateZoom,
  updatePan,
  selectItems
} = useProjectCanvas()
```

---

### 10. **useRealtimeService** (169 LOC)
```tsx
// src/hooks/useRealtimeService.ts
// Real-time collaboration (WebSocket)
const {
  // State
  connectedUsers,
  isConnected,

  // Actions
  broadcastCanvasUpdate,
  broadcastCursorPosition,
  joinProject,
  leaveProject
} = useRealtimeService()
```

---

## Usage Patterns

### Pattern 1: Compose Hooks
```tsx
export function WorkflowEditor() {
  const { currentWorkflow, update } = useWorkflow()
  const { nodes, edges, addNode } = useEditor()
  const { success, error } = useUI()

  // All three hooks working together
  return (...)
}
```

### Pattern 2: Component Using Hooks
```tsx
export const SaveButton: React.FC<SaveButtonProps> = ({ workflow }) => {
  const { update } = useWorkflow()
  const { success, error, setLoading } = useUI()

  const handleSave = async () => {
    setLoading(true)
    try {
      await update(workflow)
      success('Workflow saved!')
    } catch (err) {
      error('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return <button onClick={handleSave}>Save</button>
}
```

### Pattern 3: Reusable Small Component
```tsx
import { Breadcrumbs } from '@/components'

export function ProjectPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Workspaces', href: '/' },
          { label: 'My Project' }
        ]}
      />
      <ProjectContent />
    </>
  )
}
```

---

## Summary Table

| Component/Hook | LOC | Purpose | Status |
|---|---|---|---|
| **LoadingOverlay** | 29 | Full-screen loading UI | ✅ Ready |
| **RootLayoutClient** | 31 | App initialization | ✅ Ready |
| **AuthInitializer** | 37 | Auth state setup | ✅ Ready |
| **Breadcrumbs** | 43 | Navigation | ✅ Ready |
| **PresenceIndicators** | 59 | Show active users | ✅ Ready |
| **CollaborativeCursors** | 72 | Show user cursors | ✅ Ready |
| **useExecution** | 54 | Run workflows | ✅ Ready |
| **useCanvasVirtualization** | 74 | Render large lists | ✅ Ready |
| **useCanvasKeyboard** | 98 | Keyboard shortcuts | ✅ Ready |
| **useUI** | 246 | Global UI state | ✅ Ready |
| **useEditor** | 251 | Workflow editor | ✅ Ready |
| **useWorkflow** | 213 | Workflow CRUD | ✅ Ready |
| **useProject** | 172 | Project management | ✅ Ready |
| **useWorkspace** | 183 | Workspace management | ✅ Ready |
| **useProjectCanvas** | 322 | Canvas state | ✅ Ready |
| **useRealtimeService** | 169 | Real-time sync | ✅ Ready |

---

## Integration with Fakemui

All these components work seamlessly with Fakemui:

```tsx
import { Button, Stack, Card, Box } from '@/fakemui'
import { Breadcrumbs, LoadingOverlay } from '@/components'
import { useUI, useWorkflow } from '@/hooks'

export function WorkflowPage() {
  const { success, error } = useUI()
  const { currentWorkflow, update } = useWorkflow()

  return (
    <Box>
      <Breadcrumbs items={[...]} />
      <LoadingOverlay />

      <Card>
        <Stack spacing={2}>
          <Button onClick={() => update(workflow)}>
            Save Workflow
          </Button>
        </Stack>
      </Card>
    </Box>
  )
}
```

---

## Next Steps

All components and hooks are **production-ready** and can be:
1. ✅ Used immediately in new features
2. ✅ Exported as NPM package
3. ✅ Shared across MetaBuilder projects
4. ✅ Extended with new functionality
5. ✅ Tested with Jest/React Testing Library

**Start building!** 🚀
