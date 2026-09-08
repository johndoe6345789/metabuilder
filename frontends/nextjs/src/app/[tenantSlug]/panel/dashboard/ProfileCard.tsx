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
          {/* Labelled: this is the one place the sign-in name appears, and
              unlabelled it read as a display name rather than the thing
              to type at the "Username" prompt. */}
          <p className={s.profileName}>
            {username}
            <span className={s.profileEmail}> &middot; your sign-in name</span>
          </p>
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
