import { afterEach, describe, expect, it } from 'vitest'

import { getClientIp } from './client-ip'

const req = (headers: Record<string, string>) =>
  ({ headers: new Headers(headers) }) as never

afterEach(() => {
  delete process.env.RATE_LIMIT_TRUST_CF_HEADER
})

/**
 * This decides which bucket a caller counts against, so anything a caller
 * can set for themselves is a way out of the limit entirely -- and the
 * tightest limit here is 5 login attempts a minute.
 *
 * This deployment's nginx SETS X-Real-IP to $remote_addr and APPENDS to
 * X-Forwarded-For via $proxy_add_x_forwarded_for. So the real client is
 * the value nginx wrote: X-Real-IP, or the LAST entry of the forwarded
 * chain. Everything to the left of that came from the caller.
 */
describe('getClientIp', () => {
  it('prefers the address the proxy set rather than one sent to it', () => {
    expect(
      getClientIp(
        req({ 'x-forwarded-for': '9.9.9.9', 'x-real-ip': '2.2.2.2' })
      )
    ).toBe('2.2.2.2')
  })

  // The whole point: rotating this header used to hand out a fresh bucket
  // per request, so the login limiter counted to one and never further.
  it('takes the last forwarded entry, which the proxy appended', () => {
    expect(getClientIp(req({ 'x-forwarded-for': '3.3.3.3, 4.4.4.4' }))).toBe(
      '4.4.4.4'
    )
  })

  it('is not moved by a forged chain in front of the real address', () => {
    const forged = getClientIp(
      req({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 4.4.4.4' })
    )
    expect(forged).toBe('4.4.4.4')
  })

  it('trims whitespace around the forwarded IP', () => {
    expect(getClientIp(req({ 'x-forwarded-for': ' 3.3.3.3 ' }))).toBe('3.3.3.3')
  })

  // Trustworthy only when something upstream really is CloudFlare and
  // strips it otherwise. Off by default: nothing else here does that, so
  // trusting it unconditionally is just another header a caller can set.
  it('ignores the CloudFlare header unless it is opted into', () => {
    expect(
      getClientIp(
        req({ 'cf-connecting-ip': '1.1.1.1', 'x-real-ip': '2.2.2.2' })
      )
    ).toBe('2.2.2.2')
  })

  it('uses the CloudFlare header when the deployment says to', () => {
    process.env.RATE_LIMIT_TRUST_CF_HEADER = 'true'
    expect(
      getClientIp(
        req({ 'cf-connecting-ip': '1.1.1.1', 'x-real-ip': '2.2.2.2' })
      )
    ).toBe('1.1.1.1')
  })

  // Everyone sharing one bucket over-limits, which is the safe direction.
  it('falls back to "unknown" with no identifying header', () => {
    expect(getClientIp(req({}))).toBe('unknown')
  })
})
