import { Button, TextField } from '@/m3'
import type { ColumnDef, Status } from './plan-types'
import s from './PlanTab.module.scss'

interface PlanComposerProps {
  column: ColumnDef
  draft: string
  onSetDraft: (status: Status, value: string) => void
  onAdd: (status: Status) => void
}

export function PlanComposer(props: PlanComposerProps) {
  const { column } = props
  return (
    <div className={s.composer}>
      <TextField
        size="small"
        label={`Add to ${column.label}`}
        value={props.draft}
        onChange={event => {
          props.onSetDraft(column.status, event.target.value)
        }}
        onKeyDown={event => {
          if (event.key === 'Enter') props.onAdd(column.status)
        }}
      />
      <Button
        variant="contained"
        size="small"
        onClick={() => {
          props.onAdd(column.status)
        }}
      >
        Add card
      </Button>
    </div>
  )
}
