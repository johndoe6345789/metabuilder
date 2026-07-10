'use client'

import { Button, TextField } from '@/m3'
import s from './ComponentTreeTab.module.scss'

type Props = {
  direction: string | undefined
  gap: string
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreeContainerProps({
  direction,
  gap,
  onChange,
}: Props) {
  return (
    <div className={s.propRow}>
      <Button
        size="small"
        variant={direction === 'row' ? 'contained' : 'outlined'}
        onClick={() => {
          onChange({ direction: 'row' })
        }}
      >
        Row
      </Button>
      <Button
        size="small"
        variant={direction !== 'row' ? 'contained' : 'outlined'}
        onClick={() => {
          onChange({ direction: 'column' })
        }}
      >
        Column
      </Button>
      <TextField
        size="small"
        label="Gap"
        value={gap}
        onChange={event => {
          onChange({ gap: Number(event.target.value) || 0 })
        }}
      />
    </div>
  )
}
