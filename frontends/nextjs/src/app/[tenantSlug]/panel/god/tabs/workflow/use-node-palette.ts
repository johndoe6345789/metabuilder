'use client'

import { useCallback, useState } from 'react'
import { RUNNABLE_CATEGORIES } from './runnable-steps'

/** Search + category-expansion state for the node palette. */
export function useNodePalette() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(Object.keys(RUNNABLE_CATEGORIES).map(k => [k, true]))
  )

  const toggle = useCallback((cat: string) => {
    setExpanded(e => ({ ...e, [cat]: !e[cat] }))
  }, [])
  const expandAll = useCallback(() => {
    setExpanded(
      Object.fromEntries(Object.keys(RUNNABLE_CATEGORIES).map(k => [k, true]))
    )
  }, [])
  const collapseAll = useCallback(() => {
    setExpanded(
      Object.fromEntries(Object.keys(RUNNABLE_CATEGORIES).map(k => [k, false]))
    )
  }, [])

  return { search, setSearch, expanded, toggle, expandAll, collapseAll }
}
