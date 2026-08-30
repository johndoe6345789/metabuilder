'use client'

import { ComponentTreeTargetPicker } from '../ComponentTreeTargetPicker'
import type { PageConfigRow } from '../use-page-configs'
import type { PublishTarget } from '../component-tree-publish'
import { TreeSelect } from './TreeSelect'
import type { SavedTree } from '../workbench-derivations'
import s from '../ComponentTreeTab.module.scss'

export interface SetupPanelProps {
  open: boolean
  onToggle: () => void
  target: PublishTarget
  trees: SavedTree[]
  currentTree: string
  pages: PageConfigRow[]
  loading: boolean
  onBlank: () => void
  onPickTree: (path: string) => void
  onPickRoute: (path: string) => void
  onChange: (patch: Partial<PublishTarget>) => void
  onLoad: () => void
}

/** The collapsible route/tree setup, above the fold on narrow screens. */
export function SetupPanel(props: SetupPanelProps) {
  return (
    <>
      <button
        type="button"
        className={`${s.setupToggle} ${props.open ? s.setupToggleOpen : ''}`}
        aria-expanded={props.open}
        onClick={props.onToggle}
      >
        <span className="material-symbols-rounded" aria-hidden="true">
          chevron_right
        </span>
        Page setup — {props.target.path === '' ? 'no route' : props.target.path}
      </button>

      <div className={s.setup} data-open={props.open}>
        <TreeSelect
          trees={props.trees}
          currentValue={props.currentTree}
          onBlank={props.onBlank}
          onPick={props.onPickTree}
        />
        <ComponentTreeTargetPicker
          pages={props.pages}
          onPickRoute={props.onPickRoute}
          target={props.target}
          onChange={props.onChange}
          loading={props.loading}
          onLoad={props.onLoad}
        />
      </div>
    </>
  )
}
