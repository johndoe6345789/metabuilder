import { useState } from 'react'
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

  // Resets the draft from `initial` whenever the dialog opens, or a
  // different field to edit is picked while it's already open. Adjusted
  // during render (the documented React pattern for state that tracks
  // props) instead of an effect.
  const [prevKey, setPrevKey] = useState({ open, initial })
  if (prevKey.open !== open || prevKey.initial !== initial) {
    setPrevKey({ open, initial })
    if (open) {
      setField(initial ?? BLANK)
      setChoices(initial?.choices ?? [])
    }
  }

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
