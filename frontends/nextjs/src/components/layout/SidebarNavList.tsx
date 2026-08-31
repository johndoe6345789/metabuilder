'use client'

import type { SidebarNavItem } from '@/lib/packages/navigation'
import { iconChar } from './sidebar-icons'
import { SidebarNavLink } from './SidebarNavLink'

export interface SidebarNavListProps {
  items: SidebarNavItem[]
  itemHref: (path: string) => string
  pathname: string
  onNavigate?: () => void
  /** Static nav items also match a trailing sub-path; bottom items (e.g.
   *  Settings) only highlight on an exact match. */
  prefixMatch?: boolean
}

export function SidebarNavList({
  items,
  itemHref,
  pathname,
  onNavigate,
  prefixMatch = false,
}: SidebarNavListProps) {
  return (
    <>
      {items.map(item => {
        const href = itemHref(item.path)
        const active =
          pathname === href ||
          (prefixMatch && pathname.startsWith(href + '/'))
        return (
          <SidebarNavLink
            key={item.id}
            href={href}
            icon={iconChar(item.icon)}
            label={item.label}
            active={active}
            onNavigate={onNavigate}
          />
        )
      })}
    </>
  )
}
