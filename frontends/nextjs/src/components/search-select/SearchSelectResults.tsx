'use client'

import { Typography } from '@/m3'
import type { SearchSelectItem } from './search-select-types'
import s from './SearchSelect.module.scss'

export interface SearchSelectResultsProps {
  loading: boolean
  results: SearchSelectItem[]
  highlighted: number
  onHighlight: (index: number) => void
  onChoose: (item: SearchSelectItem) => void
}

export function SearchSelectResults({
  loading,
  results,
  highlighted,
  onHighlight,
  onChoose,
}: SearchSelectResultsProps) {
  return (
    <div className={s.panel}>
      {loading && (
        <Typography variant="body2" color="text.secondary" className={s.status}>
          Searching…
        </Typography>
      )}
      {!loading && results.length === 0 && (
        <Typography variant="body2" color="text.secondary" className={s.status}>
          No matches
        </Typography>
      )}
      {!loading &&
        results.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`${s.item} ${index === highlighted ? s.itemHighlighted : ''}`}
            onMouseEnter={() => {
              onHighlight(index)
            }}
            onClick={() => {
              onChoose(item)
            }}
          >
            {item.label}
          </button>
        ))}
    </div>
  )
}
