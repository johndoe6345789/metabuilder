/**
 * scoreSearchResult
 *
 * Pure function: computes a relevance score for a
 * single SearchResult against a query string.
 * Returns 0 if there is no match.
 */

import type { SearchResult } from './types'

export function scoreSearchResult(
  result: SearchResult,
  query: string
): number {
  const queryWords = query.split(/\s+/)
  const titleLower = result.title.toLowerCase()
  const subtitleLower =
    result.subtitle?.toLowerCase() || ''
  const categoryLower =
    result.category.toLowerCase()
  const tagsLower =
    result.tags?.map((t) => t.toLowerCase()) || []

  let score = 0

  if (titleLower === query) score += 100
  else if (titleLower.startsWith(query)) score += 50
  else if (titleLower.includes(query)) score += 30

  if (subtitleLower.includes(query)) score += 20
  if (categoryLower.includes(query)) score += 15

  tagsLower.forEach((tag) => {
    if (tag === query) score += 40
    else if (tag.includes(query)) score += 10
  })

  queryWords.forEach((word) => {
    if (titleLower.includes(word)) score += 5
    if (subtitleLower.includes(word)) score += 3
    if (tagsLower.some((tag) => tag.includes(word)))
      score += 2
  })

  return score
}
