# WorkflowUI - Quick Reference

## Import Everything

```tsx
// Fakemui Components (122+)
import {
  Button, Stack, Card, Box, TextField, Alert,
  Modal, Dialog, Table, Chip, Avatar,
  AppBar, Toolbar, Grid, Tooltip, Badge
} from '@/fakemui'

// Custom Components (<150 LOC)
import {
  LoadingOverlay,
  AuthInitializer,
  Breadcrumbs,
  PresenceIndicators,
  CollaborativeCursors
} from '@/components'

// Custom Hooks
import {
  useUI,
  useWorkflow,
  useProject,
  useWorkspace,
  useEditor,
  useExecution,
  useProjectCanvas,
  useRealtimeService,
  useCanvasKeyboard,
  useCanvasVirtualization
} from '@/hooks'
```

---

## Most Used Combinations

### Build a Page with Breadcrumbs + Loading + UI State
```tsx
import { Box, Stack } from '@/fakemui'
import { Breadcrumbs, LoadingOverlay } from '@/components'
import { useUI } from '@/hooks'

export function MyPage() {
  const { setLoading, success, error } = useUI()

  return (
    <Box>
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'My Page' }
      ]} />
      <LoadingOverlay />

      <Stack spacing={2}>
        {/* Your content */}
      </Stack>
    </Box>
  )
}
```

### Show Notifications
```tsx
import { useUI } from '@/hooks'

export function SaveButton() {
  const { success, error, setLoading } = useUI()

  const handleSave = async () => {
    setLoading(true)
    try {
      await saveSomething()
      success('Saved!')
    } catch (err) {
      error('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return <button onClick={handleSave}>Save</button>
}
```

### Manage Workflows
```tsx
import { useWorkflow } from '@/hooks'
import { Button, Stack } from '@/fakemui'

export function WorkflowActions() {
  const { currentWorkflow, update, create, delete: deleteWF } = useWorkflow()

  return (
    <Stack direction="row" spacing={1}>
      <Button onClick={() => create({ name: 'New' })}>Create</Button>
      <Button onClick={() => update(currentWorkflow)}>Save</Button>
      <Button onClick={() => deleteWF(currentWorkflow.id)}>Delete</Button>
    </Stack>
  )
}
```

### Edit Workflows with Keyboard Shortcuts
```tsx
import { useEditor } from '@/hooks'
import { useCanvasKeyboard } from '@/hooks'

export function WorkflowEditor() {
  const { nodes, edges, undo, redo, copy, paste } = useEditor()
  const { handleKeyDown } = useCanvasKeyboard()

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return <div>Editor UI</div>
}
```

### Show Real-time Collaboration
```tsx
import { useRealtimeService } from '@/hooks'
import { PresenceIndicators, CollaborativeCursors } from '@/components'

export function ProjectCanvas() {
  const { connectedUsers } = useRealtimeService()

  return (
    <div>
      <PresenceIndicators users={connectedUsers} />
      <CollaborativeCursors users={connectedUsers} />
      {/* Canvas content */}
    </div>
  )
}
```

---

## Component Sizes (LOC)

**Tiny (<50 LOC)** - Basic UI:
- LoadingOverlay (29)
- RootLayoutClient (31)
- AuthInitializer (37)
- Breadcrumbs (43)

**Small (50-100 LOC)** - Specific features:
- PresenceIndicators (59)
- CollaborativeCursors (72)
- useCanvasVirtualization (74)
- useCanvasKeyboard (98)

**Medium (150-250 LOC)** - Complex state:
- useExecution (54 - hook)
- useProject (172 - hook)
- useWorkspace (183 - hook)
- useRealtimeService (169 - hook)
- useUI (246 - hook)
- useEditor (251 - hook)

**Large (250+ LOC)**:
- useWorkflow (213 - hook)
- useProjectCanvas (322 - hook)

---

## Type Definitions

### Workflow
```typescript
interface Workflow {
  id: string
  name: string
  description?: string
  version: string
  tenantId: string
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  tags: string[]
  createdAt: number
  updatedAt: number
  projectId?: string
  workspaceId?: string
  starred?: boolean
}
```

### Project
```typescript
interface Project {
  id: string
  name: string
  description?: string
  workspaceId: string
  tenantId: string
  color?: string
  starred?: boolean
  createdAt: number
  updatedAt: number
}
```

### Workspace
```typescript
interface Workspace {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  tenantId: string
  createdAt: number
  updatedAt: number
}
```

---

## Redux Store Structure

```typescript
// From Redux store
interface RootState {
  workflow: {
    workflows: Workflow[]
    current: Workflow | null
    currentExecution: ExecutionResult | null
    executionHistory: ExecutionResult[]
  }
  project: {
    projects: Project[]
    currentProject: Project | null
    canvasItems: ProjectCanvasItem[]
    canvasState: ProjectCanvasState
  }
  workspace: {
    workspaces: Workspace[]
    currentWorkspaceId: string | null
  }
  ui: {
    theme: 'light' | 'dark'
    modals: Record<string, boolean>
    notifications: Notification[]
    loading: boolean
    loadingMessage?: string
  }
}
```

---

## Common Patterns

### Create Page Layout
```tsx
import { Box, AppBar, Toolbar, Button } from '@/fakemui'
import { Breadcrumbs } from '@/components'

export default function Page() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar>
        <Toolbar>
          <Breadcrumbs items={[...]} />
          <Box sx={{ flex: 1 }} />
          <Button>Action</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, p: 2 }}>
        {/* Main content */}
      </Box>
    </Box>
  )
}
```

### Create Form
```tsx
import { Stack, TextField, Button } from '@/fakemui'

export function MyForm() {
  const [formData, setFormData] = useState({ name: '', email: '' })
  const { success, error } = useUI()

  const handleSubmit = async () => {
    try {
      await submitForm(formData)
      success('Form submitted!')
    } catch (err) {
      error('Submission failed')
    }
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 400 }}>
      <TextField
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <TextField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <Button variant="contained" onClick={handleSubmit}>
        Submit
      </Button>
    </Stack>
  )
}
```

### Create Modal
```tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@/fakemui'
import { useUI } from '@/hooks'

export function MyModal() {
  const { isModalOpen, closeModal } = useUI()

  return (
    <Dialog open={isModalOpen('my-modal')}>
      <DialogTitle>My Dialog</DialogTitle>
      <DialogContent>
        {/* Modal content */}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => closeModal('my-modal')}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
```

---

## Running the App

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Docker
docker build -t workflowui:latest .
docker run -p 3010:3000 workflowui:latest
```

---

## File Locations

```
workflowui/
├── src/
│   ├── components/          # React components
│   │   ├── UI/              # Small UI components
│   │   ├── Layout/          # Layout components
│   │   ├── Navigation/      # Breadcrumbs, etc
│   │   ├── ProjectCanvas/   # Canvas components
│   │   └── Settings/        # Settings modals
│   ├── hooks/               # Custom hooks (10 total)
│   ├── services/            # API clients
│   ├── store/               # Redux store + slices
│   ├── types/               # TypeScript definitions
│   ├── db/                  # IndexedDB schema
│   └── app/                 # Next.js App Router
├── backend/                 # Flask API
└── Dockerfile               # Docker config
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Space + Drag | Pan canvas |
| Ctrl/Cmd + Scroll | Zoom canvas |
| Ctrl/Cmd + 0 | Reset zoom |
| Ctrl/Cmd + A | Select all |
| Delete | Delete selected |
| Ctrl/Cmd + C | Copy |
| Ctrl/Cmd + V | Paste |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |

---

## Environment Variables

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000

# Backend
DATABASE_URL=sqlite:///workflowui.db
JWT_SECRET=your-secret-key
```

---

## Debugging

```tsx
// Enable Redux DevTools
import { devTools } from 'zustand/middleware'

// Check UI state
const { openModal, isModalOpen } = useUI()
console.log('Modal open?', isModalOpen('my-modal'))

// Check workflow state
const { currentWorkflow } = useWorkflow()
console.log('Current workflow:', currentWorkflow)

// Check real-time state
const { connectedUsers, isConnected } = useRealtimeService()
console.log('Connected users:', connectedUsers)
console.log('Socket connected?', isConnected)
```

---

## Tips & Tricks

1. **Use `useUI()` everywhere** - For global notifications and modals
2. **Compose hooks** - Mix and match hooks to build features
3. **Use Fakemui** - Never write custom CSS, use `sx` prop
4. **Small components** - Keep components under 150 LOC
5. **Export from index** - Keep everything importable from `@/components` and `@/hooks`

---

## That's it! 🚀

You now have:
- ✅ 6 small reusable React components (<150 LOC)
- ✅ 10 custom hooks for state management
- ✅ 122+ Fakemui components for UI
- ✅ Material Design 3 theming
- ✅ Full TypeScript support
- ✅ Real-time collaboration ready

Start building! 🎉
