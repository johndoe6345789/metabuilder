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

    // If no pattern matched, warn and return undefined
    console.warn(`[JSON-UI] Unrecognized expression: "${expression}"`)
    return undefined
  } catch {
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

function parseConditionValue(raw: string): string | number | boolean | null {
  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
    return raw.slice(1, -1)
  }
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (raw === 'null') return null
  const num = Number(raw)
  if (!isNaN(num)) return num
  return raw
}

function compareValues(left: any, operator: string, right: any): boolean {
  switch (operator) {
    case '>': return left > right
    case '<': return left < right
    case '>=': return left >= right
    case '<=': return left <= right
    case '===': return left === right
    case '!==': return left !== right
    default: return false
  }
}

/**
 * Evaluate a condition expression
 * Supports:
 * - "data.field > 0", "data.field < 10", "data.field >= 1", "data.field <= 5"
 * - "data.field === 0", "data.field !== 'value'"
 * - "data.field.length === 0", "data.field.length > 0"
 * - "data.field != null"
 */
export function evaluateCondition(
  condition: string | undefined,
  context: EvaluationContext
): boolean {
  if (!condition) return true

  const { data } = context

  try {
    // "data.field.length <op> N"
    const lengthMatch = condition.match(/^data\.([a-zA-Z0-9_.]+)\.length\s*(>|<|>=|<=|===|!==)\s*(.+)$/)
    if (lengthMatch) {
      const value = getNestedValue(data, lengthMatch[1])
      const length = value?.length ?? 0
      const threshold = Number(lengthMatch[3])
      return compareValues(length, lengthMatch[2], threshold)
    }

    // "data.field <op> value" (numeric or string)
    const comparisonMatch = condition.match(/^data\.([a-zA-Z0-9_.]+)\s*(>|<|>=|<=|===|!==)\s*(.+)$/)
    if (comparisonMatch) {
      const value = getNestedValue(data, comparisonMatch[1])
      const rawRight = comparisonMatch[3].trim()
      const right = parseConditionValue(rawRight)
      return compareValues(value ?? (typeof right === 'number' ? 0 : undefined), comparisonMatch[2], right)
    }

    // "data.field != null"
    const nullCheck = condition.match(/^data\.([a-zA-Z0-9_.]+)\s*!=\s*null$/)
    if (nullCheck) {
      const value = getNestedValue(data, nullCheck[1])
      return value != null
    }

    // Negated truthiness: "!data.field.path"
    const negatedTruthyMatch = condition.match(/^!data\.([a-zA-Z0-9_.]+)$/)
    if (negatedTruthyMatch) {
      const value = getNestedValue(data, negatedTruthyMatch[1])
      return !value
    }

    // Simple truthiness: "data.field.path"
    const truthyMatch = condition.match(/^data\.([a-zA-Z0-9_.]+)$/)
    if (truthyMatch) {
      const value = getNestedValue(data, truthyMatch[1])
      return !!value
    }

    // If no pattern matched, default to true (fail open)
    return true
  } catch {
    return true // Fail open
  }
}
