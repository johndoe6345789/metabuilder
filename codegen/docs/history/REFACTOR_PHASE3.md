# Phase 3 Refactoring: JSON-Driven Architecture & Hook Library

## Overview
This refactoring phase introduces a JSON-driven page orchestration system and comprehensive hook library to reduce component complexity and improve maintainability.

## Goals
1. **All components under 150 LOC** - Break down monolithic components
2. **Comprehensive hook library** - Extract all business logic into reusable hooks
3. **JSON-driven page orchestration** - Define pages, actions, and data flows in JSON
4. **Type-safe architecture** - Full TypeScript support for JSON schemas

## Architecture

### 1. Hook Library Structure

```
src/hooks/
├── core/                    # Core functionality
│   ├── use-clipboard.ts
│   ├── use-debounced-save.ts
│   ├── use-kv-state.ts
│   ├── use-local-storage.ts
│   └── use-persisted-state.ts
├── data/                    # Data management
│   ├── use-files.ts
│   ├── use-models.ts
│   ├── use-components.ts
│   ├── use-workflows.ts
│   ├── use-lambdas.ts
│   ├── use-tests.ts
│   └── use-project.ts
├── ui/                      # UI state management
│   ├── use-confirmation.ts
│   ├── use-dialog.ts
│   ├── use-selection.ts
│   ├── use-modal.ts
│   ├── use-tabs.ts
│   └── use-panels.ts
├── forms/                   # Form handling
│   ├── use-form-state.ts
│   ├── use-validation.ts
│   └── use-field-array.ts
├── canvas/                  # Canvas/visual editors
│   ├── use-canvas.ts
│   ├── use-drag-drop.ts
│   ├── use-zoom-pan.ts
│   └── use-connections.ts
├── ai/                      # AI operations
│   ├── use-ai-generate.ts
│   ├── use-ai-complete.ts
│   └── use-ai-suggestions.ts
└── orchestration/           # Page orchestration
    ├── use-page.ts
    ├── use-actions.ts
    └── use-json-schema.ts
```

### 2. JSON Page Schema

Each page is defined by a JSON schema that describes:
- Component tree structure
- Data sources and bindings
- Actions and event handlers
- Validation rules
- Initial/seed data

```typescript
interface PageSchema {
  id: string
  name: string
  layout: LayoutConfig
  components: ComponentSchema[]
  data: DataSourceConfig[]
  actions: ActionConfig[]
  hooks: HookConfig[]
}

interface ComponentSchema {
  id: string
  type: string
  props: Record<string, any>
  children?: ComponentSchema[]
  bindings?: DataBinding[]
  events?: EventHandler[]
}

interface ActionConfig {
  id: string
  type: 'create' | 'update' | 'delete' | 'navigate' | 'ai-generate'
  trigger: string
  params: Record<string, any>
  onSuccess?: string
  onError?: string
}
```

### 3. Component Size Limits

- **Atoms**: < 50 LOC
- **Molecules**: < 100 LOC
- **Organisms**: < 150 LOC
- **Features**: < 150 LOC (orchestrated by JSON)

## Implementation Plan

### Phase 3.1: Hook Library Expansion
- [ ] Create data management hooks (use-files, use-models, etc.)
- [ ] Create form handling hooks
- [ ] Create canvas/visual editor hooks
- [ ] Create orchestration hooks

### Phase 3.2: JSON Schema System
- [ ] Define TypeScript interfaces for page schemas
- [ ] Create schema validator
- [ ] Build page renderer from JSON
- [ ] Create schema builder UI

### Phase 3.3: Component Breakdown
- [ ] Split FeatureIdeaCloud (currently 500+ LOC)
- [ ] Split ModelDesigner
- [ ] Split WorkflowDesigner
- [ ] Split ComponentTreeManager

### Phase 3.4: Page Definitions
- [ ] Convert dashboard to JSON
- [ ] Convert code editor to JSON
- [ ] Convert model designer to JSON
- [ ] Convert all feature pages to JSON

## Benefits

1. **Maintainability**: Smaller components are easier to test and modify
2. **Reusability**: Hooks can be used across multiple components
3. **Flexibility**: Pages can be modified without code changes
4. **Type Safety**: Full TypeScript support for schemas
5. **Testing**: Hooks and small components are easier to unit test
6. **Documentation**: JSON schemas serve as living documentation

## Migration Strategy

1. Start with new features using JSON orchestration
2. Gradually refactor existing features
3. Keep old code working during transition
4. Add feature flags for rollout control

## Next Steps

1. Review and approve this plan
2. Implement hook library (Phase 3.1)
3. Build JSON orchestration system (Phase 3.2)
4. Begin component refactoring (Phase 3.3)
