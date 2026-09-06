'use client'

/** Palette metadata and render helpers shared by the block tables. */

import { Button } from '@/m3'
import type { ReactNode } from 'react'
import type { BlockCategory, PaletteItem } from './block-types'
import { propText } from './block-coerce'
import { store } from '@/store/store'
import { runWorkflow } from '@/lib/workflow/run-workflow'
import type { GodState } from '@/store/slices/god-slice'
import { useFormScope } from './form/form-context'

export function fireWorkflow(): void {
  const wf = (store.getState().god as GodState).workflow
  if (wf.nodes.length === 0) {
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
  const runWorkflow = p.runWorkflow === true
  // Inside a Form the button submits it, which is what someone dropping a
  // button under some fields plainly means. A link and the older
  // click-to-run-the-local-draft behaviour both still win if asked for.
  const submits = scope !== null && !runWorkflow && href === ''
  const buttonProps: Record<string, unknown> = {
    variant,
    type: submits ? 'submit' : 'button',
    disabled: scope?.sending ?? false,
    onClick: runWorkflow
      ? () => {
          fireWorkflow()
        }
      : undefined,
  }

  if (href.length > 0) {
    buttonProps.href = href
    buttonProps.component = 'a'
  }

  return <Button {...buttonProps}>{propText(p.label, 'Button')}</Button>
}
