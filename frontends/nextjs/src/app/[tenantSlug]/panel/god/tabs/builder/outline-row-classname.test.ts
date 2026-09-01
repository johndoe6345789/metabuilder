import { describe, expect, it } from 'vitest'
import { outlineRowClassName } from './outline-row-classname'

const styles = {
  row: 'row',
  rowActive: 'rowActive',
  rowDropping: 'rowDropping',
  rowDropBefore: 'rowDropBefore',
  rowDropAfter: 'rowDropAfter',
}

describe('outlineRowClassName', () => {
  it('returns just the base row class when unselected and not dropping', () => {
    expect(outlineRowClassName(styles, false, null)).toBe('row')
  })

  it('adds the active class when selected', () => {
    expect(outlineRowClassName(styles, true, null)).toBe('row rowActive')
  })

  it('adds the dropping class for "into"', () => {
    expect(outlineRowClassName(styles, false, 'into')).toBe(
      'row rowDropping'
    )
  })

  it('adds the drop-before class for "before"', () => {
    expect(outlineRowClassName(styles, false, 'before')).toBe(
      'row rowDropBefore'
    )
  })

  it('combines selected and drop-after classes', () => {
    expect(outlineRowClassName(styles, true, 'after')).toBe(
      'row rowActive rowDropAfter'
    )
  })
})
