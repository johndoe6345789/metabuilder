import { describe, expect, it } from 'vitest'
import { fieldWarning } from './field-warning'
import type { PropField } from '@/components/blocks/block-props'

const altField: PropField = {
  name: 'alt',
  label: 'Description',
  type: 'text',
  warnIfEmpty: {
    when: props => typeof props.src === 'string' && props.src.trim() !== '',
    message: 'needs a description',
  },
}

const plainField: PropField = { name: 'title', label: 'Title', type: 'text' }

describe('fieldWarning', () => {
  it('warns when the field is empty and the condition holds', () => {
    expect(fieldWarning(altField, '', { src: 'photo.jpg' })).toBe(
      'needs a description'
    )
  })

  it('does not warn when the field already has a value', () => {
    expect(fieldWarning(altField, 'A red bicycle', { src: 'photo.jpg' })).toBeUndefined()
  })

  it('does not warn when the condition does not hold', () => {
    // No image set yet -- an empty description is not a gap, it's just unset.
    expect(fieldWarning(altField, '', { src: '' })).toBeUndefined()
  })

  it('does not warn on a field with no warnIfEmpty rule', () => {
    expect(fieldWarning(plainField, '', {})).toBeUndefined()
  })

  it('treats whitespace-only text as empty', () => {
    expect(fieldWarning(altField, '   ', { src: 'photo.jpg' })).toBe(
      'needs a description'
    )
  })
})
