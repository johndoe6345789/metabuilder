import { describe, it, expect } from 'vitest'
import { determineRateLimitType } from './rate-limit-type'

function req(method: string, path: string) {
  return {
    url: `http://localhost/api/v1/${path}`,
    method,
  } as unknown as Parameters<typeof determineRateLimitType>[0]
}

describe('determineRateLimitType', () => {
  it('classifies a login POST', () => {
    expect(determineRateLimitType(req('POST', 'acme/auth/login'))).toBe(
      'login'
    )
  })

  it('classifies a register POST', () => {
    expect(determineRateLimitType(req('POST', 'acme/auth/register'))).toBe(
      'register'
    )
  })

  it('classifies a GET as list', () => {
    expect(determineRateLimitType(req('GET', 'acme/forum/posts'))).toBe(
      'list'
    )
  })

  it('classifies a mutating method as mutation', () => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      expect(determineRateLimitType(req(method, 'acme/forum/posts'))).toBe(
        'mutation'
      )
    }
  })

  it('falls back to public for anything else', () => {
    expect(determineRateLimitType(req('OPTIONS', 'acme/forum/posts'))).toBe(
      'public'
    )
  })
})
