'use client'

import { SearchSelect } from '@/components/search-select/SearchSelect'
import { Typography } from '@/m3'
import type { CssClass } from '../styles/use-css-classes'
import { ClassChip } from './ClassChip'
import s from './ComponentTreeTab.module.scss'

export interface ClassChipListProps {
  classes: CssClass[]
  applied: string[]
  tenant: string
  onToggle: (name: string) => void
}

const SEARCH_THRESHOLD = 8

/** The class picker: every class as a toggle chip while the list is short
 *  enough to scan at a glance, or -- once a tenant has defined enough that
 *  it no longer is -- a search dropdown backed by DBAL's Elasticsearch-
 *  mirrored `_search` endpoint. Whatever is already on the node stays
 *  visible as a removable chip either way, regardless of how the rest are
 *  found, so search can't hide a class the node already has. */
export function ClassChipList({
  classes,
  applied,
  tenant,
  onToggle,
}: ClassChipListProps) {
  if (classes.length === 0) {
    return (
      <Typography variant="caption" className={s.propHint}>
        No classes defined yet.
      </Typography>
    )
  }

  if (classes.length <= SEARCH_THRESHOLD) {
    return (
      <div className={s.classChips}>
        {classes.map(css => (
          <ClassChip
            key={css.id}
            css={css}
            on={applied.includes(css.name)}
            onToggle={onToggle}
          />
        ))}
      </div>
    )
  }

  const appliedClasses = classes.filter(css => applied.includes(css.name))

  return (
    <>
      {appliedClasses.length > 0 && (
        <div className={s.classChips}>
          {appliedClasses.map(css => (
            <ClassChip key={css.id} css={css} on onToggle={onToggle} />
          ))}
        </div>
      )}
      <SearchSelect
        tenant={tenant}
        packageName="core"
        entity="StyleRule"
        placeholder="Find a style to add…"
        getLabel={row => (typeof row.name === 'string' ? row.name : '')}
        onSelect={item => {
          if (!applied.includes(item.label)) onToggle(item.label)
        }}
      />
    </>
  )
}
