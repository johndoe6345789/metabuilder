import { beforeEach, describe, expect, it } from 'vitest'

import { newDryRunState, type DryRunState } from './dry-run-state'
import {
  createRow,
  findRow,
  findRows,
  matches,
  removeRow,
  updateRow,
} from './row-store'

let state: DryRunState

beforeEach(() => {
  state = newDryRunState({}, 0)
})

describe('createRow', () => {
  it('keeps the row under its entity', () => {
    createRow(state, 'Booking', { name: 'Rosa' }, 'gen-1')
    expect(state.rows.Booking).toEqual([{ id: 'gen-1', name: 'Rosa' }])
  })

  it('keeps an id the workflow supplied', () => {
    const row = createRow(state, 'Booking', { id: 'b1' }, 'gen-1')
    expect(row.id).toBe('b1')
  })

  it('keeps entities apart', () => {
    createRow(state, 'Booking', {}, 'a')
    createRow(state, 'Note', {}, 'b')
    expect(Object.keys(state.rows)).toEqual(['Booking', 'Note'])
  })
})

describe('matches', () => {
  it('holds when every field of the filter agrees', () => {
    expect(matches({ a: '1', b: '2' }, { a: '1' })).toBe(true)
  })

  it('does not hold when one disagrees', () => {
    expect(matches({ a: '1' }, { a: '2' })).toBe(false)
  })

  // Adapters hand numbers back as text, so a filter of 3 has to find a
  // row of "3" -- the same mismatch that has bitten every other reader.
  it('compares a number with the text of that number', () => {
    expect(matches({ n: '3' }, { n: 3 })).toBe(true)
  })

  it('holds for no filter at all', () => {
    expect(matches({ a: '1' }, undefined)).toBe(true)
  })
})

describe('reading rows back', () => {
  beforeEach(() => {
    createRow(state, 'Booking', { id: 'b1', when: 'mon' }, 'x')
    createRow(state, 'Booking', { id: 'b2', when: 'tue' }, 'y')
  })

  it('fetches one by id', () => {
    expect(findRow(state, 'Booking', 'b2')?.when).toBe('tue')
  })

  it('has nothing for an id nobody wrote', () => {
    expect(findRow(state, 'Booking', 'b9')).toBeNull()
  })

  it('finds the rows a filter matches', () => {
    expect(findRows(state, 'Booking', { when: 'mon' }, 50)).toHaveLength(1)
  })

  it('stops at the limit', () => {
    expect(findRows(state, 'Booking', {}, 1)).toHaveLength(1)
  })

  it('has no limit at zero', () => {
    expect(findRows(state, 'Booking', {}, 0)).toHaveLength(2)
  })

  it('reads an entity nothing wrote as empty', () => {
    expect(findRows(state, 'Nothing', {}, 50)).toEqual([])
  })
})

describe('changing and removing', () => {
  beforeEach(() => {
    createRow(state, 'Booking', { id: 'b1', handled: 'no' }, 'x')
  })

  it('merges the change into the row', () => {
    expect(updateRow(state, 'Booking', 'b1', { handled: 'yes' })).toEqual({
      id: 'b1',
      handled: 'yes',
    })
  })

  it('changes nothing for a row that is not there', () => {
    expect(updateRow(state, 'Booking', 'b9', { handled: 'yes' })).toBeNull()
    expect(state.rows.Booking).toHaveLength(1)
  })

  it('removes the row it names', () => {
    expect(removeRow(state, 'Booking', 'b1')).toBe(true)
    expect(state.rows.Booking).toEqual([])
  })

  it('says so when there was nothing to remove', () => {
    expect(removeRow(state, 'Booking', 'b9')).toBe(false)
  })
})
