import { describe, expect, it } from 'vitest'

import { propValueType } from '@/lib/tenant/page-tree'

/**
 * Every component property becomes a row with a value and a declared type.
 * Getting the type wrong means the property comes back as the wrong thing on
 * the next load, which is how a number silently becomes the string "12".
 */
describe('propValueType', () => {
  it('stores booleans as their words, not as 0 and 1', () => {
    expect(propValueType(true)).toEqual({ valueType: 'boolean', value: 'true' })
    expect(propValueType(false)).toEqual({
      valueType: 'boolean',
      value: 'false',
    })
  })

  it('stores numbers as digits and says they are numbers', () => {
    expect(propValueType(12)).toEqual({ valueType: 'number', value: '12' })
    expect(propValueType(0)).toEqual({ valueType: 'number', value: '0' })
    expect(propValueType(-1.5)).toEqual({ valueType: 'number', value: '-1.5' })
  })

  it('passes strings through unchanged, including empty ones', () => {
    expect(propValueType('hello')).toEqual({
      valueType: 'string',
      value: 'hello',
    })
    expect(propValueType('')).toEqual({ valueType: 'string', value: '' })
  })

  it('stores null and undefined as empty rather than the word "null"', () => {
    // A property set to nothing should read back as nothing, not as text
    // that happens to spell it.
    expect(propValueType(null)).toEqual({ valueType: 'string', value: '' })
    expect(propValueType(undefined)).toEqual({ valueType: 'string', value: '' })
  })

  it('serialises an object rather than storing "[object Object]"', () => {
    const { valueType, value } = propValueType({ a: 1 })
    expect(valueType).toBe('string')
    expect(JSON.parse(value)).toEqual({ a: 1 })
  })

  it('serialises an array the same way', () => {
    expect(JSON.parse(propValueType([1, 2]).value)).toEqual([1, 2])
  })
})
