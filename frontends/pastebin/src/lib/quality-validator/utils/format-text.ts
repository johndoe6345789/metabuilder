/**
 * Text manipulation and escape utilities
 */

export function truncateText(
  text: string,
  maxLength: number,
  suffix = '...',
): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, ch => map[ch])
}

export function createSvgDataUrl(svgContent: string): string {
  const encoded = Buffer.from(svgContent).toString('base64')
  return `data:image/svg+xml;base64,${encoded}`
}

export function padText(
  text: string,
  width: number,
  padChar = ' ',
  padLeft = false,
): string {
  const padding = Math.max(0, width - text.length)
  const padStr = padChar.repeat(padding)
  return padLeft ? padStr + text : text + padStr
}

export function formatList(
  items: string[],
  separator = ', ',
  finalSeparator = ', and ',
): string {
  if (!items.length) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) {
    return `${items[0]}${finalSeparator}${items[1]}`
  }
  return (
    items.slice(0, -1).join(separator) +
    finalSeparator +
    items[items.length - 1]
  )
}

export function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms)}ms`
}

export function formatTime(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / 60_000) % 60)
  const hours = Math.floor((ms / 3_600_000) % 24)
  const days = Math.floor(ms / 86_400_000)
  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 || !parts.length) parts.push(`${seconds}s`)
  return parts.join(' ')
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let idx = 0
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024
    idx++
  }
  return `${size.toFixed(1)}${units[idx]}`
}
