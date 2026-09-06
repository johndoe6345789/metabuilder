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

  // Was 'string' until a nested `data` parameter was found not to survive
  // the round trip; the text is the same, the type column is what changed.
  it('JSON-serialises anything else, under the json type', () => {
    expect(writeValue({ a: 1 })).toEqual({
      valueType: 'json',
      value: '{"a":1}',
    })
  })

  it('stores null/undefined as an empty string', () => {
    expect(writeValue(null)).toEqual({ valueType: 'string', value: '' })
    expect(writeValue(undefined)).toEqual({ valueType: 'string', value: '' })
  })
})

/**
 * A step's parameters are not all scalars: dbal.entity.create takes a
 * nested `data` object naming the columns to write. That went out as a
 * JSON string typed 'string' and came back as a string, so a graph saved
 * and reloaded no longer described the same step -- the object had
 * quietly become text, and only at execution time would anything notice.
 */
describe('a parameter that is not a scalar', () => {
  it('survives the round trip as an object', () => {
    const data = { entity: 'FormSubmission', values: { name: '${event.id}' } }
    const written = writeValue(data)
    expect(readValue(row(written))).toEqual(data)
  })

  it('survives the round trip as an array', () => {
    const list = ['a', 'b']
    const written = writeValue(list)
    expect(readValue(row(written))).toEqual(list)
  })

  it('is stored under its own value type, not as a string', () => {
    expect(writeValue({ a: 1 }).valueType).toBe('json')
  })

  // A string that merely looks like JSON is still a string: the type
  // column decides, not the shape of the text.
  it('leaves a string that looks like JSON alone', () => {
    expect(readValue(row({ value: '{"a":1}', valueType: 'string' }))).toBe(
      '{"a":1}'
    )
  })

  // Rows written before the json type existed carry stringified objects
  // typed 'string'; they must keep reading back exactly as they did.
  it('keeps null as an empty string, as before', () => {
    const written = writeValue(null)
    expect(written.valueType).toBe('string')
    expect(readValue(row(written))).toBe('')
  })

  it('falls back to the raw text if a json row will not parse', () => {
    expect(readValue(row({ value: 'not json', valueType: 'json' }))).toBe(
      'not json'
    )
  })
})
