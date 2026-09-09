/**
 * Which columns a list view shows.
 *
 * The schema comes from a package directory (`loadEntitySchema` reads
 * `packages/{packageId}`), so for everything outside one -- `core/User`,
 * say -- it is null, and the table rendered a header of nothing but
 * "Actions" and a row per record with no record in it. The rows
 * themselves say what they carry, so they are used when nothing else
 * does.
 */

import type { EntitySchema } from '@/lib/entities/load-entity-schema'

/** id first, then the rest alphabetically, so the table does not shuffle
 *  when a later row happens to carry an extra field. */
function fromRows(rows: Record<string, unknown>[]): string[] {
  const seen = [...new Set(rows.flatMap(row => Object.keys(row)))]
  const rest = seen.filter(name => name !== 'id').sort()
  return seen.includes('id') ? ['id', ...rest] : rest
}

export function columnsFor(
  schema: EntitySchema | null,
  rows: Record<string, unknown>[]
): string[] {
  const declared = schema?.fields.map(field => field.name) ?? []
  return declared.length > 0 ? declared : fromRows(rows)
}

/** One cell, printable. */
export function cellText(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}
