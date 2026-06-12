/**
 * Status, severity and visual formatting utilities
 */

export function formatSeverity(severity: string): string {
  return severity.toUpperCase()
}

export function formatStatus(status: string): {
  text: string
  color: string
  icon: string
} {
  const map: Record<string, { text: string; color: string; icon: string }> = {
    pass: { text: 'PASS', color: 'green', icon: '✓' },
    fail: { text: 'FAIL', color: 'red', icon: '✗' },
    warning: { text: 'WARNING', color: 'yellow', icon: '⚠' },
  }
  return map[status] || { text: 'UNKNOWN', color: 'gray', icon: '?' }
}

export function formatStatusWithIcon(status: string): {
  icon: string
  color: string
  text: string
} {
  const map: Record<string, { icon: string; color: string; text: string }> = {
    pass: { icon: '✓', color: 'green', text: 'PASS' },
    fail: { icon: '✗', color: 'red', text: 'FAIL' },
    warning: { icon: '⚠', color: 'yellow', text: 'WARNING' },
    critical: { icon: '✗', color: 'red', text: 'CRITICAL' },
    high: { icon: '!', color: 'red', text: 'HIGH' },
    medium: { icon: '⚠', color: 'yellow', text: 'MEDIUM' },
    low: { icon: '•', color: 'blue', text: 'LOW' },
    info: { icon: 'ℹ', color: 'cyan', text: 'INFO' },
  }
  return (
    map[status.toLowerCase()] || {
      icon: '?',
      color: 'gray',
      text: 'UNKNOWN',
    }
  )
}

export function formatTrend(current: number, previous: number): string {
  if (current > previous) return '↑'
  if (current < previous) return '↓'
  return '→'
}

export function formatMetricDisplayName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function formatBar(
  value: number,
  width = 20,
  filledChar = '█',
  emptyChar = '░',
): string {
  const filled = Math.round((value / 100) * width)
  const empty = width - filled
  return `[${filledChar.repeat(filled)}${emptyChar.repeat(empty)}]`
}

export function formatSparkline(values: number[], width = 10): string {
  if (!values.length) return ''
  const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return values
    .slice(Math.max(0, values.length - width))
    .map(v => {
      const idx = Math.round(((v - min) / range) * (chars.length - 1))
      return chars[idx]
    })
    .join('')
}
