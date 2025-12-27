/**
 * JavaScript Security Patterns
 * Patterns for detecting malicious JavaScript code
 */

import type { SecurityPattern } from '../types'
import { JAVASCRIPT_INJECTION_PATTERNS } from './javascript/injection'
import { JAVASCRIPT_MISC_PATTERNS } from './javascript/misc'
import { JAVASCRIPT_XSS_PATTERNS } from './javascript/xss'

export const JAVASCRIPT_PATTERNS: SecurityPattern[] = [
  ...JAVASCRIPT_INJECTION_PATTERNS,
  ...JAVASCRIPT_XSS_PATTERNS,
  ...JAVASCRIPT_MISC_PATTERNS
]
