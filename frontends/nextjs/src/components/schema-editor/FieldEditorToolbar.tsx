'use client'

import { TextField, Button } from '@/m3'
import type { useFieldEditor } from './useFieldEditor'
import styles from './FieldEditor.module.scss'

export interface FieldEditorToolbarProps {
  ed: ReturnType<typeof useFieldEditor>
}

export function FieldEditorToolbar({ ed }: FieldEditorToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <TextField
        size="small"
        label="Model name"
        value={ed.name}
        onChange={e => {
          ed.setName(e.target.value)
        }}
        className={styles.nameInput}
      />
      <TextField
        size="small"
        label="Display label"
        value={ed.label}
        onChange={e => {
          ed.setLabel(e.target.value)
        }}
        className={styles.nameInput}
      />
      <div className={styles.spacer} />
      <Button variant="outlined" size="small" onClick={ed.openAdd}>
        + Add Field
      </Button>
      <Button variant="filled" size="small" onClick={ed.save}>
        Save Model
      </Button>
    </div>
  )
}
