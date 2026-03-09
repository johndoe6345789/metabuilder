'use client'

import { Card, CardContent, CardHeader, MaterialIcon } from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './settings-card.module.scss'

interface BackendAutoConfigCardProps {
  envVarSet: boolean
}

export function BackendAutoConfigCard({
  envVarSet,
}: BackendAutoConfigCardProps) {
  const t = useTranslation()
  const s = t.settingsCards.backendAuto

  if (!envVarSet) return null

  return (
    <Card data-testid="backend-auto-config-card">
      <CardHeader
        title={
          <h3 className={styles.cardTitleAccent}>
            <MaterialIcon name="cloud_done" size={24} aria-hidden="true" />
            {s.title}
          </h3>
        }
        subheader={
          <p className={styles.cardDescription}>
            {s.description}
          </p>
        }
      />
      <CardContent>
        <div className={styles.infoStack}>
          <div className={styles.infoRow} data-testid="backend-url">
            <span className={styles.infoLabel}>{s.backendUrl}</span>
            <code className={styles.infoCode}>{process.env.NEXT_PUBLIC_DBAL_API_URL ?? ''}</code>
          </div>
          <div className={styles.infoRow} data-testid="config-source">
            <span className={styles.infoLabel}>{s.configSource}</span>
            <code className={styles.infoCode}>NEXT_PUBLIC_DBAL_API_URL</code>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
