import { describe, expect,it } from 'vitest'

import { enforceMaxMemory } from './enforce-max-memory'
import type { SandboxedLuaEngineState } from './types'

const createState = (usageBytes: number, maxMemory: number): SandboxedLuaEngineState =>
  ({
    maxMemory,
    getLuaMemoryUsageBytes: () => usageBytes,
  }) as SandboxedLuaEngineState

describe('enforceMaxMemory', () => {
  it('does not throw when usage is under the limit', () => {
    const state = createState(512, 1024)
    expect(() => enforceMaxMemory.call(state)).not.toThrow()
  })

  it('throws when usage exceeds the limit', () => {
    const state = createState(2048, 1024)
    expect(() => enforceMaxMemory.call(state)).toThrow(/Memory limit exceeded/)
  })

  it('does not throw when maxMemory is disabled', () => {
    const state = createState(2048, 0)
    expect(() => enforceMaxMemory.call(state)).not.toThrow()
  })
})
