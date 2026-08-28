'use client'

import { TextField, Select, Switch } from '@/m3'
import type { FieldSchema, FieldType } from './schema-types'
import { FIELD_TYPES, FIELD_TYPE_LABELS } from './schema-types'
import styles from './AddFieldDialog.module.scss'

interface FieldMetaInputsProps {
  field: FieldSchema
  patch: (u: Partial<FieldSchema>) => void
}

export function FieldMetaInputs({ field, patch }: FieldMetaInputsProps) {
  return (
    <>
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
      <div className={styles.row}>
        <div className={styles.fullRow}>
          <div className={styles.label}>Label</div>
          <TextField
            size="small"
            value={field.label ?? ''}
            onChange={e => {
              patch({ label: e.target.value })
            }}
            placeholder="Display label"
          />
        </div>
        <div className={styles.fullRow}>
          <div className={styles.label}>Default Value</div>
          <TextField
            size="small"
            value={field.default ?? ''}
            onChange={e => {
              patch({ default: e.target.value })
            }}
            placeholder="Default"
          />
        </div>
      </div>
      <div className={styles.toggleRow}>
        <label className={styles.toggleItem}>
          <Switch
            checked={field.required ?? false}
            onChange={e => {
              patch({ required: e.target.checked })
            }}
          />
          Required
        </label>
        <label className={styles.toggleItem}>
          <Switch
            checked={field.unique ?? false}
            onChange={e => {
              patch({ unique: e.target.checked })
            }}
          />
          Unique
        </label>
      </div>
    </>
  )
}
