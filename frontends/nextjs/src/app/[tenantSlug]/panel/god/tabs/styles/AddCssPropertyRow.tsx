'use client'

import { useId, useState } from 'react'
import { Button, TextField } from '@/m3'
import { CSS_PROPERTY_SUGGESTIONS } from './css-property-names'
import s from './CssClassesTab.module.scss'

export interface AddCssPropertyRowProps {
  onSet: (prop: string, value: string) => void
}

/**
 * A CSS property genuinely too rare to deserve its own visual control still
 * needs *some* way in -- this is that escape hatch. The property name is a
 * text box with a native browser suggestion list (a `<datalist>`, not a
 * custom picker) so setting one of the ~40 common properties it doesn't
 * already know is still usually a pick, not a spelling exercise, while a
 * genuinely custom name (a CSS variable, say) can still be typed freely.
 */
export function AddCssPropertyRow({ onSet }: AddCssPropertyRowProps) {
  const [key, setKey] = useState('')
  const [val, setVal] = useState('')
  const listId = useId()

  return (
    <div className={s.addProp}>
      <TextField
        size="small"
        label="property"
        placeholder="letter-spacing"
        value={key}
        list={listId}
        onChange={event => {
          setKey(event.target.value)
        }}
      />
      <datalist id={listId}>
        {CSS_PROPERTY_SUGGESTIONS.map(prop => (
          <option key={prop} value={prop} />
        ))}
      </datalist>
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
