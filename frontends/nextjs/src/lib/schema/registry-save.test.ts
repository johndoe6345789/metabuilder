import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync, rmSync } from 'fs'
import { join } from 'path'

import {
  SchemaRegistry,
  saveSchemaRegistry,
} from '@/lib/schema/schema-registry'
import { makeDir } from './test-support/registry-fixtures'

let dir: string

beforeEach(() => {
  dir = makeDir()
})
afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
  vi.restoreAllMocks()
})

describe('saveSchemaRegistry', () => {
  it('writes schemas, packages and an entities index', () => {
    const registry = new SchemaRegistry()
    registry.register({ id: 's1', name: 'User', fields: '[]' })
    registry.packages = { core: {} }
    const path = join(dir, 'out.json')

    saveSchemaRegistry(registry, path)

    const written = JSON.parse(readFileSync(path, 'utf-8')) as {
      version: string
      schemas: unknown[]
      entities: Record<string, unknown>
    }
    expect(written.version).toBe('1.0.0')
    expect(written.schemas).toHaveLength(1)
    expect(Object.keys(written.entities)).toContain('User')
  })

  it('reports rather than throws when the path cannot be written', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    // Saving must not take the caller down over a bad path.
    expect(() => {
      saveSchemaRegistry(new SchemaRegistry(), join(dir, 'no', 'out.json'))
    }).not.toThrow()
    expect(error).toHaveBeenCalled()
  })
})
