'use client'

import { createContext, useContext } from 'react'

/**
 * What the fields inside a Form share with it.
 *
 * A block's render() gets only its own props, so a Text field has no way to
 * hand its value up to the Form around it except through context. `null`
 * means the field is not inside a Form at all, which is a legitimate state
 * -- a text field dropped on a page on its own still has to render.
 */
export interface FormScope {
  /** Current value of each named field. */
  values: Record<string, string>
  /** Record what someone typed into the field called @p name. */
  set: (name: string, value: string) => void
  /** True while the submission is in flight, so controls can disable. */
  sending: boolean
}

export const FormContext = createContext<FormScope | null>(null)

export function useFormScope(): FormScope | null {
  return useContext(FormContext)
}
