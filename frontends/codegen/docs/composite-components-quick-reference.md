# Composite Components - Quick Reference

## What are Composite Components?

Composite components are pre-assembled, reusable UI sections that combine multiple smaller components (atoms and molecules) into cohesive, functional units (organisms).

## Schema Editor Composites

### Core Panels

#### SchemaEditorToolbar
**Purpose**: Top action bar with import/export controls
**Location**: `src/components/organisms/SchemaEditorToolbar.tsx`
```tsx
<SchemaEditorToolbar
  onImport={() => {}}
  onExport={() => {}}
  onCopy={() => {}}
  onPreview={() => {}}
  onClear={() => {}}
/>
```

#### SchemaEditorSidebar
**Purpose**: Left panel with component palette
**Location**: `src/components/organisms/SchemaEditorSidebar.tsx`
```tsx
<SchemaEditorSidebar
  onDragStart={(component, e) => {}}
/>
```

#### SchemaEditorCanvas
**Purpose**: Central canvas for rendering components
**Location**: `src/components/organisms/SchemaEditorCanvas.tsx`
```tsx
<SchemaEditorCanvas
  components={components}
  selectedId={selectedId}
  hoveredId={hoveredId}
  draggedOverId={draggedOverId}
  dropPosition={dropPosition}
  onSelect={setSelectedId}
  onHover={setHoveredId}
  onHoverEnd={() => setHoveredId(null)}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
/>
```

#### SchemaEditorPropertiesPanel
**Purpose**: Right panel with component tree and property editor
**Location**: `src/components/organisms/SchemaEditorPropertiesPanel.tsx`
```tsx
<SchemaEditorPropertiesPanel
  components={components}
  selectedId={selectedId}
  hoveredId={hoveredId}
  draggedOverId={draggedOverId}
  dropPosition={dropPosition}
  selectedComponent={selectedComponent}
  onSelect={setSelectedId}
  onHover={setHoveredId}
  onHoverEnd={() => setHoveredId(null)}
  onDragStart={handleTreeDragStart}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
  onUpdate={handleUpdate}
  onDelete={handleDelete}
/>
```

### Supporting Composites

#### EmptyCanvasState
**Purpose**: Empty state when no components exist
**Location**: `src/components/organisms/EmptyCanvasState.tsx`
```tsx
<EmptyCanvasState
  onAddFirstComponent={() => {}}
  onImportSchema={() => {}}
/>
```

#### SchemaEditorStatusBar
**Purpose**: Bottom status bar showing metrics
**Location**: `src/components/organisms/SchemaEditorStatusBar.tsx`
```tsx
<SchemaEditorStatusBar
  componentCount={components.length}
  selectedComponentType={selectedComponent?.type}
  hasUnsavedChanges={false}
/>
```

#### SchemaCodeViewer
**Purpose**: View generated JSON schema
**Location**: `src/components/organisms/SchemaCodeViewer.tsx`
```tsx
<SchemaCodeViewer
  components={components}
  schema={schema}
/>
```

### Complete Layout

#### SchemaEditorLayout
**Purpose**: Orchestrates all panels into complete editor
**Location**: `src/components/organisms/SchemaEditorLayout.tsx`
```tsx
<SchemaEditorLayout
  components={components}
  selectedId={selectedId}
  hoveredId={hoveredId}
  draggedOverId={draggedOverId}
  dropPosition={dropPosition}
  selectedComponent={selectedComponent}
  onSelect={setSelectedId}
  onHover={setHoveredId}
  onHoverEnd={() => setHoveredId(null)}
  onComponentDragStart={handleComponentDragStart}
  onTreeDragStart={handleTreeDragStart}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
  onUpdate={handleUpdate}
  onDelete={handleDelete}
  onImport={handleImport}
  onExport={handleExport}
  onCopy={handleCopy}
  onPreview={handlePreview}
  onClear={clearAll}
/>
```

## When to Use

### Use Composite Components When:
✅ Building complete features (full page editors, dashboards)
✅ Need to enforce consistent layouts
✅ Want to abstract complexity from page components
✅ Creating reusable feature modules

### Use Individual Components When:
✅ Building custom layouts
✅ Need fine-grained control
✅ Creating new composite components
✅ Testing specific functionality

## Benefits

1. **Reduced Duplication**: Reuse complex layouts across pages
2. **Consistency**: Same look and behavior everywhere
3. **Maintainability**: Change once, update everywhere
4. **Testability**: Test complete features in isolation
5. **Documentation**: Self-documenting through composition

## Creating New Composites

### Step 1: Identify the Pattern
Look for repeated component combinations in your code.

### Step 2: Create the Organism
```tsx
// src/components/organisms/MyComposite.tsx
interface MyCompositeProps {
  // data props
  items: Item[]
  selectedId: string | null
  
  // action props
  onSelect: (id: string) => void
  onUpdate: (item: Item) => void
}

export function MyComposite({ 
  items, 
  selectedId, 
  onSelect, 
  onUpdate 
}: MyCompositeProps) {
  return (
    <div className="flex flex-col">
      <MyHeader />
      <MySidebar items={items} onSelect={onSelect} />
      <MyContent 
        item={items.find(i => i.id === selectedId)}
        onUpdate={onUpdate}
      />
    </div>
  )
}
```

### Step 3: Export from Index
```tsx
// src/components/organisms/index.ts
export { MyComposite } from './MyComposite'
```

### Step 4: Document
Add usage examples and prop descriptions.

## Common Patterns

### Panel Wrapper Pattern
```tsx
function MyPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-r border-border bg-card">
      <div className="p-4 border-b">
        <h2>Panel Title</h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
```

### Action Bar Pattern
```tsx
function MyActionBar({ onAction1, onAction2 }: ActionBarProps) {
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <Button onClick={onAction1}>Action 1</Button>
      <Button onClick={onAction2}>Action 2</Button>
    </div>
  )
}
```

### Split View Pattern
```tsx
function MySplitView({ left, right }: SplitViewProps) {
  return (
    <div className="flex h-full">
      <div className="w-1/2 border-r">{left}</div>
      <div className="w-1/2">{right}</div>
    </div>
  )
}
```

## Best Practices

1. **Keep Props Focused**: Each composite should have a clear, single purpose
2. **Expose Necessary Callbacks**: Don't hide important events
3. **Support Composition**: Allow children or render props when needed
4. **Document Extensively**: Provide examples and use cases
5. **Test Thoroughly**: Test with various prop combinations
6. **Keep LOC < 150**: Break down if it gets too large

## Related Docs

- [Atomic Design Principles](./atomic-design.md)
- [Schema Editor Architecture](./schema-editor-composite-components.md)
- [Component Guidelines](./component-guidelines.md)
