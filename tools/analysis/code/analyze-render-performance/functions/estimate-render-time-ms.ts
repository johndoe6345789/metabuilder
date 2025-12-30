export function estimateRenderTimeMs(lines: number, hooks: number, effects: number, memoization: number): number {
  const base = 1.5
  const lineCost = Math.min(lines, 400) * 0.03
  const hookCost = hooks * 0.4
  const effectCost = effects * 0.8
  const memoSavings = Math.min(memoization, 4) * 0.3
  const estimate = base + lineCost + hookCost + effectCost - memoSavings
  return Math.max(0.5, Math.round(estimate * 10) / 10)
}
