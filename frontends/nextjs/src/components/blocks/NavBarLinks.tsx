'use client'

import { usePathname } from 'next/navigation'

import { BASE_PATH } from '@/lib/app-config'
import type { NavLink } from './block-coerce'
import { navBaseFromPathname, resolveNavHref } from './nav-href'
import s from './nav-header.module.scss'

/**
 * The nav's link list, split out because it needs the current path to know
 * which site it is part of -- see nav-href.ts. A block's render() is a
 * plain function, not a component, so the hook has to live in here.
 */
export function NavBarLinks({ links }: { links: NavLink[] }) {
  const base = navBaseFromPathname(usePathname(), BASE_PATH)
  return (
    <ul className={s.links}>
      {links.map(link => (
        <li key={`${link.label}-${link.href}`}>
          <a href={resolveNavHref(link.href, base)}>{link.label}</a>
        </li>
      ))}
    </ul>
  )
}
