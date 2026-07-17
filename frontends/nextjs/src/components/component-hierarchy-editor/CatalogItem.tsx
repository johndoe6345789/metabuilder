'use client'

import { Typography } from '@/m3'
import type { ComponentDef } from './types'
import s from './CatalogItem.module.scss'

type Props = {
  def: ComponentDef
  onClick: () => void
}

export function CatalogItem({ def, onClick }: Props) {
  return (
    <button
      type="button"
      className={s.item}
      onClick={onClick}
      title={
        def.allowsChildren ? 'Can contain children' : undefined
      }
    >
      <span className={s.icon}>⊞</span>
      <div className={s.text}>
        <Typography variant="body2" className={s.name}>
          {def.type}
        </Typography>
        {def.allowsChildren && (
          <Typography variant="caption" color="text.secondary">
            container
          </Typography>
        )}
      </div>
      <span className={s.plus}>+</span>
    </button>
  )
}
