import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useServerStatus } from './useServerStatus'
import type { StatusResponse } from '../status'

function makeFetchResponse(data: StatusResponse): Response {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response
}

const mockStatusResponse: StatusResponse = {
  updatedAt: '2026-01-01T00:00:00.000Z',
  statuses: [
    { name: 'DBAL Daemon', status: 'online', message: 'All good', latencyMs: 5 },
  ],
}

describe('useServerStatus', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('starts with loading=true, empty health, no error', () => {
      // fetch never resolves, so we stay in loading state
      vi.spyOn(global, 'fetch').mockReturnValue(new Promise(() => {}))
      const { result } = renderHook(() => useServerStatus())
      expect(result.current.loading).toBe(true)
      expect(result.current.health).toEqual([])
      expect(result.current.error).toBeNull()
    })
  })

  describe('after successful fetch', () => {
    it('populates health and sets loading=false', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(makeFetchResponse(mockStatusResponse))
      const { result } = renderHook(() => useServerStatus())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.health).toEqual(mockStatusResponse.statuses)
      expect(result.current.error).toBeNull()
      expect(result.current.lastUpdated).toBe('2026-01-01T00:00:00.000Z')
    })
  })

  describe('summary computation', () => {
    it('shows "All systems nominal" when all online', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(makeFetchResponse(mockStatusResponse))
      const { result } = renderHook(() => useServerStatus())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.summary).toBe('All systems nominal')
    })

    it('shows "Some systems need attention" when any non-online', async () => {
      const degraded: StatusResponse = {
        updatedAt: '2026-01-01T00:00:00.000Z',
        statuses: [
          { name: 'DBAL Daemon', status: 'degraded', message: 'Slow' },
        ],
      }
      vi.spyOn(global, 'fetch').mockResolvedValue(makeFetchResponse(degraded))
      const { result } = renderHook(() => useServerStatus())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.summary).toBe('Some systems need attention')
    })

    it('shows "Initializing status feed..." when health is empty and no error', () => {
      vi.spyOn(global, 'fetch').mockReturnValue(new Promise(() => {}))
      const { result } = renderHook(() => useServerStatus())
      expect(result.current.summary).toBe('Initializing status feed...')
    })

    it('shows "Status unavailable right now" on error', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network down'))
      const { result } = renderHook(() => useServerStatus())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.summary).toBe('Status unavailable right now')
    })
  })

  describe('error handling', () => {
    it('sets error message on fetch failure', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Connection refused'))
      const { result } = renderHook(() => useServerStatus())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.error).toBe('Connection refused')
    })

    it('sets error when response is not ok', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        json: vi.fn(),
      } as unknown as Response)
      const { result } = renderHook(() => useServerStatus())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.error).toBeTruthy()
    })

    it('handles generic unknown error (non-Error thrown)', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValue('string error')
      const { result } = renderHook(() => useServerStatus())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.error).toBe('Unable to load status')
    })
  })

  describe('cleanup', () => {
    it('does not update state after unmount (cancelled flag)', async () => {
      let resolveFirst!: (v: Response) => void
      // First call hangs until we resolve it
      vi.spyOn(global, 'fetch')
        .mockReturnValueOnce(new Promise(r => { resolveFirst = r }))
        .mockResolvedValue(makeFetchResponse(mockStatusResponse))

      const { result, unmount } = renderHook(() => useServerStatus())
      unmount()
      // Resolve after unmount — should not cause state update or errors
      resolveFirst(makeFetchResponse(mockStatusResponse))
      // Give microtasks a chance to run
      await new Promise(r => setTimeout(r, 0))
      // Result state is unchanged (still initial values)
      expect(result.current.health).toEqual([])
    })
  })
})
