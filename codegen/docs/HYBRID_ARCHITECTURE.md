# Hybrid Architecture: JSON + React

## The Power of Both Worlds

This platform uses a **hybrid architecture** where JSON handles declarative UI composition while React provides the imperative implementation layer. This gives you the best of both worlds:

- **JSON** for structure, composition, and configuration
- **React** for complex logic, hooks, events, and interactivity

## What JSON Can't (and Shouldn't) Replace

### 1. Hooks
React hooks manage complex stateful logic that can't be represented declaratively:

```tsx
// ❌ Cannot be JSON
function useDataSourceManager(dataSources: DataSource[]) {
  const [localSources, setLocalSources] = useState(dataSources)
  const [editingSource, setEditingSource] = useState<DataSource | null>(null)

  useEffect(() => {
    // Sync with external API
    syncDataSources(localSources)
  }, [localSources])

  const getDependents = useCallback((id: string) => {
    return localSources.filter(ds => ds.dependencies?.includes(id))
  }, [localSources])

  return { localSources, editingSource, getDependents, ... }
}
```

**Why React?** Hooks encapsulate complex imperative logic: side effects, memoization, refs, context. JSON is declarative and can't express these patterns.

### 2. Event Handlers with Complex Logic
Simple actions work in JSON, but complex event handling needs code:

```tsx
// ✅ Simple actions in JSON
{
  "events": [{
    "event": "onClick",
    "actions": [
      { "type": "setState", "target": "count", "value": 1 },
      { "type": "toast", "title": "Clicked!" }
    ]
  }]
}

// ❌ Complex logic needs React
function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file type
  const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml']
  if (!validTypes.includes(file.type)) {
    toast.error('Invalid file type')
    return
  }

  // Check file size
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    toast.error('File too large')
    return
  }

  // Convert to base64, compress, upload
  compressImage(file).then(compressed => {
    uploadToServer(compressed).then(url => {
      updateState({ faviconUrl: url })
      toast.success('Uploaded!')
    })
  })
}
```

**Why React?** Branching logic, async operations, error handling, file processing. JSON actions are linear and synchronous.

### 3. Classes and Interfaces
Type systems and OOP patterns require TypeScript:

```tsx
// ❌ Cannot be JSON
export interface DataSource {
  id: string
  type: DataSourceType
  dependencies?: string[]
  compute?: string
}

export class ThemeManager {
  private themes: Map<string, Theme>
  private listeners: Set<ThemeListener>

  constructor(initialThemes: Theme[]) {
    this.themes = new Map(initialThemes.map(t => [t.id, t]))
    this.listeners = new Set()
  }

  applyTheme(themeId: string): void {
    const theme = this.themes.get(themeId)
    if (!theme) throw new Error(`Theme ${themeId} not found`)

    // Apply CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value)
    })

    // Notify listeners
    this.listeners.forEach(listener => listener.onThemeChange(theme))
  }
}
```

**Why React/TS?** Type safety, encapsulation, methods, private state. JSON is just data.

### 4. Complex Rendering Logic
Conditional rendering with complex business rules:

```tsx
// ❌ Cannot be JSON
function ComponentTree({ components }: ComponentTreeProps) {
  const renderNode = (component: Component, depth: number): ReactNode => {
    const hasChildren = component.children && component.children.length > 0
    const isExpanded = expandedNodes.has(component.id)
    const isDragging = draggedNode === component.id
    const isDropTarget = dropTarget === component.id

    // Determine visual state
    const className = cn(
      'tree-node',
      { 'tree-node--expanded': isExpanded },
      { 'tree-node--dragging': isDragging },
      { 'tree-node--drop-target': isDropTarget && canDrop(component) }
    )

    return (
      <div
        className={className}
        style={{ paddingLeft: `${depth * 20}px` }}
        onDragStart={() => handleDragStart(component)}
        onDragOver={(e) => handleDragOver(e, component)}
        onDrop={() => handleDrop(component)}
      >
        {/* Recursive rendering */}
        {hasChildren && isExpanded && (
          <div className="tree-children">
            {component.children.map(child =>
              renderNode(child, depth + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  return <div className="tree-root">{components.map(c => renderNode(c, 0))}</div>
}
```

**Why React?** Recursion, dynamic styling, drag-and-drop state, event coordination. JSON can't express recursive algorithms.

### 5. Third-Party Integrations
Libraries with imperative APIs need wrapper components:

```tsx
// ❌ Cannot be JSON
import MonacoEditor from '@monaco-editor/react'

export function LazyMonacoEditor({ value, onChange, language }: EditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>()
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    // Configure Monaco
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    })

    // Add custom validation
    monaco.editor.onDidChangeMarkers(([uri]) => {
      const markers = monaco.editor.getModelMarkers({ resource: uri })
      setIsValid(markers.filter(m => m.severity === 8).length === 0)
    })
  }, [])

  return (
    <MonacoEditor
      value={value}
      onChange={onChange}
      language={language}
      onMount={(editor) => {
        editorRef.current = editor
        editor.addAction({
          id: 'format-document',
          label: 'Format Document',
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
          run: () => editor.getAction('editor.action.formatDocument')?.run()
        })
      }}
    />
  )
}
```

**Why React?** Third-party libraries expect imperative APIs (refs, lifecycle methods). JSON can reference the wrapper, but can't create it.

## The Hybrid Pattern

### JSON References React Components

JSON schemas can reference any React component via the component registry:

```json
{
  "id": "code-editor-section",
  "type": "div",
  "children": [
    {
      "id": "monaco-editor",
      "type": "LazyMonacoEditor",
      "props": {
        "language": "typescript",
        "theme": "vs-dark"
      }
    }
  ]
}
```

The `LazyMonacoEditor` is a React component with hooks, refs, and complex logic. JSON just *configures* it.

### Component Registry: The Bridge

```tsx
// src/lib/json-ui/component-registry.ts
export const componentRegistry: ComponentRegistry = {
  // Simple components (could be JSON, but registered for convenience)
  'Button': Button,
  'Card': Card,
  'Input': Input,

  // Complex components (MUST be React)
  'LazyMonacoEditor': LazyMonacoEditor,
  'DataSourceManager': DataSourceManager,
  'ComponentTree': ComponentTree,
  'SchemaEditor': SchemaEditor,

  // Hook-based components
  'ProjectDashboard': ProjectDashboard,  // uses multiple hooks
  'CodeEditor': CodeEditor,              // uses useEffect, useRef
  'JSONModelDesigner': JSONModelDesigner, // uses custom hooks
}
```

### The 68 React Components

These aren't legacy cruft - they're **essential implementation**:

| Component Type | Count | Why React? |
|----------------|-------|------------|
| Hook-based managers | 15 | useState, useEffect, useCallback |
| Event-heavy UIs | 12 | Complex event handlers, drag-and-drop |
| Third-party wrappers | 8 | Monaco, Chart.js, D3 integrations |
| Recursive renderers | 6 | Tree views, nested structures |
| Complex forms | 10 | Validation, multi-step flows |
| Dialog/Modal managers | 8 | Portal rendering, focus management |
| Real-time features | 5 | WebSocket, polling, live updates |
| Lazy loaders | 4 | Code splitting, dynamic imports |

## When to Use What

### Use JSON When:
✅ Composing existing components
✅ Configuring layouts and styling
✅ Defining data sources and bindings
✅ Simple linear action chains
✅ Static page structure
✅ Theming and branding
✅ Feature flags and toggles

### Use React When:
✅ Complex state management (hooks)
✅ Imperative APIs (refs, third-party libs)
✅ Advanced event handling (validation, async)
✅ Recursive algorithms
✅ Performance optimization (memo, virtualization)
✅ Type-safe business logic (classes, interfaces)
✅ Side effects and lifecycle management

## Real-World Example: Data Source Manager

### What's in JSON
```json
{
  "id": "data-source-section",
  "type": "Card",
  "children": [
    {
      "type": "CardHeader",
      "children": [
        { "type": "CardTitle", "children": "Data Sources" }
      ]
    },
    {
      "type": "CardContent",
      "children": [
        {
          "id": "ds-manager",
          "type": "DataSourceManager",
          "dataBinding": {
            "dataSources": { "source": "pageSources" }
          },
          "events": [{
            "event": "onChange",
            "actions": [
              { "type": "setState", "target": "pageSources", "valueFrom": "event" }
            ]
          }]
        }
      ]
    }
  ]
}
```

**JSON handles:** Layout, composition, data binding, simple state updates

### What's in React
```tsx
// src/components/organisms/DataSourceManager.tsx
export function DataSourceManager({ dataSources, onChange }: Props) {
  // ✅ Hook for complex state management
  const {
    dataSources: localSources,
    addDataSource,
    updateDataSource,
    deleteDataSource,
    getDependents,  // ← Complex computed logic
  } = useDataSourceManager(dataSources)

  // ✅ Local UI state
  const [editingSource, setEditingSource] = useState<DataSource | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // ✅ Complex event handler with validation
  const handleDeleteSource = (id: string) => {
    const dependents = getDependents(id)
    if (dependents.length > 0) {
      toast.error(`Cannot delete: ${dependents.length} sources depend on it`)
      return
    }
    deleteDataSource(id)
    onChange(localSources.filter(ds => ds.id !== id))
    toast.success('Data source deleted')
  }

  // ✅ Conditional rendering based on complex state
  const groupedSources = useMemo(() => ({
    kv: localSources.filter(ds => ds.type === 'kv'),
    computed: localSources.filter(ds => ds.type === 'computed'),
    static: localSources.filter(ds => ds.type === 'static'),
  }), [localSources])

  return (
    <div>
      {localSources.length === 0 ? (
        <EmptyState />
      ) : (
        <Stack>
          <DataSourceGroup sources={groupedSources.kv} />
          <DataSourceGroup sources={groupedSources.static} />
          <DataSourceGroup sources={groupedSources.computed} />
        </Stack>
      )}
      <DataSourceEditorDialog
        open={dialogOpen}
        dataSource={editingSource}
        onSave={handleSaveSource}
      />
    </div>
  )
}
```

**React handles:** Hooks, validation, dependency checking, grouping logic, dialog state

## The Power of Hybrid

### Flexibility
- **JSON**: Quick changes, visual editing, non-developer friendly
- **React**: Full programming power when needed

### Composition
- **JSON**: Compose pages from molecules and organisms
- **React**: Implement the organisms with complex logic

### Evolution
- **Start Simple**: Build in JSON, reference simple React components
- **Add Complexity**: When logic grows, extract to custom React component
- **Stay Declarative**: JSON schema stays clean, complexity hidden in components

### Example Evolution

**Day 1 - Pure JSON:**
```json
{
  "type": "Button",
  "events": [{ "event": "onClick", "actions": [{ "type": "toast" }] }]
}
```

**Day 30 - Need validation:**
```json
{
  "type": "ValidatedButton",  // ← Custom React component
  "props": { "validationRules": ["required", "email"] }
}
```

```tsx
// Custom component when JSON isn't enough
function ValidatedButton({ validationRules, onClick, ...props }) {
  const validate = useValidation(validationRules)

  const handleClick = () => {
    if (!validate()) {
      toast.error('Validation failed')
      return
    }
    onClick?.()
  }

  return <Button onClick={handleClick} {...props} />
}
```

**Day 90 - Complex workflow:**
```json
{
  "type": "WorkflowButton",  // ← Even more complex component
  "props": { "workflowId": "user-onboarding" }
}
```

The JSON stays simple. The complexity lives in well-tested React components.

## Conclusion

The **68 React components aren't cruft** - they're the **essential implementation layer** that makes the JSON system powerful:

- **Hooks** manage complex state
- **Events** handle imperative interactions
- **Interfaces** provide type safety
- **Classes** encapsulate business logic
- **Third-party integrations** extend capabilities

JSON provides the **declarative structure**. React provides the **imperative power**.

Together, they create a system that's:
- **Easy** for simple cases (JSON)
- **Powerful** for complex cases (React)
- **Scalable** (add React components as needed)
- **Maintainable** (JSON is readable, React is testable)

This is the architecture of modern low-code platforms - not "no code," but **"right tool for the right job."**
