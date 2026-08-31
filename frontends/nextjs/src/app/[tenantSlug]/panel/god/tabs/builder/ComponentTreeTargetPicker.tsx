'use client'

import { Button, TextField } from '@/m3'
import type { PublishTarget } from './component-tree-publish'
import type { PageConfigRow } from './use-page-configs'
import { RouteSelect } from './RouteSelect'
import { TargetLevelPicker } from './TargetLevelPicker'
import { TargetVisibilityPicker } from './TargetVisibilityPicker'
import s from './ComponentTreeTab.module.scss'

type Props = {
  target: PublishTarget
  onChange: (patch: Partial<PublishTarget>) => void
  onLoad: () => void
  loading: boolean
  /** Every PageConfig for the tenant; feeds both dropdowns. */
  pages: PageConfigRow[]
  /** Point the editor at a saved route, loading whatever it holds. */
  onPickRoute: (path: string) => void
}

export function ComponentTreeTargetPicker({
  target,
  onChange,
  onLoad,
  loading,
  pages,
  onPickRoute,
}: Props) {
  return (
    <div className={s.targetPicker}>
      <RouteSelect path={target.path} pages={pages} onPickRoute={onPickRoute} />

      <TextField
        size="small"
        label="Path"
        placeholder="/dashboard/community"
        value={target.path}
        onChange={event => {
          onChange({ path: event.target.value })
        }}
      />
      <TextField
        size="small"
        label="Title"
        value={target.title}
        onChange={event => {
          onChange({ title: event.target.value })
        }}
      />
      <Button
        size="small"
        variant="outlined"
        disabled={loading}
        onClick={onLoad}
      >
        {loading ? 'Loading…' : '↓ Load'}
      </Button>

      <TargetLevelPicker
        level={target.level}
        onChange={level => {
          onChange({ level })
        }}
      />

      <TargetVisibilityPicker
        requiresAuth={target.requiresAuth}
        onChange={requiresAuth => {
          onChange({ requiresAuth })
        }}
      />
    </div>
  )
}
