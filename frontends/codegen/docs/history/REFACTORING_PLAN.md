# Comprehensive Refactoring Plan

## Overview
CodeForge has grown to include 44 iterations of features, resulting in component files exceeding 150 LOC and duplicated logic. This plan establishes a systematic refactoring approach to create a maintainable, scalable architecture.

## Goals
1. ✅ All components < 150 LOC
2. ✅ Custom hooks library for shared logic
3. ✅ JSON-driven page orchestration
4. ✅ Atomic component design pattern
5. ✅ Type-safe architecture
6. ✅ Zero breaking changes to existing features

## Phase 1: Hook Extraction Library

### Core Hooks to Extract
- `use-feature-ideas.ts` - Feature idea CRUD + state management
- `use-idea-connections.ts` - Edge/connection validation & 1:1 mapping
- `use-reactflow-integration.ts` - ReactFlow nodes/edges state
- `use-idea-groups.ts` - Group management logic
- `use-ai-generation.ts` - AI-powered generation
- `use-form-dialog.ts` - Generic form dialog state
- `use-node-positions.ts` - Node position persistence

### Hook Organization
```
src/hooks/
├── feature-ideas/
│   ├── use-feature-ideas.ts
│   ├── use-idea-connections.ts
│   ├── use-idea-groups.ts
│   └── index.ts
├── reactflow/
│   ├── use-reactflow-integration.ts
│   ├── use-node-positions.ts
│   ├── use-connection-validation.ts
│   └── index.ts
├── dialogs/
│   ├── use-form-dialog.ts
│   ├── use-confirmation-dialog.ts
│   └── index.ts
└── ai/
    ├── use-ai-generation.ts
    ├── use-ai-suggestions.ts
    └── index.ts
```

## Phase 2: Atomic Component Breakdown

### FeatureIdeaCloud Component Tree
Current: 1555 LOC → Target: Multiple components < 150 LOC each

```
FeatureIdeaCloud/ (orchestrator - 80 LOC)
├── nodes/
│   ├── IdeaNode.tsx (120 LOC)
│   ├── GroupNode.tsx (80 LOC)
│   └── NodeHandles.tsx (60 LOC)
├── dialogs/
│   ├── IdeaEditDialog.tsx (140 LOC)
│   ├── IdeaViewDialog.tsx (100 LOC)
│   ├── GroupEditDialog.tsx (120 LOC)
│   ├── EdgeEditDialog.tsx (90 LOC)
│   └── DebugPanel.tsx (140 LOC)
├── panels/
│   ├── ToolbarPanel.tsx (80 LOC)
│   ├── HelpPanel.tsx (60 LOC)
│   └── DebugPanel.tsx (moved above)
└── utils/
    ├── connection-validator.ts (100 LOC)
    └── constants.ts (50 LOC)
```

## Phase 3: JSON Page Configuration

### Configuration Format
```json
{
  "pages": [
    {
      "id": "dashboard",
      "title": "Dashboard",
      "icon": "ChartBar",
      "component": "ProjectDashboard",
      "enabled": true,
      "shortcut": "ctrl+1"
    },
    {
      "id": "ideas",
      "title": "Feature Ideas",
      "icon": "Lightbulb",
      "component": "FeatureIdeaCloud",
      "enabled": true,
      "toggleKey": "ideaCloud",
      "shortcut": "ctrl+i"
    }
  ]
}
```

### Page Orchestrator
```typescript
// src/config/pages.json - Configuration
// src/lib/page-loader.ts - Dynamic loader
// src/components/PageOrchestrator.tsx - Runtime renderer
```

## Phase 4: Component Size Audit

### Components Requiring Refactoring
1. **FeatureIdeaCloud.tsx** - 1555 LOC → 8 components
2. **App.tsx** - 826 LOC → Split orchestration
3. **CodeEditor.tsx** - Check size
4. **ComponentTreeBuilder.tsx** - Check size
5. **WorkflowDesigner.tsx** - Check size

## Phase 5: Type Safety

### Centralized Types
```
src/types/
├── feature-ideas.ts
├── projects.ts
├── components.ts
├── workflows.ts
└── common.ts
```

## Implementation Order

### Step 1: Create Hook Library (This Session)
- Extract all FeatureIdeaCloud hooks
- Extract generic dialog hooks
- Test in isolation

### Step 2: Break Down FeatureIdeaCloud (This Session)
- Create atomic components
- Maintain feature parity
- Test all features work

### Step 3: JSON Page Config (This Session)
- Define page schema
- Create loader utilities
- Wire up to App.tsx

### Step 4: Verify & Test (This Session)
- All components < 150 LOC ✓
- All features functional ✓
- Performance maintained ✓

## Success Metrics
- ✅ No component > 150 LOC
- ✅ No duplicated logic
- ✅ All features work identically
- ✅ Type safety maintained
- ✅ Performance improved
- ✅ Developer velocity increased

## Notes
- Preserve all existing functionality
- Maintain backward compatibility
- Keep user experience identical
- Improve developer experience
- Enable future scalability
