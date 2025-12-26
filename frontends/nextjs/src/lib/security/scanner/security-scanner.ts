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
import { scanJavaScript } from '../functions/scanners/language-scanners/scan-javascript'
import { scanLua } from '../functions/scanners/language-scanners/scan-lua'
import { scanJSON } from '../functions/scanners/language-scanners/scan-json'
import { scanHTML } from '../functions/scanners/language-scanners/scan-html'
import { scanForVulnerabilities } from '../functions/scanners/scan-for-vulnerabilities'
import { sanitizeInput } from '../functions/scanners/sanitize-input'
import { getSeverityColor } from '../functions/helpers/get-severity-color'
import { getSeverityIcon } from '../functions/helpers/get-severity-icon'

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
  scanForVulnerabilities = scanForVulnerabilities
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
  scanForVulnerabilities,
  sanitizeInput
}
