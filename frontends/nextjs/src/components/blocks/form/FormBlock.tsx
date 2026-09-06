'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { tenantFromPathname } from '../site-tenant'
import { FormContext } from './form-context'
import { submitForm } from './submit-form'
import s from './form.module.scss'

interface FormBlockProps {
  formName: string
  successMessage: string
  children: ReactNode
}

/**
 * A form on a published page.
 *
 * Submitting writes one FormSubmission row, and that write is the whole
 * trigger: DBAL fires <tenant>.FormSubmission.created and runs whatever
 * workflow the tenant published for it. So what happens next is decided in
 * the God Panel, not here.
 */
export function FormBlock({
  formName,
  successMessage,
  children,
}: FormBlockProps) {
  const pathname = usePathname()
  const [values, setValues] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          if (result.ok) setSent(true)
          else setError(result.reason)
        })
        .finally(() => {
          setSending(false)
        })
    },
    [sending, pathname, formName, values]
  )

  if (sent) {
    return (
      <p className={s.sent} role="status">
        {successMessage}
      </p>
    )
  }

  return (
    <FormContext.Provider value={scope}>
      <form className={s.form} onSubmit={onSubmit}>
        {children}
        {error !== null && (
          <p className={s.error} role="alert">
            {error}
          </p>
        )}
      </form>
    </FormContext.Provider>
  )
}
