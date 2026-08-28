'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
} from '@/m3'
import type { FieldSchema, SelectChoice } from './schema-types'
import { ChoicesEditor } from './ChoicesEditor'
import { FieldMetaInputs } from './FieldMetaInputs'
import styles from './AddFieldDialog.module.scss'

interface AddFieldDialogProps {
  open: boolean
  initial: FieldSchema | null
  modelNames: string[]
  onSave: (field: FieldSchema) => void
  onClose: () => void
}

const BLANK: FieldSchema = {
  name: '',
  type: 'string',
  label: '',
  required: false,
  unique: false,
  default: '',
}

export function AddFieldDialog({
  open,
  initial,
  modelNames,
  onSave,
  onClose,
}: AddFieldDialogProps) {
  const [field, setField] = useState<FieldSchema>(BLANK)
  const [choices, setChoices] = useState<SelectChoice[]>([])

  useEffect(() => {
    if (open) {
      setField(initial ?? BLANK)
      setChoices(initial?.choices ?? [])
    }
  }, [open, initial])

  function patch(updates: Partial<FieldSchema>) {
    setField(prev => ({ ...prev, ...updates }))
  }

  function handleSave() {
    const name = field.name.trim()
    if (name === '') return
    onSave({
      ...field,
      name,
      choices: field.type === 'select' ? choices : undefined,
      relatedModel: field.type === 'relation' ? field.relatedModel : undefined,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initial !== null ? `Edit: ${initial.name}` : 'Add Field'}
      </DialogTitle>
      <DialogContent>
        <div className={styles.content}>
          <FieldMetaInputs field={field} patch={patch} />

          {field.type === 'select' && (
            <ChoicesEditor choices={choices} onChange={setChoices} />
          )}

          {field.type === 'relation' && (
            <div className={styles.fullRow}>
              <div className={styles.label}>Related Model</div>
              <Select
                native
                size="small"
                value={field.relatedModel ?? ''}
                onChange={e => {
                  patch({ relatedModel: e.target.value as string })
                }}
              >
                <option value="">-- select model --</option>
                {modelNames.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="filled"
          onClick={handleSave}
          disabled={field.name.trim() === ''}
        >
          {initial !== null ? 'Update Field' : 'Add Field'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
