/**
 * How each error category looks.
 *
 * Two lookup tables, kept out of the boundary so that file is about retry
 * behaviour rather than palette. The Record types make every ErrorCategory
 * mandatory in both, so adding a category cannot half-land.
 */

import type { ErrorCategory } from '@/lib/error-reporting'

export interface CategoryColors {
  border: string
  bg: string
  text: string
}

const ICONS: Record<ErrorCategory, string> = {
  network: '🌐',
  authentication: '🔐',
  permission: '🚫',
  validation: '⚠️',
  'not-found': '🔍',
  conflict: '⚡',
  'rate-limit': '⏱️',
  server: '🖥️',
  timeout: '⏳',
  unknown: '⚠️',
}

const COLORS: Record<ErrorCategory, CategoryColors> = {
  network: { border: '#ffa94d', bg: '#fffbf0', text: '#d9480f' },
  authentication: { border: '#f06595', bg: '#fff0f6', text: '#c2255c' },
  permission: { border: '#ff6b6b', bg: '#fff5f5', text: '#c92a2a' },
  validation: { border: '#ffd43b', bg: '#fffef0', text: '#b5940b' },
  'not-found': { border: '#748ffc', bg: '#f0f4ff', text: '#3b47cc' },
  conflict: { border: '#ff8a65', bg: '#fff3e0', text: '#e64a19' },
  'rate-limit': { border: '#74c0fc', bg: '#e7f5ff', text: '#1971c2' },
  server: { border: '#ff6b6b', bg: '#fff5f5', text: '#c92a2a' },
  timeout: { border: '#ffa94d', bg: '#fffbf0', text: '#d9480f' },
  unknown: { border: '#ff6b6b', bg: '#fff5f5', text: '#c92a2a' },
}

export function iconFor(category: ErrorCategory): string {
  return ICONS[category]
}

export function colorsFor(category: ErrorCategory): CategoryColors {
  return COLORS[category]
}
