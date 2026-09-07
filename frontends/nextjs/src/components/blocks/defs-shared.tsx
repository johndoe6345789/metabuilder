'use client'

/** Palette metadata and render helpers shared by the block tables. */

import { useCallback, useRef } from 'react'
import { Button } from '@/m3'
import type { ReactNode } from 'react'
import type { BlockCategory, PaletteItem } from './block-types'
import { propText } from './block-coerce'
import { store } from '@/store/store'
import { runWorkflow } from '@/lib/workflow/run-workflow'
import type { GodState } from '@/store/slices/god-slice'
import { useFormScope } from './form/form-context'
import { effectRoot } from './form/page-effects'
import { useRecordAction } from './form/use-record-action'
import formStyles from './form/form.module.scss'

/**
 * Run the God Panel's unsaved draft in this browser, and show what it did.
 *
 * A preview of the workflow currently open in the editor -- not the
 * published one, and not the one a block's click names. See
 * form/use-record-action.ts for the path that reaches a real workflow.
 */
export function fireWorkflow(): void {
  const god = store.getState().god as GodState
  // Whichever workflow the panel has open, across every tenant held in
  // this browser: a preview has no tenant of its own to consult.
  // .at() is `T | undefined`; indexing is not, unless
  // noUncheckedIndexedAccess is on -- and it is not in every tsconfig here.
  const wf = Object.values(god.workflows ?? {}).flat().at(0)?.workflow
  if (wf === undefined || wf.nodes.length === 0) {
    window.alert('No workflow wired yet.')
    return
  }
  const res = runWorkflow(wf)
  window.alert(
    `Ran "${wf.name}"\n\n${res.logs.join('\n')}\n\n→ ${JSON.stringify(res.output)}`
  )
}

export const m = (
  type: string,
  name: string,
  icon: string,
  category: BlockCategory,
  container: boolean,
  defaults: Record<string, unknown> = {}
): PaletteItem => ({ type, name, icon, category, container, defaults })

export function renderButton(p: Record<string, unknown>): ReactNode {
  return <BlockButton p={p} />
}

/**
 * Split out from renderButton because a button inside a Form has to know
 * it is inside one, and that is a hook -- which a render() function, being
 * a plain function rather than a component, cannot call.
 */
function BlockButton({ p }: { p: Record<string, unknown> }): ReactNode {
  const scope = useFormScope()
  const href = propText(p.href)
  const variant = propText(p.variant, 'contained')
  const preview = p.runWorkflow === true
  // What clicking records, which is what runs the tenant's workflow. A
  // button inside a Form leaves this to the Form: the answers are the
  // point there, and recording the click twice would run it twice.
  const action = scope === null ? propText(p.action) : ''
  const anchor = useRef<HTMLSpanElement | null>(null)
  const resolveRoot = useCallback(() => effectRoot(anchor.current), [])
  const record = useRecordAction(action, propText(p.action), resolveRoot)
  // Inside a Form the button submits it, which is what someone dropping a
  // button under some fields plainly means. A link, a recorded action and
  // the draft-preview behaviour each win over that if asked for.
  const submits = scope !== null && !preview && href === ''
  const label = record.done
    ? propText(p.doneLabel, 'Thanks — that is with us.')
    : propText(p.label, 'Button')

  const onClick = (): void => {
    if (preview) fireWorkflow()
    else if (action !== '') record.fire()
  }
  const buttonProps: Record<string, unknown> = {
    variant,
    type: submits ? 'submit' : 'button',
    disabled: (scope?.sending ?? false) || record.sending || record.done,
    onClick: preview || action !== '' ? onClick : undefined,
  }

  if (href.length > 0) {
    buttonProps.href = href
    buttonProps.component = 'a'
  }

  return (
    <span ref={anchor} style={{ display: 'contents' }}>
      <Button {...buttonProps}>{label}</Button>
      {record.message !== null && (
        <span role="status" className={formStyles.sent}>
          {record.message}
        </span>
      )}
      {record.error !== null && (
        <span role="alert" className={formStyles.error}>
          {record.error}
        </span>
      )}
    </span>
  )
}
