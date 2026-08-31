import { describe, expect, it } from 'vitest'

import { getClientIp } from './client-ip'

const req = (headers: Record<string, string>) =>
  ({ headers: new Headers(headers) }) as never

describe('getClientIp', () => {
  it('prefers the CloudFlare header', () => {
    expect(
      getClientIp(
        req({ 'cf-connecting-ip': '1.1.1.1', 'x-real-ip': '2.2.2.2' })
      )
    ).toBe('1.1.1.1')
  })

  it('falls back to the first X-Forwarded-For address', () => {
    expect(
      getClientIp(req({ 'x-forwarded-for': '3.3.3.3, 4.4.4.4' }))
    ).toBe('3.3.3.3')
  })

  it('trims whitespace around the forwarded IP', () => {
    expect(getClientIp(req({ 'x-forwarded-for': ' 3.3.3.3 ' }))).toBe(
      '3.3.3.3'
    )
  })

  it('falls back to X-Real-IP when nothing else is set', () => {
    expect(getClientIp(req({ 'x-real-ip': '5.5.5.5' }))).toBe('5.5.5.5')
  })

  it('falls back to "unknown" with no identifying header', () => {
    expect(getClientIp(req({}))).toBe('unknown')
  })
})
