import { describe, expect, it } from 'vitest'

import { safeParseJson } from './safe-parse-json'

describe('safeParseJson', () => {
  it('parses valid JSON', () => {
    expect(safeParseJson('{"a":1}')).toEqual({ a: 1 })
  })

  it('returns undefined for invalid JSON rather than throwing', () => {
    expect(safeParseJson('{not json')).toBeUndefined()
  })

  it('parses a JSON array', () => {
    expect(safeParseJson('[1,2,3]')).toEqual([1, 2, 3])
  })
})
