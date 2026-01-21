import { useCallback, useState } from 'react'
import type { ChangeEvent } from 'react'

const tabs = [
  { value: 'readme', label: 'README', icon: 'BookOpen' },
  { value: 'roadmap', label: 'Roadmap', icon: 'MapPin' },
  { value: 'agents', label: 'Agents', icon: 'Sparkle' },
  { value: 'pwa', label: 'PWA', icon: 'Rocket' },
  { value: 'sass', label: 'Sass', icon: 'PaintBrush' },
  { value: 'cicd', label: 'CI/CD', icon: 'GitBranch' }
]

export function useDocumentationView() {
  const [activeTab, setActiveTab] = useState('readme')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }, [])

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    handleSearchChange,
    tabsData: tabs,
  }
}
