'use client'

import type { WorkflowEntry } from '@/store/slices/god-slice/workflow-entry'
import s from '../WorkflowsTab.module.scss'

interface Props {
  entries: WorkflowEntry[]
  selectedId: string
  onSelect: (id: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
}

/**
 * Which of a tenant's workflows is being edited.
 *
 * There used to be exactly one, published under a fixed id, so a page
 * naming a workflow had nothing to choose between.
 */
export function WorkflowPicker({
  entries,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
}: Props) {
  return (
    <div className={s.picker}>
      <label className={s.pickerLabel} htmlFor="workflow-picker">
        Workflow
      </label>
      <select
        id="workflow-picker"
        className={s.pickerSelect}
        value={selectedId}
        onChange={e => {
          onSelect(e.target.value)
        }}
      >
        {entries.map(e => (
          <option key={e.workflow.id} value={e.workflow.id}>
            {e.workflow.name}
          </option>
        ))}
      </select>
      <button type="button" className={s.pickerButton} onClick={onAdd}>
        + New
      </button>
      {entries.length > 1 && (
        <button
          type="button"
          className={s.pickerButton}
          aria-label={`Remove ${entries.find(e => e.workflow.id === selectedId)?.workflow.name ?? ''}`}
          onClick={() => {
            onRemove(selectedId)
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
