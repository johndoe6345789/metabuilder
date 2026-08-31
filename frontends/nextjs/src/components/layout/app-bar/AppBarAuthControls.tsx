'use client'

import { LogoutIcon } from '../AppBarIcons'
import s from '../AppBar.module.scss'

export interface AppBarAuthControlsProps {
  username: string | null
  role: string
  onLogout: () => void
}

export function AppBarAuthControls({
  username,
  role,
  onLogout,
}: AppBarAuthControlsProps) {
  const initial = (username ?? '?').charAt(0).toUpperCase()

  return (
    <div className={s.authControls}>
      <span className={s.userChip} title={`${username} (${role})`}>
        <span className={s.avatar} aria-hidden="true">
          {initial}
        </span>
        <span className={s.userText}>
          <span className={s.userName}>{username}</span>
          <span className={s.userRole}>{role}</span>
        </span>
      </span>
      <button
        type="button"
        onClick={onLogout}
        className={s.ghostButton}
        title="Logout"
        aria-label="Logout"
      >
        <span className={s.ghostButtonLabel}>Logout</span>
        <LogoutIcon className={s.ghostButtonIcon} />
      </button>
    </div>
  )
}
