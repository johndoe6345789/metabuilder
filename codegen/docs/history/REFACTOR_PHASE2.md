# Phase 2 Refactoring Plan: Hooks, Components & JSON Orchestration

## Goals
1. **All components <150 LOC** - Break down large feature components into composable pieces
2. **Comprehensive Hook Library** - Extract all business logic into reusable hooks
3. **JSON-Based Page Orchestration** - Define page layouts and feature configurations in JSON, loaded from database
4. **Database-Driven UI** - Store UI configurations, feature flags, and layouts in KV store

## Hook Library Architecture

### Core Hooks (`/src/hooks/core/`)
- `use-kv-state.ts` - Enhanced KV wrapper with validation
- `use-debounced-save.ts` - Debounced auto-save to KV
- `use-undo-redo.ts` - Undo/redo state management
- `use-clipboard.ts` - Copy/paste operations
- `use-hotkeys.ts` - Keyboard shortcut management

### Feature Hooks (`/src/hooks/features/`)
- `use-file-manager.ts` - File CRUD operations
- `use-model-manager.ts` - Prisma model operations
- `use-component-manager.ts` - Component tree operations
- `use-workflow-manager.ts` - Workflow node operations
- `use-lambda-manager.ts` - Lambda function operations
- `use-test-manager.ts` - Test suite operations
- `use-theme-manager.ts` - Theme variant operations
- `use-project-manager.ts` - Project save/load/export
- `use-idea-manager.ts` - Feature idea cloud operations
- `use-connection-manager.ts` - Idea connections (1:1 mapping)

### AI Hooks (`/src/hooks/ai/`)
- `use-ai-generation.ts` - Generic AI generation
- `use-ai-code-improvement.ts` - Code enhancement
- `use-ai-explanation.ts` - Code explanation
- `use-ai-test-generation.ts` - Test generation
- `use-ai-model-suggestion.ts` - Model field suggestions

### UI Hooks (`/src/hooks/ui/`)
- `use-dialog.ts` - Dialog state management
- `use-toast.ts` - Toast notifications wrapper
- `use-confirmation.ts` - Confirmation dialogs
- `use-selection.ts` - Multi-select state
- `use-drag-drop.ts` - Drag and drop operations
- `use-canvas-drawing.ts` - Canvas drawing tools
- `use-zoom-pan.ts` - Canvas zoom/pan

### Validation Hooks (`/src/hooks/validation/`)
- `use-form-validation.ts` - Form validation
- `use-code-validation.ts` - Code syntax validation
- `use-schema-validation.ts` - Schema validation

## Component Size Breakdown

### Large Components to Split (Current → Target LOC)

#### FeatureIdeaCloud.tsx (829 LOC → <150 each)
Split into:
- `IdeaCanvas.tsx` (80 LOC) - Canvas rendering
- `IdeaCard.tsx` (70 LOC) - Individual idea node
- `IdeaConnection.tsx` (60 LOC) - Arrow rendering
- `IdeaToolbar.tsx` (50 LOC) - Tool controls
- `IdeaColorPicker.tsx` (40 LOC) - Color selection
- `IdeaGroupBoundary.tsx` (60 LOC) - Group container

#### App.tsx (828 LOC → <150 each)
Split into:
- `AppShell.tsx` (100 LOC) - Main layout
- `PageRouter.tsx` (80 LOC) - Tab routing logic
- `ExportDialog.tsx` (120 LOC) - Export functionality
- Hooks: `use-app-state.ts`, `use-export.ts`

#### CodeEditor.tsx (~400 LOC → <150 each)
Split into:
- `EditorTabs.tsx` (80 LOC) - Tab bar
- `EditorMonaco.tsx` (100 LOC) - Monaco wrapper
- `EditorToolbar.tsx` (60 LOC) - Action buttons
- `EditorAIPanel.tsx` (90 LOC) - AI features

#### ModelDesigner.tsx (~350 LOC → <150 each)
Split into:
- `ModelList.tsx` (80 LOC) - Model list
- `ModelEditor.tsx` (120 LOC) - Field editor
- `ModelGraph.tsx` (90 LOC) - Visual graph

#### WorkflowDesigner.tsx (~500 LOC → <150 each)
Split into:
- `WorkflowCanvas.tsx` (120 LOC) - React Flow canvas
- `WorkflowNodePalette.tsx` (70 LOC) - Node types
- `WorkflowNodeEditor.tsx` (100 LOC) - Node config
- `WorkflowToolbar.tsx` (60 LOC) - Toolbar

## JSON-Based Page Orchestration

### Page Configuration Schema

```typescript
interface PageConfig {
  id: string
  title: string
  description: string
  icon: string
  component: string
  layout: LayoutConfig
  features: FeatureConfig[]
  permissions?: string[]
  shortcuts?: KeyboardShortcut[]
}

interface LayoutConfig {
  type: 'single' | 'split' | 'grid' | 'tabs'
  panels?: PanelConfig[]
  direction?: 'horizontal' | 'vertical'
  defaultSizes?: number[]
}

interface PanelConfig {
  id: string
  component: string
  props?: Record<string, any>
  minSize?: number
  maxSize?: number
}

interface FeatureConfig {
  id: string
  enabled: boolean
  config?: Record<string, any>
}
```

### Example Page Definitions

```json
{
  "pages": [
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
        { "id": "ai-explain", "enabled": true },
        { "id": "syntax-validation", "enabled": true }
      ],
      "shortcuts": [
        { "key": "2", "ctrl": true, "action": "navigate" }
      ]
    },
    {
      "id": "idea-cloud",
      "title": "Feature Ideas",
      "description": "Brainstorm and connect ideas",
      "icon": "Lightbulb",
      "component": "IdeaCloudPage",
      "layout": {
        "type": "single"
      },
      "features": [
        { "id": "connections", "enabled": true },
        { "id": "groups", "enabled": true },
        { "id": "colors", "enabled": true }
      ]
    }
  ]
}
```

## Database-Driven UI

### KV Store Structure

```
ui-config:{page-id} → PageConfig
feature-toggles:{feature-id} → boolean
layout-state:{page-id} → LayoutState
user-preferences → UserPreferences
```

### Implementation Files

```
/src/config/
  ├── page-registry.ts       # Component name → React component mapping
  ├── default-pages.json     # Default page configurations
  └── page-schema.ts         # Zod schemas for validation

/src/hooks/config/
  ├── use-page-config.ts     # Load page config from KV
  ├── use-layout-state.ts    # Persist layout state
  └── use-feature-flags.ts   # Feature flag management

/src/components/layout/
  ├── PageOrchestrator.tsx   # Renders pages from JSON config
  ├── DynamicLayout.tsx      # Renders layouts from config
  └── DynamicPanel.tsx       # Renders panels from config
```

## Migration Strategy

### Phase 2.1: Hook Extraction (Week 1)
1. Create hook library structure
2. Extract business logic from top 5 largest components
3. Add comprehensive tests for hooks
4. Update components to use hooks

### Phase 2.2: Component Splitting (Week 2)
1. Split FeatureIdeaCloud into 6 components
2. Split App.tsx into 3 components + hooks
3. Split CodeEditor into 4 components
4. Ensure all new components <150 LOC

### Phase 2.3: JSON Orchestration (Week 3)
1. Create page config schema and defaults
2. Build PageOrchestrator and DynamicLayout
3. Create component registry
4. Migrate 3 pages to JSON config

### Phase 2.4: Database Integration (Week 4)
1. Store page configs in KV
2. Add UI for editing page layouts
3. Feature flag management UI
4. User preference persistence

## Success Criteria

- [ ] All components <150 LOC
- [ ] 30+ hooks in organized library
- [ ] 5+ pages driven by JSON config
- [ ] Page configs stored in KV database
- [ ] Zero business logic in components (all in hooks)
- [ ] All tests passing
- [ ] Documentation for hook library
- [ ] Migration guide for developers

## Benefits

1. **Maintainability**: Smaller components easier to understand and modify
2. **Reusability**: Hooks can be used across multiple components
3. **Testability**: Hooks and small components easier to test in isolation
4. **Flexibility**: JSON configs allow runtime UI changes without code deploys
5. **Scalability**: Easy to add new pages/features via JSON
6. **Safety**: Smaller changes reduce risk of breaking existing features
