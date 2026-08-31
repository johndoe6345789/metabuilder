'use client'

import Link from 'next/link'
import s from './Sidebar.module.scss'

export interface SidebarNavLinkProps {
  href: string
  icon: string
  label: string
  active: boolean
  onNavigate?: () => void
  /** Package items show their required level; plain nav items don't. */
  badge?: string
}

export function SidebarNavLink({
  href,
  icon,
  label,
  active,
  onNavigate,
  badge,
}: SidebarNavLinkProps) {
  return (
    <Link
      href={href}
      className={`${s.navItem} ${active ? s.active : ''}`}
      onClick={onNavigate}
    >
      <span className={s.icon}>{icon}</span>
      {label}
      {badge !== undefined && <span className={s.pkgBadge}>{badge}</span>}
    </Link>
  )
}
