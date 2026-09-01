import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useRetroSession } from './useRetroSession'

function mockFetch(
  impl: (url: string, init?: RequestInit) => Promise<Response>
) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

const SESSION = {
  id: 's1',
  system: 'nes' as const,
  romPath: '/roms/mario.nes',
  streamUrl: 'http://x/stream/s1',
  startedAt: '2026-01-01T00:00:00Z',
}

describe('useRetroSession', () => {
  it('starts with no session and not loading', () => {
    const { result } = renderHook(() => useRetroSession())
    expect(result.current.session).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('start() creates a session on success', async () => {
    mockFetch(async () => ({ ok: true, json: async () => SESSION }) as Response)
    const { result } = renderHook(() => useRetroSession())

    await act(async () => {
      await result.current.start('nes', '/roms/mario.nes')
    })

    expect(result.current.session).toEqual(SESSION)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('start() reports the HTTP status on a non-ok response', async () => {
    mockFetch(async () => ({ ok: false, status: 503 }) as Response)
    const { result } = renderHook(() => useRetroSession())

    await act(async () => {
      await result.current.start('nes', '/roms/mario.nes')
    })

    expect(result.current.session).toBeNull()
    expect(result.current.error).toBe('HTTP 503')
  })

  it('start() reports a generic error for a non-Error rejection', async () => {
    class NotAnError {}
    mockFetch(() => Promise.reject(new NotAnError()) as Promise<Response>)
    const { result } = renderHook(() => useRetroSession())

    await act(async () => {
      await result.current.start('nes', '/roms/mario.nes')
    })

    expect(result.current.error).toBe('Failed to start session')
  })

  it('is loading while start() is in flight', async () => {
    let resolve: (r: Response) => void = () => undefined
    mockFetch(
      () =>
        new Promise<Response>(r => {
          resolve = r
        })
    )
    const { result } = renderHook(() => useRetroSession())

    let started: Promise<void> = Promise.resolve()
    act(() => {
      started = result.current.start('nes', '/roms/mario.nes')
    })
    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolve({ ok: true, json: async () => SESSION } as Response)
      await started
    })
    expect(result.current.loading).toBe(false)
  })

  it('stop() does nothing without an active session', async () => {
    const fetchFn = vi.fn()
    mockFetch(fetchFn)
    const { result } = renderHook(() => useRetroSession())

    await act(async () => {
      await result.current.stop()
    })

    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('stop() deletes the session and clears state', async () => {
    mockFetch(async () => ({ ok: true, json: async () => SESSION }) as Response)
    const { result } = renderHook(() => useRetroSession())
    await act(async () => {
      await result.current.start('nes', '/roms/mario.nes')
    })

    const del = vi.fn(async () => ({ ok: true }) as Response)
    mockFetch(del)
    await act(async () => {
      await result.current.stop()
    })

    expect(del).toHaveBeenCalledWith(
      expect.stringContaining('/sessions/s1'),
      expect.objectContaining({ method: 'DELETE' })
    )
    expect(result.current.session).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('stop() still clears state even if the DELETE request throws', async () => {
    mockFetch(async () => ({ ok: true, json: async () => SESSION }) as Response)
    const { result } = renderHook(() => useRetroSession())
    await act(async () => {
      await result.current.start('nes', '/roms/mario.nes')
    })

    mockFetch(async () => {
      throw new Error('offline')
    })
    await act(async () => {
      await result.current.stop()
    })

    expect(result.current.session).toBeNull()
  })

  it('sendInput does nothing without an active session', async () => {
    const fetchFn = vi.fn()
    mockFetch(fetchFn)
    const { result } = renderHook(() => useRetroSession())

    await act(async () => {
      await result.current.sendInput('A', true)
    })

    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('sendInput posts the button state for the active session', async () => {
    mockFetch(async () => ({ ok: true, json: async () => SESSION }) as Response)
    const { result } = renderHook(() => useRetroSession())
    await act(async () => {
      await result.current.start('nes', '/roms/mario.nes')
    })

    const input = vi.fn(async () => ({ ok: true }) as Response)
    mockFetch(input)
    await act(async () => {
      await result.current.sendInput('A', true)
    })

    expect(input).toHaveBeenCalledWith(
      expect.stringContaining('/sessions/s1/input'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ button: 'A', pressed: true }),
      })
    )
  })

  it('waits for the ready state before asserting on it (waitFor smoke check)', async () => {
    mockFetch(async () => ({ ok: true, json: async () => SESSION }) as Response)
    const { result } = renderHook(() => useRetroSession())

    await act(async () => {
      await result.current.start('nes', '/roms/mario.nes')
    })

    await waitFor(() => expect(result.current.session).not.toBeNull())
  })
})
