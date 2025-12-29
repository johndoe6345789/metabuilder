import { describe, expect, it } from 'vitest'

import { normalizeAllowedGlobals } from './normalize-allowed-globals'

describe('normalizeAllowedGlobals', () => {
  it('returns defaults when input is missing', () => {
    const result = normalizeAllowedGlobals()
    expect(result).toContain('math')
    expect(result).toContain('print')
  })

  it('filters unknown globals and dedupes', () => {
    const result = normalizeAllowedGlobals(['math', 'os', 'math'])
    expect(result).toEqual(['math'])
  })

  it('falls back to defaults when nothing valid remains', () => {
    const result = normalizeAllowedGlobals(['os', 'debug'])
    expect(result).toContain('math')
  })
})
