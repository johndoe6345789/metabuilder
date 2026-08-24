'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import {
  getSidebarItems,
  getBottomSidebarItems,
  getLevelLabel,
  getLevelColor,
} from '@/lib/packages/navigation'
import type { PackageNavItem } from '@/lib/packages/navigation'
import { tenantGodPanelPath } from '@/lib/tenant/workspace-paths'
import s from './Sidebar.module.scss'

const iconMap: Record<string, string> = {
  dashboard: 'D',
  live_tv: 'S',
  person: 'P',
  chat: 'C',
  chat_bubble: 'C',
  admin: 'A',
  build: 'G',
  crown: 'S',
  settings: '⚙',
  package: 'K',
  analytics: 'A',
  forum: 'F',
  gallery: 'G',
  blog: 'B',
  guestbook: 'G',
  music: 'M',
  marketplace: 'M',
}

function iconChar(icon: string): string {
  return iconMap[icon] ?? icon.charAt(0).toUpperCase()
}

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
  const levelLabel = getLevelLabel(userLevel)
  const navigable = packages.filter(p => p.showInNav && p.level <= userLevel)
  const levelColor = getLevelColor(userLevel)
  const itemHref = (path: string) =>
    path === '/god-panel' ? tenantGodPanelPath(tenantId) : path

  return (
    <aside
      className={s.paper}
      style={{ '--level-accent': levelColor } as CSSProperties}
    >
      <div className={s.userHeader}>
        <div className={s.userRow}>
          <div className={s.avatar}>{username.charAt(0).toUpperCase()}</div>
          <div className={s.userText}>
            <div className={s.userName}>{username}</div>
            <div className={s.userRole}>{role}</div>
          </div>
        </div>
        <span className={s.levelChip}>
          Level {userLevel} — {levelLabel}
        </span>
      </div>

      <div className={s.navLabel}>Navigation</div>

      <nav className={s.navList}>
        {staticItems.map(item => {
          const href = itemHref(item.path)
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={item.id}
              href={href}
              className={`${s.navItem} ${active ? s.active : ''}`}
              onClick={onNavigate}
            >
              <span className={s.icon}>{iconChar(item.icon)}</span>
              {item.label}
            </Link>
          )
        })}

        {navigable.length > 0 && (
          <>
            <div className={s.divider} />
            <div className={s.sectionLabel}>Packages</div>
            {navigable.map(pkg => {
              const path = `/packages/${pkg.packageId}`
              const active =
                pathname === path || pathname.startsWith(path + '/')
              return (
                <Link
                  key={pkg.packageId}
                  href={path}
                  className={`${s.navItem} ${active ? s.active : ''}`}
                  onClick={onNavigate}
                >
                  <span className={s.icon}>
                    {pkg.icon.charAt(0).toUpperCase()}
                  </span>
                  {pkg.navLabel}
                  <span className={s.pkgBadge}>L{pkg.level}</span>
                </Link>
              )
            })}
          </>
        )}
      </nav>

      <div className={s.bottom}>
        {bottomItems.map(item => {
          const href = itemHref(item.path)
          const active = pathname === href
          return (
            <Link
              key={item.id}
              href={href}
              className={`${s.navItem} ${active ? s.active : ''}`}
              onClick={onNavigate}
            >
              <span className={s.icon}>{iconChar(item.icon)}</span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
