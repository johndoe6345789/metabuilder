import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { FlaskBackendAdapter } from '../flask-backend-adapter'

type MockResponse = {
  ok: boolean
  status: number
  statusText: string
  text: ReturnType<typeof vi.fn>
}

const createMockResponse = (status: number, body: string): MockResponse => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 204 ? 'No Content' : 'OK',
  text: vi.fn().mockResolvedValue(body),
})

describe('FlaskBackendAdapter.request', () => {
  const baseUrl = 'http://example.test'
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetAllMocks()
  })

  it('resolves delete/clear when response is 204 or empty body', async () => {
    fetchMock
      .mockResolvedValueOnce(createMockResponse(204, '') as unknown as Response)
      .mockResolvedValueOnce(createMockResponse(200, '') as unknown as Response)

    const adapter = new FlaskBackendAdapter(baseUrl)

    await expect(adapter.delete('example-key')).resolves.toBeUndefined()
    await expect(adapter.clear()).resolves.toBeUndefined()

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
