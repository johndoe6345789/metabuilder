/** How far through a program's scheduled slot "now" is, as 0-100. */
export function progressPercent(start: string, end: string): number {
  const now = Date.now()
  const s0 = new Date(start).getTime()
  const e0 = new Date(end).getTime()
  if (e0 <= s0) return 0
  return Math.min(100, Math.max(0, ((now - s0) / (e0 - s0)) * 100))
}
