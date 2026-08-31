'use client'

import s from './Sidebar.module.scss'

export interface SidebarUserHeaderProps {
  username: string
  role: string
  userLevel: number
  levelLabel: string
}

export function SidebarUserHeader({
  username,
  role,
  userLevel,
  levelLabel,
}: SidebarUserHeaderProps) {
  return (
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
  )
}
