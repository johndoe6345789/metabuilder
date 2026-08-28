import { describe, expect, it } from 'vitest'

import { maskEmail, truncate } from './context-logging'

describe('truncate', () => {
  it('keeps short values whole', () => {
    expect(truncate('1.2.3.4', 10)).toBe('1.2.3.4')
  })

  it('marks a shortened value so it cannot be mistaken for the whole', () => {
    expect(truncate('192.168.100.200', 10)).toBe('192.168.10...')
  })

  it('passes undefined through rather than inventing a value', () => {
    expect(truncate(undefined, 10)).toBeUndefined()
  })

  it('keeps a value exactly at the limit intact', () => {
    expect(truncate('0123456789', 10)).toBe('0123456789')
  })
})

describe('maskEmail', () => {
  it('keeps the domain and drops the person', () => {
    // Enough to tell which tenant a line came from, not who.
    expect(maskEmail('dave@nunn-and-son.co.uk')).toBe('***@nunn-and-son.co.uk')
  })

  it('masks entirely when there is no domain to keep', () => {
    expect(maskEmail('not-an-email')).toBe('***')
  })

  it('splits on the last @, so a quoted local part cannot leak', () => {
    expect(maskEmail('"a@b"@example.com')).toBe('***@example.com')
  })

  it('treats empty and undefined as nothing to log', () => {
    expect(maskEmail('')).toBeUndefined()
    expect(maskEmail(undefined)).toBeUndefined()
  })
})
