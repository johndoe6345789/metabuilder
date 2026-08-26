'use client'

/**
 * One named style control. Each writes a single CSS declaration, and each
 * offers a "Default" escape so a style can say nothing about a property
 * rather than being forced to pick a value -- removing the declaration
 * entirely, which is what "leave it as it was" means in CSS.
 */

import { ColorPicker, Slider, Typography } from '@/m3'
import type { StyleControl } from './style-controls'
import s from './CssClassesTab.module.scss'

type Props = {
  control: StyleControl
  value: string | undefined
  onSet: (prop: string, value: string) => void
  onClear: (prop: string) => void
}

/** Strip the unit so a stored "12px" can drive a numeric slider. */
const num = (value: string | undefined, fallback: number): number => {
  if (value === undefined) return fallback
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

export function StyleControlField({ control, value, onSet, onClear }: Props) {
  const isSet = value !== undefined && value !== ''

  const header = (
    <div className={s.ctrlHead}>
      <span className={s.ctrlLabel}>{control.label}</span>
      {isSet && (
        <button
          type="button"
          className={s.ctrlClear}
          onClick={() => {
            onClear(control.prop)
          }}
        >
          Clear
        </button>
      )}
    </div>
  )

  const hint =
    control.hint !== undefined ? (
      <Typography variant="caption" className={s.ctrlHint}>
        {control.hint}
      </Typography>
    ) : null

  if (control.kind === 'choice') {
    return (
      <div className={s.ctrl}>
        {header}
        <div className={s.ctrlChoices}>
          {control.options.map(option => (
            <button
              key={option.value}
              type="button"
              aria-pressed={value === option.value}
              className={`${s.ctrlChoice} ${
                value === option.value ? s.ctrlChoiceOn : ''
              }`}
              onClick={() => {
                if (value === option.value) onClear(control.prop)
                else onSet(control.prop, option.value)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
        {hint}
      </div>
    )
  }

  if (control.kind === 'color') {
    return (
      <div className={s.ctrl}>
        {header}
        <ColorPicker
          value={isSet ? value : '#000000'}
          onChange={next => {
            onSet(control.prop, next)
          }}
        />
        {hint}
      </div>
    )
  }

  if (control.kind === 'toggle') {
    const on = value === control.on
    return (
      <div className={s.ctrl}>
        <label className={s.ctrlToggle}>
          <input
            type="checkbox"
            checked={on}
            onChange={event => {
              if (event.target.checked) onSet(control.prop, control.on)
              else onClear(control.prop)
            }}
          />
          <span>{control.label}</span>
        </label>
        {hint}
      </div>
    )
  }

  const current = num(value, control.min)
  return (
    <div className={s.ctrl}>
      <div className={s.ctrlHead}>
        <span className={s.ctrlLabel}>
          {control.label}
          {isSet && <span className={s.ctrlValue}>{value}</span>}
        </span>
        {isSet && (
          <button
            type="button"
            className={s.ctrlClear}
            onClick={() => {
              onClear(control.prop)
            }}
          >
            Clear
          </button>
        )}
      </div>
      <Slider
        size="small"
        min={control.min}
        max={control.max}
        step={control.step}
        value={current}
        onChange={(_event, next) => {
          onSet(control.prop, `${next}${control.unit}`)
        }}
      />
      {hint}
    </div>
  )
}
