'use client'

import { useState } from 'react'
import { LevelGate } from '@/components/layout/LevelGate'
import { Typography, Paper, Avatar, Tabs, Tab, TabPanel } from '@/m3'
import { TenantsTab } from './tabs/TenantsTab'
import { GodUsersTab } from './tabs/GodUsersTab'
import { PowerTransferTab } from './tabs/PowerTransferTab'
import { PreviewLevelsTab } from './tabs/PreviewLevelsTab'
import s from './page.module.scss'

function SuperGodContent() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className={s.root}>
      <Paper className={s.heroPaper}>
        <div className={s.heroRow}>
          <Avatar className={s.avatar}>
            <span>&#9813;</span>
          </Avatar>
          <div>
            <Typography variant="h4">Super God Panel</Typography>
            <Typography variant="body2" color="text.secondary">
              Multi-Tenant Control Center
            </Typography>
          </div>
        </div>
      </Paper>

      <Tabs
        value={activeTab}
        onChange={(_e, v) => {
          setActiveTab(v as number)
        }}
        className={s.tabs}
      >
        <Tab label="Tenants" />
        <Tab label="God Users" />
        <Tab label="Power Transfer" />
        <Tab label="Preview Levels" />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <TenantsTab />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <GodUsersTab />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <PowerTransferTab />
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        <PreviewLevelsTab />
      </TabPanel>
    </div>
  )
}

export default function SuperGodPage() {
  return (
    <LevelGate minLevel={5} levelName="Super God">
      <SuperGodContent />
    </LevelGate>
  )
}
