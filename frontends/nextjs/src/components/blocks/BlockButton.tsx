'use client'

/**
 * The Button block.
 *
 * Split out of defs-shared because it is the one block whose render() needs
 * a component of its own rather than a few lines of JSX. The draft-preview
 * it can fire lives in fire-workflow.ts.
 */

import { useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/m3'
import type { ReactNode } from 'react'
import type { BlockAttrs } from './common-attrs'
import { propText } from './block-coerce'
import { useFormScope } from './form/form-context'
import { tenantFromPathname } from './site-tenant'
import { fireWorkflow } from './fire-workflow'
import { effectRoot } from './form/page-effects'
import { useRecordAction } from './form/use-record-action'
import formStyles from './form/form.module.scss'

export function renderButton(p: Record<string, unknown>): ReactNode {
  return <BlockButton p={p} />
}

/**
 * Split out from renderButton because a button inside a Form has to know
 * it is inside one, and that is a hook -- which a render() function, being
 * a plain function rather than a component, cannot call.
 *
 * `attrs` is what renderNode cloned onto this component. It has to be
 * declared and forwarded by hand: the control is not this component's outer
 * element, so nothing central can reach it. It goes on the <Button> alone --
 * left on the span as well, a workflow's page.class selector would match
 * both and style the wrapper too.
 */
function BlockButton({
  p,
  ...attrs
}: { p: Record<string, unknown> } & BlockAttrs): ReactNode {
  const scope = useFormScope()
  // Whose community's draft to preview -- the site this block is on.
  const previewTenant = tenantFromPathname(usePathname())
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
    if (preview) fireWorkflow(previewTenant)
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
      <Button {...buttonProps} {...attrs}>
        {label}
      </Button>
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
