'use client'

import { useCallback } from 'react'
import type { useComponentTree } from './use-component-tree'
import type { PageConfigRow } from './use-page-configs'
import type { PublishTarget } from './component-tree-publish'

type Setter = (
  update: PublishTarget | ((prev: PublishTarget) => PublishTarget)
) => void

/** The handlers SetupPanel needs to change which tree/route is loaded. */
export function useTargetActions(
  t: Pick<ReturnType<typeof useComponentTree>, 'load'>,
  tenant: string,
  target: PublishTarget,
  pages: PageConfigRow[],
  setTarget: Setter
) {
  const pick = useCallback(
    (path: string) => {
      const row = pages.find(p => p.path === path)
      setTarget(prev => ({ ...prev, path, title: row?.title ?? prev.title }))
      void t.load(tenant, path)
    },
    [pages, setTarget, t, tenant]
  )

  const change = useCallback(
    (patch: Partial<PublishTarget>) => {
      setTarget(prev => ({ ...prev, ...patch }))
    },
    [setTarget]
  )

  const load = useCallback(() => {
    void t.load(target.tenant, target.path).then(loaded => {
      if (loaded !== null) setTarget(prev => ({ ...prev, ...loaded }))
    })
  }, [setTarget, t, target.path, target.tenant])

  return { pick, change, load }
}
