/**
 * Security Functions Index
 * Exports all security-related types and functions
 */

// Types
export type { SecurityScanResult, SecurityIssue, SecurityPattern } from './types'

// Patterns
export { JAVASCRIPT_PATTERNS } from './patterns/javascript-patterns'
export { LUA_PATTERNS } from './patterns/lua-patterns'
export { SQL_INJECTION_PATTERNS } from './patterns/sql-patterns'

// Scanners
export { scanJavaScript } from './scanners/scan-javascript'
export { scanLua } from './scanners/scan-lua'
export { scanJSON } from './scanners/scan-json'
export { scanHTML } from './scanners/scan-html'
export { scanForVulnerabilities } from './scanners/scan-for-vulnerabilities'
export { sanitizeInput } from './scanners/sanitize-input'

// Utils
export { getLineNumber } from './utils/get-line-number'
export { calculateOverallSeverity } from './utils/calculate-severity'

// Helpers
export { getSeverityColor } from './helpers/get-severity-color'
export { getSeverityIcon } from './helpers/get-severity-icon'
