import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rmSync, writeFileSync } from 'fs'
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

describe('loadSchemaRegistry on bad input', () => {
  it('drops a schema with no usable name rather than registering junk', () => {
    const path = writeDoc(dir, {
      schemas: [
        { id: 'x', fields: '[]' },
        { id: 'y', name: '', fields: '[]' },
      ],
    })
    expect(loadSchemaRegistry(path).getAll()).toEqual([])
  })

  it('warns and returns what it has when the file is not JSON', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const path = join(dir, 'broken.json')
    writeFileSync(path, '{ not json')

    expect(loadSchemaRegistry(path).getAll()).toEqual([])
    expect(warn).toHaveBeenCalled()
  })

  it('ignores a top-level array, which is not a registry document', () => {
    const path = writeDoc(dir, [{ id: 'a', name: 'A' }])
    expect(loadSchemaRegistry(path).getAll()).toEqual([])
  })

  it('ignores a migrationQueue that is not an array', () => {
    const path = writeDoc(dir, { migrationQueue: { nope: true } })
    expect(loadSchemaRegistry(path).migrationQueue).toEqual([])
  })
})
