import type { PropRow } from './types'

export function readProp(row: PropRow): unknown {
  const raw = row.value ?? ''
  if (row.valueType === 'number') {
    const n = Number(raw)
    return Number.isNaN(n) ? raw : n
  }
  if (row.valueType === 'boolean') return raw === 'true'
  return raw
}

/** Which type a prop value should be stored as. */
export function propValueType(value: unknown): {
  valueType: 'string' | 'number' | 'boolean'
  value: string
} {
  if (typeof value === 'boolean') {
    return { valueType: 'boolean', value: value ? 'true' : 'false' }
  }
  if (typeof value === 'number') {
    return { valueType: 'number', value: String(value) }
  }
  if (typeof value === 'string') return { valueType: 'string', value }
  // Anything else (object, array, null) has no relational representation --
  // store it empty rather than the string "[object Object]".
  return {
    valueType: 'string',
    value: value == null ? '' : JSON.stringify(value),
  }
}
