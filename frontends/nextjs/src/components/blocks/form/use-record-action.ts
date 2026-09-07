'use client'

import { useCallback, useState } from 'react'
import { usePathname } from 'next/navigation'

import { tenantFromPathname } from '../site-tenant'
import { applyPageEffects } from './page-effects'
import { submitForm } from './submit-form'

export interface RecordAction {
  /** Record the click. Does nothing while one is already in flight. */
  fire: () => void
  sending: boolean
  /** True once it has been recorded, so the button can say so. */
  done: boolean
  /** What the workflow asked to be said, if it asked for anything. */
  message: string | null
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
export function useRecordAction(
  formName: string,
  workflow?: string,
  /**
   * How far a workflow's page.* effects may reach: the page's own root,
   * resolved when the click happens. A function rather than a ref because
   * the react-compiler lint cannot reason about a ref read inside a
   * memoized callback -- and the caller owns the element anyway.
   *
   * Without one, page.* steps change nothing. That is deliberate: falling
   * back to the document would restore exactly what the scoping prevents.
   */
  resolveRoot?: () => ParentNode | null
): RecordAction {
  const pathname = usePathname()
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const fire = useCallback(() => {
    if (sending || done) return
    setSending(true)
    setError(null)
    void submitForm({
      tenant: tenantFromPathname(pathname),
      formName,
      path: pathname,
      values: {},
      workflow,
    })
      .then(result => {
        if (!result.ok) {
          setError(result.reason)
          return
        }
        setDone(true)
        // Scoped to the page's own content, not the document: a selector
        // written for a published page must not reach the panel chrome it
        // may be previewed inside.
        const root = resolveRoot?.() ?? null
        const outcome =
          root === null
            ? { message: null, go: null }
            : applyPageEffects(root, result.effects)
        if (outcome.message !== null) setMessage(outcome.message)
        // Navigation last, so anything else the workflow asked for has
        // already happened by the time the page changes.
        if (outcome.go !== null) window.location.assign(outcome.go)
      })
      .finally(() => {
        setSending(false)
      })
  }, [sending, done, pathname, formName, workflow, resolveRoot])

  return { fire, sending, done, message, error }
}
