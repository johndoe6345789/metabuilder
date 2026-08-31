import { describe, it, expect } from 'vitest'
import { readValue, writeValue } from './param-value'
import type { ParamRow } from './types'

function row(over: Partial<ParamRow>): ParamRow {
  return { nodeId: 'n1', name: 'x', value: null, valueType: 'string', ...over }
}

describe('readValue', () => {
  it('parses a stored number', () => {
    expect(readValue(row({ value: '42', valueType: 'number' }))).toBe(42)
  })

  it('falls back to the raw string for an unparseable number', () => {
    expect(readValue(row({ value: 'nope', valueType: 'number' }))).toBe(
      'nope'
    )
  })

  it('parses a stored boolean', () => {
    expect(readValue(row({ value: 'true', valueType: 'boolean' }))).toBe(true)
    expect(readValue(row({ value: 'false', valueType: 'boolean' }))).toBe(
      false
    )
  })

  it('passes a string through unchanged', () => {
    expect(readValue(row({ value: 'hello', valueType: 'string' }))).toBe(
      'hello'
    )
  })

  it('defaults a null value to an empty string', () => {
    expect(readValue(row({ value: null, valueType: 'string' }))).toBe('')
  })
})

describe('writeValue', () => {
  it('stringifies a boolean', () => {
    expect(writeValue(true)).toEqual({ valueType: 'boolean', value: 'true' })
    expect(writeValue(false)).toEqual({
      valueType: 'boolean',
      value: 'false',
    })
  })

  it('stringifies a number', () => {
    expect(writeValue(42)).toEqual({ valueType: 'number', value: '42' })
  })

  it('keeps a string as-is', () => {
    expect(writeValue('hi')).toEqual({ valueType: 'string', value: 'hi' })
  })

  it('JSON-stringifies anything else', () => {
    expect(writeValue({ a: 1 })).toEqual({
      valueType: 'string',
      value: '{"a":1}',
    })
  })

  it('stores null/undefined as an empty string', () => {
    expect(writeValue(null)).toEqual({ valueType: 'string', value: '' })
    expect(writeValue(undefined)).toEqual({ valueType: 'string', value: '' })
  })
})
