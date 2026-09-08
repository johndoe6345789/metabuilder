'use client'

import { useCallback, useEffect, useState } from 'react'
import { saveGraph } from '@/lib/workflow/workflow-graph'
import type { Workflow } from '@/workflow-editor'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  setWorkflows,
  addWorkflow,
  patchWorkflow,
  removeWorkflow,
  selectWorkflow,
  workflowPublished,
  type GodState,
} from '@/store/slices/god-slice'
import {
  newWorkflowEntry,
  pickEntry,
  type WorkflowEntry,
} from '@/store/slices/god-slice/workflow-entry'
import { snapshot } from '@/lib/persist/versions'
import { versionsKey } from '@/lib/persist/versions-key'
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
  // Whether *this* workflow has unpublished edits. It used to read the
  // single dirty.workflow flag covering all of them, so publishing any
  // one reported every one as up to date.
  const dirtyIds = useAppSelector(
    s => (s.god as GodState).dirtyWorkflows ?? []
  )
  const [publishing, setPublishing] = useState(false)

  const entries = stored ?? FIRST
  const current = pickEntry(entries, selectedId) ?? FIRST[0]
  const dirty = dirtyIds.includes(current.workflow.id)

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

  /**
   * Write one workflow and its steps, returning null or why it failed.
   *
   * Shared by the Publish button and by a BQL script, so a workflow
   * published either way is published the same way -- two copies of this
   * would drift on the next field the schema adds.
   */
  const publishEntry = useCallback(
    async (entry: WorkflowEntry): Promise<string | null> => {
      const wf = entry.workflow
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
        // What makes it run, and the opt-in that lets a page name it.
        triggerEvent: entry.trigger,
        // Which form it answers. Without it every workflow subscribed to
        // FormSubmission.created claims every form on the tenant.
        formName: entry.formName,
        isPublished: true,
      }
      try {
        const res = await fetch(`${DBAL}/${tenant}/core/Workflow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row),
          signal: AbortSignal.timeout(6000),
        })
        // 409 means the row is already there -- from the second publish
        // onwards, which is most of them. It has to be updated rather
        // than skipped, or changing what a workflow runs on never takes.
        if (res.status === 409) {
          const put = await fetch(`${DBAL}/${tenant}/core/Workflow/${wf.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(row),
            signal: AbortSignal.timeout(6000),
          })
          if (!put.ok) return describeFailure('Workflow', put)
        } else if (!res.ok) {
          return describeFailure('Workflow', res)
        }

        const wrote = await saveGraph(
          DBAL,
          tenant,
          wf.id,
          wf.nodes,
          wf.connections
        )
        if (!wrote) return 'The workflow was saved but its steps were not.'
        await snapshot(
          versionsKey('god.workflow', tenant),
          wf,
          `Published ${wf.name}`
        )
        return null
      } catch {
        return 'Could not reach the data layer.'
      }
    },
    [tenant]
  )

  /**
   * Store a workflow a BQL script described, and publish it if the script
   * said to.
   *
   * Adds it rather than editing whichever one the tab has open: a script
   * names its workflow, and the tab's selection has nothing to do with
   * what the script was about. A script re-run under the same name
   * replaces that one, so running it twice does not leave two.
   *
   * Returns null when it worked, or why it did not.
   */
  const saveFromScript = useCallback(
    async (built: {
      name: string
      trigger: string
      formName: string
      nodes: Workflow['nodes']
      connections: Workflow['connections']
      publish: boolean
    }): Promise<string | null> => {
      const existing = entries.find(e => e.workflow.name === built.name)
      const base = existing ?? newWorkflowEntry(built.name)
      const entry: WorkflowEntry = {
        ...base,
        workflow: {
          ...base.workflow,
          name: built.name,
          nodes: built.nodes,
          connections: built.connections,
        },
        trigger: built.trigger,
        formName: built.formName,
      }

      if (existing === undefined) dispatch(addWorkflow({ tenant, entry }))
      else {
        dispatch(
          patchWorkflow({ tenant, id: entry.workflow.id, change: entry })
        )
      }
      dispatch(selectWorkflow({ tenant, id: entry.workflow.id }))

      if (!built.publish) return null
      return publishEntry(entry)
    },
    [entries, dispatch, tenant, publishEntry]
  )

  const publish = useCallback(async (): Promise<boolean> => {
    setPublishing(true)
    setError(null)
    try {
      const why = await publishEntry(current)
      if (why !== null) {
        setError(why)
        return false
      }
      // Only this one. Clearing the shared flag reported every other
      // workflow as published too, including ones never written.
      dispatch(workflowPublished(current.workflow.id))
      return true
    } finally {
      setPublishing(false)
    }
  }, [current, dispatch, publishEntry])

  return {
    workflow: current.workflow,
    trigger: current.trigger,
    formName: current.formName,
    entries,
    selectedId: current.workflow.id,
    save,
    setTrigger,
    setFormName,
    saveFromScript,
    add,
    remove,
    select,
    dirty,
    publish,
    publishing,
    /** Why the last publish did not take, or null. */
    error,
    /**
     * Where this tenant's version history lives. Handed out rather than
     * spelled again by the tab: the reader used the bare 'god.workflow'
     * while the writer knew the tenant, so one community's history was
     * offered to whoever signed in next on the same browser.
     */
    versionsKey: versionsKey('god.workflow', tenant),
  }
}
