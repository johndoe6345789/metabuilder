'use client'

import { useState } from 'react'
import {
  DEFAULT_PUBLISH_TARGET,
  type PublishTarget,
} from './component-tree-publish'

/**
 * The publish target, kept in step with whichever tenant is signed in.
 *
 * The tenant is whoever is signed in -- it was never a choice to make in
 * this workbench -- so a change of tenant (a different login, not a user
 * action here) updates the target rather than leaving it pointed at a
 * tenant the workbench no longer belongs to. Adjusted during render (the
 * documented React pattern for state that tracks a prop) instead of an
 * effect, so the stale tenant is never committed to a paint.
 */
export function usePublishTarget(tenant: string) {
  const [prevTenant, setPrevTenant] = useState(tenant)
  const [target, setTarget] = useState<PublishTarget>({
    ...DEFAULT_PUBLISH_TARGET,
    tenant,
  })

  if (tenant !== prevTenant) {
    setPrevTenant(tenant)
    setTarget(prev => ({ ...prev, tenant }))
  }

  return [target, setTarget] as const
}
