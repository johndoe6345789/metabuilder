# JSON-Driven Pages Conversion

## Overview
Converted three complex pages (Models, Component Trees, and Workflows) from traditional React component implementations to JSON-driven configuration. This demonstrates the power and flexibility of the JSON-driven UI system.

## Converted Pages

### 1. Models Designer (JSON)
**File**: `/src/config/pages/model-designer.json`
**Component**: `JSONModelDesigner.tsx`

**Features**:
- KV-persisted model data (`app-models`)
- Computed values for selected model and model count
- Sidebar with model list and create button
- Empty state with call-to-action
- Main editor area with conditional rendering
- Fully reactive state management

**Data Sources**:
- `models` (KV) - Persistent model storage
- `selectedModelId` (static) - Currently selected model
- `selectedModel` (computed) - Derived from models + selectedModelId
- `modelCount` (computed) - Total number of models

### 2. Component Trees Manager (JSON)
**File**: `/src/config/pages/component-tree.json`
**Component**: `JSONComponentTreeManager.tsx`

**Features**:
- KV-persisted component tree data (`app-component-trees`)
- Tree selection and navigation
- Hierarchical component structure display
- Create/edit/delete operations
- Badge showing tree count
- Empty state with guided onboarding

**Data Sources**:
- `trees` (KV) - Persistent tree storage
- `selectedTreeId` (static) - Current tree selection
- `selectedTree` (computed) - Derived tree data
- `treeCount` (computed) - Total tree count

### 3. Workflows Designer (JSON)
**File**: `/src/config/pages/workflow-designer.json`
**Component**: `JSONWorkflowDesigner.tsx`

**Features**:
- KV-persisted workflow data (`app-workflows`)
- Status filtering (all, success, failed, running)
- Node and connection management
- Visual workflow canvas
- Status-based badges and counts
- Multi-state workflow support

**Data Sources**:
- `workflows` (KV) - Persistent workflow storage
- `selectedWorkflowId` (static) - Current workflow
- `statusFilter` (static) - Filter state
- `selectedWorkflow` (computed) - Current workflow data
- `filteredWorkflows` (computed) - Filtered by status
- `statusCounts` (computed) - Counts per status

## Architecture Benefits

### Declarative Configuration
- UI structure defined in JSON, not JSX
- Easy to understand page structure at a glance
- Non-developers can read and potentially modify schemas

### Reactive Data Flow
- Computed values automatically update when dependencies change
- KV storage ensures data persistence between sessions
- No manual useState/useEffect boilerplate needed

### Consistent Patterns
- All three pages follow the same structural pattern:
  - Sidebar with list and actions
  - Main content area with conditional rendering
  - Empty states with CTAs
  - KV-backed data persistence
  - Computed derived values

### Maintainability
- Centralized component definitions
- Separation of data, structure, and behavior
- Easy to add new pages following the same pattern
- Version control friendly (JSON diffs are clear)

## Implementation Details

### Page Structure Pattern
```json
{
  "dataSources": [
    { "type": "kv", "key": "...", "defaultValue": [...] },
    { "type": "static", "defaultValue": null },
    { "type": "computed", "compute": "...", "dependencies": [...] }
  ],
  "components": [
    {
      "type": "div",
      "props": { "className": "..." },
      "children": [
        {
          "type": "Component",
          "bindings": { "prop": { "source": "...", "path": "..." } },
          "events": [
            {
              "event": "click",
              "actions": [
                { "type": "set-value", "target": "selectedId", "expression": "event" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### Action & Conditional Syntax
- Use supported JSON UI action types (for example, `set-value`, `toggle-value`, `show-toast`) with `target`, `path`, `value`, or `expression` fields instead of legacy `setState` actions.
- Replace legacy conditional objects (`{ "source": "...", "operator": "eq|gt|truthy|falsy", "value": ... }`) with `conditional.if` expressions:

```json
{
  "conditional": {
    "if": "modelCount === 0"
  }
}
```

### Component Registry Integration
All JSON page wrappers are registered in `component-registry.ts`:
- `JSONModelDesigner`
- `JSONComponentTreeManager`
- `JSONWorkflowDesigner`

### Page Configuration
Added to `pages.json` with feature toggle support:
- `models-json` (toggle: `modelsJSON`)
- `component-trees-json` (toggle: `componentTreesJSON`)
- `workflows-json` (toggle: `workflowsJSON`)

### Seed Data
Created realistic seed data for all three pages:
- **Models**: User, Post, Comment models with fields
- **Component Trees**: Dashboard and Profile layouts
- **Workflows**: Registration, Data Processing, Payment flows

## Usage

### Enabling JSON Pages
Toggle the JSON versions on/off via the Features page:
- Enable "Models (JSON)" toggle
- Enable "Component Trees (JSON)" toggle  
- Enable "Workflows (JSON)" toggle

### Comparing Implementations
Both traditional and JSON versions are available:
- Traditional: `models`, `component-trees`, `workflows`
- JSON: `models-json`, `component-trees-json`, `workflows-json`

This allows side-by-side comparison of approaches.

## Next Steps

### Short Term
1. Add dialog implementations for create/edit operations
2. Implement list rendering for dynamic items
3. Add action handlers for CRUD operations
4. Wire up delete and duplicate functionality

### Medium Term
1. Build visual schema editor for creating JSON configs
2. Add validation and error handling to schemas
3. Create library of common page patterns
4. Add schema versioning and migration support

### Long Term
1. Enable live schema editing in production
2. Build marketplace for shareable page schemas
3. Add AI-powered schema generation
4. Create visual debugging tools for JSON pages
