'use client'

import { useCallback, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useNerdMode } from '@/components/nerd-mode-ide'
import {
  useAuthContext,
} from '@/app/_components/auth-provider/auth-provider-component'
import { godPanelConfig } from '@/lib/packages/navigation'
import { useGodPanelRedirect } from './use-god-panel-redirect'
import { WALK_ME_STEPS } from './tabs/god-panel-config'

export function useGodPanelState() {
  const [activeTab, setActiveTab] = useState(0)
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideStep, setGuideStep] = useState(0)
  const nerd = useNerdMode()
  const router = useRouter()
  const auth = useAuthContext()
  const params = useParams<{ tenantSlug?: string }>()
  const routeTenantId = params.tenantSlug
  const tabs = godPanelConfig.tabs
  const activeTabConfig = tabs[activeTab] ?? tabs[0]

  useGodPanelRedirect(routeTenantId, auth.user?.tenantId, auth.isLoading)

  const openTabById = useCallback(
    (tabId: string) => {
      const index = tabs.findIndex(tab => tab.id === tabId)
      if (index >= 0) setActiveTab(index)
    },
    [tabs]
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
      const step = WALK_ME_STEPS[nextStep]
      if (step !== undefined) openTabById(step.tabId)
    },
    [openTabById]
  )

  return {
    tabs,
    activeTab,
    setActiveTab,
    activeTabConfig,
    guideOpen,
    setGuideOpen,
    guideStep,
    currentStep: WALK_ME_STEPS[guideStep],
    preview,
    openTabById,
    moveGuide,
    nerd,
  }
}
