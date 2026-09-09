/**
 * The fields a create or edit form offers, and what they hold.
 *
 * The forms rendered `schema?.fields`, and the schema comes from a
 * package directory, so outside one they offered no fields at all -- and
 * their "Create" and "Save Changes" buttons were `type="button"` with no
 * handler, so the whole form was scenery. See EntityForm.
 */

import type { EntitySchema } from '@/lib/entities/load-entity-schema'
import { columnsFor } from './entity-columns'

export type FieldKind = 'text' | 'number' | 'boolean' | 'json'

export interface FormField {
  name: string
  kind: FieldKind
  /** What the schema says this field is for, where it says anything. */
  hint?: string
  /** Marked with a * so the operator knows before the server refuses. */
  required?: boolean
}

/** A schema type name, or the shape of a value already stored. */
export function fieldKind(
  declared: string | undefined,
  value: unknown
): FieldKind {
  const type = (declared ?? '').toLowerCase()
  if (['number', 'integer', 'int', 'float', 'decimal', 'bigint'].includes(type))
    return 'number'
  if (['boolean', 'bool'].includes(type)) return 'boolean'
  if (['object', 'json', 'array'].includes(type)) return 'json'
  if (type !== '') return 'text'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  if (value !== null && typeof value === 'object') return 'json'
  return 'text'
}

/**
 * The form's fields: the schema's when it has any, otherwise whatever the
 * record carries. `id` is left out of a create form -- the data layer
 * assigns one -- but kept on an edit form, read-only, so the operator can
 * see which row they are changing.
 */
export function formFields(
  schema: EntitySchema | null,
  record: Record<string, unknown>
): FormField[] {
  const declared = new Map(
    (schema?.fields ?? []).map(field => [field.name, field])
  )
  return columnsFor(schema, [record]).map(name => {
    const field = declared.get(name)
    const hint = field?.description
    return {
      name,
      kind: fieldKind(field?.type, record[name]),
      ...(hint !== undefined && hint !== '' ? { hint } : {}),
      ...(field?.required === true ? { required: true } : {}),
    }
  })
}

/** What each input starts with, as the text an input holds. */
export function initialValues(
  fields: FormField[],
  record: Record<string, unknown>
): Record<string, string> {
  return Object.fromEntries(
    fields.map(field => {
      const value = record[field.name]
      if (value === null || value === undefined) return [field.name, '']
      if (typeof value === 'string') return [field.name, value]
      return [field.name, JSON.stringify(value)]
    })
  )
}

/** The row to send: text turned back into what each field holds. */
export function toRecord(
  fields: FormField[],
  values: Record<string, string>
): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  for (const field of fields) {
    const raw = (values[field.name] ?? '').trim()
    // An untouched field is left out rather than sent as "", which would
    // overwrite a real value with an empty one on an edit.
    if (raw === '') continue
    if (field.kind === 'number') {
      const n = Number(raw)
      row[field.name] = Number.isFinite(n) ? n : raw
      continue
    }
    if (field.kind === 'boolean') {
      row[field.name] = raw === 'true'
      continue
    }
    if (field.kind === 'json') {
      try {
        row[field.name] = JSON.parse(raw)
      } catch {
        row[field.name] = raw
      }
      continue
    }
    row[field.name] = raw
  }
  return row
}
