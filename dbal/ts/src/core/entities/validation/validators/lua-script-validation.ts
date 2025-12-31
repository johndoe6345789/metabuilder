/**
 * @file lua-script-validation.ts
 * @description Lua script validation functions
 */

export const validateLuaSyntax = (code: string): boolean => {
  return typeof code === 'string' && code.trim().length > 0
}
