import type { ParamRow } from './types'

export function readValue(row: ParamRow): unknown {
  const raw = row.value ?? ''
  if (row.valueType === 'number') {
    const n = Number(raw)
    return Number.isNaN(n) ? raw : n
  }
  if (row.valueType === 'boolean') return raw === 'true'
  return raw
}

export function writeValue(value: unknown): {
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
  return {
    valueType: 'string',
    value: value == null ? '' : JSON.stringify(value),
  }
}
