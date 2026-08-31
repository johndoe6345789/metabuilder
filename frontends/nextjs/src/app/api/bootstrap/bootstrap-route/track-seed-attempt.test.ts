import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trackSeedAttempt } from './track-seed-attempt'
import { emptySeedResults } from './types'

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

describe('trackSeedAttempt', () => {
  it('counts a successful write and logs the success message', async () => {
    const results = emptySeedResults()

    await trackSeedAttempt(results, 'pages', 'Created X', 'X', () =>
      Promise.resolve({ ok: true, status: 200 })
    )

    expect(results.pages).toBe(1)
    expect(console.warn).toHaveBeenCalledWith('[Seed] Created X')
  })

  it('counts a 409 as skipped rather than an error', async () => {
    const results = emptySeedResults()

    await trackSeedAttempt(results, 'pages', 'Created X', 'X', () =>
      Promise.resolve({ ok: false, status: 409 })
    )

    expect(results.skipped).toBe(1)
    expect(results.errors).toBe(0)
  })

  it('counts any other failed status as an error', async () => {
    const results = emptySeedResults()

    await trackSeedAttempt(results, 'packages', 'Created X', 'X', () =>
      Promise.resolve({ ok: false, status: 500 })
    )

    expect(results.errors).toBe(1)
    expect(results.packages).toBe(0)
  })

  it('counts a thrown exception as an error rather than propagating', async () => {
    const results = emptySeedResults()

    await expect(
      trackSeedAttempt(results, 'pages', 'Created X', 'X', () => {
        throw new Error('boom')
      })
    ).resolves.toBeUndefined()

    expect(results.errors).toBe(1)
  })

  it('increments the field the caller names', async () => {
    const results = emptySeedResults()

    await trackSeedAttempt(results, 'packages', 'Created X', 'X', () =>
      Promise.resolve({ ok: true, status: 200 })
    )

    expect(results.packages).toBe(1)
    expect(results.pages).toBe(0)
  })
})
