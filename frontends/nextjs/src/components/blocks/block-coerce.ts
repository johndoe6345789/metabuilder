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
