import { useState, useEffect } from 'react'
import type { FieldSchema, SelectChoice } from './schema-types'

const BLANK: FieldSchema = {
  name: '',
  type: 'string',
  label: '',
  required: false,
  unique: false,
  default: '',
}

/** Draft field + its select choices, reset from `initial` whenever the
 *  dialog opens, plus the patch/save operations the dialog renders. */
export function useAddField(
  open: boolean,
  initial: FieldSchema | null,
  onSave: (field: FieldSchema) => void
) {
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

  return { field, choices, setChoices, patch, handleSave }
}
