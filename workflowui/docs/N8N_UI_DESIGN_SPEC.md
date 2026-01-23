# n8n-Inspired UI Design Specification
**WorkflowUI** - Visual Workflow Editor for MetaBuilder
**Version**: 1.0
**Date**: January 2026
**Status**: Complete Implementation Specification

---

## 1. Overview

WorkflowUI implements a comprehensive n8n-inspired user interface for visual workflow construction, management, and execution. The design prioritizes modularity, declarative configuration, and intuitive interaction patterns while maintaining tight integration with MetaBuilder's DAG executor system.

### 1.1 Core Objectives

| Objective | Description | Implementation |
|-----------|-------------|-----------------|
| **Visual DAG Construction** | Enable drag-and-drop workflow building | React Flow canvas with custom nodes |
| **Intuitive Node Operations** | Simple, discoverable node interactions | Context menus, quick actions, inline editing |
| **Real-Time Feedback** | Immediate validation and execution results | Redux state updates, WebSocket notifications |
| **Performance Optimization** | Smooth interaction with large workflows | Virtualization, memoization, code splitting |
| **Multi-Tenant Isolation** | Complete data separation between customers | Automatic context injection, filtering |
| **Extensibility** | Support custom nodes and plugins | Plugin registry integration, node factory |

### 1.2 Design Principles

#### Principle 1: Modularity
Every UI component is self-contained with clear boundaries and minimal external dependencies.

```typescript
// ✅ Modular component
interface NodeProps {
  id: string;
  data: NodeData;
  isSelected: boolean;
  onUpdate: (data: Partial<NodeData>) => void;
}

const PlaywrightNode: React.FC<NodeProps> = memo(({ id, data, onUpdate }) => (
  // Component implementation
));
```

**Benefits:**
- Easy to test in isolation
- Reusable across different contexts
- Clear prop contracts
- Predictable behavior

#### Principle 2: Declarative Design
UI state and behavior defined through configuration rather than imperative code.

```typescript
// ✅ Declarative node configuration
const nodeConfig = {
  id: 'testing.playwright',
  name: 'Playwright Testing',
  parameters: {
    browser: {
      type: 'select',
      required: true,
      options: ['chromium', 'firefox', 'webkit']
    },
    baseUrl: {
      type: 'string',
      required: true
    }
  }
};
```

**Benefits:**
- Configuration-as-code
- Version-controllable workflows
- Easy customization without code changes
- GUI-friendly (can be generated)

#### Principle 3: Progressive Disclosure
Show only relevant information at each interaction level.

```typescript
// Initial view: Just node name
<NodeCard title="Playwright Test" />

// On hover: Quick stats
<NodeCard title="Playwright Test" stats={stats} />

// On click: Full editor
<NodeEditor config={nodeConfig} />
```

**Benefits:**
- Reduced cognitive load
- Cleaner interface
- Faster interaction
- Accessible to novices

#### Principle 4: Consistency
Maintain visual and behavioral consistency across all UI elements.

**Color Scheme:**
```scss
$color-primary: #4a90e2;        // Actions, highlights
$color-success: #2ecc71;        // Success states, valid
$color-error: #e74c3c;          // Errors, invalid
$color-warning: #f39c12;        // Warnings, caution
$color-neutral: #95a5a6;        // Neutral elements
$color-bg-dark: #2c3e50;        // Dark backgrounds
$color-bg-light: #ecf0f1;       // Light backgrounds
```

**Typography:**
```scss
$font-heading: 600 18px / 1.4 -apple-system, BlinkMacSystemFont, ...;
$font-body: 400 14px / 1.5 -apple-system, BlinkMacSystemFont, ...;
$font-code: 400 12px / 1.4 'Monaco', 'Courier New', monospace;
```

**Spacing Scale:**
```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
```

---

## 2. Component Architecture

### 2.1 Component Hierarchy

```
App (Next.js Page)
  │
  ├─ MainLayout
  │  ├─ Header
  │  ├─ Sidebar
  │  │  ├─ WorkflowList
  │  │  ├─ NodeLibrary
  │  │  └─ ExecutionHistory
  │  │
  │  └─ EditorContainer
  │     ├─ WorkflowCanvas (React Flow)
  │     │  └─ CustomNodeTypes
  │     │     ├─ PlaywrightNode
  │     │     ├─ StorybookNode
  │     │     └─ CustomNode
  │     │
  │     ├─ Toolbar
  │     │  ├─ SaveButton
  │     │  ├─ ExecuteButton
  │     │  ├─ UndoRedoButtons
  │     │  └─ SettingsButton
  │     │
  │     ├─ PropertiesPanel
  │     │  ├─ NodeProperties
  │     │  ├─ ConnectionSettings
  │     │  └─ WorkflowMetadata
  │     │
  │     └─ ExecutionPanel
  │        ├─ ExecutionStats
  │        ├─ NodeResults
  │        └─ ErrorDetails
```

### 2.2 Component Specifications

#### 2.2.1 WorkflowCanvas

**Purpose**: Central visual editing area for DAG workflow construction.

**Props**:
```typescript
interface WorkflowCanvasProps {
  workflowId: string;
  nodes: WorkflowNode[];
  edges: WorkflowConnection[];
  isExecuting: boolean;
  selectedNodeId?: string;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeSelect: (nodeId: string) => void;
  onContextMenu: (event: React.MouseEvent, data: any) => void;
}
```

**Features**:
- ✅ Zoom and pan controls
- ✅ Minimap navigation
- ✅ Grid background
- ✅ Auto-layout algorithm
- ✅ Undo/redo support
- ✅ Multi-select (Shift+Click)
- ✅ Copy/paste nodes (Ctrl+C/V)
- ✅ Alignment tools (L/R/T/B)
- ✅ Connection validation
- ✅ Node type suggestions

**Performance Optimizations**:
```typescript
// Virtualize rendering for large workflows
const VirtualCanvas = memo(WorkflowCanvas, (prev, next) => {
  return (
    prev.nodes === next.nodes &&
    prev.edges === next.edges &&
    prev.isExecuting === next.isExecuting
  );
});
```

#### 2.2.2 CustomNode (Base Component)

**Purpose**: Reusable base for all workflow node types.

**Props**:
```typescript
interface CustomNodeProps {
  id: string;
  data: {
    name: string;
    type: string;
    parameters: Record<string, any>;
    isExecuting?: boolean;
    executionStatus?: 'pending' | 'running' | 'success' | 'error';
    executionResult?: any;
  };
  selected: boolean;
  isConnecting: boolean;
}
```

**Structure**:
```tsx
<CustomNode>
  <Header>
    <Icon type={data.type} />
    <Title>{data.name}</Title>
    <Badge status={executionStatus} />
  </Header>

  <Body>
    {/* Inline parameter display or full editor */}
  </Body>

  <Handles>
    <Handle top position="top" type="target" />
    <Handle bottom position="bottom" type="source" />
  </Handles>
</CustomNode>
```

#### 2.2.3 NodeEditor (Properties Panel)

**Purpose**: Detailed configuration for selected node.

**Props**:
```typescript
interface NodeEditorProps {
  node: WorkflowNode;
  nodeType: NodeType;
  isExecuting: boolean;
  executionResult?: NodeExecutionResult;

  onUpdate: (data: Partial<WorkflowNode>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}
```

**Sections**:
1. **Node Info**: Name, description, tags
2. **Parameters**: Dynamic form based on node type
3. **Advanced**: Timeout, retry, error handling
4. **Documentation**: Help text and examples
5. **Execution**: Past execution results

```tsx
<NodeEditor>
  <Tabs>
    <Tab name="Configuration">
      <ParameterForm />
    </Tab>
    <Tab name="Advanced">
      <TimeoutControl />
      <RetrySettings />
      <ErrorHandling />
    </Tab>
    <Tab name="Execution">
      <ExecutionHistory />
      <ResultViewer />
    </Tab>
  </Tabs>
</NodeEditor>
```

#### 2.2.4 Toolbar

**Purpose**: Primary actions for workflow manipulation.

**Sections**:
```typescript
// Left: Undo/Redo
<UndoRedoButtons />

// Center: Main actions
<SaveButton />
<ExecuteButton />
<DryRunButton />

// Right: Settings
<ZoomControl />
<LayoutButton />
<SettingsButton />
```

#### 2.2.5 NodeLibrary (Sidebar)

**Purpose**: Discoverable list of available node types for addition to workflow.

**Organization**:
```
Node Library
├─ Search / Filter
├─ Categories
│  ├─ Testing (2)
│  │  ├─ Playwright [icon]
│  │  └─ Cypress [icon]
│  ├─ Documentation (1)
│  │  └─ Storybook [icon]
│  └─ Custom (n)
└─ Favorites
```

**Features**:
- ✅ Search by name/description
- ✅ Filter by category
- ✅ Recently used
- ✅ Favorites
- ✅ Node previews on hover
- ✅ Drag-to-canvas

---

## 3. Key Interaction Patterns

### 3.1 Workflow Construction

#### Pattern: Node Addition

**User Flow**:
1. User opens "Node Library" in sidebar
2. Searches/filters for desired node type
3. Drags node onto canvas
4. Node appears with default configuration
5. User clicks node to open Properties panel
6. User configures parameters
7. User clicks "Add connection" or drags handle to another node

**Implementation**:
```typescript
const handleDragStart = (event: DragEvent, nodeType: NodeType) => {
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('nodeType', JSON.stringify(nodeType));
};

const handleDrop = (event: DragEvent) => {
  const nodeType = JSON.parse(event.dataTransfer.getData('nodeType'));
  const position = getCanvasPosition(event);
  dispatch(addNode(createNodeFromType(nodeType, position)));
};
```

#### Pattern: Connection Creation

**User Flow**:
1. User hovers over source node's bottom handle
2. Handle highlights and cursor changes
3. User clicks and drags to target node
4. Connection line appears in real-time
5. Target node's top handle highlights when valid
6. User releases to create connection
7. Validation checks occur
8. Connection appears on canvas or error shows

**Validation Rules**:
```typescript
const isValidConnection = (source: Node, target: Node): boolean => {
  // No self-connections
  if (source.id === target.id) return false;

  // No circular connections (DAG constraint)
  if (wouldCreateCycle(source, target)) return false;

  // Type compatibility check
  if (!areTypesCompatible(source.type, target.type)) return false;

  return true;
};
```

#### Pattern: Parameter Editing

**Inline Editing** (on node):
```tsx
<ParameterInput
  name="browser"
  type="select"
  value={node.data.parameters.browser}
  options={['chromium', 'firefox', 'webkit']}
  onChange={(value) => dispatch(updateNode(node.id, { parameters: { browser: value }}))}
/>
```

**Full Editor** (in properties panel):
```tsx
<ParameterForm nodeType={nodeType}>
  {nodeType.parameters.map((param) => (
    <ParameterField
      key={param.name}
      parameter={param}
      value={node.data.parameters[param.name]}
      onChange={(value) => handleParameterChange(param.name, value)}
    />
  ))}
</ParameterForm>
```

### 3.2 Workflow Execution

#### Pattern: Execution Flow

**User Flow**:
1. User clicks "Execute" button
2. Workflow validates (shows errors if invalid)
3. Execution starts, button becomes disabled
4. Nodes highlight as they execute
5. Real-time status updates via WebSocket
6. Execution completes
7. Results panel shows execution summary
8. User can click individual nodes to view results

**Redux Actions**:
```typescript
// Start execution
dispatch(startExecution());

// Receive node update via WebSocket
dispatch(updateNodeExecution({
  nodeId: 'node-1',
  status: 'success',
  duration: 1234,
  data: { ... }
}));

// Complete execution
dispatch(endExecution({
  totalDuration: 5678,
  nodeResults: [ ... ]
}));
```

### 3.3 Context Menu Interactions

**Canvas Context Menu** (right-click on empty space):
```
├─ Add Node
├─ Paste (if copied)
├─ Select All
├─ Deselect All
└─ Workflow Settings
```

**Node Context Menu** (right-click on node):
```
├─ Edit
├─ Copy (Ctrl+C)
├─ Paste (Ctrl+V)
├─ Delete (Del)
├─ Duplicate (Ctrl+D)
├─ Disable/Enable
├─ Collapse/Expand
└─ Properties
```

**Edge Context Menu** (right-click on connection):
```
├─ Delete
├─ Reroute
└─ Connection Settings
```

---

## 4. Redux State Architecture

### 4.1 State Tree Structure

```typescript
{
  workflow: {
    current: Workflow;
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
    isDirty: boolean;
    isSaving: boolean;
    executionHistory: ExecutionResult[];
  },

  editor: {
    zoom: number;
    pan: { x: number; y: number };
    selectedNodes: Set<string>;
    selectedEdges: Set<string>;
    isDrawing: boolean;
  },

  nodes: {
    registry: NodeType[];
    templates: NodeTemplate[];
    categories: string[];
  },

  ui: {
    modals: Record<string, boolean>;
    notifications: Notification[];
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
  }
}
```

### 4.2 Selectors with Memoization

```typescript
// Memoized selector for selected nodes
export const selectSelectedNodes = createSelector(
  (state: RootState) => state.workflow.nodes,
  (state: RootState) => state.editor.selectedNodes,
  (nodes, selectedIds) =>
    nodes.filter(n => selectedIds.has(n.id))
);

// Memoized selector for execution status
export const selectExecutionStatus = createSelector(
  (state: RootState) => state.workflow.currentExecution,
  (execution) => ({
    isRunning: execution?.status === 'running',
    hasErrors: execution?.error !== null,
    progress: calculateProgress(execution)
  })
);
```

### 4.3 Action Batching

```typescript
// Batch multiple updates to prevent redundant renders
dispatch(workflowSlice.actions.batchUpdate({
  nodes: updatedNodes,
  connections: updatedConnections,
  isDirty: true
}));
```

---

## 5. Performance Considerations

### 5.1 Rendering Optimization

#### Virtualization
```typescript
// For large node lists in sidebar
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={nodes.length}
  itemSize={48}
>
  {({ index, style }) => (
    <NodeItem node={nodes[index]} style={style} />
  )}
</FixedSizeList>
```

#### Memoization
```typescript
// Prevent unnecessary re-renders
const PlaywrightNode = memo(
  CustomNode,
  (prev, next) => {
    return (
      prev.data === next.data &&
      prev.selected === next.selected &&
      prev.isConnecting === next.isConnecting
    );
  }
);
```

#### Code Splitting
```typescript
// Load components on-demand
const ExecutionPanel = dynamic(
  () => import('@/components/ExecutionPanel'),
  { ssr: false }
);
```

### 5.2 State Management Optimization

#### Selector Memoization
```typescript
// Prevent component re-renders due to object reference changes
const selectNodeMetrics = useCallback(
  createSelector(
    (state) => state.workflow.nodes,
    (nodes) => ({
      count: nodes.length,
      errors: nodes.filter(n => n.error).length
    })
  ),
  []
);
```

#### Normalized State
```typescript
// Store nodes in lookup table for O(1) access
{
  workflow: {
    nodeIds: ['node-1', 'node-2'],
    nodesById: {
      'node-1': { id: 'node-1', ... },
      'node-2': { id: 'node-2', ... }
    }
  }
}
```

### 5.3 Network Optimization

#### Lazy Loading
```typescript
// Load execution history only when needed
const [executions, setExecutions] = useState<ExecutionResult[]>([]);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const newExecutions = await api.getExecutions(workflowId, { limit: 20, offset });
  setExecutions([...executions, ...newExecutions]);
};
```

#### Debounced Saves
```typescript
// Debounce auto-save to reduce network requests
const debouncedSave = useMemo(
  () => debounce((workflow: Workflow) => {
    dispatch(saveWorkflow(workflow));
  }, 2000),
  []
);

// Call on every change
useEffect(() => {
  if (isDirty) {
    debouncedSave(currentWorkflow);
  }
}, [isDirty, currentWorkflow]);
```

---

## 6. Data Flow & State Management

### 6.1 Complete Data Flow Diagram

```
User Interaction
  │
  ├─ React Event Handler
  │  │
  │  ▼
  ├─ Redux Action Dispatch
  │  │
  │  ├─ Middleware (optional)
  │  │  └─ e.g., thunk for async operations
  │  │
  │  ▼
  ├─ Reducer
  │  │
  │  ├─ Update Redux State
  │  │
  │  └─ IndexedDB Write (async)
  │
  ▼
Component Re-render
  │
  ├─ Selector Evaluation (memoized)
  │
  ├─ Component Render
  │
  └─ React Flow Update (if canvas changed)
```

### 6.2 Example: Adding Node

```typescript
// 1. User drags node onto canvas
const handleDrop = (event: DragEvent) => {
  const nodeType = JSON.parse(event.dataTransfer.getData('nodeType'));
  const position = { x: event.clientX, y: event.clientY };

  // 2. Dispatch action
  dispatch(addNode({
    id: `node-${uuid()}`,
    type: nodeType.id,
    name: nodeType.name,
    position,
    parameters: nodeType.defaultParameters || {}
  }));
};

// 3. Reducer updates state
const addNode = (state, action) => {
  state.nodes.push(action.payload);
  state.isDirty = true;
};

// 4. Component re-renders with new node
// 5. IndexedDB updated in background
storageService.updateWorkflow(getCurrentWorkflow());
```

---

## 7. Visual Design System

### 7.1 Color Palette

```scss
// Brand Colors
$primary: #4a90e2;
$primary-dark: #357abd;
$primary-light: #7ba8ef;

// Status Colors
$success: #2ecc71;
$warning: #f39c12;
$error: #e74c3c;
$info: #3498db;

// Neutral Colors
$white: #ffffff;
$light-gray: #ecf0f1;
$medium-gray: #bdc3c7;
$dark-gray: #7f8c8d;
$black: #2c3e50;

// Semantic Colors
$bg-primary: $white;
$bg-secondary: $light-gray;
$text-primary: $black;
$text-secondary: $dark-gray;
$border-color: $medium-gray;
```

### 7.2 Component Styles

#### Node Component

```scss
.node {
  border-radius: 4px;
  border: 2px solid $border-color;
  background: $bg-primary;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &.selected {
    border-color: $primary;
    box-shadow: 0 0 0 2px rgba($primary, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.executing {
    animation: pulse 1s infinite;
  }

  &.error {
    border-color: $error;
  }

  .header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm;
    border-bottom: 1px solid $border-color;
    background: linear-gradient(to right, $primary-light, transparent);
  }

  .body {
    padding: $spacing-md;
  }
}
```

#### Button Component

```scss
.button {
  padding: $spacing-sm $spacing-md;
  border-radius: 4px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease-out;

  &.primary {
    background: $primary;
    color: $white;

    &:hover {
      background: $primary-dark;
    }

    &:active {
      transform: scale(0.98);
    }

    &:disabled {
      background: $medium-gray;
      cursor: not-allowed;
    }
  }

  &.secondary {
    background: $light-gray;
    color: $text-primary;
    border: 1px solid $border-color;

    &:hover {
      background: darken($light-gray, 5%);
    }
  }
}
```

---

## 8. Accessibility & Usability

### 8.1 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save workflow |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+C` | Copy selected nodes |
| `Ctrl+V` | Paste nodes |
| `Ctrl+D` | Duplicate selected nodes |
| `Del` | Delete selected nodes |
| `Ctrl+A` | Select all nodes |
| `Esc` | Deselect all |
| `F5` | Execute workflow |
| `Shift+F5` | Dry-run |

### 8.2 ARIA Labels

```tsx
<button
  aria-label="Save workflow (Ctrl+S)"
  aria-disabled={isSaving}
  disabled={isSaving}
>
  Save
</button>

<div role="tab" aria-selected={isActive}>
  Configuration
</div>

<div
  role="alert"
  aria-live="polite"
  aria-label={`Error: ${error.message}`}
>
  {error.message}
</div>
```

### 8.3 Focus Management

```typescript
// Trap focus in modal
<FocusTrap>
  <Modal>
    <button autoFocus>Default focus</button>
  </Modal>
</FocusTrap>
```

---

## 9. Error Handling & User Feedback

### 9.1 Validation Feedback

```typescript
// Real-time field validation
<ParameterField
  value={value}
  error={validateParameter(value, parameter)}
  onChange={handleChange}
  onBlur={handleBlur}
>
  {error && <ErrorMessage>{error}</ErrorMessage>}
</ParameterField>
```

### 9.2 Error Toasts

```typescript
// Automatic error notifications
dispatch(showNotification({
  type: 'error',
  title: 'Execution Failed',
  message: 'Node "Playwright Test" timed out after 30s',
  duration: 5000,
  action: {
    label: 'Retry',
    onClick: () => dispatch(retryExecution())
  }
}));
```

### 9.3 Loading States

```tsx
<Button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</Button>

<Skeleton count={3} height={40} />
```

---

## 10. Integration with MetaBuilder

### 10.1 Workflow Export Format

```typescript
// Export to n8n-compatible JSON
const exportWorkflow = (workflow: Workflow): n8nWorkflow => {
  return {
    name: workflow.name,
    nodes: workflow.nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      parameters: node.parameters,
      typeVersion: 1
    })),
    connections: workflow.connections.map(conn => ({
      source: conn.source,
      target: conn.target
    }))
  };
};
```

### 10.2 Plugin Registry Integration

```typescript
// Load available nodes from plugin registry
const loadNodeRegistry = async (tenantId: string) => {
  const response = await api.get('/api/nodes', { params: { tenantId } });
  dispatch(setNodeRegistry(response.data.nodes));
};
```

### 10.3 Execution Integration

```typescript
// Execute workflow through DAG executor
const executeWorkflow = async (workflowId: string) => {
  dispatch(startExecution());

  const result = await api.post(`/api/workflows/${workflowId}/execute`, {
    parameters: { ... }
  });

  // Subscribe to execution updates
  websocket.on('execution:update', (update) => {
    dispatch(updateNodeExecution(update));
  });
};
```

---

## 11. Browser Support & Responsive Design

### 11.1 Supported Browsers

| Browser | Minimum Version | Notes |
|---------|-----------------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |
| IE | Not supported | Use Edge instead |

### 11.2 Responsive Breakpoints

```scss
$breakpoint-mobile: 480px;
$breakpoint-tablet: 768px;
$breakpoint-laptop: 1024px;
$breakpoint-desktop: 1440px;

@media (max-width: $breakpoint-tablet) {
  .sidebar {
    display: none; // Drawer instead
  }

  .node {
    font-size: 12px;
  }
}
```

---

## 12. Testing Strategy

### 12.1 Component Testing

```typescript
describe('PlaywrightNode', () => {
  it('renders with correct parameters', () => {
    const { getByText } = render(
      <PlaywrightNode
        node={mockNode}
        selected={false}
        onChange={mockOnChange}
      />
    );

    expect(getByText('Playwright')).toBeInTheDocument();
  });

  it('updates parameters on change', () => {
    const { getByRole } = render(...);

    fireEvent.change(getByRole('combobox'), { target: { value: 'firefox' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      parameters: { browser: 'firefox' }
    });
  });
});
```

### 12.2 Integration Testing

```typescript
describe('WorkflowCanvas', () => {
  it('adds node on drop', async () => {
    const { getByTestId } = render(<WorkflowCanvas {...props} />);

    await dragAndDrop(
      getByTestId('node-library-item'),
      getByTestId('canvas')
    );

    expect(mockOnNodesChange).toHaveBeenCalled();
  });
});
```

---

## 13. Deployment & Performance Targets

### 13.1 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **Largest Contentful Paint (LCP)** | < 2.5s | - |
| **First Input Delay (FID)** | < 100ms | - |
| **Cumulative Layout Shift (CLS)** | < 0.1 | - |
| **Canvas Initial Render** | < 1s (50 nodes) | - |
| **Node Addition** | < 100ms | - |
| **Zoom/Pan** | 60 FPS | - |
| **Execute Start** | < 500ms | - |

### 13.2 Bundle Size Targets

| Bundle | Target | Strategy |
|--------|--------|----------|
| **Initial JS** | < 150KB | Code splitting |
| **CSS** | < 50KB | Scoped SCSS |
| **React Flow** | < 100KB | Tree-shaking |
| **Dependencies** | < 200KB | Peer deps |

---

## 14. Conclusion

WorkflowUI implements a comprehensive n8n-inspired interface combining:

✅ **Modularity** - Reusable, testable components
✅ **Declarative Design** - Configuration-driven UI
✅ **Performance** - Optimized rendering and state management
✅ **Accessibility** - Full keyboard navigation and ARIA support
✅ **Integration** - Seamless MetaBuilder DAG executor integration
✅ **Extensibility** - Plugin system for custom nodes

The design prioritizes user experience while maintaining production-grade quality and performance standards.

---

## Appendix A: Component API Reference

[See individual component README files in `src/components/`]

## Appendix B: Redux Slices Documentation

[See `src/store/slices/` for detailed slice documentation]

## Appendix C: Storybook Components

Run `npm run storybook` to view interactive component documentation.

---

**Document Version**: 1.0
**Last Updated**: January 2026
**Maintainer**: Claude Haiku 4.5
**Status**: Ready for Implementation
