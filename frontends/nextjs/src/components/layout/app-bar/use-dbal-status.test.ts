import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDbalStatus } from './use-dbal-status'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useDbalStatus', () => {
  it('reports checking before the health request resolves', () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useDbalStatus(false))
    expect(result.current).toBe('checking')
  })

  it('reports online once the health check succeeds', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(() => useDbalStatus(false))
    await waitFor(() => expect(result.current).toBe('online'))
  })

  it('reports offline when the health check responds not-ok', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)
    const { result } = renderHook(() => useDbalStatus(true))
    await waitFor(() => expect(result.current).toBe('offline'))
  })

  it('reports offline rather than throwing when fetch rejects', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))
    const { result } = renderHook(() => useDbalStatus(true))
    await waitFor(() => expect(result.current).toBe('offline'))
  })
})
