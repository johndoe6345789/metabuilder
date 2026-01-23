# WorkflowUI Architecture

Complete technical architecture for the WorkflowUI visual workflow editor.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Environment                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          React Application (Next.js)                 │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  ┌────────────────────────────────────────────┐    │   │
│  │  │  Pages & Components (FakeMUI)             │    │   │
│  │  │  - Dashboard                               │    │   │
│  │  │  - Editor (Canvas + Panels)               │    │   │
│  │  │  - Properties Panel                        │    │   │
│  │  │  - Node Library                           │    │   │
│  │  └────────────────────────────────────────────┘    │   │
│  │                      │                              │   │
│  │                      ▼                              │   │
│  │  ┌────────────────────────────────────────────┐    │   │
│  │  │  React Flow (DAG Visualization)            │    │   │
│  │  │  - Canvas with nodes & edges               │    │   │
│  │  │  - Zoom & pan controls                     │    │   │
│  │  │  - Minimap                                 │    │   │
│  │  └────────────────────────────────────────────┘    │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│           │                                │                │
│           ▼                                ▼                │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Redux Store     │         │  IndexedDB       │         │
│  │  - Workflow      │         │  - Workflows     │         │
│  │  - Editor        │         │  - Executions    │         │
│  │  - Nodes         │         │  - Node Types    │         │
│  │  - Connections   │         │  - Drafts        │         │
│  │  - UI State      │         │  - Sync Queue    │         │
│  └──────────────────┘         └──────────────────┘         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                    │                   │
                    │ HTTP/WS          │ HTTP
                    │                   │
┌───────────────────▼───────────────────▼─────────────────────┐
│                  Flask Backend                              │
├─────────────────────────────────────────────────────────────┤
│  - Workflow CRUD                                            │
│  - Execution management                                     │
│  - Node registry                                            │
│  - Workflow validation                                      │
└───────────────────┬───────────────────────────────────────┬─┘
                    │                                         │
                    ▼                                         ▼
        ┌──────────────────────┐           ┌─────────────────────┐
        │  PostgreSQL/MongoDB  │           │  MetaBuilder DAG    │
        │  - Persistence       │           │  - Execution        │
        │  - History           │           │  - Error Recovery   │
        └──────────────────────┘           │  - Multi-tenant     │
                                           └─────────────────────┘
```

## Component Architecture

### Frontend Layer

#### 1. Pages (Next.js App Directory)

```
app/
├── layout.tsx              # Root layout with Redux provider
├── page.tsx                # Dashboard (list workflows)
├── editor/[id]/
│   └── page.tsx            # Workflow editor with React Flow
└── api/
    ├── workflows/          # Proxy API endpoints
    ├── nodes/
    └── executions/
```

#### 2. React Components

**Layout Components:**
- `MainLayout`: Root layout with header, sidebar, content
- `Header`: Top navigation, user menu
- `Sidebar`: Workflow list, recent items

**Editor Components:**
- `Editor/Canvas`: React Flow canvas with nodes/edges
- `Editor/Toolbar`: Save, execute, undo/redo, settings
- `Editor/NodePanel`: Add nodes to canvas
- `Editor/Properties`: Edit selected node parameters

**UI Components (FakeMUI):**
- `Button`, `Input`, `Modal`, `Dialog`
- `Sidebar`, `Tabs`, `Tooltip`
- `Card`, `List`, `Grid`

#### 3. Custom Node Components

Each node type has a custom React component:

```tsx
// PlaywrightNode.tsx
<div className="node-container">
  <Header title="Playwright" icon="test" />
  <Parameters>
    <Select name="browser" options={['chromium', 'firefox', 'webkit']} />
    <Input name="baseUrl" type="text" />
    <Checkbox name="headless" />
  </Parameters>
  <Handles top bottom /> {/* React Flow handles */}
</div>
```

### State Management (Redux)

```
store/
├── store.ts                    # Store configuration
└── slices/
    ├── workflowSlice.ts        # Workflow CRUD + execution
    ├── editorSlice.ts          # Canvas state (zoom, pan, selection)
    ├── nodesSlice.ts           # Node registry, templates
    ├── connectionSlice.ts      # Edge drawing state
    └── uiSlice.ts              # Modals, notifications, UI state
```

#### Redux State Tree

```typescript
{
  workflow: {
    current: Workflow,           // Active workflow
    nodes: WorkflowNode[],       // Canvas nodes
    connections: Edge[],         // Canvas edges
    isDirty: boolean,            // Unsaved changes
    isSaving: boolean,           // Save in progress
    executionHistory: [],        // Past executions
    currentExecution: null       // Active execution
  },
  editor: {
    zoom: number,                // Canvas zoom level
    pan: { x, y },              // Canvas position
    selectedNodes: Set<string>, // Selected node IDs
    selectedEdges: Set<string>, // Selected edge IDs
    isDrawing: boolean          // Drawing edge state
  },
  nodes: {
    registry: NodeType[],        // Available node types
    templates: NodeTemplate[],   // Saved node templates
    categories: string[]         // Node categories
  },
  connection: {
    isActive: boolean,           // Drawing edge
    source: string,              // Source node ID
    target: string               // Target node ID
  },
  ui: {
    modals: {
      createWorkflow: boolean,
      settings: boolean,
      nodeHelp: boolean
    },
    notifications: Notification[],
    theme: 'light' | 'dark',
    sidebarOpen: boolean
  }
}
```

### Storage Layer (IndexedDB)

**Dexie Schema:**

```typescript
db.version(1).stores({
  workflows: 'id, tenantId, [tenantId+name]',
  executions: 'id, workflowId, [tenantId+workflowId]',
  nodeTypes: 'id, [tenantId+category]',
  drafts: 'id, tenantId',
  syncQueue: '++id, [tenantId+action]'
});
```

**Offline-First Strategy:**
1. All operations write to IndexedDB first
2. Changes added to sync queue
3. Background sync when online
4. Conflict resolution on server

### Backend Layer (Flask)

**API Endpoints:**

```
GET    /api/workflows                    # List workflows
POST   /api/workflows                    # Create workflow
GET    /api/workflows/<id>               # Get workflow
PUT    /api/workflows/<id>               # Update workflow
DELETE /api/workflows/<id>               # Delete workflow

POST   /api/workflows/<id>/execute       # Execute workflow
GET    /api/workflows/<id>/executions    # Execution history
GET    /api/executions/<id>              # Get execution

POST   /api/workflows/<id>/validate      # Validate workflow

GET    /api/nodes                        # List node types
GET    /api/nodes/<id>                   # Get node type
GET    /api/nodes/categories             # Get categories

GET    /api/health                       # Health check
```

**Data Models:**

```python
class Workflow:
    id: str
    name: str
    description: str
    version: str
    tenantId: str
    nodes: List[Node]
    connections: List[Connection]
    createdAt: datetime
    updatedAt: datetime

class Node:
    id: str
    type: str              # e.g., 'testing.playwright'
    name: str
    position: {x, y}
    parameters: Dict

class Execution:
    id: str
    workflowId: str
    status: 'running' | 'success' | 'error'
    nodes: List[NodeExecution]
    duration: int
    error: Optional[Error]
```

## Data Flow

### Workflow Creation

```
User Input
    │
    ▼
React Component (dispatch action)
    │
    ▼
Redux Action (workflowSlice.createWorkflow)
    │
    ├─ Update Redux state
    │
    ├─ IndexedDB write (workflowDB.create)
    │
    └─ Add to sync queue (optional)
         │
         ▼
    Background sync to server (when online)
         │
         ▼
    Flask POST /api/workflows
```

### Workflow Execution

```
User clicks "Execute"
    │
    ▼
Dispatch executionSlice.startExecution
    │
    ▼
Frontend creates ExecutionResult object
    │
    ├─ IndexedDB write (executionDB.create)
    │
    ▼
HTTP POST /api/workflows/<id>/execute
    │
    ▼
Flask receives execution request
    │
    ├─ Validation
    │
    ├─ Call DAG Executor
    │
    └─ WebSocket updates to client
         │
         ▼
    Redux update (execution progress)
         │
         ▼
    UI renders execution results
```

### Node Parameter Editing

```
User edits parameter in Properties panel
    │
    ▼
React onChange event
    │
    ▼
Dispatch updateNode action
    │
    ▼
Redux updates node in state
    │
    ├─ Mark workflow as dirty
    │
    ├─ Update React Flow node
    │
    └─ Auto-save to IndexedDB
```

## Performance Optimizations

### 1. Code Splitting

```typescript
// Components loaded on-demand
const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });
const Storybook = dynamic(() => import('@/components/Storybook'), { ssr: false });
```

### 2. Redux Selectors with Reselect

```typescript
// Memoized selectors prevent unnecessary re-renders
const selectWorkflowNodes = createSelector(
  (state) => state.workflow.nodes,
  (state) => state.editor.selectedNodes,
  (nodes, selected) => nodes.filter(n => selected.has(n.id))
);
```

### 3. IndexedDB Indexing

```
workflows: 'id, tenantId, [tenantId+name]'
  └─ Fast lookup by tenantId + name
```

### 4. React Flow Optimization

```tsx
// Use memo to prevent unnecessary node re-renders
const PlaywrightNode = memo(({ data }) => (...));

// Handle connections efficiently
const onConnect = useCallback((connection) => {
  dispatch(addConnection(connection));
}, [dispatch]);
```

### 5. Lazy Loading Images/Icons

```tsx
<Image
  src="/icons/playwright.svg"
  loading="lazy"
  width={24}
  height={24}
/>
```

## Error Handling

### Frontend Error Handling

```
Try-Catch Wrapper
    │
    ├─ User-friendly error message
    │
    ├─ Log to console (dev)
    │
    ├─ Send to error tracking (prod)
    │
    └─ Redux notification (ui.notifications)
```

### Backend Error Handling

```python
@app.errorhandler(Exception)
def handle_error(error):
    return jsonify({
        'error': str(error),
        'code': 'INTERNAL_ERROR',
        'timestamp': datetime.now().isoformat()
    }), 500
```

## Security

### Multi-Tenant Isolation

```typescript
// All requests include tenantId
const response = await api.get(`/workflows`, {
  params: { tenantId: user.tenantId }
});
```

### Input Validation

```typescript
// Validate on frontend
const schema = Yup.object({
  name: Yup.string().required().max(255),
  nodes: Yup.array().min(1).required()
});

// Validate on backend
def validate_workflow(data):
    # Check nodes exist
    # Check connections valid
    # Check types registered
```

### CORS & CSRF Protection

```python
CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv('ALLOWED_ORIGINS', '*').split(','),
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "X-CSRF-Token"]
    }
})
```

## Deployment Architecture

### Frontend Deployment

```
Source Code
    │
    ▼
npm run build
    │
    ├─ TypeScript compilation
    ├─ SCSS compilation
    ├─ Code splitting
    │
    ▼
.next/
    │
    ▼
Vercel (or similar)
    │
    ▼
CDN (cached assets)
```

### Backend Deployment

```
Source Code
    │
    ▼
Docker build
    │
    ├─ Python 3.11 base
    ├─ Install dependencies
    ├─ Copy code
    │
    ▼
Docker image
    │
    ▼
Deploy to Heroku/Railway/K8s
```

## Monitoring & Observability

### Frontend Monitoring

- Redux DevTools for state inspection
- React DevTools for component profiling
- Error tracking (Sentry)
- Performance monitoring (Web Vitals)

### Backend Monitoring

- Log aggregation (ELK stack)
- APM (Application Performance Monitoring)
- Error tracking (Sentry)
- Database monitoring

## Future Enhancements

1. **WebSocket Real-Time Collaboration**: Multi-user editing
2. **Workflow Templates**: Pre-built workflow templates
3. **Advanced Debugging**: Step-through execution
4. **Performance Profiling**: Execution performance analysis
5. **Workflow Scheduling**: Cron-like scheduling
6. **Custom Nodes**: User-defined node types
7. **Workflow Sharing**: Share workflows between teams
8. **API-First**: GraphQL API layer
