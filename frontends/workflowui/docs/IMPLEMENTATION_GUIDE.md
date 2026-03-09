# WorkflowUI Implementation Guide

## Overview

This guide documents the implementation status and architecture of the WorkflowUI visual workflow editor.

## Implementation Status

### ✅ Completed Phases

#### Phase 1: Core Infrastructure (Complete)
- [x] Redux state management with 5 slices (workflow, editor, nodes, connection, ui)
- [x] API client with retry logic and error handling
- [x] IndexedDB service layer with Dexie for offline-first support
- [x] Execution service with polling and result caching
- [x] Redux middleware for async API operations
- [x] Custom React hooks (useWorkflow, useExecution, useUI, useEditor)

#### Phase 2: Styling & Design System (Complete)
- [x] Global SCSS with CSS variables and design tokens
- [x] Component styles (buttons, forms, cards, panels, badges, etc.)
- [x] Light/dark theme support with localStorage persistence
- [x] Responsive design system (mobile/tablet/desktop)
- [x] Animation system (fade, slide, spin)

#### Phase 3: Layout & Navigation (Complete)
- [x] Main layout with responsive header and sidebar
- [x] Header with logo and theme toggle
- [x] Sidebar with responsive mobile handling
- [x] Root layout with Redux provider
- [x] Dashboard with workflow list view
- [x] Notification system with auto-dismiss
- [x] Loading overlay for async operations

#### Phase 4: Editor Toolbar (Complete)
- [x] Save button with dirty state tracking
- [x] Execute button with validation
- [x] Validate button with validation results modal
- [x] Zoom controls (in, out, reset with percentage display)
- [x] Loading indicators and disabled states
- [x] Keyboard shortcut hints

### 🚀 In Progress

#### Phase 5: React Flow Canvas Integration
- [ ] Canvas component with React Flow
- [ ] Node renderer and event handling
- [ ] Edge/connection renderer
- [ ] Pan and zoom controls
- [ ] Minimap navigation

#### Phase 6: Node Components
- [ ] CustomNode component wrapper
- [ ] Playwright test node
- [ ] Storybook node
- [ ] Generic parameter editor
- [ ] Node templates

#### Phase 7: Properties Panel
- [ ] Properties panel component
- [ ] Parameter editing interface
- [ ] Type-aware input fields
- [ ] Validation and error display
- [ ] Template management

#### Phase 8: Node Library
- [ ] Node palette/library component
- [ ] Category filtering
- [ ] Search functionality
- [ ] Drag-and-drop support
- [ ] Node preview

### 📋 Upcoming Phases

#### Phase 9: Execution & Results
- [ ] Execution history view
- [ ] Results visualization
- [ ] Error debugging panel
- [ ] Performance metrics
- [ ] Export results

#### Phase 10: Advanced Features
- [ ] Workflow templates
- [ ] Import/export workflows
- [ ] Workflow versioning
- [ ] Collaboration features
- [ ] Undo/redo system

#### Phase 11: Testing & Documentation
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests with Playwright
- [ ] Storybook documentation
- [ ] API documentation

#### Phase 12: Deployment
- [ ] Production build optimization
- [ ] Performance profiling
- [ ] Bundle analysis
- [ ] CI/CD integration
- [ ] Monitoring setup

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Application                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           React Components (TSX)                    │   │
│  │  - Layout, UI, Editor, Nodes, Panels               │   │
│  └─────────────────────────────────────────────────────┘   │
│                       │                                       │
│                       ▼                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        Custom React Hooks                           │   │
│  │  - useWorkflow, useExecution, useUI, useEditor     │   │
│  └─────────────────────────────────────────────────────┘   │
│                       │                                       │
│                       ▼                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Redux Store & Middleware                  │   │
│  │  - 5 slices, apiMiddleware, DevTools               │   │
│  └─────────────────────────────────────────────────────┘   │
│                       │                                       │
│      ┌────────────────┼────────────────┐                     │
│      ▼                ▼                ▼                      │
│  ┌─────────┐   ┌─────────────┐  ┌──────────────┐            │
│  │IndexedDB│   │ API Client  │  │ Services     │            │
│  │(offline)│   │ (Flask)     │  │ (business    │            │
│  │         │   │             │  │  logic)      │            │
│  └─────────┘   └─────────────┘  └──────────────┘            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
    Flask Backend (localhost:5000)
         │
         ▼
    MetaBuilder DAG Executor
```

## Component Structure

### Pages
```
src/app/
├── layout.tsx              # Root layout with Redux provider
├── page.tsx                # Dashboard with workflow list
└── editor/
    └── [id]/page.tsx       # Workflow editor (TBD)
```

### Components
```
src/components/
├── Layout/
│   ├── MainLayout.tsx      # Main app layout
│   └── MainLayout.module.scss
├── Editor/
│   ├── Toolbar.tsx         # Save, execute, validate controls
│   ├── Toolbar.module.scss
│   ├── Canvas.tsx          # React Flow canvas (TBD)
│   ├── CustomNode.tsx      # Custom node renderer (TBD)
│   ├── NodePanel.tsx       # Node library (TBD)
│   └── Properties.tsx      # Properties panel (TBD)
└── UI/
    ├── NotificationContainer.tsx
    ├── LoadingOverlay.tsx
    ├── Button.tsx (TBD)
    ├── Modal.tsx (TBD)
    └── ...
```

### Services
```
src/services/
├── api.ts                  # HTTP client with retry
├── workflowService.ts      # Workflow CRUD + offline-first
└── executionService.ts     # Execution management + polling
```

### Hooks
```
src/hooks/
├── useWorkflow.ts          # Workflow state + operations
├── useExecution.ts         # Execution state + operations
├── useUI.ts                # UI state (modals, notifications, theme)
├── useEditor.ts            # Canvas state (zoom, pan, selection)
└── index.ts                # Export index
```

### Redux
```
src/store/
├── store.ts                # Store configuration
├── slices/
│   ├── workflowSlice.ts    # Workflow data
│   ├── editorSlice.ts      # Canvas state
│   ├── nodesSlice.ts       # Node registry
│   ├── connectionSlice.ts  # Connection drawing
│   └── uiSlice.ts          # UI state
└── middleware/
    └── apiMiddleware.ts    # Async API operations
```

### Styling
```
src/styles/
├── globals.scss            # Global styles + design tokens
├── components.scss         # Reusable component styles
└── pages/
    └── *.module.scss       # Page-specific styles
```

## Key Integrations

### Redux Store Slices

**workflowSlice**
- Current workflow metadata
- Canvas nodes and connections
- Execution history
- Dirty tracking and auto-save

**editorSlice**
- Canvas zoom and pan
- Node/edge selection
- Drawing state
- Context menu position

**nodesSlice**
- Available node types registry
- Node templates
- Node categories

**connectionSlice**
- Active connection drawing state
- Connection validation
- Source/target tracking

**uiSlice**
- Modal open/close states
- Notifications
- Theme (light/dark)
- Sidebar state
- Loading indicators

### Custom Hooks

All hooks provide:
- Convenient access to Redux state
- Memoized callback actions
- Error handling with notifications
- Loading state management

## API Endpoints

### Workflows
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/<id>` - Get workflow
- `PUT /api/workflows/<id>` - Update workflow
- `DELETE /api/workflows/<id>` - Delete workflow
- `POST /api/workflows/<id>/validate` - Validate workflow

### Execution
- `POST /api/workflows/<id>/execute` - Execute workflow
- `GET /api/workflows/<id>/executions` - Get execution history
- `GET /api/executions/<id>` - Get execution details

### Nodes
- `GET /api/nodes` - List node types
- `GET /api/nodes/<id>` - Get node type
- `GET /api/nodes/categories` - Get categories

## Database Schema (IndexedDB)

### Tables
1. **workflows** - Workflow definitions
   - Indexes: `id`, `tenantId`, `[tenantId+name]`

2. **executions** - Workflow execution results
   - Indexes: `id`, `workflowId`, `[tenantId+workflowId]`

3. **nodeTypes** - Available node types (cache)
   - Indexes: `id`, `[tenantId+category]`

4. **drafts** - Local workflow drafts
   - Indexes: `id`, `tenantId`

5. **syncQueue** - Offline change tracking
   - Indexes: `++id`, `[tenantId+action]`

## Performance Optimizations

1. **Code Splitting**: Dynamic imports for lazy loading components
2. **Memoization**: Redux selectors with createSelector
3. **Virtualization**: react-window for large lists
4. **Debouncing**: 2-second auto-save delay
5. **Caching**: Multi-level caching with IndexedDB

## Development Workflow

### Setup
```bash
cd workflowui
npm install
npm run dev
```

### Running Backend
```bash
npm run backend  # Runs on localhost:5000
```

### Both Frontend and Backend
```bash
npm run dev:all
```

### Build
```bash
npm run build
npm run start
```

### Type Checking
```bash
npm run typecheck
```

## Testing Strategy

### Unit Tests
- Individual component tests
- Hook tests
- Service tests
- Reducer tests

### Integration Tests
- Component + Redux integration
- API client tests
- Service integration tests

### E2E Tests
- Full workflow creation
- Execution flow
- Validation workflow
- Error scenarios

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
```

### Backend (.env)
```
DEBUG=True
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000
```

## Known Limitations

1. **Real-time Collaboration**: Not yet implemented
2. **Advanced Debugging**: Step-through execution not available
3. **Custom Nodes**: Limited to built-in types
4. **Workflow Scheduling**: No cron scheduling support
5. **GraphQL**: REST API only

## Next Immediate Steps

1. Implement React Flow Canvas component
2. Create CustomNode wrapper component
3. Build Properties panel for parameter editing
4. Implement Node library/palette
5. Add keyboard shortcuts and keybindings
6. Implement undo/redo system
7. Add workflow templates
8. Create E2E test suite

## Monitoring & Observability

### Frontend
- Redux DevTools enabled in development
- React DevTools support
- Console error logging
- Network request logging

### Backend
- Flask request logging
- Error stack traces
- Performance metrics
- Execution logging

## Maintenance & Future Work

- Monitor bundle size trends
- Update dependencies regularly
- Implement performance monitoring
- Expand test coverage
- Add accessibility improvements
- Document complex algorithms
- Add more comprehensive logging

---

**Last Updated**: 2026-01-23
**Status**: Phase 4 Complete, Phase 5 In Progress
**Next Phase**: React Flow Canvas Integration
