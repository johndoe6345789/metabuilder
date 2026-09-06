import type { ParamRow } from './types'

/**
 * A parameter's stored type. `json` exists because a step's parameters are
 * not all scalars -- dbal.entity.create takes a nested object naming the
 * columns to write -- and those used to be stringified into a 'string'
 * row, so a graph saved and reloaded no longer described the same step.
 */
export type ParamValueType = 'string' | 'number' | 'boolean' | 'json'

export function readValue(row: ParamRow): unknown {
  const raw = row.value ?? ''
  if (row.valueType === 'number') {
    const n = Number(raw)
    return Number.isNaN(n) ? raw : n
  }
  if (row.valueType === 'boolean') return raw === 'true'
  if (row.valueType === 'json') {
    try {
      return JSON.parse(raw) as unknown
    } catch {
      // A row that will not parse is more useful as its own text than as
      // nothing: it is at least visible in the editor and fixable there.
      return raw
    }
  }
  // Anything else, 'string' included, is text -- a string that merely
  // looks like JSON stays a string, because the type column decides.
  return raw
}

export function writeValue(value: unknown): {
  valueType: ParamValueType
  value: string
} {
  if (typeof value === 'boolean') {
    return { valueType: 'boolean', value: value ? 'true' : 'false' }
  }
  if (typeof value === 'number') {
    return { valueType: 'number', value: String(value) }
  }
  if (typeof value === 'string') return { valueType: 'string', value }
  // null and undefined keep the empty-string shape they have always had,
  // so rows written before `json` existed still read back the same way.
  if (value == null) return { valueType: 'string', value: '' }
  return { valueType: 'json', value: JSON.stringify(value) }
}
