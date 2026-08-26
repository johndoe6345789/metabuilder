'use client'

import s from './DbalStatusCard.module.scss'

export type DbalState = 'checking' | 'online' | 'offline'

export interface DbalStatusCardProps {
  state: DbalState
  /** DBAL's reported version, once /version has answered. */
  version?: string
  /** The base URL being probed. Shown so a failure says where it failed. */
  endpoint: string
}

const COPY: Record<DbalState, { label: string; detail: string }> = {
  checking: { label: 'Checking', detail: 'Contacting the daemon' },
  online: { label: 'Connected', detail: 'Responding at' },
  offline: { label: 'Offline', detail: 'No response from' },
}

/**
 * DBAL reachability, as the headline of the God Panel overview.
 *
 * Presentational on purpose: the three states are the whole surface, so they
 * can be rendered and checked independently of whether a daemon is running.
 */
export function DbalStatusCard({
  state,
  version,
  endpoint,
}: DbalStatusCardProps) {
  const copy = COPY[state]

  return (
    <section className={s.card} data-state={state}>
      <span className={s.rail} aria-hidden="true" />

      <span className={s.dot} aria-hidden="true" />

      <div className={s.text}>
        <h3 className={s.title}>
          DBAL Daemon
          <span className={s.state}>{copy.label}</span>
        </h3>
        <p className={s.detail}>
          {copy.detail}
          {state !== 'checking' && <code className={s.endpoint}>{endpoint}</code>}
        </p>
      </div>

      {version != null && state === 'online' && (
        <span className={s.version}>v{version}</span>
      )}
    </section>
  )
}
