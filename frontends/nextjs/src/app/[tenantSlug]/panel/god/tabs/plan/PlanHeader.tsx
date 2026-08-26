import { Typography } from '@/m3'
import s from './PlanTab.module.scss'

export function PlanHeader({ count }: { count: number }) {
  return (
    <header className={s.header}>
      <div>
        <Typography variant="h6">Plan</Typography>
        <p>
          Drag cards across lists, open a card to add detail, and keep the build
          moving like a Trello board.
        </p>
      </div>
      <span className={s.total}>{count} cards</span>
    </header>
  )
}
