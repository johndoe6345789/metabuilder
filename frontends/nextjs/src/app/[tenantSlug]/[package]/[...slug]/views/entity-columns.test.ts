import { describe, expect, it } from 'vitest'

import { cellText, columnsFor } from './entity-columns'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

const schema = (...names: string[]): EntitySchema => ({
  name: 'User',
  fields: names.map(name => ({ name, type: 'string' })),
})

describe('columnsFor', () => {
  it('uses the schema when there is one', () => {
    expect(columnsFor(schema('id', 'email'), [])).toEqual(['id', 'email'])
  })

  /**
   * The schema is read from a package directory, so an entity outside one
   * -- core/User, say -- has none, and the table showed a header of just
   * "Actions" over rows with no data in them at all.
   */
  it('falls back to what the rows carry', () => {
    expect(
      columnsFor(null, [{ id: '1', email: 'a@b.c', role: 'god' }])
    ).toEqual(['id', 'email', 'role'])
  })

  it('falls back for a schema that declares no fields', () => {
    expect(columnsFor(schema(), [{ id: '1' }])).toEqual(['id'])
  })

  it('covers every field any row carries', () => {
    expect(columnsFor(null, [{ id: '1' }, { id: '2', bio: 'x' }])).toEqual([
      'id',
      'bio',
    ])
  })

  it('keeps a stable order rather than first-seen', () => {
    expect(columnsFor(null, [{ z: 1, a: 2 }])).toEqual(['a', 'z'])
  })

  it('is empty for no schema and no rows', () => {
    expect(columnsFor(null, [])).toEqual([])
  })

  it('does not invent an id column', () => {
    expect(columnsFor(null, [{ name: 'x' }])).toEqual(['name'])
  })
})

describe('cellText', () => {
  it.each([
    [null, '-'],
    [undefined, '-'],
    ['rosa', 'rosa'],
    [3, '3'],
    [true, 'true'],
  ])('prints %p as %p', (value, expected) => {
    expect(cellText(value)).toBe(expected)
  })

  it('prints an object as its JSON rather than [object Object]', () => {
    expect(cellText({ a: 1 })).toBe('{"a":1}')
  })

  it('prints a list', () => {
    expect(cellText([1, 2])).toBe('[1,2]')
  })
})
