'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  saveGraph,
  type GraphEdges,
  type GraphNode,
} from '@/lib/workflow/workflow-graph'
import type { Workflow } from '@/workflow-editor'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  setWorkflows,
  addWorkflow,
  patchWorkflow,
  removeWorkflow,
  selectWorkflow,
  clearDirty,
  type GodState,
} from '@/store/slices/god-slice'
import {
  newWorkflowEntry,
  pickEntry,
  type WorkflowEntry,
} from '@/store/slices/god-slice/workflow-entry'
import { snapshot } from '@/lib/persist/versions'
import { describeFailure } from '@/lib/tenant/page-tree/write-failure'
import { useCurrentTenantScope } from '../use-current-tenant-scope'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

/** Stable, so the seeding effect cannot loop on a fresh array each render. */
const FIRST: WorkflowEntry[] = [newWorkflowEntry('Untitled workflow')]

/**
 * A tenant's workflows: as many as they like, one being edited.
 *
 * Kept per tenant in the god slice, which persists per browser origin --
 * so a flat list would show one tenant's automation to whoever signs in
 * next on the same machine. Keyed the same way BQL scripts are, and for
 * the same reason.
 */
export function useGodWorkflow(tenantOverride?: string) {
  const scope = useCurrentTenantScope()
  const tenant = tenantOverride ?? scope.tenant
  const dispatch = useAppDispatch()

  const stored = useAppSelector(s => (s.god as GodState).workflows?.[tenant])
  const selectedId = useAppSelector(
    s => (s.god as GodState).workflowSelected?.[tenant]
  )
  const dirty = useAppSelector(s => (s.god as GodState).dirty.workflow)
  const [publishing, setPublishing] = useState(false)

  const entries = stored ?? FIRST
  const current = pickEntry(entries, selectedId) ?? FIRST[0]

  // Seed once per tenant, so every later edit is a reducer applied to what
  // is stored rather than to a list captured during a render.
  useEffect(() => {
    if (stored === undefined) dispatch(setWorkflows({ tenant, entries: FIRST }))
  }, [stored, tenant, dispatch])

  const save = useCallback(
    (wf: Workflow) => {
      dispatch(patchWorkflow({ tenant, id: wf.id, change: { workflow: wf } }))
    },
    [dispatch, tenant]
  )

  const setFormName = useCallback(
    (next: string) => {
      dispatch(
        patchWorkflow({
          tenant,
          id: current.workflow.id,
          change: { formName: next },
        })
      )
    },
    [dispatch, tenant, current.workflow.id]
  )

  const setTrigger = useCallback(
    (next: string) => {
      dispatch(
        patchWorkflow({
          tenant,
          id: current.workflow.id,
          change: { trigger: next },
        })
      )
    },
    [dispatch, tenant, current.workflow.id]
  )

  const add = useCallback(() => {
    dispatch(
      addWorkflow({
        tenant,
        entry: newWorkflowEntry(`Workflow ${entries.length + 1}`),
      })
    )
  }, [dispatch, tenant, entries.length])

  const remove = useCallback(
    (id: string) => {
      dispatch(removeWorkflow({ tenant, id }))
    },
    [dispatch, tenant]
  )

  const select = useCallback(
    (id: string) => {
      dispatch(selectWorkflow({ tenant, id }))
    },
    [dispatch, tenant]
  )

  const [error, setError] = useState<string | null>(null)

  const publish = useCallback(async (): Promise<boolean> => {
    setPublishing(true)
    setError(null)
    try {
      const wf = current.workflow
      const row = {
        id: wf.id,
        tenantId: tenant,
        name: wf.name,
        description: wf.description,
        // Required by the schema. Omitting it made every publish 422 with
        // "Field is required", which the tab discarded -- so publishing a
        // workflow had never once worked, and said so only by leaving the
        // status on "Staged changes".
        version: 1,
        // What makes it run. DBAL matches this against "<Entity>.created"
        // for the tenant on every create, and it is also the opt-in that
        // lets a page name this workflow at all.
        triggerEvent: current.trigger,
        // Which form it answers. Without it every workflow subscribed to
        // FormSubmission.created claims every form on the tenant.
        formName: current.formName,
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
        const put = await fetch(`${DBAL}/${tenant}/core/Workflow/${wf.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row),
          signal: AbortSignal.timeout(6000),
        })
        if (!put.ok) {
          setError(await describeFailure('Workflow', put))
          return false
        }
      } else if (!res.ok) {
        setError(await describeFailure('Workflow', res))
        return false
      }

      const wrote = await saveGraph(
        DBAL,
        tenant,
        wf.id,
        wf.nodes as unknown as GraphNode[],
        wf.connections as unknown as GraphEdges
      )
      if (!wrote) {
        setError('The workflow was saved but its steps were not.')
        return false
      }
      await snapshot('god.workflow', wf, `Published ${wf.name}`)
      dispatch(clearDirty('workflow'))
      return true
    } catch {
      setError('Could not reach the data layer.')
      return false
    } finally {
      setPublishing(false)
    }
  }, [current, tenant, dispatch])

  return {
    workflow: current.workflow,
    trigger: current.trigger,
    formName: current.formName,
    entries,
    selectedId: current.workflow.id,
    save,
    setTrigger,
    setFormName,
    add,
    remove,
    select,
    dirty,
    publish,
    publishing,
    /** Why the last publish did not take, or null. */
    error,
  }
}
