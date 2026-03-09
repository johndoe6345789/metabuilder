'use client'

import { Database } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, Chip } from '@metabuilder/components/fakemui'
import styles from './PersistenceSettings.module.scss'

const PERSIST_CONFIG = {
  key: 'pastebin',
  storage: 'IndexedDB',
  whitelist: ['snippets', 'namespaces', 'ui'],
  throttle: 100,
}

export function PersistenceSettings() {
  return (
    <Card className="rounded-lg" data-testid="persistence-settings">
      <CardHeader
        title={
          <div className={styles.headerRow}>
            <div className={`${styles.iconWrap} h-10 w-10`} aria-hidden="true">
              <Database size={20} className={styles.headerIcon} />
            </div>
            <div>
              <h3 style={{fontWeight:600, marginBottom:'2px'}}>Redux Persistence</h3>
              <p style={{color:'var(--mat-sys-on-surface-variant)',fontSize:'0.875rem'}}>
                Automatic IndexedDB persistence via @metabuilder/redux-persist
              </p>
            </div>
          </div>
        }
      />
      <CardContent>
        <div className={`${styles.cardBody} space-y-6`}>
          <div className={styles.configGrid} data-testid="persist-config-section">
            <div data-testid="persist-key-stat">
              <div className={styles.label}>Persist Key</div>
              <div className={styles.valueMono}>{PERSIST_CONFIG.key}</div>
            </div>
            <div data-testid="persist-storage-stat">
              <div className={styles.label}>Storage Backend</div>
              <div className={styles.value}>{PERSIST_CONFIG.storage}</div>
            </div>
            <div data-testid="persist-throttle-stat">
              <div className={styles.label}>Throttle</div>
              <div className={styles.value}>{PERSIST_CONFIG.throttle}ms</div>
            </div>
            <div data-testid="persist-slices-count-stat">
              <div className={styles.label}>Persisted Slices</div>
              <div className={styles.value}>{PERSIST_CONFIG.whitelist.length}</div>
            </div>
          </div>

          <div className={`${styles.slicesSection} border-t pt-4`} data-testid="persisted-slices-section" role="region" aria-label="Persisted slices">
            <div className={styles.slicesHeader}>
              <span className={styles.slicesHeaderLabel}>Persisted Slices</span>
            </div>
            <div className={styles.chipList}>
              {PERSIST_CONFIG.whitelist.map((slice) => (
                <span key={slice} className={`${styles.chipMono} font-mono`} data-testid={`slice-badge-${slice}`}>
                  <Chip variant="outlined" className={styles.chipMono}>
                    {slice}
                  </Chip>
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
