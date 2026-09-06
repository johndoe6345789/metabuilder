'use client'

import { useCallback, useState } from 'react'
import {
  saveGraph,
  type GraphEdges,
  type GraphNode,
} from '@/lib/workflow/workflow-graph'
import type { Workflow } from '@/workflow-editor'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  setWorkflow,
  setWorkflowTrigger,
  clearDirty,
  type GodState,
} from '@/store/slices/god-slice'
import { snapshot } from '@/lib/persist/versions'
import { initialState } from '@/store/slices/god-slice/initial-state'
import { useGodTenant } from '../use-god-tenant'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

/**
 * God-panel workflow. Persisted domain data lives in the Redux `god` slice
 * (redux-persist → IndexedDB); publish syncs to DBAL rows and snapshots a
 * version.
 */
export function useGodWorkflow(tenant = 'system') {
  const dispatch = useAppDispatch()
  const stored = useAppSelector(s => (s.god as GodState).workflow)
  const storedDirty = useAppSelector(s => (s.god as GodState).dirty.workflow)
  // Published under a tenant id, persisted per browser origin -- see
  // useGodTenant. Derived during render so publish() can never write one
  // tenant's workflow into another's rows.
  const storedTrigger = useAppSelector(
    s => (s.god as GodState).workflowTrigger
  )
  const { foreign } = useGodTenant()
  const workflow = foreign ? initialState.workflow : stored
  const trigger = foreign ? initialState.workflowTrigger : storedTrigger
  const dirty = foreign ? false : storedDirty
  const [publishing, setPublishing] = useState(false)

  const setTrigger = useCallback(
    (next: string) => {
      dispatch(setWorkflowTrigger(next))
    },
    [dispatch]
  )

  const save = useCallback(
    (wf: Workflow) => {
      dispatch(setWorkflow(wf))
    },
    [dispatch]
  )

  const publish = useCallback(async (): Promise<boolean> => {
    setPublishing(true)
    try {
      const row = {
        id: workflow.id,
        tenantId: tenant,
        name: workflow.name,
        description: workflow.description,
        // What makes it run. DBAL matches this against "<Entity>.created"
        // for the tenant on every create.
        triggerEvent: trigger,
        isPublished: true,
      }
      const res = await fetch(`${DBAL}/${tenant}/core/Workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row),
        signal: AbortSignal.timeout(6000),
      })
      // 409 means the row is already there -- from the second publish
      // onwards, which is most of them. It has to be updated rather than
      // skipped, or changing what a workflow runs on would never take.
      if (res.status === 409) {
        const put = await fetch(
          `${DBAL}/${tenant}/core/Workflow/${workflow.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(row),
            signal: AbortSignal.timeout(6000),
          }
        )
        if (!put.ok) return false
      } else if (!res.ok) return false

      const wrote = await saveGraph(
        DBAL,
        tenant,
        workflow.id,
        workflow.nodes as unknown as GraphNode[],
        workflow.connections as unknown as GraphEdges
      )
      if (!wrote) return false
      await snapshot('god.workflow', workflow, `Published ${workflow.name}`)
      dispatch(clearDirty('workflow'))
      return true
    } catch {
      return false
    } finally {
      setPublishing(false)
    }
  }, [workflow, trigger, tenant, dispatch])

  return { workflow, save, trigger, setTrigger, dirty, publish, publishing }
}
