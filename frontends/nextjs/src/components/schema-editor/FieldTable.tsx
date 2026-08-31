'use client'

import { FieldRow } from './FieldRow'
import type { useFieldEditor } from './useFieldEditor'
import styles from './FieldEditor.module.scss'

export interface FieldTableProps {
  ed: ReturnType<typeof useFieldEditor>
}

export function FieldTable({ ed }: FieldTableProps) {
  return (
    <>
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
    </>
  )
}
