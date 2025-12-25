import { describe, expect, it } from 'vitest'
import { validateLuaScriptUpdate } from './validate-lua-script-update'

describe('validateLuaScriptUpdate', () => {
  it.each([
    { data: { timeoutMs: 100 } },
    { data: { allowedGlobals: ['math', 'string'] } },
  ])('accepts %s', ({ data }) => {
    expect(validateLuaScriptUpdate(data)).toEqual([])
  })

  it.each([
    { data: { timeoutMs: 10 }, message: 'timeoutMs must be an integer between 100 and 30000' },
    { data: { allowedGlobals: ['ok', 1 as unknown as string] }, message: 'allowedGlobals must contain non-empty strings' },
    { data: { isSandboxed: 'yes' as unknown as boolean }, message: 'isSandboxed must be a boolean' },
  ])('rejects %s', ({ data, message }) => {
    expect(validateLuaScriptUpdate(data)).toContain(message)
  })
})
