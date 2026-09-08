/**
 * The rows a dry run pretends to write.
 *
 * A test that really wrote would leave a founder's database full of test
 * rows, and one that wrote nothing could not check a workflow that reads
 * back what it just saved. So the row steps run against this, and the tab
 * shows what they did.
 */

import type { DryRunState, Row } from './dry-run-state'

const text = (value: unknown): string =>
  value === undefined || value === null
    ? ''
    : typeof value === 'string'
      ? value
      : JSON.stringify(value)

/** Rows of one entity, created on first use. */
export function table(state: DryRunState, entity: string): Row[] {
  state.rows[entity] ??= []
  return state.rows[entity]
}

/** Every field of the filter matches, compared as the text it prints as. */
export function matches(row: Row, filter: unknown): boolean {
  if (filter === null || typeof filter !== 'object') return true
  return Object.entries(filter as Row).every(
    ([field, want]) => text(row[field]) === text(want)
  )
}

export function createRow(
  state: DryRunState,
  entity: string,
  data: Row,
  fallbackId: string
): Row {
  const row = { id: data.id ?? fallbackId, ...data }
  table(state, entity).push(row)
  return row
}

export function findRow(
  state: DryRunState,
  entity: string,
  id: unknown
): Row | null {
  return table(state, entity).find(r => text(r.id) === text(id)) ?? null
}

export function findRows(
  state: DryRunState,
  entity: string,
  filter: unknown,
  limit: number
): Row[] {
  const found = table(state, entity).filter(r => matches(r, filter))
  return limit > 0 ? found.slice(0, limit) : found
}

export function updateRow(
  state: DryRunState,
  entity: string,
  id: unknown,
  data: Row
): Row | null {
  const rows = table(state, entity)
  const at = rows.findIndex(r => text(r.id) === text(id))
  if (at < 0) return null
  rows[at] = { ...rows[at], ...data }
  return rows[at]
}

/** True when there was a row to remove. */
export function removeRow(
  state: DryRunState,
  entity: string,
  id: unknown
): boolean {
  const rows = table(state, entity)
  const at = rows.findIndex(r => text(r.id) === text(id))
  if (at < 0) return false
  rows.splice(at, 1)
  return true
}
