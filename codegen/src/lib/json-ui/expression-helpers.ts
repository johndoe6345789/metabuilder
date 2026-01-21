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
    /^data\.[a-zA-Z0-9_.]+\s*>\s*.+$/.test(condition)
    || /^data\.[a-zA-Z0-9_.]+\.length\s*>\s*.+$/.test(condition)
    || /^data\.[a-zA-Z0-9_.]+\s*===\s*['"].+['"]$/.test(condition)
    || /^data\.[a-zA-Z0-9_.]+\s*!=\s*null$/.test(condition)
  )
}

const normalizeCondition = (condition: string) => {
  const trimmed = condition.trim()
  if (trimmed.startsWith('data.') || trimmed.startsWith('event.')) {
    return trimmed
  }

  const lengthMatch = trimmed.match(/^([a-zA-Z0-9_.]+)\.length\s*>\s*(.+)$/)
  if (lengthMatch) {
    return `data.${lengthMatch[1]}.length > ${lengthMatch[2]}`
  }

  const gtMatch = trimmed.match(/^([a-zA-Z0-9_.]+)\s*>\s*(.+)$/)
  if (gtMatch) {
    return `data.${gtMatch[1]} > ${gtMatch[2]}`
  }

  const eqMatch = trimmed.match(/^([a-zA-Z0-9_.]+)\s*===\s*(['"].+['"])$/)
  if (eqMatch) {
    return `data.${eqMatch[1]} === ${eqMatch[2]}`
  }

  const nullMatch = trimmed.match(/^([a-zA-Z0-9_.]+)\s*!=\s*null$/)
  if (nullMatch) {
    return `data.${nullMatch[1]} != null`
  }

  return trimmed
}

const warnUnsupported = (kind: string, expression: string, label?: string) => {
  const labelText = label ? ` for ${label}` : ''
  console.warn(`[json-ui] Unsupported ${kind} expression${labelText}: "${expression}"`)
}

export const evaluateBindingExpression = (
  expression: string | undefined,
  data: Record<string, any>,
  options: EvaluationOptions = {}
) => {
  if (!expression) return undefined
  const normalized = normalizeExpression(expression)
  if (!isSupportedExpression(normalized)) {
    warnUnsupported('binding', expression, options.label)
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
  const normalized = normalizeExpression(expression)
  if (!isSupportedExpression(normalized)) {
    warnUnsupported('transform', expression, options.label)
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
    warnUnsupported('condition', condition, options.label)
  }
  return evaluateCondition(normalized, { data, event: options.event })
}
