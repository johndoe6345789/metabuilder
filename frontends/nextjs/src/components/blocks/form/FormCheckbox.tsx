'use client'

import { useEffect, useState } from 'react'
import { Checkbox, Switch } from '@/m3'

import { propText } from '../block-coerce'
import { withOwnClass, type BlockAttrs } from '../common-attrs'
import { useFormScope } from './form-context'

const ROW = { display: 'inline-flex', alignItems: 'center', gap: 6 } as const

/**
 * A checkbox or switch that carries what the visitor chose.
 *
 * Both blocks rendered a bare control with no `name` and never touched the
 * form scope, so a founder could add "I agree to be contacted", a visitor
 * could tick it, and the answer went nowhere -- the row arrived without
 * it. Outside a Form, or without a name, it stays what it was:
 * uncontrolled and decorative, same contract as the text field.
 *
 * "no" is recorded as soon as it mounts, not only on change: an unticked
 * box is an answer, and a workflow reading ${event.data.agreed} has to be
 * able to tell "left unticked" from "not on this form".
 */
export function FormCheckbox({
  p,
  control,
  ...attrs
}: { p: Record<string, unknown>; control: 'checkbox' | 'switch' } & BlockAttrs) {
  const scope = useFormScope()
  const name = propText(p.name)
  const label = propText(p.label, control === 'switch' ? 'Switch' : 'Checkbox')
  // The scope this answer is collected into, or null when it is not: one
  // value to narrow on, rather than a boolean TypeScript cannot follow.
  const live = scope !== null && name !== '' ? scope : null
  const [checked, setChecked] = useState(false)
  const Control = control === 'switch' ? Switch : Checkbox

  const register = live?.set ?? null
  useEffect(() => {
    if (register !== null) register(name, 'no')
  }, [register, name])

  const attrsWithClass = withOwnClass('', attrs)
  return (
    <label style={ROW} {...attrsWithClass}>
      {live !== null ? (
        <Control
          checked={checked}
          disabled={live.sending}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setChecked(e.target.checked)
            live.set(name, e.target.checked ? 'yes' : 'no')
          }}
        />
      ) : (
        <Control />
      )}
      {label}
    </label>
  )
}
