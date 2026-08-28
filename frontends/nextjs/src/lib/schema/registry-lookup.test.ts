import { describe, expect, it } from 'vitest'

import { SchemaRegistry } from '@/lib/schema/schema-registry'

describe('SchemaRegistry lookup', () => {
  it('finds a schema by id or by name', () => {
    const registry = new SchemaRegistry()
    registry.register({ id: 'u1', name: 'User', fields: '[]' })

    // Callers hold whichever they have; both must resolve.
    expect(registry.get('u1')?.name).toBe('User')
    expect(registry.get('User')?.id).toBe('u1')
    expect(registry.get('missing')).toBeUndefined()
  })

  it('reports membership by id only, since has() is a map lookup', () => {
    const registry = new SchemaRegistry()
    registry.register({ id: 'u1', name: 'User', fields: '[]' })

    expect(registry.has('u1')).toBe(true)
    expect(registry.has('User')).toBe(false)
  })

  it('re-registering the same id replaces the schema', () => {
    const registry = new SchemaRegistry()
    registry.register({ id: 'u1', name: 'User', fields: '[]' })
    registry.register({ id: 'u1', name: 'Person', fields: '[]' })

    expect(registry.getAll()).toHaveLength(1)
    expect(registry.get('u1')?.name).toBe('Person')
  })

  it('clear() empties schemas, packages and the migration queue', () => {
    const registry = new SchemaRegistry()
    registry.register({ id: 'a', name: 'A', fields: '[]' })
    registry.packages = { pkg: {} }
    registry.migrationQueue = [{ id: 'm' }]

    registry.clear()

    expect(registry.getAll()).toEqual([])
    expect(registry.packages).toEqual({})
    expect(registry.migrationQueue).toEqual([])
  })
})
