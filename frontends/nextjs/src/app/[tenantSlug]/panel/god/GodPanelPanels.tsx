'use client'

import type { ComponentType } from 'react'
import { TabPanel, Typography } from '@/m3'
import { TAB_COMPONENTS } from './tabs/god-panel-config'
import s from './page.module.scss'

type TabShape = {
  id: string
  label: string
}

type Props = {
  tabs: readonly TabShape[]
  activeTab: number
}

// Partial, not the plain `typeof TAB_COMPONENTS` lookup: tab.id is an
// arbitrary string, and most of them don't name a registered tab.
const tabComponents: Partial<Record<string, ComponentType>> = TAB_COMPONENTS

export function GodPanelPanels({ tabs, activeTab }: Props) {
  return (
    <div className={s.content}>
      {tabs.map((tab, index) => {
        const TabComponent = tabComponents[tab.id]
        return (
          <TabPanel key={tab.id} value={activeTab} index={index}>
            {TabComponent != null ? (
              <TabComponent />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Tab &ldquo;{tab.label}&rdquo; is not yet implemented.
              </Typography>
            )}
          </TabPanel>
        )
      })}
    </div>
  )
}
