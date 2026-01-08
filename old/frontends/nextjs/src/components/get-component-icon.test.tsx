import { describe, expect, it } from 'vitest'

import { getComponentIcon } from './get-component-icon'

const knownIcons = [
  'Article',
  'Card',
  'Chat',
  'CheckSquare',
  'CircleNotch',
  'Columns',
  'CursorClick',
  'FrameCorners',
  'GridFour',
  'Minus',
  'Seal',
  'SlidersHorizontal',
  'Stack',
  'Table',
  'Tag',
  'TextAlignLeft',
  'TextHOne',
  'TextT',
  'ToggleRight',
  'UserCircle',
  'Warning',
] as const

describe('getComponentIcon', () => {
  it.each(knownIcons)('returns an icon for %s', iconName => {
    expect(getComponentIcon(iconName, { style: { fontSize: 20 } })).not.toBeNull()
  })

  it('returns null for unknown icons', () => {
    expect(getComponentIcon('UnknownIcon')).toBeNull()
  })
})
