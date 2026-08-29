import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const api = vi.hoisted(() => ({
  fetchAccounts: vi.fn(),
  setCredential: vi.fn(),
}))
vi.mock('./credentials-api', () => api)

import { useCredentials } from './use-credentials'

const accounts = [
  { username: 'alice', role: 'user', tenantId: 'acme' },
  { username: 'bob', role: 'user', tenantId: 'other' },
]

const god = { username: 'g', role: 'god', tenantId: 'acme' }
const supergod = { username: 'sg', role: 'supergod', tenantId: 'acme' }

const ready = async (viewer: typeof god) => {
  const rendered = renderHook(() => useCredentials(viewer))
  await waitFor(() => {
    expect(rendered.result.current.loading).toBe(false)
  })
  return rendered
}

beforeEach(() => {
  vi.clearAllMocks()
  api.fetchAccounts.mockResolvedValue({ accounts, tenants: [] })
  api.setCredential.mockResolvedValue(undefined)
})

describe('scope', () => {
  it('starts a supergod across all tenants', async () => {
    const { result } = await ready(supergod)
    expect(result.current.appliedScope).toBe('all')
    expect(result.current.viewer.isSupergod).toBe(true)
  })

  it('starts a god inside their own tenant', async () => {
    const { result } = await ready(god)
    expect(result.current.appliedScope).toBe('acme')
    expect(result.current.viewer.isSupergod).toBe(false)
  })

  // The selector is not rendered for a god, but the rule holds anyway.
  it('ignores a god\'s attempt to widen the scope', async () => {
    const { result } = await ready(god)
    act(() => {
      result.current.setScope('all')
    })
    expect(result.current.appliedScope).toBe('acme')
  })

  it('follows a supergod\'s choice', async () => {
    const { result } = await ready(supergod)
    act(() => {
      result.current.setScope('other')
    })
    await waitFor(() => {
      expect(result.current.appliedScope).toBe('other')
    })
  })

  it('reloads when the scope changes', async () => {
    const { result } = await ready(supergod)
    act(() => {
      result.current.setScope('other')
    })
    await waitFor(() => {
      expect(api.fetchAccounts).toHaveBeenCalledWith('other', true)
    })
  })

  it('shows only the accounts in scope', async () => {
    const { result } = await ready(god)
    expect(result.current.accounts.map(a => a.username)).toEqual(['alice'])
  })
})

describe('loading', () => {
  // An unreachable data layer is not an empty tenancy; this screen must
  // never imply that nobody has an account.
  it('says so rather than showing an empty tenancy', async () => {
    api.fetchAccounts.mockRejectedValue(new Error('403'))
    const { result } = await ready(god)
    expect(result.current.accounts).toEqual([])
    expect(result.current.notice?.kind).toBe('error')
    expect(result.current.notice?.message).toContain('could not be loaded')
  })
})

describe('setting a password', () => {
  const fill = (
    result: { current: ReturnType<typeof useCredentials> },
    username: string,
    password: string
  ) => {
    act(() => {
      result.current.setUsername(username)
      result.current.setPassword(password)
    })
  }

  it('writes the credential into the viewer\'s own tenant', async () => {
    const { result } = await ready(god)
    fill(result, 'newuser', 'longenough')
    await act(async () => {
      await result.current.save()
    })
    expect(api.setCredential).toHaveBeenCalledWith(
      'newuser',
      'longenough',
      'acme'
    )
  })

  // A god's write target is pinned the same way their view is.
  it('ignores a god\'s chosen target tenant', async () => {
    const { result } = await ready(god)
    act(() => {
      result.current.setCreateTenant('other')
    })
    fill(result, 'newuser', 'longenough')
    await act(async () => {
      await result.current.save()
    })
    expect(api.setCredential).toHaveBeenCalledWith(
      'newuser',
      'longenough',
      'acme'
    )
  })

  it('lets a supergod write into another tenant', async () => {
    const { result } = await ready(supergod)
    act(() => {
      result.current.setCreateTenant('other')
    })
    fill(result, 'newuser', 'longenough')
    await act(async () => {
      await result.current.save()
    })
    expect(api.setCredential).toHaveBeenCalledWith(
      'newuser',
      'longenough',
      'other'
    )
  })

  it.each([
    ['ab', 'longenough'],
    ['newuser', 'short'],
    ['', ''],
  ])('refuses %p / %p before any write', async (username, password) => {
    const { result } = await ready(god)
    fill(result, username, password)
    await act(async () => {
      expect(await result.current.save()).toBe(false)
    })
    expect(api.setCredential).not.toHaveBeenCalled()
    expect(result.current.notice?.kind).toBe('error')
  })

  it('clears the form and reloads on success', async () => {
    const { result } = await ready(god)
    fill(result, 'newuser', 'longenough')
    await act(async () => {
      expect(await result.current.save()).toBe(true)
    })
    expect(result.current.username).toBe('')
    expect(result.current.password).toBe('')
    expect(result.current.notice?.kind).toBe('success')
    expect(api.fetchAccounts).toHaveBeenCalledTimes(2)
  })

  it('keeps the form and reports the reason on refusal', async () => {
    api.setCredential.mockRejectedValue(new Error('not your tenant'))
    const { result } = await ready(god)
    fill(result, 'newuser', 'longenough')
    await act(async () => {
      expect(await result.current.save()).toBe(false)
    })
    expect(result.current.username).toBe('newuser')
    expect(result.current.notice?.message).toBe('not your tenant')
  })

  it('is no longer saving once it settles', async () => {
    const { result } = await ready(god)
    fill(result, 'newuser', 'longenough')
    await act(async () => {
      await result.current.save()
    })
    expect(result.current.saving).toBe(false)
  })
})

describe('picking an account', () => {
  it('fills the username and its tenant, and clears the password', async () => {
    const { result } = await ready(supergod)
    act(() => {
      result.current.setPassword('typed')
    })
    act(() => {
      result.current.pick({ username: 'bob', tenantId: 'other' })
    })
    expect(result.current.username).toBe('bob')
    expect(result.current.createTenant).toBe('other')
    expect(result.current.password).toBe('')
  })

  it('treats an account with no tenant as system', async () => {
    const { result } = await ready(supergod)
    act(() => {
      result.current.pick({ username: 'sys', tenantId: null })
    })
    expect(result.current.createTenant).toBe('system')
  })
})
