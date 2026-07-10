'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LevelGate } from '@/components/layout/LevelGate'
import { godPanelConfig } from '@/lib/packages/navigation'
import type { GodPanelTab } from '@/lib/packages/navigation'
import { Typography, TabPanel, Button } from '@/m3'
import { NerdModeIde, useNerdMode } from '@/components/nerd-mode-ide'
import { OverviewTab } from './tabs/OverviewTab'
import { SchemasTab } from './tabs/SchemasTab'
import { WorkflowsTab } from './tabs/WorkflowsTab'
import { PackagesTab } from './tabs/PackagesTab'
import { PageRoutesTab } from './tabs/PageRoutesTab'
import { ComponentTreeTab } from './tabs/builder/ComponentTreeTab'
import { UsersTab } from './tabs/UsersTab'
import { DatabaseTab } from './tabs/DatabaseTab'
import { CredentialsTab } from './tabs/CredentialsTab'
import { ThemeTab } from './tabs/ThemeTab'
import { CssClassesTab } from './tabs/styles/CssClassesTab'
import { ConfigTab } from './tabs/config/ConfigTab'
import { TestRunnerTab } from './tabs/test/TestRunnerTab'
import { PlanTab } from './tabs/plan/PlanTab'
import { DeployTab } from './tabs/deploy/DeployTab'
import s from './page.module.scss'

const WALK_ME_STEPS = [
  {
    tabId: 'overview',
    title: 'Check the system is alive',
    body: 'Confirm DBAL is connected, then use quick actions only when you need export, import, or preview.',
  },
  {
    tabId: 'plan',
    title: 'Turn intent into tasks',
    body: 'Capture the feature you are building before editing schemas, pages, or workflows.',
  },
  {
    tabId: 'schemas',
    title: 'Model the data',
    body: 'Create or adjust DBAL entities first so the rest of the builder has real structure to work with.',
  },
  {
    tabId: 'components',
    title: 'Build the page surface',
    body: 'Assemble UI blocks, wire useful actions, and preview the actual experience instead of static placeholders.',
  },
  {
    tabId: 'workflows',
    title: 'Wire behavior',
    body: 'Connect triggers, actions, branches, and tests so clicks produce visible outcomes.',
  },
  {
    tabId: 'credentials',
    title: 'Bind tenant secrets',
    body: 'Create credentials scoped to this tenant; supergods can move across tenants when needed.',
  },
  {
    tabId: 'test',
    title: 'Prove it works',
    body: 'Run point-and-click tests against the current workflow and fix failures before deployment.',
  },
  {
    tabId: 'deploy',
    title: 'Ship or export',
    body: 'Use deploy/export only after pages, data, credentials, and tests match the target tenant.',
  },
] as const

const TAB_COMPONENTS: Record<string, React.FC> = {
  overview: OverviewTab,
  schemas: SchemasTab,
  workflows: WorkflowsTab,
  packages: PackagesTab,
  pages: PageRoutesTab,
  components: ComponentTreeTab,
  users: UsersTab,
  database: DatabaseTab,
  credentials: CredentialsTab,
  theme: ThemeTab,
  styles: CssClassesTab,
  config: ConfigTab,
  test: TestRunnerTab,
  plan: PlanTab,
  deploy: DeployTab,
}

function GodPanelContent() {
  const [activeTab, setActiveTab] = useState(0)
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideStep, setGuideStep] = useState(0)
  const { isOpen, toggle, close } = useNerdMode()
  const router = useRouter()
  const tabs = godPanelConfig.tabs
  const activeTabConfig = tabs[activeTab] ?? tabs[0]
  const currentGuide = WALK_ME_STEPS[guideStep]

  const openTabById = (tabId: string) => {
    const index = tabs.findIndex(tab => tab.id === tabId)
    if (index >= 0) setActiveTab(index)
  }

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
            variant={guideOpen ? 'contained' : 'outlined'}
            size="small"
            onClick={() => { setGuideOpen(open => !open) }}
          >
            Walk Me
          </Button>
          <Button
            variant={isOpen ? 'contained' : 'outlined'}
            size="small"
            onClick={toggle}
          >
            ⚡ Nerd Mode
          </Button>
        </div>
      </header>

      {/* Tabs wrap into rows by width: 1 row on ultrawide, 2 on 1080p, 3+ on
          mobile — every tab always visible, no horizontal scroll. */}
      <nav className={s.tabNav}>
        {tabs.map((tab: GodPanelTab, index: number) => (
          <button
            key={tab.id}
            type="button"
            className={`${s.pill} ${index === activeTab ? s.pillActive : ''}`}
            onClick={() => { setActiveTab(index) }}
          >
            <span className="material-symbols-rounded">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <section className={s.contextBar} aria-label="Current god panel section">
        <div>
          <span className="material-symbols-rounded">{activeTabConfig.icon}</span>
          <div>
            <strong>{activeTabConfig.label}</strong>
            <p>{activeTabConfig.description}</p>
          </div>
        </div>
        <button
          type="button"
          className={s.contextAction}
          onClick={() => { setGuideOpen(true) }}
        >
          Show guided path
        </button>
      </section>

      {guideOpen && currentGuide !== undefined && (
        <aside className={s.walkMe} aria-label="Walk Me guided build path">
          <div className={s.walkHeader}>
            <div>
              <span className={s.walkEyebrow}>Walk Me</span>
              <h2>{currentGuide.title}</h2>
              <p>{currentGuide.body}</p>
            </div>
            <button
              type="button"
              className={s.iconButton}
              aria-label="Close Walk Me"
              onClick={() => { setGuideOpen(false) }}
            >
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>

          <div className={s.walkSteps}>
            {WALK_ME_STEPS.map((step, index) => {
              const tab = tabs.find(item => item.id === step.tabId)
              return (
                <button
                  key={step.tabId}
                  type="button"
                  className={`${s.walkStep} ${index === guideStep ? s.walkStepActive : ''}`}
                  onClick={() => {
                    setGuideStep(index)
                    openTabById(step.tabId)
                  }}
                >
                  <span>{index + 1}</span>
                  <strong>{tab?.label ?? step.title}</strong>
                </button>
              )
            })}
          </div>

          <div className={s.walkActions}>
            <Button
              variant="outlined"
              size="small"
              disabled={guideStep === 0}
              onClick={() => {
                const nextStep = Math.max(guideStep - 1, 0)
                setGuideStep(nextStep)
                openTabById(WALK_ME_STEPS[nextStep].tabId)
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                const nextStep = Math.min(guideStep + 1, WALK_ME_STEPS.length - 1)
                setGuideStep(nextStep)
                openTabById(WALK_ME_STEPS[nextStep].tabId)
              }}
            >
              {guideStep === WALK_ME_STEPS.length - 1 ? 'Stay here' : 'Next'}
            </Button>
          </div>
        </aside>
      )}

      <div className={s.content}>
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
      </div>
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
