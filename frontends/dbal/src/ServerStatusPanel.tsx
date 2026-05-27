"use client"

import { useServerStatus } from './hooks/useServerStatus'
import styles from './ServerStatusPanel.module.scss'

export function ServerStatusPanel() {
  const { health, lastUpdated, error, loading, summary } =
    useServerStatus()

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <p className={styles.caption}>Server status</p>
        <h2 className={styles.heading}>Observability Feed</h2>
        <p className={styles.caption}>{summary}</p>
      </div>

      <div className={styles.grid}>
        {loading && health.length === 0 ? (
          <div className={styles.placeholder}>Loading status...</div>
        ) : error ? (
          <div className={styles.placeholder}>
            <p className={styles.errorText}>{error}</p>
            <p className={styles.caption}>
              Try refreshing the page in a few moments.
            </p>
          </div>
        ) : (
          health.map(item => (
            <article key={item.name} className={styles.card}>
              <div className={styles.cardRow}>
                <div className={styles.cardTitleGroup}>
                  <span
                    className={[
                      styles.statusDot,
                      styles[item.status],
                    ].join(' ')}
                  />
                  <h3 className={styles.cardTitle}>{item.name}</h3>
                </div>
                <span className={styles.statusLabel}>
                  {item.status}
                </span>
              </div>
              <p className={styles.cardMessage}>{item.message}</p>
              <div className={styles.cardMeta}>
                <span>
                  {item.latencyMs != null
                    ? `${item.latencyMs.toFixed(0)} ms`
                    : 'Latency unknown'}
                </span>
                <span>
                  Updated{' '}
                  {lastUpdated
                    ? new Date(lastUpdated).toLocaleTimeString()
                    : '—'}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
