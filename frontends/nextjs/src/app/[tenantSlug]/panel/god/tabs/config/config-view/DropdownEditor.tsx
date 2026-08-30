'use client'

import { Button, TextField, Typography } from '@/m3'
import type { DropdownConfig } from '../use-dropdown-configs'
import s from '../ConfigTab.module.scss'

export interface DropdownEditorProps {
  selected: DropdownConfig | undefined
  optLabel: string
  optValue: string
  onRename: (name: string) => void
  onRemoveOption: (index: number) => void
  onOptLabelChange: (value: string) => void
  onOptValueChange: (value: string) => void
  onAddOption: () => void
}

/** The selected list's name and options, or a prompt when none is picked. */
export function DropdownEditor(props: DropdownEditorProps) {
  if (props.selected === undefined) {
    return (
      <Typography variant="body2" color="text.secondary">
        Create a list.
      </Typography>
    )
  }

  return (
    <>
      <TextField
        size="small"
        fullWidth
        label="List name"
        value={props.selected.name}
        onChange={e => {
          props.onRename(e.target.value)
        }}
      />
      <div className={s.head}>Options</div>
      {props.selected.options.map((o, i) => (
        <div key={i} className={s.optRow}>
          <span className={s.optLabel}>{o.label}</span>
          <span className={s.optValue}>{o.value}</span>
          <button
            className={s.del}
            onClick={() => {
              props.onRemoveOption(i)
            }}
          >
            ✕
          </button>
        </div>
      ))}
      <div className={s.addOpt}>
        <TextField
          size="small"
          label="Label"
          value={props.optLabel}
          onChange={e => {
            props.onOptLabelChange(e.target.value)
          }}
        />
        <TextField
          size="small"
          label="Value"
          value={props.optValue}
          onChange={e => {
            props.onOptValueChange(e.target.value)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') props.onAddOption()
          }}
        />
        <Button size="small" variant="outlined" onClick={props.onAddOption}>
          Add
        </Button>
      </div>
    </>
  )
}
