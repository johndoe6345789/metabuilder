'use client'

import type { ReactNode } from 'react'

import { withOwnClass, type BlockAttrs } from '../common-attrs'
import { FormContext } from './form-context'
import { useFormSubmit } from './use-form-submit'
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
 * the God Panel, not here -- see useFormSubmit for what comes back.
 */
export function FormBlock({
  formName,
  successMessage,
  children,
  ...attrs
}: FormBlockProps & BlockAttrs) {
  // Destructured rather than kept as one object: the ref has to be a
  // plain binding here, not a property read during render.
  const { anchor, scope, sent, error, message, onSubmit } =
    useFormSubmit(formName)

  // Submitting changes what the form says, not what it is. It used to
  // return a bare <p> instead of the <form>, which made the block a
  // different element in its second state -- so the author's id and class
  // had to either follow it there or be lost on submit, and CSS written for
  // the block stopped applying the moment somebody used it. One root, two
  // contents: there is nothing for the identity to follow.
  return (
    <FormContext.Provider value={scope}>
      <form
        ref={anchor}
        {...withOwnClass(s.form, attrs)}
        onSubmit={onSubmit}
      >
        {sent ? (
          <p className={s.sent} role="status">
            {message ?? successMessage}
          </p>
        ) : (
          <>
            {children}
            {error !== null && (
              <p className={s.error} role="alert">
                {error}
              </p>
            )}
          </>
        )}
      </form>
    </FormContext.Provider>
  )
}
