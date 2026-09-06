'use client'

import { useCallback, useState } from 'react'
import { usePathname } from 'next/navigation'

import { tenantFromPathname } from '../site-tenant'
import { submitForm } from './submit-form'

export interface RecordAction {
  /** Record the click. Does nothing while one is already in flight. */
  fire: () => void
  sending: boolean
  /** True once it has been recorded, so the button can say so. */
  done: boolean
  /** Why it did not go, in words a visitor can read. */
  error: string | null
}

/**
 * A button that runs the tenant's workflow on its own, with no form.
 *
 * The mechanism is the same one a Form uses, because it is the mechanism
 * that works: writing a FormSubmission row is what makes DBAL fire
 * <tenant>.FormSubmission.created and run whatever workflow the tenant
 * published for it. A bare click records no answers, only that it
 * happened -- which is enough for "Book a repair", "Notify me", "Request
 * a callback", where the workflow is the whole point.
 *
 * Not to be confused with the older `runWorkflow` prop, which runs the
 * God Panel's unsaved draft in the browser and shows an alert. That is a
 * preview; this reaches the published workflow.
 */
export function useRecordAction(formName: string): RecordAction {
  const pathname = usePathname()
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fire = useCallback(() => {
    if (sending || done) return
    setSending(true)
    setError(null)
    void submitForm({
      tenant: tenantFromPathname(pathname),
      formName,
      path: pathname,
      values: {},
    })
      .then(result => {
        if (result.ok) setDone(true)
        else setError(result.reason)
      })
      .finally(() => {
        setSending(false)
      })
  }, [sending, done, pathname, formName])

  return { fire, sending, done, error }
}
