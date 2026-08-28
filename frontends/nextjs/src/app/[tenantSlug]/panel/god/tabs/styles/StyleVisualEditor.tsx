'use client'

/**
 * The style editor: named controls grouped by what they affect, with the raw
 * CSS kept behind an "Advanced" disclosure rather than being the only way in.
 */

import { useState } from 'react'
import { Button, TextField, Typography } from '@/m3'
import { StyleControlField } from './StyleControlField'
import { MANAGED_PROPS, STYLE_GROUPS } from './style-controls'
import s from './CssClassesTab.module.scss'

type Props = {
  props: Record<string, string>
  onSet: (prop: string, value: string) => void
  onClear: (prop: string) => void
}

export function StyleVisualEditor({ props, onSet, onClear }: Props) {
  const [open, setOpen] = useState<string | null>('text')
  const [advanced, setAdvanced] = useState(false)
  const [key, setKey] = useState('')
  const [val, setVal] = useState('')

  // Anything hand-written that no control owns -- kept visible so the
  // Advanced editor never silently hides part of a style.
  const extra = Object.entries(props).filter(([k]) => !MANAGED_PROPS.has(k))

  return (
    <div className={s.groups}>
      {STYLE_GROUPS.map(group => {
        const isOpen = open === group.id
        const setCount = group.controls.filter(
          c => props[c.prop] !== undefined && props[c.prop] !== ''
        ).length
        return (
          <div key={group.id} className={s.group}>
            <button
              type="button"
              className={s.groupHead}
              aria-expanded={isOpen}
              onClick={() => {
                setOpen(isOpen ? null : group.id)
              }}
            >
              <span
                className={`material-symbols-rounded ${s.groupTwist} ${
                  isOpen ? s.groupTwistOpen : ''
                }`}
                aria-hidden="true"
              >
                chevron_right
              </span>
              <span className="material-symbols-rounded" aria-hidden="true">
                {group.icon}
              </span>
              {group.label}
              {setCount > 0 && <span className={s.groupCount}>{setCount}</span>}
            </button>
            {isOpen && (
              <div className={s.groupBody}>
                {group.controls.map(control => (
                  <StyleControlField
                    key={control.prop}
                    control={control}
                    value={props[control.prop]}
                    onSet={onSet}
                    onClear={onClear}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className={s.group}>
        <button
          type="button"
          className={s.groupHead}
          aria-expanded={advanced}
          onClick={() => {
            setAdvanced(open => !open)
          }}
        >
          <span
            className={`material-symbols-rounded ${s.groupTwist} ${
              advanced ? s.groupTwistOpen : ''
            }`}
            aria-hidden="true"
          >
            chevron_right
          </span>
          <span className="material-symbols-rounded" aria-hidden="true">
            code
          </span>
          Advanced CSS
          {extra.length > 0 && (
            <span className={s.groupCount}>{extra.length}</span>
          )}
        </button>
        {advanced && (
          <div className={s.groupBody}>
            <Typography variant="caption" className={s.ctrlHint}>
              For anything the controls above do not cover. Written exactly as
              CSS.
            </Typography>
            {extra.map(([k, v]) => (
              <div key={k} className={s.propRow}>
                <span className={s.propKey}>{k}</span>
                <TextField
                  size="small"
                  value={v}
                  onChange={event => {
                    onSet(k, event.target.value)
                  }}
                />
                <button
                  className={s.del}
                  onClick={() => {
                    onClear(k)
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            <div className={s.addProp}>
              <TextField
                size="small"
                label="property"
                placeholder="letter-spacing"
                value={key}
                onChange={event => {
                  setKey(event.target.value)
                }}
              />
              <TextField
                size="small"
                label="value"
                placeholder="0.04em"
                value={val}
                onChange={event => {
                  setVal(event.target.value)
                }}
              />
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  if (key.trim() === '') return
                  onSet(key.trim(), val)
                  setKey('')
                  setVal('')
                }}
              >
                Add
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
