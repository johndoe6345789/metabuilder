/**
 * useTabs Hook
 * Generic tab switching with active state tracking
 */

import { useState, useCallback } from 'react'

export interface UseTabsReturn<T extends string> {
  activeTab: T
  setActiveTab: (tab: T) => void
  switchTab: (tab: T) => void
  isActive: (tab: T) => boolean
}

/**
 * Manages tab selection state
 * @param defaultTab - Initially active tab
 */
export function useTabs<T extends string>(defaultTab: T): UseTabsReturn<T> {
  const [activeTab, setActiveTab] = useState<T>(defaultTab)

  const switchTab = useCallback((tab: T) => {
    setActiveTab(tab)
  }, [])

  const isActive = useCallback(
    (tab: T) => activeTab === tab,
    [activeTab]
  )

  return {
    activeTab,
    setActiveTab,
    switchTab,
    isActive,
  }
}
