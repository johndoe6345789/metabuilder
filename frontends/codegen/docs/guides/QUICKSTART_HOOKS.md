# Quick Start: Using the Hook Library & JSON Orchestration

## 5-Minute Quick Start

### 1. Use a Data Hook

```typescript
import { useFiles } from '@/hooks/data'

function MyComponent() {
  const { files, addFile, updateFile } = useFiles()
  
  return (
    <div>
      {files.map(file => (
        <div key={file.id}>{file.name}</div>
      ))}
      <button onClick={() => addFile(newFile)}>Add</button>
    </div>
  )
}
```

### 2. Create a Simple Page Schema

```json
{
  "id": "my-page",
  "name": "My Page",
  "layout": { "type": "single" },
  "components": [
    {
      "id": "title",
      "type": "h1",
      "props": { "children": "Hello World" }
    },
    {
      "id": "button",
      "type": "Button",
      "props": { "children": "Click Me" },
      "events": [
        { "event": "onClick", "action": "show-alert" }
      ]
    }
  ],
  "actions": [
    {
      "id": "show-alert",
      "type": "custom",
      "handler": "alert('Clicked!')"
    }
  ]
}
```

### 3. Render the Page

```typescript
import { PageRenderer } from '@/components/orchestration'
import myPageSchema from '@/config/pages/my-page.json'

function App() {
  return <PageRenderer schema={myPageSchema} />
}
```

## Common Patterns

### Pattern 1: List with CRUD

```typescript
import { useModels } from '@/hooks/data'
import { useDialog } from '@/hooks/ui'

function ModelList() {
  const { models, addModel, updateModel, deleteModel } = useModels()
  const { isOpen, open, close } = useDialog()
  
  return (
    <>
      <button onClick={open}>Add Model</button>
      {models.map(model => (
        <div key={model.id}>
          {model.name}
          <button onClick={() => deleteModel(model.id)}>Delete</button>
        </div>
      ))}
      <Dialog open={isOpen} onOpenChange={close}>
        {/* Add form */}
      </Dialog>
    </>
  )
}
```

### Pattern 2: Master-Detail

```typescript
import { useFiles } from '@/hooks/data'
import { useState } from 'react'

function FileEditor() {
  const { files, updateFileContent } = useFiles()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  const selectedFile = files.find(f => f.id === selectedId)
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        {files.map(file => (
          <button key={file.id} onClick={() => setSelectedId(file.id)}>
            {file.name}
          </button>
        ))}
      </div>
      <div>
        {selectedFile && (
          <textarea
            value={selectedFile.content}
            onChange={e => updateFileContent(selectedFile.id, e.target.value)}
          />
        )}
      </div>
    </div>
  )
}
```

### Pattern 3: Form with Validation

```typescript
import { useFormState } from '@/hooks/forms/use-form-state'
import { useModels } from '@/hooks/data'

function ModelForm() {
  const { addModel } = useModels()
  
  const {
    values,
    errors,
    setValue,
    handleSubmit
  } = useFormState({
    initialValues: { name: '', description: '' },
    validate: values => {
      const errors: any = {}
      if (!values.name) errors.name = 'Required'
      return errors
    },
    onSubmit: async values => {
      addModel({
        id: Date.now().toString(),
        ...values,
        fields: [],
        relations: []
      })
    }
  })
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={values.name}
        onChange={e => setValue('name', e.target.value)}
      />
      {errors.name && <span>{errors.name}</span>}
      <button type="submit">Save</button>
    </form>
  )
}
```

## Available Hooks

### Data Hooks
- `useFiles()` - Project files
- `useModels()` - Prisma models
- `useComponents()` - React components
- `useWorkflows()` - Workflows
- `useLambdas()` - Lambda functions

### UI Hooks
- `useDialog()` - Dialog state
- `useConfirmation()` - Confirmation dialogs
- `useSelection()` - Item selection
- `useModal()` - Modals with data
- `useTabs()` - Tab management
- `usePanels()` - Resizable panels

### Core Hooks
- `useKVState()` - Enhanced KV storage
- `useClipboard()` - Copy to clipboard
- `useDebouncedSave()` - Auto-save with debounce

### Orchestration Hooks
- `usePage()` - Execute page schema
- `useActions()` - Action execution

## JSON Schema Cheat Sheet

### Basic Structure
```json
{
  "id": "page-id",
  "name": "Page Name",
  "layout": { "type": "single" },
  "components": []
}
```

### Component Types
- UI: `Button`, `Card`, `Input`, `Badge`, `Textarea`
- HTML: `div`, `span`, `h1`, `h2`, `h3`, `p`

### Layout Types
- `single` - Single column
- `split` - Resizable panels
- `tabs` - Tabbed interface
- `grid` - CSS Grid

### Data Binding
```json
{
  "bindings": [
    {
      "source": "files.length",
      "target": "children",
      "transform": "value + ' files'"
    }
  ]
}
```

### Events
```json
{
  "events": [
    {
      "event": "onClick",
      "action": "add-item"
    }
  ]
}
```

### Actions
```json
{
  "actions": [
    {
      "id": "add-item",
      "type": "create",
      "params": { "target": "Items" }
    }
  ]
}
```

## Best Practices

### ✅ DO
- Use functional updates: `setItems(current => [...current, item])`
- Keep components under 150 LOC
- Extract business logic to hooks
- Use TypeScript types
- Test hooks independently

### ❌ DON'T
- Use stale state: `setItems([...items, item])` ❌
- Put business logic in components
- Create components over 150 LOC
- Skip type definitions
- Test only the full component

## Next Steps

1. **Learn more about hooks**: Read [HOOK_LIBRARY_REFERENCE.md](./HOOK_LIBRARY_REFERENCE.md)
2. **Learn JSON orchestration**: Read [JSON_ORCHESTRATION_GUIDE.md](../architecture/JSON_ORCHESTRATION_GUIDE.md)
3. **See refactoring examples**: Read [REFACTORING_EXAMPLE.md](./REFACTORING_EXAMPLE.md)
4. **Understand architecture**: Read [REFACTOR_PHASE3.md](./REFACTOR_PHASE3.md)

## Get Help

- Check the documentation files listed above
- Look at example schemas in `/src/config/pages/`
- Review hook implementations in `/src/hooks/`
- See component examples in `/src/components/`
