'use client'

import { TextField } from '@/m3'

import { propText } from '../block-coerce'
import type { BlockAttrs } from '../common-attrs'
import { useFormScope } from './form-context'

/**
 * A text field that carries what someone typed.
 *
 * Outside a Form, or without a `name`, it renders exactly as it always did
 * -- uncontrolled and decorative. That matters: the block predates forms
 * and is on published pages already, where turning it into a controlled
 * input with nowhere to send its value would be a regression.
 *
 * `attrs` is what renderNode cloned onto this component, forwarded by hand
 * because a component drops the props it does not name. M3's TextField
 * splits them where each belongs: `className` onto the field's wrapper,
 * `id` and the aria attributes onto the <input> itself, so a label written
 * against that id still finds it.
 */
export function FormTextField({
  p,
  ...attrs
}: { p: Record<string, unknown> } & BlockAttrs) {
  const scope = useFormScope()
  const name = propText(p.name)
  const label = propText(p.label, 'Label')
  const common = {
    size: 'small' as const,
    label,
    placeholder: propText(p.placeholder),
  }

  if (scope === null || name === '') return <TextField {...common} {...attrs} />

  return (
    <TextField
      {...common}
      {...attrs}
      name={name}
      value={scope.values[name] ?? ''}
      disabled={scope.sending}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        scope.set(name, e.target.value)
      }}
    />
  )
}
