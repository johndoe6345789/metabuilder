'use client'

import type { ReactNode } from 'react'

import { useRecordAction } from './use-record-action'
import s from './form.module.scss'

/**
 * Runs a workflow when what it wraps is clicked.
 *
 * Any block can do this, not only a button: a card, a heading and an
 * image are all things someone will click, and the block that happens to
 * look like a control should not be the only one that can act.
 *
 * `display: contents` so wrapping changes no layout -- the child sits in
 * its parent's grid or flex row exactly as it did unwrapped.
 */
export function WorkflowClick({
  workflow,
  children,
}: {
  workflow: string
  children: ReactNode
}) {
  // The workflow's own name doubles as the submission's label, so a
  // tenant reading their submissions can see which click produced each.
  const record = useRecordAction(workflow, workflow)

  return (
    <>
      <span
        style={{ display: 'contents' }}
        onClick={() => {
          record.fire()
        }}
      >
        {children}
      </span>
      {record.error !== null && (
        <span role="alert" className={s.error}>
          {record.error}
        </span>
      )}
    </>
  )
}
