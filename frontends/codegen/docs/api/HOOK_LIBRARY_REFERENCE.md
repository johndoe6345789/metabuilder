# Hook Library Reference

## Overview

The CodeForge hook library provides a comprehensive set of reusable hooks for managing application state, UI interactions, and business logic. All hooks follow React best practices and are fully typed with TypeScript.

## Table of Contents

1. [Data Management Hooks](#data-management-hooks)
2. [Core Utility Hooks](#core-utility-hooks)
3. [UI State Hooks](#ui-state-hooks)
4. [Form Hooks](#form-hooks)
5. [Canvas Hooks](#canvas-hooks)
6. [AI Hooks](#ai-hooks)
7. [Orchestration Hooks](#orchestration-hooks)

## Data Management Hooks

### useFiles

Manage project files with full CRUD operations.

```typescript
import { useFiles } from '@/hooks/data/use-files'

function MyComponent() {
  const {
    files,           // ProjectFile[]
    addFile,         // (file: ProjectFile) => void
    updateFile,      // (id: string, updates: Partial<ProjectFile>) => void
    deleteFile,      // (id: string) => void
    getFile,         // (id: string) => ProjectFile | undefined
    updateFileContent // (id: string, content: string) => void
  } = useFiles()
  
  // Usage
  addFile({
    id: 'new-file',
    name: 'App.tsx',
    path: '/src/App.tsx',
    content: 'export default function App() {}',
    language: 'typescript'
  })
}
```

### useModels

Manage Prisma models.

```typescript
import { useModels } from '@/hooks/data/use-models'

function ModelDesigner() {
  const {
    models,       // PrismaModel[]
    addModel,     // (model: PrismaModel) => void
    updateModel,  // (id: string, updates: Partial<PrismaModel>) => void
    deleteModel,  // (id: string) => void
    getModel      // (id: string) => PrismaModel | undefined
  } = useModels()
  
  // Add a new model
  addModel({
    id: 'user-model',
    name: 'User',
    fields: [
      { name: 'id', type: 'String', isId: true },
      { name: 'email', type: 'String', isUnique: true }
    ],
    relations: []
  })
}
```

### useComponents

Manage React components.

```typescript
import { useComponents } from '@/hooks/data/use-components'

function ComponentBuilder() {
  const {
    components,      // ComponentNode[]
    addComponent,    // (component: ComponentNode) => void
    updateComponent, // (id: string, updates: Partial<ComponentNode>) => void
    deleteComponent, // (id: string) => void
    getComponent     // (id: string) => ComponentNode | undefined
  } = useComponents()
}
```

### useWorkflows

Manage n8n-style workflows.

```typescript
import { useWorkflows } from '@/hooks/data/use-workflows'

function WorkflowDesigner() {
  const {
    workflows,       // Workflow[]
    addWorkflow,     // (workflow: Workflow) => void
    updateWorkflow,  // (id: string, updates: Partial<Workflow>) => void
    deleteWorkflow,  // (id: string) => void
    getWorkflow      // (id: string) => Workflow | undefined
  } = useWorkflows()
}
```

### useLambdas

Manage serverless functions.

```typescript
import { useLambdas } from '@/hooks/data/use-lambdas'

function LambdaDesigner() {
  const {
    lambdas,       // Lambda[]
    addLambda,     // (lambda: Lambda) => void
    updateLambda,  // (id: string, updates: Partial<Lambda>) => void
    deleteLambda,  // (id: string) => void
    getLambda      // (id: string) => Lambda | undefined
  } = useLambdas()
}
```

## Core Utility Hooks

### useKVState

Enhanced KV storage with validation and transformations.

```typescript
import { useKVState } from '@/hooks/core/use-kv-state'

function MyComponent() {
  const [value, setValue] = useKVState({
    key: 'my-data',
    defaultValue: { count: 0 },
    validate: (data) => data.count >= 0,
    transform: (data) => ({ ...data, lastUpdated: Date.now() })
  })
}
```

### useClipboard

Copy to clipboard with feedback.

```typescript
import { useClipboard } from '@/hooks/core/use-clipboard'

function CopyButton({ text }: { text: string }) {
  const { copy, copied } = useClipboard()
  
  return (
    <button onClick={() => copy(text)}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
```

### useDebouncedSave

Auto-save with debouncing.

```typescript
import { useDebouncedSave } from '@/hooks/core/use-debounced-save'

function Editor() {
  const [content, setContent] = useState('')
  
  useDebouncedSave(content, async (value) => {
    await saveToServer(value)
  }, 1000) // 1 second delay
  
  return <textarea value={content} onChange={e => setContent(e.target.value)} />
}
```

## UI State Hooks

### useDialog

Manage dialog/modal state.

```typescript
import { useDialog } from '@/hooks/ui/use-dialog'

function MyComponent() {
  const { isOpen, open, close, toggle } = useDialog()
  
  return (
    <>
      <button onClick={open}>Open Dialog</button>
      <Dialog open={isOpen} onOpenChange={close}>
        {/* Dialog content */}
      </Dialog>
    </>
  )
}
```

### useConfirmation

Confirm dangerous actions.

```typescript
import { useConfirmation } from '@/hooks/ui/use-confirmation'

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  const { confirm, ConfirmDialog } = useConfirmation({
    title: 'Delete Item',
    description: 'Are you sure? This cannot be undone.',
    confirmText: 'Delete',
    variant: 'destructive'
  })
  
  const handleDelete = async () => {
    if (await confirm()) {
      onDelete()
    }
  }
  
  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      <ConfirmDialog />
    </>
  )
}
```

### useSelection

Manage item selection (single or multiple).

```typescript
import { useSelection } from '@/hooks/ui/use-selection'

function ItemList({ items }: { items: Item[] }) {
  const {
    selected,      // Set<string>
    isSelected,    // (id: string) => boolean
    toggle,        // (id: string) => void
    selectAll,     // () => void
    deselectAll,   // () => void
    selectedCount  // number
  } = useSelection({ multi: true })
  
  return (
    <div>
      {items.map(item => (
        <div
          key={item.id}
          onClick={() => toggle(item.id)}
          className={isSelected(item.id) ? 'selected' : ''}
        >
          {item.name}
        </div>
      ))}
    </div>
  )
}
```

### useModal

Enhanced modal with data passing.

```typescript
import { useModal } from '@/hooks/ui/use-modal'

function App() {
  const { isOpen, data, open, close } = useModal<{ userId: string }>()
  
  return (
    <>
      <button onClick={() => open({ userId: '123' })}>
        Edit User
      </button>
      {isOpen && <UserModal userId={data?.userId} onClose={close} />}
    </>
  )
}
```

### useTabs

Manage tab state with URL sync.

```typescript
import { useTabs } from '@/hooks/ui/use-tabs'

function TabbedInterface() {
  const { activeTab, setTab, tabs } = useTabs({
    tabs: ['overview', 'details', 'settings'],
    defaultTab: 'overview',
    syncWithUrl: true
  })
  
  return (
    <Tabs value={activeTab} onValueChange={setTab}>
      {/* Tab content */}
    </Tabs>
  )
}
```

### usePanels

Manage resizable panel state.

```typescript
import { usePanels } from '@/hooks/ui/use-panels'

function SplitView() {
  const { sizes, setSizes, collapsed, togglePanel } = usePanels({
    defaultSizes: [30, 70],
    minSizes: [20, 50]
  })
  
  return (
    <ResizablePanelGroup sizes={sizes} onResize={setSizes}>
      {/* Panels */}
    </ResizablePanelGroup>
  )
}
```

## Form Hooks

### useFormState

Comprehensive form state management.

```typescript
import { useFormState } from '@/hooks/forms/use-form-state'

function UserForm() {
  const {
    values,         // Current form values
    errors,         // Validation errors
    touched,        // Touched fields
    isValid,        // Form validity
    isDirty,        // Form has changes
    isSubmitting,   // Submission state
    setValue,       // Set single field
    setValues,      // Set multiple fields
    setError,       // Set error
    handleSubmit,   // Submit handler
    reset           // Reset form
  } = useFormState({
    initialValues: {
      name: '',
      email: ''
    },
    validate: (values) => {
      const errors: any = {}
      if (!values.email) errors.email = 'Required'
      return errors
    },
    onSubmit: async (values) => {
      await saveUser(values)
    }
  })
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={values.name}
        onChange={e => setValue('name', e.target.value)}
      />
      {errors.name && <span>{errors.name}</span>}
    </form>
  )
}
```

### useValidation

Reusable validation logic.

```typescript
import { useValidation } from '@/hooks/forms/use-validation'

function PasswordField() {
  const { validate, errors, isValid } = useValidation({
    rules: {
      minLength: 8,
      hasNumber: true,
      hasSpecialChar: true
    }
  })
  
  const handleChange = (value: string) => {
    validate(value)
  }
}
```

### useFieldArray

Manage dynamic form arrays.

```typescript
import { useFieldArray } from '@/hooks/forms/use-field-array'

function ContactsForm() {
  const {
    fields,    // Array of field values
    append,    // Add new field
    remove,    // Remove field
    move,      // Reorder fields
    update     // Update specific field
  } = useFieldArray({
    name: 'contacts',
    defaultValue: []
  })
  
  return (
    <div>
      {fields.map((field, index) => (
        <div key={index}>
          <input value={field.email} />
          <button onClick={() => remove(index)}>Remove</button>
        </div>
      ))}
      <button onClick={() => append({ email: '' })}>
        Add Contact
      </button>
    </div>
  )
}
```

## Canvas Hooks

### useCanvas

Canvas drawing utilities.

```typescript
import { useCanvas } from '@/hooks/canvas/use-canvas'

function DrawingCanvas() {
  const {
    canvasRef,
    ctx,
    clear,
    drawLine,
    drawRect,
    drawCircle,
    getImageData,
    setImageData
  } = useCanvas({
    width: 800,
    height: 600
  })
  
  return <canvas ref={canvasRef} />
}
```

### useDragDrop

Drag and drop for canvas elements.

```typescript
import { useDragDrop } from '@/hooks/canvas/use-drag-drop'

function DraggableElements() {
  const {
    elements,        // Array of positioned elements
    draggedId,       // Currently dragged element
    handleMouseDown, // Start drag
    handleMouseMove, // During drag
    handleMouseUp,   // End drag
    updatePosition,  // Programmatic position update
  } = useDragDrop({
    initialElements: [
      { id: '1', x: 100, y: 100, width: 50, height: 50 }
    ]
  })
}
```

### useZoomPan

Zoom and pan for canvas views.

```typescript
import { useZoomPan } from '@/hooks/canvas/use-zoom-pan'

function ZoomableCanvas() {
  const {
    zoom,           // Current zoom level
    pan,            // Pan offset { x, y }
    zoomIn,         // Increase zoom
    zoomOut,        // Decrease zoom
    resetZoom,      // Reset to default
    setPan,         // Set pan position
    transform       // CSS transform string
  } = useZoomPan({
    minZoom: 0.1,
    maxZoom: 5,
    defaultZoom: 1
  })
  
  return (
    <div style={{ transform }}>
      {/* Canvas content */}
    </div>
  )
}
```

### useConnections

Manage node connections (for diagrams/workflows).

```typescript
import { useConnections } from '@/hooks/canvas/use-connections'

function FlowDiagram() {
  const {
    connections,      // Array of connections
    addConnection,    // Add new connection
    removeConnection, // Remove connection
    updateConnection, // Update connection
    getConnections    // Get connections for node
  } = useConnections({
    validate: (from, to) => from !== to // No self-connections
  })
}
```

## AI Hooks

### useAIGenerate

Generate content with AI.

```typescript
import { useAIGenerate } from '@/hooks/ai/use-ai-generate'

function AIAssistant() {
  const {
    generate,      // (prompt: string) => Promise<string>
    isGenerating,  // boolean
    result,        // Generated content
    error          // Error if any
  } = useAIGenerate()
  
  const handleGenerate = async () => {
    const code = await generate('Create a React login form')
    console.log(code)
  }
}
```

### useAIComplete

AI code completion.

```typescript
import { useAIComplete } from '@/hooks/ai/use-ai-complete'

function CodeEditor() {
  const {
    complete,        // (prefix: string) => Promise<string>
    suggestions,     // string[]
    isCompleting,    // boolean
    acceptSuggestion // (index: number) => void
  } = useAIComplete({
    debounce: 300
  })
}
```

### useAISuggestions

Get AI suggestions for improvements.

```typescript
import { useAISuggestions } from '@/hooks/ai/use-ai-suggestions'

function CodeReview() {
  const {
    getSuggestions,   // (code: string) => Promise<Suggestion[]>
    suggestions,      // Suggestion[]
    applySuggestion,  // (id: string) => void
    dismissSuggestion // (id: string) => void
  } = useAISuggestions()
}
```

## Orchestration Hooks

### usePage

Execute a page schema.

```typescript
import { usePage } from '@/hooks/orchestration/use-page'
import pageSchema from '@/config/pages/my-page.json'

function DynamicPage() {
  const {
    context,     // Data context
    execute,     // Execute action by ID
    isExecuting, // boolean
    handlers,    // Action handlers map
    schema       // Page schema
  } = usePage(pageSchema)
  
  return <PageRenderer schema={schema} />
}
```

### useActions

Execute page actions.

```typescript
import { useActions } from '@/hooks/orchestration/use-actions'

function ActionButtons() {
  const { execute, isExecuting, handlers } = useActions(
    [
      {
        id: 'save',
        type: 'update',
        params: { target: 'Files' }
      }
    ],
    { files: [], setFiles: () => {} }
  )
  
  return (
    <button onClick={() => execute('save')} disabled={isExecuting}>
      Save
    </button>
  )
}
```

## Hook Composition Patterns

### Combining Multiple Hooks

```typescript
function FeaturePage() {
  const files = useFiles()
  const models = useModels()
  const { isOpen, open, close } = useDialog()
  const { selected, toggle } = useSelection()
  
  // Combine hooks to build complex features
  const handleCreateModel = () => {
    const model = createModelFromFiles(files.files)
    models.addModel(model)
    close()
  }
}
```

### Custom Hook Composition

```typescript
function useProjectEditor() {
  const files = useFiles()
  const { isOpen, open, close } = useDialog()
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  
  const openFile = (id: string) => {
    setActiveFileId(id)
    open()
  }
  
  const saveFile = (content: string) => {
    if (activeFileId) {
      files.updateFileContent(activeFileId, content)
    }
  }
  
  return {
    files: files.files,
    activeFile: files.getFile(activeFileId),
    openFile,
    saveFile,
    isEditing: isOpen,
    closeEditor: close
  }
}
```

## Best Practices

### 1. Always Use Functional Updates

```typescript
// ❌ Bad - May cause data loss
setFiles([...files, newFile])

// ✅ Good - Always gets current state
setFiles(current => [...current, newFile])
```

### 2. Memoize Expensive Computations

```typescript
const filteredFiles = useMemo(() => {
  return files.filter(f => f.name.includes(search))
}, [files, search])
```

### 3. Clean Up Side Effects

```typescript
useEffect(() => {
  const subscription = subscribe()
  return () => subscription.unsubscribe()
}, [])
```

### 4. Type Your Hooks

```typescript
function useTypedData<T>(key: string, defaultValue: T) {
  const [data, setData] = useKV<T>(key, defaultValue)
  return { data, setData }
}
```

### 5. Extract Reusable Logic

```typescript
// Extract common patterns into custom hooks
function useResource<T>(resourceName: string) {
  const [items, setItems] = useKV<T[]>(`${resourceName}-items`, [])
  
  const add = useCallback((item: T) => {
    setItems(current => [...current, item])
  }, [setItems])
  
  return { items, add }
}
```

## Next Steps

- Explore `/src/hooks/` directory for implementations
- Check `../architecture/JSON_ORCHESTRATION_GUIDE.md` for page schemas
- See `REFACTOR_PHASE3.md` for architecture overview
- Read individual hook files for detailed implementation notes
