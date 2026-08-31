import type { PackageNavItem } from '@/lib/packages/navigation'

export interface SidebarProps {
  userLevel: number
  tenantId: string
  username: string
  role: string
  packages?: PackageNavItem[]
  /** Set on narrow viewports, where the sidebar is an overlay that has to
   *  close itself after a link is followed. */
  onNavigate?: () => void
}
