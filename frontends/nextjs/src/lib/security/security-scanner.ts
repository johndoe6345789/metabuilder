/**
 * Security Scanner
 * 
 * Wraps individual scan functions into a unified class interface.
 * Each scanning function is implemented as 1 lambda/function per file
 * in the functions/ directory.
 * 
 * Pattern: Lambda wrapper class - keeps this file short while maintaining
 * a convenient class-based API.
 */

// Types
export type { SecurityScanResult, SecurityIssue, SecurityPattern } from './functions/types'

// Import individual lambda functions
import { scanJavaScript } from './functions/scanners/scan-javascript'
import { scanLua } from './functions/scanners/scan-lua'
import { scanJSON } from './functions/scanners/scan-json'
import { scanHTML } from './functions/scanners/scan-html'
import { sanitizeInput } from './functions/scanners/sanitize-input'
import { getSeverityColor } from './functions/helpers/get-severity-color'
import { getSeverityIcon } from './functions/helpers/get-severity-icon'

import type { SecurityScanResult } from './functions/types'

/**
 * SecurityScanner - Wrapper class for security scanning functions
 * 
 * All methods delegate to individual lambda functions in functions/scanners/
 * This keeps the main class file small while providing a unified API.
 */
export class SecurityScanner {
  // Scanner methods - delegate to lambda functions
  scanJavaScript = scanJavaScript
  scanLua = scanLua
  scanJSON = scanJSON
  scanHTML = scanHTML
  sanitizeInput = sanitizeInput
}

// Default instance for convenience
export const securityScanner = new SecurityScanner()

// Re-export helper functions
export { getSeverityColor, getSeverityIcon }

// Re-export individual functions for direct use
export {
  scanJavaScript,
  scanLua,
  scanJSON,
  scanHTML,
  sanitizeInput
}

/**
 * Convenience function to scan code for vulnerabilities
 * Automatically detects type based on content or explicit type parameter
 */
export function scanForVulnerabilities(
  code: string, 
  type?: 'javascript' | 'lua' | 'json' | 'html'
): SecurityScanResult {
  // Auto-detect type if not provided
  if (!type) {
    if (code.trim().startsWith('{') || code.trim().startsWith('[')) {
      type = 'json'
    } else if (code.includes('function') && code.includes('end')) {
      type = 'lua'
    } else if (code.includes('<') && code.includes('>')) {
      type = 'html'
    } else {
      type = 'javascript'
    }
  }

  switch (type) {
    case 'lua':
      return scanLua(code)
    case 'json':
      return scanJSON(code)
    case 'html':
      return scanHTML(code)
    default:
      return scanJavaScript(code)
  }
}
