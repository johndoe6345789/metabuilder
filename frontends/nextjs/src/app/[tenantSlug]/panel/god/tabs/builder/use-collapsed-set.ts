'use client'

import { useCallback, useState } from 'react'

/**
 * Which tree nodes are collapsed.
 *
 * Held here rather than inside the recursive outline, so it survives the
 * re-render every tree edit causes.
 */
export function useCollapsedSet() {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set())

  const toggle = useCallback((id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return { collapsed, toggle }
}
