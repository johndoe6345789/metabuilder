/** Pure time-window math for the EPG, kept apart from rendering and the
 *  ticking clock so it can be tested without faking timers or DOM. */

export const SLOT_MINUTES = 30

/** Round a moment down to the start of its grid slot. */
export function floorToSlot(d: Date, slotMinutes = SLOT_MINUTES): Date {
  const ms = slotMinutes * 60 * 1000
  return new Date(Math.floor(d.getTime() / ms) * ms)
}

export interface TimeWindow {
  windowStart: Date
  windowEnd: Date
  slots: Date[]
  nowPct: number
}

/** The grid's visible window: slot boundaries and where "now" sits in it,
 *  as a 0-100 percentage clamped to the window even when the clock has
 *  drifted past it (a stale poll should never draw the line off-grid). */
export function computeWindow(
  clock: number,
  windowMinutes: number,
  slotMinutes = SLOT_MINUTES
): TimeWindow {
  const start = floorToSlot(new Date(clock), slotMinutes)
  const end = new Date(start.getTime() + windowMinutes * 60 * 1000)
  const slotCount = windowMinutes / slotMinutes
  const slots = Array.from(
    { length: slotCount },
    (_, i) => new Date(start.getTime() + i * slotMinutes * 60 * 1000)
  )
  const span = end.getTime() - start.getTime()
  const pct = ((clock - start.getTime()) / span) * 100
  return {
    windowStart: start,
    windowEnd: end,
    slots,
    nowPct: Math.min(100, Math.max(0, pct)),
  }
}
