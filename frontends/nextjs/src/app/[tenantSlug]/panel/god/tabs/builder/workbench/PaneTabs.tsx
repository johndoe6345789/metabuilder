'use client'

import s from '../ComponentTreeTab.module.scss'

export type PaneView = 'palette' | 'tree' | 'props' | 'preview'

export const PANES: { id: PaneView; label: string; icon: string }[] = [
  { id: 'palette', label: 'Add', icon: 'widgets' },
  { id: 'tree', label: 'Tree', icon: 'account_tree' },
  { id: 'props', label: 'Properties', icon: 'tune' },
  { id: 'preview', label: 'Preview', icon: 'visibility' },
]

export interface PaneTabsProps {
  view: PaneView
  onChange: (view: PaneView) => void
}

/**
 * The narrow-layout pane switcher; the CSS ignores this above the
 * breakpoint.
 */
export function PaneTabs({ view, onChange }: PaneTabsProps) {
  return (
    <div className={s.paneTabs} role="tablist" aria-label="Builder panes">
      {PANES.map(pane => (
        <button
          key={pane.id}
          type="button"
          role="tab"
          aria-selected={view === pane.id}
          className={`${s.paneTab} ${view === pane.id ? s.paneTabOn : ''}`}
          onClick={() => {
            onChange(pane.id)
          }}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            {pane.icon}
          </span>
          {pane.label}
        </button>
      ))}
    </div>
  )
}
