import { Button, Typography } from '@/m3'
import s from './PlanTab.module.scss'

interface PlanHeaderProps {
  count: number
  onAdd: () => void
}

export function PlanHeader({ count, onAdd }: PlanHeaderProps) {
  return (
    <header className={s.header}>
      <div>
        <Typography variant="h6">Plan</Typography>
        <p>
          Drag cards across lists, open a card to add detail, and keep the build
          moving like a Trello board.
        </p>
      </div>
      <div className={s.headerActions}>
        <span className={s.total}>{count} cards</span>
        <Button variant="contained" size="small" onClick={onAdd}>
          New card
        </Button>
      </div>
    </header>
  )
}
