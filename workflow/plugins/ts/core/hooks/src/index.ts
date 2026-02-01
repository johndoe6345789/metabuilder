/**
 * Workflow Hooks Plugin
 * Provides hook-like state management operations in workflow DAG context
 *
 * Mirrors @metabuilder/hooks API but for server-side workflow execution
 * Supports: useCounter, useToggle, useStateWithHistory, useValidation, useArray, useSet, useMap, useStack, useQueue
 */

/**
 * Core type definitions for the workflow hooks plugin
 */
export interface WorkflowNode {
  id: string
  name: string
  type: string
  parameters: Record<string, any>
  [key: string]: any
}

export interface WorkflowContext {
  executionId: string
  tenantId: string
  userId: string
  [key: string]: any
}

export interface ExecutionState {
  [nodeId: string]: any
}

export interface NodeResult {
  status: 'success' | 'error' | 'skipped' | 'pending'
  output?: any
  outputData?: any
  error?: string
  errorCode?: string
  timestamp: number
  duration?: number
  [key: string]: any
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Node executor interface that all workflow plugins implement
 */
export interface INodeExecutor {
  nodeType: string
  execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult>
  validate(node: WorkflowNode): ValidationResult
}

export interface HookState {
  [key: string]: any
}

/**
 * Workflow Hooks Executor - Implements hook operations for DAG execution
 *
 * nodeType: 'hook'
 * Parameters:
 *   - hookType: 'useCounter' | 'useToggle' | 'useStateWithHistory' | 'useValidation' | 'useArray' | 'useSet' | 'useMap'
 *   - operation: Hook-specific operation name
 *   - [other params]: Hook-specific parameters
 */
export class WorkflowHooksExecutor implements INodeExecutor {
  readonly nodeType = 'hook'
  readonly description = 'Hook-like state management operations (useCounter, useToggle, useStateWithHistory, etc.)'

  async execute(
    node: WorkflowNode,
    context: WorkflowContext,
    state: ExecutionState
  ): Promise<NodeResult> {
    const { hookType, operation, ...params } = node.parameters

    if (!hookType) {
      return {
        status: 'error',
        error: 'Hook node requires "hookType" parameter',
        errorCode: 'MISSING_HOOK_TYPE',
        timestamp: Date.now()
      }
    }

    try {
      let result: any
      switch (hookType) {
        case 'useCounter':
          result = this.useCounter(operation, params, state)
          break
        case 'useToggle':
          result = this.useToggle(operation, params, state)
          break
        case 'useStateWithHistory':
          result = this.useStateWithHistory(operation, params, state)
          break
        case 'useValidation':
          result = this.useValidation(operation, params, state)
          break
        case 'useArray':
          result = this.useArray(operation, params, state)
          break
        case 'useSet':
          result = this.useSet(operation, params, state)
          break
        case 'useMap':
          result = this.useMap(operation, params, state)
          break
        case 'useStack':
          result = this.useStack(operation, params, state)
          break
        case 'useQueue':
          result = this.useQueue(operation, params, state)
          break
        default:
          throw new Error(`Unknown hook type: ${hookType}`)
      }

      return {
        status: 'success',
        output: result,
        outputData: result,
        timestamp: Date.now()
      }
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        errorCode: 'HOOK_EXECUTION_ERROR',
        timestamp: Date.now()
      }
    }
  }

  validate(node: WorkflowNode): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!node.parameters?.hookType) {
      errors.push('Hook node requires "hookType" parameter')
    }

    if (!node.parameters?.operation) {
      errors.push('Hook node requires "operation" parameter')
    }

    if (!node.parameters?.key) {
      warnings.push('Hook node should have a "key" parameter to persist state')
    }

    const validHooks = [
      'useCounter',
      'useToggle',
      'useStateWithHistory',
      'useValidation',
      'useArray',
      'useSet',
      'useMap',
      'useStack',
      'useQueue'
    ]

    if (
      node.parameters?.hookType &&
      !validHooks.includes(node.parameters.hookType)
    ) {
      errors.push(
        `Unknown hook type: ${node.parameters.hookType}. Valid types: ${validHooks.join(', ')}`
      )
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * useCounter - Counter state management
   * Operations: increment, decrement, set, reset
   */
  private useCounter(operation: string, params: any, state: any) {
    const { key = 'counter', initial = 0, min = -Infinity, max = Infinity } = params
    const current = state[key] ?? initial

    switch (operation) {
      case 'increment': {
        const next = Math.min(current + 1, max)
        return {
          result: next,
          [key]: next,
          canIncrement: next < max,
          canDecrement: next > min
        }
      }
      case 'decrement': {
        const next = Math.max(current - 1, min)
        return {
          result: next,
          [key]: next,
          canIncrement: next < max,
          canDecrement: next > min
        }
      }
      case 'set': {
        const next = Math.max(Math.min(params.value, max), min)
        return {
          result: next,
          [key]: next,
          canIncrement: next < max,
          canDecrement: next > min
        }
      }
      case 'reset':
        return {
          result: initial,
          [key]: initial,
          canIncrement: initial < max,
          canDecrement: initial > min
        }
      default:
        throw new Error(`Unknown counter operation: ${operation}`)
    }
  }

  /**
   * useToggle - Boolean state management
   * Operations: toggle, setTrue, setFalse, set, reset
   */
  private useToggle(operation: string, params: any, state: any) {
    const { key = 'toggle', initial = false } = params
    const current = state[key] ?? initial

    switch (operation) {
      case 'toggle':
        return {
          result: !current,
          [key]: !current,
          value: !current
        }
      case 'setTrue':
        return {
          result: true,
          [key]: true,
          value: true
        }
      case 'setFalse':
        return {
          result: false,
          [key]: false,
          value: false
        }
      case 'set':
        return {
          result: params.value,
          [key]: params.value,
          value: params.value
        }
      case 'reset':
        return {
          result: initial,
          [key]: initial,
          value: initial
        }
      default:
        throw new Error(`Unknown toggle operation: ${operation}`)
    }
  }

  /**
   * useStateWithHistory - State with undo/redo
   * Operations: set, undo, redo, reset, getHistory
   */
  private useStateWithHistory(operation: string, params: any, state: any) {
    const { key = 'history', maxHistory = 50 } = params
    const historyState = state[key] ?? {
      states: [params.initial ?? null],
      index: 0
    }

    switch (operation) {
      case 'set': {
        const { states, index } = historyState
        const newStates = states.slice(0, index + 1)
        newStates.push(params.value)
        if (newStates.length > maxHistory) {
          newStates.shift()
        }
        return {
          result: params.value,
          [key]: {
            states: newStates,
            index: newStates.length - 1
          },
          current: params.value,
          canUndo: true,
          canRedo: false
        }
      }
      case 'undo': {
        const { states, index } = historyState
        if (index > 0) {
          const newIndex = index - 1
          return {
            result: states[newIndex],
            [key]: { states, index: newIndex },
            current: states[newIndex],
            canUndo: newIndex > 0,
            canRedo: true
          }
        }
        return { result: states[index], [key]: historyState, current: states[index], canUndo: false, canRedo: index < states.length - 1 }
      }
      case 'redo': {
        const { states, index } = historyState
        if (index < states.length - 1) {
          const newIndex = index + 1
          return {
            result: states[newIndex],
            [key]: { states, index: newIndex },
            current: states[newIndex],
            canUndo: true,
            canRedo: newIndex < states.length - 1
          }
        }
        return { result: states[index], [key]: historyState, current: states[index], canUndo: index > 0, canRedo: false }
      }
      case 'reset':
        return {
          result: params.initial ?? null,
          [key]: {
            states: [params.initial ?? null],
            index: 0
          },
          current: params.initial ?? null,
          canUndo: false,
          canRedo: false
        }
      case 'getHistory':
        return {
          result: historyState.states,
          [key]: historyState,
          current: historyState.states[historyState.index],
          history: historyState.states,
          currentIndex: historyState.index
        }
      default:
        throw new Error(`Unknown history operation: ${operation}`)
    }
  }

  /**
   * useValidation - Field validation
   * Operations: validate, addRule, clearErrors
   */
  private useValidation(operation: string, params: any, state: any) {
    const { key = 'validation', values = {}, rules = {} } = params
    const validationState = state[key] ?? { rules: {} }

    switch (operation) {
      case 'validate': {
        const errors: Record<string, string | null> = {}
        for (const [field, rule] of Object.entries(validationState.rules || {})) {
          if (typeof rule === 'string') {
            const value = values[field]
            try {
              const ruleFunction = new Function('value', `return ${rule}`)
              errors[field] = ruleFunction(value) || null
            } catch {
              errors[field] = 'Invalid rule'
            }
          }
        }
        const isValid = Object.values(errors).every(e => e === null)
        return {
          result: { errors, isValid },
          [key]: validationState,
          errors,
          isValid,
          values
        }
      }
      case 'addRule': {
        const newRules = { ...validationState.rules, [params.field]: params.rule }
        return {
          result: newRules,
          [key]: { ...validationState, rules: newRules },
          rules: newRules
        }
      }
      case 'clearErrors':
        return {
          result: {},
          [key]: validationState,
          errors: {},
          isValid: true
        }
      default:
        throw new Error(`Unknown validation operation: ${operation}`)
    }
  }

  /**
   * useArray - Array operations
   * Operations: push, pop, shift, unshift, insert, remove, removeAt, clear, filter, map
   */
  private useArray(operation: string, params: any, state: any) {
    const { key = 'array', initialValue = [] } = params
    const current = state[key] ?? initialValue
    const arr = Array.isArray(current) ? current : []

    switch (operation) {
      case 'push':
        return { result: [...arr, params.value], [key]: [...arr, params.value], length: arr.length + 1 }
      case 'pop':
        return { result: arr[arr.length - 1], [key]: arr.slice(0, -1), length: arr.length - 1 }
      case 'shift':
        return { result: arr[0], [key]: arr.slice(1), length: arr.length - 1 }
      case 'unshift':
        return { result: [params.value, ...arr], [key]: [params.value, ...arr], length: arr.length + 1 }
      case 'insert':
        const inserted = [...arr.slice(0, params.index), params.value, ...arr.slice(params.index)]
        return { result: inserted, [key]: inserted, length: inserted.length }
      case 'remove':
        const filtered = arr.filter(item => item !== params.value)
        return { result: filtered, [key]: filtered, length: filtered.length }
      case 'removeAt':
        const removed = arr.filter((_, i) => i !== params.index)
        return { result: removed, [key]: removed, length: removed.length }
      case 'clear':
        return { result: [], [key]: [], length: 0 }
      default:
        throw new Error(`Unknown array operation: ${operation}`)
    }
  }

  /**
   * useSet - Set operations
   * Operations: add, remove, has, toggle, clear
   */
  private useSet(operation: string, params: any, state: any) {
    const { key = 'set', initialValue = [] } = params
    const current = state[key] ?? initialValue
    const set = new Set(current)

    switch (operation) {
      case 'add':
        set.add(params.value)
        return { result: Array.from(set), [key]: Array.from(set), size: set.size }
      case 'remove':
        set.delete(params.value)
        return { result: Array.from(set), [key]: Array.from(set), size: set.size }
      case 'has':
        return { result: set.has(params.value), has: set.has(params.value), [key]: Array.from(set) }
      case 'toggle':
        if (set.has(params.value)) {
          set.delete(params.value)
        } else {
          set.add(params.value)
        }
        return { result: Array.from(set), [key]: Array.from(set), size: set.size }
      case 'clear':
        set.clear()
        return { result: [], [key]: [], size: 0 }
      default:
        throw new Error(`Unknown set operation: ${operation}`)
    }
  }

  /**
   * useMap - Map operations
   * Operations: set, get, delete, has, clear, entries, keys, values
   */
  private useMap(operation: string, params: any, state: any) {
    const { key = 'map', initialValue = {} } = params
    const current = state[key] ?? initialValue
    const map = new Map(Object.entries(current))

    switch (operation) {
      case 'set':
        map.set(params.key, params.value)
        return { result: Object.fromEntries(map), [key]: Object.fromEntries(map), size: map.size }
      case 'get':
        return { result: map.get(params.key), value: map.get(params.key), [key]: Object.fromEntries(map) }
      case 'delete':
        map.delete(params.key)
        return { result: Object.fromEntries(map), [key]: Object.fromEntries(map), size: map.size }
      case 'has':
        return { result: map.has(params.key), has: map.has(params.key), [key]: Object.fromEntries(map) }
      case 'clear':
        map.clear()
        return { result: {}, [key]: {}, size: 0 }
      case 'entries':
        return { result: Object.fromEntries(map), entries: Object.entries(current), [key]: Object.fromEntries(map) }
      case 'keys':
        return { result: Array.from(map.keys()), keys: Array.from(map.keys()), [key]: Object.fromEntries(map) }
      case 'values':
        return { result: Array.from(map.values()), values: Array.from(map.values()), [key]: Object.fromEntries(map) }
      default:
        throw new Error(`Unknown map operation: ${operation}`)
    }
  }

  /**
   * useStack - LIFO stack operations
   * Operations: push, pop, peek, clear
   */
  private useStack(operation: string, params: any, state: any) {
    const { key = 'stack', initialValue = [] } = params
    const current = state[key] ?? initialValue
    const stack = Array.isArray(current) ? current : []

    switch (operation) {
      case 'push':
        return { result: [...stack, params.value], [key]: [...stack, params.value], size: stack.length + 1 }
      case 'pop':
        return { result: stack[stack.length - 1], [key]: stack.slice(0, -1), size: stack.length - 1 }
      case 'peek':
        return { result: stack[stack.length - 1], size: stack.length, [key]: stack }
      case 'clear':
        return { result: [], [key]: [], size: 0 }
      default:
        throw new Error(`Unknown stack operation: ${operation}`)
    }
  }

  /**
   * useQueue - FIFO queue operations
   * Operations: enqueue, dequeue, peek, clear
   */
  private useQueue(operation: string, params: any, state: any) {
    const { key = 'queue', initialValue = [] } = params
    const current = state[key] ?? initialValue
    const queue = Array.isArray(current) ? current : []

    switch (operation) {
      case 'enqueue':
        return { result: [...queue, params.value], [key]: [...queue, params.value], size: queue.length + 1 }
      case 'dequeue':
        return { result: queue[0], [key]: queue.slice(1), size: queue.length - 1 }
      case 'peek':
        return { result: queue[0], size: queue.length, [key]: queue }
      case 'clear':
        return { result: [], [key]: [], size: 0 }
      default:
        throw new Error(`Unknown queue operation: ${operation}`)
    }
  }
}

// Export for plugin registration
export default WorkflowHooksExecutor
