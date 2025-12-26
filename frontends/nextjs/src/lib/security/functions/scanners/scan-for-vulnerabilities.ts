import type { SecurityScanResult } from '../types'
import { scanHTML } from './language-scanners/scan-html'
import { scanJavaScript } from './language-scanners/scan-javascript'
import { scanJSON } from './language-scanners/scan-json'
import { scanLua } from './language-scanners/scan-lua'

/**
 * Convenience function to scan code for vulnerabilities
 * Automatically detects type based on content or explicit type parameter
 */
export const scanForVulnerabilities = (
  code: string,
  type?: 'javascript' | 'lua' | 'json' | 'html'
): SecurityScanResult => {
  let resolvedType = type

  if (!resolvedType) {
    if (code.trim().startsWith('{') || code.trim().startsWith('[')) {
      resolvedType = 'json'
    } else if (code.includes('function') && code.includes('end')) {
      resolvedType = 'lua'
    } else if (code.includes('<') && code.includes('>')) {
      resolvedType = 'html'
    } else {
      resolvedType = 'javascript'
    }
  }

  switch (resolvedType) {
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
