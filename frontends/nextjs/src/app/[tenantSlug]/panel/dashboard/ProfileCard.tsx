'use client'

import { getLevelLabel } from '@/lib/packages/navigation'
import { levelColors, levelGradient } from './levels'
import s from './page.module.scss'

export interface ProfileCardProps {
  username: string
  email: string
  role: string
  bio: string | null
  userLevel: number
}

/** Who the viewer is, and what tier that puts them in. */
export function ProfileCard({
  username,
  email,
  role,
  bio,
  userLevel,
}: ProfileCardProps) {
  const { from } = levelColors(userLevel)

  return (
    <div className={s.profileCard}>
      <div className={s.profileRow}>
        <div
          className={s.avatar}
          style={{ background: levelGradient(userLevel) }}
        >
          {username.charAt(0).toUpperCase()}
        </div>
        <div className={s.profileInfo}>
          <p className={s.profileName}>{username}</p>
          <p className={s.profileEmail}>{email}</p>
          <div className={s.profileBadges}>
            <span
              className={`${s.chip} ${s.chipFilled}`}
              style={{ background: from }}
            >
              Level {userLevel} — {getLevelLabel(userLevel)}
            </span>
            <span className={`${s.chip} ${s.chipOutlined}`}>{role}</span>
          </div>
        </div>
      </div>
      {bio !== null && bio !== '' && <p className={s.bio}>{bio}</p>}
    </div>
  )
}
