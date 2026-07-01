'use client'

import { useState } from 'react'
import { LevelGate } from '@/components/layout/LevelGate'
import { godPanelConfig } from '@/lib/packages/navigation'
import type { GodPanelTab } from '@/lib/packages/navigation'
import { Typography, Tabs, Tab, TabPanel, Avatar, Button } from '@/m3'
import { NerdModeIde, useNerdMode } from '@/components/nerd-mode-ide'
import { OverviewTab } from './tabs/OverviewTab'
import { SchemasTab } from './tabs/SchemasTab'
import { WorkflowsTab } from './tabs/WorkflowsTab'
import { PackagesTab } from './tabs/PackagesTab'
import { PageRoutesTab } from './tabs/PageRoutesTab'
import { ComponentsTab } from './tabs/ComponentsTab'
import { UsersTab } from './tabs/UsersTab'
import { DatabaseTab } from './tabs/DatabaseTab'
import { CredentialsTab } from './tabs/CredentialsTab'
import { ThemeTab } from './tabs/ThemeTab'
import s from './page.module.scss'

const TAB_ICON_MAP: Record<string, string> = {
  dashboard: 'O', database: 'D', workflow: 'W', package: 'P',
  pages: 'R', components: 'C', people: 'U', storage: 'S',
  key: 'K', palette: 'T',
}

const TAB_COMPONENTS: Record<string, React.FC> = {
  overview: OverviewTab,
  schemas: SchemasTab,
  workflows: WorkflowsTab,
  packages: PackagesTab,
  pages: PageRoutesTab,
  components: ComponentsTab,
  users: UsersTab,
  database: DatabaseTab,
  credentials: CredentialsTab,
  theme: ThemeTab,
}

function GodPanelContent() {
  const [activeTab, setActiveTab] = useState(0)
  const { isOpen, toggle, close } = useNerdMode()
  const tabs = godPanelConfig.tabs

  return (
    <div className={s.root}>
      <div className={s.header}>
        <div className={s.headerRow}>
          <div>
            <Typography variant="h4" gutterBottom>Application Builder</Typography>
            <Typography variant="body1" color="text.secondary">
              Design your application declaratively. Define schemas, create
              workflows, manage packages and pages.
            </Typography>
          </div>
          <Button
            variant={isOpen ? 'contained' : 'outlined'}
            size="small"
            onClick={toggle}
          >
            ⚡ Nerd Mode
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onChange={(_e, v) => { setActiveTab(v as number) }}
        variant="scrollable"
        scrollButtons="auto"
        className={s.tabs}
      >
        {tabs.map((tab: GodPanelTab) => (
          <Tab
            key={tab.id}
            label={tab.label}
            icon={
              <Avatar>
                {TAB_ICON_MAP[tab.icon] ?? tab.icon.charAt(0).toUpperCase()}
              </Avatar>
            }
            iconPosition="start"
          />
        ))}
      </Tabs>

      {tabs.map((tab: GodPanelTab, index: number) => {
        const TabComponent = TAB_COMPONENTS[tab.id]
        return (
          <TabPanel key={tab.id} value={activeTab} index={index}>
            {TabComponent != null ? <TabComponent /> : (
              <Typography variant="body2" color="text.secondary">
                Tab &ldquo;{tab.label}&rdquo; is not yet implemented.
              </Typography>
            )}
          </TabPanel>
        )
      })}
      {isOpen && <NerdModeIde onClose={close} />}
    </div>
  )
}

export default function GodPanelPage() {
  return (
    <LevelGate minLevel={4} levelName="God">
      <GodPanelContent />
    </LevelGate>
  )
}
