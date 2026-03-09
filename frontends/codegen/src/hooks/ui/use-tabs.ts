import { useState, useCallback } from 'react'

export function useTabs<T extends string>(defaultTab: T) {
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
