/** Shared setup for the schema-registry tests. */
import { mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

import { SchemaRegistry } from '@/lib/schema/schema-registry'

export const makeDir = (): string =>
  mkdtempSync(join(tmpdir(), 'schema-registry-'))

/** Write a registry document and return its path. */
export const writeDoc = (dir: string, value: unknown): string => {
  const path = join(dir, 'registry.json')
  writeFileSync(path, JSON.stringify(value))
  return path
}

/** A registry holding one schema with the given fields. */
export const withFields = (fields: unknown): SchemaRegistry => {
  const registry = new SchemaRegistry()
  registry.register({
    id: 'm1',
    name: 'Widget',
    fields: typeof fields === 'string' ? fields : JSON.stringify(fields),
  })
  return registry
}

/** A queued migration, overridable per case. */
export const queued = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  packageId: 'core',
  status: 'pending',
  queuedAt: '2026-01-01T00:00:00Z',
  entities: ['User', { name: 'Invoice' }, 42],
  ...over,
})
