'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  getSidebarItems,
  getBottomSidebarItems,
  getLevelLabel,
} from '@/lib/packages/navigation'
import type { PackageNavItem } from '@/lib/packages/navigation'
import s from './Sidebar.module.scss'

const iconMap: Record<string, string> = {
  dashboard: 'D', person: 'P', chat: 'C', chat_bubble: 'C',
  admin: 'A', build: 'G', crown: 'S', settings: '⚙', package: 'K',
  analytics: 'A', forum: 'F', gallery: 'G', blog: 'B',
  guestbook: 'G', music: 'M', marketplace: 'M',
}

function iconChar(icon: string): string {
  return iconMap[icon] ?? icon.charAt(0).toUpperCase()
}

export interface SidebarProps {
  userLevel: number
  username: string
  role: string
  packages?: PackageNavItem[]
}

export function Sidebar({
  userLevel, username, role, packages = [],
}: SidebarProps) {
  const pathname = usePathname()
  const staticItems = getSidebarItems(userLevel)
  const bottomItems = getBottomSidebarItems(userLevel)
  const levelLabel = getLevelLabel(userLevel)
  const navigable = packages.filter(
    p => p.showInNav && p.level <= userLevel
  )

  return (
    <aside className={s.paper}>
      <div className={s.userHeader}>
        <div className={s.userRow}>
          <div className={s.icon}>{username.charAt(0).toUpperCase()}</div>
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
          const active = pathname === item.path ||
            pathname.startsWith(item.path + '/')
          return (
            <Link
              key={item.id}
              href={item.path}
              className={`${s.navItem} ${active ? s.active : ''}`}
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
              const path = `/app/packages/${pkg.packageId}`
              const active = pathname === path ||
                pathname.startsWith(path + '/')
              return (
                <Link
                  key={pkg.packageId}
                  href={path}
                  className={`${s.navItem} ${active ? s.active : ''}`}
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
          const active = pathname === item.path
          return (
            <Link
              key={item.id}
              href={item.path}
              className={`${s.navItem} ${active ? s.active : ''}`}
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
