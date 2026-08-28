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
