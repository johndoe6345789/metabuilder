/**
 * JSON-friendly expression evaluator
 * Safely evaluates simple expressions without requiring external functions
 */

interface EvaluationContext {
  data: Record<string, any>
  event?: any
}

/**
 * Safely evaluate a JSON expression
 * Supports:
 * - Data access: "data.fieldName", "data.user.name"
 * - Event access: "event.target.value", "event.key"
 * - Literals: numbers, strings, booleans, null
 * - Date operations: "Date.now()"
 * - Basic operations: trim(), toLowerCase(), toUpperCase()
 */
export function evaluateExpression(
  expression: string | undefined,
  context: EvaluationContext
): any {
  if (!expression) return undefined

  const { data, event } = context

  try {
    if (expression === 'event') {
      return event
    }

    if (expression === 'data') {
      return data
    }

    const filterMatch = expression.match(
      /^data\.([a-zA-Z0-9_.]+)\.filter\(\s*([a-zA-Z0-9_.]+)\s*(===|==|!==|!=)\s*(.+?)\s*\)(?:\.(length))?$/
    )
    if (filterMatch) {
      const [, collectionPath, fieldPath, operator, rawValue, lengthSuffix] = filterMatch
      const collection = getNestedValue(data, collectionPath)
      if (!Array.isArray(collection)) {
        return lengthSuffix ? 0 : []
      }

      const expectedValue = evaluateExpression(rawValue.trim(), { data, event })
      const isNegated = operator === '!=' || operator === '!=='
      const filtered = collection.filter((item) => {
        const fieldValue = getNestedValue(item, fieldPath)
        return isNegated ? fieldValue !== expectedValue : fieldValue === expectedValue
      })

      return lengthSuffix ? filtered.length : filtered
    }

    const findMatch = expression.match(
      /^data\.([a-zA-Z0-9_.]+)\.find\(\s*([a-zA-Z0-9_.]+)\s*(===|==|!==|!=)\s*(.+?)\s*\)$/
    )
    if (findMatch) {
      const [, collectionPath, fieldPath, operator, rawValue] = findMatch
      const collection = getNestedValue(data, collectionPath)
      if (!Array.isArray(collection)) {
        return undefined
      }

      const expectedValue = evaluateExpression(rawValue.trim(), { data, event })
      const isNegated = operator === '!=' || operator === '!=='
      return collection.find((item) => {
        const fieldValue = getNestedValue(item, fieldPath)
        return isNegated ? fieldValue !== expectedValue : fieldValue === expectedValue
      })
    }

    const objectKeysLengthMatch = expression.match(
      /^Object\.keys\(\s*data\.([a-zA-Z0-9_.]+)\s*\)\.length$/
    )
    if (objectKeysLengthMatch) {
      const value = getNestedValue(data, objectKeysLengthMatch[1])
      if (!value || typeof value !== 'object') {
        return 0
      }
      return Object.keys(value).length
    }

    // Handle direct data access: "data.fieldName"
    if (expression.startsWith('data.')) {
      return getNestedValue(data, expression.substring(5))
    }

    // Handle event access: "event.target.value"
    if (expression.startsWith('event.')) {
      return getNestedValue(event, expression.substring(6))
    }

    // Handle Date.now()
    if (expression === 'Date.now()') {
      return Date.now()
    }

    // Handle string literals
    if (expression.startsWith('"') && expression.endsWith('"')) {
      return expression.slice(1, -1)
    }
    if (expression.startsWith("'") && expression.endsWith("'")) {
      return expression.slice(1, -1)
    }

    // Handle numbers
    const num = Number(expression)
    if (!isNaN(num)) {
      return num
    }

    // Handle booleans
    if (expression === 'true') return true
    if (expression === 'false') return false
    if (expression === 'null') return null
    if (expression === 'undefined') return undefined

    // If no pattern matched, return the expression as-is
    console.warn(`Expression "${expression}" could not be evaluated, returning as-is`)
    return expression
  } catch (error) {
    console.error(`Failed to evaluate expression "${expression}":`, error)
    return undefined
  }
}

/**
 * Get nested value from object using dot notation
 * Example: getNestedValue({ user: { name: 'John' } }, 'user.name') => 'John'
 */
function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined

  const parts = path.split('.')
  let current = obj

  for (const part of parts) {
    if (current == null) return undefined
    current = current[part]
  }

  return current
}

/**
 * Apply string operation to a value
 * Supports: trim, toLowerCase, toUpperCase, length
 */
export function applyStringOperation(value: any, operation: string): any {
  if (value == null) return value

  const str = String(value)

  switch (operation) {
    case 'trim':
      return str.trim()
    case 'toLowerCase':
      return str.toLowerCase()
    case 'toUpperCase':
      return str.toUpperCase()
    case 'length':
      return str.length
    default:
      console.warn(`Unknown string operation: ${operation}`)
      return value
  }
}

/**
 * Evaluate a template object with dynamic values
 * Example: { "id": "Date.now()", "text": "data.newTodo" }
 */
export function evaluateTemplate(
  template: Record<string, any>,
  context: EvaluationContext
): Record<string, any> {
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(template)) {
    if (typeof value === 'string') {
      result[key] = evaluateExpression(value, context)
    } else {
      result[key] = value
    }
  }

  return result
}

/**
 * Evaluate a condition expression
 * Supports:
 * - "data.field > 0"
 * - "data.field.length > 0"
 * - "data.field === 'value'"
 * - "data.field != null"
 */
export function evaluateCondition(
  condition: string | undefined,
  context: EvaluationContext
): boolean {
  if (!condition) return true

  const { data } = context

  try {
    // Simple pattern matching for common conditions
    // "data.field > 0"
    const gtMatch = condition.match(/^data\.([a-zA-Z0-9_.]+)\s*>\s*(.+)$/)
    if (gtMatch) {
      const value = getNestedValue(data, gtMatch[1])
      const threshold = Number(gtMatch[2])
      return (value ?? 0) > threshold
    }

    // "data.field.length > 0"
    const lengthMatch = condition.match(/^data\.([a-zA-Z0-9_.]+)\.length\s*>\s*(.+)$/)
    if (lengthMatch) {
      const value = getNestedValue(data, lengthMatch[1])
      const threshold = Number(lengthMatch[2])
      const length = value?.length ?? 0
      return length > threshold
    }

    // "data.field === 'value'"
    const eqMatch = condition.match(/^data\.([a-zA-Z0-9_.]+)\s*===\s*['"](.+)['"]$/)
    if (eqMatch) {
      const value = getNestedValue(data, eqMatch[1])
      return value === eqMatch[2]
    }

    // "data.field != null"
    const nullCheck = condition.match(/^data\.([a-zA-Z0-9_.]+)\s*!=\s*null$/)
    if (nullCheck) {
      const value = getNestedValue(data, nullCheck[1])
      return value != null
    }

    // If no pattern matched, log warning and return true (fail open)
    console.warn(`Condition "${condition}" could not be evaluated, defaulting to true`)
    return true
  } catch (error) {
    console.error(`Failed to evaluate condition "${condition}":`, error)
    return true // Fail open
  }
}
