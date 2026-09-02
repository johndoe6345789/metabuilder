import { describe, expect, it } from 'vitest'
import { filterPalette } from './palette-filter'
import type { PaletteItem } from './builder-registry'

const item = (name: string, type = name): PaletteItem => ({
  type,
  name,
  icon: 'widgets',
  category: 'HTML',
  container: false,
  defaults: {},
})

const items = [item('Paragraph'), item('Button'), item('Grid'), item('Card')]

describe('filterPalette', () => {
  it('returns nothing for an empty query', () => {
    expect(filterPalette(items, '')).toEqual([])
    expect(filterPalette(items, '   ')).toEqual([])
  })

  it('matches by substring, case-insensitively', () => {
    expect(filterPalette(items, 'butt').map(i => i.name)).toEqual(['Button'])
    expect(filterPalette(items, 'BUTT').map(i => i.name)).toEqual(['Button'])
  })

  it('can match more than one item', () => {
    expect(filterPalette(items, 'r').map(i => i.name).sort()).toEqual([
      'Card',
      'Grid',
      'Paragraph',
    ])
  })

  it('returns nothing when no name matches', () => {
    expect(filterPalette(items, 'zzz')).toEqual([])
  })
})
