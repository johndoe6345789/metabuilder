'use client'

import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Alert,
  AlertDescription,
  RadioGroup,
  MaterialIcon,
} from '@metabuilder/components/fakemui'
import { type StorageBackend } from '@/lib/storage'
import { useTranslation } from '@/hooks/useTranslation'
import { StorageOption } from './StorageOption'
import styles from './settings-card.module.scss'

interface StorageBackendCardProps {
  storageBackend: StorageBackend
  envVarSet: boolean
  onStorageBackendChange: (backend: StorageBackend) => void
  onSaveConfig: () => Promise<void>
}

export function StorageBackendCard({
  storageBackend,
  envVarSet,
  onStorageBackendChange,
  onSaveConfig,
}: StorageBackendCardProps) {
  const t = useTranslation()
  const s = t.settingsCards.storage
  const labelClass = envVarSet
    ? styles.radioOptionLabelDisabled
    : styles.radioOptionLabel

  return (
    <Card data-testid="storage-backend-card">
      <CardHeader
        title={
          <h3 className={styles.cardTitleWithIcon}>
            <MaterialIcon name="cloud_upload" size={24} aria-hidden="true" />
            {s.title}
          </h3>
        }
        subheader={<p className={styles.cardDescription}>{s.description}</p>}
      />
      <CardContent>
        <div className={styles.contentStack}>
          {envVarSet && (
            <Alert
              severity="info"
              className={styles.alertAccent}
              data-testid="env-var-alert"
              role="status"
            >
              <AlertDescription className={styles.alertAccentDescription}>
                <MaterialIcon name="cloud_done" size={16} aria-hidden="true" />
                <span>
                  {s.envVarAlertBefore}{' '}
                  <code className={styles.envVarCode}>
                    NEXT_PUBLIC_DBAL_API_URL
                  </code>{' '}
                  {s.envVarAlertAfter}
                </span>
              </AlertDescription>
            </Alert>
          )}

          <RadioGroup value={storageBackend}>
            <div
              className={styles.radioOptionRow}
              data-testid="storage-option-indexeddb"
              onClick={() => !envVarSet && onStorageBackendChange('indexeddb')}
            >
              <StorageOption
                id="storage-indexeddb"
                value="indexeddb"
                checked={storageBackend === 'indexeddb'}
                disabled={envVarSet}
                label={s.indexedDBLabel}
                desc={s.indexedDBDesc}
                labelClass={labelClass}
              />
            </div>

            <div
              className={styles.radioOptionRowMarginTop}
              data-testid="storage-option-dbal"
              onClick={() => !envVarSet && onStorageBackendChange('dbal')}
            >
              <StorageOption
                id="storage-dbal"
                value="dbal"
                checked={storageBackend === 'dbal'}
                disabled={envVarSet}
                label={s.dbalLabel ?? 'DBAL Backend (Remote Server)'}
                desc={s.dbalDesc ?? 'Store snippets on a DBAL backend server.'}
                labelClass={labelClass}
              />
            </div>
          </RadioGroup>

          <div className={styles.saveBtnRow}>
            <Button
              onClick={onSaveConfig}
              className={styles.btnWithIcon}
              disabled={envVarSet}
              data-testid="save-storage-settings-btn"
              aria-label="Save storage configuration"
            >
              <MaterialIcon name="storage" size={16} aria-hidden="true" />
              {s.save}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
