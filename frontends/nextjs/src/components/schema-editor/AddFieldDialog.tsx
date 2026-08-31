'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@/m3'
import type { FieldSchema } from './schema-types'
import { ChoicesEditor } from './ChoicesEditor'
import { FieldMetaInputs } from './FieldMetaInputs'
import { RelatedModelSelect } from './RelatedModelSelect'
import { useAddField } from './use-add-field'
import styles from './AddFieldDialog.module.scss'

interface AddFieldDialogProps {
  open: boolean
  initial: FieldSchema | null
  modelNames: string[]
  onSave: (field: FieldSchema) => void
  onClose: () => void
}

export function AddFieldDialog({
  open,
  initial,
  modelNames,
  onSave,
  onClose,
}: AddFieldDialogProps) {
  const { field, choices, setChoices, patch, handleSave } = useAddField(
    open,
    initial,
    onSave
  )

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
            <RelatedModelSelect
              value={field.relatedModel}
              modelNames={modelNames}
              onChange={relatedModel => {
                patch({ relatedModel })
              }}
            />
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
