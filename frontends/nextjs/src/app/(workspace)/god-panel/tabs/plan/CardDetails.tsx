import { TextField, Typography } from '@/m3'
import { COLUMNS, PRIORITIES } from './plan-data'
import { PlanSelectField } from './PlanSelectField'
import type { Priority, Status, Task } from './plan-types'
import s from './PlanTab.module.scss'

interface CardDetailsProps {
  task: Task
  onClose: () => void
  onChange: (patch: Partial<Task>) => void
}

export function CardDetails({ task, onClose, onChange }: CardDetailsProps) {
  return (
    <aside className={s.details} aria-label="Card details">
      <div className={s.detailsHead}>
        <div>
          <span className={s.eyebrow}>Selected card</span>
          <Typography variant="subtitle1">Card details</Typography>
        </div>
        <button type="button" onClick={onClose} aria-label="Close details">
          <span className="material-symbols-rounded" aria-hidden="true">close</span>
        </button>
      </div>

      <TextField
        size="small"
        label="Title"
        value={task.title}
        onChange={event => {
          onChange({ title: event.target.value })
        }}
      />
      <TextField
        size="small"
        label="Description"
        value={task.description ?? ''}
        multiline
        onChange={event => {
          onChange({ description: event.target.value })
        }}
      />
      <PlanSelectField
        label="Status"
        value={task.status}
        values={COLUMNS.map(col => [col.status, col.label])}
        onChange={value => {
          onChange({ status: value as Status })
        }}
      />
      <PlanSelectField
        label="Priority"
        value={task.priority ?? 'medium'}
        values={PRIORITIES.map(priority => [priority, priority])}
        onChange={value => {
          onChange({ priority: value as Priority })
        }}
      />
      <TextField
        size="small"
        label="Labels"
        value={(task.labels ?? []).join(', ')}
        helperText="Comma separated"
        onChange={event => {
          onChange({ labels: parseLabels(event.target.value) })
        }}
      />
    </aside>
  )
}

function parseLabels(value: string) {
  return value
    .split(',')
    .map(label => label.trim())
    .filter(Boolean)
}
