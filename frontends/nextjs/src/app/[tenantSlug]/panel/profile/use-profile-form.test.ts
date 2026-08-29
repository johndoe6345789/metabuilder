import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useProfileForm } from './use-profile-form'

interface Call {
  url: string
  method?: string
  body?: string
  credentials?: string
}

const stub = (ok: boolean): Call[] => {
  const calls: Call[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({
        url: String(url),
        method: init?.method,
        body: init?.body as string | undefined,
        credentials: init?.credentials,
      })
      return { ok } as Response
    })
  )
  return calls
}

const options = { userId: 'u1', email: 'a@b.c', bio: 'hello' }

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe('useProfileForm', () => {
  it('starts read-only, seeded from the user', () => {
    const { result } = renderHook(() => useProfileForm(options))
    expect(result.current.editing).toBe(false)
    expect(result.current.email).toBe('a@b.c')
    expect(result.current.bio).toBe('hello')
    expect(result.current.status).toBe('idle')
  })

  it('clears any previous outcome when editing starts', async () => {
    stub(false)
    const { result } = renderHook(() => useProfileForm(options))
    await act(async () => {
      await result.current.save()
    })
    expect(result.current.status).toBe('error')
    act(() => {
      result.current.startEditing()
    })
    expect(result.current.editing).toBe(true)
    expect(result.current.status).toBe('idle')
  })

  it('restores the original values on cancel', () => {
    const { result } = renderHook(() => useProfileForm(options))
    act(() => {
      result.current.startEditing()
      result.current.setEmail('changed@b.c')
      result.current.setBio('changed')
    })
    act(() => {
      result.current.cancel()
    })
    expect(result.current.email).toBe('a@b.c')
    expect(result.current.bio).toBe('hello')
    expect(result.current.editing).toBe(false)
  })

  it('writes the edited values to the user\'s own row', async () => {
    const calls = stub(true)
    const { result } = renderHook(() => useProfileForm(options))
    act(() => {
      result.current.setEmail('new@b.c')
    })
    await act(async () => {
      await result.current.save()
    })
    expect(calls[0]?.method).toBe('PUT')
    expect(calls[0]?.url).toMatch(/\/system\/core\/User\/u1$/)
    expect(calls[0]?.credentials).toBe('include')
    expect(JSON.parse(calls[0]?.body ?? '{}')).toEqual({
      email: 'new@b.c',
      bio: 'hello',
    })
  })

  it('leaves editing on a successful save', async () => {
    stub(true)
    const { result } = renderHook(() => useProfileForm(options))
    act(() => {
      result.current.startEditing()
    })
    await act(async () => {
      await result.current.save()
    })
    expect(result.current.status).toBe('success')
    expect(result.current.editing).toBe(false)
  })

  // A refused save must keep the form open, or the reader loses the text
  // they typed with no idea it never landed.
  it('stays in editing when the save is refused', async () => {
    stub(false)
    const { result } = renderHook(() => useProfileForm(options))
    act(() => {
      result.current.startEditing()
    })
    await act(async () => {
      await result.current.save()
    })
    expect(result.current.status).toBe('error')
    expect(result.current.editing).toBe(true)
  })

  it('reports an error rather than throwing when offline', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('offline')
    }))
    const { result } = renderHook(() => useProfileForm(options))
    await act(async () => {
      await result.current.save()
    })
    expect(result.current.status).toBe('error')
  })

  it('writes nothing at all when there is no signed-in user', async () => {
    const calls = stub(true)
    const { result } = renderHook(() =>
      useProfileForm({ ...options, userId: null })
    )
    await act(async () => {
      await result.current.save()
    })
    expect(calls).toHaveLength(0)
    expect(result.current.status).toBe('idle')
  })
})
