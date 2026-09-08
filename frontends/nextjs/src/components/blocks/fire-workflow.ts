'use client'

import { store } from '@/store/store'
import { runWorkflow, type RunResult } from '@/lib/workflow/run-workflow'
import type { GodState } from '@/store/slices/god-slice'
import { pickEntry } from '@/store/slices/god-slice/workflow-entry'

/**
 * Run the God Panel's unsaved draft for @p tenant, and show what it did.
 *
 * A preview of the workflow currently open in the editor -- not the
 * published one, and not the one a block's click names. See
 * form/use-record-action.ts for the path that reaches a real workflow.
 *
 * It used to take the first workflow across *every* tenant held in this
 * browser, on the grounds that a preview had no tenant to consult. It
 * does: the block is rendering on a page under /{tenant}/..., which is
 * where the form block reads its own from. So a founder pressing Preview
 * could be shown another community's workflow name, its logs and its
 * output -- and, even within their own, whichever workflow happened to be
 * first rather than the one open in the editor.
 */
export function fireWorkflow(tenant: string): void {
  const god = store.getState().god as GodState
  const entries = god.workflows?.[tenant] ?? []
  const selected = god.workflowSelected?.[tenant]
  const wf = pickEntry(entries, selected)?.workflow
  if (wf === undefined || wf.nodes.length === 0) {
    window.alert('No workflow wired yet.')
    return
  }
  const res = runWorkflow(wf)
  window.alert(`Ran "${wf.name}"\n\n${previewReport(res)}`)
}

/**
 * What the run did, for the Preview alert.
 *
 * The steps are really run now (see lib/workflow/run-workflow.ts), so a
 * preview can say which step stopped it and what it would have written --
 * before it only ever showed a merged config object, which looked like a
 * result whatever the workflow was.
 */
export function previewReport(res: RunResult): string {
  const rows = Object.entries(res.rows).map(
    ([entity, list]) => `${list.length} × ${entity}`
  )
  const lines = [
    ...res.logs,
    ...(res.stopped === null
      ? []
      : [
          `\nStopped at "${res.stopped.step}" — ${res.stopped.because}.`,
          'The steps after it did not run.',
        ]),
    ...(rows.length === 0
      ? []
      : [`\nWould write: ${rows.join(', ')} (nothing was written)`]),
    ...(res.effects.length === 0
      ? []
      : [`\nWould ask the page to: ${res.effects.map(e => e.do).join(', ')}`]),
    `\n→ ${JSON.stringify(res.output)}`,
  ]
  return lines.join('\n')
}
