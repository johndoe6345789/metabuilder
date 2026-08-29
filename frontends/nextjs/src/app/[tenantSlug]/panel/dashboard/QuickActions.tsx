'use client'

import Link from 'next/link'
import type { QuickAction } from './quick-actions'
import s from './page.module.scss'

/** The shortcut tiles, one card each. */
export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <>
      <p className={s.sectionTitle}>Quick Actions</p>
      <div className={s.actionsGrid}>
        {actions.map(a => (
          <Link key={a.href} href={a.href} className={s.actionCard}>
            <div className={s.actionIcon}>{a.icon}</div>
            <p className={s.actionTitle}>{a.title}</p>
            <p className={s.actionDesc}>{a.desc}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
