import { LUA_SNIPPETS } from '../../snippets'

/**
 * Get count of snippets per category
 * @returns Category counts with "All" included
 */
export const getSnippetCategoryCounts = (): Record<string, number> => {
  const counts: Record<string, number> = { All: LUA_SNIPPETS.length }

  for (const snippet of LUA_SNIPPETS) {
    counts[snippet.category] = (counts[snippet.category] || 0) + 1
  }

  return counts
}
