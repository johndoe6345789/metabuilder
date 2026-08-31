'use client'

import { useState } from 'react'
import { TextField, Typography } from '@/m3'
import type { CssClass } from '../styles/use-css-classes'
import { ClassChip } from './ClassChip'
import s from './ComponentTreeTab.module.scss'

export interface ClassChipListProps {
  classes: CssClass[]
  applied: string[]
  onToggle: (name: string) => void
}

/** The searchable chip grid, or the empty hint when the tenant has not
 *  defined any classes yet. */
export function ClassChipList({
  classes,
  applied,
  onToggle,
}: ClassChipListProps) {
  const [query, setQuery] = useState('')

  if (classes.length === 0) {
    return (
      <Typography variant="caption" className={s.propHint}>
        No classes defined yet.
      </Typography>
    )
  }

  return (
    <>
      {/* Worth a filter once the list is longer than a glance. Applied
          classes are never filtered out, so searching cannot hide what is
          already on the node. */}
      {classes.length > 8 && (
        <TextField
          size="small"
          fullWidth
          label="Find a style"
          value={query}
          onChange={event => {
            setQuery(event.target.value)
          }}
        />
      )}
      <div className={s.classChips}>
        {classes
          .filter(
            css =>
              applied.includes(css.name) ||
              css.name.toLowerCase().includes(query.trim().toLowerCase())
          )
          .map(css => (
            <ClassChip
              key={css.id}
              css={css}
              on={applied.includes(css.name)}
              onToggle={onToggle}
            />
          ))}
      </div>
    </>
  )
}
