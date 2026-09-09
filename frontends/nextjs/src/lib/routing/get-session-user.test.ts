import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchSession = vi.fn()

vi.mock('@/lib/auth/api/fetch-session', () => ({ fetchSession }))

import { getSessionUser } from './index'

const request = (auth?: string) =>
  new Request('http://localhost/x', {
    headers: auth === undefined ? {} : { authorization: auth },
  })

describe('getSessionUser', () => {
  beforeEach(() => {
    fetchSession.mockReset()
    fetchSession.mockResolvedValue(null)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('reading the token', () => {
    it('passes the bearer token through to be verified', async () => {
      await getSessionUser(request('Bearer abc123'))
      expect(fetchSession).toHaveBeenCalledWith('abc123')
    })

    it('passes null when there is no authorization header', async () => {
      await getSessionUser(request())
      expect(fetchSession).toHaveBeenCalledWith(null)
    })

    it('passes null when the scheme is not Bearer', async () => {
      // A Basic credential must not be handed to a bearer verifier.
      await getSessionUser(request('Basic dXNlcjpwYXNz'))
      expect(fetchSession).toHaveBeenCalledWith(null)
    })

    it('is case-sensitive about the Bearer scheme', async () => {
      await getSessionUser(request('bearer abc'))
      expect(fetchSession).toHaveBeenCalledWith(null)
    })

    it('copes with no request at all', async () => {
      await getSessionUser()
      expect(fetchSession).toHaveBeenCalledWith(null)
    })
  })

  describe('the returned user', () => {
    it('is null when the token does not vouch for anyone', async () => {
      fetchSession.mockResolvedValue(null)
      await expect(getSessionUser(request())).resolves.toEqual({ user: null })
    })

    it('carries the verified fields through', async () => {
      fetchSession.mockResolvedValue({ id: 'u1', role: 'admin' })

      const { user } = await getSessionUser(request('Bearer t'))

      expect(user).toMatchObject({ id: 'u1', role: 'admin' })
    })

    it('fills the optional fields rather than leaving them undefined', async () => {
      fetchSession.mockResolvedValue({ id: 'u1' })

      const { user } = await getSessionUser(request('Bearer t'))

      expect(user).toMatchObject({
        tenantId: null,
        profilePicture: null,
        bio: null,
        isInstanceOwner: false,
      })
    })

    it('does not overwrite fields the session already set', async () => {
      fetchSession.mockResolvedValue({
        id: 'u1',
        tenantId: 't1',
        isInstanceOwner: true,
      })

      const { user } = await getSessionUser(request('Bearer t'))

      expect(user).toMatchObject({ tenantId: 't1', isInstanceOwner: true })
    })
  })

  describe('when verification throws', () => {
    it('answers no user rather than propagating', async () => {
      fetchSession.mockRejectedValue(new Error('DBAL down'))

      await expect(getSessionUser(request('Bearer t'))).resolves.toEqual({
        user: null,
      })
    })

    it('does not turn a failure into an authenticated session', async () => {
      fetchSession.mockRejectedValue(new Error('boom'))

      const { user } = await getSessionUser(request('Bearer t'))

      expect(user).toBeNull()
    })
  })
})

/**
 * This route family is reached two ways, and only one of them was
 * understood. `entityApiFetch` forwards the incoming session cookie
 * precisely so a Server Component can call the app's own API as the
 * visitor -- its comment says so -- and this read the Authorization
 * header alone, so every entity list, detail and edit page rendered
 * "Error loading data: Authentication required" for a signed-in founder.
 * Confirmed in a browser at /{tenant}/core/User.
 */
describe('the session cookie the rest of the app uses', () => {
  const withCookie = (cookie: string) =>
    new Request('http://localhost/x', { headers: { cookie } })

  it('verifies the token from the mb_session cookie', async () => {
    await getSessionUser(withCookie('mb_session=abc123'))
    expect(fetchSession).toHaveBeenCalledWith('abc123')
  })

  it('finds it among other cookies, whatever the spacing', async () => {
    await getSessionUser(withCookie('theme=dark;mb_session=abc123; a=b'))
    expect(fetchSession).toHaveBeenCalledWith('abc123')
  })

  it('prefers an explicit bearer token over the cookie', async () => {
    const req = new Request('http://localhost/x', {
      headers: { authorization: 'Bearer header-token', cookie: 'mb_session=c' },
    })
    await getSessionUser(req)
    expect(fetchSession).toHaveBeenCalledWith('header-token')
  })

  it.each([
    ['no cookie header', ''],
    ['other cookies only', 'theme=dark; a=b'],
    ['an empty session cookie', 'mb_session=; a=b'],
    ['a lookalike name', 'not_mb_session=abc'],
  ])('passes null for %s', async (_case, cookie) => {
    await getSessionUser(withCookie(cookie))
    expect(fetchSession).toHaveBeenCalledWith(null)
  })

  it('decodes a percent-encoded value', async () => {
    await getSessionUser(withCookie('mb_session=a%2Bb'))
    expect(fetchSession).toHaveBeenCalledWith('a+b')
  })
})
