# Hooks Library - Workflow Integration Analysis

**Date**: January 23, 2026  
**Status**: Analysis Complete  
**Conclusion**: Hooks are frontend-only; workflows need different approach

---

## Quick Answer

**Can hooks be used directly in workflows?** ❌ No

**Why?** Hooks are React client-side utilities. Workflows are backend/server-side processes. Different execution contexts.

---

## Architecture Overview

### Hooks (@metabuilder/hooks)
- **Runtime**: Browser/Client (React)
- **Execution**: Synchronous state management
- **Use Cases**: UI component state, form handling, DOM events
- **Scope**: Single component or component tree
- **Trigger**: User interactions, React effects

### Workflows (@metabuilder/workflow)
- **Runtime**: Server/Backend (Node.js, Python, C++)
- **Execution**: Asynchronous DAG processing
- **Use Cases**: Multi-step processes, data pipelines, integrations
- **Scope**: Entire application, across services
- **Trigger**: Events, schedules, API calls

---

## Why They're Incompatible

### React Hooks Require:
1. **React Context** - `useState`, `useEffect`, `useContext` etc.
2. **Component Lifecycle** - Hooks tied to component render cycles
3. **Browser APIs** - `localStorage`, `window`, `DOM` manipulation
4. **Client State** - Per-user, per-session temporary state

### Workflow Execution Is:
1. **Pure Functions** - Stateless node execution
2. **DAG Processing** - Directed acyclic graph of operations
3. **Server-Side** - No browser, no React, no DOM
4. **Persistent State** - Database, not memory

---

## Integration Approach: Hooks → Workflows

If you want workflow state management **similar to hooks**, use **workflow plugins** instead:

### Pattern 1: State Management Plugin

Create a workflow plugin that mimics hook behavior:

```typescript
// workflow/plugins/ts/core/state-manager/src/index.ts

import { INodeExecutor, WorkflowNode, WorkflowContext, ExecutionState, NodeResult } from '@metabuilder/workflow'

export class StateManagerExecutor implements INodeExecutor {
  nodeType = 'state-manager'
  category = 'core'
  description = 'Manage workflow state (like hooks)'

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const { operation, key, value, defaultValue } = node.parameters

    switch (operation) {
      case 'set':
        return {
          result: { 
            [key]: value,
            previousValue: state[key]
          }
        }

      case 'get':
        return {
          result: state[key] ?? defaultValue
        }

      case 'update':
        // Like setState with updater function
        const updater = new Function('prev', `return ${value}`)
        return {
          result: updater(state[key])
        }

      case 'toggle':
        // Like useToggle
        return {
          result: !state[key]
        }

      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }
}
```

### Pattern 2: Use Hooks in Workflow UI

Hooks ARE useful in the workflow editor/designer UI:

```typescript
// workflowui/src/components/WorkflowEditor.tsx

import { useToggle, useAsync, useInput } from '@metabuilder/hooks'

export function WorkflowEditor() {
  const { value: isExpanded, toggle } = useToggle(false)
  const { value: selectedNodeId, setValue } = useInput('')
  const { execute: saveWorkflow, loading: isSaving } = useAsync(persistWorkflow)

  return (
    <div>
      <button onClick={toggle}>
        {isExpanded ? 'Collapse' : 'Expand'} Workflow
      </button>
      <input 
        value={selectedNodeId}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Select node..."
      />
      <button 
        onClick={() => saveWorkflow()} 
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
```

### Pattern 3: Hooks in Workflow Execution UI

Use hooks to display workflow execution state:

```typescript
// workflowui/src/hooks/useWorkflowExecution.ts (custom hook using @metabuilder/hooks)

import { useState, useCallback, useEffect } from 'react'
import { useAsync } from '@metabuilder/hooks'

export function useWorkflowExecution(workflowId: string) {
  const [execution, setExecution] = useState(null)
  const [nodes, setNodes] = useState([])

  const { execute: start, loading, error } = useAsync(
    async () => {
      const result = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST'
      }).then(r => r.json())
      
      setExecution(result)
      return result
    }
  )

  return { execution, nodes, start, loading, error }
}
```

---

## When to Use Each

| Scenario | Use Hooks | Use Workflows |
|----------|-----------|---------------|
| Form input state | ✅ useInput | ❌ |
| Toggle visibility | ✅ useToggle | ❌ |
| Window resize tracking | ✅ useWindowSize | ❌ |
| Keyboard shortcuts | ✅ useKeyboardShortcuts | ❌ |
| Component data fetching | ✅ useAsync | ❌ |
| Multi-step process (UI) | ✅ useStateWithHistory | ❌ |
| Multi-step process (Server) | ❌ | ✅ Workflow DAG |
| Database operations | ❌ | ✅ Workflow + DBAL |
| API integrations | ❌ (client-side) | ✅ Workflow |
| Data transformation | Can use custom hooks | ✅ Workflow plugins |
| Scheduled tasks | ❌ | ✅ Workflow scheduler |
| Event processing | ❌ (client) | ✅ Workflow triggers |

---

## Workflow Alternative: Custom Plugins

### Available Plugin Categories (TypeScript)

Workflows have these built-in node types:

```
Core:         variable, branch, loop, error-handler
Integration:  http-request, smtp-relay, email-send, webhook
Data:         filter, map, reduce, aggregate, sort
DBAL:         query, create, update, delete
Utilities:    delay, log, transform, validate
```

### Creating Custom Workflow Plugins

```typescript
// workflow/plugins/ts/custom/counter/src/index.ts

import { INodeExecutor, NodeResult } from '@metabuilder/workflow'

export class CounterExecutor implements INodeExecutor {
  nodeType = 'counter'
  category = 'utilities'
  description = 'Increment/decrement counter (like useCounter)'

  async execute(node, context, state): Promise<NodeResult> {
    const { action, initial = 0, min = -Infinity, max = Infinity } = node.parameters
    const current = state.counter ?? initial

    let result = current
    if (action === 'increment') {
      result = Math.min(current + 1, max)
    } else if (action === 'decrement') {
      result = Math.max(current - 1, min)
    }

    return {
      result,
      counter: result,
      canIncrement: result < max,
      canDecrement: result > min
    }
  }
}
```

---

## Recommended Integration Strategy

### 1. **Use Hooks in WorkflowUI** ✅
The workflow **editor/designer** can use hooks for UI state:
```typescript
import { useToggle, useInput, useAsync } from '@metabuilder/hooks'
// Use in WorkflowEditor, NodeInspector, etc.
```

### 2. **Use Workflows for Data Processing** ✅
Workflows handle multi-step backend processes:
```json
{
  "nodes": [
    { "type": "query", "entity": "users" },
    { "type": "filter", "condition": "status === 'active'" },
    { "type": "http-request", "url": "..." },
    { "type": "log", "message": "Done!" }
  ]
}
```

### 3. **Use Hooks to Display Workflow State** ✅
```typescript
const { execution, loading, error } = useWorkflowExecution(workflowId)
const { value: autoRefresh, toggle } = useToggle(true)
const { execute: cancel } = useAsync(cancelExecution)
```

### 4. **Create Custom Workflow Plugins** ✅
If you need state management in workflows, create plugins:
```typescript
// Mimics useCounter, useToggle, useStateWithHistory
export class StateNodeExecutor implements INodeExecutor { ... }
```

---

## Code Examples

### Example 1: Workflow Editor using Hooks

```typescript
// workflowui/src/components/WorkflowCanvas.tsx

import { useToggle, useInput, useKeyboardShortcuts, useWindowSize } from '@metabuilder/hooks'

export function WorkflowCanvas() {
  const { width, height } = useWindowSize()
  const { value: panMode, toggle: togglePanMode } = useToggle(false)
  const { value: selectedNodeId, setValue: selectNode } = useInput('')
  const { registerShortcut } = useKeyboardShortcuts()

  // Register workflow shortcuts
  registerShortcut('ctrl+shift+p', () => togglePanMode())
  registerShortcut('delete', () => deleteSelectedNode())

  return (
    <div 
      style={{ width, height }}
      onMouseDown={panMode ? handlePan : undefined}
    >
      {/* Canvas UI using hooks */}
    </div>
  )
}
```

### Example 2: Workflow Execution Monitor using Hooks

```typescript
// workflowui/src/components/ExecutionMonitor.tsx

import { useAsync, useInterval, useToggle } from '@metabuilder/hooks'

export function ExecutionMonitor({ executionId }) {
  const { value: autoRefresh, toggle } = useToggle(true)
  const { execute: fetchExecution, loading, error } = useAsync(
    async () => {
      const response = await fetch(`/api/executions/${executionId}`)
      return response.json()
    }
  )

  // Auto-refresh every 2 seconds if enabled
  useInterval(
    () => {
      if (autoRefresh) {
        fetchExecution()
      }
    },
    2000,
    [autoRefresh]
  )

  return (
    <div>
      <button onClick={toggle}>
        {autoRefresh ? 'Stop' : 'Start'} Auto-refresh
      </button>
      {/* Show execution status */}
    </div>
  )
}
```

### Example 3: Workflow Plugin (State Management)

```typescript
// workflow/plugins/ts/core/state-operations/src/index.ts

export class StateOperationsExecutor implements INodeExecutor {
  nodeType = 'state-operations'
  category = 'core'

  async execute(node, context, state) {
    const { operation, path, value } = node.parameters

    switch (operation) {
      case 'set':
        // Like useState setter
        return { result: { [path]: value } }

      case 'toggle':
        // Like useToggle
        return { result: { [path]: !state[path] } }

      case 'increment':
        // Like useCounter increment
        return { result: { [path]: (state[path] ?? 0) + 1 } }

      case 'append':
        // Like useArray push
        return { result: { [path]: [...(state[path] ?? []), value] } }

      case 'remove':
        // Like useArray remove
        const arr = state[path] ?? []
        return { result: { [path]: arr.filter((_, i) => i !== value) } }

      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }
}
```

---

## Summary Table

| Aspect | Hooks | Workflows |
|--------|-------|-----------|
| **Runtime** | Browser/Client | Server/Backend |
| **State** | Component state | Execution state |
| **Trigger** | User events | Schedules/Events |
| **Scope** | Single component | Multiple services |
| **Good For** | UI interactions | Data processing |
| **When to Use** | WorkflowUI editor | Workflow execution |
| **State Management** | useState pattern | DAG + plugins |

---

## Conclusion

✅ **Hooks ARE useful in workflows** - but in the **workflow UI editor**, not in workflow execution  
✅ **For workflow state**, create **custom workflow plugins**  
✅ **For UI state in workflow editor**, use **@metabuilder/hooks**  
✅ **This separates concerns** - client state vs. server state  

The two technologies serve different purposes and work best when used in their respective domains.

---

## Next Steps

If you want to enhance workflow state management:

1. **Create workflow plugins** that mimic hook behavior
2. **Use hooks in workflowui** for editor UI state
3. **Document plugin patterns** for state operations
4. **Provide examples** of common workflow state patterns

These are optional but would provide better developer experience for workflows.
