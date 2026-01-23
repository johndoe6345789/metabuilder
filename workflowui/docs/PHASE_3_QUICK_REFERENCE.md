# Phase 3 Quick Reference Guide

## New Hooks Available

### 1. useExecution - Workflow Execution Management

```typescript
import { useExecution } from '@/hooks';

function MyComponent() {
  const {
    execute,           // Execute workflow
    stop,             // Stop running execution
    getDetails,       // Get execution details
    getStats,         // Get statistics
    getHistory,       // Get past executions
    currentExecution, // Current Redux state
    executionHistory  // History Redux state
  } = useExecution();

  // Execute a workflow
  const handleExecute = async () => {
    try {
      const result = await execute('workflow-id', { param: 'value' });
      console.log('Status:', result.status);
    } catch (error) {
      console.error('Failed:', error.message);
    }
  };

  // Get execution history
  const handleHistory = async () => {
    const history = await getHistory('workflow-id', 'default', 10);
    history.forEach(exec => console.log(exec.status));
  };

  // Get statistics
  const handleStats = async () => {
    const stats = await getStats('workflow-id');
    console.log(`Success rate: ${stats.successCount}/${stats.totalExecutions}`);
  };

  // Stop execution
  const handleStop = async () => {
    if (currentExecution?.status === 'running') {
      await stop();
    }
  };

  return (
    <div>
      <button onClick={handleExecute}>Execute</button>
      <button onClick={handleHistory}>Show History</button>
      <button onClick={handleStats}>Show Stats</button>
      <button onClick={handleStop} disabled={currentExecution?.status !== 'running'}>
        Stop
      </button>
      <p>Current: {currentExecution?.status || 'idle'}</p>
    </div>
  );
}
```

**Return Type**:
```typescript
{
  // State
  currentExecution: ExecutionResult | null,
  executionHistory: ExecutionResult[],

  // Actions (all return Promises)
  execute: (workflowId: string, inputs?: any, tenantId?: string) => Promise<ExecutionResult>,
  stop: () => Promise<void>,
  getDetails: (executionId: string) => Promise<ExecutionResult | null>,
  getStats: (workflowId: string, tenantId?: string) => Promise<ExecutionStats>,
  getHistory: (workflowId: string, tenantId?: string, limit?: number) => Promise<ExecutionResult[]>
}
```

---

### 2. useCanvasKeyboard - Canvas Keyboard Shortcuts

Already integrated into `InfiniteCanvas` component. Use these shortcuts:

| Key | Action | Notes |
|-----|--------|-------|
| **Ctrl+A** / **Cmd+A** | Select all cards | Selects all items on canvas |
| **Delete** / **Backspace** | Delete selected | Removes selected cards |
| **Ctrl+D** / **Cmd+D** | Duplicate selected | Creates copies with 20px offset |
| **Ctrl+F** / **Cmd+F** | Search | Phase 4: Will open search dialog |
| **Escape** | Clear selection | Deselects all items |
| **Arrow Keys** | Pan canvas | Moves canvas view (50px per press) |

**Don't use in**: Input fields, textareas, contentEditable elements (shortcuts automatically disabled)

**For custom handlers**, import and use directly:
```typescript
import { useCanvasKeyboard } from '@/hooks';

function CustomComponent() {
  useCanvasKeyboard({
    onSelectAll: () => console.log('Select all'),
    onDeleteSelected: () => console.log('Delete'),
    onDuplicateSelected: () => console.log('Duplicate'),
    onSearch: () => console.log('Search')
  });

  return <div>Keyboard shortcuts active</div>;
}
```

---

### 3. useCanvasVirtualization - Performance Optimization

```typescript
import { useCanvasVirtualization } from '@/hooks';

function CanvasRenderer() {
  const {
    visibleItems,    // Only items in viewport
    stats,           // Performance stats
    viewportBounds   // Current viewport bounds
  } = useCanvasVirtualization(
    allItems,        // All canvas items
    { x: -100, y: -50 },  // Current pan
    1.2,            // Current zoom
    {
      padding: 100,  // Preload area outside viewport
      containerWidth: 1200,
      containerHeight: 800
    }
  );

  // Render only visible items for performance
  return (
    <div>
      {visibleItems.map(item => (
        <Item key={item.id} item={item} />
      ))}
      <div>
        Rendering: {stats.visibleItems} / {stats.totalItems}
        ({stats.percentVisible}%)
      </div>
    </div>
  );
}
```

**Return Type**:
```typescript
{
  visibleItems: ProjectCanvasItem[],  // Items in viewport + padding
  stats: {
    totalItems: number,
    visibleItems: number,
    hiddenItems: number,
    percentVisible: number
  },
  viewportBounds: {
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
  }
}
```

---

### 4. useRealtimeService - Collaboration Features

```typescript
import { useRealtimeService } from '@/hooks';

function CollaborativeCanvas() {
  const {
    isConnected,
    connectedUsers,
    broadcastCanvasUpdate,
    broadcastCursorPosition,
    lockCanvasItem,
    releaseCanvasItem
  } = useRealtimeService({
    projectId: 'project-123',
    enabled: true,
    onError: (error) => console.error('Realtime error:', error)
  });

  const handleItemMove = (itemId: string, x: number, y: number) => {
    broadcastCanvasUpdate(itemId, { x, y }, { width: 100, height: 100 });
  };

  const handleMouseMove = (x: number, y: number) => {
    broadcastCursorPosition(x, y);
  };

  const handleItemEdit = (itemId: string) => {
    lockCanvasItem(itemId);
    // ... edit ...
    releaseCanvasItem(itemId);
  };

  return (
    <div>
      <p>Connected: {isConnected ? '✓' : '✗'}</p>
      <p>Users: {connectedUsers.length}</p>
      {connectedUsers.map(user => (
        <span key={user.userId} style={{ color: user.userColor }}>
          {user.userName}
        </span>
      ))}
    </div>
  );
}
```

**Return Type**:
```typescript
{
  isConnected: boolean,
  connectedUsers: Array<{
    userId: string,
    userName: string,
    userColor: string,
    cursorPosition?: { x: number, y: number }
  }>,
  broadcastCanvasUpdate: (itemId: string, position: any, size: any) => void,
  broadcastCursorPosition: (x: number, y: number) => void,
  lockCanvasItem: (itemId: string) => void,
  releaseCanvasItem: (itemId: string) => void
}
```

---

## Redux Integration Points

### Canvas Actions (useCanvasKeyboard)
```typescript
import {
  setSelection,
  deleteCanvasItems,
  duplicateCanvasItems
} from '@/store/slices/canvasItemsSlice';

dispatch(setSelection(new Set(['id1', 'id2'])));
dispatch(deleteCanvasItems(['id1', 'id2']));
dispatch(duplicateCanvasItems(['id1']));
```

### Execution State (useExecution)
```typescript
import {
  startExecution,
  endExecution
} from '@/store/slices/workflowSlice';

// Automatically dispatched by useExecution hook
// Access via:
const { currentExecution, executionHistory } = useSelector(
  state => ({
    currentExecution: state.workflow.currentExecution,
    executionHistory: state.workflow.executionHistory
  })
);
```

---

## Type Definitions

### ExecutionResult
```typescript
{
  id: string;                    // Unique execution ID
  workflowId: string;            // Workflow being executed
  workflowName: string;          // Display name
  tenantId: string;              // Tenant identifier
  status: 'pending' | 'running' | 'success' | 'error' | 'stopped';
  startTime: number;             // Unix timestamp
  endTime?: number;              // Unix timestamp when complete
  duration?: number;             // Milliseconds
  nodes: NodeExecutionResult[];  // Per-node results
  error?: {                       // Error details if failed
    code: string;
    message: string;
    nodeId?: string;
  };
  input?: Record<string, any>;   // Input parameters
  output?: Record<string, any>;  // Output data
  triggeredBy?: string;          // User ID or "api"
}
```

### ExecutionStats
```typescript
{
  totalExecutions: number;       // Total count
  successCount: number;          // Successful executions
  errorCount: number;            // Failed executions
  averageDuration: number;       // Average duration in seconds
  lastExecution?: ExecutionResult; // Most recent execution
}
```

---

## Error Handling

### Try-Catch Pattern
```typescript
try {
  const result = await execute('workflow-id');
  console.log('Success:', result.status);
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}
```

### Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| "No execution running" | Tried to stop with no active execution | Check `currentExecution?.status === 'running'` first |
| "Failed to execute workflow" | Backend error or invalid workflow | Check workflow ID and inputs |
| "Execution failed" | Network error or local cache failure | App has offline-first support, will retry |

---

## Performance Tips

### 1. Use Virtualization for Large Canvases
```typescript
// For 100+ items, always use virtualization
const { visibleItems } = useCanvasVirtualization(allItems, pan, zoom);
```

### 2. Debounce Cursor Updates
```typescript
const debouncedBroadcast = useMemo(
  () => debounce((x, y) => broadcastCursorPosition(x, y), 100),
  [broadcastCursorPosition]
);
```

### 3. Batch Item Operations
```typescript
// Good: Single dispatch for multiple items
dispatch(deleteCanvasItems(['id1', 'id2', 'id3']));

// Avoid: Multiple dispatches
dispatch(deleteCanvasItems(['id1']));
dispatch(deleteCanvasItems(['id2']));
dispatch(deleteCanvasItems(['id3']));
```

---

## Phase 4 Roadmap

Features coming in Phase 4:
- [ ] Real-time execution progress streaming
- [ ] Conflict resolution for concurrent edits
- [ ] Search dialog integration (Ctrl+F)
- [ ] Execution result streaming
- [ ] Presence awareness with timeouts
- [ ] Connection health metrics

---

## Migration from Phase 2

No migration needed! All Phase 2 APIs remain unchanged. Phase 3 hooks are purely additive.

### What Changed
- useExecution: Stub → Full implementation
- useCanvasKeyboard: Not exported → Integrated into InfiniteCanvas
- useRealtimeService: Documentation enhanced for Phase 4

### What Stayed the Same
- All Redux slices
- All service layers
- All type definitions
- All other hooks

---

## Support & Troubleshooting

### Keyboard shortcuts not working?
1. Check if `InfiniteCanvas` is in DOM
2. Verify no modal dialogs are open
3. Check browser console for errors

### Execution not completing?
1. Verify workflow ID is correct
2. Check network tab for API errors
3. Look in browser's IndexedDB for offline records

### Realtime not connecting?
1. Verify WebSocket URL in environment
2. Check auth token is valid
3. Verify browser WebSocket support

See `PHASE_3_IMPLEMENTATION.md` for detailed docs.

