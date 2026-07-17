'use client'

import { IconButton, Tooltip } from '@/m3'
import type { FieldSchema } from './schema-types'
import { FIELD_TYPE_LABELS } from './schema-types'
import styles from './FieldRow.module.scss'

interface FieldRowProps {
  field: FieldSchema
  onEdit: (field: FieldSchema) => void
  onDelete: (name: string) => void
}

export function FieldRow({ field, onEdit, onDelete }: FieldRowProps) {
  const typeLabel = FIELD_TYPE_LABELS[field.type] ?? field.type

  return (
    <div className={styles.row}>
      <span className={styles.name}>{field.name}</span>

      <span className={styles.type}>{typeLabel}</span>

      <Tooltip title="Required">
        <span
          className={`${styles.toggle} ${
            field.required ? styles.toggleOn : styles.toggleOff
          }`}
        >
          R
        </span>
      </Tooltip>

      <Tooltip title="Unique">
        <span
          className={`${styles.toggle} ${
            field.unique ? styles.toggleOn : styles.toggleOff
          }`}
        >
          U
        </span>
      </Tooltip>

      <span className={styles.default}>{field.default ?? ''}</span>

      <div className={styles.actions}>
        <IconButton
          size="small"
          aria-label={`Edit field ${field.name}`}
          onClick={() => { onEdit(field) }}
        >
          ✎
        </IconButton>
        <IconButton
          size="small"
          aria-label={`Delete field ${field.name}`}
          onClick={() => { onDelete(field.name) }}
        >
          ×
        </IconButton>
      </div>
    </div>
  )
}
