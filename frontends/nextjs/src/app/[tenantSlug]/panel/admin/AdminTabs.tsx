'use client'

import type { ReactNode } from 'react'
import { Tab, TabPanel, Tabs, Typography } from '@/m3'
import s from './page.module.scss'

export interface AdminTabsProps {
  activeTab: number
  onChange: (index: number) => void
  userCount: number
  commentCount: number
  children: ReactNode
}

const ENTITIES_NOTE =
  'Entity schemas are loaded from the data layer at ' +
  'dbal/shared/api/schema/entities/. Browsing them here is not built yet.'

/** The panel's three data tabs. */
export function AdminTabs({
  activeTab,
  onChange,
  userCount,
  commentCount,
  children,
}: AdminTabsProps) {
  return (
    <>
      <div className={s.tabsWrap}>
        <Tabs
          value={activeTab}
          onChange={(_e, v) => {
            onChange(v as number)
          }}
        >
          <Tab label={`Users (${userCount})`} />
          <Tab label={`Comments (${commentCount})`} />
          <Tab label="Entities" />
        </Tabs>
      </div>

      <TabPanel value={activeTab} index={0}>
        {children}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Typography variant="body2" className={s.emptyState}>
          {commentCount} comment{commentCount === 1 ? '' : 's'} are stored.
          Browsing them here is not built yet — the community board shows
          them in full.
        </Typography>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Typography variant="body2" className={s.emptyState}>
          {ENTITIES_NOTE}
        </Typography>
      </TabPanel>
    </>
  )
}
