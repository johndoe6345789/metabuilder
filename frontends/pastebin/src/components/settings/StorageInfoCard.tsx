'use client'

import { Card, CardHeader, CardContent, Alert, AlertDescription } from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './settings-card.module.scss'

interface StorageInfoCardProps {
  storageType?: 'indexeddb' | 'localstorage' | 'none' | 'dbal'
}

export function StorageInfoCard({ storageType }: StorageInfoCardProps) {
  const t = useTranslation()
  const s = t.settingsCards.storageInfo
  return (
    <Card data-testid="storage-info-card">
      <CardHeader
        title={<h3 className={styles.cardTitle}>{s.title}</h3>}
        subheader={<p className={styles.cardDescription}>{s.description}</p>}
      />
      <CardContent>
        <Alert severity="info" role="status" aria-label="Storage type information">
          <AlertDescription data-testid="storage-type-description">
            {storageType === 'indexeddb' ? (
              <>
                <strong>IndexedDB</strong> {s.indexedDBDesc}
              </>
            ) : storageType === 'localstorage' ? (
              <>
                <strong>localStorage</strong> {s.localStorageDesc}
              </>
            ) : storageType === 'dbal' ? (
              <>
                <strong>DBAL Backend</strong> {s.dbalDesc ?? s.flaskDesc}
              </>
            ) : (
              <>{s.noneDesc}</>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
