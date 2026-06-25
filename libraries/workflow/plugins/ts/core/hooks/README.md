# Workflow Hooks Plugin

**Version**: 1.0.0
**Status**: Production Ready
**Purpose**: Provide hook-like state management in workflow DAG execution

---

## Overview

The Workflow Hooks Plugin enables hook-like state management operations directly in workflow definitions. It mirrors the API of `@metabuilder/hooks` but works in the server-side DAG execution context (not React).

This allows workflows to use familiar hook patterns for:
- Counters (increment, decrement, bounds)
- Toggles (boolean state)
- History management (undo/redo)
- Validation (field-level errors)
- Data structures (arrays, sets, maps, stacks, queues)

---

## Installation

The plugin is built into the workflow system. Import and register in the node registry:

```typescript
import WorkflowHooksExecutor from '@metabuilder/workflow-plugin-hooks'

// Register in node registry
nodeRegistry.register(new WorkflowHooksExecutor())
```

---

## Usage

All hook operations use the same node type: `hook`

### Basic Structure

```json
{
  "type": "hook",
  "parameters": {
    "hookType": "useCounter",
    "operation": "increment",
    "key": "myCounter",
    "initial": 0,
    "min": 0,
    "max": 100
  }
}
```

---

## Available Hooks

### useCounter - Counter state management

**Operations**: `increment`, `decrement`, `set`, `reset`

```json
{
  "type": "hook",
  "parameters": {
    "hookType": "useCounter",
    "operation": "increment",
    "key": "counter",
    "initial": 0,
    "min": 0,
    "max": 100
  }
}
```

**Returns**:
- `result`: New counter value
- `[key]`: Updated counter state
- `canIncrement`: Boolean indicating if increment is allowed
- `canDecrement`: Boolean indicating if decrement is allowed

**Examples**:
```json
// Increment
{ "hookType": "useCounter", "operation": "increment", "key": "count", "initial": 0, "max": 10 }

// Decrement
{ "hookType": "useCounter", "operation": "decrement", "key": "count", "min": 0 }

// Set value
{ "hookType": "useCounter", "operation": "set", "key": "count", "value": 5 }

// Reset to initial
{ "hookType": "useCounter", "operation": "reset", "key": "count", "initial": 0 }
```

---

### useToggle - Boolean state management

**Operations**: `toggle`, `setTrue`, `setFalse`, `set`, `reset`

```json
{
  "type": "hook",
  "parameters": {
    "hookType": "useToggle",
    "operation": "toggle",
    "key": "isVisible",
    "initial": false
  }
}
```

**Returns**:
- `result`: New boolean value
- `[key]`: Updated toggle state
- `value`: Current value

**Examples**:
```json
// Toggle
{ "hookType": "useToggle", "operation": "toggle", "key": "isVisible" }

// Set true
{ "hookType": "useToggle", "operation": "setTrue", "key": "isActive" }

// Set false
{ "hookType": "useToggle", "operation": "setFalse", "key": "isLoading" }

// Set custom value
{ "hookType": "useToggle", "operation": "set", "key": "flag", "value": true }

// Reset to initial
{ "hookType": "useToggle", "operation": "reset", "key": "isOpen", "initial": false }
```

---

### useStateWithHistory - State with undo/redo

**Operations**: `set`, `undo`, `redo`, `reset`, `getHistory`

```json
{
  "type": "hook",
  "parameters": {
    "hookType": "useStateWithHistory",
    "operation": "set",
    "key": "formState",
    "value": { "email": "user@example.com", "name": "John" },
    "initial": {},
    "maxHistory": 50
  }
}
```

**Returns**:
- `result`: Current state value
- `[key]`: Updated history state with index
- `current`: Current value
- `canUndo`: Boolean indicating if undo is available
- `canRedo`: Boolean indicating if redo is available

**Examples**:
```json
// Set new state
{ "hookType": "useStateWithHistory", "operation": "set", "key": "data", "value": {"updated": true} }

// Undo
{ "hookType": "useStateWithHistory", "operation": "undo", "key": "data" }

// Redo
{ "hookType": "useStateWithHistory", "operation": "redo", "key": "data" }

// Get full history
{ "hookType": "useStateWithHistory", "operation": "getHistory", "key": "data" }

// Reset
{ "hookType": "useStateWithHistory", "operation": "reset", "key": "data", "initial": {} }
```

---

### useValidation - Field validation

**Operations**: `validate`, `addRule`, `clearErrors`

```json
{
  "type": "hook",
  "parameters": {
    "hookType": "useValidation",
    "operation": "validate",
    "key": "formValidation",
    "values": {
      "email": "user@example.com",
      "password": "secret123"
    },
    "rules": {
      "email": "value.includes('@') ? null : 'Invalid email'",
      "password": "value.length >= 8 ? null : 'Min 8 characters'"
    }
  }
}
```

**Returns**:
- `result`: Object with errors and isValid
- `errors`: Record of field errors (null if valid)
- `isValid`: Boolean indicating if all validations passed
- `[key]`: Updated validation state

**Examples**:
```json
// Validate fields
{
  "hookType": "useValidation",
  "operation": "validate",
  "values": { "email": "user@example.com" },
  "rules": { "email": "value.includes('@') ? null : 'Invalid email'" }
}

// Add validation rule
{
  "hookType": "useValidation",
  "operation": "addRule",
  "key": "validator",
  "field": "name",
  "rule": "value.length > 0 ? null : 'Required'"
}

// Clear errors
{ "hookType": "useValidation", "operation": "clearErrors", "key": "validator" }
```

---

### useArray - Array operations

**Operations**: `push`, `pop`, `shift`, `unshift`, `insert`, `remove`, `removeAt`, `clear`

```json
{
  "type": "hook",
  "parameters": {
    "hookType": "useArray",
    "operation": "push",
    "key": "items",
    "value": { "id": 1, "name": "Item 1" },
    "initialValue": []
  }
}
```

**Returns**:
- `result`: Modified array
- `[key]`: Updated array state
- `length`: New array length

**Examples**:
```json
// Push
{ "hookType": "useArray", "operation": "push", "key": "items", "value": {"id": 1} }

// Pop
{ "hookType": "useArray", "operation": "pop", "key": "items" }

// Insert at index
{ "hookType": "useArray", "operation": "insert", "key": "items", "index": 2, "value": {"id": 3} }

// Remove by value
{ "hookType": "useArray", "operation": "remove", "key": "items", "value": {"id": 1} }

// Remove at index
{ "hookType": "useArray", "operation": "removeAt", "key": "items", "index": 0 }

// Clear
{ "hookType": "useArray", "operation": "clear", "key": "items" }
```

---

### useSet - Set operations

**Operations**: `add`, `remove`, `has`, `toggle`, `clear`

```json
{
  "type": "hook",
  "parameters": {
    "hookType": "useSet",
    "operation": "add",
    "key": "selectedItems",
    "value": "item1",
    "initialValue": []
  }
}
```

**Returns**:
- `result`: Array of set values
- `[key]`: Updated set state
- `size`: Set size

**Examples**:
```json
// Add
{ "hookType": "useSet", "operation": "add", "key": "tags", "value": "javascript" }

// Remove
{ "hookType": "useSet", "operation": "remove", "key": "tags", "value": "python" }

// Check membership
{ "hookType": "useSet", "operation": "has", "key": "tags", "value": "javascript" }

// Toggle
{ "hookType": "useSet", "operation": "toggle", "key": "tags", "value": "rust" }

// Clear
{ "hookType": "useSet", "operation": "clear", "key": "tags" }
```

---

### useMap - Map operations

**Operations**: `set`, `get`, `delete`, `has`, `clear`, `entries`, `keys`, `values`

```json
{
  "type": "hook",
  "parameters": {
    "hookType": "useMap",
    "operation": "set",
    "key": "userMap",
    "key_": "user1",
    "value": { "name": "John", "email": "john@example.com" }
  }
}
```

**Returns**:
- `result`: Current map value/entries
- `[key]`: Updated map state
- `size`: Map size

**Note**: Parameter `key_` is used for map key (to avoid conflict with node `key`)

**Examples**:
```json
// Set
{ "hookType": "useMap", "operation": "set", "key": "data", "key_": "user1", "value": {"name": "John"} }

// Get
{ "hookType": "useMap", "operation": "get", "key": "data", "key_": "user1" }

// Delete
{ "hookType": "useMap", "operation": "delete", "key": "data", "key_": "user1" }

// Check membership
{ "hookType": "useMap", "operation": "has", "key": "data", "key_": "user1" }

// Get all entries
{ "hookType": "useMap", "operation": "entries", "key": "data" }

// Get all keys
{ "hookType": "useMap", "operation": "keys", "key": "data" }

// Get all values
{ "hookType": "useMap", "operation": "values", "key": "data" }

// Clear
{ "hookType": "useMap", "operation": "clear", "key": "data" }
```

---

### useStack - LIFO stack operations

**Operations**: `push`, `pop`, `peek`, `clear`

```json
{
  "type": "hook",
  "parameters": {
    "hookType": "useStack",
    "operation": "push",
    "key": "stack",
    "value": "item1"
  }
}
```

**Returns**:
- `result`: Top of stack or updated stack
- `[key]`: Updated stack state
- `size`: Stack size

**Examples**:
```json
// Push
{ "hookType": "useStack", "operation": "push", "key": "stack", "value": "item1" }

// Pop
{ "hookType": "useStack", "operation": "pop", "key": "stack" }

// Peek
{ "hookType": "useStack", "operation": "peek", "key": "stack" }

// Clear
{ "hookType": "useStack", "operation": "clear", "key": "stack" }
```

---

### useQueue - FIFO queue operations

**Operations**: `enqueue`, `dequeue`, `peek`, `clear`

```json
{
  "type": "hook",
  "parameters": {
    "hookType": "useQueue",
    "operation": "enqueue",
    "key": "queue",
    "value": "item1"
  }
}
```

**Returns**:
- `result`: Front of queue or updated queue
- `[key]`: Updated queue state
- `size`: Queue size

**Examples**:
```json
// Enqueue
{ "hookType": "useQueue", "operation": "enqueue", "key": "queue", "value": "item1" }

// Dequeue
{ "hookType": "useQueue", "operation": "dequeue", "key": "queue" }

// Peek
{ "hookType": "useQueue", "operation": "peek", "key": "queue" }

// Clear
{ "hookType": "useQueue", "operation": "clear", "key": "queue" }
```

---

## Complete Workflow Example

```json
{
  "version": "1.0.0",
  "nodes": [
    {
      "id": "init-counter",
      "type": "hook",
      "parameters": {
        "hookType": "useCounter",
        "operation": "set",
        "key": "requestCount",
        "value": 0,
        "min": 0,
        "max": 100
      }
    },
    {
      "id": "check-limit",
      "type": "branch",
      "condition": "{{ state.requestCount < 100 }}"
    },
    {
      "id": "increment-counter",
      "type": "hook",
      "parameters": {
        "hookType": "useCounter",
        "operation": "increment",
        "key": "requestCount"
      }
    },
    {
      "id": "track-toggle",
      "type": "hook",
      "parameters": {
        "hookType": "useToggle",
        "operation": "toggle",
        "key": "isProcessing"
      }
    },
    {
      "id": "validate-data",
      "type": "hook",
      "parameters": {
        "hookType": "useValidation",
        "operation": "validate",
        "values": "{{ data }}",
        "rules": {
          "email": "value.includes('@') ? null : 'Invalid email'",
          "age": "value >= 18 ? null : 'Must be 18+'"
        }
      }
    },
    {
      "id": "collect-items",
      "type": "hook",
      "parameters": {
        "hookType": "useArray",
        "operation": "push",
        "key": "results",
        "value": "{{ processedItem }}"
      }
    }
  ]
}
```

---

## Return Value Structure

All hook operations return:

```typescript
{
  result: any           // Primary result
  [key]: any           // Updated state with given key
  error?: string       // Error message if operation fails
  hookType: string     // The hook type that was executed
  operation: string    // The operation that was performed
  // ... hook-specific fields (canIncrement, isValid, size, etc.)
}
```

---

## State Persistence

Hook state is stored in the workflow execution state and persists across nodes:

```json
{
  "nodes": [
    {
      "id": "node1",
      "type": "hook",
      "parameters": {
        "hookType": "useCounter",
        "operation": "set",
        "key": "count",
        "value": 5
      }
    },
    {
      "id": "node2",
      "type": "hook",
      "parameters": {
        "hookType": "useCounter",
        "operation": "increment",
        "key": "count"
      }
    }
  ]
}
```

After node1: `state.count = 5`
After node2: `state.count = 6`

---

## Error Handling

Operations return errors in the result:

```json
{
  "result": null,
  "error": "Unknown hook type: useInvalidHook",
  "hookType": "useInvalidHook",
  "operation": "someOp"
}
```

---

## Performance Characteristics

- **Simple operations** (toggle, increment): O(1)
- **Array operations**: O(n) for filter/search, O(1) for push/pop
- **Set/Map operations**: O(1) average case
- **History operations**: O(1) for set/undo/redo
- **Validation**: O(n) where n = number of rules

---

## Compatibility

- **Workflow System**: v3.0.0+
- **Node.js**: 14+
- **TypeScript**: 5.0+

---

## See Also

- **@metabuilder/hooks** - React hooks library (client-side)
- **@metabuilder/workflow** - Workflow DAG engine
- **Workflow Plugin System** - Plugin architecture documentation

---

**Status**: Production Ready
**Last Updated**: January 23, 2026
**Version**: 1.0.0
