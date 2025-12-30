import { describe, expect, it } from 'vitest'
import { validateLuaScriptUpdate } from '../../../src/core/validation/validate-lua-script-update'

describe('validateLuaScriptUpdate', () => {
  it.each([
    { data: { timeoutMs: 100 }, expected: [] },
    { data: { allowedGlobals: ['math', 'string'] }, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateLuaScriptUpdate(data)).toEqual(expected)
  })

  it.each([
    { data: { timeoutMs: 10 }, message: 'timeoutMs must be an integer between 100 and 30000' },
    { data: { allowedGlobals: ['ok', 1 as unknown as string] }, message: 'allowedGlobals must contain non-empty strings' },
    { data: { allowedGlobals: ['os'] }, message: 'allowedGlobals contains forbidden globals: os' },
    { data: { isSandboxed: 'yes' as unknown as boolean }, message: 'isSandboxed must be a boolean' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateLuaScriptUpdate(data)).toContain(message)
  })
})
