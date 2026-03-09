import { useState, useMemo, useCallback } from 'react'
import { navigationGroups, NavigationItemData } from '@/lib/navigation-config'
import { FeatureToggles } from '@/types/project'
import { useRoutePreload } from './use-route-preload'

export interface RenderedNavItem {
  id: string
  label: string
  icon: React.ReactNode
  value: string
  isActive: boolean
  className: string
  badge: number | undefined
  badgeVariant: string
  showBadge: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export interface RenderedNavGroup {
  id: string
  label: string
  isExpanded: boolean
  visibleCount: number
  onToggle: () => void
  triggerClassName: string
  caretClassName: string
  items: RenderedNavItem[]
}

export function useNavigationMenu(
  featureToggles: FeatureToggles,
  errorCount: number = 0,
  activeTab?: string,
  onTabChange?: (tab: string) => void
) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['overview', 'development', 'automation', 'design', 'backend', 'testing', 'tools'])
  )

  const { preloadRoute, cancelPreload } = useRoutePreload({ delay: 100 })

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    const allIds = navigationGroups
      .filter((g) => g.items.some((item) => !item.featureKey || featureToggles[item.featureKey]))
      .map((g) => g.id)
    setExpandedGroups(new Set(allIds))
  }, [featureToggles])

  const collapseAll = useCallback(() => {
    setExpandedGroups(new Set())
  }, [])

  const renderedGroups: RenderedNavGroup[] = useMemo(() => {
    return navigationGroups.map((group) => {
      const isExpanded = expandedGroups.has(group.id)
      const visibleItems = group.items.filter(
        (item: NavigationItemData) => !item.featureKey || featureToggles[item.featureKey]
      )

      return {
        id: group.id,
        label: group.label,
        isExpanded,
        visibleCount: visibleItems.length,
        onToggle: () => toggleGroup(group.id),
        triggerClassName: 'w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted transition-colors',
        caretClassName: isExpanded
          ? 'text-muted-foreground transition-transform rotate-0'
          : 'text-muted-foreground transition-transform -rotate-90',
        items: visibleItems.map((item: NavigationItemData) => {
          const isActive = activeTab === item.value
          const badge = item.id === 'errors' ? errorCount : item.badge
          const showBadge = item.id === 'errors' ? errorCount > 0 : (badge !== undefined && badge > 0)

          return {
            id: item.id,
            label: item.label,
            icon: item.icon,
            value: item.value,
            isActive,
            className: isActive
              ? 'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors bg-primary text-primary-foreground'
              : 'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted text-foreground',
            badge,
            badgeVariant: isActive ? 'secondary' : 'destructive',
            showBadge,
            onClick: () => onTabChange?.(item.value),
            onMouseEnter: () => preloadRoute(item.value),
            onMouseLeave: () => cancelPreload(item.value),
          }
        }),
      }
    }).filter((g) => g.visibleCount > 0)
  }, [expandedGroups, featureToggles, activeTab, errorCount, onTabChange, toggleGroup, preloadRoute, cancelPreload])

  return {
    renderedGroups,
    expandAll,
    collapseAll,
  }
}
