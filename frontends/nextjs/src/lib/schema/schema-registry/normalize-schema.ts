import type { ModelSchema } from '../../types/schema-types'

type JsonRecord = Record<string, unknown>

export function pickNullableString(value: unknown): string | null | undefined {
  if (typeof value === 'string') return value
  if (value === null) return null
  return undefined
}

export function normalizeJsonValue(value: unknown, fallback: string): string {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return fallback
  try {
    return JSON.stringify(value)
  } catch {
    return fallback
  }
}

export function normalizeOptionalJsonValue(
  value: unknown
): string | null | undefined {
  if (value === null) return null
  if (value === undefined) return undefined
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return null
  }
}

const OPTIONAL_JSON_FIELDS = [
  'listDisplay',
  'listFilter',
  'searchFields',
  'ordering',
  'validations',
  'hooks',
] as const satisfies readonly (keyof ModelSchema)[]

const OPTIONAL_STRING_FIELDS = [
  'tenantId',
  'label',
  'labelPlural',
  'icon',
] as const satisfies readonly (keyof ModelSchema)[]

/** A raw, untrusted JSON record into a ModelSchema -- null when it has
 *  no usable name, since that's the one field every schema must have. */
export function normalizeSchema(raw: JsonRecord): ModelSchema | null {
  const name =
    typeof raw.name === 'string' && raw.name.length > 0 ? raw.name : null
  if (name === null) return null

  const id = typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : name
  const schema: ModelSchema = {
    id,
    name,
    fields: normalizeJsonValue(raw.fields, '[]'),
  }

  for (const field of OPTIONAL_STRING_FIELDS) {
    const value = pickNullableString(raw[field])
    if (value !== undefined) schema[field] = value
  }
  for (const field of OPTIONAL_JSON_FIELDS) {
    const value = normalizeOptionalJsonValue(raw[field])
    if (value !== undefined) schema[field] = value
  }

  return schema
}
