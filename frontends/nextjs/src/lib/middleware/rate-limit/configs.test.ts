import { describe, expect, it } from 'vitest'

import { RATE_LIMIT_CONFIGS } from './configs'

describe('RATE_LIMIT_CONFIGS', () => {
  it.each([
    ['login', 5, 60_000],
    ['register', 3, 60_000],
    ['list', 100, 60_000],
    ['mutation', 50, 60_000],
    ['public', 1000, 3_600_000],
    ['bootstrap', 1, 3_600_000],
  ] as const)('declares %s as %i per %ims', (endpoint, limit, window) => {
    expect(RATE_LIMIT_CONFIGS[endpoint]).toEqual({ limit, window })
  })
})
