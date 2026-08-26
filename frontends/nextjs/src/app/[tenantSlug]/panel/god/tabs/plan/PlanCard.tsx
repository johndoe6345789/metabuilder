import type { Task } from './plan-types'
import s from './PlanTab.module.scss'

interface PlanCardProps {
  task: Task
  dragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onDrop: () => void
  onOpen: () => void
  onRemove: () => void
}

export function PlanCard(props: PlanCardProps) {
  const { task, dragging } = props
  return (
    <article
      className={`${s.card} ${dragging ? s.dragging : ''}`}
      draggable
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
      onDragOver={event => {
        event.preventDefault()
      }}
      onDrop={event => {
        event.stopPropagation()
        props.onDrop()
      }}
    >
      <button type="button" className={s.cardMain} onClick={props.onOpen}>
        <span className={`${s.priority} ${s[task.priority ?? 'medium']}`} />
        <strong>{task.title}</strong>
        {task.description != null && task.description.length > 0 && (
          <span className={s.description}>{task.description}</span>
        )}
        {(task.labels ?? []).length > 0 && (
          <span className={s.labels}>
            {(task.labels ?? []).map(label => (
              <span key={label}>{label}</span>
            ))}
          </span>
        )}
      </button>
      <button
        type="button"
        title="Delete card"
        className={s.delete}
        onClick={props.onRemove}
      >
        x
      </button>
    </article>
  )
}
