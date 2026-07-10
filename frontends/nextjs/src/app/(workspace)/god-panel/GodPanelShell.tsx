'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TabPanel, Typography } from '@/m3'
import { NerdModeIde, useNerdMode } from '@/components/nerd-mode-ide'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import {
  normalizeTenantId,
  tenantGodPanelPath,
} from '@/lib/tenant/workspace-paths'
import { godPanelConfig } from '@/lib/packages/navigation'
import { GodPanelTopBar } from './GodPanelTopBar'
import { GodPanelTabNav } from './GodPanelTabNav'
import { GodPanelContextBar } from './GodPanelContextBar'
import { GodPanelWalkMe } from './GodPanelWalkMe'
import {
  TAB_COMPONENTS,
  WALK_ME_STEPS,
  getTabById,
} from './tabs/god-panel-config'
import s from './page.module.scss'

export function GodPanelShell() {
  const [activeTab, setActiveTab] = useState(0)
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideStep, setGuideStep] = useState(0)
  const { isOpen, toggle, close } = useNerdMode()
  const router = useRouter()
  const auth = useAuthContext()
  const params = useParams<{ tenantSlug?: string }>()
  const routeTenantId = params.tenantSlug
  const tenantId = normalizeTenantId(routeTenantId ?? auth.user?.tenantId)
  const tabs = godPanelConfig.tabs
  const activeTabConfig = tabs[activeTab] ?? tabs[0]

  useEffect(() => {
    if (routeTenantId !== undefined || auth.isLoading) return
    router.replace(tenantGodPanelPath(tenantId))
  }, [auth.isLoading, routeTenantId, router, tenantId])

  const currentStep = WALK_ME_STEPS[guideStep]

  const openTabById = useMemo(
    () => (tabId: string) => {
      const index = tabs.findIndex(tab => tab.id === tabId)
      if (index >= 0) setActiveTab(index)
    },
    [tabs]
  )

  const preview = (level: number) => {
    router.push(level === 1 ? '/' : level === 2 ? '/profile' : '/admin')
  }

  const handleBack = () => {
    const nextStep = Math.max(guideStep - 1, 0)
    setGuideStep(nextStep)
    openTabById(WALK_ME_STEPS[nextStep].tabId)
  }

  const handleNext = () => {
    const nextStep = Math.min(guideStep + 1, WALK_ME_STEPS.length - 1)
    setGuideStep(nextStep)
    openTabById(WALK_ME_STEPS[nextStep].tabId)
  }

  return (
    <div className={s.root}>
      <GodPanelTopBar
        guideOpen={guideOpen}
        nerdOpen={isOpen}
        onHome={() => {
          router.push('/')
        }}
        onPreview={preview}
        onToggleGuide={() => {
          setGuideOpen(open => !open)
        }}
        onToggleNerd={toggle}
      />
      <GodPanelTabNav
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
      <GodPanelContextBar
        tab={activeTabConfig}
        onShowGuide={() => {
          setGuideOpen(true)
        }}
      />
      <GodPanelWalkMe
        open={guideOpen && currentStep !== undefined}
        currentStep={guideStep}
        steps={WALK_ME_STEPS}
        tabs={tabs}
        onClose={() => {
          setGuideOpen(false)
        }}
        onBack={handleBack}
        onNext={handleNext}
        onSelectStep={index => {
          setGuideStep(index)
          const step = WALK_ME_STEPS[index]
          if (step !== undefined) openTabById(step.tabId)
        }}
      />
      <div className={s.content}>
        {tabs.map((tab, index) => {
          const TabComponent = TAB_COMPONENTS[tab.id]
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
      {isOpen && <NerdModeIde onClose={close} />}
    </div>
  )
}
