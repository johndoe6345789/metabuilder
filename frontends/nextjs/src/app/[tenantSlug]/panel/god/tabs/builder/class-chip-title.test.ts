import { describe, expect, it } from 'vitest'
import { classChipTitle } from './class-chip-title'

describe('classChipTitle', () => {
  it('hints when there are no declarations', () => {
    expect(classChipTitle({})).toBe('No declarations yet')
  })

  it('renders a single declaration', () => {
    expect(classChipTitle({ color: 'red' })).toBe('color: red')
  })

  it('renders one declaration per line', () => {
    expect(classChipTitle({ color: 'red', margin: '0' })).toBe(
      'color: red\nmargin: 0'
    )
  })
})
