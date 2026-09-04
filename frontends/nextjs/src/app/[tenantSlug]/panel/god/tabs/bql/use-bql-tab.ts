'use client'

/**
 * Runs a BQL script against the current page's tree and style classes.
 *
 * Parsing is DBAL's job (see builder/bql/dbal-parse.ts) -- this hook only
 * ever hands DBAL raw script text and receives back either sentences or
 * syntax errors, never parsing anything itself.
 */

import { useCallback, useState } from 'react'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'
import { applyBql, type ApplyBqlResult } from '../builder/bql/apply'
import { useComponentTree } from '../builder/use-component-tree'
import { useCssClasses } from '../styles/use-css-classes'

export function useBqlTab() {
  const auth = useAuthContext()
  const tenant = normalizeTenantId(auth.user?.tenantId)
  const { tree, replaceTree } = useComponentTree()
  const { classes, replace: replaceClasses } = useCssClasses()

  const [script, setScript] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<ApplyBqlResult | null>(null)

  const run = useCallback(async () => {
    setRunning(true)
    try {
      const outcome = await applyBql(script, tenant, tree.id, tree, classes)
      setResult(outcome)
      if (outcome.errors.length === 0) {
        replaceTree(outcome.tree)
        replaceClasses(outcome.classes)
      }
    } finally {
      setRunning(false)
    }
  }, [script, tenant, tree, classes, replaceTree, replaceClasses])

  return { script, setScript, running, result, run }
}
