import type { FieldSpec } from '../render-field'

type JsonRecord = Record<string, unknown>

function isFieldSpec(value: unknown): value is FieldSpec {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as FieldSpec).name === 'string'
  )
}

function toFieldSpec(name: string, value: unknown): FieldSpec | null {
  if (value === null || value === undefined) return null
  if (typeof name !== 'string' || name.length === 0) return null

  if (typeof value === 'object' && !Array.isArray(value)) {
    return { ...(value as JsonRecord), name }
  }
  return { name, type: typeof value === 'string' ? value : undefined }
}

/** A schema's parsed `fields` JSON, in whatever shape a package author
 *  wrote it (an array of specs, or a name-keyed object), normalized to
 *  one FieldSpec array. */
export function normalizeFields(raw: unknown): FieldSpec[] {
  if (Array.isArray(raw)) {
    return raw.filter(isFieldSpec).map(field => ({ ...field }))
  }

  if (raw !== null && typeof raw === 'object') {
    const record = raw as JsonRecord
    const nested = record.fields

    if (Array.isArray(nested)) {
      return nested.filter(isFieldSpec).map(field => ({ ...field }))
    }
    if (nested !== null && typeof nested === 'object' && !Array.isArray(nested)) {
      return Object.entries(nested as JsonRecord)
        .map(([name, value]) => toFieldSpec(name, value))
        .filter((field): field is FieldSpec => field !== null)
    }

    return Object.entries(record)
      .map(([name, value]) => toFieldSpec(name, value))
      .filter((field): field is FieldSpec => field !== null)
  }

  return []
}
