'use client'

/**
 * The forms this tenant's pages actually submit.
 *
 * Offered as suggestions when scoping a workflow, because a form name
 * that matches nothing scopes the workflow to nothing -- it simply never
 * runs, and says so nowhere. Read from the submissions themselves rather
 * than from the pages: a form that has never been submitted is one nobody
 * has needed a workflow for yet, and a name read from real data cannot
 * drift from what the pages actually send.
 */

import { useEffect, useState } from 'react'
import { readList } from '@/lib/db/read-list'
import { useCurrentTenantScope } from '../use-current-tenant-scope'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export function useFormNames(): string[] {
  const { tenant } = useCurrentTenantScope()
  const [names, setNames] = useState<string[]>([])

  useEffect(() => {
    let live = true
    fetch(`${DBAL}/${tenant}/core/FormSubmission?limit=200`, {
      signal: AbortSignal.timeout(8000),
    })
      .then(async (res): Promise<unknown> => (res.ok ? res.json() : null))
      .then((body: unknown) => {
        if (!live || body === null) return
        const rows = readList<{ formName?: string }>(body)
        const seen = rows.map(r => r.formName ?? '').filter(n => n !== '')
        setNames([...new Set(seen)].sort())
      })
      // Suggestions are a convenience; a name can still be typed.
      .catch(() => null)
    return () => {
      live = false
    }
  }, [tenant])

  return names
}
