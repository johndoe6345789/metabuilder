'use client'

import { useCallback, useState } from 'react'
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
  /**
   * The path the tree on screen was loaded from, or null if it was not.
   *
   * The publish bar gated on dirty.tree alone, which load() clears -- so
   * loading /about, changing the target path to /pricing and pressing
   * Publish found the button greyed out, with nothing on screen saying
   * why. The founder had to make a throwaway edit first. Pointing a
   * loaded tree at a different path is a change worth publishing.
   */
  const [loadedPath, setLoadedPath] = useState<string | null>(null)

  const pick = useCallback(
    (path: string) => {
      const row = pages.find(p => p.path === path)
      // The path and title move at once so the picker does not lag; the
      // rest arrives with the row.
      setTarget(prev => ({ ...prev, path, title: row?.title ?? prev.title }))
      // load() returns the row's level and requiresAuth, and it exists to
      // return them: without applying them here, choosing an Admin-only
      // page from the dropdown and pressing Publish wrote the target's
      // defaults over it -- level 0 -- and quietly made the page public.
      void t.load(tenant, path).then(loaded => {
        if (loaded === null) return
        setTarget(prev => ({ ...prev, ...loaded }))
        setLoadedPath(path)
      })
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
      if (loaded === null) return
      setTarget(prev => ({ ...prev, ...loaded }))
      setLoadedPath(target.path)
    })
  }, [setTarget, t, target.path, target.tenant])

  return { pick, change, load, loadedPath }
}
