'use client'

import { LevelCard } from './LevelCard'
import { LEVELS } from './levels'
import s from './page.module.scss'

/** The permission-tier reference, shown to admins and above. */
export function LevelsGrid({ userLevel }: { userLevel: number }) {
  return (
    <>
      <p className={s.sectionTitle}>Five Levels of Power</p>
      <div className={s.levelsGrid}>
        {LEVELS.map(({ level, name, desc }) => (
          <LevelCard
            key={level}
            level={level}
            name={name}
            desc={desc}
            unlocked={userLevel >= level}
          />
        ))}
      </div>
    </>
  )
}
