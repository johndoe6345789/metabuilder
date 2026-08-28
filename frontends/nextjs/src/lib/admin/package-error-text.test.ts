import { describe, expect, it } from 'vitest'

import {
  PACKAGE_ERROR_MESSAGES,
  errorCodeOf,
  messageForCode,
} from './package-error-text'

describe('errorCodeOf', () => {
  it('reads a string code off an error object', () => {
    expect(errorCodeOf({ code: 'NETWORK_ERROR' })).toBe('NETWORK_ERROR')
  })

  it('returns empty for anything without a usable code', () => {
    expect(errorCodeOf(null)).toBe('')
    expect(errorCodeOf(undefined)).toBe('')
    expect(errorCodeOf('NETWORK_ERROR')).toBe('')
    expect(errorCodeOf({ code: 42 })).toBe('')
    expect(errorCodeOf(new Error('boom'))).toBe('')
  })
})

describe('messageForCode', () => {
  it('gives the mapped message for a known code', () => {
    expect(messageForCode('ALREADY_INSTALLED', 'fallback')).toBe(
      'This package is already installed.'
    )
  })

  it('falls back for an unknown code', () => {
    expect(messageForCode('NOPE', 'Something went wrong')).toBe(
      'Something went wrong'
    )
    expect(messageForCode('', 'Something went wrong')).toBe(
      'Something went wrong'
    )
  })
})

describe('the message table', () => {
  it('ends every message with a full stop', () => {
    for (const text of Object.values(PACKAGE_ERROR_MESSAGES)) {
      expect(text.endsWith('.')).toBe(true)
    }
  })

  it('has no duplicate wording, which would mean two codes are one', () => {
    const texts = Object.values(PACKAGE_ERROR_MESSAGES)
    expect(new Set(texts).size).toBe(texts.length)
  })
})
