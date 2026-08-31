'use client'

import { Select } from '@/m3'
import styles from './AddFieldDialog.module.scss'

export interface RelatedModelSelectProps {
  value: string | undefined
  modelNames: string[]
  onChange: (relatedModel: string) => void
}

export function RelatedModelSelect({
  value,
  modelNames,
  onChange,
}: RelatedModelSelectProps) {
  return (
    <div className={styles.fullRow}>
      <div className={styles.label}>Related Model</div>
      <Select
        native
        size="small"
        value={value ?? ''}
        onChange={e => {
          onChange(e.target.value as string)
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
  )
}
