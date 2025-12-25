/**
 * Get Line Number
 * Utility to find line number from character index in code
 */

/**
 * Calculate line number from character index
 * @param code - The source code string
 * @param index - Character index in the code
 * @returns Line number (1-based)
 */
export const getLineNumber = (code: string, index: number): number => {
  return code.substring(0, index).split('\n').length
}
