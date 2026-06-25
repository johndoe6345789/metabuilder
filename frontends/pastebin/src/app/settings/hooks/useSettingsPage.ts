import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSettingsState } from '@/hooks/useSettingsState'

export type Tab = 'profile' | 'ai' | 'storage' | 'database'

export function useSettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab) ?? 'ai'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  const settings = useSettingsState()

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    router.replace(`?tab=${tab}`, { scroll: false })
  }

  return { activeTab, handleTabChange, settings }
}
