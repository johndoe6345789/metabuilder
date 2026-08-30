'use client'

/** One named style control -- writes a CSS declaration, or clears it. */

import type { StyleControl } from './style-controls'
import { ChoiceControl } from './controls/ChoiceControl'
import { ColorControl } from './controls/ColorControl'
import { ControlHeader } from './controls/ControlHeader'
import { controlHint } from './controls/control-hint'
import { SliderControl } from './controls/SliderControl'
import { ToggleControl } from './controls/ToggleControl'

type Props = {
  control: StyleControl
  value: string | undefined
  onSet: (prop: string, value: string) => void
  onClear: (prop: string) => void
}

export function StyleControlField({ control, value, onSet, onClear }: Props) {
  const isSet = value !== undefined && value !== ''
  const hint = controlHint(control)

  if (control.kind === 'choice') {
    return (
      <ChoiceControl
        control={control}
        value={value}
        hint={hint}
        onSet={onSet}
        onClear={onClear}
      />
    )
  }

  if (control.kind === 'color') {
    return (
      <ColorControl
        control={control}
        value={value}
        header={
          <ControlHeader
            label={control.label}
            isSet={isSet}
            onClear={() => {
              onClear(control.prop)
            }}
          />
        }
        hint={hint}
        onSet={onSet}
      />
    )
  }

  if (control.kind === 'toggle') {
    return (
      <ToggleControl
        control={control}
        value={value}
        hint={hint}
        onSet={onSet}
        onClear={onClear}
      />
    )
  }

  return (
    <SliderControl
      control={control}
      value={value}
      hint={hint}
      onSet={onSet}
      onClear={onClear}
    />
  )
}
