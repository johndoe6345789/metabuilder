'use client';

import { Alert, AlertTitle, MaterialIcon } from '@metabuilder/components/fakemui'
import { getStorageConfig } from '@/lib/storage'
import { useTranslation } from '@/hooks/useTranslation'

/**
 * Small stack of status alerts to keep tests and users informed about
 * the current storage mode and backend connectivity.
 */
export function AppStatusAlerts() {
  const t = useTranslation()
  const { backend } = getStorageConfig()
  const usingLocal = backend === 'indexeddb'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }} data-testid="status-alerts" role="region" aria-label="Application status alerts">
      <Alert
        data-testid="alert-success"
        className="alert-m3-success"
        role="status"
        aria-live="polite"
        severity="success"
        icon={<MaterialIcon name="check_circle" style={{ gridColumnStart: 1, marginTop: '0.125rem', color: 'var(--mat-sys-tertiary)' }} aria-hidden="true" />}
      >
        <AlertTitle>{t.statusAlerts.workspaceReady}</AlertTitle>
        {usingLocal ? t.statusAlerts.localModeDesc : t.statusAlerts.connectedDesc}
      </Alert>

      {usingLocal && (
        <Alert
          data-testid="alert-error"
          className="alert-m3-error"
          role="alert"
          aria-live="assertive"
          severity="error"
          icon={<MaterialIcon name="error" style={{ gridColumnStart: 1, marginTop: '0.125rem' }} aria-hidden="true" />}
        >
          <AlertTitle>{t.statusAlerts.cloudUnavailable}</AlertTitle>
          {t.statusAlerts.cloudUnavailableDesc}
        </Alert>
      )}
    </div>
  )
}
