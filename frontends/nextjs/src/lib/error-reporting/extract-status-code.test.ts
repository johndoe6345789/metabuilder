import { describe, expect, it } from 'vitest'

import { extractStatusCode } from './extract-status-code'

describe('extractStatusCode', () => {
  it('extracts a status code from a string message', () => {
    expect(extractStatusCode('Request failed with status 404')).toBe(404)
  })

  it('extracts a status code from an Error object', () => {
    expect(extractStatusCode(new Error('500 Internal Server Error'))).toBe(
      500
    )
  })

  it('returns undefined when no 3-digit number is present', () => {
    expect(extractStatusCode('Something went wrong')).toBeUndefined()
  })

  it('matches the first 3-digit run', () => {
    expect(extractStatusCode('code 404 (also 500)')).toBe(404)
  })
})
