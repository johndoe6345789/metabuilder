import { describe, it, expect } from 'vitest'
import { rowsOf } from './rows-of'

describe('rowsOf', () => {
  it('unwraps a double-nested DBAL list envelope', () => {
    expect(rowsOf({ data: { data: [{ id: '1' }] } })).toEqual([{ id: '1' }])
  })

  it('returns an empty array for a missing data field', () => {
    expect(rowsOf({})).toEqual([])
  })

  it('returns an empty array for null', () => {
    expect(rowsOf(null)).toEqual([])
  })

  it('returns an empty array when the inner data is not an array', () => {
    expect(rowsOf({ data: { data: 'nope' } })).toEqual([])
  })
})
