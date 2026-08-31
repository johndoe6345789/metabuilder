'use client'

import { Typography } from '@/m3'
import type { ModelSchema } from './schema-types'
import { AddFieldDialog } from './AddFieldDialog'
import { useFieldEditor } from './useFieldEditor'
import { FieldEditorToolbar } from './FieldEditorToolbar'
import { FieldTable } from './FieldTable'
import styles from './FieldEditor.module.scss'

interface FieldEditorProps {
  model: ModelSchema
  allModelNames: string[]
  onSave: (updated: ModelSchema) => void
}

export function FieldEditor({
  model,
  allModelNames,
  onSave,
}: FieldEditorProps) {
  const ed = useFieldEditor(model, onSave)
  const otherModels = allModelNames.filter(n => n !== model.name)

  return (
    <div className={styles.root}>
      <FieldEditorToolbar ed={ed} />
      <FieldTable ed={ed} />

      <AddFieldDialog
        open={ed.dialogOpen}
        initial={ed.editingField}
        modelNames={otherModels}
        onSave={ed.saveField}
        onClose={ed.closeDialog}
      />
    </div>
  )
}

export function FieldEditorPlaceholder() {
  return (
    <div className={styles.placeholder}>
      <Typography variant="body2">
        Select a model from the list to edit it.
      </Typography>
    </div>
  )
}
