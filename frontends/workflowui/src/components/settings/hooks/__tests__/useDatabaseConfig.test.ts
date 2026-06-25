/**
 * Tests for useDatabaseConfig hook
 */

jest.mock('@/lib/app-config', () => ({
  BASE_PATH: '/workflowui',
}))

global.fetch = jest.fn()

import { renderHook, act, waitFor } from '@testing-library/react'
import { useDatabaseConfig } from '../useDatabaseConfig'

const mockConfig = {
  adapter: 'postgres',
  database_url: 'postgres://localhost:5432/metabuilder',
  status: 'connected',
}

const mockAdapters = [
  { name: 'postgres', description: 'PostgreSQL', supported: true, active: true },
  { name: 'sqlite', description: 'SQLite', supported: true, active: false },
]

describe('useDatabaseConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with loading = true', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockConfig }),
    })

    const { result } = renderHook(() => useDatabaseConfig())
    // loading starts as true
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('should initialize with config = null', () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    })
    const { result } = renderHook(() => useDatabaseConfig())
    expect(result.current.config).toBeNull()
  })

  it('should initialize with adapters = []', () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    })
    const { result } = renderHook(() => useDatabaseConfig())
    expect(result.current.adapters).toEqual([])
  })

  it('should fetch config on mount', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockConfig }),
    })

    renderHook(() => useDatabaseConfig())

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/workflowui/api/dbal/admin/config'
      )
    })
  })

  it('should fetch adapters on mount', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockAdapters }),
    })

    renderHook(() => useDatabaseConfig())

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/workflowui/api/dbal/admin/adapters'
      )
    })
  })

  it('should set config when fetch returns success', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/config')) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockConfig }) })
      }
      return Promise.resolve({ json: () => Promise.resolve({ success: false }) })
    })

    const { result } = renderHook(() => useDatabaseConfig())

    await waitFor(() => {
      expect(result.current.config).toEqual(mockConfig)
    })
  })

  it('should set adapters when fetch returns success', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/adapters')) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockAdapters }) })
      }
      return Promise.resolve({ json: () => Promise.resolve({ success: false }) })
    })

    const { result } = renderHook(() => useDatabaseConfig())

    await waitFor(() => {
      expect(result.current.adapters).toEqual(mockAdapters)
    })
  })

  it('should not set config when fetch returns success: false', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    })

    const { result } = renderHook(() => useDatabaseConfig())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.config).toBeNull()
  })

  it('should gracefully handle fetch errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useDatabaseConfig())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.config).toBeNull()
    expect(result.current.adapters).toEqual([])
  })

  it('fetchConfig should re-fetch and update config', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/config')) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, data: mockConfig }) })
      }
      return Promise.resolve({ json: () => Promise.resolve({ success: false }) })
    })

    const { result } = renderHook(() => useDatabaseConfig())

    await waitFor(() => expect(result.current.loading).toBe(false))

    // Call fetchConfig manually
    await act(async () => {
      await result.current.fetchConfig()
    })

    expect(result.current.config).toEqual(mockConfig)
  })

  it('loading should be false after fetches complete', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    })

    const { result } = renderHook(() => useDatabaseConfig())

    await waitFor(() => expect(result.current.loading).toBe(false))
  })
})
