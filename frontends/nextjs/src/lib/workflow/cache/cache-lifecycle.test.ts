import { describe, expect, it, vi } from 'vitest'

import { ValidationCache } from './validation-cache'

describe('ValidationCache lifecycle', () => {
  it('destroy stops the sweep, so it cannot hold a process open', () => {
    const cache = new ValidationCache()
    const clear = vi.spyOn(globalThis, 'clearInterval')

    cache.destroy()
    cache.destroy()

    // Idempotent: the second call must not clear a stale handle.
    expect(clear).toHaveBeenCalledTimes(1)
  })
})
