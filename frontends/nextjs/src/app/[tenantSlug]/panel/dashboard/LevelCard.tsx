'use client'

import { levelColors, levelGradient } from './levels'
import s from './page.module.scss'

export interface LevelCardProps {
  level: number
  name: string
  desc: string
  unlocked: boolean
}

/** One tier in the permission reference. */
export function LevelCard({ level, name, desc, unlocked }: LevelCardProps) {
  const className = [
    s.levelCard,
    unlocked ? s.levelCardUnlocked : '',
    level === 5 ? s.levelCardAmber : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      <div className={s.levelIcon} style={{ background: levelGradient(level) }}>
        {level}
      </div>
      <p className={s.levelName}>{name}</p>
      <p className={s.levelDesc}>{desc}</p>
      <span
        className={`${s.levelBadge} ${unlocked ? '' : s.levelBadgeLocked}`}
        style={unlocked ? { background: levelColors(level).from } : {}}
      >
        {unlocked ? 'Unlocked' : 'Locked'}
      </span>
    </div>
  )
}
