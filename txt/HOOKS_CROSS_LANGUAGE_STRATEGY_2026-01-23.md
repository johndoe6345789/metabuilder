# Hooks Library - Cross-Language Strategy

**Date**: January 23, 2026  
**Status**: Strategic Analysis  
**Question**: How can hooks concepts work across TypeScript, Python, Go, Rust, Mojo, C++?

---

## The Real Insight

You're right - workflows are **cross-language**. The hooks library (React/TypeScript) is **single-language**. 

This suggests a different opportunity: **Create language-agnostic utility libraries** that implement the same patterns as hooks, but for each workflow language.

---

## Three-Tier Architecture

### Tier 1: @metabuilder/hooks (React/TypeScript) ✅ COMPLETE
- Client-side state management
- UI component hooks
- Browser APIs
- Status: **Production ready**

### Tier 2: Workflow Utilities (Multi-Language) 🔧 OPPORTUNITY
Create language-specific utility libraries for workflow plugins:
- `@metabuilder/workflow-utils-ts` - TypeScript utilities
- `@metabuilder/workflow-utils-py` - Python utilities
- `@metabuilder/workflow-utils-go` - Go utilities
- `@metabuilder/workflow-utils-rust` - Rust utilities

### Tier 3: Workflow Plugins (Language-Native) 📦 EXISTING
- Individual plugin implementations
- Language-specific optimization
- Status: **Already in place**

---

## Proposed Multi-Language Utilities

### 1. State Management Utilities

**TypeScript** (`@metabuilder/workflow-utils-ts`):
```typescript
export class StateManager<T> {
  private state: T
  private history: T[] = []
  
  constructor(initialValue: T) {
    this.state = initialValue
    this.history.push(initialValue)
  }
  
  get(): T { return this.state }
  
  set(value: T): void {
    this.history.push(this.state)
    this.state = value
  }
  
  update(fn: (prev: T) => T): void {
    this.set(fn(this.state))
  }
  
  undo(): boolean {
    if (this.history.length > 0) {
      this.state = this.history.pop()!
      return true
    }
    return false
  }
  
  reset(initial: T): void {
    this.state = initial
    this.history = [initial]
  }
}
```

**Python** (`@metabuilder/workflow-utils-py`):
```python
from typing import TypeVar, Generic, Callable, List

T = TypeVar('T')

class StateManager(Generic[T]):
    def __init__(self, initial_value: T):
        self.state = initial_value
        self.history: List[T] = [initial_value]
    
    def get(self) -> T:
        return self.state
    
    def set(self, value: T) -> None:
        self.history.append(self.state)
        self.state = value
    
    def update(self, fn: Callable[[T], T]) -> None:
        self.set(fn(self.state))
    
    def undo(self) -> bool:
        if self.history:
            self.state = self.history.pop()
            return True
        return False
    
    def reset(self, initial: T) -> None:
        self.state = initial
        self.history = [initial]
```

**Go** (`@metabuilder/workflow-utils-go`):
```go
package workflow

type StateManager[T any] struct {
    state   T
    history []T
}

func NewStateManager[T any](initial T) *StateManager[T] {
    return &StateManager[T]{
        state:   initial,
        history: []T{initial},
    }
}

func (s *StateManager[T]) Get() T {
    return s.state
}

func (s *StateManager[T]) Set(value T) {
    s.history = append(s.history, s.state)
    s.state = value
}

func (s *StateManager[T]) Update(fn func(T) T) {
    s.Set(fn(s.state))
}

func (s *StateManager[T]) Undo() bool {
    if len(s.history) > 0 {
        s.state = s.history[len(s.history)-1]
        s.history = s.history[:len(s.history)-1]
        return true
    }
    return false
}
```

### 2. Data Structure Utilities

**Common across all languages**:
- `Counter` / `useCounter` equivalent
- `Toggle` / `useToggle` equivalent
- `Stack<T>` / `useStack` equivalent
- `Queue<T>` / `useQueue` equivalent
- `Set<T>` / `useSet` equivalent
- `Map<K,V>` / `useMap` equivalent

**Example: Counter in all languages**

TypeScript:
```typescript
class Counter {
  private value: number
  constructor(initial: number = 0, public min = -Infinity, public max = Infinity) {
    this.value = initial
  }
  get(): number { return this.value }
  increment(): number { return this.value = Math.min(this.value + 1, this.max) }
  decrement(): number { return this.value = Math.max(this.value - 1, this.min) }
  reset(initial: number): void { this.value = initial }
}
```

Python:
```python
class Counter:
    def __init__(self, initial: int = 0, min_val: int = float('-inf'), max_val: int = float('inf')):
        self.value = initial
        self.min = min_val
        self.max = max_val
    
    def get(self) -> int: return self.value
    def increment(self) -> int:
        self.value = min(self.value + 1, self.max)
        return self.value
    def decrement(self) -> int:
        self.value = max(self.value - 1, self.min)
        return self.value
    def reset(self, initial: int): self.value = initial
```

Go:
```go
type Counter struct {
    value int
    min   int
    max   int
}

func NewCounter(initial, min, max int) *Counter {
    return &Counter{value: initial, min: min, max: max}
}

func (c *Counter) Get() int { return c.value }
func (c *Counter) Increment() int {
    if c.value < c.max {
        c.value++
    }
    return c.value
}
func (c *Counter) Decrement() int {
    if c.value > c.min {
        c.value--
    }
    return c.value
}
func (c *Counter) Reset(initial int) { c.value = initial }
```

### 3. Validation Utilities

**Example: Validation across languages**

TypeScript:
```typescript
type ValidationFn<T> = (value: T) => string | null

class Validator<T> {
  private rules: Map<string, ValidationFn<T>> = new Map()
  
  addRule(field: string, fn: ValidationFn<T>): void {
    this.rules.set(field, fn)
  }
  
  validate(data: T): Record<string, string | null> {
    const errors: Record<string, string | null> = {}
    for (const [field, fn] of this.rules) {
      errors[field] = fn(data)
    }
    return errors
  }
  
  isValid(data: T): boolean {
    return Object.values(this.validate(data)).every(e => e === null)
  }
}
```

Python:
```python
from typing import Callable, Dict, Any

ValidationFn = Callable[[Any], str | None]

class Validator:
    def __init__(self):
        self.rules: Dict[str, ValidationFn] = {}
    
    def add_rule(self, field: str, fn: ValidationFn) -> None:
        self.rules[field] = fn
    
    def validate(self, data: Any) -> Dict[str, str | None]:
        return {field: fn(data) for field, fn in self.rules.items()}
    
    def is_valid(self, data: Any) -> bool:
        return all(error is None for error in self.validate(data).values())
```

---

## Implementation Strategy

### Phase 1: Core Utilities (Tier 2)
Create minimal utility libraries for each language:

**TypeScript**:
- StateManager<T>
- Counter, Toggle, Stack, Queue, Set, Map
- Validator<T>
- Package: @metabuilder/workflow-utils-ts

**Python**:
- StateManager[T]
- Counter, Toggle, Stack, Queue, Set, Dict
- Validator
- Package: metabuilder-workflow-utils (pip)

**Go**:
- StateManager[T]
- Counter, Toggle, Stack, Queue, Set, Map
- Validator
- Package: github.com/metabuilder/workflow-utils-go

**Rust** (Optional):
- StateManager<T>
- Counter, Toggle, Stack, Queue, Set, HashMap
- Validator
- Package: metabuilder-workflow-utils (crates.io)

### Phase 2: Workflow Plugins
Use utilities in workflow plugin implementations:

```typescript
// workflow/plugins/ts/core/state-ops/src/index.ts
import { StateManager, Counter, Toggle } from '@metabuilder/workflow-utils-ts'

export class StateOpsExecutor {
  private stateManager = new StateManager({})
  private counters = new Map<string, Counter>()
  
  async execute(node, context, state) {
    const { operation, key, value } = node.parameters
    
    if (operation === 'counter.increment') {
      const counter = this.counters.get(key) || new Counter()
      return { result: counter.increment() }
    }
    // ... more operations
  }
}
```

```python
# workflow/plugins/python/core/state_ops/executor.py
from metabuilder_workflow_utils import StateManager, Counter, Toggle

class StateOpsExecutor:
    def __init__(self):
        self.state_manager = StateManager({})
        self.counters = {}
    
    async def execute(self, node, context, state):
        operation = node.parameters.get('operation')
        key = node.parameters.get('key')
        
        if operation == 'counter.increment':
            counter = self.counters.get(key, Counter())
            return {'result': counter.increment()}
```

### Phase 3: Documentation & Examples
- API reference for each language
- Workflow examples using utilities
- Best practices for cross-language patterns
- Integration with existing plugins

---

## Benefits

### For TypeScript/React Developers
✅ Familiar patterns (like React hooks but for workflows)
✅ State management in TypeScript plugins
✅ Consistent API across languages

### For Python/Go/Rust Developers
✅ Common utility libraries (like hooks but language-native)
✅ Reduced code duplication
✅ Faster plugin development

### For Workflow Users
✅ Standardized workflow state operations
✅ Cross-language consistency
✅ Better plugin ecosystem

---

## What This Enables

### Current State
- Hooks library: React/TypeScript only
- Workflows: Multi-language but no shared utilities

### Proposed State
- Hooks library: React/TypeScript (client-side) ✅ DONE
- Workflow utilities: Multi-language (server-side) 🔧 PROPOSED
- Consistent patterns across entire MetaBuilder

---

## Not Required But Valuable

This is **optional** - hooks library is already complete and production-ready. But creating multi-language workflow utilities would:

1. **Extend the hooks concept** to backend workflows
2. **Unify development experience** across languages
3. **Reduce plugin complexity** with shared utilities
4. **Improve code consistency** in workflow ecosystem

---

## Quick Wins (If Implemented)

### For TypeScript Workflows
```typescript
// Before: Manual state management
let count = 0
if (operation === 'increment') count++
return { count }

// After: Using utilities
const counter = new Counter()
counter.increment()
return { count: counter.get() }
```

### For Python Workflows
```python
# Before: Manual state management
state['count'] = state.get('count', 0) + 1
return {'count': state['count']}

# After: Using utilities
counter = Counter()
counter.increment()
return {'count': counter.get()}
```

---

## Summary

| Aspect | Hooks | Workflow Utils |
|--------|-------|----------------|
| **Language** | React/TypeScript | Multi-language |
| **Use Case** | Client UI state | Workflow state |
| **Runtime** | Browser | Server |
| **Status** | ✅ Complete | 🔧 Proposed |
| **Scope** | Component state | Workflow execution |

---

## Decision Points

1. **Do nothing**: Hooks library is complete. Workflows use language-native utilities. ✅ Current state (valid)

2. **Create workflow utilities**: Add @metabuilder/workflow-utils-* packages for each language. (Optional enhancement)

3. **Integrate with plugins**: Use utilities in workflow plugin implementations. (Optional enhancement)

The hooks library is production-ready either way. These utilities would just provide a consistent, familiar development experience for workflow developers.

