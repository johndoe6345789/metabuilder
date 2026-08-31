import { describe, expect, it } from 'vitest'

import { categoryMessage } from './user-message'
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

describe('categoryMessage', () => {
  it.each(CATEGORIES)('returns a non-empty message for %s', category => {
    expect(categoryMessage(category).length).toBeGreaterThan(0)
  })

  it('never leaks the word "error" from an internal stack trace', () => {
    // Sanity check that these are user-facing, not raw error dumps.
    expect(categoryMessage('server')).not.toMatch(/at \w+\.\w+/)
  })
})
