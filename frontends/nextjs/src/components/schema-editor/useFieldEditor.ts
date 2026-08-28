'use client'

import { useState } from 'react'
import type { ModelSchema, FieldSchema } from './schema-types'

interface UseFieldEditorResult {
  name: string
  setName: (v: string) => void
  label: string
  setLabel: (v: string) => void
  fields: FieldSchema[]
  dialogOpen: boolean
  editingField: FieldSchema | null
  openAdd: () => void
  openEdit: (f: FieldSchema) => void
  closeDialog: () => void
  saveField: (f: FieldSchema) => void
  deleteField: (name: string) => void
  save: () => void
}

export function useFieldEditor(
  model: ModelSchema,
  onSave: (m: ModelSchema) => void
): UseFieldEditorResult {
  const [name, setName] = useState(model.name)
  const [label, setLabel] = useState(model.label ?? '')
  const [fields, setFields] = useState<FieldSchema[]>(model.fields)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<FieldSchema | null>(null)

  function openAdd() {
    setEditingField(null)
    setDialogOpen(true)
  }

  function openEdit(f: FieldSchema) {
    setEditingField(f)
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
  }

  function saveField(f: FieldSchema) {
    setFields(prev => {
      if (editingField !== null) {
        return prev.map(x => (x.name === editingField.name ? f : x))
      }
      return [...prev, f]
    })
    setDialogOpen(false)
  }

  function deleteField(fieldName: string) {
    setFields(prev => prev.filter(f => f.name !== fieldName))
  }

  function save() {
    onSave({ ...model, name, label, fields })
  }

  return {
    name,
    setName,
    label,
    setLabel,
    fields,
    dialogOpen,
    editingField,
    openAdd,
    openEdit,
    closeDialog,
    saveField,
    deleteField,
    save,
  }
}
