# Review: maybe-json-compatible components and binding gaps

## Scope
Components still marked `maybe-json-compatible` were reviewed for missing event/state bindings that would need to be exposed to the JSON UI system. This list mirrors the registry entries that currently sit in that status. Each component below is annotated with the missing bindings that should be mapped to JSON events (`events`) or data bindings (`bindings`/`dataBinding`).

## Component-by-component binding gaps

### Dialogs and editor flows
- **CodeExplanationDialog**: needs JSON bindings for `open` and `onOpenChange`, plus data bindings for `fileName`, `explanation`, and `isLoading` so schemas can control dialog visibility and content. These are currently prop-only. 
- **ComponentBindingDialog**: needs JSON bindings for `open`, `component`, and `dataSources`, plus event bindings for `onOpenChange` and `onSave`. This dialog also pipes `onChange` updates through `BindingEditor`, which should map to JSON actions when used from schemas.
- **DataSourceEditorDialog**: needs JSON bindings for `open`, `dataSource`, `allDataSources`, plus event bindings for `onOpenChange` and `onSave`. Internally, field updates (e.g., `updateField`, dependency add/remove) are not yet exposed as JSON actions.
- **TreeFormDialog**: needs JSON bindings for `open`, `name`, `treeDescription`, plus event bindings for `onNameChange`, `onDescriptionChange`, `onOpenChange`, and `onSubmit`.

### Selection and list management
- **FileTabs**: needs JSON bindings for `files` and `activeFileId`, plus event bindings for `onFileSelect` and `onFileClose`.
- **NavigationItem**: needs JSON binding for `isActive`/`badge` and event binding for `onClick`.
- **NavigationMenu**: relies on internal `expandedGroups` state and a set of callbacks (`onTabChange`, `onToggleGroup`, `onItemHover`, `onItemLeave`). These should be exposed as JSON data bindings and events to support JSON-driven navigation and hover-driven actions (e.g., preloading routes).
- **TreeCard**: needs event bindings for `onSelect`, `onEdit`, `onDuplicate`, and `onDelete` plus data bindings for `isSelected`/`disableDelete` to allow schema-driven selection state.
- **TreeListHeader**: needs event bindings for `onCreateNew`, `onImportJson`, and `onExportJson`, with `hasSelectedTree` coming from data bindings.
- **TreeListPanel**: orchestrates tree selection and CRUD; bindings are needed for `trees`, `selectedTreeId`, and event callbacks (`onTreeSelect`, `onTreeEdit`, `onTreeDuplicate`, `onTreeDelete`, `onCreateNew`, `onImportJson`, `onExportJson`).

### Data source management
- **DataSourceCard**: requires event bindings for `onEdit` and `onDelete`, plus data bindings for `dataSource` and `dependents`.
- **DataSourceManager**: uses local state for `editingSource` and dialog visibility while exposing `onChange` externally. Needs JSON bindings for `dataSources` and events for `onAdd`, `onEdit`, `onDelete`, `onSave` (mapped to create/update/delete actions) plus ability to toggle dialog state from JSON.

### Editor UI and property panels
- **BindingEditor**: should expose `bindings`, `dataSources`, and `availableProps` through data bindings plus event bindings for `onChange` when bindings are added/removed.
- **CanvasRenderer**: needs JSON events for `onSelect`, `onHover`, `onHoverEnd`, `onDragOver`, `onDragLeave`, and `onDrop`, and data bindings for `selectedId`, `hoveredId`, `draggedOverId`, and `dropPosition` so drag/hover state can live in JSON data.
- **ComponentPalette**: should expose `onDragStart` via JSON events, and optionally a binding for the active tab/category if schemas should control which tab is open.
- **ComponentTree**: relies on internal expansion state (`expandedIds`) and emits `onSelect`, `onHover`, `onDragStart`, `onDrop`, etc. Those should be JSON event bindings plus data bindings for expansion and selection state.
- **PropertyEditor**: needs event bindings for `onUpdate` and `onDelete`, with the selected `component` coming from JSON data.
- **SchemaEditorCanvas**: mirrors `CanvasRenderer`; bindings needed for all selection/hover/drag data and events.
- **SchemaEditorLayout**: orchestrates `onImport`, `onExport`, `onCopy`, `onPreview`, `onClear`, plus component drag events and selection state. These should map to JSON action handlers.
- **SchemaEditorPropertiesPanel**: inherits `ComponentTree` and `PropertyEditor` events; all selection/drag/update/delete events should be exposed in JSON.
- **SchemaEditorSidebar**: needs JSON event binding for `onDragStart` from the component palette.
- **SchemaEditorToolbar**: needs JSON event bindings for `onImport`, `onExport`, `onCopy`, `onPreview`, and `onClear`.

### Search and toolbar interactions
- **ActionBar**: actions array needs JSON event bindings for each `onClick` with optional `disabled`/`variant` driven by bindings.
- **EditorActions**: needs JSON event bindings for `onExplain` and `onImprove`.
- **EditorToolbar**: needs bindings for `openFiles` and `activeFileId`, plus events for file select/close and explain/improve actions.
- **SearchBar**: needs binding for `value` plus event binding for `onChange`/clear.
- **SearchInput**: needs binding for `value` plus event bindings for `onChange` and `onClear`.
- **ToolbarButton** and **ToolbarActions**: need JSON event bindings for their `onClick` handlers.

### Monaco editor integrations
- **LazyInlineMonacoEditor**: needs data binding for `value` and event binding for `onChange`.
- **LazyMonacoEditor**/**MonacoEditorPanel**: same binding as above (value/content and change events).

### Mostly presentational components (no missing event/state bindings beyond data)
These components are largely render-only and should work with basic `props`/`bindings` without extra event wiring: **SchemaCodeViewer**, **EmptyCanvasState**, **EmptyState**, **SchemaEditorStatusBar**, **StatCard**, **DataCard**, **PageHeaderContent**, **AppHeader** (except for the actions passed into the toolbar components), **JSONUIShowcase** (internal demo state).

## Mapping missing bindings to the JSON action + expression systems

The JSON UI system already supports `events` for action execution and `bindings`/`dataBinding` for state. The following mappings show how each missing binding should be wired.

### 1) Dialog open/close control
**Bindings:** `open` state stored in a data source.

```json
{
  "id": "code-explain-dialog",
  "type": "CodeExplanationDialog",
  "bindings": {
    "open": { "source": "uiState", "path": "dialogs.codeExplainOpen" },
    "fileName": { "source": "editor", "path": "activeFile.name" },
    "explanation": { "source": "ai", "path": "explanation" },
    "isLoading": { "source": "ai", "path": "loading" }
  },
  "events": {
    "onOpenChange": {
      "actions": [
        {
          "id": "toggle-code-explain",
          "type": "set-value",
          "target": "uiState.dialogs.codeExplainOpen",
          "expression": "event"
        }
      ]
    }
  }
}
```

**Why:** `onOpenChange` provides a boolean; the JSON action `set-value` with an expression is a direct mapping for controlled dialog visibility.

### 2) Input value + change events (SearchBar/SearchInput/TreeFormDialog)
**Bindings:** `value` and `onChange` mapped to `set-value` with `event.target.value`.

```json
{
  "id": "search-input",
  "type": "SearchInput",
  "bindings": {
    "value": { "source": "filters", "path": "query" }
  },
  "events": {
    "onChange": {
      "actions": [
        {
          "id": "update-search-query",
          "type": "set-value",
          "target": "filters.query",
          "expression": "event.target.value"
        }
      ]
    },
    "onClear": {
      "actions": [
        {
          "id": "clear-search-query",
          "type": "set-value",
          "target": "filters.query",
          "value": ""
        }
      ]
    }
  }
}
```

**Why:** `event.target.value` is supported by the JSON expression system, allowing direct mapping from inputs.

### 3) List selection (FileTabs, NavigationMenu, TreeListPanel)
**Bindings:** selection ID stored in state, `onClick` mapped to `set-value` with a static or computed value.

```json
{
  "id": "file-tabs",
  "type": "FileTabs",
  "bindings": {
    "files": { "source": "editor", "path": "openFiles" },
    "activeFileId": { "source": "editor", "path": "activeFileId" }
  },
  "events": {
    "onFileSelect": {
      "actions": [
        {
          "id": "select-file",
          "type": "set-value",
          "target": "editor.activeFileId",
          "expression": "event"
        }
      ]
    },
    "onFileClose": {
      "actions": [
        {
          "id": "close-file",
          "type": "custom",
          "params": { "fileId": "event" }
        }
      ]
    }
  }
}
```

**Why:** selection changes are simple state updates. More complex close behavior can map to a `custom` action if it needs side effects.

### 4) Toolbar and button actions (ActionBar, ToolbarActions, EditorActions)
**Bindings:** each `onClick` maps to a JSON action list.

```json
{
  "id": "schema-toolbar",
  "type": "SchemaEditorToolbar",
  "events": {
    "onImport": { "actions": [{ "id": "import-json", "type": "custom" }] },
    "onExport": { "actions": [{ "id": "export-json", "type": "custom" }] },
    "onCopy": { "actions": [{ "id": "copy-json", "type": "custom" }] },
    "onPreview": { "actions": [{ "id": "open-preview", "type": "open-dialog", "target": "uiState", "path": "preview" }] },
    "onClear": { "actions": [{ "id": "clear-schema", "type": "set-value", "target": "schema.components", "value": [] }] }
  }
}
```

**Why:** these are pure event triggers; `custom` actions cover app-specific flows that aren’t part of the built-in action types.

**Dialog storage convention:** `open-dialog`/`close-dialog` actions store booleans in `uiState.dialogs.<dialogId>`. Use `target` for the data source (typically `uiState`) and `path` for the dialog id.

### 5) Drag-and-drop/hover state (CanvasRenderer, ComponentTree)
**Bindings:** IDs and `dropPosition` stored in data; events mapped to custom actions for editor logic.

```json
{
  "id": "canvas",
  "type": "CanvasRenderer",
  "bindings": {
    "selectedId": { "source": "editor", "path": "selectedId" },
    "hoveredId": { "source": "editor", "path": "hoveredId" },
    "draggedOverId": { "source": "editor", "path": "draggedOverId" },
    "dropPosition": { "source": "editor", "path": "dropPosition" }
  },
  "events": {
    "onSelect": { "actions": [{ "id": "select-node", "type": "set-value", "target": "editor.selectedId", "expression": "event" }] },
    "onHover": { "actions": [{ "id": "hover-node", "type": "set-value", "target": "editor.hoveredId", "expression": "event" }] },
    "onHoverEnd": { "actions": [{ "id": "clear-hover", "type": "set-value", "target": "editor.hoveredId", "value": null }] },
    "onDragOver": { "actions": [{ "id": "drag-over", "type": "custom", "params": { "targetId": "event" } }] },
    "onDrop": { "actions": [{ "id": "drop-node", "type": "custom", "params": { "targetId": "event" } }] }
  }
}
```

**Why:** drag/drop handlers need richer logic, so `custom` actions are the safest mapping until more JSON-native drag actions exist.

### 6) Data source CRUD (DataSourceManager/DataSourceCard)
**Bindings:** data sources array stored in JSON data; CRUD mapped to `create`/`update`/`delete` actions where possible.

```json
{
  "id": "data-sources",
  "type": "DataSourceManager",
  "bindings": {
    "dataSources": { "source": "schema", "path": "dataSources" }
  },
  "events": {
    "onAdd": {
      "actions": [
        {
          "id": "add-source",
          "type": "create",
          "target": "schema.dataSources",
          "valueTemplate": {
            "id": "Date.now()",
            "type": "event.type",
            "value": ""
          }
        }
      ]
    },
    "onEdit": {
      "actions": [
        { "id": "open-source-editor", "type": "open-dialog", "target": "uiState", "path": "dataSourceEditor" }
      ]
    },
    "onDelete": {
      "actions": [
        { "id": "delete-source", "type": "delete", "target": "schema.dataSources", "path": "id", "expression": "event" }
      ]
    },
    "onSave": {
      "actions": [
        { "id": "update-source", "type": "update", "target": "schema.dataSources", "expression": "event" }
      ]
    }
  }
}
```

**Why:** CRUD aligns with the action schema (`create`, `update`, `delete`) and can use expressions/value templates to shape payloads.

## Prioritized binding additions (with example schemas)

1) **Dialog visibility + save/cancel actions** (CodeExplanationDialog, ComponentBindingDialog, DataSourceEditorDialog, TreeFormDialog)
   - **Why priority:** unlocks core UI flows (open/close/save) and ties dialogs to JSON actions.
   - **Example schema:** see “Dialog open/close control” above.

2) **Input value + change events** (SearchBar, SearchInput, TreeFormDialog)
   - **Why priority:** essential for text filtering, search, and form editing in JSON-driven flows.
   - **Example schema:** see “Input value + change events.”

3) **Selection and navigation events** (FileTabs, NavigationItem/Menu, TreeListPanel, TreeCard)
   - **Why priority:** these are the primary navigation and selection surfaces in the editor UI.
   - **Example schema:** see “List selection.”

4) **Toolbar/button action wiring** (SchemaEditorToolbar, ToolbarActions, EditorActions, ActionBar)
   - **Why priority:** these buttons trigger important workflows (import/export, AI tools, preview).
   - **Example schema:** see “Toolbar and button actions.”

5) **Drag-and-drop/hover orchestration** (CanvasRenderer, ComponentTree, ComponentPalette)
   - **Why priority:** required for schema editing UI; may need `custom` actions for editor logic.
   - **Example schema:** see “Drag-and-drop/hover state.”

6) **Data source CRUD flows** (DataSourceManager, DataSourceCard)
   - **Why priority:** CRUD should map to built-in JSON actions to avoid bespoke handlers.
   - **Example schema:** see “Data source CRUD.”
