'use client'

import Link from 'next/link'
import type { GodPanelTab } from '@/lib/packages/navigation'
import s from './page.module.scss'

type Props = {
  tabs: readonly GodPanelTab[]
  activeTab: number
  tabHref: (tabId: string) => string
}

/**
 * Tabs are links, not buttons. Each one is a real App Router route, so a tab
 * can be linked to and bookmarked, Back returns to the previous tab, and
 * middle-click or cmd-click opens it in a new tab like any other link.
 */
export function GodPanelTabNav({ tabs, activeTab, tabHref }: Props) {
  return (
    <nav className={s.tabNav}>
      {tabs.map((tab, index) => {
        const active = index === activeTab
        return (
          <Link
            key={tab.id}
            href={tabHref(tab.id)}
            className={`${s.pill} ${active ? s.pillActive : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="material-symbols-rounded">{tab.icon}</span>
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
