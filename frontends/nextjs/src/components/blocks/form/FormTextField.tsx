'use client'

import { TextField } from '@/m3'

import { propText } from '../block-coerce'
import { useFormScope } from './form-context'

/**
 * A text field that carries what someone typed.
 *
 * Outside a Form, or without a `name`, it renders exactly as it always did
 * -- uncontrolled and decorative. That matters: the block predates forms
 * and is on published pages already, where turning it into a controlled
 * input with nowhere to send its value would be a regression.
 */
export function FormTextField({ p }: { p: Record<string, unknown> }) {
  const scope = useFormScope()
  const name = propText(p.name)
  const label = propText(p.label, 'Label')
  const common = {
    size: 'small' as const,
    label,
    placeholder: propText(p.placeholder),
  }

  if (scope === null || name === '') return <TextField {...common} />

  return (
    <TextField
      {...common}
      name={name}
      value={scope.values[name] ?? ''}
      disabled={scope.sending}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        scope.set(name, e.target.value)
      }}
    />
  )
}
