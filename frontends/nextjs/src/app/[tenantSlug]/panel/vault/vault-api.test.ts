import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createVaultEntry,
  deleteVaultEntry,
  loadVaultEntries,
  loadVaultSession,
  loginVaultMaster,
  logoutVaultMaster,
  updateVaultEntry,
} from './vault-api'

const draft = {
  slug: 's',
  title: 't',
  username: 'u',
  password: 'p',
  group: 'G',
  notes: '',
  loginUrl: '/app/login',
  appUrl: '/app',
}

function mockFetch(body: unknown, ok = true, status = 200) {
  const calls: {
    url: string
    method: string
    credentials?: string
    body?: string
  }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({
        url: String(url),
        method: init?.method ?? 'GET',
        credentials: init?.credentials,
        body: init?.body as string | undefined,
      })
      return {
        ok,
        status,
        json: async () => {
          if (body === 'INVALID') throw new SyntaxError('not json')
          return body
        },
      } as Response
    })
  )
  return calls
}

describe('vault-api', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllGlobals())

  describe('every call', () => {
    it('sends the session cookie', async () => {
      // The vault session lives in an httpOnly cookie; without credentials
      // every request is anonymous and the vault appears permanently locked.
      const calls = mockFetch({ entries: [] })

      await loadVaultEntries()

      expect(calls[0].credentials).toBe('include')
    })
  })

  describe('loadVaultEntries', () => {
    it('returns the entries', async () => {
      mockFetch({ entries: [{ id: 'e1' }] })

      expect(await loadVaultEntries()).toEqual([{ id: 'e1' }])
    })

    it('returns an empty list when the payload has none', async () => {
      mockFetch({})

      expect(await loadVaultEntries()).toEqual([])
    })

    it('returns an empty list when entries is not an array', async () => {
      mockFetch({ entries: 'nope' })

      expect(await loadVaultEntries()).toEqual([])
    })

    it('throws the server message on failure', async () => {
      mockFetch({ error: 'Vault is locked' }, false, 403)

      await expect(loadVaultEntries()).rejects.toThrow('Vault is locked')
    })

    it('falls back to the status when there is no message', async () => {
      mockFetch({}, false, 503)

      await expect(loadVaultEntries()).rejects.toThrow('503')
    })

    it('survives a body that is not JSON', async () => {
      mockFetch('INVALID', false, 500)

      await expect(loadVaultEntries()).rejects.toThrow('500')
    })
  })

  describe('createVaultEntry', () => {
    it('posts the draft and returns the saved entry', async () => {
      const calls = mockFetch({ entry: { id: 'e1' } })

      expect(await createVaultEntry(draft as never)).toEqual({ id: 'e1' })
      expect(calls[0].method).toBe('POST')
      expect(JSON.parse(calls[0].body ?? '{}')).toEqual(draft)
    })

    it('throws when the server returns no entry', async () => {
      // Silently returning undefined would show a blank editor as "saved".
      mockFetch({})

      await expect(createVaultEntry(draft as never)).rejects.toThrow(
        'no entry'
      )
    })

    it('throws the server message on failure', async () => {
      mockFetch({ error: 'Slug already exists' }, false, 409)

      await expect(createVaultEntry(draft as never)).rejects.toThrow(
        'Slug already exists'
      )
    })
  })

  describe('updateVaultEntry', () => {
    it('puts to the entry url', async () => {
      const calls = mockFetch({ entry: { id: 'e1' } })

      await updateVaultEntry('e1', draft as never)

      expect(calls[0].method).toBe('PUT')
      expect(calls[0].url).toMatch(/\/logins\/e1$/)
    })

    it('throws when the server returns no entry', async () => {
      mockFetch({})

      await expect(updateVaultEntry('e1', draft as never)).rejects.toThrow(
        'no entry'
      )
    })
  })

  describe('deleteVaultEntry', () => {
    it('deletes the entry url', async () => {
      const calls = mockFetch({})

      await deleteVaultEntry('e1')

      expect(calls[0].method).toBe('DELETE')
      expect(calls[0].url).toMatch(/\/logins\/e1$/)
    })

    it('throws on failure rather than reporting a silent success', async () => {
      mockFetch({ error: 'Not found' }, false, 404)

      await expect(deleteVaultEntry('e1')).rejects.toThrow('Not found')
    })
  })

  describe('loadVaultSession', () => {
    it('is true only when the server says authenticated', async () => {
      mockFetch({ authenticated: true })
      expect(await loadVaultSession()).toBe(true)
    })

    it('is false when the server says not authenticated', async () => {
      mockFetch({ authenticated: false })
      expect(await loadVaultSession()).toBe(false)
    })

    it('is false for a non-ok response rather than throwing', async () => {
      mockFetch({}, false, 401)
      expect(await loadVaultSession()).toBe(false)
    })

    it('is false for a body it cannot read', async () => {
      mockFetch('INVALID')
      expect(await loadVaultSession()).toBe(false)
    })

    it('is false for a missing flag, not truthy-by-default', async () => {
      mockFetch({})
      expect(await loadVaultSession()).toBe(false)
    })
  })

  describe('loginVaultMaster', () => {
    it('posts the password and reports the result', async () => {
      const calls = mockFetch({ authenticated: true })

      expect(await loginVaultMaster('secret')).toBe(true)
      expect(JSON.parse(calls[0].body ?? '{}')).toEqual({ password: 'secret' })
    })

    it('reports false for a wrong password the server accepted as a request', async () => {
      mockFetch({ authenticated: false })

      expect(await loginVaultMaster('wrong')).toBe(false)
    })

    it('throws the server message on a rejected request', async () => {
      mockFetch({ error: 'Too many attempts' }, false, 429)

      await expect(loginVaultMaster('x')).rejects.toThrow('Too many attempts')
    })
  })

  describe('logoutVaultMaster', () => {
    it('deletes the session', async () => {
      const calls = mockFetch({})

      await logoutVaultMaster()

      expect(calls[0].method).toBe('DELETE')
    })

    it('does not throw when the server refuses', async () => {
      // Locking the UI must succeed even if the server call does not.
      mockFetch({}, false, 500)

      await expect(logoutVaultMaster()).resolves.toBeUndefined()
    })
  })
})
