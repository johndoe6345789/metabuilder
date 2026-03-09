/**
 * useDBALSearch — debounced search across DBAL entity types
 *
 * Queries listFromDBAL() for files, models, components, workflows, lambdas
 * in parallel and normalises results into a flat array with entity badges.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { listFromDBAL, ENTITY_MAP } from '@/store/middleware/dbalSync'

export interface DBALSearchResult {
  id: string
  title: string
  subtitle: string
  entityType: string
  sliceName: string
}

const SEARCHABLE_SLICES = ['files', 'models', 'components', 'workflows', 'lambdas'] as const

/** Extract a display name from a raw DBAL record */
function extractTitle(record: Record<string, unknown>): string {
  return String(
    record.name ?? record.title ?? record.storyName ?? record.id ?? 'Untitled'
  )
}

function extractSubtitle(record: Record<string, unknown>, sliceName: string): string {
  if (record.path) return String(record.path)
  if (record.description) return String(record.description)
  if (record.type) return String(record.type)
  return ENTITY_MAP[sliceName]?.entity ?? sliceName
}

export function useDBALSearch(query: string, debounceMs = 300) {
  const [results, setResults] = useState<DBALSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(0)

  const search = useCallback(async (q: string, gen: number) => {
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const settled = await Promise.allSettled(
        SEARCHABLE_SLICES.map((slice) =>
          listFromDBAL(slice, { q, limit: '10' })
        )
      )

      if (abortRef.current !== gen) return

      const merged: DBALSearchResult[] = []
      const qLower = q.toLowerCase()
      for (let i = 0; i < SEARCHABLE_SLICES.length; i++) {
        const sliceName = SEARCHABLE_SLICES[i]
        const outcome = settled[i]
        if (outcome.status !== 'fulfilled') continue

        for (const record of outcome.value) {
          const r = record as Record<string, unknown>
          const title = extractTitle(r)
          if (!title.toLowerCase().includes(qLower)) continue

          merged.push({
            id: `dbal-${sliceName}-${r.id ?? i}`,
            title,
            subtitle: extractSubtitle(r, sliceName),
            entityType: ENTITY_MAP[sliceName]?.entity ?? sliceName,
            sliceName,
          })
        }
      }

      setResults(merged.slice(0, 20))
    } catch (err) {
      if (abortRef.current === gen) {
        setError(err instanceof Error ? err.message : 'DBAL search failed')
        setResults([])
      }
    } finally {
      if (abortRef.current === gen) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const gen = ++abortRef.current

    if (!query.trim() || query.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    const timer = setTimeout(() => search(query.trim(), gen), debounceMs)
    return () => clearTimeout(timer)
  }, [query, debounceMs, search])

  return { results, loading, error }
}
