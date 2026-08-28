'use client'

import { useState } from 'react'
import { TextField, Button, IconButton } from '@/m3'
import type { SelectChoice } from './schema-types'
import styles from './AddFieldDialog.module.scss'

interface ChoicesEditorProps {
  choices: SelectChoice[]
  onChange: (choices: SelectChoice[]) => void
}

export function ChoicesEditor({ choices, onChange }: ChoicesEditorProps) {
  const [newChoice, setNewChoice] = useState('')

  function handleAdd() {
    const v = newChoice.trim()
    if (v === '') return
    onChange([...choices, { value: v, label: v }])
    setNewChoice('')
  }

  function handleUpdate(index: number, label: string) {
    onChange(choices.map((c, i) => (i === index ? { value: label, label } : c)))
  }

  function handleRemove(index: number) {
    onChange(choices.filter((_, i) => i !== index))
  }

  return (
    <div className={styles.choicesSection}>
      <div className={styles.label}>Choices</div>
      {choices.map((c, i) => (
        <div key={i} className={styles.choiceRow}>
          <TextField
            size="small"
            value={c.label}
            onChange={e => {
              handleUpdate(i, e.target.value)
            }}
          />
          <IconButton
            size="small"
            aria-label="Remove choice"
            onClick={() => {
              handleRemove(i)
            }}
          >
            ×
          </IconButton>
        </div>
      ))}
      <div className={`${styles.choiceRow} ${styles.choiceAdd}`}>
        <TextField
          size="small"
          value={newChoice}
          onChange={e => {
            setNewChoice(e.target.value)
          }}
          placeholder="Add choice…"
          onKeyDown={e => {
            if (e.key === 'Enter') handleAdd()
          }}
        />
        <Button size="small" variant="outlined" onClick={handleAdd}>
          Add
        </Button>
      </div>
    </div>
  )
}
