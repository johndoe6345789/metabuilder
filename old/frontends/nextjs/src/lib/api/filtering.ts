/**
 * Filtering and sorting utilities for API requests
 * 
 * Provides utilities to build filter and sort queries
 */

export type FilterOperator =
  | 'eq' // Equal
  | 'ne' // Not equal
  | 'gt' // Greater than
  | 'gte' // Greater than or equal
  | 'lt' // Less than
  | 'lte' // Less than or equal
  | 'in' // In array
  | 'notIn' // Not in array
  | 'contains' // Contains substring
  | 'startsWith' // Starts with
  | 'endsWith' // Ends with
  | 'isNull' // Is null
  | 'isNotNull' // Is not null

export interface FilterCondition {
  field: string
  operator: FilterOperator
  value?: unknown
}

export type SortDirection = 'asc' | 'desc'

export interface SortCondition {
  field: string
  direction: SortDirection
}

/**
 * Parse filter string to filter conditions
 * Format: field:operator:value or field:value (defaults to eq)
 */
export function parseFilterString(filterStr: string): FilterCondition[] {
  if (filterStr.trim().length === 0) {
    return []
  }

  const filters: FilterCondition[] = []
  const parts = filterStr.split(',')

  for (const part of parts) {
    const segments = part.trim().split(':')
    
    if (segments.length === 2 && segments[0] !== undefined && segments[0] !== '' && segments[1] !== undefined && segments[1] !== '') {
      // field:value (default to eq)
      filters.push({
        field: segments[0],
        operator: 'eq',
        value: parseValue(segments[1]),
      })
    } else if (segments.length === 3 && segments[0] !== undefined && segments[0] !== '' && segments[1] !== undefined && segments[1] !== '' && segments[2] !== undefined && segments[2] !== '') {
      // field:operator:value
      filters.push({
        field: segments[0],
        operator: segments[1] as FilterOperator,
        value: parseValue(segments[2]),
      })
    }
  }

  return filters
}

/**
 * Parse filter object to filter conditions
 */
export function parseFilterObject(filter: Record<string, unknown>): FilterCondition[] {
  const conditions: FilterCondition[] = []

  for (const [field, value] of Object.entries(filter)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Handle operator objects: { field: { $gt: 5 } }
      for (const [op, val] of Object.entries(value)) {
        const operator = op.startsWith('$') ? op.slice(1) : op
        conditions.push({
          field,
          operator: operator as FilterOperator,
          value: val,
        })
      }
    } else {
      // Simple equality: { field: value }
      conditions.push({
        field,
        operator: 'eq',
        value,
      })
    }
  }

  return conditions
}

/**
 * Parse value from string (handles numbers, booleans, null)
 */
function parseValue(value: string): unknown {
  if (value === 'null') return null
  if (value === 'true') return true
  if (value === 'false') return false
  
  const num = Number(value)
  if (!isNaN(num)) return num
  
  return value
}

/**
 * Build Prisma where clause from filter conditions
 */
export function buildPrismaWhere(conditions: FilterCondition[]): Record<string, unknown> {
  const where: Record<string, unknown> = {}

  for (const condition of conditions) {
    const { field, operator, value } = condition

    switch (operator) {
      case 'eq':
        where[field] = value
        break
      case 'ne':
        where[field] = { not: value }
        break
      case 'gt':
        where[field] = { gt: value }
        break
      case 'gte':
        where[field] = { gte: value }
        break
      case 'lt':
        where[field] = { lt: value }
        break
      case 'lte':
        where[field] = { lte: value }
        break
      case 'in':
        where[field] = { in: Array.isArray(value) ? value : [value] }
        break
      case 'notIn':
        where[field] = { notIn: Array.isArray(value) ? value : [value] }
        break
      case 'contains':
        where[field] = { contains: String(value), mode: 'insensitive' }
        break
      case 'startsWith':
        where[field] = { startsWith: String(value), mode: 'insensitive' }
        break
      case 'endsWith':
        where[field] = { endsWith: String(value), mode: 'insensitive' }
        break
      case 'isNull':
        where[field] = null
        break
      case 'isNotNull':
        where[field] = { not: null }
        break
    }
  }

  return where
}

/**
 * Parse sort string to sort conditions
 * Format: field or -field (- prefix for desc) or field1,-field2
 */
export function parseSortString(sortStr: string): SortCondition[] {
  if (sortStr.trim().length === 0) {
    return []
  }

  const sorts: SortCondition[] = []
  const parts = sortStr.split(',')

  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.startsWith('-')) {
      sorts.push({
        field: trimmed.slice(1),
        direction: 'desc',
      })
    } else {
      sorts.push({
        field: trimmed,
        direction: 'asc',
      })
    }
  }

  return sorts
}

/**
 * Build Prisma orderBy from sort conditions
 */
export function buildPrismaOrderBy(conditions: SortCondition[]): Record<string, SortDirection>[] {
  return conditions.map(condition => ({
    [condition.field]: condition.direction,
  }))
}

/**
 * Validate field name (prevents SQL injection)
 */
export function isValidFieldName(field: string): boolean {
  // Allow alphanumeric, underscore, and dot (for nested fields)
  return /^[a-zA-Z0-9_.]+$/.test(field)
}

/**
 * Validate filter conditions
 */
export function validateFilters(conditions: FilterCondition[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const condition of conditions) {
    if (!isValidFieldName(condition.field)) {
      errors.push(`Invalid field name: ${condition.field}`)
    }

    const validOperators: FilterOperator[] = [
      'eq', 'ne', 'gt', 'gte', 'lt', 'lte',
      'in', 'notIn', 'contains', 'startsWith', 'endsWith',
      'isNull', 'isNotNull',
    ]

    if (!validOperators.includes(condition.operator)) {
      errors.push(`Invalid operator: ${condition.operator}`)
    }

    // Validate value is provided for operators that need it
    const operatorsNeedingValue = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'notIn', 'contains', 'startsWith', 'endsWith']
    if (operatorsNeedingValue.includes(condition.operator) && condition.value === undefined) {
      errors.push(`Operator ${condition.operator} requires a value`)
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Validate sort conditions
 */
export function validateSort(conditions: SortCondition[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const condition of conditions) {
    if (!isValidFieldName(condition.field)) {
      errors.push(`Invalid field name: ${condition.field}`)
    }

    if (!['asc', 'desc'].includes(condition.direction)) {
      errors.push(`Invalid sort direction: ${condition.direction}`)
    }
  }

  return { valid: errors.length === 0, errors }
}
