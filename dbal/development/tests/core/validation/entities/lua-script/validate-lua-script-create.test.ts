import { describe, expect, it } from 'vitest'
import { validateLuaScriptCreate } from '../../../src/core/validation/validate-lua-script-create'

describe('validateLuaScriptCreate', () => {
  const base = {
    name: 'daily-cleanup',
    code: 'return true',
    isSandboxed: true,
    allowedGlobals: ['math'],
    timeoutMs: 5000,
    createdBy: '550e8400-e29b-41d4-a716-446655440000',
  }

  it.each([
    { data: base, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateLuaScriptCreate(data)).toEqual(expected)
  })

  it.each([
    { data: { ...base, allowedGlobals: 'math' as unknown as string[] }, message: 'allowedGlobals must be an array of strings' },
    { data: { ...base, allowedGlobals: [''] }, message: 'allowedGlobals must contain non-empty strings' },
    { data: { ...base, allowedGlobals: ['os'] }, message: 'allowedGlobals contains forbidden globals: os' },
    { data: { ...base, timeoutMs: 50 }, message: 'timeoutMs must be an integer between 100 and 30000' },
    { data: { ...base, createdBy: 'invalid' }, message: 'createdBy must be a valid UUID' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateLuaScriptCreate(data)).toContain(message)
  })
})
