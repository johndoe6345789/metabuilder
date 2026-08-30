/** Pure per-program placement math for the EPG timeline. */

export interface TimeRange {
  start_time: string
  end_time: string
}

/** Only the entries that overlap the visible window at all. */
export function inWindow<T extends TimeRange>(
  entries: T[],
  windowStart: Date,
  windowEnd: Date
): T[] {
  return entries.filter(e => {
    const start = new Date(e.start_time).getTime()
    const end = new Date(e.end_time).getTime()
    return end > windowStart.getTime() && start < windowEnd.getTime()
  })
}

export interface BlockGeometry {
  left: number
  width: number
}

/** Where a program's block sits along the timeline, as percentages --
 *  clamped so a program spanning outside the window still draws a block
 *  starting/ending at the edge rather than running off it. */
export function blockGeometry(
  entry: TimeRange,
  windowStart: Date,
  windowMs: number
): BlockGeometry {
  const start = new Date(entry.start_time).getTime()
  const end = new Date(entry.end_time).getTime()
  const left = Math.max(0, ((start - windowStart.getTime()) / windowMs) * 100)
  const right = Math.min(100, ((end - windowStart.getTime()) / windowMs) * 100)
  return { left, width: Math.max(2, right - left) }
}

/** Whether a program is airing right now. */
export function isLiveNow(entry: TimeRange, clock: number): boolean {
  const start = new Date(entry.start_time).getTime()
  const end = new Date(entry.end_time).getTime()
  return start <= clock && end > clock
}
