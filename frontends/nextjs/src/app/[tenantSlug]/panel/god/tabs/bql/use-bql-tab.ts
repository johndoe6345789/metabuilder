'use client'

/**
 * Several named BQL scripts, each run on its own.
 *
 * One box meant a script that built a page and a script that set its route
 * had to be pasted over each other, and re-pasted every time either was
 * needed again. Keeping them apart is the point: a "routes" script is
 * usually stable while page content is still being rewritten.
 *
 * Parsing is DBAL's job (see builder/bql/dbal-parse.ts) -- this hook only
 * hands DBAL raw script text and receives back sentences or syntax errors.
 */

import { useCallback, useEffect, useState } from 'react'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  addBqlScript,
  patchBqlScript,
  removeBqlScript,
  setBql,
  type GodState,
} from '@/store/slices/god-slice'
import type { TreeNode } from '../builder/builder-registry'
import type { BqlScript } from './bql-script'
import {
  applyBql,
  type ApplyBqlResult,
  type BqlPage,
} from '../builder/bql/apply'
import { useComponentTree } from '../builder/use-component-tree'
import { useCssClasses } from '../styles/use-css-classes'
import { useGodWorkflow } from '../workflow/use-god-workflow'

export type { BqlScript } from './bql-script'

/** Where a script's `publish` line landed, and why if it did not. */
export interface PublishOutcome {
  path: string
  /** null when the page went live. */
  reason: string | null
}

let nextId = 0
const newScript = (name: string): BqlScript => {
  nextId += 1
  return { id: `bql_${nextId}_${Date.now()}`, name, text: '' }
}

/** Stable, so the seeding effect cannot loop on a fresh array each render. */
const FIRST: BqlScript[] = [newScript('Page content')]

export function useBqlTab() {
  const auth = useAuthContext()
  const tenant = normalizeTenantId(auth.user?.tenantId)
  const { tree, replaceTree, publish } = useComponentTree()
  const {
    classes,
    replace: replaceClasses,
    publish: publishStyles,
  } = useCssClasses()
  const workflows = useGodWorkflow()

  const dispatch = useAppDispatch()
  /**
   * Kept in the god slice rather than component state so a script survives
   * switching God Panel tabs -- the point of a separate "Routes" script is
   * that it stays put while page content is rewritten. Read per tenant.
   */
  // Optional all the way down: redux-persist replaces this slice with
  // whatever it saved, so a browser that last used the app before `bql`
  // existed rehydrates a slice with no such key. That is every existing
  // install on its first load after this ships.
  const stored = useAppSelector(s => (s.god as GodState).bql?.[tenant])
  const scripts = stored ?? FIRST

  // Seed once per tenant, so every later edit is a reducer applied to what
  // is actually stored rather than to a list captured during a render.
  useEffect(() => {
    if (stored === undefined) dispatch(setBql({ tenant, scripts: FIRST }))
  }, [stored, tenant, dispatch])

  const [runningId, setRunningId] = useState<string | null>(null)
  /** Routes a script published to, and why any of them did not take. */
  const [published, setPublished] = useState<
    Record<string, PublishOutcome[] | undefined>
  >({})
  const [results, setResults] = useState<
    Record<string, ApplyBqlResult | undefined>
  >({})

  const patch = useCallback(
    (id: string, change: Partial<BqlScript>) => {
      dispatch(patchBqlScript({ tenant, id, change }))
    },
    [dispatch, tenant]
  )

  const add = useCallback(() => {
    dispatch(
      addBqlScript({ tenant, script: newScript(`Script ${scripts.length + 1}`) })
    )
  }, [dispatch, tenant, scripts.length])

  const remove = useCallback(
    (id: string) => {
      dispatch(removeBqlScript({ tenant, id }))
    },
    [dispatch, tenant]
  )

  const publishTo = useCallback(
    async (pages: BqlPage[], built: TreeNode) => {
      const landed: PublishOutcome[] = []
      for (const page of pages) {
        const reason = await publish(
          {
            tenant,
            path: page.path,
            title: page.title ?? page.path,
            level: 0,
            requiresAuth: false,
          },
          built
        )
        landed.push({ path: page.path, reason })
      }
      return landed
    },
    [publish, tenant]
  )

  const run = useCallback(
    async (id: string) => {
      const script = scripts.find(s => s.id === id)
      if (script === undefined) return
      setRunningId(id)
      try {
        const outcome = await applyBql(
          script.text,
          tenant,
          tree.id,
          tree,
          classes
        )
        setResults(prev => ({ ...prev, [id]: outcome }))
        if (outcome.errors.length > 0) return

        // A script builds a page or a workflow, never both.
        if (outcome.workflow !== undefined) {
          const saved = await workflows.saveFromScript(outcome.workflow)
          if (saved !== null) {
            setResults(prev => ({
              ...prev,
              [id]: { ...outcome, errors: [{ line: 1, message: saved }] },
            }))
          }
          return
        }

        replaceTree(outcome.tree)
        replaceClasses(outcome.classes)
        // A published page carries its class names, so the rules behind
        // them have to go too -- otherwise the page goes live styled in
        // the editor and bare to everyone else. Passed explicitly because
        // replaceClasses above has not reached state yet.
        if (outcome.pages.length > 0) {
          await publishStyles(tenant, outcome.classes)
        }
        // applyBql only reports the routes; publishing is this hook's job,
        // and it publishes the tree the script just produced rather than
        // whichever route the Components tab happens to have selected.
        const landed = await publishTo(outcome.pages, outcome.tree)
        if (landed.length > 0) setPublished(prev => ({ ...prev, [id]: landed }))
      } finally {
        setRunningId(null)
      }
    },
    [
      scripts,
      tenant,
      tree,
      classes,
      replaceTree,
      replaceClasses,
      publishStyles,
      publishTo,
      workflows,
    ]
  )

  return { scripts, results, published, runningId, add, remove, patch, run }
}
