import { describe, expect, it } from 'vitest'

import { getElementType } from './get-element-type'

describe('getElementType', () => {
  it.each([
    ['Box', 'div'],
    ['Stack', 'div'],
    ['Text', 'span'],
    ['Button', 'button'],
    ['Link', 'a'],
    ['List', 'ul'],
    ['ListItem', 'li'],
    ['Icon', 'span'],
    ['Avatar', 'div'],
    ['Badge', 'div'],
    ['Divider', 'hr'],
    ['Breadcrumbs', 'nav'],
  ])('maps %s to %s', (type, tag) => {
    expect(getElementType(type)).toBe(tag)
  })

  it('passes an unmapped type straight through', () => {
    expect(getElementType('CustomWidget')).toBe('CustomWidget')
  })
})
