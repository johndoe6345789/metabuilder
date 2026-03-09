'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MaterialIcon } from '@metabuilder/components/fakemui'
import { useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { UserAvatar } from './UserAvatar'
import styles from './ProfileMenu.module.scss'

interface ProfileMenuProps {
  username: string
}

export function ProfileMenu({ username }: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function go(path: string) {
    setOpen(false)
    router.push(path)
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-label="Open profile menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserAvatar username={username} size="md" />
      </button>

      {open && (
        <div className={styles.menu} role="menu" aria-label="Profile menu">
          <div className={styles.menuHeader}>
            <UserAvatar username={username} size="sm" />
            <span className={styles.menuUsername}>@{username}</span>
          </div>
          <div className={styles.divider} />
          <button className={styles.item} role="menuitem" onClick={() => go(`/profile/${username}`)}>
            <MaterialIcon name="account_circle" size={18} aria-hidden="true" />
            View Profile
          </button>
          <button className={styles.item} role="menuitem" onClick={() => go('/settings?tab=profile')}>
            <MaterialIcon name="manage_accounts" size={18} aria-hidden="true" />
            Profile Settings
          </button>
          <div className={styles.divider} />
          <button
            className={`${styles.item} ${styles.itemDanger}`}
            role="menuitem"
            onClick={() => { setOpen(false); dispatch(logout()) }}
          >
            <MaterialIcon name="logout" size={18} aria-hidden="true" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
