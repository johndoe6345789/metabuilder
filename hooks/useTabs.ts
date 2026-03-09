/**
 * useTabs Hook
 * Tab navigation state management with generic type support
 *
 * @example
 * type TabId = 'overview' | 'details' | 'settings'
 * const tabs = useTabs<TabId>('overview')
 *
 * <Tabs value={tabs.activeTab} onValueChange={tabs.switchTab}>
 *   <TabsTrigger value="overview" />
 *   <TabsTrigger value="details" />
 *   <TabsTrigger value="settings" />
 * </Tabs>
 *
 * // Check if a tab is active
 * if (tabs.isActive('overview')) { ... }
 */

import { useState, useCallback } from 'react'

export interface UseTabsReturn<T extends string> {
  /** Currently active tab */
  activeTab: T
  /** Set the active tab directly */
  setActiveTab: (tab: T) => void
  /** Switch to a specific tab (alias for setActiveTab) */
  switchTab: (tab: T) => void
  /** Check if a specific tab is currently active */
  isActive: (tab: T) => boolean
}

/**
 * Hook for managing tab navigation state
 * @param defaultTab - Initial active tab
 * @returns Object containing tab state and control methods
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
