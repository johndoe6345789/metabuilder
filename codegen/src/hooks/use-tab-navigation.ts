import { useState, useEffect } from 'react'

export function useTabNavigation(defaultTab: string) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shortcut = params.get('shortcut')
    if (shortcut) {
      setActiveTab(shortcut)
    }
  }, [])

  return {
    activeTab,
    setActiveTab,
  }
}
