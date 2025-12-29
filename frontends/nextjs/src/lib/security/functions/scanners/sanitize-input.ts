/**
 * Sanitize Input
 * Removes dangerous patterns from input based on type
 */

/**
 * Sanitize input by removing dangerous patterns
 * @param input - The input string to sanitize
 * @param type - The type of content being sanitized
 * @returns Sanitized string
 */
export const sanitizeInput = (
  input: string,
  type: 'text' | 'html' | 'json' | 'javascript' | 'lua' = 'text'
): string => {
  let sanitized = input

  if (type === 'text') {
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gis, '')
    sanitized = sanitized.replace(/on\w+\s*=/gi, '')
    sanitized = sanitized.replace(/javascript:/gi, '')
  }

  if (type === 'html') {
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gis, '')
    sanitized = sanitized.replace(/on\w+\s*=/gi, '')
    sanitized = sanitized.replace(/javascript:/gi, '')
    sanitized = sanitized.replace(/data:\s*text\/html/gi, '')
  }

  if (type === 'json') {
    sanitized = sanitized.replace(/__proto__/gi, '_proto_')
    sanitized = sanitized.replace(/constructor\s*\[\s*['"]prototype['"]\s*\]/gi, '')
  }

  return sanitized
}
