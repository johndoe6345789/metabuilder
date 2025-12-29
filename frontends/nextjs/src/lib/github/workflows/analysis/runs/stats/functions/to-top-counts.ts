import { WorkflowRunLike } from './parser'

export function toTopCounts(
  values: string[],
  topCount: number
): Array<{ key: string; count: number }> {
  const counts = new Map<string, number>()
  values.forEach((value) => {
    counts.set(value, (counts.get(value) || 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, topCount)
}
