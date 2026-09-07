'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

import { tenantFromPathname } from '../site-tenant'
import { submitForm } from './submit-form'
import { applyPageEffects, effectRoot } from './page-effects'

/**
 * The submit half of the Form block: what is typed, what is sent, and what
 * the tenant's workflow asked the page to do about it.
 *
 * Split out of FormBlock so the view stays a view -- and because the
 * effects handling below is the substance, not the markup.
 */
export function useFormSubmit(formName: string) {
  const pathname = usePathname()
  // Where a workflow's page.* selectors are allowed to reach.
  const anchor = useRef<HTMLFormElement | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** What the workflow said to tell them, if anything. It knows more than
   *  the static message set in the builder. */
  const [message, setMessage] = useState<string | null>(null)

  const set = useCallback((name: string, value: string) => {
    setValues(v => ({ ...v, [name]: value }))
  }, [])

  const scope = useMemo(
    () => ({ values, set, sending }),
    [values, set, sending]
  )

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (sending) return
      setSending(true)
      setError(null)
      void submitForm({
        tenant: tenantFromPathname(pathname),
        formName,
        path: pathname,
        values,
      })
        .then(result => {
          if (!result.ok) {
            setError(result.reason)
            return
          }
          setSent(true)
          // These were read off the response and then dropped:
          // applyPageEffects was reached only from the bare-button path,
          // and a button inside a Form blanks its own action so this
          // submit is the only route. So a founder could wire page.message
          // or page.go to a form workflow, watch it run server-side, and
          // nothing at all happened in the browser.
          const root = effectRoot(anchor.current)
          if (root === null) return
          const outcome = applyPageEffects(root, result.effects)
          if (outcome.message !== null) setMessage(outcome.message)
          // Navigation last, so everything else has already happened.
          if (outcome.go !== null) window.location.assign(outcome.go)
        })
        .finally(() => {
          setSending(false)
        })
    },
    [sending, pathname, formName, values]
  )

  return { anchor, scope, sent, error, message, onSubmit }
}
