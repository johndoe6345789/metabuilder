import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQueryExecutor } from './useQueryExecutor'
import type { QueryHistoryEntry, QueryResponse } from '../types'

function makeFetchResponse(data: Partial<QueryResponse>): Response {
  return {
    json: vi.fn().mockResolvedValue(data),
    ok: true,
  } as unknown as Response
}

describe('useQueryExecutor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Ensure crypto.randomUUID is available
    if (!global.crypto) {
      Object.defineProperty(global, 'crypto', {
        value: { randomUUID: () => 'test-uuid' },
      })
    }
  })

  describe('initial state', () => {
    it('starts with loading=false and response=null', () => {
      const { result } = renderHook(() => useQueryExecutor('token'))
      expect(result.current.loading).toBe(false)
      expect(result.current.response).toBeNull()
    })
  })

  describe('executeQuery', () => {
    it('sets loading during execution and clears after', async () => {
      let resolvePromise!: (val: unknown) => void
      const fetchPromise = new Promise(r => { resolvePromise = r })
      vi.spyOn(global, 'fetch').mockReturnValueOnce(
        fetchPromise as Promise<Response>
      )

      const { result } = renderHook(() => useQueryExecutor('token'))
      const onEntry = vi.fn()

      const execPromise = act(async () => {
        await result.current.executeQuery('GET', '/test', undefined, onEntry)
      })

      // Resolve the fetch
      resolvePromise(makeFetchResponse({
        status: 200,
        statusText: 'OK',
        url: '/test',
        timestamp: '2026-01-01T00:00:00.000Z',
        data: {},
      }))
      await execPromise

      expect(result.current.loading).toBe(false)
    })

    it('sets response data after successful fetch', async () => {
      const responseData: QueryResponse = {
        status: 200,
        statusText: 'OK',
        data: { items: [] },
        url: '/test',
        timestamp: '2026-01-01T00:00:00.000Z',
      }
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(makeFetchResponse(responseData))

      const { result } = renderHook(() => useQueryExecutor('token'))
      const onEntry = vi.fn()

      await act(async () => {
        await result.current.executeQuery('GET', '/test', undefined, onEntry)
      })

      expect(result.current.response).toEqual(responseData)
    })

    it('calls onEntry with correct history entry', async () => {
      const responseData: QueryResponse = {
        status: 201,
        statusText: 'Created',
        data: {},
        url: '/test',
        timestamp: '2026-01-01T00:00:00.000Z',
      }
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(makeFetchResponse(responseData))

      const { result } = renderHook(() => useQueryExecutor('token'))
      const onEntry = vi.fn()
      const body = { name: 'Test' }

      await act(async () => {
        await result.current.executeQuery('POST', '/pastebin/pastebin/Snippet', body, onEntry, 'dbal create Snippet')
      })

      expect(onEntry).toHaveBeenCalledTimes(1)
      const entry: QueryHistoryEntry = onEntry.mock.calls[0][0]
      expect(entry.method).toBe('POST')
      expect(entry.path).toBe('/pastebin/pastebin/Snippet')
      expect(entry.status).toBe(201)
      expect(entry.body).toEqual(body)
      expect(entry.cli).toBe('dbal create Snippet')
    })

    it('sets error response on fetch failure', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useQueryExecutor('token'))
      const onEntry = vi.fn()

      await act(async () => {
        await result.current.executeQuery('GET', '/test', undefined, onEntry)
      })

      expect(result.current.response?.status).toBe(0)
      expect(result.current.response?.statusText).toBe('Fetch Error')
      expect((result.current.response?.data as { error: string }).error).toBe('Network error')
      expect(result.current.loading).toBe(false)
      // onEntry is NOT called on error
      expect(onEntry).not.toHaveBeenCalled()
    })

    it('sends the token as a Bearer Authorization header, not in the body', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        makeFetchResponse({ status: 200, statusText: 'OK', url: '/test', timestamp: '', data: {} })
      )

      const { result } = renderHook(() => useQueryExecutor('my-auth-token'))

      await act(async () => {
        await result.current.executeQuery('GET', '/test', undefined, vi.fn())
      })

      const [, opts] = fetchSpy.mock.calls[0]
      const headers = new Headers(opts?.headers)
      expect(headers.get('Authorization')).toBe('Bearer my-auth-token')
      const body = JSON.parse(opts?.body as string)
      expect(body.token).toBeUndefined()
    })
  })

  describe('executeCli', () => {
    it('does nothing for empty command', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      const { result } = renderHook(() => useQueryExecutor('token'))
      const onEntry = vi.fn()

      await act(async () => {
        await result.current.executeCli('   ', 'token', onEntry)
      })

      expect(fetchSpy).not.toHaveBeenCalled()
      expect(onEntry).not.toHaveBeenCalled()
    })

    it('calls the CLI endpoint with the command in the body and token as a Bearer header', async () => {
      const cliResponse = {
        status: 200,
        statusText: 'OK',
        data: [],
        url: '/dbal/api/cli',
        timestamp: '2026-01-01T00:00:00.000Z',
        command: 'dbal list Snippet',
      }
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(makeFetchResponse(cliResponse))
      const { result } = renderHook(() => useQueryExecutor('token'))
      const onEntry = vi.fn()

      await act(async () => {
        await result.current.executeCli('dbal list Snippet', 'my-token', onEntry)
      })

      const [url, opts] = fetchSpy.mock.calls[0]
      expect(url).toContain('/api/cli')
      const headers = new Headers(opts?.headers)
      expect(headers.get('Authorization')).toBe('Bearer my-token')
      const body = JSON.parse(opts?.body as string)
      expect(body.command).toBe('dbal list Snippet')
      expect(body.token).toBeUndefined()
    })

    it('calls onEntry after CLI execution', async () => {
      const cliResponse = {
        status: 200,
        statusText: 'OK',
        data: [],
        url: '/dbal/api/cli',
        timestamp: '2026-01-01T00:00:00.000Z',
        command: 'dbal ping',
      }
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(makeFetchResponse(cliResponse))
      const { result } = renderHook(() => useQueryExecutor('token'))
      const onEntry = vi.fn()

      await act(async () => {
        await result.current.executeCli('dbal ping', 'token', onEntry)
      })

      expect(onEntry).toHaveBeenCalledTimes(1)
      const entry: QueryHistoryEntry = onEntry.mock.calls[0][0]
      expect(entry.cli).toBe('dbal ping')
      expect(entry.status).toBe(200)
    })

    it('sets error response on CLI fetch failure', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('timeout'))
      const { result } = renderHook(() => useQueryExecutor('token'))

      await act(async () => {
        await result.current.executeCli('dbal ping', 'token', vi.fn())
      })

      expect(result.current.response?.status).toBe(0)
      expect(result.current.loading).toBe(false)
    })
  })
})
