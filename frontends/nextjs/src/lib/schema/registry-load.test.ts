import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rmSync } from 'fs'
import { join } from 'path'

import {
  loadSchemaRegistry,
  schemaRegistry,
} from '@/lib/schema/schema-registry'
import { makeDir, writeDoc } from './test-support/registry-fixtures'

let dir: string

beforeEach(() => {
  dir = makeDir()
  schemaRegistry.clear()
})
afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
  vi.restoreAllMocks()
})

describe('loadSchemaRegistry', () => {
  it('returns an empty registry when the file is absent', () => {
    expect(loadSchemaRegistry(join(dir, 'nope.json')).getAll()).toEqual([])
  })

  it('loads schemas, packages and the migration queue', () => {
    const path = writeDoc(dir, {
      schemas: [{ id: 's1', name: 'User', fields: '[]' }],
      packages: { core: { version: 1 } },
      migrationQueue: [{ id: 'm1' }],
    })

    const registry = loadSchemaRegistry(path)

    expect(registry.get('User')?.id).toBe('s1')
    expect(registry.packages).toEqual({ core: { version: 1 } })
    expect(registry.migrationQueue).toEqual([{ id: 'm1' }])
  })

  it('accepts entities keyed by name as well as a schemas array', () => {
    const path = writeDoc(dir, {
      entities: { Invoice: { fields: [{ name: 'total', type: 'number' }] } },
    })

    // The key supplies the name the entity form omits.
    expect(loadSchemaRegistry(path).get('Invoice')?.name).toBe('Invoice')
  })

  it('skips entity values that are null', () => {
    expect(
      loadSchemaRegistry(writeDoc(dir, { entities: { Gone: null } })).getAll()
    ).toEqual([])
  })
})
