/**
 * @file lua-script-validation.ts
 * @description Lua script validation functions
 */

/**
 * Basic Lua syntax validation (checks for obvious errors)
 * In production, this should use an actual Lua parser
 */
export function validateLuaSyntax(code: string): boolean {
  if (!code || code.trim().length === 0) return false;
  
  // Check for balanced function/end keywords
  const functions = (code.match(/\bfunction\b/g) || []).length;
  const ends = (code.match(/\bend\b/g) || []).length;
  
  // Simple heuristic: ends should be >= functions
  return ends >= functions;
}
