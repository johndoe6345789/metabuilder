'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const tabs = godPanelConfig.tabs

  // Preview the lower levels (SDLC "review"): L1 public, L2 user, L3 admin.
  const preview = (level: number) => {
    router.push(level === 1 ? '/' : level === 2 ? '/app/profile' : '/app/admin')
  }

  return (
    <div className={s.root}>
      <header className={s.topbar}>
        <div className={s.brand}>
          <span className={s.logo} />
          <span className={s.title}>God-Tier Builder</span>
        </div>
        <div className={s.actions}>
          <Button variant="text" size="small" onClick={() => { router.push('/app') }}>
            ⌂ Home
          </Button>
          <span className={s.previewLabel}>PREVIEW</span>
          <Button variant="outlined" size="small" onClick={() => { preview(1) }}>L1</Button>
          <Button variant="outlined" size="small" onClick={() => { preview(2) }}>L2</Button>
          <Button variant="outlined" size="small" onClick={() => { preview(3) }}>L3</Button>
          <span className={s.divider} />
          <Button
            variant={isOpen ? 'contained' : 'outlined'}
            size="small"
            onClick={toggle}
          >
            ⚡ Nerd Mode
          </Button>
        </div>
      </header>

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
