'use client'

import { Card, CardHeader, CardContent, MaterialIcon } from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './settings-card.module.scss'

interface DatabaseStatsCardProps {
  loading: boolean
  stats: {
    snippetCount: number
    templateCount: number
    storageType: 'indexeddb' | 'localstorage' | 'none' | 'dbal'
    databaseSize: number
  } | null
  formatBytes: (bytes: number) => string
}

export function DatabaseStatsCard({ loading, stats, formatBytes }: DatabaseStatsCardProps) {
  const t = useTranslation()
  const s = t.settingsCards.stats
  return (
    <Card data-testid="database-stats-card">
      <CardHeader
        title={
          <h3 className={styles.cardTitleWithIcon}>
            <MaterialIcon name="storage" size={24} aria-hidden="true" />
            {s.title}
          </h3>
        }
        subheader={<p className={styles.cardDescription}>{s.description}</p>}
      />
      <CardContent>
        {loading ? (
          <p className={styles.textMuted} data-testid="stats-loading" role="status" aria-busy="true">{s.loading}</p>
        ) : stats ? (
          <div className={styles.statsContainer} role="region" aria-label="Database statistics">
            <div className={styles.statRow} data-testid="stat-snippets">
              <span className={styles.statLabel}>{s.snippets}</span>
              <span className={styles.statValue}>{stats.snippetCount}</span>
            </div>
            <div className={styles.statRow} data-testid="stat-templates">
              <span className={styles.statLabel}>{s.templates}</span>
              <span className={styles.statValue}>{stats.templateCount}</span>
            </div>
            <div className={styles.statRow} data-testid="stat-storage-type">
              <span className={styles.statLabel}>{s.storageType}</span>
              <span className={styles.statValue}>{stats.storageType}</span>
            </div>
            <div className={styles.statRowLast} data-testid="stat-database-size">
              <span className={styles.statLabel}>{s.databaseSize}</span>
              <span className={styles.statValue}>{formatBytes(stats.databaseSize)}</span>
            </div>
          </div>
        ) : (
          <p className={styles.textDestructive} data-testid="stats-error" role="alert">{s.error}</p>
        )}
      </CardContent>
    </Card>
  )
}
