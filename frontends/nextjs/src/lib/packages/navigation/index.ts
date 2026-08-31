/**
 * Navigation configuration loader
 * Reads sidebar and god-panel configs from JSON files
 */

import sidebarConfigData from './sidebar-config.json'
import godPanelConfigData from './god-panel-config.json'
import type {
  SidebarConfig,
  GodPanelConfig,
  PackageNavItem,
  SidebarNavItem,
} from './types'

export type { SidebarConfig, GodPanelConfig, PackageNavItem, SidebarNavItem }
export type { GodPanelTab, GodPanelTool } from './types'

export const sidebarConfig: SidebarConfig = sidebarConfigData
export const godPanelConfig: GodPanelConfig = godPanelConfigData

/**
 * Get sidebar items filtered by user level
 */
export function getSidebarItems(userLevel: number): SidebarNavItem[] {
  return sidebarConfig.staticItems.filter(item => item.level <= userLevel)
}

/**
 * Get bottom sidebar items filtered by user level
 */
export function getBottomSidebarItems(userLevel: number): SidebarNavItem[] {
  return sidebarConfig.bottomItems.filter(item => item.level <= userLevel)
}

/**
 * Get the display label for a user level
 */
export function getLevelLabel(level: number): string {
  return sidebarConfig.levelLabels[String(level)] ?? 'Unknown'
}

/**
 * Get the display color for a user level
 */
export function getLevelColor(level: number): string {
  return sidebarConfig.levelColors[String(level)] ?? '#666666'
}

/**
 * Convert Qt6 package metadata to PackageNavItem for the sidebar
 */
export function packageMetadataToNavItem(metadata: {
  packageId: string
  name: string
  navLabel?: string
  icon?: string
  level?: number
  category?: string
  showInNav?: boolean
}): PackageNavItem {
  return {
    packageId: metadata.packageId,
    name: metadata.name,
    navLabel: metadata.navLabel ?? metadata.name,
    icon: metadata.icon ?? metadata.name.charAt(0).toUpperCase(),
    level: metadata.level ?? 2,
    category: metadata.category ?? 'general',
    showInNav: metadata.showInNav ?? false,
  }
}
