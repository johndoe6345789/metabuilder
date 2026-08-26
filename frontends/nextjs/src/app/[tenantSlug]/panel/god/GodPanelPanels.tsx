'use client'

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

export function GodPanelPanels({ tabs, activeTab }: Props) {
  return (
    <div className={s.content}>
      {tabs.map((tab, index) => {
        const TabComponent =
          TAB_COMPONENTS[tab.id as keyof typeof TAB_COMPONENTS]
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
