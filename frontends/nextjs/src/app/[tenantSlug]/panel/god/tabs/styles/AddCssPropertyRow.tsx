'use client'

import { useState } from 'react'
import { Button, TextField } from '@/m3'
import s from './CssClassesTab.module.scss'

export interface AddCssPropertyRowProps {
  onSet: (prop: string, value: string) => void
}

export function AddCssPropertyRow({ onSet }: AddCssPropertyRowProps) {
  const [key, setKey] = useState('')
  const [val, setVal] = useState('')

  return (
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
  )
}
