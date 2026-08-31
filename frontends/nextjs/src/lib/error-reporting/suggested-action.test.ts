import { describe, expect, it } from 'vitest'

import { getSuggestedAction } from './suggested-action'
import type { ErrorCategory } from './types'

const CATEGORIES: ErrorCategory[] = [
  'network',
  'authentication',
  'permission',
  'validation',
  'not-found',
  'conflict',
  'rate-limit',
  'server',
  'timeout',
  'unknown',
]

describe('getSuggestedAction', () => {
  it.each(CATEGORIES)('returns a non-empty suggestion for %s', category => {
    expect(getSuggestedAction(category).length).toBeGreaterThan(0)
  })
})
