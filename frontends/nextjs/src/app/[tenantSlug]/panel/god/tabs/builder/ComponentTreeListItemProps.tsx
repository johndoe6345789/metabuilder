'use client'

import { TextField } from '@/m3'
import s from './ComponentTreeTab.module.scss'

type Props = {
  icon: string
  title: string
  description: string
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreeListItemProps({
  icon,
  title,
  description,
  onChange,
}: Props) {
  return (
    <div className={s.propCol}>
      <TextField
        size="small"
        fullWidth
        label="Icon (material symbol name)"
        placeholder="notifications"
        value={icon}
        onChange={event => {
          onChange({ icon: event.target.value })
        }}
      />
      <TextField
        size="small"
        fullWidth
        label="Title"
        value={title}
        onChange={event => {
          onChange({ title: event.target.value })
        }}
      />
      <TextField
        size="small"
        fullWidth
        label="Description"
        value={description}
        onChange={event => {
          onChange({ description: event.target.value })
        }}
      />
    </div>
  )
}
