import { describe, expect, it } from 'vitest'

import {
  SchemaRegistry,
  generateSchemaFragment,
} from '@/lib/schema/schema-registry'
import { withFields } from './test-support/registry-fixtures'

describe('generateSchemaFragment scaffolding', () => {
  it('emits nothing for an empty registry', () => {
    expect(generateSchemaFragment(new SchemaRegistry())).toBe('')
  })

  it('opens and closes a model block named for the schema', () => {
    const out = generateSchemaFragment(withFields([]))
    expect(out).toContain('// Model: Widget')
    expect(out).toContain('model Widget {')
    expect(out.trimEnd().endsWith('}')).toBe(true)
  })

  it('supplies id, createdAt and updatedAt when the schema omits them', () => {
    const out = generateSchemaFragment(withFields([]))
    expect(out).toContain('id String @id @default(cuid())')
    expect(out).toContain('createdAt DateTime @default(now())')
    expect(out).toContain('updatedAt DateTime @updatedAt')
  })

  it('does not scaffold a second id when the schema declares one', () => {
    const out = generateSchemaFragment(
      withFields([{ name: 'id', type: 'string', primary: true }])
    )
    // A declared id renders to the same line the scaffold would add, so the
    // check is that it appears once rather than not at all.
    const occurrences = out.split('@id').length - 1
    expect(occurrences).toBe(1)
  })

  it('emits a block per schema', () => {
    const registry = new SchemaRegistry()
    registry.register({ id: 'a', name: 'Alpha', fields: '[]' })
    registry.register({ id: 'b', name: 'Beta', fields: '[]' })

    const out = generateSchemaFragment(registry)

    expect(out).toContain('model Alpha {')
    expect(out).toContain('model Beta {')
  })
})
