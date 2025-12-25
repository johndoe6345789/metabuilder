import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const mockGetSystemConfigValue = vi.fn()

vi.mock('@/lib/db/system-config/get-system-config-value', () => ({
  getSystemConfigValue: (key: string) => mockGetSystemConfigValue(key),
}))

import {
  DEFAULT_MAX_REQUESTS_PER_WINDOW,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
  getRateLimitConfig,
  loadRateLimitConfig,
  resetRateLimitConfig,
} from './rate-limit-store'

describe('rate limit config loading', () => {
  beforeEach(() => {
    mockGetSystemConfigValue.mockReset()
    resetRateLimitConfig()
  })

  afterEach(() => {
    resetRateLimitConfig()
  })

  it('keeps env defaults when config is missing', async () => {
    mockGetSystemConfigValue.mockResolvedValueOnce(null)
    mockGetSystemConfigValue.mockResolvedValueOnce(null)

    await loadRateLimitConfig()

    const { windowMs, maxRequests } = getRateLimitConfig()
    expect(windowMs).toBe(DEFAULT_RATE_LIMIT_WINDOW_MS)
    expect(maxRequests).toBe(DEFAULT_MAX_REQUESTS_PER_WINDOW)
  })

  it('loads values from system config when valid', async () => {
    mockGetSystemConfigValue.mockResolvedValueOnce('120000')
    mockGetSystemConfigValue.mockResolvedValueOnce('250')

    await loadRateLimitConfig()

    const { windowMs, maxRequests } = getRateLimitConfig()
    expect(windowMs).toBe(120000)
    expect(maxRequests).toBe(250)
    expect(mockGetSystemConfigValue).toHaveBeenCalledWith('rate_limit_window_ms')
    expect(mockGetSystemConfigValue).toHaveBeenCalledWith('rate_limit_max_requests')
  })

  it('ignores invalid config values', async () => {
    mockGetSystemConfigValue.mockResolvedValueOnce('0')
    mockGetSystemConfigValue.mockResolvedValueOnce('not-a-number')

    await loadRateLimitConfig()

    const { windowMs, maxRequests } = getRateLimitConfig()
    expect(windowMs).toBe(DEFAULT_RATE_LIMIT_WINDOW_MS)
    expect(maxRequests).toBe(DEFAULT_MAX_REQUESTS_PER_WINDOW)
  })

  it('does not reload once loaded', async () => {
    mockGetSystemConfigValue.mockResolvedValueOnce('120000')
    mockGetSystemConfigValue.mockResolvedValueOnce('250')

    await loadRateLimitConfig()
    mockGetSystemConfigValue.mockClear()

    await loadRateLimitConfig()

    expect(mockGetSystemConfigValue).not.toHaveBeenCalled()
  })
})
