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
import { applyBql, type ApplyBqlResult } from '../builder/bql/apply'
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
  const { tree, replaceTree } = useComponentTree()
  const { classes, replace: replaceClasses } = useCssClasses()

  const [scripts, setScripts] = useState<BqlScript[]>(() => [
    newScript('Page content'),
  ])
  const [runningId, setRunningId] = useState<string | null>(null)
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
        if (outcome.errors.length === 0) {
          replaceTree(outcome.tree)
          replaceClasses(outcome.classes)
        }
      } finally {
        setRunningId(null)
      }
    },
    [scripts, tenant, tree, classes, replaceTree, replaceClasses]
  )

  return { scripts, results, runningId, add, remove, patch, run }
}
