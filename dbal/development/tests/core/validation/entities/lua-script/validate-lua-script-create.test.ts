import { describe, expect, it } from 'vitest'
import { validateLuaScriptCreate } from '../../../src/core/validation/validate-lua-script-create'

describe('validateLuaScriptCreate', () => {
  const base = {
    name: 'daily-cleanup',
    code: 'return true',
    isSandboxed: true,
    parameters: '[]',
    allowedGlobals: '["math"]',
    timeoutMs: 5000,
    createdBy: 'user-1',
  }

  it.each([
    { data: base, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateLuaScriptCreate(data)).toEqual(expected)
  })

  it.each([
    { data: { ...base, parameters: 'not-json' }, message: 'parameters must be a JSON string' },
    { data: { ...base, allowedGlobals: 'math' }, message: 'allowedGlobals must be a JSON string' },
    { data: { ...base, allowedGlobals: '{"foo":"bar"}' }, message: 'allowedGlobals must be a JSON array' },
    { data: { ...base, allowedGlobals: '[""]' }, message: 'allowedGlobals must contain non-empty strings' },
    { data: { ...base, allowedGlobals: '["os"]' }, message: 'allowedGlobals contains forbidden globals: os' },
    { data: { ...base, timeoutMs: 50 }, message: 'timeoutMs must be an integer between 100 and 30000' },
    { data: { ...base, createdBy: '' }, message: 'createdBy must be a non-empty string' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateLuaScriptCreate(data)).toContain(message)
  })
})
