'use client'

import type { ProfileSummary } from './profile-summary'
import s from './page.module.scss'

/**
 * The three at-a-glance facts, declared as data rather than as three
 * near-identical blocks of markup.
 */
export function ProfileStats({ summary }: { summary: ProfileSummary }) {
  const stats = [
    { icon: 'verified_user', value: summary.roleLevel, label: 'Access level' },
    { icon: 'event', value: summary.joined, label: 'Joined' },
    { icon: 'badge', value: summary.role, label: 'Role' },
  ]

  return (
    <section className={s.statsGrid} aria-label="Profile summary">
      {stats.map(stat => (
        <div key={stat.label} className={s.stat}>
          <span className="material-symbols-rounded">{stat.icon}</span>
          <div>
            <strong>{stat.value}</strong>
            <p>{stat.label}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
