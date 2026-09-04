'use client'

/** Palette metadata and render helpers shared by the block tables. */

import { Button } from '@/m3'
import type { ReactNode } from 'react'
import type { BlockCategory, PaletteItem } from './block-types'
import { propText } from './block-coerce'
import { store } from '@/store/store'
import { runWorkflow } from '@/lib/workflow/run-workflow'
import type { GodState } from '@/store/slices/god-slice'

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
  const href = propText(p.href)
  const variant = propText(p.variant, 'contained')
  const runWorkflow = p.runWorkflow === true
  const buttonProps: Record<string, unknown> = {
    variant,
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
