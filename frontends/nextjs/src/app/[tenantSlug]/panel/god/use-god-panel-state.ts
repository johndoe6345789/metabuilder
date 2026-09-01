'use client'

import { firstOf } from '@/lib/first-of'
import { useCallback, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  normalizeTenantId,
  tenantGodPanelPath,
} from '@/lib/tenant/workspace-paths'
import { useNerdMode } from '@/components/nerd-mode-ide'
import { godPanelConfig } from '@/lib/packages/navigation'
import { WALK_ME_STEPS } from './tabs/god-panel-config'

export function useGodPanelState(activeTabId: string) {
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideStep, setGuideStep] = useState(0)
  const nerd = useNerdMode()
  const router = useRouter()
  const params = useParams<{ tenantSlug?: string }>()
  const routeTenantId = params.tenantSlug
  const tabs = godPanelConfig.tabs

  // The active tab is whatever the URL says, not component state -- so a tab
  // is linkable, survives a refresh, and Back returns to the previous one.
  const activeTab = Math.max(
    tabs.findIndex(tab => tab.id === activeTabId),
    0
  )
  const activeTabConfig = tabs[activeTab] ?? firstOf(tabs, 'God panel tabs')

  const tenantForPaths = normalizeTenantId(routeTenantId)

  const tabHref = useCallback(
    (tabId: string) => tenantGodPanelPath(tenantForPaths, tabId),
    [tenantForPaths]
  )

  const openTabById = useCallback(
    (tabId: string) => {
      if (tabs.some(tab => tab.id === tabId)) {
        router.push(tenantGodPanelPath(tenantForPaths, tabId))
      }
    },
    [tabs, router, tenantForPaths]
  )

  const preview = useCallback(
    (level: number) => {
      router.push(level === 1 ? '/' : level === 2 ? '/profile' : '/admin')
    },
    [router]
  )

  const moveGuide = useCallback(
    (nextStep: number) => {
      setGuideStep(nextStep)
      const step = WALK_ME_STEPS.at(nextStep)
      if (step !== undefined) openTabById(step.tabId)
    },
    [openTabById]
  )

  return {
    tabs,
    activeTab,
    activeTabConfig,
    tabHref,
    guideOpen,
    setGuideOpen,
    guideStep,
    currentStep: WALK_ME_STEPS.at(guideStep),
    preview,
    openTabById,
    moveGuide,
    nerd,
  }
}
