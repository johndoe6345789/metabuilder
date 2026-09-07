'use client'

/**
 * The workflows this tenant has published, for the property panel to offer.
 *
 * A button names the workflow it runs, and a name that matches nothing
 * runs nothing -- quietly, from the page's point of view. Offering the
 * real list is what stops that being a typo away. It stays a datalist
 * rather than a closed choice on purpose: a workflow can be named before
 * it is published, and refusing to accept the name until then would be a
 * worse trap than the one it closes.
 */

import { useEffect, useState } from 'react'
import { readList } from '@/lib/db/read-list'
import { useCurrentTenantScope } from '../use-current-tenant-scope'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

interface WorkflowRow {
  name?: string
  isPublished?: boolean
}

export function useWorkflowNames(): string[] {
  const { tenant } = useCurrentTenantScope()
  const [names, setNames] = useState<string[]>([])

  useEffect(() => {
    let live = true
    fetch(`${DBAL}/${tenant}/core/Workflow`, {
      signal: AbortSignal.timeout(8000),
    })
      .then(async (res): Promise<unknown> => (res.ok ? res.json() : null))
      .then((body: unknown) => {
        if (!live || body === null) return
        const rows = readList<WorkflowRow>(body)
        setNames(
          rows
            .filter(r => r.isPublished !== false)
            .map(r => r.name ?? '')
            .filter(n => n !== '')
        )
      })
      // A panel that cannot list workflows still has to let one be named.
      .catch(() => null)
    return () => {
      live = false
    }
  }, [tenant])

  return names
}
