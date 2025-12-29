/**
 * Security Functions Index
 * Exports all security-related types and functions
 */

// Types
export type { SecurityIssue, SecurityPattern,SecurityScanResult } from './types'

// Patterns
export { JAVASCRIPT_PATTERNS } from './patterns/javascript-patterns'
export { LUA_PATTERNS } from './patterns/lua-patterns'
export { SQL_INJECTION_PATTERNS } from './patterns/sql-patterns'

// Scanners
export { sanitizeInput } from './scanners/sanitize-input'
export { scanForVulnerabilities } from './scanners/scan-for-vulnerabilities'
export { scanHTML } from './scanners/scan-html'
export { scanJavaScript } from './scanners/scan-javascript'
export { scanJSON } from './scanners/scan-json'
export { scanLua } from './scanners/scan-lua'

// Utils
export { calculateOverallSeverity } from './utils/calculate-severity'
export { getLineNumber } from './utils/get-line-number'

// Helpers
export { getSeverityColor } from './helpers/get-severity-color'
export { getSeverityIcon } from './helpers/get-severity-icon'
