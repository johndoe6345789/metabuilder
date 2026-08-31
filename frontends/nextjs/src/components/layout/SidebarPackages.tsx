'use client'

import type { PackageNavItem } from '@/lib/packages/navigation'
import { tenantPath } from '@/lib/tenant/workspace-paths'
import { SidebarNavLink } from './SidebarNavLink'
import s from './Sidebar.module.scss'

export interface SidebarPackagesProps {
  navigable: PackageNavItem[]
  tenantId: string
  pathname: string
  onNavigate?: () => void
}

export function SidebarPackages({
  navigable,
  tenantId,
  pathname,
  onNavigate,
}: SidebarPackagesProps) {
  if (navigable.length === 0) return null

  return (
    <>
      <div className={s.divider} />
      <div className={s.sectionLabel}>Packages</div>
      {navigable.map(pkg => {
        const path = tenantPath(tenantId, `/packages/${pkg.packageId}`)
        return (
          <SidebarNavLink
            key={pkg.packageId}
            href={path}
            icon={pkg.icon.charAt(0).toUpperCase()}
            label={pkg.navLabel}
            active={pathname === path || pathname.startsWith(path + '/')}
            onNavigate={onNavigate}
            badge={`L${pkg.level}`}
          />
        )
      })}
    </>
  )
}
