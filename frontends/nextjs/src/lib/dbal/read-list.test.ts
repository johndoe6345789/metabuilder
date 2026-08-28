import { describe, expect, it } from 'vitest'

import { readList, readListStrict, readOne } from './read-list'

const rows = [{ id: 'a' }, { id: 'b' }]

describe('readList', () => {
  describe('the shapes DBAL actually produces', () => {
    it('reads the full envelope', () => {
      expect(readList({ success: true, data: { data: rows, total: 2 } })).toEqual(
        rows
      )
    })

    it('reads a once-unwrapped envelope', () => {
      expect(readList({ data: rows })).toEqual(rows)
    })

    it('reads a two-level payload with no success key', () => {
      // This is the shape useInstalledPackages could not read.
      expect(readList({ data: { data: rows } })).toEqual(rows)
    })

    it('reads a bare array', () => {
      expect(readList(rows)).toEqual(rows)
    })

    it('reads an envelope whose data is a bare array', () => {
      expect(readList({ success: true, data: rows })).toEqual(rows)
    })
  })

  describe('empty results', () => {
    it.each([
      [{ success: true, data: { data: [] } }],
      [{ data: [] }],
      [{ data: { data: [] } }],
      [[]],
    ])('reads %p as an empty list', input => {
      expect(readList(input)).toEqual([])
    })
  })

  describe('things that are not list responses', () => {
    it.each([
      [null],
      [undefined],
      ['text'],
      [42],
      [true],
      [{}],
      [{ error: 'nope' }],
      [{ data: 'not a list' }],
      [{ data: { total: 0 } }],
    ])('answers an empty list for %p', input => {
      expect(readList(input)).toEqual([])
    })
  })

  it('does not dig past the shapes DBAL produces', () => {
    // Four levels means the contract changed; guessing would hide that.
    expect(readList({ data: { data: { data: { data: rows } } } })).toEqual([])
  })

  it('returns the same array instance it found, not a copy', () => {
    const source = { data: { data: rows } }
    expect(readList(source)).toBe(rows)
  })
})

describe('readListStrict', () => {
  it('tells an empty table from a misread envelope', () => {
    expect(readListStrict({ data: { data: [] } })).toEqual([])
    expect(readListStrict({ error: 'boom' })).toBeNull()
  })

  it.each([[null], [undefined], ['text'], [{ nope: 1 }]])(
    'answers null for %p',
    input => {
      expect(readListStrict(input)).toBeNull()
    }
  )
})

describe('readOne', () => {
  it('takes the first row', () => {
    expect(readOne({ data: { data: rows } })).toEqual({ id: 'a' })
  })

  it('answers null for an empty list', () => {
    expect(readOne({ data: { data: [] } })).toBeNull()
  })

  it('answers null for a payload that is not a list', () => {
    expect(readOne({ error: 'nope' })).toBeNull()
  })
})
