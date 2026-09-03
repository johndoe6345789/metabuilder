/** Coercing builder props, which arrive as unknown JSON, into render values. */

export function propText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
    ? String(value)
    : fallback
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function propDirection(value: unknown): 'row' | 'column' {
  return value === 'row' ? 'row' : 'column'
}

export function propGap(value: unknown): number {
  return typeof value === 'number' ? value : 12
}

export function propNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback
}

export interface NavLink {
  label: string
  href: string
}

/** A nav bar's links, authored as one line rather than a repeating field
 *  the prop-schema system has no way to express: "Label->/path" entries
 *  separated by "|". "->" rather than ":" so a full URL's own colon
 *  ("Home->https://example.com") can't be mistaken for the separator. */
export function parseNavLinks(value: unknown): NavLink[] {
  return propText(value)
    .split('|')
    .map(entry => entry.trim())
    .filter(entry => entry !== '')
    .map(entry => {
      const i = entry.indexOf('->')
      return i === -1
        ? { label: entry, href: '#' }
        : { label: entry.slice(0, i).trim(), href: entry.slice(i + 2).trim() }
    })
}
