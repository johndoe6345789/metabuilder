'use client'

import { useEffect, useMemo } from 'react'
import type { VaultDraft, VaultEntry } from '../vault-types'
import { draftFromEntry } from '../vault-normalize'

interface Args {
  entries: VaultEntry[]
  routeSlug: string | null
  search: string
  setDraft: (draft: VaultDraft) => void
}

/** The entry the route names (or the first one, for a bare /vault),
 *  kept in sync with a draft to edit, plus the search-filtered list. */
export function useCurrentEntry(args: Args) {
  const { entries, routeSlug, search, setDraft } = args
  const currentEntry = useMemo(() => {
    if (routeSlug === 'new') return null
    return (
      entries.find(
        entry => entry.slug === routeSlug || entry.id === routeSlug
      ) ?? (routeSlug === null ? (entries[0] ?? null) : null)
    )
  }, [entries, routeSlug])

  useEffect(() => {
    setDraft(draftFromEntry(routeSlug === 'new' ? null : currentEntry))
  }, [currentEntry, routeSlug, setDraft])

  const visibleEntries = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (term.length === 0) return entries
    return entries.filter(entry =>
      Object.values(entry).join(' ').toLowerCase().includes(term)
    )
  }, [entries, search])

  return { currentEntry, visibleEntries }
}
