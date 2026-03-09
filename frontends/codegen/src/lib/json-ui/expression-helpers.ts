import { evaluateCondition, evaluateExpression } from './expression-evaluator'

const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/
const NUMBER_PATTERN = /^-?\d+(?:\.\d+)?$/
const STRING_PATTERN = /^(['"]).*\1$/

interface EvaluationOptions {
  fallback?: any
  label?: string
  event?: any
}

const isSupportedExpression = (expression: string) => {
  if (expression === 'event' || expression === 'data') return true
  if (expression.startsWith('data.') || expression.startsWith('event.')) return true
  if (expression === 'Date.now()') return true
  if (STRING_PATTERN.test(expression)) return true
  if (NUMBER_PATTERN.test(expression)) return true
  if (['true', 'false', 'null', 'undefined'].includes(expression)) return true
  return false
}

const normalizeExpression = (expression: string, coerceIdentifier = true) => {
  const trimmed = expression.trim()
  if (coerceIdentifier && IDENTIFIER_PATTERN.test(trimmed) && trimmed !== 'data' && trimmed !== 'event') {
    return `data.${trimmed}`
  }
  return trimmed
}

const isSupportedCondition = (condition: string) => {
  return (
    /^data\.[a-zA-Z0-9_.]+\s*(>|<|>=|<=|===|!==)\s*.+$/.test(condition)
    || /^data\.[a-zA-Z0-9_.]+\.length\s*(>|<|>=|<=|===|!==)\s*.+$/.test(condition)
    || /^data\.[a-zA-Z0-9_.]+\s*!=\s*null$/.test(condition)
    || /^!?data\.[a-zA-Z0-9_.]+$/.test(condition)
  )
}

const normalizeCondition = (condition: string) => {
  const trimmed = condition.trim()
  if (trimmed.startsWith('data.') || trimmed.startsWith('event.') || trimmed.startsWith('!data.') || trimmed.startsWith('!event.')) {
    return trimmed
  }

  const lengthMatch = trimmed.match(/^([a-zA-Z0-9_.]+)\.length\s*(>|<|>=|<=|===|!==)\s*(.+)$/)
  if (lengthMatch) {
    return `data.${lengthMatch[1]}.length ${lengthMatch[2]} ${lengthMatch[3]}`
  }

  const comparisonMatch = trimmed.match(/^([a-zA-Z0-9_.]+)\s*(>|<|>=|<=|===|!==)\s*(.+)$/)
  if (comparisonMatch) {
    return `data.${comparisonMatch[1]} ${comparisonMatch[2]} ${comparisonMatch[3]}`
  }

  const nullMatch = trimmed.match(/^([a-zA-Z0-9_.]+)\s*!=\s*null$/)
  if (nullMatch) {
    return `data.${nullMatch[1]} != null`
  }

  // Negated truthiness check: "!identifier.path"
  const negatedMatch = trimmed.match(/^!([a-zA-Z0-9_.]+)$/)
  if (negatedMatch) {
    return `!data.${negatedMatch[1]}`
  }

  // Simple truthiness check: "identifier.path"
  const truthyMatch = trimmed.match(/^([a-zA-Z0-9_.]+)$/)
  if (truthyMatch && trimmed !== 'data' && trimmed !== 'event') {
    return `data.${truthyMatch[1]}`
  }

  return trimmed
}

/**
 * Parse a string literal from an expression fragment.
 * Returns the string value if it's a quoted literal, undefined otherwise.
 */
const parseStringLiteral = (s: string): string | undefined => {
  const trimmed = s.trim()
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.slice(1, -1)
  }
  return undefined
}

/**
 * Evaluate a || fallback expression: "identifier || 'default'"
 * The bound value is checked for truthiness; if falsy, the right side is used.
 */
const evaluateFallbackExpression = (
  expression: string,
  value: any,
  dataContext: Record<string, any>
): any => {
  const pipeIndex = expression.indexOf('||')
  if (pipeIndex === -1) return undefined

  const rightSide = expression.substring(pipeIndex + 2).trim()

  // If the bound value is truthy, use it
  if (value) return value

  // Parse right side as string literal
  const stringVal = parseStringLiteral(rightSide)
  if (stringVal !== undefined) return stringVal

  // Parse right side as number
  if (NUMBER_PATTERN.test(rightSide)) return Number(rightSide)

  // Parse right side as boolean/null
  if (rightSide === 'true') return true
  if (rightSide === 'false') return false
  if (rightSide === 'null') return null

  // Try resolving right side from data context
  if (dataContext[rightSide] !== undefined) return dataContext[rightSide]

  return rightSide
}

/**
 * Evaluate a complex expression using sandboxed Function constructor.
 * Only used for developer-authored JSON definition transforms (not user input).
 * All dataContext keys are destructured into the function scope so expressions
 * can reference them directly (e.g. menuState.expandAll(), item.id).
 */
const evaluateWithFunction = (
  expression: string,
  value: any,
  dataContext: Record<string, any>
): any => {
  try {
    // Filter to valid JS identifiers only — keys like "0", "data-x", etc. can't be function params
    const keys = Object.keys(dataContext).filter(k => IDENTIFIER_PATTERN.test(k))
    const values = keys.map(k => dataContext[k])
    // eslint-disable-next-line no-new-func
    const fn = new Function(...keys, 'value', 'Math', 'JSON', `return (${expression})`)
    return fn(...values, value, Math, JSON)
  } catch {
    return undefined
  }
}

/**
 * Check if expression is a || fallback pattern (not inside a string literal or IIFE)
 */
const isFallbackExpression = (expression: string): boolean => {
  // Must contain || but NOT be inside an IIFE or complex expression
  if (!expression.includes('||')) return false
  // Exclude IIFEs and arrow functions that happen to contain ||
  if (expression.startsWith('(') || expression.includes('=>')) return false
  return true
}

/**
 * Check if expression is an arrow function or IIFE
 */
const isFunctionExpression = (expression: string): boolean => {
  const trimmed = expression.trim()
  // IIFE: (() => { ... })() or (function() { ... })()
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) return true
  // Arrow function: () => something or (arg) => something
  if (/^\(?\)?\s*=>/.test(trimmed)) return true
  return false
}

export const evaluateBindingExpression = (
  expression: string | undefined,
  data: Record<string, any>,
  options: EvaluationOptions = {}
) => {
  if (!expression) return undefined

  // Handle || fallback in bindings: "identifier || 'default'"
  if (isFallbackExpression(expression)) {
    const leftSide = expression.substring(0, expression.indexOf('||')).trim()
    const value = data[leftSide]
    return evaluateFallbackExpression(expression, value, data) ?? options.fallback ?? expression
  }

  const normalized = normalizeExpression(expression)
  if (!isSupportedExpression(normalized)) {
    return options.fallback ?? expression
  }
  return evaluateExpression(normalized, { data, event: options.event })
}

export const evaluateTransformExpression = (
  expression: string | undefined,
  value: any,
  dataContext: Record<string, any> = {},
  options: EvaluationOptions = {}
) => {
  if (!expression) return value
  const trimmed = expression.trim()

  // Identity transform: "data" just returns the resolved value as-is.
  // Without this, the evaluator wraps value in {value: ...} and returns
  // the whole context object instead of the actual value.
  if (trimmed === 'data') return value

  // Handle || fallback: "identifier || 'default'"
  // The value is the resolved binding — use it if truthy, otherwise use default
  if (isFallbackExpression(trimmed)) {
    return evaluateFallbackExpression(trimmed, value, dataContext)
  }

  // Handle arrow functions as function callbacks: "() => menuState.expandAll()"
  // If the bound value is already a function, pass it through directly
  if (isFunctionExpression(trimmed) && typeof value === 'function') {
    return value
  }

  // Handle IIFEs and arrow functions: evaluate with sandboxed Function
  if (isFunctionExpression(trimmed)) {
    const result = evaluateWithFunction(trimmed, value, dataContext)
    if (result !== undefined) return result
    return options.fallback ?? value
  }

  const normalized = normalizeExpression(trimmed)
  if (!isSupportedExpression(normalized)) {
    return options.fallback ?? value
  }

  const valueContext = typeof value === 'object' && value !== null ? value : {}
  const mergedData = {
    ...dataContext,
    ...valueContext,
    value,
  }

  return evaluateExpression(normalized, { data: mergedData, event: options.event })
}

export const evaluateConditionExpression = (
  condition: string | undefined,
  data: Record<string, any>,
  options: EvaluationOptions = {}
) => {
  if (!condition) return true
  const normalized = normalizeCondition(condition)
  if (!isSupportedCondition(normalized)) {
    if (typeof console !== 'undefined') {
      console.warn(`[JSON-UI] Unsupported condition "${condition}" (normalized: "${normalized}") in ${options.label || 'unknown'} — defaulting to true`)
    }
    return true
  }
  return evaluateCondition(normalized, { data, event: options.event })
}
