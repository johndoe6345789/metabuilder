'use client'

import s from './DeployTab.module.scss'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export function EnvironmentInfo() {
  return (
    <div className={s.env}>
      <div className={s.envTitle}>Environment</div>
      <div className={s.envRow}>
        <span>DBAL API</span>
        <code>{DBAL}</code>
      </div>
      <div className={s.envRow}>
        <span>Storage</span>
        <code>IndexedDB → localStorage fallback</code>
      </div>
    </div>
  )
}
