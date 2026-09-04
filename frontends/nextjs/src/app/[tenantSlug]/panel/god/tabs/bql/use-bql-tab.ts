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

import { useCallback, useState } from 'react'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'
import type { TreeNode } from '../builder/builder-registry'
import {
  applyBql,
  type ApplyBqlResult,
  type BqlPage,
} from '../builder/bql/apply'
import { useComponentTree } from '../builder/use-component-tree'
import { useCssClasses } from '../styles/use-css-classes'

export interface BqlScript {
  id: string
  name: string
  text: string
}

let nextId = 0
const newScript = (name: string): BqlScript => {
  nextId += 1
  return { id: `bql_${nextId}`, name, text: '' }
}

export function useBqlTab() {
  const auth = useAuthContext()
  const tenant = normalizeTenantId(auth.user?.tenantId)
  const { tree, replaceTree, publish } = useComponentTree()
  const { classes, replace: replaceClasses } = useCssClasses()

  const [scripts, setScripts] = useState<BqlScript[]>(() => [
    newScript('Page content'),
  ])
  const [runningId, setRunningId] = useState<string | null>(null)
  /** Routes a script published to, and whether each one took. */
  const [published, setPublished] = useState<
    Record<string, { path: string; ok: boolean }[] | undefined>
  >({})
  const [results, setResults] = useState<
    Record<string, ApplyBqlResult | undefined>
  >({})

  const patch = useCallback((id: string, change: Partial<BqlScript>) => {
    setScripts(prev =>
      prev.map(script =>
        script.id === id ? { ...script, ...change } : script
      )
    )
  }, [])

  const add = useCallback(() => {
    setScripts(prev => [...prev, newScript(`Script ${prev.length + 1}`)])
  }, [])

  const remove = useCallback((id: string) => {
    // Never leave the tab with nothing to type into.
    setScripts(prev =>
      prev.length === 1 ? prev : prev.filter(script => script.id !== id)
    )
  }, [])

  const publishTo = useCallback(
    async (pages: BqlPage[], built: TreeNode) => {
      const landed: { path: string; ok: boolean }[] = []
      for (const page of pages) {
        const ok = await publish({
          tenant,
          path: page.path,
          title: page.title ?? page.path,
          level: 0,
          requiresAuth: false,
        }, built)
        landed.push({ path: page.path, ok })
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

        replaceTree(outcome.tree)
        replaceClasses(outcome.classes)
        // applyBql only reports the routes; publishing is this hook's job,
        // and it publishes the tree the script just produced rather than
        // whichever route the Components tab happens to have selected.
        const landed = await publishTo(outcome.pages, outcome.tree)
        if (landed.length > 0) setPublished(prev => ({ ...prev, [id]: landed }))
      } finally {
        setRunningId(null)
      }
    },
    [scripts, tenant, tree, classes, replaceTree, replaceClasses, publishTo]
  )

  return { scripts, results, published, runningId, add, remove, patch, run }
}
