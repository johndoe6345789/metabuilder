import type { Workflow } from '@/workflow-editor'

/**
 * One of a tenant's workflows, with what sets it running.
 *
 * `trigger` is not part of Workflow because that type lives in the
 * workflow-editor library, a separate repo mounted here; DBAL stores it
 * as Workflow.triggerEvent.
 */
export interface WorkflowEntry {
  workflow: Workflow
  /** Entity event that runs it, as "<Entity>.created", or empty. */
  trigger: string
  /**
   * Which form it answers, when its trigger is a form submission. Empty
   * means any form -- which is what every workflow meant before this
   * existed, and why three workflows on one tenant all answered the same
   * submission and the winner came down to database order.
   */
  formName: string
}

const now = () => new Date().toISOString()

let counter = 0

/** A new, empty workflow named @p name. */
export function newWorkflowEntry(name: string): WorkflowEntry {
  counter += 1
  return {
    workflow: {
      id: `wf_${Date.now().toString(36)}_${counter}`,
      name,
      description: '',
      nodes: [],
      connections: [],
      createdAt: now(),
      updatedAt: now(),
    },
    trigger: '',
    formName: '',
  }
}

/** The entry @p id names, or the first one when it names none. */
export function pickEntry(
  entries: WorkflowEntry[],
  id: string | undefined
): WorkflowEntry | undefined {
  return entries.find(e => e.workflow.id === id) ?? entries[0]
}
