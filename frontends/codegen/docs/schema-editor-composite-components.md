# Schema Editor Composite Components

This document describes the composite component architecture for the Schema Editor feature.

## Component Hierarchy

The Schema Editor follows the Atomic Design methodology:

### Atoms (Smallest units)
- `ComponentPaletteItem` - Individual draggable component in the palette
- `ComponentTreeNode` - Individual node in the component tree
- `PropertyEditorField` - Individual property input field

### Molecules (Simple combinations)
- `ComponentPalette` - Tabbed palette of draggable components
- `ComponentTree` - Hierarchical tree view of components
- `PropertyEditor` - Form for editing component properties
- `CanvasRenderer` - Visual canvas for rendering UI components

### Organisms (Complex combinations)
- `SchemaEditorToolbar` - Top toolbar with import/export/preview actions
- `SchemaEditorSidebar` - Left sidebar containing component palette
- `SchemaEditorCanvas` - Central canvas area with component rendering
- `SchemaEditorPropertiesPanel` - Right panel with tree + property editor
- `SchemaEditorLayout` - Complete editor layout orchestrating all panels
- `EmptyCanvasState` - Empty state displayed when no components exist
- `SchemaEditorStatusBar` - Bottom status bar showing component count
- `SchemaCodeViewer` - JSON/preview viewer for schema output

### Pages (Full features)
- `SchemaEditorPage` - Complete schema editor feature with all hooks and state

## Benefits of This Architecture

### 1. Separation of Concerns
Each component has a single, clear responsibility:
- **Toolbar**: Actions (import, export, preview)
- **Sidebar**: Component palette
- **Canvas**: Visual rendering
- **Properties Panel**: Editing selected component
- **Layout**: Orchestration

### 2. Reusability
Composite components can be used independently:
```tsx
// Use just the toolbar elsewhere
<SchemaEditorToolbar 
  onImport={handleImport}
  onExport={handleExport}
  // ...
/>

// Use just the canvas
<SchemaEditorCanvas 
  components={components}
  selectedId={selectedId}
  // ...
/>
```

### 3. Testability
Each component can be tested in isolation with mock props.

### 4. Maintainability
- Each file is <150 LOC (as per project guidelines)
- Clear dependencies between components
- Easy to locate and modify specific functionality

### 5. Composability
The `SchemaEditorLayout` component orchestrates all the panels, but you could create alternative layouts:
```tsx
// Simple layout without sidebar
<div>
  <SchemaEditorToolbar {...toolbarProps} />
  <div className="flex">
    <SchemaEditorCanvas {...canvasProps} />
    <SchemaEditorPropertiesPanel {...panelProps} />
  </div>
</div>

// Or minimal layout with just canvas
<SchemaEditorCanvas {...canvasProps} />
```

## Component Props Pattern

Each composite component follows a consistent prop pattern:

### Data Props
Props representing the current state (read-only):
- `components: UIComponent[]`
- `selectedId: string | null`
- `hoveredId: string | null`

### Action Props
Props for modifying state (callbacks):
- `onSelect: (id: string | null) => void`
- `onUpdate: (updates: Partial<UIComponent>) => void`
- `onDelete: () => void`

### Drag & Drop Props
Props specifically for drag-and-drop functionality:
- `draggedOverId: string | null`
- `dropPosition: 'before' | 'after' | 'inside' | null`
- `onDragStart: (...) => void`
- `onDragOver: (...) => void`
- `onDrop: (...) => void`

## Usage Example

```tsx
import { SchemaEditorLayout } from '@/components/organisms'
import { useSchemaEditor } from '@/hooks/ui/use-schema-editor'
import { useDragDrop } from '@/hooks/ui/use-drag-drop'

function MySchemaEditor() {
  const {
    components,
    selectedId,
    // ... other state
  } = useSchemaEditor()
  
  const {
    draggedOverId,
    dropPosition,
    // ... drag handlers
  } = useDragDrop()
  
  return (
    <SchemaEditorLayout
      components={components}
      selectedId={selectedId}
      draggedOverId={draggedOverId}
      dropPosition={dropPosition}
      // ... all other props
    />
  )
}
```

## Extension Points

### Adding New Panels
Create a new organism component and add it to the layout:
```tsx
// New component
export function SchemaEditorMetricsPanel({ ... }) {
  return <div>Metrics content</div>
}

// Add to layout
<SchemaEditorLayout>
  {/* existing panels */}
  <SchemaEditorMetricsPanel />
</SchemaEditorLayout>
```

### Custom Toolbars
Create alternative toolbar components:
```tsx
export function SchemaEditorCompactToolbar({ ... }) {
  // Simplified toolbar with fewer buttons
}
```

### Alternative Layouts
Create new layout compositions:
```tsx
export function SchemaEditorSplitLayout({ ... }) {
  // Different arrangement of the same panels
}
```

## File Organization

```
src/components/
├── atoms/
│   ├── ComponentPaletteItem.tsx
│   ├── ComponentTreeNode.tsx
│   └── PropertyEditorField.tsx
├── molecules/
│   ├── ComponentPalette.tsx
│   ├── ComponentTree.tsx
│   ├── PropertyEditor.tsx
│   └── CanvasRenderer.tsx
├── organisms/
│   ├── SchemaEditorToolbar.tsx
│   ├── SchemaEditorSidebar.tsx
│   ├── SchemaEditorCanvas.tsx
│   ├── SchemaEditorPropertiesPanel.tsx
│   ├── SchemaEditorLayout.tsx
│   ├── EmptyCanvasState.tsx
│   ├── SchemaEditorStatusBar.tsx
│   └── SchemaCodeViewer.tsx
└── SchemaEditorPage.tsx
```

## Future Enhancements

1. **Add SchemaEditorPreviewPanel** - Live preview of the schema
2. **Add SchemaEditorHistoryPanel** - Undo/redo history
3. **Add SchemaEditorTemplatesPanel** - Pre-built component templates
4. **Create SchemaEditorMobileLayout** - Responsive mobile layout
5. **Add SchemaEditorKeyboardShortcuts** - Keyboard navigation overlay

## Related Documentation

- [Component Definitions](../lib/component-definitions.ts)
- [JSON UI Types](../types/json-ui.ts)
- [Schema Editor Hook](../hooks/ui/use-schema-editor.ts)
- [Drag Drop Hook](../hooks/ui/use-drag-drop.ts)
