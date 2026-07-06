'use client'

import { useCallback, useState } from 'react'
import type { Workflow } from '@/workflow-editor'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setWorkflow, clearDirty } from '@/store/slices/god-slice'
import { snapshot } from '@/lib/persist/versions'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

/**
 * God-panel workflow. Persisted domain data lives in the Redux `god` slice
 * (redux-persist → IndexedDB); publish syncs to DBAL rows and snapshots a
 * version.
 */
export function useGodWorkflow(tenant = 'system') {
  const dispatch = useAppDispatch()
  const workflow: Workflow = useAppSelector((s) => s.god.workflow)
  const dirty = useAppSelector((s) => s.god.dirty.workflow)
  const [publishing, setPublishing] = useState(false)

  const save = useCallback((wf: Workflow) => {
    dispatch(setWorkflow(wf))
  }, [dispatch])

  const publish = useCallback(async (): Promise<boolean> => {
    setPublishing(true)
    try {
      const res = await fetch(`${DBAL}/${tenant}/core/Workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: workflow.id, tenantId: tenant,
          name: workflow.name, description: workflow.description,
          nodes: JSON.stringify(workflow.nodes),
          edges: JSON.stringify(workflow.connections),
        }),
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) return false
      await snapshot('god.workflow', workflow, `Published ${workflow.name}`)
      dispatch(clearDirty('workflow'))
      return true
    } catch {
      return false
    } finally {
      setPublishing(false)
    }
  }, [workflow, tenant, dispatch])

  return { workflow, save, dirty, publish, publishing }
}
