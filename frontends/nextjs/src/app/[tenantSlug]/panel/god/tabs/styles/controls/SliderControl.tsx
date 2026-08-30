'use client'

import type { ReactNode } from 'react'
import { Slider } from '@/m3'
import type { StyleControl } from '../style-controls'
import { ControlHeader } from './ControlHeader'
import { numericValue } from './numeric-value'
import s from '../CssClassesTab.module.scss'

export interface SliderControlProps {
  control: Extract<StyleControl, { kind: 'size' }>
  value: string | undefined
  hint: ReactNode
  onSet: (prop: string, value: string) => void
  onClear: (prop: string) => void
}

export function SliderControl(props: SliderControlProps) {
  const { control } = props
  const isSet = props.value !== undefined && props.value !== ''

  return (
    <div className={s.ctrl}>
      <ControlHeader
        label={control.label}
        isSet={isSet}
        currentValue={props.value}
        onClear={() => {
          props.onClear(control.prop)
        }}
      />
      <Slider
        size="small"
        min={control.min}
        max={control.max}
        step={control.step}
        value={numericValue(props.value, control.min)}
        onChange={(_event, next) => {
          props.onSet(control.prop, `${next}${control.unit}`)
        }}
      />
      {props.hint}
    </div>
  )
}
