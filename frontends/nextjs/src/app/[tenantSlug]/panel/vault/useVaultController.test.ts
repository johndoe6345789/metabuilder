import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const api = vi.hoisted(() => ({
  createVaultEntry: vi.fn(),
  deleteVaultEntry: vi.fn(async () => {}),
  loadVaultEntries: vi.fn(),
  loadVaultSession: vi.fn(),
  loginVaultMaster: vi.fn(),
  logoutVaultMaster: vi.fn(async () => {}),
  updateVaultEntry: vi.fn(),
}))
const nav = vi.hoisted(() => ({
  push: vi.fn(),
  params: { slug: undefined as string[] | undefined },
}))

vi.mock('./vault-api', () => api)
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: nav.push }),
  useParams: () => nav.params,
}))

import { useVaultController } from './useVaultController'

const entry = (over: Record<string, unknown> = {}) => ({
  id: 'e1',
  slug: 'github',
  title: 'GitHub',
  username: 'alice',
  password: 'pw',
  group: 'Dev',
  notes: '',
  loginUrl: '/app/login',
  appUrl: '/app',
  updatedAt: '2020-01-01T00:00:00.000Z',
  ...over,
})

const ready = async () => {
  const hook = renderHook(() => useVaultController())
  await waitFor(() => expect(hook.result.current.authLoading).toBe(false))
  return hook
}

describe('useVaultController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    nav.params = { slug: undefined }
    api.loadVaultSession.mockResolvedValue(true)
    api.loadVaultEntries.mockResolvedValue([entry()])
    api.loginVaultMaster.mockResolvedValue(true)
    api.createVaultEntry.mockImplementation(async (p: { slug: string }) => ({
      ...entry(),
      ...p,
    }))
    api.updateVaultEntry.mockImplementation(
      async (_id: string, p: { slug: string }) => ({ ...entry(), ...p })
    )
  })

  afterEach(() => vi.unstubAllGlobals())

  describe('unlocking', () => {
    it('loads entries when the session is already open', async () => {
      const { result } = await ready()

      expect(result.current.authenticated).toBe(true)
      await waitFor(() => expect(result.current.entries).toHaveLength(1))
    })

    it('does not load entries while locked', async () => {
      api.loadVaultSession.mockResolvedValue(false)

      const { result } = await ready()

      expect(result.current.authenticated).toBe(false)
      expect(api.loadVaultEntries).not.toHaveBeenCalled()
    })

    it('stays locked when the session check throws', async () => {
      api.loadVaultSession.mockRejectedValue(new Error('down'))

      const { result } = await ready()

      expect(result.current.authenticated).toBe(false)
      expect(result.current.authLoading).toBe(false)
    })

    it('ignores an empty master password', async () => {
      api.loadVaultSession.mockResolvedValue(false)
      const { result } = await ready()

      await act(async () => {
        await result.current.events.unlock()
      })

      expect(api.loginVaultMaster).not.toHaveBeenCalled()
    })

    it('reports a wrong master password without unlocking', async () => {
      api.loadVaultSession.mockResolvedValue(false)
      api.loginVaultMaster.mockResolvedValue(false)
      const { result } = await ready()

      act(() => result.current.events.setMasterPassword('wrong'))
      await act(async () => {
        await result.current.events.unlock()
      })

      expect(result.current.authenticated).toBe(false)
      expect(result.current.notice?.kind).toBe('error')
    })

    it('clears the typed password once unlocked', async () => {
      api.loadVaultSession.mockResolvedValue(false)
      const { result } = await ready()

      act(() => result.current.events.setMasterPassword('right'))
      await act(async () => {
        await result.current.events.unlock()
      })

      // Leaving it in state would keep the secret in memory after use.
      expect(result.current.masterPassword).toBe('')
      expect(result.current.authenticated).toBe(true)
    })
  })

  describe('locking', () => {
    it('drops every entry from memory', async () => {
      const { result } = await ready()
      await waitFor(() => expect(result.current.entries).toHaveLength(1))

      await act(async () => {
        await result.current.events.lock()
      })

      expect(result.current.entries).toEqual([])
      expect(result.current.authenticated).toBe(false)
      expect(nav.push).toHaveBeenCalledWith('/vault')
    })
  })

  describe('search', () => {
    it('shows everything with an empty term', async () => {
      const { result } = await ready()
      await waitFor(() => expect(result.current.visibleEntries).toHaveLength(1))
    })

    it('matches on any field, not just the title', async () => {
      const { result } = await ready()
      await waitFor(() => expect(result.current.entries).toHaveLength(1))

      act(() => result.current.events.setSearch('alice'))

      expect(result.current.visibleEntries).toHaveLength(1)
    })

    it('is case-insensitive', async () => {
      const { result } = await ready()
      await waitFor(() => expect(result.current.entries).toHaveLength(1))

      act(() => result.current.events.setSearch('GITHUB'))

      expect(result.current.visibleEntries).toHaveLength(1)
    })

    it('hides what does not match', async () => {
      const { result } = await ready()
      await waitFor(() => expect(result.current.entries).toHaveLength(1))

      act(() => result.current.events.setSearch('nothing-matches-this'))

      expect(result.current.visibleEntries).toEqual([])
    })
  })

  describe('saving', () => {
    it.each([
      ['no title', { title: '' }],
      ['no username', { username: '' }],
      ['no password', { password: '' }],
    ])('refuses an entry with %s', async (_label, patch) => {
      nav.params = { slug: ['new'] }
      const { result } = await ready()

      act(() => {
        Object.entries({
          title: 'T',
          username: 'u',
          password: 'p',
          ...patch,
        }).forEach(([k, v]) =>
          result.current.events.updateDraft(k as never, v as string)
        )
      })
      await act(async () => {
        await result.current.events.save()
      })

      expect(api.createVaultEntry).not.toHaveBeenCalled()
      expect(result.current.notice?.kind).toBe('error')
    })

    it('creates a new entry with a normalized slug', async () => {
      nav.params = { slug: ['new'] }
      const { result } = await ready()

      act(() => {
        result.current.events.updateDraft('title', 'My New Entry')
        result.current.events.updateDraft('username', 'u')
        result.current.events.updateDraft('password', 'p')
      })
      await act(async () => {
        await result.current.events.save()
      })

      expect(api.createVaultEntry).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'my-new-entry' })
      )
    })

    it('defaults a blank group rather than saving an empty one', async () => {
      nav.params = { slug: ['new'] }
      const { result } = await ready()

      act(() => {
        result.current.events.updateDraft('title', 'T')
        result.current.events.updateDraft('username', 'u')
        result.current.events.updateDraft('password', 'p')
        result.current.events.updateDraft('group', '   ')
      })
      await act(async () => {
        await result.current.events.save()
      })

      expect(api.createVaultEntry).toHaveBeenCalledWith(
        expect.objectContaining({ group: 'General' })
      )
    })

    it('updates the existing entry rather than creating a duplicate', async () => {
      nav.params = { slug: ['github'] }
      const { result } = await ready()
      await waitFor(() => expect(result.current.entries).toHaveLength(1))

      await act(async () => {
        await result.current.events.save()
      })

      expect(api.updateVaultEntry).toHaveBeenCalledWith('e1', expect.anything())
      expect(api.createVaultEntry).not.toHaveBeenCalled()
    })

    it('reports a failed save', async () => {
      nav.params = { slug: ['github'] }
      api.updateVaultEntry.mockRejectedValue(new Error('DBAL refused'))
      const { result } = await ready()
      await waitFor(() => expect(result.current.entries).toHaveLength(1))

      await act(async () => {
        await result.current.events.save()
      })

      expect(result.current.notice).toEqual({
        kind: 'error',
        message: 'DBAL refused',
      })
    })
  })

  describe('deleting', () => {
    it('does nothing with no entry selected', async () => {
      nav.params = { slug: ['new'] }
      const { result } = await ready()

      await act(async () => {
        await result.current.events.delete()
      })

      expect(api.deleteVaultEntry).not.toHaveBeenCalled()
    })

    it('deletes the selected entry and moves on', async () => {
      nav.params = { slug: ['github'] }
      api.loadVaultEntries
        .mockResolvedValueOnce([entry()])
        .mockResolvedValueOnce([])
      const { result } = await ready()
      await waitFor(() => expect(result.current.entries).toHaveLength(1))

      await act(async () => {
        await result.current.events.delete()
      })

      expect(api.deleteVaultEntry).toHaveBeenCalledWith('e1')
      expect(nav.push).toHaveBeenCalledWith('/vault/new')
    })
  })

  describe('copying', () => {
    const withClipboard = (writeText: () => Promise<void>) => {
      vi.stubGlobal('navigator', { clipboard: { writeText } })
    }

    it('copies the password and says which field it was', async () => {
      const writeText = vi.fn(async () => {})
      withClipboard(writeText)
      nav.params = { slug: ['github'] }
      const { result } = await ready()
      await waitFor(() => expect(result.current.entries).toHaveLength(1))

      await act(async () => {
        await result.current.events.copyPassword()
      })

      expect(writeText).toHaveBeenCalledWith('pw')
      expect(result.current.notice).toEqual({
        kind: 'success',
        message: 'Password copied.',
      })
    })

    it('copies the username', async () => {
      const writeText = vi.fn(async () => {})
      withClipboard(writeText)
      nav.params = { slug: ['github'] }
      const { result } = await ready()
      await waitFor(() => expect(result.current.entries).toHaveLength(1))

      await act(async () => {
        await result.current.events.copyUsername()
      })

      expect(writeText).toHaveBeenCalledWith('alice')
    })

    it('copies a turbologin payload carrying both credentials', async () => {
      const writeText = vi.fn(async () => {})
      withClipboard(writeText)
      nav.params = { slug: ['github'] }
      const { result } = await ready()
      await waitFor(() => expect(result.current.entries).toHaveLength(1))

      await act(async () => {
        await result.current.events.copyTurbologin()
      })

      expect(JSON.parse(writeText.mock.calls[0][0] as string)).toEqual({
        user: 'alice',
        pass: 'pw',
        rememberMe: true,
        loginMethod: 'password',
      })
    })

    it('says so when the clipboard refuses', async () => {
      // Browsers deny clipboard writes without a user gesture or on http.
      withClipboard(vi.fn(async () => Promise.reject(new Error('denied'))))
      const { result } = await ready()

      await act(async () => {
        await result.current.events.copyPassword()
      })

      expect(result.current.notice?.kind).toBe('error')
    })
  })

  describe('loading entries', () => {
    it('reports a failure and shows an empty vault', async () => {
      api.loadVaultEntries.mockRejectedValue(new Error('Vault unavailable'))

      const { result } = await ready()

      await waitFor(() => expect(result.current.notice?.kind).toBe('error'))
      expect(result.current.entries).toEqual([])
    })
  })
})
