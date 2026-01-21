import { evaluateTransformExpression } from './expression-helpers'

type BindingTransform = string

interface BindingSourceOptions {
  state?: Record<string, any>
  bindings?: Record<string, any>
}

export function resolveDataBinding(
  binding: string | { source: string; sourceType?: 'data' | 'bindings' | 'state'; path?: string; transform?: BindingTransform },
  dataMap: Record<string, any>,
  context: Record<string, any> = {},
  options: BindingSourceOptions = {},
): any {
  const mergedContext = { ...dataMap, ...context }
  const stateSource = options.state ?? {}
  const bindingsSource = options.bindings ?? context

  if (typeof binding === 'string') {
    if (binding.startsWith('state.')) {
      return getNestedValue(stateSource, binding.slice('state.'.length))
    }
    if (binding.startsWith('bindings.')) {
      return getNestedValue(bindingsSource, binding.slice('bindings.'.length))
    }
    if (binding.includes('.')) {
      return getNestedValue(mergedContext, binding)
    }
    return mergedContext[binding]
  }
  
  const { source, sourceType, path, transform } = binding
  const sourceContext =
    sourceType === 'state'
      ? stateSource
      : sourceType === 'bindings'
        ? bindingsSource
        : mergedContext
  const sourceValue = source.includes('.')
    ? getNestedValue(sourceContext, source)
    : sourceContext[source]
  const resolvedValue = path ? getNestedValue(sourceValue, path) : sourceValue

  return applyTransform(resolvedValue, transform)
}

function applyTransform(value: unknown, transform?: BindingTransform) {
  if (!transform) {
    return value
  }

  return evaluateTransformExpression(transform, value, {}, { label: 'data binding transform' })
}

export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current?.[key]
  }, obj)
}

export function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {}
    }
    return current[key]
  }, obj)
  
  target[lastKey] = value
  return obj
}

export function mergeClassNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function generateId(prefix = 'ui'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
