/**
 * Formatting helpers for reporters (display utilities)
 */

export function escapeCsvField(field: string): string {
  if (!field) return ''
  return `"${field.replace(/"/g, '""')}"`
}

export function buildCsvLine(values: (string | number)[]): string {
  return values
    .map(v => (typeof v === 'number' ? v.toString() : escapeCsvField(v)))
    .join(',')
}

export function fmtDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms)}ms`
}

export function colorForValue(value: number, good = 80, warn = 60): string {
  if (value >= good) return 'green'
  if (value >= warn) return 'yellow'
  return 'red'
}

export function colorForSeverity(severity: string): string {
  const map: Record<string, string> = {
    critical: 'red',
    high: 'red',
    medium: 'yellow',
    low: 'blue',
    info: 'cyan',
  }
  return map[severity] || 'white'
}

export function statusIcon(status: string): string {
  const map: Record<string, string> = {
    pass: '✓',
    fail: '✗',
    warning: '⚠',
    critical: '✗',
    high: '!',
    medium: '⚠',
    low: '•',
    info: 'i',
  }
  return map[status] || '?'
}

export function gradeColor(grade: string): string {
  if (grade === 'A' || grade === 'B') return 'green'
  if (grade === 'C' || grade === 'D') return 'yellow'
  return 'red'
}
