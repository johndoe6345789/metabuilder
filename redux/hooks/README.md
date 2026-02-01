# @metabuilder/hooks-core

Core React hooks for workflow UI applications built with Redux.

**Key Feature**: Service-independent hooks - use these with any Redux-compatible workflow implementation.

## What's Included

### Canvas Hooks
- `useCanvasZoom` - Manage canvas zoom level
- `useCanvasPan` - Manage canvas pan/translation
- `useCanvasSelection` - Manage selected items on canvas
- `useCanvasSettings` - Manage grid, snap, and other canvas settings
- `useCanvasGridUtils` - Grid calculations and utilities

### Editor Hooks
- `useEditor` - Aggregated editor state
- `useEditorZoom` - Node editor zoom control
- `useEditorPan` - Node editor pan control
- `useEditorNodes` - Node selection and manipulation
- `useEditorEdges` - Edge/connection selection
- `useEditorSelection` - General selection state
- `useEditorClipboard` - Copy/paste operations
- `useEditorHistory` - Undo/redo history

### UI Hooks
- `useUI` - Aggregated UI state
- `useUIModals` - Modal dialog state
- `useUINotifications` - Toast/notification management
- `useUILoading` - Global loading state
- `useUITheme` - Theme (light/dark) management
- `useUISidebar` - Sidebar visibility state

### Utility Hooks
- `useCanvasVirtualization` - Virtual scrolling for large canvas
- `useResponsiveSidebar` - Responsive sidebar behavior
- `usePasswordValidation` - Password strength validation

## Installation

```bash
npm install @metabuilder/hooks-core react react-redux @metabuilder/redux-slices
```

## Usage

```typescript
import { useCanvasZoom, useEditorSelection, useUIModals } from '@metabuilder/hooks-core'
import { Provider } from 'react-redux'
import { store } from '@metabuilder/redux-slices' // Or your own store

function WorkflowEditor() {
  const { zoom, zoomIn, zoomOut } = useCanvasZoom()
  const { selectedNodeIds, selectNode } = useEditorSelection()
  const { openModal } = useUIModals()

  return (
    <div>
      <button onClick={zoomIn}>Zoom In ({zoom.toFixed(0)}%)</button>
      <button onClick={zoomOut}>Zoom Out</button>
      {/* Your editor UI */}
    </div>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <WorkflowEditor />
    </Provider>
  )
}
```

## Requirements

- React 18.0+
- Redux with workflow slices
- react-redux

## Architecture

All hooks in this package:
- Are **service-independent** - no API calls, no database access
- Use **Redux as source of truth** - dispatch actions, select state
- Are **framework-agnostic** - work with any Redux setup
- Are **type-safe** - full TypeScript support
- Are **composable** - hooks are small and combine well

## Future

These hooks will be extended with:
- Canvas operations (creation, deletion, layout)
- Workflow execution hooks
- Collaboration hooks (cursors, presence)
- Real-time sync hooks

## Contributing

See main metabuilder repository for contribution guidelines.

## License

MIT
