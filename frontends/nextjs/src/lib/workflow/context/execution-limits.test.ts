import { describe, expect, it } from 'vitest'

import {
  DEFAULT_EXECUTION_LIMITS,
  defaultExecutionLimits,
} from './execution-limits'

describe('defaultExecutionLimits', () => {
  it('caps a run at one hour', () => {
    expect(defaultExecutionLimits().maxExecutionTime).toBe(3600000)
  })

  it('sets every limit the type declares', () => {
    for (const value of Object.values(defaultExecutionLimits())) {
      expect(value).toBeGreaterThan(0)
    }
  })

  // A caller that tightens its own limits must not tighten everyone's.
  it('hands back a copy, not the shared table', () => {
    const limits = defaultExecutionLimits()
    limits.maxExecutionTime = 1
    expect(DEFAULT_EXECUTION_LIMITS.maxExecutionTime).toBe(3600000)
    expect(defaultExecutionLimits().maxExecutionTime).toBe(3600000)
  })
})
