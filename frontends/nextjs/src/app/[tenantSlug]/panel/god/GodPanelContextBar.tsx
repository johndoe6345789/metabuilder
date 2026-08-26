'use client'

import type { GodPanelTab } from '@/lib/packages/navigation'
import s from './page.module.scss'

type Props = {
  tab: GodPanelTab
  onShowGuide: () => void
}

export function GodPanelContextBar({ tab, onShowGuide }: Props) {
  return (
    <section className={s.contextBar} aria-label="Current god panel section">
      <div>
        <span className="material-symbols-rounded">{tab.icon}</span>
        <div>
          <strong>{tab.label}</strong>
          <p>{tab.description}</p>
        </div>
      </div>
      <button type="button" className={s.contextAction} onClick={onShowGuide}>
        Show guided path
      </button>
    </section>
  )
}
