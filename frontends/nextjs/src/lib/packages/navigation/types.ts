/**
 * Navigation and sidebar type definitions
 * Loaded from JSON config files - 95% data, 5% code
 */

export interface SidebarNavItem {
  id: string
  label: string
  icon: string
  path: string
  level: number
}

export interface SidebarConfig {
  staticItems: SidebarNavItem[]
  bottomItems: SidebarNavItem[]
  levelLabels: Record<string, string>
  levelColors: Record<string, string>
}

export interface GodPanelTab {
  id: string
  label: string
  icon: string
  description: string
}

export interface GodPanelTool {
  id: string
  label: string
  icon: string
  action: string
  params?: Record<string, unknown>
}

export interface GodPanelConfig {
  tabs: GodPanelTab[]
  tools: GodPanelTool[]
}

export interface PackageNavItem {
  packageId: string
  name: string
  navLabel: string
  icon: string
  level: number
  category: string
  showInNav: boolean
}
