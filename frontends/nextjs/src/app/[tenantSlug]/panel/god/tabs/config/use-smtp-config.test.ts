import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const store = vi.hoisted(() => ({
  smtp: {
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
  },
  dirtySmtp: false,
  cleared: [] as string[],
}))

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => (action: { type: string; payload?: unknown }) => {
    if (action.type === 'setSmtp') {
      store.smtp = action.payload as typeof store.smtp
      store.dirtySmtp = true
    }
    if (action.type === 'clearDirty') {
      store.cleared.push(action.payload as string)
      store.dirtySmtp = false
    }
  },
  useAppSelector: (fn: (s: unknown) => unknown) =>
    fn({ god: { smtp: store.smtp, dirty: { smtp: store.dirtySmtp } } }),
}))
vi.mock('@/store/slices/god-slice', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    setSmtp: (payload: unknown) => ({ type: 'setSmtp', payload }),
    clearDirty: (payload: unknown) => ({ type: 'clearDirty', payload }),
  }
})

import { useSmtpConfig } from './use-smtp-config'

const stub = (ok: boolean): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok }) as Response)
  )
}

beforeEach(() => {
  store.smtp = {
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
  }
  store.dirtySmtp = false
  store.cleared = []
})
afterEach(() => vi.unstubAllGlobals())

describe('set', () => {
  it('updates one field and marks the config dirty', () => {
    const { result } = renderHook(() => useSmtpConfig())
    act(() => {
      result.current.set('host', 'smtp.example.com')
    })
    expect(store.smtp.host).toBe('smtp.example.com')
    expect(store.dirtySmtp).toBe(true)
  })

  it('keeps the other fields untouched', () => {
    store.smtp.username = 'existing'
    const { result } = renderHook(() => useSmtpConfig())
    act(() => {
      result.current.set('host', 'smtp.example.com')
    })
    expect(store.smtp.username).toBe('existing')
  })
})

describe('publish', () => {
  it('posts to the tenant\'s SmtpConfig collection', async () => {
    stub(true)
    const { result } = renderHook(() => useSmtpConfig())
    let ok = false
    await act(async () => {
      ok = await result.current.publish('acme')
    })
    expect(ok).toBe(true)
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/acme/core/SmtpConfig')
  })

  it('clears the dirty flag on success', async () => {
    stub(true)
    store.dirtySmtp = true
    const { result } = renderHook(() => useSmtpConfig())
    await act(async () => {
      await result.current.publish()
    })
    expect(store.cleared).toEqual(['smtp'])
  })

  it('defaults to the system tenant', async () => {
    stub(true)
    const { result } = renderHook(() => useSmtpConfig())
    await act(async () => {
      await result.current.publish()
    })
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/system/core/SmtpConfig')
  })

  it('reports failure and leaves dirty alone when the write is refused', async () => {
    stub(false)
    store.dirtySmtp = true
    const { result } = renderHook(() => useSmtpConfig())
    let ok = true
    await act(async () => {
      ok = await result.current.publish()
    })
    expect(ok).toBe(false)
    expect(store.cleared).toEqual([])
  })

  it('reports failure rather than throwing when unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('offline')
    }))
    const { result } = renderHook(() => useSmtpConfig())
    let ok = true
    await act(async () => {
      ok = await result.current.publish()
    })
    expect(ok).toBe(false)
  })

  it('is not publishing once it settles', async () => {
    stub(true)
    const { result } = renderHook(() => useSmtpConfig())
    await act(async () => {
      await result.current.publish()
    })
    expect(result.current.publishing).toBe(false)
  })

  // Never sent in the clear: the password crosses to the data layer, but
  // this test is what would fail if the field were ever silently dropped.
  it('includes the password in the published payload', async () => {
    stub(true)
    store.smtp.password = 'hunter2'
    const { result } = renderHook(() => useSmtpConfig())
    await act(async () => {
      await result.current.publish()
    })
    const body = vi.mocked(fetch).mock.calls[0]?.[1]?.body as string
    expect(JSON.parse(body).password).toBe('hunter2')
  })
})
