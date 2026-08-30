/** Strip the unit so a stored "12px" can drive a numeric slider. */
export function numericValue(
  value: string | undefined,
  fallback: number
): number {
  if (value === undefined) return fallback
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? fallback : parsed
}
