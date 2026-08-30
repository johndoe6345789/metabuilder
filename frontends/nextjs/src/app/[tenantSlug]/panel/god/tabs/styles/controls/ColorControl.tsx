'use client'

import { useState, type ReactNode } from 'react'
import { ColorPicker } from '@/m3'
import {
  THEME_COLORS,
  themeColorValue,
  type StyleControl,
} from '../style-controls'
import { isThemedColor } from './color-value'
import s from '../CssClassesTab.module.scss'

export interface ColorControlProps {
  control: Extract<StyleControl, { kind: 'color' }>
  value: string | undefined
  header: ReactNode
  hint: ReactNode
  onSet: (prop: string, value: string) => void
}

/** Theme colours first; a hex picker only if none of them fit. */
export function ColorControl(props: ColorControlProps) {
  const { control, value } = props
  const themed = isThemedColor(value)
  const [custom, setCustom] = useState(value !== undefined && value !== '' && !themed)

  return (
    <div className={s.ctrl}>
      {props.header}
      <div className={s.swatches}>
        {THEME_COLORS.map(color => {
          const token = themeColorValue(color.token)
          return (
            <button
              key={color.token}
              type="button"
              title={color.label}
              aria-label={color.label}
              aria-pressed={value === token}
              className={`${s.swatch} ${value === token ? s.swatchOn : ''}`}
              style={{ background: token }}
              onClick={() => {
                setCustom(false)
                props.onSet(control.prop, token)
              }}
            />
          )
        })}
        <button
          type="button"
          className={`${s.swatchCustom} ${custom ? s.ctrlChoiceOn : ''}`}
          aria-pressed={custom}
          onClick={() => {
            setCustom(open => !open)
          }}
        >
          Custom…
        </button>
      </div>
      <div className={s.swatchNames}>
        {THEME_COLORS.map(color => (
          <span key={color.token} className={s.swatchName}>
            {color.label}
          </span>
        ))}
      </div>
      {custom && (
        <ColorPicker
          value={themed || value === undefined || value === '' ? '#000000' : value}
          onChange={next => {
            props.onSet(control.prop, next)
          }}
        />
      )}
      {props.hint}
    </div>
  )
}
