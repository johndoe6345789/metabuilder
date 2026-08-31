'use client'

import { useRouter, usePathname } from 'next/navigation'
import { isActivePath, type LevelNavItem } from './level-nav-items'
import s from '../AppBar.module.scss'

export interface AppBarLevelNavProps {
  items: LevelNavItem[]
}

export function AppBarLevelNav({ items }: AppBarLevelNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  if (items.length === 0) return null

  return (
    <nav className={s.levelNav} aria-label="Level navigation">
      {items.map(item => (
        <button
          key={item.path}
          type="button"
          onClick={() => {
            router.push(item.path)
          }}
          className={`${s.navButton} ${
            isActivePath(pathname, item.path) ? s.navButtonActive : ''
          }`}
          aria-current={isActivePath(pathname, item.path) ? 'page' : undefined}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
