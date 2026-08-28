import { describe, expect, it } from 'vitest'

import {
  SchemaRegistry,
  generateSchemaFragment,
} from '@/lib/schema/schema-registry'
import { withFields } from './test-support/registry-fixtures'

describe('generateSchemaFragment fields', () => {
  it('renders declared fields', () => {
    const out = generateSchemaFragment(
      withFields([
        { name: 'title', type: 'string', required: true },
        { name: 'count', type: 'number' },
      ])
    )
    expect(out).toContain('title')
    expect(out).toContain('count')
  })

  it('accepts fields stored as an object map, not only an array', () => {
    const out = generateSchemaFragment(
      withFields({ title: { type: 'string' }, count: { type: 'number' } })
    )
    expect(out).toContain('title')
    expect(out).toContain('count')
  })

  it('survives a fields string that is not JSON', () => {
    // Registry rows have held junk before, and a generator that throws takes
    // the whole schema page down with it.
    const registry = new SchemaRegistry()
    registry.register({ id: 'm1', name: 'Widget', fields: 'not json' })

    expect(() => generateSchemaFragment(registry)).not.toThrow()
  })

  it('survives fields being absent altogether', () => {
    const registry = new SchemaRegistry()
    registry.register({ id: 'm1', name: 'Widget' } as never)

    expect(() => generateSchemaFragment(registry)).not.toThrow()
  })
})
