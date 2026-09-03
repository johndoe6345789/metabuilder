import { describe, expect, it } from 'vitest'
import type { PropField } from '@/components/blocks/block-props'
import { coerceValue, resolveField } from './fields'

const variant: PropField = {
  name: 'variant',
  label: 'Style',
  type: 'select',
  options: [
    { label: 'Solid', value: 'contained' },
    { label: 'Outlined', value: 'outlined' },
  ],
}
const gap: PropField = { name: 'gap', label: 'Space between items', type: 'number' }
const fields = [variant, gap]

describe('resolveField', () => {
  it('matches by the prop key', () => {
    expect(resolveField(fields, 'gap')).toBe(gap)
  })

  it('matches by the label the visual editor shows, case-insensitively', () => {
    expect(resolveField(fields, 'style')).toBe(variant)
  })

  it('returns undefined when nothing matches', () => {
    expect(resolveField(fields, 'nonsense')).toBeUndefined()
  })
})

describe('coerceValue', () => {
  it('parses a number field', () => {
    expect(coerceValue(gap, '16')).toEqual({ value: 16 })
  })

  it('rejects a non-numeric value for a number field', () => {
    expect(coerceValue(gap, 'lots')).toEqual({
      error: '"lots" is not a number',
    })
  })

  it('matches a select field by option label', () => {
    expect(coerceValue(variant, 'Solid')).toEqual({ value: 'contained' })
  })

  it('matches a select field by option value', () => {
    expect(coerceValue(variant, 'outlined')).toEqual({ value: 'outlined' })
  })

  it('rejects a select value with no matching option', () => {
    expect(coerceValue(variant, 'primary')).toEqual({
      error: '"primary" is not one of: Solid, Outlined',
    })
  })

  it('parses a boolean field', () => {
    const runWorkflow: PropField = { name: 'x', label: 'X', type: 'boolean' }
    expect(coerceValue(runWorkflow, 'yes')).toEqual({ value: true })
    expect(coerceValue(runWorkflow, 'no')).toEqual({ value: false })
  })

  it('passes a text field through unchanged', () => {
    const text: PropField = { name: 'label', label: 'Label', type: 'text' }
    expect(coerceValue(text, 'Join now')).toEqual({ value: 'Join now' })
  })
})
