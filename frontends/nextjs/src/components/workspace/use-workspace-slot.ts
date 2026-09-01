'use client'

import { useEffect, useMemo, useState } from 'react'
import { resolveComponent } from '@/lib/packages/component-registry'
import { fetchSlot, type SlotConfig } from './workspace-slot-data'

/**
 * `undefined` while loading, `null` once resolved with nothing published,
 * or the slot itself.
 */
export function useWorkspaceSlot(tenant: string, path: string) {
  const [slot, setSlot] = useState<SlotConfig | null | undefined>(undefined)

  // A tenant/path change needs to show loading again before the refetch
  // below resolves. Adjusted during render (the documented React pattern
  // for state that tracks props) instead of synchronously in the effect.
  const [prevKey, setPrevKey] = useState({ tenant, path })
  if (prevKey.tenant !== tenant || prevKey.path !== path) {
    setPrevKey({ tenant, path })
    setSlot(undefined)
  }

  useEffect(() => {
    let cancelled = false
    void fetchSlot(tenant, path).then(result => {
      if (!cancelled) setSlot(result)
    })
    return () => {
      cancelled = true
    }
  }, [tenant, path])

  // System package: a registered `component` name wins over
  // `componentTree` when both are present. component-tree-publish.ts
  // stamps every user-package row's `component` field with the literal
  // marker "component_tree" (not a real registry name), so this falls
  // through to the componentTree branch for those rather than matching.
  //
  // Memoized rather than resolved inline: resolveComponent always returns
  // the same reference for the same name (a static lookup table, not a
  // factory), so a fresh reference every render would be wrong to hand to
  // React as a component identity.
  const resolved = useMemo(
    () => resolveComponent(slot?.component ?? null),
    [slot?.component]
  )

  return { slot, resolved }
}
