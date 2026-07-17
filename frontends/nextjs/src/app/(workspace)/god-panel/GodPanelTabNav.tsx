'use client'

import type { GodPanelTab } from '@/lib/packages/navigation'
import s from './page.module.scss'

type Props = {
  tabs: readonly GodPanelTab[]
  activeTab: number
  onSelectTab: (index: number) => void
}

export function GodPanelTabNav({ tabs, activeTab, onSelectTab }: Props) {
  return (
    <nav className={s.tabNav}>
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          type="button"
          className={`${s.pill} ${index === activeTab ? s.pillActive : ''}`}
          onClick={() => {
            onSelectTab(index)
          }}
        >
          <span className="material-symbols-rounded">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
