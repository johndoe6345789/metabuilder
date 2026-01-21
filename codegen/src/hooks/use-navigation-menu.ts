import { useState } from 'react'
import { navigationGroups, NavigationItemData } from '@/lib/navigation-config'
import { FeatureToggles } from '@/types/project'
import { useRoutePreload } from './use-route-preload'

interface UseNavigationMenuState {
  expandedGroups: Set<string>
  toggleGroup: (groupId: string) => void
  expandAll: () => void
  collapseAll: () => void
  isItemVisible: (item: NavigationItemData) => boolean
  getVisibleItemsCount: (groupId: string) => number
  getItemBadge: (item: NavigationItemData, errorCount: number) => number | undefined
  handleItemHover: (value: string) => void
  handleItemLeave: (value: string) => void
}

export function useNavigationMenu(featureToggles: FeatureToggles, errorCount: number = 0): UseNavigationMenuState {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['overview', 'development', 'automation', 'design', 'backend', 'testing', 'tools'])
  )

  const { preloadRoute, cancelPreload } = useRoutePreload({ delay: 100 })

  const isItemVisible = (item: NavigationItemData) => {
    if (!item.featureKey) return true
    return featureToggles[item.featureKey]
  }

  const getVisibleItemsCount = (groupId: string) => {
    const group = navigationGroups.find((g) => g.id === groupId)
    if (!group) return 0
    return group.items.filter(isItemVisible).length
  }

  const getItemBadge = (item: NavigationItemData, errorCount: number) => {
    if (item.id === 'errors') return errorCount
    return item.badge
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  const expandAll = () => {
    const allGroupIds = navigationGroups
      .filter((group) =>
        group.items.some((item) => {
          if (!item.featureKey) return true
          return featureToggles[item.featureKey]
        })
      )
      .map((group) => group.id)
    setExpandedGroups(new Set(allGroupIds))
  }

  const collapseAll = () => {
    setExpandedGroups(new Set())
  }

  const handleItemHover = (value: string) => {
    console.log(`[NAV] 🖱️ Hover detected on: ${value}`)
    preloadRoute(value)
  }

  const handleItemLeave = (value: string) => {
    console.log(`[NAV] 👋 Hover left: ${value}`)
    cancelPreload(value)
  }

  return {
    expandedGroups,
    toggleGroup,
    expandAll,
    collapseAll,
    isItemVisible,
    getVisibleItemsCount,
    getItemBadge,
    handleItemHover,
    handleItemLeave,
  }
}
