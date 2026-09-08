import { beforeEach, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

import { POST } from './route'

const guess = (ip: string, password = 'wrong'): NextRequest =>
  new NextRequest('http://localhost/app/api/vault/auth', {
    method: 'POST',
    headers: { 'x-real-ip': ip, 'content-type': 'application/json' },
    body: JSON.stringify({ password }),
  })

beforeEach(() => {
  process.env.VAULT_MASTER_PASSWORD = 'correct horse battery staple'
})

/**
 * One instance-wide master password, checked by this route, with nothing
 * throttling it -- so the vault, which holds every credential the instance
 * manages, was brute-forceable from a loop. The login limiter existed for
 * exactly this and was applied to nothing.
 */
describe('guessing the vault master password', () => {
  it('is refused on the sixth attempt within the minute', async () => {
    const from = '10.20.0.1'
    for (let i = 0; i < 5; i += 1) {
      expect((await POST(guess(from))).status).toBe(401)
    }
    expect((await POST(guess(from))).status).toBe(429)
  })

  it('does not count one address against another', async () => {
    for (let i = 0; i < 5; i += 1) await POST(guess('10.20.0.2'))
    expect((await POST(guess('10.20.0.3'))).status).toBe(401)
  })
})
