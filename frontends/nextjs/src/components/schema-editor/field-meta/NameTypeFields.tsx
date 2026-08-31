'use client'

import { TextField, Select } from '@/m3'
import type { FieldSchema, FieldType } from '../schema-types'
import { FIELD_TYPES, FIELD_TYPE_LABELS } from '../schema-types'
import styles from '../AddFieldDialog.module.scss'

export interface NameTypeFieldsProps {
  field: FieldSchema
  patch: (u: Partial<FieldSchema>) => void
}

export function NameTypeFields({ field, patch }: NameTypeFieldsProps) {
  return (
    <div className={styles.row}>
      <div className={styles.fullRow}>
        <div className={styles.label}>Field Name *</div>
        <TextField
          size="small"
          value={field.name}
          onChange={e => {
            patch({ name: e.target.value })
          }}
          placeholder="e.g. email"
        />
      </div>
      <div className={styles.fullRow}>
        <div className={styles.label}>Type</div>
        <Select
          native
          size="small"
          value={field.type}
          onChange={e => {
            patch({ type: e.target.value as FieldType })
          }}
        >
          {FIELD_TYPES.map(t => (
            <option key={t} value={t}>
              {FIELD_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
