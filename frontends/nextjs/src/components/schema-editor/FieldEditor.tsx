'use client'

import { TextField, Button, Typography } from '@/m3'
import type { ModelSchema } from './schema-types'
import { FieldRow } from './FieldRow'
import { AddFieldDialog } from './AddFieldDialog'
import { useFieldEditor } from './useFieldEditor'
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

      <div className={styles.tableHead}>
        <span>Name</span>
        <span>Type</span>
        <span>R</span>
        <span>U</span>
        <span>Default</span>
        <span>Actions</span>
      </div>

      <div className={styles.tableWrap}>
        {ed.fields.length === 0 ? (
          <div className={styles.empty}>
            No fields yet — click &ldquo;+ Add Field&rdquo; to start.
          </div>
        ) : (
          ed.fields.map(f => (
            <FieldRow
              key={f.name}
              field={f}
              onEdit={ed.openEdit}
              onDelete={ed.deleteField}
            />
          ))
        )}
      </div>

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
