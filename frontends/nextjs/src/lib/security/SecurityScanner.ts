/**
 * SecurityScanner - Class wrapper for security scanning operations
 * 
 * This class serves as a container for lambda functions related to security scanning.
 * Each method delegates to an individual function file in the functions/ directory.
 * 
 * Pattern: "class is container for lambdas"
 * - Each lambda is defined in its own file under functions/
 * - This class wraps them for convenient namespaced access
 * - Can be used as SecurityScanner.methodName() or import individual functions
 */

import type { SecurityScanResult, SecurityIssue, SecurityPattern } from './functions/types'

// Import individual lambdas
import { scanJavaScript } from './functions/scanners/scan-javascript'
import { scanLua } from './functions/scanners/scan-lua'
import { scanJSON } from './functions/scanners/scan-json'
import { scanHTML } from './functions/scanners/scan-html'
import { sanitizeInput } from './functions/scanners/sanitize-input'
import { getSeverityColor } from './functions/helpers/get-severity-color'
import { getSeverityIcon } from './functions/helpers/get-severity-icon'

// Re-export types for convenience
export type { SecurityScanResult, SecurityIssue, SecurityPattern }

/**
 * SecurityScanner class wraps individual scanner lambdas
 */
export class SecurityScanner {
  /** Scan JavaScript code for security vulnerabilities */
  scanJavaScript = scanJavaScript

  /** Scan Lua code for security vulnerabilities */
  scanLua = scanLua

  /** Scan JSON for security vulnerabilities */
  scanJSON = scanJSON

  /** Scan HTML for security vulnerabilities */
  scanHTML = scanHTML

  /** Sanitize input based on content type */
  sanitizeInput = sanitizeInput
}

// Export singleton instance for convenience
export const securityScanner = new SecurityScanner()

// Export helper functions directly
export { getSeverityColor, getSeverityIcon }

// Re-export all individual functions for direct imports
export {
  scanJavaScript,
  scanLua,
  scanJSON,
  scanHTML,
  sanitizeInput
}
