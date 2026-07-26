import { PlanCard } from './PlanCard'
import type { ColumnDef, Status, Task } from './plan-types'
import s from './PlanTab.module.scss'

interface PlanColumnProps {
  column: ColumnDef
  tasks: Task[]
  dragId: string | null
  onDropColumn: (status: Status) => void
  onDropCard: (task: Task) => void
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onOpen: (id: string) => void
  onRemove: (id: string) => void
}

export function PlanColumn(props: PlanColumnProps) {
  const { column, tasks } = props
  return (
    <section
      className={`${s.column} ${s[column.status]}`}
      onDragOver={event => {
        event.preventDefault()
      }}
      onDrop={() => {
        props.onDropColumn(column.status)
      }}
    >
      <div className={s.colHead}>
        <div>
          <span>{column.label}</span>
          <p>{column.hint}</p>
        </div>
        <span className={s.count}>{tasks.length}</span>
      </div>

      <div className={s.cards}>
        {tasks.length === 0 && (
          <div className={s.empty}>Drop a card here</div>
        )}
        {tasks.map(task => (
          <PlanCard
            key={task.id}
            task={task}
            dragging={props.dragId === task.id}
            onDragStart={() => {
              props.onDragStart(task.id)
            }}
            onDragEnd={props.onDragEnd}
            onDrop={() => {
              props.onDropCard(task)
            }}
            onOpen={() => {
              props.onOpen(task.id)
            }}
            onRemove={() => {
              props.onRemove(task.id)
            }}
          />
        ))}
      </div>
    </section>
  )
}
