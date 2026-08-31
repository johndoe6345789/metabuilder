import { afterEach, describe, expect, it } from 'vitest'

import { applyRateLimit } from './apply-rate-limit'
import { resetRateLimit } from './reset-rate-limit'
import { getClientIp } from './client-ip'

const req = (ip: string) =>
  ({ headers: new Headers({ 'x-forwarded-for': ip }) }) as never

describe('applyRateLimit', () => {
  afterEach(() => {
    resetRateLimit(getClientIp(req('applyRateLimit-test-ip')))
  })

  it('lets a request through under the bootstrap limit', () => {
    expect(applyRateLimit(req('applyRateLimit-test-ip'), 'bootstrap')).toBeNull()
  })

  it('refuses a second bootstrap request from the same caller', () => {
    const first = req('applyRateLimit-test-ip')
    applyRateLimit(first, 'bootstrap')
    expect(applyRateLimit(first, 'bootstrap')?.status).toBe(429)
  })
})
