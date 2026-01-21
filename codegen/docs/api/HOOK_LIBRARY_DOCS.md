# Hook Library Documentation

## Overview

The CodeForge hook library provides a comprehensive set of reusable React hooks organized by purpose. All business logic should be extracted into hooks, keeping components under 150 LOC and focused purely on presentation.

## Directory Structure

```
src/hooks/
├── core/               # Core utility hooks
├── ui/                 # UI state management hooks
├── config/             # Configuration and page management hooks
├── features/           # Feature-specific business logic hooks
├── ai/                 # AI-powered functionality hooks
└── validation/         # Validation and error checking hooks
```

## Core Hooks

### `use-kv-state.ts`

Enhanced wrapper around Spark's `useKV` with Zod validation support.

**Usage:**
```typescript
import { useKVState } from '@/hooks/core/use-kv-state'
import { z } from 'zod'

const UserSchema = z.object({
  name: z.string(),
  age: z.number().min(0),
})

const [user, setUser] = useKVState(
  'user-data',
  { name: '', age: 0 },
  UserSchema
)

// Invalid data is rejected automatically
setUser({ name: 'John', age: -5 }) // Logs error, keeps previous value
setUser({ name: 'John', age: 25 })  // Valid, updates state
```

### `use-debounced-save.ts`

Automatically debounces and saves values after a delay.

**Usage:**
```typescript
import { useDebouncedSave } from '@/hooks/core/use-debounced-save'
import { useKV } from '@github/spark/hooks'

const [code, setCode] = useState('')
const [, saveCode] = useKV('code-content', '')

useDebouncedSave(code, saveCode, 1000) // Saves 1s after last change
```

### `use-clipboard.ts`

Copy/paste operations with user feedback.

**Usage:**
```typescript
import { useClipboard } from '@/hooks/core/use-clipboard'

const { copy, paste, copied } = useClipboard()

<Button 
  onClick={() => copy(codeContent, 'Code copied!')}
  disabled={copied}
>
  {copied ? 'Copied!' : 'Copy Code'}
</Button>
```

## UI Hooks

### `use-dialog.ts`

Manage dialog open/closed state.

**Usage:**
```typescript
import { useDialog } from '@/hooks/ui/use-dialog'

const { open, openDialog, closeDialog, toggleDialog } = useDialog()

<Button onClick={openDialog}>Open Settings</Button>
<Dialog open={open} onOpenChange={closeDialog}>
  {/* Dialog content */}
</Dialog>
```

### `use-selection.ts`

Multi-select state management.

**Usage:**
```typescript
import { useSelection } from '@/hooks/ui/use-selection'

const { 
  selected, 
  toggle, 
  selectAll, 
  clear, 
  isSelected,
  count 
} = useSelection<string>()

files.map(file => (
  <Checkbox
    checked={isSelected(file.id)}
    onCheckedChange={() => toggle(file.id)}
  />
))

<Button onClick={() => selectAll(files.map(f => f.id))}>
  Select All ({count} selected)
</Button>
```

### `use-confirmation.ts`

Confirmation dialog state and actions.

**Usage:**
```typescript
import { useConfirmation } from '@/hooks/ui/use-confirmation'
import { AlertDialog } from '@/components/ui/alert-dialog'

const { state, confirm, handleConfirm, handleCancel } = useConfirmation()

const deleteFile = (fileId: string) => {
  confirm(
    'Delete File?',
    'This action cannot be undone.',
    () => {
      // Perform deletion
      setFiles(files.filter(f => f.id !== fileId))
    }
  )
}

<AlertDialog open={state.open} onOpenChange={handleCancel}>
  <AlertDialogContent>
    <AlertDialogTitle>{state.title}</AlertDialogTitle>
    <AlertDialogDescription>{state.description}</AlertDialogDescription>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Config Hooks

### `use-page-config.ts`

Load and manage page configurations from KV store.

**Usage:**
```typescript
import { usePageConfig, usePageRegistry } from '@/hooks/config/use-page-config'

// Get specific page config
const { pageConfig } = usePageConfig('code-editor')
console.log(pageConfig.title) // "Code Editor"

// Get all pages
const { pages, getPage } = usePageRegistry()
const dashboardPage = getPage('dashboard')
```

### `use-layout-state.ts`

Persist layout state (panel sizes, collapsed state) per page.

**Usage:**
```typescript
import { useLayoutState } from '@/hooks/config/use-layout-state'

const { layoutState, setPanelSizes, setCollapsed, setActivePanel } = 
  useLayoutState('code-editor')

<ResizablePanelGroup 
  onLayout={setPanelSizes}
  defaultLayout={layoutState.panelSizes}
>
  {/* Panels */}
</ResizablePanelGroup>
```

### `use-feature-flags.ts`

Runtime feature flag management.

**Usage:**
```typescript
import { useFeatureFlags } from '@/hooks/config/use-feature-flags'

const { isEnabled, enable, disable, toggle } = useFeatureFlags()

{isEnabled('ai-improve') && (
  <Button onClick={handleAIImprove}>
    AI Improve Code
  </Button>
)}

<Switch
  checked={isEnabled('dark-mode')}
  onCheckedChange={() => toggle('dark-mode')}
/>
```

## Component Size Guidelines

### Rules
1. **Maximum 150 LOC** per component file
2. **Extract all business logic** into hooks
3. **Pure presentation** in components
4. **Compose smaller components** instead of conditional rendering

### Example: Breaking Down a Large Component

**Before (300+ LOC):**
```typescript
// ModelDesigner.tsx - 350 LOC
export function ModelDesigner() {
  const [models, setModels] = useKV('models', [])
  const [selectedModel, setSelectedModel] = useState(null)
  const [showDialog, setShowDialog] = useState(false)
  
  const handleAddModel = async () => {
    // 50 lines of logic
  }
  
  const handleGenerateWithAI = async () => {
    // 50 lines of AI logic
  }
  
  return (
    <div>
      {/* 200 lines of JSX */}
    </div>
  )
}
```

**After (<150 LOC each):**
```typescript
// hooks/features/use-model-manager.ts - 80 LOC
export function useModelManager() {
  const [models, setModels] = useKV('models', [])
  const [selectedModel, setSelectedModel] = useState(null)
  
  const addModel = useCallback(async (model) => {
    // Business logic
  }, [])
  
  const generateWithAI = useCallback(async (description) => {
    // AI logic
  }, [])
  
  return { models, selectedModel, setSelectedModel, addModel, generateWithAI }
}

// components/ModelList.tsx - 80 LOC
export function ModelList({ models, onSelect, selected }) {
  return (
    <ScrollArea>
      {models.map(model => (
        <ModelCard 
          key={model.id}
          model={model}
          selected={selected?.id === model.id}
          onClick={() => onSelect(model)}
        />
      ))}
    </ScrollArea>
  )
}

// components/ModelEditor.tsx - 120 LOC
export function ModelEditor({ model, onChange }) {
  return (
    <Card>
      {/* Editing UI */}
    </Card>
  )
}

// ModelDesigner.tsx - 90 LOC
export function ModelDesigner() {
  const { models, selectedModel, setSelectedModel, addModel, generateWithAI } = 
    useModelManager()
  const { open, openDialog, closeDialog } = useDialog()
  
  return (
    <div className="flex gap-4">
      <ModelList 
        models={models}
        selected={selectedModel}
        onSelect={setSelectedModel}
      />
      {selectedModel && (
        <ModelEditor 
          model={selectedModel}
          onChange={handleChange}
        />
      )}
      <Dialog open={open} onOpenChange={closeDialog}>
        {/* AI Dialog */}
      </Dialog>
    </div>
  )
}
```

## JSON-Based Page Orchestration

### Page Config Schema

Pages can be defined in JSON and stored in the KV database:

```json
{
  "id": "code-editor",
  "title": "Code Editor",
  "description": "Edit project files with AI assistance",
  "icon": "Code",
  "component": "CodeEditorPage",
  "layout": {
    "type": "split",
    "direction": "horizontal",
    "defaultSizes": [20, 80],
    "panels": [
      {
        "id": "file-tree",
        "component": "FileExplorer",
        "minSize": 15,
        "maxSize": 40
      },
      {
        "id": "editor",
        "component": "CodeEditor",
        "minSize": 60
      }
    ]
  },
  "features": [
    { "id": "ai-improve", "enabled": true },
    { "id": "ai-explain", "enabled": true }
  ],
  "shortcuts": [
    { "key": "2", "ctrl": true, "action": "navigate" }
  ]
}
```

### Benefits

1. **Runtime Configuration**: Change page layouts without code changes
2. **User Customization**: Users can configure their own layouts
3. **Feature Flags**: Enable/disable features per page
4. **A/B Testing**: Test different layouts easily
5. **Persistence**: Layouts save automatically to KV store

## Migration Checklist

When refactoring a large component:

- [ ] Identify business logic vs presentation
- [ ] Extract business logic into hooks (`/hooks/features/`)
- [ ] Break JSX into smaller components (<150 LOC each)
- [ ] Create atomic components where applicable
- [ ] Add component to page config JSON
- [ ] Update component registry
- [ ] Test isolated components
- [ ] Update documentation

## Best Practices

1. **One Hook, One Responsibility**: Each hook should manage one concern
2. **Hooks Return Objects**: Return `{ value, actions }` for clarity
3. **Memoize Callbacks**: Use `useCallback` for functions passed as props
4. **Type Everything**: Full TypeScript types for all hooks
5. **Test Hooks**: Write unit tests for hook logic
6. **Document Hooks**: Add JSDoc comments explaining purpose and usage
7. **Validate with Zod**: Use schemas for complex data structures
8. **Handle Loading/Error States**: Return `{ data, loading, error }` pattern

## Next Steps

1. Extract business logic from top 5 largest components
2. Break down FeatureIdeaCloud (829 LOC) into 6 smaller components
3. Create remaining feature hooks (file-manager, workflow-manager, etc.)
4. Build PageOrchestrator component to render from JSON configs
5. Add UI for editing page layouts
6. Migrate all pages to JSON configuration system

## Resources

- [REFACTOR_PHASE2.md](./REFACTOR_PHASE2.md) - Complete refactoring plan
- [React Hooks Documentation](https://react.dev/reference/react/hooks)
- [Zod Documentation](https://zod.dev/)
- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)
