import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { loadPackageIndex } from './load-package-index'

const originalFetch = global.fetch

const mockFetch = vi.fn()

describe('loadPackageIndex', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    global.fetch = mockFetch as unknown as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('returns null when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('network'))

    const result = await loadPackageIndex()

    expect(result).toBeNull()
  })

  it('returns null when response is not ok', async () => {
    mockFetch.mockResolvedValue({ ok: false })

    const result = await loadPackageIndex()

    expect(result).toBeNull()
  })

  it('returns package entries when response is valid', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        packages: [{ packageId: 'demo', name: 'Demo', version: '1.0.0' }],
      }),
    })

    const result = await loadPackageIndex()

    expect(result).toEqual([{ packageId: 'demo', name: 'Demo', version: '1.0.0' }])
  })
})
