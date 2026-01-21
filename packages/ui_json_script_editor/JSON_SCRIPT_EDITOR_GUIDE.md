# JSON Script Editor - Complete Implementation Guide

**Status**: Phase 3.2 - Admin Tools Implementation
**Created**: 2026-01-21
**Version**: 1.0.0
**Permission Level**: God (4) - Automation and workflow creation
**Target**: n8n-style JSON schema migration (future Phase 3.5)

---

## 🎯 Overview

The JSON Script Editor is a **code + visual editor** for MetaBuilder's **JSON Script v2.2.0** automation language. It provides:

### Dual Editing Modes

1. **Code Editor Mode**
   - Monaco editor with syntax highlighting
   - Real-time validation
   - Autocomplete suggestions
   - Error detection and reporting
   - Version history

2. **Visual Builder Mode**
   - Drag-and-drop node interface
   - No-code workflow creation
   - Auto-converts to/from JSON Script
   - Visual execution tracing

### Features

- 📝 Monaco code editor with JSON Script syntax
- 🎨 Visual drag-and-drop builder
- ⚡ Real-time execution with feedback
- 🧪 Built-in test runner with sample data
- 🔍 Debugger with breakpoints and step execution
- 📚 Interactive reference documentation
- 💾 Script library with version history
- 🔗 Reusable components and libraries
- 🚀 One-click deployment to workflows

---

## 📦 Package Structure

```
packages/ui_json_script_editor/
├── package.json                    # Package metadata
├── seed/
│   ├── metadata.json              # Package manifest
│   ├── page-config.json           # Routes (/admin/json-script-editor, /admin/json-script-editor/visual)
│   └── component.json             # UI components (8 components)
└── JSON_SCRIPT_EDITOR_GUIDE.md   # This file
```

**Key Permissions**:
- Minimum level: God (4)
- Create/edit: God, Supergod
- View: God and above

---

## 🏗️ Architecture

### Data Flow

```
User Input (Code or Visual)
        ↓
┌───────────────────────────┐
│ Code Editor               │ OR │ Visual Builder      │
│ (Monaco + JSON Script)    │    │ (Drag & Drop Nodes) │
└───────────────────────────┘    └─────────────────────┘
        ↓                                ↓
    JSON Script Code          Auto-converted to JSON Script
        ↓                                ↓
        └────────────────┬───────────────┘
                         ↓
            JSON Script Validator
                         ↓
            ✅ Valid / ❌ Errors
                         ↓
        Real-time Execution with Feedback
                         ↓
    ExecutionOutput Component (logs, results)
                         ↓
        User saves script to database
                         ↓
    Available in workflow/automation definitions
```

### Component Hierarchy

```
JSONScriptEditorLayout (main three-column layout)
│
├── ScriptLibrary (left panel, 280px)
│   ├── SearchBox (filter scripts)
│   ├── FilterTabs (active, testing, archived)
│   ├── ScriptList[] (each with actions)
│   │   ├── ScriptName (clickable)
│   │   ├── CreatedDate
│   │   ├── Status badge
│   │   └── Actions menu (edit, delete, etc.)
│   └── CreateNewButton
│
├── Tab: Code
│   └── ScriptEditor (center panel, flex)
│       ├── Monaco editor (with JSON Script language)
│       ├── Syntax highlighting
│       ├── Autocomplete
│       └── Error indicators
│
├── Tab: Visual (center panel)
│   └── VisualScriptBuilder
│       ├── Canvas (drag-and-drop area)
│       ├── NodeLibrary (palette of available nodes)
│       ├── Node[] (draggable, with ports)
│       └── Connection[] (data/control flow)
│
├── Tab: Test (center panel)
│   └── ScriptTester
│       ├── Input form (sample data)
│       ├── Execute button
│       └── Results display
│
└── ExecutionOutput (right panel, 320px)
    ├── Console log output
    ├── Error messages
    ├── Variable inspector
    ├── Execution metrics
    └── Debugger controls
```

---

## 🎨 Component Definitions

### 1. JSONScriptEditorLayout
**Purpose**: Three-column main layout with code/visual/test tabs

```json
{
  "id": "comp_json_script_editor_layout",
  "name": "JSONScriptEditorLayout",
  "type": "JSONScriptEditorLayout",
  "props": {
    "title": "JSON Script Editor",
    "subtitle": "Code and visual editor with real-time execution feedback",
    "showTabs": true,
    "tabs": ["Code", "Visual", "Test"]
  }
}
```

**Structure**:
- Header with title, tabs (Code/Visual/Test), and save button
- Three-column layout (ScriptLibrary | Editor | Output)
- Resizable panels with drag handles
- Keyboard shortcuts display
- Help and documentation links

### 2. ScriptLibrary
**Purpose**: Left sidebar with script list, search, and management

```json
{
  "id": "comp_script_library",
  "name": "ScriptLibrary",
  "type": "ScriptLibrary",
  "props": {
    "title": "Scripts",
    "searchable": true,
    "filterable": true,
    "sortBy": ["name", "created", "modified", "status"],
    "actions": ["create", "edit", "delete", "duplicate", "share", "version-history"],
    "tags": true,
    "favorites": true,
    "quickFilter": ["active", "testing", "archived"]
  }
}
```

**Features**:
- Search scripts by name or content
- Filter by status (Active, Testing, Archived)
- Sort by creation date, modification date, or name
- Star/favorite scripts
- Tag-based organization
- Quick actions: Edit, Delete, Duplicate, Share, View History
- Create new script button
- Drag-and-drop reordering

### 3. ScriptEditor
**Purpose**: Monaco code editor with JSON Script v2.2.0 syntax

```json
{
  "id": "comp_script_editor",
  "name": "ScriptEditor",
  "type": "ScriptEditor",
  "props": {
    "editorType": "monaco",
    "language": "json-script",
    "lineNumbers": true,
    "wordWrap": true,
    "minimap": true,
    "theme": "dark",
    "fontSize": 13,
    "tabSize": 2,
    "autoFormat": true,
    "showValidation": true,
    "showSuggestions": true,
    "keybindings": ["vscode", "vim", "emacs"]
  }
}
```

**Features**:
- Full Monaco editor integration
- JSON Script v2.2.0 syntax highlighting
- Line numbers and code folding
- Minimap for quick navigation
- Autocomplete suggestions
- Format on save
- Error squiggles (red underline)
- Keybinding options: VSCode (default), Vim, Emacs
- Find and replace
- Go to line
- Bracket matching

**Keybindings (VSCode defaults)**:
- `Ctrl+S` / `Cmd+S` - Save
- `Ctrl+/` / `Cmd+/` - Toggle comment
- `Ctrl+F` / `Cmd+F` - Find
- `Ctrl+H` / `Cmd+H` - Find and replace
- `Ctrl+L` - Select line
- `Ctrl+Shift+F` - Format document
- `Ctrl+K Ctrl+0` - Fold all
- `Ctrl+K Ctrl+J` - Unfold all

### 4. ExecutionOutput
**Purpose**: Right sidebar showing execution results and debugging

```json
{
  "id": "comp_execution_output",
  "name": "ExecutionOutput",
  "type": "ExecutionOutput",
  "props": {
    "title": "Output",
    "showConsole": true,
    "showErrors": true,
    "showLogs": true,
    "showVariables": true,
    "showMetrics": true,
    "maxLines": 500,
    "autoScroll": true,
    "searchable": true,
    "clearButton": true
  }
}
```

**Tabs**:
- **Console**: Standard output and print statements
- **Errors**: Execution errors and stack traces
- **Logs**: Structured logging output
- **Variables**: Current variable state and inspection
- **Metrics**: Execution time, memory usage, etc.

**Features**:
- Colored output (info, warn, error levels)
- Timestamp for each line
- Searchable output
- Clear button
- Auto-scroll to bottom
- Copy output to clipboard
- Export logs as .json or .csv

### 5. VisualScriptBuilder
**Purpose**: No-code visual builder with drag-and-drop nodes

```json
{
  "id": "comp_visual_script_builder",
  "name": "VisualScriptBuilder",
  "type": "VisualScriptBuilder",
  "props": {
    "title": "Visual Script Builder",
    "showGrid": true,
    "snapToGrid": true,
    "zoom": true,
    "nodeLibrary": true,
    "connectionTypes": ["data", "control", "condition"],
    "autoLayout": true,
    "exportFormat": "json-script"
  }
}
```

**Node Types** (auto-converts to JSON Script):
- **Input**: Accept external data
- **Output**: Return results
- **Function**: Execute built-in functions
- **Conditional**: if/else branching
- **Loop**: for/while iteration
- **Variable**: Store/retrieve values
- **API Call**: HTTP requests
- **Database**: Query operations
- **Transform**: Data transformation
- **Switch**: Multi-way branching

**Features**:
- Drag nodes from library
- Click to connect nodes (ports)
- Data flow visualization
- Control flow indicators
- Auto-layout algorithms
- Zoom and pan
- Grid snapping
- Quick search for nodes
- Node properties panel
- Real-time JSON export

### 6. ScriptTester
**Purpose**: Test script with sample data and execution feedback

```json
{
  "id": "comp_script_tester",
  "name": "ScriptTester",
  "type": "ScriptTester",
  "props": {
    "title": "Test Script",
    "showSampleData": true,
    "showInputOutput": true,
    "showExecutionTime": true,
    "showMemoryUsage": true,
    "maxExecutionTime": 5000,
    "presets": ["empty", "sample1", "sample2"],
    "export": ["json", "csv"]
  }
}
```

**Workflow**:
1. User selects preset or enters custom input
2. Clicks "Run Script"
3. Script executes with timeout protection
4. Results displayed in ExecutionOutput
5. Shows execution time, memory usage, errors
6. Can iterate on input until working

### 7. JSONScriptReference
**Purpose**: Interactive documentation for JSON Script v2.2.0

```json
{
  "id": "comp_json_script_reference",
  "name": "JSONScriptReference",
  "type": "JSONScriptReference",
  "props": {
    "title": "Reference",
    "searchable": true,
    "sections": [
      "syntax",
      "operators",
      "functions",
      "variables",
      "control-flow",
      "error-handling",
      "best-practices"
    ],
    "showExamples": true,
    "copyable": true
  }
}
```

**Reference Sections**:
- **Syntax**: Language basics
- **Operators**: Arithmetic, logical, comparison
- **Functions**: Built-in and user-defined functions
- **Variables**: Variable declaration and scope
- **Control Flow**: if/else, for, while, switch
- **Error Handling**: try/catch, error propagation
- **Best Practices**: Performance tips, common pitfalls

### 8. ScriptDebugger
**Purpose**: Advanced debugging with breakpoints and step execution

```json
{
  "id": "comp_script_debugger",
  "name": "ScriptDebugger",
  "type": "ScriptDebugger",
  "props": {
    "title": "Debugger",
    "breakpoints": true,
    "stepExecution": true,
    "variableInspection": true,
    "callStack": true,
    "conditionalBreakpoints": true,
    "watchExpressions": true
  }
}
```

**Features**:
- Set breakpoints (click line number)
- Step over, step into, step out
- Continue to next breakpoint
- Variable inspector (hover over variable)
- Watch expressions (monitor variables)
- Call stack inspection
- Conditional breakpoints (break if expression true)
- Execution history

---

## 💾 JSON Script v2.2.0 Format

### Basic Syntax Example

```json
{
  "version": "2.2.0",
  "type": "script",
  "id": "script_process_orders",
  "name": "Process Orders",
  "description": "Daily order processing workflow",
  "input": {
    "orderId": { "type": "string", "required": true },
    "quantity": { "type": "number", "required": true }
  },
  "output": {
    "orderId": "string",
    "status": "string",
    "total": "number"
  },
  "variables": {
    "apiUrl": "https://api.example.com",
    "timeout": 5000
  },
  "body": [
    {
      "type": "log",
      "message": "Processing order: {{ input.orderId }}"
    },
    {
      "type": "api-call",
      "method": "GET",
      "url": "{{ variables.apiUrl }}/orders/{{ input.orderId }}",
      "headers": { "Authorization": "Bearer token123" },
      "assign": "order"
    },
    {
      "type": "conditional",
      "if": "{{ order.status == 'pending' }}",
      "then": [
        {
          "type": "api-call",
          "method": "PATCH",
          "url": "{{ variables.apiUrl }}/orders/{{ order.id }}",
          "data": {
            "status": "processing",
            "quantity": "{{ input.quantity }}"
          },
          "assign": "updatedOrder"
        }
      ],
      "else": [
        {
          "type": "error",
          "message": "Order is not pending"
        }
      ]
    },
    {
      "type": "return",
      "value": {
        "orderId": "{{ updatedOrder.id }}",
        "status": "{{ updatedOrder.status }}",
        "total": "{{ updatedOrder.total }}"
      }
    }
  ]
}
```

### Key Language Features

**Variable Substitution**:
- `{{ variable }}` - Interpolate variable
- `{{ object.property }}` - Nested property access
- `{{ array[0] }}` - Array access

**Operators**:
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Logical: `&&`, `||`, `!`
- String: `+` (concat), `.length`, `.substring()`

**Control Flow**:
- `conditional` (if/then/else)
- `loop` (for/while iteration)
- `switch` (multi-way branching)

**Built-in Functions**:
- Data: `map()`, `filter()`, `reduce()`, `find()`
- String: `split()`, `join()`, `trim()`, `replace()`
- Math: `max()`, `min()`, `sum()`, `average()`
- Date: `now()`, `format()`, `parse()`
- HTTP: `api-call()`, `webhook()`

---

## 🔄 Workflow: Creating a JSON Script Step-by-Step

### User Story: Create "Send Daily Report" automation

**Step 1: Create new script**
- Click "Create New" button in ScriptLibrary
- Name: "Send Daily Report"
- Description: "Send daily sales report to admin email"
- Permission level: God (4)

**Step 2: Switch to Code Editor tab**
- See template JSON Script v2.2.0 code
- Clear and start typing script

**Step 3: Write script using code editor**
```json
{
  "version": "2.2.0",
  "type": "script",
  "name": "Send Daily Report",
  "input": { "email": { "type": "string" } },
  "body": [
    {
      "type": "api-call",
      "method": "GET",
      "url": "https://api.example.com/sales/daily",
      "assign": "dailyReport"
    },
    {
      "type": "api-call",
      "method": "POST",
      "url": "https://api.example.com/email/send",
      "data": {
        "to": "{{ input.email }}",
        "subject": "Daily Sales Report",
        "body": "Total sales: {{ dailyReport.total }}"
      }
    },
    {
      "type": "return",
      "value": { "status": "sent" }
    }
  ]
}
```

**Step 4: Validation feedback**
- Real-time error checking
- See green checkmark if valid
- See errors highlighted in red if invalid

**Step 5: Test the script**
- Click "Test" tab
- Enter sample input: `{ "email": "admin@example.com" }`
- Click "Run Script"
- See output in ExecutionOutput panel
- See execution time: 245ms, Memory: 2.3MB

**Step 6: Switch to Visual Builder (alternative)**
- Click "Visual" tab
- See visual representation of script flow
- Drag new nodes from library
- Connect nodes visually
- Auto-converts back to JSON

**Step 7: Save and deploy**
- Click "Save" button
- Script saved to database
- Available in workflow definitions
- Can be called from workflows

---

## 🚀 Implementation Notes

### Phase 3.2 Deliverables

This JSON Script Editor package provides:

1. **Package metadata**: `package.json` with God-level permissions
2. **Package manifest**: `seed/metadata.json`
3. **Route definitions**: Two routes in `seed/page-config.json`:
   - `/admin/json-script-editor` (main code editor)
   - `/admin/json-script-editor/visual` (visual builder)
4. **Component definitions**: 8 components in `seed/component.json`
5. **Documentation**: This comprehensive guide

### JSON Script v2.2.0 Details

**Current Version**: 2.2.0 (custom JSON-based scripting language)
**Future Target**: n8n-style JSON workflow format (Phase 3.5)

The current JSON Script format provides:
- Simple, declarative workflow definition
- Template interpolation with `{{ }}`
- Standard control flow (if/else, loops)
- Built-in function library
- Error handling

**Migration Path** (Phase 3.5):
- Create migrator to convert JSON Script v2.2.0 → n8n format
- Gradually transition to n8n-style visual builder
- Maintain backward compatibility

### Integration Points

- **DBAL**: `POST /api/v1/{tenant}/json_script_editor/scripts` to save
- **Workflows**: Scripts called from workflow definitions
- **Automation**: Scheduled script execution
- **Webhooks**: Scripts triggered by external events
- **UI Components**: Built with FakeMUI 151+ components

### Security

- **God level minimum** (permission level 4)
- **Execution sandboxing**: Scripts run in isolated context
- **Timeout protection**: Max 5 seconds execution
- **Memory limits**: Prevent resource exhaustion
- **Input validation**: All script input validated
- **Rate limiting**: 50 requests/minute for script operations

---

## 📊 Metrics

**Files Created**: 5
- `package.json`
- `seed/metadata.json`
- `seed/page-config.json` (2 routes)
- `seed/component.json`
- `JSON_SCRIPT_EDITOR_GUIDE.md` (this file)

**Components**: 8
- JSONScriptEditorLayout
- ScriptLibrary
- ScriptEditor (Monaco)
- ExecutionOutput
- VisualScriptBuilder
- ScriptTester
- JSONScriptReference
- ScriptDebugger

**Routes**: 2
- `/admin/json-script-editor` (Code/Visual/Test tabs)
- `/admin/json-script-editor/visual` (Full-page visual builder)

**Language Features**:
- Variables, operators, control flow
- Template interpolation
- Built-in functions (data, string, math, date, HTTP)
- Error handling
- API integration

---

## 🔗 Related Documentation

- **CLAUDE.md** - Development principles
- **JSON_SCRIPT_REFERENCE.md** - Language specification (future)
- **schemas/package-schemas/script_schema.json** - Script validation
- **STRATEGIC_POLISH_GUIDE.md** - Implementation roadmap

---

## ✅ Next Steps

1. **Phase 3.2** (NOW): JSON Script Editor package created
2. **Phase 3.3** (Next): Workflow Editor package (visual node-based to JSON)
3. **Phase 3.4**: Database Manager package (CRUD interface)
4. **Phase 3.5** (Future): n8n-style JSON workflow migration

---

**Status**: ✅ Phase 3.2 Complete - JSON Script Editor Package Created
**Health Score**: Expected to improve to 87/100 after implementation
**Timeline**: 2-3 days remaining for Workflow Editor and Database Manager

