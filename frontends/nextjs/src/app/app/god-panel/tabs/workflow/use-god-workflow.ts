'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Workflow } from '@/workflow-editor'
import { idbGet, idbSet } from '@/lib/persist/idb-kv'
import { snapshot } from '@/lib/persist/versions'

const KEY = 'god.workflow'
const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

function seed(): Workflow {
  const now = new Date().toISOString()
  return {
    id: 'wf_god_default', name: 'Untitled Workflow', description: '',
    nodes: [], connections: [], createdAt: now, updatedAt: now,
  }
}

/**
 * God-panel workflow with the stage→publish persistence model:
 *   edit -> staged in IndexedDB (dirty) -> Publish -> synced to DBAL rows.
 */
export function useGodWorkflow(tenant = 'system') {
  const [workflow, setWorkflow] = useState<Workflow>(seed)
  const [dirty, setDirty] = useState(false)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    void idbGet<Workflow>(KEY).then((w) => { if (w) setWorkflow(w) })
  }, [])

  // Stage a change locally (IndexedDB); marks it unpublished.
  const save = useCallback((wf: Workflow) => {
    setWorkflow(wf)
    setDirty(true)
    void idbSet(KEY, wf)
  }, [])

  // Publish staged changes to the DBAL (live). Falls back gracefully if the
  // server is unreachable — the change stays staged.
  const publish = useCallback(async (): Promise<boolean> => {
    setPublishing(true)
    try {
      const res = await fetch(`${DBAL}/${tenant}/core/Workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...workflow, tenantId: tenant }),
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) return false
      await snapshot(KEY, workflow, `Published ${workflow.name}`)
      setDirty(false)
      return true
    } catch {
      return false
    } finally {
      setPublishing(false)
    }
  }, [workflow, tenant])

  return { workflow, save, dirty, publish, publishing }
}
