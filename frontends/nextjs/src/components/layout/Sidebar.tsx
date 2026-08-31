'use client'

import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'
import {
  getSidebarItems,
  getBottomSidebarItems,
  getLevelLabel,
  getLevelColor,
} from '@/lib/packages/navigation'
import { tenantGodPanelPath, tenantPath } from '@/lib/tenant/workspace-paths'
import { SidebarUserHeader } from './SidebarUserHeader'
import { SidebarNavList } from './SidebarNavList'
import { SidebarPackages } from './SidebarPackages'
import type { SidebarProps } from './sidebar-types'
import s from './Sidebar.module.scss'

export type { SidebarProps } from './sidebar-types'

export function Sidebar({
  userLevel,
  tenantId,
  username,
  role,
  packages = [],
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname()
  const staticItems = getSidebarItems(userLevel)
  const bottomItems = getBottomSidebarItems(userLevel)
  const navigable = packages.filter(p => p.showInNav && p.level <= userLevel)
  // Every workspace route has a tenant-scoped twin; link there directly.
  const itemHref = (path: string) =>
    path === '/god-panel'
      ? tenantGodPanelPath(tenantId)
      : tenantPath(tenantId, path)

  return (
    <aside
      className={s.paper}
      style={{ '--level-accent': getLevelColor(userLevel) } as CSSProperties}
    >
      <SidebarUserHeader
        username={username}
        role={role}
        userLevel={userLevel}
        levelLabel={getLevelLabel(userLevel)}
      />

      <div className={s.navLabel}>Navigation</div>

      <nav className={s.navList}>
        <SidebarNavList
          items={staticItems}
          itemHref={itemHref}
          pathname={pathname}
          onNavigate={onNavigate}
          prefixMatch
        />

        <SidebarPackages
          navigable={navigable}
          tenantId={tenantId}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      </nav>

      <div className={s.bottom}>
        <SidebarNavList
          items={bottomItems}
          itemHref={itemHref}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      </div>
    </aside>
  )
}
