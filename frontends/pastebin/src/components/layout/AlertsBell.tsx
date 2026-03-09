'use client'

import { useState, useRef, useEffect } from 'react'
import { MaterialIcon } from '@metabuilder/components/fakemui'
import { getStorageConfig } from '@/lib/storage'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './alerts-bell.module.scss'

export function AlertsBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { backend } = getStorageConfig()
  const usingLocal = backend === 'indexeddb'
  const warningCount = usingLocal ? 1 : 0
  const t = useTranslation()

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className={styles.root} ref={ref} data-testid="alerts-bell">
      <button
        className={styles.trigger}
        onClick={() => setOpen(v => !v)}
        aria-label={t.statusAlerts.title}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <MaterialIcon name="notifications" size={20} aria-hidden="true" />
        {warningCount > 0 && (
          <span className={styles.badge} aria-hidden="true">{warningCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label={t.statusAlerts.title}>
          <div className={styles.panelHeader}>{t.statusAlerts.title}</div>
          <div className={styles.panelBody}>
            <div className={styles.alertItem}>
              <MaterialIcon name="check_circle" size={16} className={styles.iconSuccess} aria-hidden="true" />
              <div>
                <div className={styles.alertTitle}>{t.statusAlerts.workspaceReady}</div>
                <div className={styles.alertDesc}>
                  {usingLocal ? t.statusAlerts.localModeDesc : t.statusAlerts.connectedDesc}
                </div>
              </div>
            </div>
            {usingLocal && (
              <div className={styles.alertItem}>
                <MaterialIcon name="error" size={16} className={styles.iconError} aria-hidden="true" />
                <div>
                  <div className={styles.alertTitle}>{t.statusAlerts.cloudUnavailable}</div>
                  <div className={styles.alertDesc}>{t.statusAlerts.cloudUnavailableDesc}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
