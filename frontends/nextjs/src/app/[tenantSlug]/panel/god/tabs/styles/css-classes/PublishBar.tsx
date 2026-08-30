'use client'

import { Button } from '@/m3'
import s from '../CssClassesTab.module.scss'

export interface PublishBarProps {
  dirty: boolean
  publishing: boolean
  onPublish: () => void
}

export function PublishBar({ dirty, publishing, onPublish }: PublishBarProps) {
  return (
    <div className={s.publishBar}>
      {dirty ? <span className={s.dot} /> : null}
      <span className={`${s.status} ${dirty ? '' : s.clean}`}>
        {dirty ? 'Staged changes — not yet published' : 'Published — up to date'}
      </span>
      <span className={s.spacer} />
      <Button
        variant="contained"
        size="small"
        disabled={!dirty || publishing}
        onClick={onPublish}
      >
        {publishing ? 'Publishing…' : '⇧ Publish'}
      </Button>
    </div>
  )
}
