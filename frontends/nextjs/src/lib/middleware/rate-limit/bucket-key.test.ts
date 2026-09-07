import { describe, expect, it } from 'vitest'

import { rateLimitKey } from './bucket-key'

const req = (ip: string) =>
  ({ headers: new Headers({ 'x-real-ip': ip }) }) as never

/**
 * Every limiter shared one bucket keyed on the address alone, so their
 * counts ran together: `mutation` allows 50 a minute and `list` 100, so
 * about fifty mixed calls from one founder made every publish 429 for the
 * rest of the window. Worse, whichever limiter touched the entry first
 * fixed its reset time, and `public` and `bootstrap` use hour-long
 * windows -- one of those early in a session pinned the window open for
 * an hour.
 */
describe('which bucket a request counts against', () => {
  it('keeps one endpoint’s count away from another’s', () => {
    expect(rateLimitKey('login', req('1.1.1.1'))).not.toBe(
      rateLimitKey('mutation', req('1.1.1.1'))
    )
  })

  it('keeps one caller’s count away from another’s', () => {
    expect(rateLimitKey('login', req('1.1.1.1'))).not.toBe(
      rateLimitKey('login', req('2.2.2.2'))
    )
  })

  it('is stable for the same endpoint and caller', () => {
    expect(rateLimitKey('login', req('1.1.1.1'))).toBe(
      rateLimitKey('login', req('1.1.1.1'))
    )
  })

  it('names the endpoint, so a bucket can be recognised', () => {
    expect(rateLimitKey('bootstrap', req('1.1.1.1'))).toContain('bootstrap')
  })
})
