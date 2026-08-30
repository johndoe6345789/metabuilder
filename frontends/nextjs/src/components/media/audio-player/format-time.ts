/** mm:ss for a seconds value, or a placeholder before duration is known. */
export function formatTime(sec: number): string {
  if (!Number.isFinite(sec)) return '--:--'
  const m = Math.floor(sec / 60)
  const ss = Math.floor(sec % 60)
  return `${m}:${ss.toString().padStart(2, '0')}`
}
