# Workflow Hooks Plugin - Integration Guide

**Date**: January 23, 2026
**Status**: ✅ COMPLETE AND PRODUCTION READY
**Plugin**: @metabuilder/workflow-plugin-hooks v1.0.0
**Location**: `workflow/plugins/ts/core/hooks/`

---

## What Was Built

A **native workflow hooks plugin** that brings hook-like state management to workflow DAG execution.

```
Client-Side (React)              Server-Side (Workflows)
=====================================
@metabuilder/hooks               @metabuilder/workflow-plugin-hooks
  • useCounter                      • useCounter
  • useToggle                        • useToggle
  • useStateWithHistory              • useStateWithHistory
  • useValidation                    • useValidation
  • useArray                         • useArray
  • useSet                           • useSet
  • useMap                           • useMap
  • ... (104 hooks total)            • useStack
                                     • useQueue
```

---

## Architecture

### Three-Tier Complete Stack

```
┌──────────────────────────────────────────────────┐
│ TIER 1: UI State Management                      │
│ @metabuilder/hooks (React/TypeScript)            │
│ 104 production-ready hooks for components        │
│ Status: ✅ COMPLETE                              │
└──────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│ TIER 2: Workflow State Management               │
│ @metabuilder/workflow-plugin-hooks              │
│ 9 hook types for DAG execution                   │
│ Status: ✅ COMPLETE (NEW)                        │
└──────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│ TIER 3: Low-Level Workflow Execution            │
│ @metabuilder/workflow core                       │
│ DAG processing, plugin registry, execution      │
│ Status: ✅ EXISTING                              │
└──────────────────────────────────────────────────┘
```

---

## How to Use

### 1. In Workflows (JSON)

```json
{
  "nodes": [
    {
      "id": "counter",
      "type": "hook",
      "parameters": {
        "hookType": "useCounter",
        "operation": "increment",
        "key": "count",
        "initial": 0
      }
    },
    {
      "id": "validate",
      "type": "hook",
      "parameters": {
        "hookType": "useValidation",
        "operation": "validate",
        "values": { "email": "user@example.com" },
        "rules": {
          "email": "value.includes('@') ? null : 'Invalid email'"
        }
      }
    }
  ]
}
```

### 2. In TypeScript Plugin Code

```typescript
import { WorkflowHooksExecutor } from '@metabuilder/workflow-plugin-hooks'

// Register the plugin
const hooksExecutor = new WorkflowHooksExecutor()
nodeRegistry.register(hooksExecutor)

// Now 'hook' node type is available in workflows
```

### 3. State Persistence Across Nodes

State from hooks persists across workflow nodes:

```json
{
  "nodes": [
    {
      "id": "init",
      "type": "hook",
      "parameters": {
        "hookType": "useCounter",
        "operation": "set",
        "key": "total",
        "value": 10
      }
    },
    {
      "id": "process",
      "type": "hook",
      "parameters": {
        "hookType": "useCounter",
        "operation": "increment",
        "key": "total"
      }
    },
    {
      "id": "log",
      "type": "log",
      "parameters": {
        "message": "Total is now: {{ state.total }}"
      }
    }
  ]
}
```

Output: `Total is now: 11`

---

## Available Hook Types

### 1. useCounter
**For**: Numeric counters with bounds
**Operations**: increment, decrement, set, reset

```json
{
  "hookType": "useCounter",
  "operation": "increment",
  "key": "counter",
  "initial": 0,
  "min": 0,
  "max": 100
}
```

### 2. useToggle
**For**: Boolean state
**Operations**: toggle, setTrue, setFalse, set, reset

```json
{
  "hookType": "useToggle",
  "operation": "toggle",
  "key": "isActive",
  "initial": false
}
```

### 3. useStateWithHistory
**For**: State with undo/redo
**Operations**: set, undo, redo, reset, getHistory

```json
{
  "hookType": "useStateWithHistory",
  "operation": "set",
  "key": "formData",
  "value": { "email": "user@example.com" },
  "maxHistory": 50
}
```

### 4. useValidation
**For**: Field validation
**Operations**: validate, addRule, clearErrors

```json
{
  "hookType": "useValidation",
  "operation": "validate",
  "values": { "email": "user@example.com" },
  "rules": {
    "email": "value.includes('@') ? null : 'Invalid email'"
  }
}
```

### 5. useArray
**For**: Array operations
**Operations**: push, pop, shift, unshift, insert, remove, removeAt, clear

```json
{
  "hookType": "useArray",
  "operation": "push",
  "key": "items",
  "value": { "id": 1, "name": "Item 1" }
}
```

### 6. useSet
**For**: Set/unique values
**Operations**: add, remove, has, toggle, clear

```json
{
  "hookType": "useSet",
  "operation": "add",
  "key": "tags",
  "value": "javascript"
}
```

### 7. useMap
**For**: Key-value mapping
**Operations**: set, get, delete, has, clear, entries, keys, values

```json
{
  "hookType": "useMap",
  "operation": "set",
  "key": "users",
  "key_": "user1",
  "value": { "name": "John", "email": "john@example.com" }
}
```

### 8. useStack
**For**: LIFO stack (last-in-first-out)
**Operations**: push, pop, peek, clear

```json
{
  "hookType": "useStack",
  "operation": "push",
  "key": "stack",
  "value": "item1"
}
```

### 9. useQueue
**For**: FIFO queue (first-in-first-out)
**Operations**: enqueue, dequeue, peek, clear

```json
{
  "hookType": "useQueue",
  "operation": "enqueue",
  "key": "queue",
  "value": "task1"
}
```

---

## Real-World Examples

### Example 1: Request Rate Limiting

```json
{
  "nodes": [
    {
      "id": "init-count",
      "type": "hook",
      "parameters": {
        "hookType": "useCounter",
        "operation": "set",
        "key": "requestCount",
        "value": 0,
        "max": 100
      }
    },
    {
      "id": "check-limit",
      "type": "branch",
      "condition": "{{ state.requestCount < 100 }}"
    },
    {
      "id": "increment",
      "type": "hook",
      "parameters": {
        "hookType": "useCounter",
        "operation": "increment",
        "key": "requestCount"
      }
    },
    {
      "id": "process-request",
      "type": "http-request",
      "parameters": {
        "url": "https://api.example.com/data"
      }
    }
  ]
}
```

### Example 2: Form Data Collection with Validation

```json
{
  "nodes": [
    {
      "id": "init-form",
      "type": "hook",
      "parameters": {
        "hookType": "useStateWithHistory",
        "operation": "set",
        "key": "formData",
        "value": {
          "email": "",
          "password": "",
          "name": ""
        }
      }
    },
    {
      "id": "validate-form",
      "type": "hook",
      "parameters": {
        "hookType": "useValidation",
        "operation": "validate",
        "values": "{{ state.formData }}",
        "rules": {
          "email": "value.includes('@') ? null : 'Invalid email'",
          "password": "value.length >= 8 ? null : 'Min 8 chars'",
          "name": "value.length > 0 ? null : 'Required'"
        }
      }
    },
    {
      "id": "branch-valid",
      "type": "branch",
      "condition": "{{ previous.isValid }}"
    },
    {
      "id": "submit-form",
      "type": "http-request",
      "parameters": {
        "url": "https://api.example.com/register",
        "method": "POST",
        "body": "{{ state.formData }}"
      }
    }
  ]
}
```

### Example 3: Task Queue Processing

```json
{
  "nodes": [
    {
      "id": "init-queue",
      "type": "hook",
      "parameters": {
        "hookType": "useQueue",
        "operation": "enqueue",
        "key": "taskQueue",
        "value": { "id": 1, "type": "email", "to": "user@example.com" }
      }
    },
    {
      "id": "loop-tasks",
      "type": "loop",
      "condition": "{{ state.taskQueue.length > 0 }}"
    },
    {
      "id": "dequeue-task",
      "type": "hook",
      "parameters": {
        "hookType": "useQueue",
        "operation": "dequeue",
        "key": "taskQueue"
      }
    },
    {
      "id": "process-task",
      "type": "http-request",
      "parameters": {
        "url": "https://api.example.com/tasks",
        "method": "POST",
        "body": "{{ previous.result }}"
      }
    }
  ]
}
```

### Example 4: Multi-Step Form with Undo/Redo

```json
{
  "nodes": [
    {
      "id": "step1",
      "type": "hook",
      "parameters": {
        "hookType": "useStateWithHistory",
        "operation": "set",
        "key": "wizard",
        "value": { "step": 1, "data": {} }
      }
    },
    {
      "id": "step2",
      "type": "hook",
      "parameters": {
        "hookType": "useStateWithHistory",
        "operation": "set",
        "key": "wizard",
        "value": { "step": 2, "data": { "name": "John" } }
      }
    },
    {
      "id": "step3",
      "type": "hook",
      "parameters": {
        "hookType": "useStateWithHistory",
        "operation": "set",
        "key": "wizard",
        "value": { "step": 3, "data": { "name": "John", "email": "john@example.com" } }
      }
    },
    {
      "id": "check-undo",
      "type": "branch",
      "condition": "{{ userClickedBack }}"
    },
    {
      "id": "undo-step",
      "type": "hook",
      "parameters": {
        "hookType": "useStateWithHistory",
        "operation": "undo",
        "key": "wizard"
      }
    },
    {
      "id": "submit",
      "type": "http-request",
      "parameters": {
        "url": "https://api.example.com/submit",
        "method": "POST",
        "body": "{{ state.wizard }}"
      }
    }
  ]
}
```

---

## Migration from Manual State Management

### Before (Manual)
```json
{
  "type": "variable",
  "parameters": {
    "name": "count",
    "value": 0
  }
},
{
  "type": "log",
  "parameters": {
    "message": "Count: {{ state.count }}"
  }
}
```

### After (Using Hooks)
```json
{
  "type": "hook",
  "parameters": {
    "hookType": "useCounter",
    "operation": "set",
    "key": "count",
    "value": 0
  }
}
```

---

## Performance

- **Time Complexity**:
  - Counter operations: O(1)
  - Array push/pop: O(1)
  - Array insert/remove: O(n)
  - Set/Map operations: O(1) average
  - History undo/redo: O(1)

- **Space Complexity**:
  - Counter: O(1)
  - Array: O(n)
  - Set/Map: O(n)
  - History: O(n * m) where m = maxHistory

---

## Error Handling

Hook operations return errors in the result:

```json
{
  "result": null,
  "error": "Unknown hook type: useInvalid",
  "hookType": "useInvalid",
  "operation": "someOp"
}
```

Always check for `error` field in returned state.

---

## Compatibility

- **Workflow System**: v3.0.0+
- **Node.js**: 14+
- **TypeScript**: 5.0+

---

## Next Steps

1. **Register the plugin** in your workflow system's node registry
2. **Add hook nodes** to your workflow definitions
3. **Test with examples** above
4. **Expand with custom hooks** as needed

---

## See Also

- **@metabuilder/hooks** - Client-side React hooks (104 hooks)
- **workflow/plugins/ts/core/hooks/README.md** - Detailed API reference
- **@metabuilder/workflow** - Workflow DAG engine documentation

---

## Summary

The workflow hooks plugin brings **familiar hook patterns to server-side DAG execution**, enabling:

✅ State management with familiar APIs
✅ Undo/redo for complex workflows
✅ Validation in workflows
✅ Data structure operations
✅ Cross-node state persistence

**Status**: Production Ready
**Location**: `workflow/plugins/ts/core/hooks/`
**Version**: 1.0.0
**Last Updated**: January 23, 2026

---

## Quick Reference

| Hook Type | Use Case | Main Operations |
|-----------|----------|-----------------|
| useCounter | Numeric values | increment, decrement, set |
| useToggle | Boolean state | toggle, set |
| useStateWithHistory | Undo/redo | set, undo, redo |
| useValidation | Field errors | validate, addRule |
| useArray | Collections | push, pop, insert, remove |
| useSet | Unique values | add, remove, has |
| useMap | Key-value pairs | set, get, delete |
| useStack | LIFO | push, pop, peek |
| useQueue | FIFO | enqueue, dequeue, peek |
