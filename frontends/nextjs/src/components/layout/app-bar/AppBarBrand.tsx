'use client'

import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import s from '../AppBar.module.scss'

export interface AppBarBrandProps {
  isAuthenticated: boolean
  userLevel: number
  onToggleSidebar?: () => void
}

export function AppBarBrand({
  isAuthenticated,
  userLevel,
  onToggleSidebar,
}: AppBarBrandProps) {
  return (
    <div className={s.left}>
      {isAuthenticated && onToggleSidebar != null && (
        <button
          type="button"
          onClick={onToggleSidebar}
          className={s.iconButton}
          aria-label="Toggle sidebar"
        >
          <span className={s.menuIcon} aria-hidden="true">
            &#9776;
          </span>
        </button>
      )}

      <Link href="/" className={s.brand}>
        <Logo size={30} />
        <span className={s.brandText}>
          <span className={s.brandTitle}>MetaBuilder</span>
          <span className={s.version}>
            v{process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0'}
          </span>
        </span>
      </Link>

      {isAuthenticated && (
        <span className={s.levelChip} title={`Level ${userLevel}`}>
          <span className={s.levelChipLong}>Level {userLevel}</span>
          <span className={s.levelChipShort}>L{userLevel}</span>
        </span>
      )}
    </div>
  )
}
